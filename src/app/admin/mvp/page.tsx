"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { getMonthlyMvp } from "@/lib/engagement-client";

export default function AdminMvpPage() {
  const mvp = getMonthlyMvp();
  const [name, setName] = useState(mvp.name);
  const [status, setStatus] = useState("月間MVPを手動設定できます");

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-4xl gap-6">
          <header className="glass-panel rounded-[2.5rem] p-8">
            <p className="text-sm font-black uppercase text-amber-100/65">Admin MVP</p>
            <h1 className="mt-3 text-5xl font-black">MVP設定</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/60">{status}</p>
          </header>
          <section className="glass-panel rounded-[2rem] p-6">
            <label className="grid gap-2 text-sm font-black text-stone-200/65">
              月間MVP
              <input
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <button
                className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
                onClick={() => setStatus(`${name}をMonthly MVPに設定しました`)}
                type="button"
              >
                Monthly MVP設定
              </button>
              <button
                className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 font-black"
                onClick={() => setStatus(`${name}をRoom MVPに設定しました`)}
                type="button"
              >
                Room MVP設定
              </button>
              <button
                className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 font-black"
                onClick={() => setStatus(`${name}へFocus Championを付与しました`)}
                type="button"
              >
                Badge付与
              </button>
            </div>
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}
