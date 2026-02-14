"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { getAuth, seedIfEmpty } from "@/lib/store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-brand-600">
            <span className="text-lg font-bold text-white">H</span>
          </div>
          <p className="mt-3 text-sm text-surface-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className="pl-64">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
