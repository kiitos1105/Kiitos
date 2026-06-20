"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/time";
import type { DisplayParticipant } from "@/lib/types";
import { useDisplayState } from "./use-display-state";

const POMODORO_WORK_SECONDS = 25 * 60;
const POMODORO_BREAK_SECONDS = 5 * 60;
const POMODORO_CYCLE_SECONDS = POMODORO_WORK_SECONDS + POMODORO_BREAK_SECONDS;

export default function DisplayPage() {
  const { state, connectionState } = useDisplayState();
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const now = new Date();
  const pomodoro = getPomodoroState(now);

  return (
    <main className="display-shell">
      <div className="ambient-grid" aria-hidden="true" />

      <motion.section
        className="display-hero"
        aria-label="Kiitos Work Room status"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="brand-lockup">
          <span className="status-dot" data-state={connectionState} />
          <p className="eyebrow">Kiitos Work Room</p>
          <h1>Deep Focus Live</h1>
        </div>

        <div className="hero-metrics" aria-label="配信ステータス">
          <Metric label="現在時刻" value={formatClock(now)} />
          <Metric label="参加人数" value={`${state.totalParticipants}`} suffix="people" accent />
          <PomodoroGauge pomodoro={pomodoro} />
        </div>
      </motion.section>

      <section className="room-grid" aria-label="部屋別の参加者一覧">
        {state.rooms.map((room, index) => (
          <motion.article
            className="room-panel"
            key={room.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <header>
              <div>
                <p>Room</p>
                <h2>{room.name}</h2>
              </div>
              <span>{String(room.participants.length).padStart(2, "0")}</span>
            </header>

            <div className="participant-list">
              {room.participants.length === 0 ? (
                <motion.p className="empty-room" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Standby
                </motion.p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {room.participants.map((participant) => (
                    <ParticipantRow key={participant.id} participant={participant} now={now} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.article>
        ))}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  suffix,
  accent = false
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? "metric metric-accent" : "metric"}>
      <small>{label}</small>
      <strong>{value}</strong>
      {suffix ? <span>{suffix}</span> : null}
    </div>
  );
}

function PomodoroGauge({ pomodoro }: { pomodoro: ReturnType<typeof getPomodoroState> }) {
  return (
    <div className="pomodoro">
      <div
        className="pomodoro-ring"
        style={{ "--progress": `${pomodoro.progress * 360}deg` } as React.CSSProperties}
      >
        <div>
          <small>{pomodoro.mode}</small>
          <strong>{formatDuration(pomodoro.remainingSeconds)}</strong>
        </div>
      </div>
    </div>
  );
}

function ParticipantRow({ participant, now }: { participant: DisplayParticipant; now: Date }) {
  const elapsed = Math.max(
    Math.floor((now.getTime() - new Date(participant.startedAt).getTime()) / 1000),
    0
  );

  return (
    <motion.div
      className="participant"
      layout
      initial={{ opacity: 0, scale: 0.92, y: 14, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.94, x: 32, filter: "blur(8px)" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="participant-avatar" data-platform={participant.platform}>
        {participant.displayName.slice(0, 1).toUpperCase()}
      </div>
      <div className="participant-body">
        <strong>{participant.displayName}</strong>
        <small className={`platform ${participant.platform}`}>
          {participant.platform === "youtube" ? "YouTube" : "Discord"}
        </small>
      </div>
      <time>{formatDuration(elapsed)}</time>
    </motion.div>
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
