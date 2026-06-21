"use client";

import { useMemo, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { ROOM_CONFIGS, type RoomId } from "@/lib/room-config";
import { getRoomDetails } from "@/lib/work-room";
import type { AdminActionKind } from "@/lib/work-room";

const ACTIONS: { kind: AdminActionKind; label: string }[] = [
  { kind: "force_out", label: "強制退出" },
  { kind: "warn", label: "警告" },
  { kind: "ban", label: "BAN" },
  { kind: "move_room", label: "部屋移動" },
  { kind: "move_seat", label: "席移動" }
];

export default function AdminUsersPage() {
  const rooms = useMemo(() => getRoomDetails(), []);
  const [status, setStatus] = useState("操作対象を選んでください");
  const [targetRoom, setTargetRoom] = useState<RoomId>("cafe");
  const participants = rooms.flatMap((room) =>
    room.participants.map((participant) => ({
      ...participant,
      roomId: room.roomId,
      roomName: room.name
    }))
  );

  async function action(kind: AdminActionKind, targetUserId: string) {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: {
          kind,
          targetUserId,
          roomId: targetRoom,
          message: `${kind} from /admin/users`
        }
      })
    });

    setStatus(response.ok ? "操作を記録しました" : "操作に失敗しました");
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-7xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Admin Users</p>
            <h1 className="mt-2 text-5xl font-black">参加者管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">{status}</p>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="grid gap-3">
              {participants.map((participant) => (
                <article
                  className="glass-panel grid gap-4 rounded-[1.75rem] p-4 md:grid-cols-[1fr_auto]"
                  key={participant.id}
                >
                  <div>
                    <p className="text-2xl font-black">{participant.displayName}</p>
                    <p className="mt-1 text-sm font-bold text-stone-300/55">
                      {participant.roomName} / {participant.seatId} / {participant.platform}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ACTIONS.map((item) => (
                      <button
                        className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-black"
                        key={item.kind}
                        onClick={() => void action(item.kind, participant.id)}
                        type="button"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <aside className="glass-panel rounded-[2rem] p-5">
              <h2 className="text-2xl font-black">移動先</h2>
              <select
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-black"
                onChange={(event) => setTargetRoom(event.target.value as RoomId)}
                value={targetRoom}
              >
                {ROOM_CONFIGS.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <p className="mt-4 text-sm font-bold leading-6 text-stone-200/58">
                今はMVPとして操作履歴をAdmin Actionに記録します。将来Supabaseの active_sessions /
                admin_actions に接続します。
              </p>
            </aside>
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}
