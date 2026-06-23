"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminChrome() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((session) => setIsAdmin(Boolean(session.isAdmin)))
      .catch(() => undefined);
  }, [pathname]);

  return (
    <>
      {isAdmin ? (
        <div className="fixed right-5 top-20 z-50 rounded-full border border-amber-100/24 bg-black/48 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-100/82 shadow-2xl backdrop-blur-2xl">
          Admin Mode
        </div>
      ) : null}
      {!pathname.startsWith("/admin") ? (
        <Link
          className="fixed bottom-5 right-5 z-50 rounded-full border border-white/12 bg-black/52 px-4 py-3 text-sm font-black text-stone-100 shadow-2xl backdrop-blur-2xl transition hover:border-amber-100/45 hover:bg-amber-100 hover:text-stone-950"
          href="/admin/login"
        >
          ⚙ Admin
        </Link>
      ) : null}
    </>
  );
}
