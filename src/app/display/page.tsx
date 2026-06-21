"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDuration } from "@/lib/time";
import type { DisplayParticipant, DisplayRoom } from "@/lib/types";
import { getRoomConfig } from "@/lib/room-config";
import { getRotatingWeather } from "@/lib/weather";
import { useDisplayState } from "./use-display-state";

const POMODORO_WORK_SECONDS = 25 * 60;
const POMODORO_BREAK_SECONDS = 5 * 60;
const POMODORO_CYCLE_SECONDS = POMODORO_WORK_SECONDS + POMODORO_BREAK_SECONDS;

export default function DisplayPage() {
  const { state, connectionState } = useDisplayState();
  const [, setTick] = useState(0);
  const now = new Date();
  const pomodoro = getPomodoroState(now);
  const weather = getRotatingWeather(now);
  const totalFocusSeconds = useMemo(
    () =>
      state.rooms.reduce(
        (roomSum, room) =>
          roomSum +
          room.participants.reduce(
            (participantSum, participant) =>
              participantSum +
              Math.max(
                Math.floor((now.getTime() - new Date(participant.startedAt).getTime()) / 1000),
                0
              ),
            0
          ),
        0
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, now.getSeconds()]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50 lg:p-8">
      <SceneBackground />

      <section className="relative z-10 grid min-h-[calc(100vh-4rem)] grid-rows-[auto_1fr] gap-5">
        <header className="grid gap-5 lg:grid-cols-[1fr_520px]">
          <div className="glass-panel overflow-hidden rounded-[2.25rem] p-8">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 text-lg font-black shadow-inner">
                  K
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-normal text-amber-100/70">
                    Apple × Nordic Cafe × Kiitos
                  </p>
                  <p className="text-xs font-semibold text-stone-300/55">Night work room</p>
                </div>
              </div>
              <ConnectionBadge state={connectionState} />
            </div>

            <div className="max-w-5xl">
              <h1 className="text-[clamp(4rem,8vw,9.5rem)] font-black leading-[0.86] tracking-normal text-balance">
                Kiitos
                <span className="block text-amber-100">Work Room</span>
              </h1>
              <p className="mt-7 max-w-3xl text-xl font-medium leading-8 text-stone-200/68">
                配信を見た人が入りたくなる、居心地のいいオンライン自習室。
              </p>
            </div>
          </div>

          <aside className="grid grid-cols-2 gap-4">
            <StatusTile label="現在時刻" value={formatClock(now)} tone="cream" />
            <StatusTile label="参加人数" value={String(state.totalParticipants)} tone="gold" />
            <StatusTile
              label="今日の集中時間"
              value={formatCompactDuration(totalFocusSeconds)}
              tone="green"
            />
            <PomodoroTile pomodoro={pomodoro} />
          </aside>
        </header>

        <section className="grid min-h-0 gap-5 lg:grid-cols-[1fr_330px]">
          <div className="grid gap-5 xl:grid-cols-5">
            {state.rooms.map((room) => (
              <RoomCard key={room.id} room={room} now={now} />
            ))}
          </div>

          <aside className="grid gap-5">
            <CafeCard
              title="Now Playing"
              label="BGM"
              value={process.env.NEXT_PUBLIC_DISPLAY_BGM ?? "Lo-Fi Rainy Desk"}
              sub="soft piano / vinyl noise / 72 bpm"
            />
            <CafeCard
              title="Weather"
              label="日本の天気"
              value={`${weather.area} · ${weather.condition}`}
              sub={`${weather.temperature} / ${weather.note}`}
            />
            <div className="glass-panel wood-panel relative overflow-hidden rounded-[2rem] p-6">
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-normal text-amber-100/60">
                  Kiitos note
                </p>
                <p className="mt-4 text-3xl font-black leading-tight">配信したくなる作業部屋</p>
                <p className="mt-4 text-sm font-medium leading-6 text-stone-100/62">
                  休む時も、進む時も、画面の向こうに誰かがいる感じを残す。
                </p>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function SceneBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,218,166,0.22),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(161,116,72,0.26),transparent_32%),linear-gradient(180deg,rgba(8,10,12,0.18),rgba(4,6,7,0.74))]" />
      <div className="wood-grain pointer-events-none fixed inset-x-0 bottom-0 h-[38vh] opacity-80" />
      <div className="lamp-glow pointer-events-none fixed right-[13%] top-[-8%] h-[42rem] w-[42rem] rounded-full" />
      <div className="rain-layer pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-20" />
    </>
  );
}

function ConnectionBadge({ state }: { state: "connecting" | "live" | "fallback" }) {
  const label = state === "live" ? "Live" : state === "fallback" ? "Fallback" : "Connecting";
  const color =
    state === "live" ? "bg-emerald-300" : state === "fallback" ? "bg-rose-300" : "bg-amber-200";

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-4 py-2 text-sm font-bold text-stone-100/80">
      <span className={`h-2.5 w-2.5 rounded-full ${color} shadow-[0_0_22px_currentColor]`} />
      {label}
    </div>
  );
}

