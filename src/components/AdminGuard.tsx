"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((session) => {
        if (!session.isAdmin) {
          router.replace("/admin/login");
          return;
        }

        setReady(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-cafe-950 p-6 text-stone-50">
        <div className="glass-panel rounded-[2rem] p-8 font-black text-amber-100">
          Admin認証を確認中...
        </div>
      </main>
    );
  }

  return children;
}
