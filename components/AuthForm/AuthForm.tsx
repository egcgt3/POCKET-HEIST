"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateCodename } from "@/lib/generateCodename";
import styles from "./AuthForm.module.css";

type AuthFormProps = { mode: "login" | "signup" };

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");

  const isLogin = mode === "login";
  const title = isLogin ? "Log in to Your Account" : "Sign up for an Account";
  const buttonLabel = isLogin ? "Log In" : "Sign Up";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextEmailError = email.trim() ? "" : "Email is required";
    const nextPasswordError = password ? "" : "Password is required";

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) return;

    if (!isLogin) {
      setSubmitting(true);
      setFirebaseError("");
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const codename = generateCodename();
        await updateProfile(cred.user, { displayName: codename });
        await setDoc(doc(db, "users", cred.user.uid), {
          id: cred.user.uid,
          codename,
        });
        router.push("/heists");
      } catch (err) {
        const code = (err as { code?: string }).code ?? "";
        setFirebaseError(
          FIREBASE_ERRORS[code] ?? "Something went wrong. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    console.log({ email, password });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className="form-title">{title}</h1>

      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        {emailError && (
          <span className={styles.errorMsg} role="alert">
            {emailError}
          </span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordError && (
          <span className={styles.errorMsg} role="alert">
            {passwordError}
          </span>
        )}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={submitting}>
        {buttonLabel}
      </button>

      {firebaseError && (
        <span className={styles.errorMsg} role="alert">
          {firebaseError}
        </span>
      )}

      <p className={styles.altLink}>
        {isLogin ? (
          <>
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        )}
      </p>
    </form>
  );
}