function StatusTile({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "cream" | "gold" | "green";
}) {
  const toneClass = {
    cream: "text-stone-50",
    gold: "text-amber-100",
    green: "text-emerald-100"
  }[tone];

  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <p className="text-xs font-black uppercase tracking-normal text-stone-200/48">{label}</p>
      <strong className={`mt-5 block font-mono text-4xl font-black leading-none ${toneClass}`}>
        {value}
      </strong>
    </div>
  );
}

function PomodoroTile({ pomodoro }: { pomodoro: ReturnType<typeof getPomodoroState> }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <p className="text-xs font-black uppercase tracking-normal text-stone-200/48">
        現在のポモドーロ
      </p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <strong className="block text-2xl font-black text-amber-100">{pomodoro.mode}</strong>
          <time className="mt-2 block font-mono text-3xl font-black">
            {formatDuration(pomodoro.remainingSeconds)}
          </time>
        </div>
        <div
          className="pomodoro-ring h-20 w-20"
          style={{ "--progress": `${pomodoro.progress * 360}deg` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function RoomCard({ room, now }: { room: DisplayRoom; now: Date }) {
  const config = getRoomConfig(room.id);
  const accent = config.accent;

  return (
    <article className="glass-panel group relative min-h-[560px] overflow-hidden rounded-[2rem]">
      <div
        className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${accent.glow} to-transparent`}
      />
      <div className={`absolute inset-x-6 top-0 h-1.5 rounded-b-full ${accent.line}`} />

      <Link
        className="absolute inset-0 z-20"
        href={`/rooms/${config.id}`}
        aria-label={`${config.name}を開く`}
      />

      <header className="relative z-10 flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-stone-200/45">
            /in {config.id}
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-stone-50">{config.name}</h2>
        </div>
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl border border-white/14 bg-white/10 text-2xl font-black ${accent.text} shadow-inner`}
        >
          {config.icon}
        </div>
      </header>

      <div className="relative z-10 px-5 pb-5">
        <p className="mb-4 min-h-[72px] text-sm font-medium leading-6 text-stone-200/62">
          {config.description}
        </p>

        <p
          className={`mb-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs font-black uppercase tracking-normal ${accent.text}`}
        >
          {config.mood}
        </p>

        <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
          <span className="text-sm font-bold text-stone-200/60">Members</span>
          <strong className={`font-mono text-2xl font-black ${accent.text}`}>
            {String(room.participants.length).padStart(2, "0")}
          </strong>
        </div>

        <div className="flex flex-col gap-3">
          {room.participants.length === 0 ? (
            <p className="grid min-h-40 place-items-center rounded-[1.75rem] border border-dashed border-white/14 bg-black/18 text-lg font-bold text-stone-200/35">
              Open seat
            </p>
          ) : (
            room.participants.map((participant) => (
              <ParticipantRow key={participant.id} participant={participant} now={now} />
            ))
          )}
        </div>
      </div>
    </article>
  );
}

function ParticipantRow({ participant, now }: { participant: DisplayParticipant; now: Date }) {
  const elapsed = Math.max(
    Math.floor((now.getTime() - new Date(participant.startedAt).getTime()) / 1000),
    0
  );

  return (
    <div className="grid min-h-20 grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/28 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-stone-300 text-lg font-black text-stone-950">
        {participant.displayName.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0">
        <strong className="block truncate text-lg font-black text-stone-50">
          {participant.displayName}
        </strong>
        <p className="mt-1 text-xs font-black uppercase tracking-normal text-stone-300/48">
          {participant.seatId ?? "--"} · {participant.platform}
        </p>
      </div>
      <time className="font-mono text-xl font-black text-amber-100">{formatDuration(elapsed)}</time>
    </div>
  );
}

function CafeCard({
  title,
  label,
  value,
  sub
}: {
  title: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-xs font-black uppercase tracking-normal text-amber-100/56">{label}</p>
      <h3 className="mt-4 text-3xl font-black tracking-normal">{title}</h3>
      <p className="mt-5 text-xl font-black text-stone-100">{value}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-stone-300/58">{sub}</p>
    </div>
  );
}

function getPomodoroState(now: Date) {
  const secondsOfDay = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();
  const cyclePosition = secondsOfDay % POMODORO_CYCLE_SECONDS;
  const isWork = cyclePosition < POMODORO_WORK_SECONDS;
  const phaseLength = isWork ? POMODORO_WORK_SECONDS : POMODORO_BREAK_SECONDS;
  const phasePosition = isWork ? cyclePosition : cyclePosition - POMODORO_WORK_SECONDS;

  return {
    mode: isWork ? "Focus" : "Break",
    remainingSeconds: phaseLength - phasePosition,
    progress: phasePosition / phaseLength
  };
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function formatCompactDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
