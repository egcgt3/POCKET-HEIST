"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/AuthContext";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/heists");
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="auth-loader">
        <Loader2 className="auth-loader-icon" />
      </div>
    );
  }

  return (
    <>
      <main className="public">{children}</main>
      <Footer />
    </>
  );
}
