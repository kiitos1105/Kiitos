"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getDiscordUser, getMonthlyMvp, getRankingUsers } from "@/lib/engagement-client";
import { formatDuration } from "@/lib/time";

const PERIODS = [
  { id: "today", label: "今日" },
  { id: "week", label: "週間" },
  { id: "month", label: "月間" },
  { id: "room", label: "部屋別" }
] as const;

export default function RankingPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("today");
  const discordUser = getDiscordUser();
  const users = useMemo(() => getRankingUsers(period), [period]);
  const mvp = getMonthlyMvp();

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-black/70" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-amber-100/65">Kiitos Ranking</p>
              <h1 className="mt-3 text-6xl font-black">集中ランキング</h1>
              <p className="mt-4 text-sm font-bold text-stone-200/62">
                ランキング対象はDiscord連携済みユーザーのみです。
              </p>
            </div>
            <Link
              className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
              href="/lobby"
            >
              Lobbyへ
            </Link>
          </div>
          {!discordUser ? (
            <div className="mt-6 rounded-2xl border border-amber-100/25 bg-amber-100/10 p-4 text-sm font-black text-amber-100">
              ※ランキングインするにはディスコードにて連携が必要です。集中時間はローカル保存されます。
            </div>
          ) : null}
        </header>

        <section className="glass-panel rounded-[2rem] p-5">
          <p className="text-xs font-black uppercase text-amber-100/60">Monthly MVP</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black">{mvp.name}</h2>
              <p className="mt-2 text-sm font-bold text-stone-200/60">
                {mvp.title} / {mvp.room} / {mvp.focusHours}時間
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {mvp.badges.map((badge) => (
                <span
                  className="rounded-full border border-amber-100/25 bg-amber-100/10 px-4 py-2 text-sm font-black text-amber-100"
                  key={badge.id}
                >
                  {badge.icon} {badge.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <nav className="glass-panel flex gap-2 overflow-x-auto rounded-[2rem] p-3">
          {PERIODS.map((item) => (
            <button
              className={`rounded-full px-5 py-3 text-sm font-black ${
                period === item.id ? "bg-amber-100 text-stone-950" : "bg-black/24 text-stone-100/70"
              }`}
              key={item.id}
              onClick={() => setPeriod(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="grid gap-3">
          {users.map((user) => (
            <article
              className="glass-panel grid gap-4 rounded-[2rem] p-4 md:grid-cols-[72px_1fr_auto]"
              key={user.id}
            >
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-100 text-2xl font-black text-stone-950">
                #{user.rank}
              </div>
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className="h-14 w-14 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.avatarUrl})` }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-amber-100/70">
                    {user.title} / Lv.{user.level}
                  </p>
                  <h2 className="truncate text-2xl font-black">{user.name}</h2>
                  <p className="mt-1 text-xs font-bold text-stone-300/52">
                    {user.room} {user.founder ? " / Founder" : ""}{" "}
                    {user.premium ? " / Premium" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-3xl font-black text-amber-100">
                  {formatDuration(user.focusMinutes * 60)}
                </p>
                <p className="mt-1 text-xs font-bold text-stone-300/52">{user.badges.join(" ")}</p>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
