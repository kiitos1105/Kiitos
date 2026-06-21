"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { getRoomConfig, ROOM_SEAT_POSITIONS } from "@/lib/room-config";
import { formatDuration } from "@/lib/time";
import { getRoomDetail } from "@/lib/work-room";
import type { Seat, SeatStatus } from "@/lib/work-room";

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
            href="/lobby"
          >
            Lobbyへ戻る
          </Link>
        </div>
      </main>
    );
  }

  const config = getRoomConfig(room.roomId);
  const seatPositions = ROOM_SEAT_POSITIONS[room.roomId];
  const selectedSeat = room.seats.find((seat) => seat.id === selectedSeatId) ?? room.seats[0];
  const selectedPosition =
    seatPositions.find((position) => position.id === selectedSeat.id) ?? seatPositions[0];
  const activeSeats = room.seats.filter((seat) => seat.status === "occupied").length;
  const availableSeats = room.seats.filter((seat) => seat.status === "available").length;

  return (
    <main className="room-page relative min-h-screen overflow-hidden bg-cafe-950 text-stone-50">
      <RoomImageBackground roomId={room.roomId} image={config.image} />

      <section className="room-shell relative z-10 mx-auto grid min-h-screen w-full max-w-[1800px] grid-rows-[auto_1fr] gap-5 px-5 py-5 lg:px-8">
        <header className="room-header glass-panel rounded-[2rem] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                className="grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-black/28 text-xl font-black transition hover:bg-white/12"
                href="/lobby"
                aria-label="Lobbyへ戻る"
              >
                ←
              </Link>
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-amber-100/62">
                  /rooms/{config.id}
                </p>
                <h1 className="text-3xl font-black leading-none sm:text-5xl">{config.name}</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <MiniMetric label="現在人数" value={`${room.participants.length}`} />
              <MiniMetric label="使用中" value={`${activeSeats}`} />
              <MiniMetric label="空席" value={`${availableSeats}`} />
              <MiniMetric label="BGM" value={room.bgm} />
              <MiniMetric label="状態" value={mySeatId ? `着席中 ${mySeatId}` : "未入室"} />
            </div>
          </div>
        </header>

        <section className="room-stage grid min-h-0 gap-5 xl:grid-cols-[1fr_420px]">
          <div className="room-map glass-panel relative min-h-[620px] overflow-hidden rounded-[2.5rem]">
            <div
              className={`room-map-image absolute inset-0 bg-cover bg-center ${roomFallbackClass(room.roomId)}`}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.48)), url(${config.image})`
              }}
            />
            <div className="room-map-vignette absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0_38%,rgba(0,0,0,0.34)_70%),linear-gradient(90deg,rgba(0,0,0,0.48),transparent_28%,transparent_72%,rgba(0,0,0,0.56))]" />
            <div
              className={`absolute inset-x-10 top-0 h-1.5 rounded-b-full ${config.accent.line}`}
            />
            <div className="rain-layer pointer-events-none absolute inset-0 opacity-10" />

            <div className="room-map-copy absolute left-6 top-6 max-w-lg rounded-[2rem] border border-white/12 bg-black/30 p-5 shadow-2xl backdrop-blur-2xl">
              <p className="text-xs font-black uppercase tracking-normal text-amber-100/65">
                Choose your seat
              </p>
              <h2 className="mt-2 text-4xl font-black">席を選んでください</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-stone-100/68">
                {config.description}
              </p>
            </div>

            {seatPositions.map((position) => {
              const seat = room.seats.find((item) => item.id === position.id);
              if (!seat) {
                return null;
              }

              return (
                <SeatPin
                  key={position.id}
                  mine={mySeatId === seat.id}
                  onClick={() => setSelectedSeatId(seat.id)}
                  position={position}
                  seat={seat}
                  selected={selectedSeatId === seat.id}
                />
              );
            })}

            <div
              className="pointer-events-none absolute hidden rounded-full border border-amber-100/45 bg-amber-100/14 shadow-[0_0_80px_rgba(253,230,138,0.2)] xl:block"
              style={{
                left: `${selectedPosition.x}%`,
                top: `${selectedPosition.y}%`,
                width: "9rem",
                height: "9rem",
                transform: "translate(-50%, -50%)"
              }}
            />

            <div className="room-map-footer absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/12 bg-black/36 p-4 backdrop-blur-2xl">
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-stone-300/45">
                  Room rule
                </p>
                <p className="mt-1 text-sm font-bold text-stone-100/78">{room.rules.join(" / ")}</p>
              </div>
              <div className="flex gap-2 text-xs font-black">
                <LegendDot label="空席" tone="available" />
                <LegendDot label="使用中" tone="occupied" />
                <LegendDot label="自分" tone="mine" />
                <LegendDot label="予約" tone="reserved" />
              </div>
            </div>
          </div>

          <aside className="room-side grid min-h-0 gap-5 xl:grid-rows-[auto_1fr]">
            <SeatDetail
              mySeatId={mySeatId}
              onEnter={() => setMySeatId(selectedSeat.id)}
              onLeave={() => setMySeatId(null)}
              seat={selectedSeat}
              visualLabel={selectedPosition.label}
            />

            <div className="grid min-h-0 gap-5 lg:grid-cols-2 xl:grid-cols-1">
              <Panel title="参加者">
                <div className="grid max-h-[270px] gap-3 overflow-auto pr-1">
                  {room.participants.map((participant) => (
                    <div
                      className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-3xl border border-white/10 bg-black/24 p-3"
                      key={participant.id}
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 font-mono text-lg font-black">
                        {participant.seatId}
                      </span>
                      <div className="min-w-0">
                        <strong className="block truncate text-lg font-black">
                          {participant.displayName}
                        </strong>
                        <p className="mt-1 text-xs font-bold uppercase text-stone-300/45">
                          {participant.platform}
                        </p>
                      </div>
                      <time className="font-mono text-sm font-black text-amber-100">
                        {formatDuration(participant.elapsedSeconds)}
                      </time>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="作業ログ">
                <div className="grid max-h-[250px] gap-3 overflow-auto pr-1">
                  {room.logs.map((log) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/24 px-4 py-3"
                      key={log.id}
                    >
                      <div>
                        <p className="font-black">{log.userName}</p>
                        <p className="mt-1 text-xs font-bold text-stone-300/45">
                          Seat {log.seatId}
                        </p>
                      </div>
                      <time className="font-mono text-sm font-black text-amber-100">
                        {formatDuration(log.durationSeconds)}
                      </time>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function SeatPin({
  seat,
  position,
  selected,
  mine,
  onClick
}: {
  seat: Seat;
  position: { id: string; x: number; y: number; label: string };
  selected: boolean;
  mine: boolean;
  onClick: () => void;
}) {
  const status = mine ? "mine" : seat.status;
  const toneClass = getSeatTone(status);

  return (
    <button
      className={`absolute z-20 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-lg font-black shadow-2xl backdrop-blur-2xl transition duration-300 hover:scale-110 sm:h-20 sm:w-20 sm:text-2xl ${toneClass} ${
        selected ? "ring-4 ring-amber-100/65" : ""
      }`}
      onClick={onClick}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      title={`${seat.id} ${position.label}`}
      type="button"
    >
      <span>{seat.id}</span>
      {seat.user ? (
        <span className="absolute -bottom-7 max-w-24 truncate rounded-full border border-white/10 bg-black/48 px-2 py-1 text-[0.65rem] font-black text-stone-100/80 backdrop-blur-xl">
          {seat.user.displayName}
        </span>
      ) : null}
    </button>
  );
}

function SeatDetail({
  seat,
  visualLabel,
  mySeatId,
  onEnter,
  onLeave
}: {
  seat: Seat;
  visualLabel: string;
  mySeatId: string | null;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const isMine = mySeatId === seat.id;
  const canEnter = seat.status === "available" || isMine;
  const status = isMine ? "自分の席" : getSeatStatusLabel(seat.status);

  return (
    <section className="glass-panel rounded-[2.25rem] p-6">
      <p className="text-xs font-black uppercase tracking-normal text-amber-100/62">Seat detail</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-7xl font-black leading-none">{seat.id}</h2>
          <p className="mt-3 text-lg font-black text-amber-100">{visualLabel}</p>
          <p className="mt-1 text-sm font-bold text-stone-200/58">{seat.zone}</p>
        </div>
        <span
          className={`rounded-full border px-4 py-2 text-sm font-black ${getSeatTone(
            isMine ? "mine" : seat.status
          )}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/24 p-4">
        <DetailLine label="利用者" value={isMine ? "You" : (seat.user?.displayName ?? "空席")} />
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
          className="rounded-2xl bg-amber-100 px-4 py-4 font-black text-stone-950 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!canEnter}
          onClick={onEnter}
          type="button"
        >
          この席に座る
        </button>
        <button
          className="rounded-2xl border border-white/15 bg-white/8 px-4 py-4 font-black text-stone-100 transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!isMine}
          onClick={onLeave}
          type="button"
        >
          退出
        </button>
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
      <p className="text-[0.65rem] font-black uppercase tracking-normal text-stone-300/45">
        {label}
      </p>
      <strong className="mt-1 block max-w-44 truncate text-lg font-black text-amber-100">
        {value}
      </strong>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-panel min-h-0 rounded-[2rem] p-5">
      <h2 className="mb-4 text-2xl font-black">{title}</h2>
      {children}
    </section>
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

