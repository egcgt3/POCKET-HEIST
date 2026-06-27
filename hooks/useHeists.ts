import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/AuthContext";
import { COLLECTIONS, Heist, heistConverter } from "@/types/firestore";

type HeistMode = "active" | "assigned" | "expired";

export function useHeists(mode: HeistMode): {
  heists: Heist[];
  loading: boolean;
} {
  const { user, loading: userLoading } = useUser();
  const [heists, setHeists] = useState<Heist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) {
      setHeists([]);
      setLoading(true);
      return;
    }

    const now = new Date();
    const uid = user.uid;
    const ref = collection(db, COLLECTIONS.HEISTS).withConverter(
      heistConverter,
    );

    const q =
      mode === "active"
        ? query(
            ref,
            where("assignedTo", "==", uid),
            where("deadline", ">", now),
          )
        : mode === "assigned"
          ? query(
              ref,
              where("createdBy", "==", uid),
              where("deadline", ">", now),
            )
          : query(
              ref,
              where("assignedTo", "==", uid),
              where("deadline", "<=", now),
            );

    return onSnapshot(
      q,
      (snapshot) => {
        let docs = snapshot.docs.map((doc) => doc.data() as Heist);
        if (mode === "expired") {
          docs = docs.filter(
            (h): h is Heist & { finalStatus: "success" | "failure" } =>
              h.finalStatus !== null,
          ) as Heist[];
        }
        setHeists(docs);
        setLoading(false);
      },
      () => {
        setHeists([]);
        setLoading(false);
      },
    );
  }, [user?.uid, userLoading, mode]);

  return { heists, loading };
}
