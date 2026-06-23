"use client";

// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";
import { useUser } from "@/lib/AuthContext";

export default function Home() {
  useUser(); // TODO: redirect to /heists (user) or /login (no user) once navigation is implemented
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div>Mischief. Managed.</div>
        <p className="mt-4 max-w-prose text-sm">
          Welcome to Pocket Heist — the app that turns your office into a
          playground. Challenge your colleagues to sneaky micro-missions, earn
          bragging rights, and see who truly rules the break room. Sign up to
          start plotting your first heist, or log in to check on the chaos
          already unfolding.
        </p>
      </div>
    </div>
  );
}
