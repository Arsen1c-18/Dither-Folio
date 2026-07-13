"use client";

import { useState } from "react";
import { Login } from "@/components/admin/Login";
import { Dashboard } from "@/components/admin/Dashboard";

/** Client shell: shows the passcode gate until authenticated, then the dashboard. */
export function AdminApp({
  authed,
  passcodeSet,
}: {
  authed: boolean;
  passcodeSet: boolean;
}) {
  const [isAuthed, setIsAuthed] = useState(authed);
  if (!isAuthed) {
    return <Login passcodeSet={passcodeSet} onSuccess={() => setIsAuthed(true)} />;
  }
  return <Dashboard />;
}