function LegendDot({ label, tone }: { label: string; tone: SeatStatus | "mine" }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/24 px-3 py-2">
      <span className={`h-2.5 w-2.5 rounded-full ${getSeatDot(tone)}`} />
      {label}
    </span>
  );
}

function RoomImageBackground({ roomId, image }: { roomId: string; image: string }) {
  const config = getRoomConfig(roomId);

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 scale-105 bg-cover bg-center opacity-[0.46] blur-[2px] ${roomFallbackClass(
          roomId
        )}`}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10,17,20,0.2), rgba(10,17,20,0.82)), url(${image})`
        }}
      />
      <div
        className={`pointer-events-none fixed inset-0 bg-gradient-to-br ${config.accent.glow} via-transparent to-black/70`}
      />
      <div className="wood-grain pointer-events-none fixed inset-x-0 bottom-0 h-[25vh] opacity-45" />
      <div className="lamp-glow pointer-events-none fixed right-[8%] top-[-14%] h-[34rem] w-[34rem] rounded-full opacity-60" />
      <div className="rain-layer pointer-events-none fixed inset-0 opacity-[0.12]" />
    </>
  );
}

function getSeatTone(status: SeatStatus | "mine") {
  if (status === "mine") {
    return "border-amber-100/75 bg-amber-100/30 text-amber-50 shadow-[0_0_40px_rgba(253,230,138,0.32)]";
  }

  if (status === "occupied") {
    return "border-rose-200/45 bg-rose-300/22 text-rose-50";
  }

  if (status === "reserved") {
    return "border-sky-200/45 bg-sky-300/18 text-sky-50";
  }

  return "border-white/20 bg-black/36 text-stone-50 hover:border-amber-100/60 hover:bg-amber-100/16";
}

