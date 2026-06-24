"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";

export default function HeistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="auth-loader">
        <Loader2 className="auth-loader-icon" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
