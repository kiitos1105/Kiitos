"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import {
  deleteCustomRoom,
  readCustomRooms,
  seedDemoCustomRooms,
  upsertCustomRoom,
  type CustomRoom
} from "@/lib/premium-client";

export default function AdminCustomRoomsPage() {
  const [rooms, setRooms] = useState<CustomRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0] ?? null;

  useEffect(() => {
    setRooms(seedDemoCustomRooms());
  }, []);

  function reload() {
    setRooms(readCustomRooms());
  }

  function save(room: CustomRoom) {
    upsertCustomRoom(room);
    reload();
    setSelectedRoomId(room.id);
  }

  function remove(roomId: string) {
    deleteCustomRoom(roomId);
    const nextRooms = readCustomRooms();
    setRooms(nextRooms);
    setSelectedRoomId(nextRooms[0]?.id ?? null);
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-7xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Custom Room Admin</p>
            <h1 className="mt-2 text-5xl font-black">Custom Room管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">
              localStorageのDemo部屋を一覧・編集・公開停止・削除できます。
            </p>
          </header>

          <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
            <aside className="glass-panel rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">部屋一覧</h2>
                <Link
                  className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-black text-stone-950"
                  href="/custom-room/new"
                >
                  新規
                </Link>
              </div>
              <div className="mt-4 grid gap-3">
                {rooms.map((room) => (
                  <button
                    className={`rounded-3xl border p-4 text-left transition hover:bg-white/10 ${
                      selectedRoom?.id === room.id
                        ? "border-amber-100/55 bg-amber-100/12"
                        : "border-white/10 bg-black/24"
                    }`}
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-lg font-black">{room.name}</h3>
                      <span className="rounded-full border border-white/10 bg-black/24 px-2 py-1 text-xs font-black">
                        {room.suspended ? "停止中" : room.visibility}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-stone-300/50">
                      Owner: {room.ownerName}
                    </p>
                  </button>
                ))}
              </div>
            </aside>

            {selectedRoom ? (
              <RoomAdminEditor
                key={selectedRoom.id}
                onDelete={remove}
                onSave={save}
                room={selectedRoom}
              />
            ) : (
              <section className="glass-panel rounded-[2rem] p-8">
                <h2 className="text-3xl font-black">Custom Roomがありません</h2>
                <p className="mt-3 text-sm font-bold text-stone-200/60">
                  新規作成ボタンからDemo部屋を作成できます。
                </p>
              </section>
            )}
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}

function RoomAdminEditor({
  room,
  onSave,
  onDelete
}: {
  room: CustomRoom;
  onSave: (room: CustomRoom) => void;
  onDelete: (roomId: string) => void;
}) {
  const [draft, setDraft] = useState(room);

  return (
    <section className="glass-panel grid gap-5 rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-amber-100/60">Room Detail</p>
          <h2 className="mt-2 text-4xl font-black">{draft.name}</h2>
          <p className="mt-2 text-sm font-bold text-stone-200/55">Owner ID: {draft.ownerId}</p>
          <p className="text-sm font-bold text-stone-200/55">Owner Name: {draft.ownerName}</p>
        </div>
        <Link
          className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
          href={`/custom-room/${draft.id}`}
        >
          部屋を開く
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="部屋名"
          onChange={(value) => setDraft({ ...draft, name: value })}
          value={draft.name}
        />
        <Field
          label="BGM"
          onChange={(value) => setDraft({ ...draft, bgm: value })}
          value={draft.bgm}
        />
        <Field
          label="テーマ"
          onChange={(value) => setDraft({ ...draft, theme: value })}
          value={draft.theme}
        />
        <label className="grid gap-2 text-sm font-black text-stone-200/65">
          定員
          <input
            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
            max={8}
            min={1}
            onChange={(event) => setDraft({ ...draft, capacity: Number(event.target.value) })}
            type="number"
            value={draft.capacity}
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-stone-200/65 md:col-span-2">
          説明
          <textarea
            className="min-h-28 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            value={draft.description}
          />
        </label>
      </div>

      <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/24 p-4 md:grid-cols-3">
        <label className="flex items-center gap-3 font-black">
          <input
            checked={draft.visibility === "public"}
            onChange={(event) =>
              setDraft({ ...draft, visibility: event.target.checked ? "public" : "private" })
            }
            type="checkbox"
          />
          公開
        </label>
        <label className="flex items-center gap-3 font-black">
          <input
            checked={draft.suspended}
            onChange={(event) => setDraft({ ...draft, suspended: event.target.checked })}
            type="checkbox"
          />
          公開停止
        </label>
        <p className="font-black text-amber-100">参加者 {draft.participants.length}人</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
          onClick={() => onSave(draft)}
          type="button"
        >
          保存
        </button>
        <button
          className="rounded-2xl border border-rose-200/30 bg-rose-300/12 px-6 py-4 font-black text-rose-100"
          onClick={() => onDelete(draft.id)}
          type="button"
        >
          削除
        </button>
      </div>
    </section>
  );
}

function Field({
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
