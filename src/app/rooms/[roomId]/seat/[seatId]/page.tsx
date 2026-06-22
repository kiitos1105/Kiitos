"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { WeatherCities } from "@/components/WeatherCities";
import { getEquippedTitle, getFavoriteBadges, getUserProfile } from "@/lib/badges-client";
import type { Badge, Title, UserProfile } from "@/lib/badges-client";
import { getFocusTreeSummary, getLevelProgress } from "@/lib/level-client";
import { getRoomConfig } from "@/lib/room-config";
import { getRoomSeatLayout } from "@/lib/roomSeatLayouts";
import { formatDuration } from "@/lib/time";
import { getRoomDetail } from "@/lib/work-room";

export default function FirstPersonSeatPage() {
  const params = useParams<{ roomId: string; seatId: string }>();
  const room = useMemo(() => getRoomDetail(params.roomId), [params.roomId]);
  const [startedAt] = useState(() => new Date().toISOString());
  const [goal, setGoal] = useState("今日の目標: 25分だけ深く集中する");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState<Title | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [level, setLevel] = useState(getLevelProgress());
  const [tree, setTree] = useState(getFocusTreeSummary());
  const [, setTick] = useState(0);

  useEffect(() => {
    setProfile(getUserProfile());
    setTitle(getEquippedTitle());
    setBadges(getFavoriteBadges());
    setLevel(getLevelProgress());
    setTree(getFocusTreeSummary());
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!room) {
    return (
      <main className="grid min-h-screen place-items-center bg-cafe-950 p-6 text-stone-50">
        <section className="glass-panel rounded-[2rem] p-8 text-center">
          <h1 className="text-4xl font-black">Seat not found</h1>
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

  const config = getRoomConfig(room.roomId);
  const seat = getRoomSeatLayout(room.roomId).find((item) => item.seat_id === params.seatId);
  const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const scene = getSeatScene(room.roomId);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-5 text-stone-50 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-48 blur-[1px]"
        style={{ backgroundImage: `url(${config.image})` }}
      />
      <div
        className={`pointer-events-none fixed inset-0 bg-gradient-to-br ${config.accent.glow} via-black/50 to-black/86`}
      />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1600px] grid-rows-[auto_1fr_auto] gap-5">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-5">
          <div>
            <p className="text-xs font-black uppercase text-amber-100/60">
              {room.name} / {params.seatId}
            </p>
            <h1 className="mt-1 text-4xl font-black">{seat?.seat_name ?? "My Seat"}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
              href={`/rooms/${room.roomId}`}
            >
              部屋に戻る
            </Link>
            <Link
              className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
              href={`/rooms/${room.roomId}`}
            >
              退出
            </Link>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="glass-panel relative min-h-[620px] overflow-hidden rounded-[2.5rem]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{ backgroundImage: `url(${config.seatMapImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/38 to-black/20" />
            <div className="absolute inset-x-[10%] bottom-0 h-[28%] rounded-t-[4rem] border border-amber-100/16 bg-[linear-gradient(90deg,rgba(83,50,28,0.94),rgba(155,105,57,0.84),rgba(62,36,21,0.92))] shadow-[0_-20px_90px_rgba(0,0,0,0.45)]" />
            <div className="absolute bottom-[18%] left-[13%] grid h-24 w-24 place-items-center rounded-full border border-amber-100/20 bg-black/30 text-4xl backdrop-blur-xl">
              {scene.object}
            </div>
            <div className="absolute bottom-[16%] right-[14%] rounded-[2rem] border border-white/10 bg-black/42 p-5 backdrop-blur-2xl">
              <p className="text-xs font-black uppercase text-amber-100/60">{scene.label}</p>
              <p className="mt-2 text-2xl font-black">{scene.copy}</p>
            </div>

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
                  {title?.name ?? "Cafe Master"}
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
              <p className="text-xs font-black uppercase text-amber-100/60">BGM</p>
              <h2 className="mt-2 text-3xl font-black">{room.bgm}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-stone-200/62">{scene.bgmNote}</p>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">Weather</p>
              <div className="mt-4">
                <WeatherCities compact />
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">Today</p>
              <div className="mt-4 grid gap-3 text-sm font-bold text-stone-200/70">
                <p>Pomodoro: 25 / 5</p>
                <p>Room: {room.name}</p>
                <p>Seat: {params.seatId}</p>
                <p>Mode: {scene.mode}</p>
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

function getSeatScene(roomId: string) {
  const scenes: Record<
    string,
    { object: string; label: string; copy: string; bgmNote: string; mode: string }
  > = {
    cafe: {
      object: "☕",
      label: "Desk",
      copy: "雨の窓とコーヒー",
      bgmNote: "Lo-Fiと雨音。少しだけ肩の力を抜いて集中。",
      mode: "Lo-Fi Cafe"
    },
    library: {
      object: "本",
      label: "Reading Desk",
      copy: "静かな読書空間",
      bgmNote: "ページをめくる音に近い、静かなアンビエンス。",
      mode: "Silent Study"
    },
    office: {
      object: "PC",
      label: "Work UI",
      copy: "タスクを片付ける席",
      bgmNote: "黒ガラスのオフィスに合うミニマルBGM。",
      mode: "Work Focus"
    },
    creator: {
      object: "▶",
      label: "Edit Booth",
      copy: "制作画面の前に座る",
      bgmNote: "映像編集やデザインに合わせた少し未来的な音。",
      mode: "Creative Flow"
    },
    night: {
      object: "☾",
      label: "Moon Desk",
      copy: "月明かりの深夜集中",
      bgmNote: "暗めで長時間作業に寄り添う低音。",
      mode: "Midnight Focus"
    }
  };

  return scenes[roomId] ?? scenes.cafe;
}
