"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";

export default function AdminCertificatesPage() {
  const [status, setStatus] = useState("集中証明書の発行状況を確認できます");
  const rows = [
    { user: "Demo Discord", month: "2026-06", focus: "128h 40m", status: "発行済み" },
    { user: "Mika", month: "2026-06", focus: "186h 00m", status: "確認待ち" }
  ];

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-5xl gap-6">
          <header className="glass-panel rounded-[2.5rem] p-8">
            <p className="text-sm font-black uppercase text-amber-100/65">Admin Certificates</p>
            <h1 className="mt-3 text-5xl font-black">証明書確認</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/60">{status}</p>
          </header>
          {rows.map((row) => (
            <article
              className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-5"
              key={`${row.user}-${row.month}`}
            >
              <div>
                <h2 className="text-2xl font-black">{row.user}</h2>
                <p className="mt-1 text-sm font-bold text-stone-200/55">
                  {row.month} / {row.focus} / {row.status}
                </p>
              </div>
              <button
                className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
                onClick={() => setStatus(`${row.user}の証明書を確認済みにしました`)}
                type="button"
              >
                確認済みにする
              </button>
            </article>
          ))}
        </section>
      </main>
    </AdminGuard>
  );
}
