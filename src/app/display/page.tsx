"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/time";
import type { DisplayParticipant } from "@/lib/types";
import { useDisplayState } from "./use-display-state";

export default function DisplayPage() {
  const { state, connectionState } = useDisplayState();
  const [, setTick] = useState(0);
  const now = new Date();

  useEffect(() => {
    const intervalId = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-obs-bg p-8 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(98,245,255,0.18),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(255,122,158,0.14),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <section className="relative z-10 mb-6 grid gap-5 rounded-[2rem] border border-obs-line bg-obs-panel p-7 shadow-glass backdrop-blur-3xl lg:grid-cols-[1fr_420px]">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                connectionState === "live"
                  ? "bg-emerald-300 shadow-[0_0_24px_rgba(125,255,189,0.85)]"
                  : connectionState === "fallback"
                    ? "bg-rose-300 shadow-[0_0_24px_rgba(255,122,158,0.85)]"
                    : "bg-amber-200 shadow-[0_0_24px_rgba(255,211,106,0.85)]"
              }`}
            />
            <p className="text-sm font-bold uppercase tracking-normal text-cyan-200">
              Kiitos Work Room
            </p>
          </div>
          <h1 className="max-w-4xl text-6xl font-black leading-none tracking-normal md:text-8xl">
            Focus Room Live
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Metric label="現在時刻" value={formatClock(now)} />
          <Metric label="参加人数" value={String(state.totalParticipants)} highlight />
        </div>
      </section>

      <section className="relative z-10 grid gap-5 lg:grid-cols-4">
        {state.rooms.map((room) => (
          <article
            className="min-h-[560px] overflow-hidden rounded-[1.75rem] border border-obs-line bg-obs-panel shadow-glass backdrop-blur-3xl"
            key={room.id}
          >
            <header className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-white/50">Room</p>
                <h2 className="mt-1 text-3xl font-black tracking-normal">{room.name}</h2>
              </div>
              <span className="grid h-14 min-w-14 place-items-center rounded-2xl border border-white/20 bg-white/10 font-mono text-2xl font-black text-cyan-200">
                {String(room.participants.length).padStart(2, "0")}
              </span>
            </header>

            <div className="flex flex-col gap-3 p-4">
              {room.participants.length === 0 ? (
                <p className="grid min-h-36 place-items-center rounded-3xl border border-dashed border-white/15 text-lg font-bold text-white/35">
                  Standby
                </p>
              ) : (
                room.participants.map((participant) => (
                  <ParticipantRow key={participant.id} participant={participant} now={now} />
                ))
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  highlight = false
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <p className="text-xs font-bold uppercase tracking-normal text-white/50">{label}</p>
      <strong
        className={`mt-4 block font-mono text-4xl font-black leading-none ${
          highlight ? "text-amber-200" : "text-white"
        }`}
      >
        {value}
      </strong>
    </div>
  );
}

function ParticipantRow({ participant, now }: { participant: DisplayParticipant; now: Date }) {
  const elapsed = Math.max(
    Math.floor((now.getTime() - new Date(participant.startedAt).getTime()) / 1000),
    0
  );

  return (
    <div className="grid min-h-20 grid-cols-[48px_1fr_auto] items-center gap-3 rounded-3xl border border-white/10 bg-black/30 p-3">
      <div
        className={`grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-slate-950 ${
          participant.platform === "youtube" ? "bg-red-300" : "bg-indigo-300"
        }`}
      >
        {participant.displayName.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0">
        <strong className="block truncate text-xl font-black">{participant.displayName}</strong>
        <p
          className={`mt-1 text-xs font-black uppercase tracking-normal ${
            participant.platform === "youtube" ? "text-red-300" : "text-indigo-300"
          }`}
        >
          {participant.platform === "youtube" ? "YouTube" : "Discord"}
        </p>
      </div>
      <time className="font-mono text-xl font-black text-amber-200">{formatDuration(elapsed)}</time>
    </div>
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
