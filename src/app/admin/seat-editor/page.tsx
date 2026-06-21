"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { ROOM_CONFIGS, getRoomConfig, type RoomId } from "@/lib/room-config";
import { ROOM_SEAT_LAYOUTS, type RoomSeatLayout } from "@/lib/roomSeatLayouts";
import type { SeatLayoutsFile } from "@/lib/seat-layout-store";

export default function SeatEditorPage() {
  const [roomId, setRoomId] = useState<RoomId>("cafe");
  const [layouts, setLayouts] = useState<SeatLayoutsFile>(ROOM_SEAT_LAYOUTS);
  const [selectedSeatId, setSelectedSeatId] = useState(ROOM_SEAT_LAYOUTS.cafe[0].seat_id);
  const [status, setStatus] = useState("座席表を目で見ながら調整できます");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const config = getRoomConfig(roomId);
  const seats = layouts[roomId];
  const selectedSeat = seats.find((seat) => seat.seat_id === selectedSeatId) ?? seats[0];

  useEffect(() => {
    fetch("/api/admin/seat-layouts")
      .then((response) => response.json())
      .then((saved) => setLayouts(saved))
      .catch(() => undefined);
  }, []);

  function updateSeat(patch: Partial<RoomSeatLayout>) {
    setLayouts((current) => ({
      ...current,
      [roomId]: current[roomId].map((seat) =>
        seat.seat_id === selectedSeat.seat_id ? { ...seat, ...patch } : seat
      )
    }));

    if (patch.seat_id) {
      setSelectedSeatId(patch.seat_id);
    }
  }

  function addSeat() {
    const nextNumber = seats.length + 1;
    const seat: RoomSeatLayout = {
      seat_id: `chair_${String(nextNumber).padStart(2, "0")}`,
      seat_name: `新しい椅子 ${nextNumber}`,
      x: 50,
      y: 50,
      width: 5,
      height: 6
    };

    setLayouts((current) => ({ ...current, [roomId]: [...current[roomId], seat] }));
    setSelectedSeatId(seat.seat_id);
  }

  function deleteSeat() {
    const nextSeats = seats.filter((seat) => seat.seat_id !== selectedSeat.seat_id);
    setLayouts((current) => ({ ...current, [roomId]: nextSeats }));
    setSelectedSeatId(nextSeats[0]?.seat_id ?? "");
  }

  function dragSeat(event: PointerEvent<HTMLButtonElement>, seat: RoomSeatLayout) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSelectedSeatId(seat.seat_id);
    setLayouts((current) => ({
      ...current,
      [roomId]: current[roomId].map((item) =>
        item.seat_id === seat.seat_id ? { ...item, x: round(x), y: round(y) } : item
      )
    }));
  }

  async function save() {
    const response = await fetch("/api/admin/seat-layouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layouts })
    });

    setStatus(response.ok ? "保存しました: public/data/seat-layouts.json" : "保存に失敗しました");
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <div className="mx-auto grid max-w-[1800px] gap-6">
          <header className="glass-panel flex flex-wrap items-end justify-between gap-4 rounded-[2rem] p-6">
            <div>
              <p className="text-sm font-black uppercase text-amber-100/65">Seat Editor</p>
              <h1 className="mt-2 text-5xl font-black">座席位置を調整する</h1>
              <p className="mt-3 text-sm font-bold text-stone-200/55">{status}</p>
            </div>
            <button
              className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
              onClick={() => void save()}
              type="button"
            >
              保存
            </button>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="glass-panel overflow-hidden rounded-[2.25rem] p-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {ROOM_CONFIGS.map((room) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm font-black ${
                      room.id === roomId
                        ? "border-amber-100/60 bg-amber-100 text-stone-950"
                        : "border-white/10 bg-white/8 text-stone-100"
                    }`}
                    key={room.id}
                    onClick={() => {
                      setRoomId(room.id);
                      setSelectedSeatId(layouts[room.id][0]?.seat_id ?? "");
                    }}
                    type="button"
                  >
                    {room.name}
                  </button>
                ))}
              </div>

              <div
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30"
                ref={mapRef}
              >
                <Image
                  alt={`${config.name} seat map`}
                  className="block h-auto w-full"
                  height={1024}
                  priority
                  src={config.seatMapImage}
                  width={1536}
                />
                {seats.map((seat) => (
                  <button
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border text-[0.65rem] font-black backdrop-blur-sm ${
                      seat.seat_id === selectedSeatId
                        ? "border-amber-100 bg-amber-100/22 text-amber-50"
                        : "border-white/30 bg-black/20 text-white/70"
                    }`}
                    key={seat.seat_id}
                    onClick={() => setSelectedSeatId(seat.seat_id)}
                    onPointerMove={(event) => {
                      if (event.buttons === 1) {
                        dragSeat(event, seat);
                      }
                    }}
                    style={{
                      left: `${seat.x}%`,
                      top: `${seat.y}%`,
                      width: `${seat.width}%`,
                      height: `${seat.height}%`
                    }}
                    type="button"
                  >
                    {seat.seat_id}
                  </button>
                ))}
              </div>
            </div>

            <aside className="grid gap-5">
              <Panel title="選択中の椅子">
                {selectedSeat ? (
                  <div className="grid gap-3">
                    <TextInput
                      label="seat_id"
                      value={selectedSeat.seat_id}
                      onChange={(value) => updateSeat({ seat_id: value })}
                    />
                    <TextInput
                      label="seat_name"
                      value={selectedSeat.seat_name}
                      onChange={(value) => updateSeat({ seat_name: value })}
                    />
                    <NumberInput
                      label="x %"
                      value={selectedSeat.x}
                      onChange={(value) => updateSeat({ x: value })}
                    />
                    <NumberInput
                      label="y %"
                      value={selectedSeat.y}
                      onChange={(value) => updateSeat({ y: value })}
                    />
                    <NumberInput
                      label="width %"
                      value={selectedSeat.width}
                      onChange={(value) => updateSeat({ width: value })}
                    />
                    <NumberInput
                      label="height %"
                      value={selectedSeat.height}
                      onChange={(value) => updateSeat({ height: value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className="rounded-2xl bg-white/10 px-4 py-3 font-black"
                        onClick={addSeat}
                        type="button"
                      >
                        新規椅子追加
                      </button>
                      <button
                        className="rounded-2xl bg-rose-300/20 px-4 py-3 font-black text-rose-100"
                        onClick={deleteSeat}
                        type="button"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ) : null}
              </Panel>

              <Panel title="ユーザー画面プレビュー">
                <div className="relative overflow-hidden rounded-3xl border border-white/10">
                  <Image
                    alt="preview"
                    className="block h-auto w-full"
                    height={1024}
                    src={config.seatMapImage}
                    width={1536}
                  />
                  {seats.slice(0, 4).map((seat, index) => (
                    <div
                      className="seat-avatar absolute grid -translate-x-1/2 -translate-y-1/2 gap-1 rounded-2xl border border-amber-100/35 bg-black/58 px-3 py-2 text-center backdrop-blur-2xl"
                      key={seat.seat_id}
                      style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
                    >
                      <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-xs font-black text-stone-950">
                        {["M", "S", "A", "K"][index]}
                      </span>
                      <span className="text-[0.65rem] font-black text-stone-50">
                        {["Mika", "Sora", "Aoi", "Kai"][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </aside>
          </section>
        </div>
      </main>
    </AdminGuard>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-panel rounded-[2rem] p-5">
      <h2 className="mb-4 text-2xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
        max={100}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        step={0.1}
        type="number"
        value={value}
      />
    </label>
  );
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
