"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import {
  deleteCustomRoom,
  readCustomRooms,
  upsertCustomRoom,
  type CustomRoom
} from "@/lib/premium-client";
import { ROOM_CONFIGS } from "@/lib/room-config";
import { getRoomDetails } from "@/lib/work-room";

type RoomForm = {
  enabled: boolean;
  name: string;
  description: string;
  bgm: string;
  capacity: number;
};

export default function AdminRoomsPage() {
  const rooms = useMemo(() => getRoomDetails(), []);
  const [forms, setForms] = useState<Record<string, RoomForm>>(
    Object.fromEntries(
      rooms.map((room) => [
        room.roomId,
        {
          enabled: true,
          name: room.name,
          description: room.description ?? "",
          bgm: room.bgm,
          capacity: room.seats.length
        }
      ])
    )
  );
  const [status, setStatus] = useState("部屋設定を編集できます");
  const [customRooms, setCustomRooms] = useState<CustomRoom[]>([]);

  useEffect(() => {
    setCustomRooms(readCustomRooms());
  }, []);

  function update(roomId: string, patch: Partial<RoomForm>) {
    setForms((current) => ({ ...current, [roomId]: { ...current[roomId], ...patch } }));
  }

  function refreshCustomRooms() {
    setCustomRooms(readCustomRooms());
  }

  function forcePrivate(room: CustomRoom) {
    upsertCustomRoom({ ...room, visibility: "private", is_public: false });
    setStatus(`${room.name} を強制非公開にしました。`);
    refreshCustomRooms();
  }

  function removeCustomRoom(room: CustomRoom) {
    deleteCustomRoom(room.id);
    setStatus(`${room.name} を削除しました。`);
    refreshCustomRooms();
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-7xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Room Admin</p>
            <h1 className="mt-2 text-5xl font-black">部屋管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">{status}</p>
          </header>

          <section className="grid gap-5 xl:grid-cols-2">
            {ROOM_CONFIGS.map((config) => {
              const form = forms[config.id];

              return (
                <article className="glass-panel rounded-[2rem] p-6" key={config.id}>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-3xl font-black">{form.name}</h2>
                    <label className="flex items-center gap-2 text-sm font-black">
                      <input
                        checked={form.enabled}
                        onChange={(event) => update(config.id, { enabled: event.target.checked })}
                        type="checkbox"
                      />
                      ON/OFF
                    </label>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <Field
                      label="部屋名"
                      value={form.name}
                      onChange={(value) => update(config.id, { name: value })}
                    />
                    <Field
                      label="説明"
                      value={form.description}
                      onChange={(value) => update(config.id, { description: value })}
                    />
                    <Field
                      label="BGM"
                      value={form.bgm}
                      onChange={(value) => update(config.id, { bgm: value })}
                    />
                    <label className="grid gap-2 text-sm font-black text-stone-200/65">
                      定員
                      <input
                        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                        min={1}
                        onChange={(event) =>
                          update(config.id, { capacity: Number(event.target.value) })
                        }
                        type="number"
                        value={form.capacity}
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </section>

          <button
            className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
            onClick={() =>
              setStatus("保存しました。MVPでは画面内のダミー設定として保持しています。")
            }
            type="button"
          >
            部屋設定を保存
          </button>

          <section className="glass-panel rounded-[2rem] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-amber-100/65">Custom Rooms</p>
                <h2 className="mt-2 text-4xl font-black">カスタムルーム管理</h2>
                <p className="mt-3 text-sm font-bold text-stone-200/55">
                  作成者、ルームタイプ、公開状態、参加人数を確認し、強制非公開・削除・編集できます。
                </p>
              </div>
              <Link
                className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
                href="/admin/custom-rooms"
              >
                詳細管理へ
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {customRooms.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/24 p-4 text-sm font-bold text-stone-200/60">
                  まだカスタムルームはありません。Premium Demoで作成するとここに表示されます。
                </p>
              ) : (
                customRooms.map((room) => (
                  <article
                    className="grid gap-4 rounded-3xl border border-white/10 bg-black/24 p-4 lg:grid-cols-[1fr_auto]"
                    key={room.id}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-black">{room.name}</h3>
                        <span className="rounded-full border border-white/10 bg-black/28 px-3 py-1 text-xs font-black text-amber-100">
                          {room.room_type}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/28 px-3 py-1 text-xs font-black">
                          {room.visibility === "public" ? "公開" : "非公開"}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-1 text-sm font-bold text-stone-200/58 md:grid-cols-4">
                        <p>作成者: {room.ownerName}</p>
                        <p>Template: {room.template_id}</p>
                        <p>
                          参加人数: {room.participants.length}/{room.capacity}
                        </p>
                        <p>Invite: {room.invite_code}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 font-black"
                        href={`/custom-room/${room.id}`}
                      >
                        開く
                      </Link>
                      <button
                        className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 font-black"
                        onClick={() => forcePrivate(room)}
                        type="button"
                      >
                        強制非公開
                      </button>
                      <button
                        className="rounded-2xl border border-rose-200/30 bg-rose-300/12 px-4 py-3 font-black text-rose-100"
                        onClick={() => removeCustomRoom(room)}
                        type="button"
                      >
                        削除
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </main>
    </AdminGuard>
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
