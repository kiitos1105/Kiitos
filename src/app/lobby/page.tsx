"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getRoomConfig } from "@/lib/room-config";
import { formatDuration } from "@/lib/time";
import { getRotatingWeather } from "@/lib/weather";
import { getRoomDetails } from "@/lib/work-room";

export default function LobbyPage() {
  const rooms = useMemo(() => getRoomDetails(), []);
  const [, setTick] = useState(0);
  const now = new Date();
  const weather = getRotatingWeather(now);
  const totalParticipants = rooms.reduce((sum, room) => sum + room.participants.length, 0);
  const totalFocusSeconds = rooms.reduce(
    (roomSum, room) =>
      roomSum + room.participants.reduce((sum, participant) => sum + participant.elapsedSeconds, 0),
    0
  );

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 text-stone-50">
      <LobbyBackground />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1800px] grid-rows-[auto_1fr_auto] gap-5 px-5 py-6 lg:px-8">
        <header className="grid gap-5 xl:grid-cols-[260px_1fr_320px] xl:items-end">
          <SidePanel title="Online" value={`${totalParticipants}`} sub="いま作業中" />

          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-normal text-amber-100/68">
              Apple × Nordic Cafe × Kiitos
            </p>
            <h1 className="mt-3 text-[clamp(3.7rem,7vw,8.6rem)] font-black leading-none">
              Choose Your Room
            </h1>
            <p className="mt-4 text-lg font-semibold text-stone-200/68">
              今日の気分に合わせて、作業する場所を選ぼう。
            </p>
          </div>

          <aside className="grid grid-cols-2 gap-3">
            <SmallStatus label="時刻" value={formatClock(now)} />
            <SmallStatus label="天気" value={`${weather.area} ${weather.temperature}`} />
            <SmallStatus label="集中時間" value={formatDuration(totalFocusSeconds)} wide />
            <SmallStatus label="Weather" value={weather.condition} wide sub={weather.note} />
          </aside>
        </header>

        <section className="grid min-h-0 gap-5 lg:grid-cols-6">
          {rooms.map((room, index) => {
            const config = getRoomConfig(room.roomId);
            const capacity = room.seats.length;
            const cardClass =
              index < 3 ? "lg:col-span-2 min-h-[420px]" : "lg:col-span-3 min-h-[360px]";

            return (
              <Link
                className={`group glass-panel relative overflow-hidden rounded-[2.35rem] transition duration-500 hover:-translate-y-1 hover:border-amber-100/40 ${cardClass}`}
                href={`/rooms/${room.roomId}`}
                key={room.roomId}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${config.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/28 to-black/5" />
                <div
                  className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${config.accent.glow} to-transparent`}
                />

                <article className="relative z-10 flex h-full flex-col justify-between p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full border border-white/12 bg-black/38 px-4 py-2 text-xs font-black text-amber-100/80 backdrop-blur-2xl">
                      {config.mood}
                    </span>
                    <span className="rounded-full border border-white/12 bg-black/38 px-4 py-2 font-mono text-sm font-black backdrop-blur-2xl">
                      {room.participants.length}/{capacity}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-5xl font-black leading-none">{config.name}</h2>
                    <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-stone-100/72">
                      {config.description}
                    </p>
                    <div className="mt-5 inline-flex items-center rounded-full bg-amber-100 px-5 py-3 font-black text-stone-950">
                      この部屋に入る
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>

        <nav className="glass-panel flex flex-wrap items-center justify-center gap-3 rounded-[2rem] p-3">
          {["お知らせ", "ランキング", "バッジ", "マイページ", "設定"].map((item) => (
            <button
              className="rounded-full border border-white/10 bg-white/7 px-5 py-3 text-sm font-black text-stone-100/78"
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}

function SidePanel({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-xs font-black uppercase tracking-normal text-stone-300/45">{title}</p>
      <strong className="mt-4 block font-mono text-6xl font-black text-amber-100">{value}</strong>
      <p className="mt-2 text-sm font-bold text-stone-200/55">{sub}</p>
    </div>
  );
}

function SmallStatus({
  label,
  value,
  sub,
  wide = false
}: {
  label: string;
  value: string;
  sub?: string;
  wide?: boolean;
}) {
  return (
    <div className={`glass-panel rounded-[1.5rem] p-4 ${wide ? "col-span-2" : ""}`}>
      <p className="text-[0.65rem] font-black uppercase text-stone-300/45">{label}</p>
      <strong className="mt-2 block truncate font-mono text-xl font-black text-amber-100">
        {value}
      </strong>
      {sub ? <p className="mt-1 text-xs font-bold text-stone-300/50">{sub}</p> : null}
    </div>
  );
}

function LobbyBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,214,158,0.24),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(151,114,78,0.2),transparent_34%),linear-gradient(180deg,rgb(10,17,20),rgb(5,7,8))]" />
      <div className="wood-grain pointer-events-none fixed inset-x-0 bottom-0 h-[30vh] opacity-60" />
      <div className="rain-layer pointer-events-none fixed inset-0 opacity-[0.12]" />
    </>
  );
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}
