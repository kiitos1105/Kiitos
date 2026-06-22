"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { createPremiumInviteCode, getInviteCodes, type Plan } from "@/lib/premium-client";

export default function AdminInvitesPage() {
  const [codes, setCodes] = useState(getInviteCodes());
  const [code, setCode] = useState("KIITOS-BETA");
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAt, setExpiresAt] = useState("2026-09-01");
  const [grantPlan, setGrantPlan] = useState<Plan>("premium");
  const [grantsBetaTester, setGrantsBetaTester] = useState(true);
  const [status, setStatus] = useState("招待コードを作成・管理できます。");

  function createCode() {
    const created = createPremiumInviteCode({
      code,
      maxUses,
      expiresAt: `${expiresAt}T23:59:59.000Z`,
      grantPlan,
      grantsBetaTester
    });
    setCodes(getInviteCodes());
    setStatus(`${created.code} を作成しました`);
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-6xl gap-6">
          <header className="glass-panel rounded-[2.5rem] p-8">
            <p className="text-sm font-black uppercase text-amber-100/65">Admin Invites</p>
            <h1 className="mt-3 text-5xl font-black">招待コード管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/60">{status}</p>
          </header>

          <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
            <form
              className="glass-panel grid gap-4 rounded-[2rem] p-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <Field label="招待コード" onChange={setCode} value={code} />
              <NumberField label="使用回数上限" onChange={setMaxUses} value={maxUses} />
              <label className="grid gap-2 text-sm font-black text-stone-200/65">
                有効期限
                <input
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                  onChange={(event) => setExpiresAt(event.target.value)}
                  type="date"
                  value={expiresAt}
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-stone-200/65">
                付与プラン
                <select
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                  onChange={(event) => setGrantPlan(event.target.value as Plan)}
                  value={grantPlan}
                >
                  <option value="premium">Beta Custom Access</option>
                  <option value="free">Free</option>
                </select>
              </label>
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-black">
                Beta Testerも付与
                <input
                  checked={grantsBetaTester}
                  onChange={(event) => setGrantsBetaTester(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <button
                className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950"
                onClick={createCode}
                type="button"
              >
                招待コード作成
              </button>
            </form>

            <div className="grid gap-3">
              {codes.map((item) => (
                <article className="glass-panel rounded-[2rem] p-5" key={item.code}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-amber-100/65">
                        {item.grantPlan} / Beta: {item.grantsBetaTester ? "ON" : "OFF"}
                      </p>
                      <h2 className="mt-2 text-3xl font-black">{item.code}</h2>
                      <p className="mt-2 text-sm font-bold text-stone-200/58">
                        {item.usedCount}/{item.maxUses} uses / expires{" "}
                        {new Date(item.expiresAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-sm font-black text-amber-100">
                      /redeem
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        value={value}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
        min={1}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}
