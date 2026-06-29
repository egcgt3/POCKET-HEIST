import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, Heist, heistConverter } from "@/types/firestore";

export function useHeist(id: string): { heist: Heist | null; loading: boolean } {
  const [heist, setHeist] = useState<Heist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const ref = doc(db, COLLECTIONS.HEISTS, id).withConverter(heistConverter);

    return onSnapshot(
      ref,
      (snapshot) => {
        setHeist(snapshot.exists() ? (snapshot.data() as Heist) : null);
        setLoading(false);
      },
      () => {
        setHeist(null);
        setLoading(false);
      },
    );
  }, [id]);

  return { heist, loading };
}
