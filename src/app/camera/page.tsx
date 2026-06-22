"use client";

import { useEffect, useMemo, useState } from "react";
import { WeatherCities } from "@/components/WeatherCities";
import { getRoomDetails } from "@/lib/work-room";
import { getRoomConfig } from "@/lib/room-config";
import { formatDuration } from "@/lib/time";

export default function CameraPage() {
  const rooms = useMemo(() => getRoomDetails(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(7);
  const [prioritizePopularRooms, setPrioritizePopularRooms] = useState(false);
  const [, setTick] = useState(0);
  const displayRooms = useMemo(
    () =>
      prioritizePopularRooms
        ? [...rooms].sort((a, b) => b.participants.length - a.participants.length)
        : rooms,
    [prioritizePopularRooms, rooms]
  );
  const activeRoom = displayRooms[activeIndex % displayRooms.length];
  const config = getRoomConfig(activeRoom.roomId);
  const totalFocus = activeRoom.participants.reduce(
    (sum, participant) => sum + participant.elapsedSeconds,
    0
  );

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => response.json())
      .then((settings) => {
        setIntervalSeconds(settings.cameraIntervalSeconds ?? 7);
        setPrioritizePopularRooms(Boolean(settings.prioritizePopularRooms));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % displayRooms.length),
      intervalSeconds * 1000
    );

    return () => window.clearInterval(timer);
  }, [intervalSeconds, displayRooms.length]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-8 text-stone-50">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.accent.glow} via-transparent to-black/80 transition-all duration-1000`}
      />
      <div className="wood-grain pointer-events-none fixed inset-x-0 bottom-0 h-[26vh] opacity-45" />

      <section className="relative z-10 grid min-h-[calc(100vh-4rem)] grid-cols-[1fr_360px] gap-6">
        <div className="glass-panel camera-frame relative overflow-hidden rounded-[2.5rem] p-8">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center opacity-60 transition duration-[1800ms]"
            style={{ backgroundImage: `url(${config.seatMapImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <header className="flex items-start justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-normal text-amber-100/60">
                  定点カメラ · {intervalSeconds}s
                </p>
                <h1 className="mt-4 text-8xl font-black leading-none tracking-normal">
                  {activeRoom.name}
                </h1>
                <p className="mt-5 max-w-3xl text-xl font-medium leading-8 text-stone-200/65">
                  {activeRoom.description}
                </p>
              </div>
              <span
                className={`grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br ${config.accent.avatar} text-5xl font-black text-stone-950`}
              >
                {config.icon}
              </span>
            </header>

            <div className="grid grid-cols-3 gap-4">
              <CameraMetric label="参加者" value={`${activeRoom.participants.length}`} />
              <CameraMetric label="集中時間" value={formatDuration(totalFocus)} />
              <CameraMetric label="BGM" value={activeRoom.bgm} />
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/28 p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-normal text-stone-300/45">
                Weather
              </p>
              <WeatherCities compact />
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/28 p-4">
              <p className="mb-3 text-xs font-black uppercase tracking-normal text-stone-300/45">
                🎤 VC参加者
              </p>
              <div className="flex flex-wrap gap-2">
                {["Mika", "Sora", "Aoi"].map((name, index) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-black"
                    key={name}
                  >
                    {index === 0 ? "🎙" : "🔇"} {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {activeRoom.seats.map((seat) => (
                <div
                  className={`rounded-2xl border px-3 py-3 ${
                    seat.status === "occupied"
                      ? "border-amber-100/35 bg-amber-100/16"
                      : seat.status === "reserved"
                        ? "border-sky-100/30 bg-sky-100/10"
                        : "border-white/10 bg-black/24"
                  }`}
                  key={seat.id}
                >
                  <p className="font-mono text-xl font-black">{seat.id}</p>
                  {seat.user ? (
                    <p className="mt-1 text-[0.65rem] font-black uppercase text-amber-100/70">
                      Lv.{Math.max(1, 10 + seat.user.displayName.length)}
                    </p>
                  ) : null}
                  <p className="mt-1 truncate text-xs font-bold text-stone-300/48">
                    {seat.user?.displayName ?? seat.zone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="grid gap-5">
          {displayRooms.map((room, index) => (
            <button
              className={`glass-panel rounded-[1.5rem] p-4 text-left transition duration-500 ${
                index === activeIndex ? "scale-[1.02] border-amber-100/45" : "opacity-55"
              }`}
              key={room.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <p className="text-sm font-black text-stone-300/55">{room.shortName}</p>
              <div className="mt-2 flex items-center justify-between">
                <strong className="text-2xl font-black">{room.name}</strong>
                <span className="font-mono text-xl font-black text-amber-100">
                  {room.participants.length}
                </span>
              </div>
            </button>
          ))}
        </aside>
      </section>
    </main>
  );
}

function CameraMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/28 p-5">
      <p className="text-xs font-black uppercase tracking-normal text-stone-300/45">{label}</p>
      <strong className="mt-3 block truncate font-mono text-3xl font-black text-amber-100">
        {value}
      </strong>
    </div>
  );
}
