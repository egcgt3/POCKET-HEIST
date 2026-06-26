"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/AuthContext";
import {
  COLLECTIONS,
  CreateHeistInput,
  heistConverter,
} from "@/types/firestore";
import styles from "./CreateHeistForm.module.css";

type UserEntry = { id: string; codename: string };

export default function CreateHeistForm() {
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToUid, setAssignedToUid] = useState("");
  const [assignedToCodename, setAssignedToCodename] = useState("");

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [assignedToError, setAssignedToError] = useState("");
  const [firestoreError, setFirestoreError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
        const all: UserEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          codename: doc.data().codename as string,
        }));
        const others = all
          .filter((u) => u.id !== user?.uid)
          .sort((a, b) => a.codename.localeCompare(b.codename));
        setUsers(others);
      } finally {
        setUsersLoading(false);
      }
    }
    fetchUsers();
  }, [user?.uid]);

  function handleAssigneeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = users.find((u) => u.id === e.target.value);
    setAssignedToUid(selected?.id ?? "");
    setAssignedToCodename(selected?.codename ?? "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextTitleError = title.trim() ? "" : "Title is required";
    const nextDescError = description.trim() ? "" : "Description is required";
    const nextAssignedError = assignedToUid ? "" : "Please select an assignee";

    setTitleError(nextTitleError);
    setDescriptionError(nextDescError);
    setAssignedToError(nextAssignedError);

    if (nextTitleError || nextDescError || nextAssignedError) return;

    setSubmitting(true);
    setFirestoreError("");

    const data: CreateHeistInput = {
      title: title.trim(),
      description: description.trim(),
      createdBy: user!.uid,
      createdByCodename: user!.displayName ?? user!.uid,
      assignedTo: assignedToUid,
      assignedToCodename,
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      finalStatus: null,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(
        collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter),
        data,
      );
      router.push("/heists");
    } catch {
      setFirestoreError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Create a New Heist</h2>

      <div className={styles.fieldGroup}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {titleError && (
          <span className={styles.errorMsg} role="alert">
            {titleError}
          </span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {descriptionError && (
          <span className={styles.errorMsg} role="alert">
            {descriptionError}
          </span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="assignedTo" className={styles.label}>
          Assign to
        </label>
        <select
          id="assignedTo"
          className={styles.select}
          value={assignedToUid}
          onChange={handleAssigneeChange}
          disabled={usersLoading || users.length === 0}
        >
          <option value="">
            {usersLoading
              ? "Loading agents…"
              : users.length === 0
                ? "No agents available"
                : "Select an agent"}
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.codename}
            </option>
          ))}
        </select>
        {assignedToError && (
          <span className={styles.errorMsg} role="alert">
            {assignedToError}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={submitting || usersLoading || users.length === 0}
      >
        {submitting ? "Sending…" : "Launch Heist"}
      </button>

      {firestoreError && (
        <span className={styles.errorMsg} role="alert">
          {firestoreError}
        </span>
      )}
    </form>
  );
}
