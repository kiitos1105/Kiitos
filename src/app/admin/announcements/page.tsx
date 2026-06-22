"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { ROOM_CONFIGS } from "@/lib/room-config";

type Announcement = {
  id: string;
  scope: string;
  message: string;
  createdAt: string;
};

export default function AdminAnnouncementsPage() {
  const [scope, setScope] = useState("all");
  const [message, setMessage] = useState("今日もKiitos Work Roomへようこそ。");
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "welcome",
      scope: "all",
      message: "座席表をクリックして好きな椅子に座れます。",
      createdAt: new Date().toISOString()
    }
  ]);

  function createAnnouncement() {
    setAnnouncements((current) => [
      {
        id: crypto.randomUUID(),
        scope,
        message,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-5xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Announcements</p>
            <h1 className="mt-2 text-5xl font-black">アナウンス</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">
              全体または部屋別のお知らせを作成できます。
            </p>
          </header>

          <section className="glass-panel rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">新規作成</h2>
            <div className="mt-5 grid gap-3">
              <select
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-black"
                onChange={(event) => setScope(event.target.value)}
                value={scope}
              >
                <option value="all">全体</option>
                {ROOM_CONFIGS.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-32 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-bold outline-none"
                onChange={(event) => setMessage(event.target.value)}
                value={message}
              />
              <button
                className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950"
                onClick={createAnnouncement}
                type="button"
              >
                アナウンスを作成
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">表示中アナウンス</h2>
            <div className="mt-5 grid gap-3">
              {announcements.map((announcement) => (
                <article
                  className="rounded-3xl border border-white/10 bg-black/24 p-4"
                  key={announcement.id}
                >
                  <p className="text-xs font-black uppercase text-amber-100/60">
                    {announcement.scope}
                  </p>
                  <p className="mt-2 text-lg font-black">{announcement.message}</p>
                  <time className="mt-2 block text-xs font-bold text-stone-300/45">
                    {new Date(announcement.createdAt).toLocaleString("ja-JP")}
                  </time>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}
