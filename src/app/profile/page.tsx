"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { getEquippedTitle, getFavoriteBadges, getUserProfile } from "@/lib/badges-client";
import { getFocusTreeSummary, getLevelProgress } from "@/lib/level-client";
import {
  GOAL_OPTIONS,
  getEngagementProfile,
  getFocusCalendar,
  getGoalLabel,
  saveEngagementProfile
} from "@/lib/engagement-client";

export default function ProfilePage() {
  const { data: session } = useSession();
  const userProfile = getUserProfile();
  const title = getEquippedTitle();
  const badges = getFavoriteBadges();
  const level = getLevelProgress(userProfile);
  const tree = getFocusTreeSummary(userProfile);
  const calendar = getFocusCalendar();
  const [profile, setProfile] = useState(getEngagementProfile());
  const [saved, setSaved] = useState(false);

  function save() {
    saveEngagementProfile(profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-black/70" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-amber-100/65">{title.name}</p>
              <h1 className="mt-3 text-6xl font-black">
                {session?.user?.name ?? "Discord未連携"}
              </h1>
              <p className="mt-4 text-sm font-bold text-stone-200/62">
                {session?.user?.id ? `Discord ID: ${session.user.id} / ` : ""}
                {getGoalLabel(profile)} / 🔥 {profile.streakDays}日連続
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {session?.user ? (
                <button
                  className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
                  onClick={() => void signOut({ callbackUrl: "/lobby", redirectTo: "/lobby" })}
                  type="button"
                >
                  ログアウト
                </button>
              ) : (
                <button
                  className="rounded-2xl bg-indigo-300/20 px-5 py-3 font-black text-indigo-100"
                  onClick={() => void signIn("discord", { callbackUrl: "/profile", redirectTo: "/profile" })}
                  type="button"
                >
                  Discordでログイン
                </button>
              )}
              <Link
                className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
                href="/lobby"
              >
                Lobbyへ
              </Link>
            </div>
          </div>
        </header>

        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-3xl font-black">Discord連携</h2>
          {session?.user ? (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span
                className="h-16 w-16 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${session.user.image ?? "https://cdn.discordapp.com/embed/avatars/0.png"})`
                }}
              />
              <div>
                <p className="text-2xl font-black">{session.user.name}</p>
                <p className="mt-1 text-sm font-bold text-stone-200/58">{session.user.id}</p>
                <p className="mt-2 text-xs font-black uppercase text-emerald-100">
                  Founder / Beta Tester
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm font-bold text-amber-100">
              ランキング参加にはDiscord連携が必要です。
            </p>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            <section className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-3xl font-black">今日のプロフィール</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-stone-200/65">
                  今日の目標
                  <select
                    className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        todayGoal: event.target.value as typeof profile.todayGoal
                      })
                    }
                    value={profile.todayGoal}
                  >
                    {GOAL_OPTIONS.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-black text-stone-200/65">
                  その他の目標
                  <input
                    className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                    onChange={(event) => setProfile({ ...profile, customGoal: event.target.value })}
                    value={profile.customGoal}
                  />
                </label>
                <label className="grid gap-2 text-sm font-black text-stone-200/65 md:col-span-2">
                  今日の一言
                  <input
                    className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                    onChange={(event) =>
                      setProfile({ ...profile, todayMessage: event.target.value })
                    }
                    value={profile.todayMessage}
                  />
                </label>
              </div>
              <button
                className="mt-5 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
                onClick={save}
                type="button"
              >
                保存
              </button>
              {saved ? (
                <span className="ml-4 text-sm font-black text-emerald-200">保存しました</span>
              ) : null}
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-3xl font-black">フォーカスカレンダー</h2>
              <div className="mt-5 grid grid-cols-12 gap-1">
                {calendar.map((day) => (
                  <span
                    className={`h-5 rounded-md ${getCalendarTone(day.minutes)}`}
                    key={day.date}
                    title={`${day.date}: ${day.minutes}分`}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm font-bold text-stone-200/60">
                今日の記録と連続日数を色の濃さで確認できます。
              </p>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-3xl font-black">Live設定</h2>
              <div className="mt-5 grid gap-3">
                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 font-black">
                  配信中ON/OFF
                  <input
                    checked={profile.live.isLive}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        live: { ...profile.live, isLive: event.target.checked }
                      })
                    }
                    type="checkbox"
                  />
                </label>
                {(["youtubeUrl", "tiktokUrl", "twitchUrl"] as const).map((key) => (
                  <input
                    className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                    key={key}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        live: { ...profile.live, [key]: event.target.value }
                      })
                    }
                    placeholder={key}
                    value={profile.live[key]}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="grid gap-5">
            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">Level</p>
              <h2 className="mt-2 text-5xl font-black">Lv.{level.level}</h2>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-amber-100"
                  style={{ width: `${level.progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-bold text-stone-200/60">あと{level.toNext}XP</p>
            </section>
            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-emerald-100/65">Focus Tree</p>
              <p className="mt-3 text-6xl">{tree.stage.icon}</p>
              <h2 className="mt-2 text-3xl font-black">{tree.stage.name}</h2>
              <p className="mt-2 text-sm font-bold text-stone-200/60">累計 {tree.totalHours}時間</p>
            </section>
            <section className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">お気に入り席</h2>
              <p className="mt-3 text-sm font-bold text-stone-200/60">
                {profile.favoriteSeat
                  ? `${profile.favoriteSeat.roomId} / ${profile.favoriteSeat.seatName}`
                  : "まだ登録されていません"}
              </p>
            </section>
            <section className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">お気に入りバッジ</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/24 px-3 py-2 text-xs font-black"
                    key={badge.id}
                  >
                    {badge.icon} {badge.name}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function getCalendarTone(minutes: number) {
  if (minutes <= 0) return "bg-white/8";
  if (minutes < 30) return "bg-emerald-200/25";
  if (minutes < 120) return "bg-emerald-200/55";
  return "bg-emerald-200";
}
