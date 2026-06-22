"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { getRankingUsers } from "@/lib/engagement-client";

export default function AdminRankingsPage() {
  const [status, setStatus] = useState("ランキングを確認できます");
  const users = getRankingUsers("month");

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-6xl gap-6">
          <header className="glass-panel rounded-[2.5rem] p-8">
            <p className="text-sm font-black uppercase text-amber-100/65">Admin Rankings</p>
            <h1 className="mt-3 text-5xl font-black">ランキング管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/60">{status}</p>
          </header>
          <div className="grid gap-3">
            {users.map((user) => (
              <article
                className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-4"
                key={user.id}
              >
                <div>
                  <p className="text-xs font-black uppercase text-amber-100/65">
                    #{user.rank} / Lv.{user.level}
                  </p>
                  <h2 className="text-2xl font-black">{user.name}</h2>
                  <p className="mt-1 text-sm font-bold text-stone-200/55">
                    {user.room} / {user.focusMinutes}分
                  </p>
                </div>
                <button
                  className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
                  onClick={() => setStatus(`${user.name}を手動MVP候補にしました`)}
                  type="button"
                >
                  MVP候補
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
