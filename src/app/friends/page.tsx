"use client";

import Link from "next/link";
import { useState } from "react";
import { getFriends, type Friend } from "@/lib/engagement-client";

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>(getFriends());
  const [status, setStatus] = useState("フレンドと一緒に集中できます。");

  function updateFriend(id: string, patch: Partial<Friend>, message: string) {
    setFriends((items) =>
      items.map((friend) => (friend.id === id ? { ...friend, ...patch } : friend))
    );
    setStatus(message);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-black/70" />
      <section className="relative z-10 mx-auto grid max-w-6xl gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-amber-100/65">Friends</p>
              <h1 className="mt-3 text-6xl font-black">フレンド</h1>
              <p className="mt-4 text-sm font-bold text-stone-200/62">{status}</p>
            </div>
            <Link
              className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
              href="/lobby"
            >
              Lobbyへ
            </Link>
          </div>
        </header>

        <section className="glass-panel rounded-[2rem] p-5">
          <h2 className="text-2xl font-black">フレンド申請</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
              onClick={() => setStatus("Soraへフレンド申請を送りました")}
              type="button"
            >
              申請する
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 font-black"
              onClick={() => setStatus("Mikaの申請を承認しました")}
              type="button"
            >
              承認
            </button>
            <button
              className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 font-black"
              onClick={() => setStatus("申請を拒否しました")}
              type="button"
            >
              拒否
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {friends.map((friend) => (
            <article className="glass-panel rounded-[2rem] p-5" key={friend.id}>
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-xl font-black text-stone-950">
                  {friend.avatar}
                </span>
                <div>
                  <p className="text-xs font-black uppercase text-amber-100/65">{friend.status}</p>
                  <h2 className="text-2xl font-black">{friend.name}</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/24 p-4 text-sm font-bold text-stone-200/65">
                <p>部屋: {friend.room}</p>
                <p>現在の目標: {friend.goal}</p>
                <p>今日の一言: {friend.message}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-stone-950"
                  href="/rooms/cafe"
                >
                  一緒に参加
                </Link>
                <button
                  className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-black"
                  onClick={() =>
                    updateFriend(
                      friend.id,
                      { status: "blocked" },
                      `${friend.name}をブロックしました`
                    )
                  }
                  type="button"
                >
                  ブロック
                </button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
