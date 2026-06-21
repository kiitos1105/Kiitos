"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { getRoomDetail } from "@/lib/work-room";
import { getRoomConfig } from "@/lib/room-config";
import { formatDuration } from "@/lib/time";
import type { Seat } from "@/lib/work-room";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const room = useMemo(() => getRoomDetail(params.roomId), [params.roomId]);
  const [selectedSeatId, setSelectedSeatId] = useState("A1");
  const [mySeatId, setMySeatId] = useState<string | null>(null);

  if (!room) {
    return (
      <main className="grid min-h-screen place-items-center bg-cafe-950 p-8 text-stone-50">
        <div className="glass-panel rounded-[2rem] p-8 text-center">
          <h1 className="text-3xl font-black">Room not found</h1>
          <Link
            className="mt-6 inline-block rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
            href="/display"
          >
            /display に戻る
          </Link>
        </div>
      </main>
    );
  }

  const config = getRoomConfig(room.roomId);
  const selectedSeat = room.seats.find((seat) => seat.id === selectedSeatId) ?? room.seats[0];
  const activeSeats = room.seats.filter((seat) => seat.status === "occupied").length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50 lg:p-8">
      <RoomBackground roomId={room.roomId} />

      <section className="relative z-10 grid gap-6">
        <header className="glass-panel rounded-[2.25rem] p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <Link
                className="text-sm font-bold text-amber-100/60 transition hover:text-amber-100"
                href="/display"
              >
                ← Display
              </Link>
              <div className="mt-6 flex items-center gap-4">
                <span
                  className={`grid h-20 w-20 place-items-center rounded-[1.75rem] border border-white/15 bg-gradient-to-br ${config.accent.avatar} text-4xl font-black text-stone-950`}
                >
                  {config.icon}
                </span>
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-stone-300/50">
                    /rooms/{config.id}
                  </p>
                  <h1 className="mt-1 text-6xl font-black leading-none tracking-normal">
                    {config.name}
                  </h1>
                </div>
              </div>
              <p className="mt-6 max-w-3xl text-xl font-medium leading-8 text-stone-200/68">
                {config.description}
              </p>
            </div>

            <div className="grid min-w-[340px] grid-cols-2 gap-3">
              <RoomMetric label="現在人数" value={`${room.participants.length}`} />
              <RoomMetric label="使用中の席" value={`${activeSeats}/12`} />
              <RoomMetric label="BGM" value={room.bgm} wide />
              <RoomMetric
                label="入室状態"
                value={mySeatId ? `着席中 ${mySeatId}` : "未入室"}
                wide
              />
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1fr_410px]">
          <div className="glass-panel rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-amber-100/55">
                  Seat map
                </p>
                <h2 className="mt-2 text-3xl font-black">席を選んでください</h2>
              </div>
              <p className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-stone-200/55">
                {config.mood}
              </p>
            </div>

            <div className="grid gap-4">
              {["A", "B", "C"].map((row) => (
                <div className="grid grid-cols-4 gap-4" key={row}>
                  {room.seats
                    .filter((seat) => seat.id.startsWith(row))
                    .map((seat) => (
                      <SeatButton
                        key={seat.id}
                        mine={mySeatId === seat.id}
                        onClick={() => setSelectedSeatId(seat.id)}
                        seat={seat}
                        selected={selectedSeatId === seat.id}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-5">
            <SeatDetail
              mySeatId={mySeatId}
              onEnter={() => setMySeatId(selectedSeat.id)}
              onLeave={() => setMySeatId(null)}
              seat={selectedSeat}
            />
            <InfoCard title="部屋ルール" items={room.rules} />
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Panel title="参加者一覧">
            <div className="grid gap-3">
              {room.participants.map((participant) => (
                <div
                  className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-3xl border border-white/10 bg-black/24 p-3"
                  key={participant.id}
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-lg font-black">
                    {participant.seatId}
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate text-xl font-black">
                      {participant.displayName}
                    </strong>
                    <p className="mt-1 text-xs font-bold uppercase text-stone-300/45">
                      {participant.platform}
                    </p>
                  </div>
                  <time className="font-mono text-xl font-black text-amber-100">
                    {formatDuration(participant.elapsedSeconds)}
                  </time>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="作業ログ">
            <div className="grid gap-3">
              {room.logs.map((log) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/24 px-4 py-3"
                  key={log.id}
                >
                  <div>
                    <p className="font-black">{log.userName}</p>
                    <p className="mt-1 text-xs font-bold text-stone-300/45">Seat {log.seatId}</p>
                  </div>
                  <time className="font-mono text-lg font-black text-amber-100">
                    {formatDuration(log.durationSeconds)}
                  </time>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </section>
    </main>
  );
}

function SeatButton({
  seat,
  selected,
  mine,
  onClick
}: {
  seat: Seat;
  selected: boolean;
  mine: boolean;
  onClick: () => void;
}) {
  const stateClass = mine
    ? "border-amber-200/70 bg-amber-200/22 text-amber-50"
    : seat.status === "occupied"
      ? "border-rose-200/30 bg-rose-300/12 text-rose-50"
      : seat.status === "reserved"
        ? "border-sky-200/30 bg-sky-300/10 text-sky-50"
        : "border-white/10 bg-white/[0.055] text-stone-100";

  return (
    <button
      className={`min-h-28 rounded-[1.75rem] border p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-amber-100/45 hover:bg-white/10 ${stateClass} ${
        selected ? "ring-2 ring-amber-100/70" : ""
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="block font-mono text-2xl font-black">{seat.label}</span>
      <span className="mt-3 block text-xs font-bold text-current/60">{seat.zone}</span>
      <span className="mt-2 block text-sm font-black">
        {mine
          ? "自分の席"
          : seat.status === "occupied"
            ? seat.user?.displayName
            : seat.status === "reserved"
              ? "予約中"
              : "空席"}
      </span>
    </button>
  );
}

function RoomMetric({
  label,
  value,
  wide = false
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-black/25 p-4 ${wide ? "col-span-2" : ""}`}
    >
      <p className="text-xs font-black uppercase tracking-normal text-stone-300/45">{label}</p>
      <strong className="mt-3 block truncate font-mono text-2xl font-black text-amber-100">
        {value}
      </strong>
    </div>
  );
}

function SeatDetail({
  seat,
  mySeatId,
  onEnter,
  onLeave
}: {
  seat: Seat;
  mySeatId: string | null;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const isMine = mySeatId === seat.id;
  const canEnter = seat.status === "available" || isMine;

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-xs font-black uppercase tracking-normal text-amber-100/55">Seat detail</p>
      <h2 className="mt-3 font-mono text-5xl font-black">{seat.id}</h2>
      <p className="mt-3 text-lg font-bold text-stone-200/65">{seat.zone}</p>
      <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4">
        <DetailLine label="利用者" value={isMine ? "You" : (seat.user?.displayName ?? "空席")} />
        <DetailLine label="状態" value={isMine ? "自分の席" : seat.status} />
        <DetailLine
          label="作業開始"
          value={seat.user?.startedAt ? formatClock(new Date(seat.user.startedAt)) : "--"}
        />
        <DetailLine
          label="経過時間"
          value={seat.user ? formatDuration(seat.user.elapsedSeconds) : "--:--:--"}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          className="rounded-2xl bg-amber-100 px-4 py-3 font-black text-stone-950 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!canEnter}
          onClick={onEnter}
          type="button"
        >
          入室
        </button>
        <button
          className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 font-black text-stone-100 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!isMine}
          onClick={onLeave}
          type="button"
        >
          退出
        </button>
      </div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-bold text-stone-300/45">{label}</span>
      <span className="font-black text-stone-100">{value}</span>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-stone-200/70"
            key={item}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <h2 className="mb-5 text-2xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function RoomBackground({ roomId }: { roomId: string }) {
  const config = getRoomConfig(roomId);

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 bg-gradient-to-br ${config.accent.glow} via-transparent to-black/60`}
      />
      <div className="wood-grain pointer-events-none fixed inset-x-0 bottom-0 h-[28vh] opacity-50" />
      <div className="lamp-glow pointer-events-none fixed right-[10%] top-[-12%] h-[34rem] w-[34rem] rounded-full opacity-75" />
      <div className="rain-layer pointer-events-none fixed inset-0 opacity-20" />
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
