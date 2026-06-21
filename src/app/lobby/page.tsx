"use client";

import Link from "next/link";
import { getRoomDetails } from "@/lib/work-room";
import { getRoomConfig } from "@/lib/room-config";

export default function LobbyPage() {
  const rooms = getRoomDetails();
  const totalParticipants = rooms.reduce((sum, room) => sum + room.participants.length, 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 text-stone-50">
      <LobbyBackground />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="grid gap-6 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-black/25 px-4 py-2 text-sm font-black text-amber-100/80 backdrop-blur-2xl">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-200 shadow-[0_0_22px_rgba(253,230,138,0.9)]" />
              Apple × Nordic Cafe × Kiitos
            </div>
            <h1 className="mt-6 max-w-5xl text-[clamp(4rem,9vw,10rem)] font-black leading-[0.86] tracking-normal">
              Kiitos
              <span className="block text-amber-100">Work Room</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-stone-200/70">
              部屋を選んで、好きな席に座る。毎日帰ってきたくなるオンライン作業空間。
            </p>
          </div>

          <nav className="flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-white/12 bg-white/8 px-5 py-3 font-black"
              href="/display"
            >
              Display
            </Link>
            <Link
              className="rounded-full border border-white/12 bg-white/8 px-5 py-3 font-black"
              href="/camera"
            >
              Camera
            </Link>
            <div className="rounded-full border border-amber-100/20 bg-amber-100 px-5 py-3 font-black text-stone-950">
              {totalParticipants} people inside
            </div>
          </nav>
        </header>

        <section className="grid flex-1 gap-5 lg:grid-cols-5">
          {rooms.map((room) => {
            const config = getRoomConfig(room.roomId);

            return (
              <Link
                className="group glass-panel relative min-h-[520px] overflow-hidden rounded-[2.25rem] transition duration-500 hover:-translate-y-2 hover:border-amber-100/35"
                href={`/rooms/${room.roomId}`}
                key={room.roomId}
              >
                <div
                  className={`absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105 ${roomImageFallbackClass(room.roomId)}`}
                  style={{ backgroundImage: `url(${config.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/42 to-black/10" />
                <div
                  className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${config.accent.glow} to-transparent`}
                />
                <div
                  className={`absolute inset-x-8 top-0 h-1.5 rounded-b-full ${config.accent.line}`}
                />

                <article className="relative z-10 flex h-full flex-col justify-between p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-16 w-16 place-items-center rounded-3xl border border-white/15 bg-black/32 text-3xl shadow-2xl backdrop-blur-xl">
                      {config.icon}
                    </span>
                    <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-xs font-black text-stone-100/75 backdrop-blur-xl">
                      /in {config.id}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-normal text-amber-100/65">
                      Choose a room
                    </p>
                    <h2 className="mt-2 text-4xl font-black leading-none">{config.name}</h2>
                    <p className="mt-4 min-h-20 text-sm font-semibold leading-6 text-stone-100/70">
                      {config.description}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-xl">
                        <p className="text-[0.65rem] font-black uppercase text-stone-300/45">
                          People
                        </p>
                        <strong className="mt-1 block text-3xl font-black text-amber-100">
                          {room.participants.length}
                        </strong>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-xl">
                        <p className="text-[0.65rem] font-black uppercase text-stone-300/45">
                          Seats
                        </p>
                        <strong className="mt-1 block text-3xl font-black">
                          {room.seats.filter((seat) => seat.status === "available").length}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>
      </section>
    </main>
  );
}

function LobbyBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,214,158,0.24),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(91,128,119,0.2),transparent_34%),linear-gradient(180deg,rgb(10,17,20),rgb(7,9,10))]" />
      <div className="wood-grain pointer-events-none fixed inset-x-0 bottom-0 h-[32vh] opacity-65" />
      <div className="rain-layer pointer-events-none fixed inset-0 opacity-15" />
    </>
  );
}

function roomImageFallbackClass(roomId: string) {
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