function getSeatDot(status: SeatStatus | "mine") {
  if (status === "mine") {
    return "bg-amber-200";
  }

  if (status === "occupied") {
    return "bg-rose-300";
  }

  if (status === "reserved") {
    return "bg-sky-300";
  }

  return "bg-emerald-200";
}

function getSeatStatusLabel(status: SeatStatus) {
  if (status === "occupied") {
    return "使用中";
  }

  if (status === "reserved") {
    return "予約中";
  }

  return "空席";
}

function roomFallbackClass(roomId: string) {
  const classes: Record<string, string> = {
    cafe: "bg-[radial-gradient(circle_at_28%_32%,rgba(252,211,77,0.34),transparent_24%),linear-gradient(135deg,#342113,#11181a_62%,#080c0e)]",
    library:
      "bg-[radial-gradient(circle_at_30%_24%,rgba(187,164,112,0.25),transparent_22%),linear-gradient(135deg,#1c241a,#0c1212_58%,#070909)]",
    office:
      "bg-[radial-gradient(circle_at_72%_28%,rgba(226,232,240,0.2),transparent_24%),linear-gradient(135deg,#14181b,#090e11_62%,#050708)]",
    creator:
      "bg-[radial-gradient(circle_at_74%_30%,rgba(125,211,252,0.26),transparent_24%),linear-gradient(135deg,#10171c,#11101b_55%,#060708)]",
    night:
      "bg-[radial-gradient(circle_at_70%_22%,rgba(199,210,254,0.22),transparent_24%),linear-gradient(135deg,#0c1020,#090b12_58%,#050608)]"
  };

  return classes[roomId] ?? classes.cafe;
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}
