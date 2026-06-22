"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { WeatherCities } from "@/components/WeatherCities";
import { getEquippedTitle, getFavoriteBadges, getUserProfile } from "@/lib/badges-client";
import type { Badge, Title, UserProfile } from "@/lib/badges-client";
import { getFocusTreeSummary, getLevelProgress } from "@/lib/level-client";
import { getCustomRoom } from "@/lib/premium-client";
import type { CustomRoom } from "@/lib/premium-client";
import { formatDuration } from "@/lib/time";

export default function CustomRoomSeatViewPage() {
  const params = useParams<{ id: string; seatId: string }>();
  const [room, setRoom] = useState<CustomRoom | null>(null);
  const [startedAt] = useState(() => new Date().toISOString());
  const [goal, setGoal] = useState("今日の目標: 自分だけの部屋で25分集中する");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState<Title | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [level, setLevel] = useState(getLevelProgress());
  const [tree, setTree] = useState(getFocusTreeSummary());
  const [, setTick] = useState(0);

  useEffect(() => {
    setRoom(getCustomRoom(params.id));
    setProfile(getUserProfile());
    setTitle(getEquippedTitle());
    setBadges(getFavoriteBadges());
    setLevel(getLevelProgress());
    setTree(getFocusTreeSummary());
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [params.id]);

  if (!room) {
    return (
      <main className="grid min-h-screen place-items-center bg-cafe-950 p-6 text-stone-50">
        <section className="glass-panel rounded-[2rem] p-8 text-center">
          <h1 className="text-4xl font-black">Custom Seat not found</h1>
          <Link
            className="mt-6 inline-flex rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
            href="/lobby"
          >
            Lobbyへ戻る
          </Link>
        </section>
      </main>
    );
  }

  const seat = room.seats.find((item) => item.seatId === params.seatId);
  const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-5 text-stone-50 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-52 blur-[1px]"
        style={{ backgroundImage: `url(${room.backgroundImage})` }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-amber-200/18 via-black/56 to-black/88" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1500px] grid-rows-[auto_1fr_auto] gap-5">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-5">
          <div>
            <p className="text-xs font-black uppercase text-amber-100/60">
              Custom Room / {room.room_type} / {params.seatId}
            </p>
            <h1 className="mt-1 text-4xl font-black">{seat?.name ?? room.name}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
              href={`/custom-room/${room.id}`}
            >
              部屋に戻る
            </Link>
            <Link
              className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
              href={`/custom-room/${room.id}`}
            >
              退出
            </Link>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="glass-panel relative min-h-[620px] overflow-hidden rounded-[2.5rem]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-85"
              style={{ backgroundImage: `url(${room.backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/18" />
            <div className="absolute inset-x-[12%] bottom-0 h-[30%] rounded-t-[4rem] border border-amber-100/16 bg-[linear-gradient(90deg,rgba(64,39,24,0.95),rgba(132,87,48,0.86),rgba(44,29,20,0.94))] shadow-[0_-20px_90px_rgba(0,0,0,0.45)]" />

            <div className="absolute left-8 top-8 max-w-xl rounded-[2rem] border border-white/12 bg-black/38 p-6 backdrop-blur-2xl">
              <p className="text-xs font-black uppercase text-amber-100/60">Focus Timer</p>
              <p className="mt-2 font-mono text-7xl font-black text-amber-50">
                {formatDuration(elapsedSeconds)}
              </p>
              <input
                className="mt-5 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-bold text-stone-50 outline-none"
                onChange={(event) => setGoal(event.target.value)}
                value={goal}
              />
            </div>

            <div className="absolute bottom-8 left-8 flex items-center gap-4 rounded-[2rem] border border-white/12 bg-black/40 p-4 backdrop-blur-2xl">
              <span
                className={`grid h-16 w-16 place-items-center rounded-full bg-cover bg-center text-xl font-black text-stone-950 ${
                  profile?.is_founder
                    ? "ring-4 ring-amber-200"
                    : profile?.plan === "premium"
                      ? "ring-4 ring-indigo-200"
                      : "ring-2 ring-white/20"
                }`}
                style={{
                  backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : undefined
                }}
              >
                {profile?.avatar_url ? "" : "K"}
              </span>
              <div>
                <p className="text-xs font-black uppercase text-amber-100/70">
                  {title?.name ?? "Room Owner"}
                </p>
                <p className="mt-1 text-xs font-black uppercase text-stone-100/72">
                  Lv.{level.level} / あと{level.toNext}XP
                </p>
                <p className="text-2xl font-black">Demo Discord</p>
                <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-amber-100"
                    style={{ width: `${level.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-1">
                  {badges.map((badge) => (
                    <span
                      className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[0.65rem] font-black"
                      key={badge.id}
                    >
                      {badge.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-5">
            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">Room</p>
              <h2 className="mt-2 text-3xl font-black">{room.name}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-stone-200/62">
                {room.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {room.default_rules.map((rule) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/24 px-3 py-2 text-xs font-black"
                    key={rule}
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">BGM</p>
              <h2 className="mt-2 text-3xl font-black">{room.bgm}</h2>
              <p className="mt-3 text-sm font-bold text-stone-200/62">
                Template: {room.template_id}
              </p>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">Weather</p>
              <div className="mt-4">
                <WeatherCities compact />
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-emerald-100/65">Focus Tree</p>
              <div className="mt-4 flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-3xl border border-emerald-100/20 bg-emerald-100/10 text-4xl">
                  {tree.stage.icon}
                </span>
                <div>
                  <h2 className="text-2xl font-black">{tree.stage.name}</h2>
                  <p className="mt-1 text-sm font-bold text-stone-200/62">
                    累計 {tree.totalHours}時間
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm font-bold leading-6 text-stone-200/62">
                {tree.next
                  ? `次の成長まで あと${tree.hoursToNext}時間`
                  : "伝説の木として育っています。"}
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
