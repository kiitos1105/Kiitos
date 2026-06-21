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
        <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full border border-amber-100/30 bg-black/58 px-5 py-2 text-sm font-black text-amber-100 shadow-2xl backdrop-blur-2xl">
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
