"use client";

import Link from "next/link";
import { useState } from "react";
import { getBadges } from "@/lib/badges-client";
import { getFocusTreeSummary, getLevelProgress } from "@/lib/level-client";

export default function CertificatePage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const level = getLevelProgress();
  const tree = getFocusTreeSummary();
  const badges = getBadges().filter((badge) =>
    ["Monthly MVP", "Focus Champion", "Young Tree Badge"].includes(badge.name)
  );
  const summary = `Kiitos Work Room Focus Certificate\nMonth: ${month}\nFocus: 128h 40m\nRoom: Cafe Room\nXP: ${level.xp}\nLevel: Lv.${Math.max(1, level.level - 2)} -> Lv.${level.level}\nFocus Tree: ${tree.stage.name}`;

  function saveCertificate() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kiitos-certificate-${month}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-black/72" />
      <section className="relative z-10 mx-auto grid max-w-5xl gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-amber-100/65">Certificate</p>
              <h1 className="mt-3 text-6xl font-black">集中証明書</h1>
              <p className="mt-4 text-sm font-bold text-stone-200/62">
                任意の月の集中実績をカードとして保存できます。
              </p>
            </div>
            <Link
              className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
              href="/lobby"
            >
              Lobbyへ
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-[2.5rem] p-8">
          <label className="grid max-w-xs gap-2 text-sm font-black text-stone-200/65">
            対象月
            <input
              className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50"
              onChange={(event) => setMonth(event.target.value)}
              type="month"
              value={month}
            />
          </label>

          <article className="mt-6 rounded-[2rem] border border-amber-100/25 bg-[linear-gradient(135deg,rgba(253,230,138,0.16),rgba(255,255,255,0.04))] p-8 text-center">
            <p className="text-sm font-black uppercase text-amber-100/70">Kiitos Work Room</p>
            <h2 className="mt-3 text-5xl font-black">Focus Certificate</h2>
            <p className="mt-3 text-xl font-bold text-stone-100/70">{month}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Metric label="総集中時間" value="128h 40m" />
              <Metric label="よく使った部屋" value="Cafe Room" />
              <Metric label="獲得XP" value={`${level.xp} XP`} />
              <Metric
                label="レベル変化"
                value={`Lv.${Math.max(1, level.level - 2)}→${level.level}`}
              />
              <Metric label="ランキング順位" value="#2" />
              <Metric label="Focus Tree" value={tree.stage.name} />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {badges.map((badge) => (
                <span
                  className="rounded-full border border-white/10 bg-black/24 px-4 py-2 text-sm font-black"
                  key={badge.id}
                >
                  {badge.icon} {badge.name}
                </span>
              ))}
            </div>
            <p className="mt-8 font-serif text-2xl italic text-amber-100/70">
              あなたの居場所を、いつでも。
            </p>
          </article>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
              onClick={saveCertificate}
              type="button"
            >
              証明書を保存
            </button>
            <button
              className="rounded-2xl border border-white/12 bg-white/8 px-6 py-4 font-black"
              onClick={saveCertificate}
              type="button"
            >
              プロフィールに保存
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
      <p className="text-xs font-black uppercase text-stone-300/50">{label}</p>
      <p className="mt-2 text-2xl font-black text-amber-100">{value}</p>
    </div>
  );
}
