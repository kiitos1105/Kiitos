"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getRoomDetails } from "@/lib/work-room";
import { ROOM_CONFIGS } from "@/lib/room-config";
import type { AdminActionKind } from "@/lib/work-room";

const ADMIN_ACTIONS: { kind: AdminActionKind; label: string }[] = [
  { kind: "force_out", label: "強制退出" },
  { kind: "warn", label: "警告" },
  { kind: "ban", label: "BAN" },
  { kind: "move_room", label: "部屋移動" },
  { kind: "move_seat", label: "席移動" },
  { kind: "announce_all", label: "全体アナウンス" },
  { kind: "announce_room", label: "部屋別アナウンス" },
  { kind: "pomodoro_start", label: "ポモドーロ開始" },
  { kind: "pomodoro_stop", label: "ポモドーロ停止" },
  { kind: "toggle_room", label: "部屋ON/OFF" }
];

export default function AdminPage() {
  const rooms = useMemo(() => getRoomDetails(), []);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [interval, setIntervalValue] = useState<5 | 7 | 10 | 15 | 30>(7);
  const [announcement, setAnnouncement] = useState("Welcome back to Kiitos Work Room.");
  const [status, setStatus] = useState("未認証");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => response.json())
      .then((settings) => {
        setIntervalValue(settings.cameraIntervalSeconds ?? 7);
        setAnnouncement(settings.globalAnnouncement ?? "");
      })
      .catch(() => undefined);
  }, []);

  async function updateSettings(kind: AdminActionKind, extra?: Record<string, unknown>) {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        cameraIntervalSeconds: interval,
        globalAnnouncement: announcement,
        action: { kind, message: message || announcement, ...extra }
      })
    });

    setStatus(response.ok ? "保存しました" : "認証に失敗しました");
  }

  const participants = rooms.flatMap((room) =>
    room.participants.map((participant) => ({ ...participant, roomName: room.name }))
  );

  return (
    <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="glass-panel rounded-[2rem] p-7">
          <p className="text-sm font-black uppercase tracking-normal text-amber-100/60">
            Kiitos Admin
          </p>
          <h1 className="mt-3 text-5xl font-black">管理画面</h1>
          <p className="mt-4 max-w-3xl text-stone-200/60">
            MVPでは環境変数 `ADMIN_PASSWORD` による簡易認証です。将来 Discord ID / Google Login
            に移行しやすいよう、操作はAdmin Actionとして記録する設計です。
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="grid gap-5">
            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">認証</h2>
              <input
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-bold outline-none focus:border-amber-100/60"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="ADMIN_PASSWORD"
                type="password"
                value={password}
              />
              <p className="mt-3 text-sm font-bold text-amber-100/70">{status}</p>
            </div>

            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">定点カメラ</h2>
              <select
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-black"
                onChange={(event) =>
                  setIntervalValue(Number(event.target.value) as 5 | 7 | 10 | 15 | 30)
                }
                value={interval}
              >
                {[5, 7, 10, 15, 30].map((seconds) => (
                  <option key={seconds} value={seconds}>
                    {seconds}秒
                  </option>
                ))}
              </select>
              <button
                className="mt-4 w-full rounded-2xl bg-amber-100 px-4 py-3 font-black text-stone-950"
                onClick={() => updateSettings("announce_all")}
                type="button"
              >
                反映
              </button>
            </div>

            <div className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">アナウンス</h2>
              <textarea
                className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-bold outline-none focus:border-amber-100/60"
                onChange={(event) => setAnnouncement(event.target.value)}
                value={announcement}
              />
              <input
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-bold outline-none"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="操作メモ"
                value={message}
              />
            </div>
          </aside>

          <div className="grid gap-6">
            <Panel title="現在の参加者">
              <div className="grid gap-3">
                {participants.map((participant) => (
                  <div
                    className="grid grid-cols-[1fr_120px_120px] items-center gap-4 rounded-3xl border border-white/10 bg-black/25 px-4 py-3"
                    key={participant.id}
                  >
                    <div>
                      <p className="text-lg font-black">{participant.displayName}</p>
                      <p className="text-xs font-bold uppercase text-stone-300/45">
                        {participant.roomName} · {participant.platform}
                      </p>
                    </div>
                    <span className="font-mono text-xl font-black text-amber-100">
                      {participant.seatId}
                    </span>
                    <button
                      className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-black"
                      onClick={() => updateSettings("force_out", { targetUserId: participant.id })}
                      type="button"
                    >
                      強制退出
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="部屋・席一覧">
              <div className="grid gap-4 xl:grid-cols-2">
                {rooms.map((room) => (
                  <div className="rounded-3xl border border-white/10 bg-black/25 p-4" key={room.id}>
                    <div className="mb-3 flex items-center justify-between">
                      <strong className="text-xl">{room.name}</strong>
                      <span className="text-sm font-black text-amber-100">
                        {room.participants.length} users
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {room.seats.map((seat) => (
                        <span
                          className={`rounded-xl px-2 py-2 text-center font-mono text-sm font-black ${
                            seat.status === "occupied"
                              ? "bg-rose-300/20 text-rose-100"
                              : seat.status === "reserved"
                                ? "bg-sky-300/15 text-sky-100"
                                : "bg-white/8 text-stone-300"
                          }`}
                          key={seat.id}
                        >
                          {seat.id}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="管理アクション">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {ADMIN_ACTIONS.map((action) => (
                  <button
                    className="rounded-2xl border border-white/10 bg-white/8 px-3 py-3 text-sm font-black transition hover:bg-white/14"
                    key={action.kind}
                    onClick={() => updateSettings(action.kind)}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                {ROOM_CONFIGS.map((room) => (
                  <button
                    className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm font-black"
                    key={room.id}
                    onClick={() => updateSettings("toggle_room", { roomId: room.id })}
                    type="button"
                  >
                    {room.shortName} ON/OFF
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
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
