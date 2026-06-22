"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { getFriends, getReactionLogs } from "@/lib/engagement-client";

export default function AdminSocialPage() {
  const [status, setStatus] = useState("フレンド/通報/リアクションログを確認できます");
  const friends = getFriends();
  const reactions = getReactionLogs();

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-6xl gap-6">
          <header className="glass-panel rounded-[2.5rem] p-8">
            <p className="text-sm font-black uppercase text-amber-100/65">Admin Social</p>
            <h1 className="mt-3 text-5xl font-black">フレンド/通報確認</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/60">{status}</p>
          </header>
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="glass-panel rounded-[2rem] p-5">
              <h2 className="text-2xl font-black">フレンド状態</h2>
              <div className="mt-4 grid gap-3">
                {friends.map((friend) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-black/24 p-4"
                    key={friend.id}
                  >
                    <p className="font-black">{friend.name}</p>
                    <p className="mt-1 text-sm font-bold text-stone-300/55">
                      {friend.status} / {friend.room}
                    </p>
                    <button
                      className="mt-3 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-black"
                      onClick={() => setStatus(`${friend.name}を確認しました`)}
                      type="button"
                    >
                      確認
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-5">
              <h2 className="text-2xl font-black">リアクションログ</h2>
              <div className="mt-4 grid gap-3">
                {reactions.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/24 p-4 text-sm font-bold text-stone-200/55">
                    まだリアクションはありません。
                  </p>
                ) : (
                  reactions.map((reaction) => (
                    <div
                      className="rounded-2xl border border-white/10 bg-black/24 p-4"
                      key={reaction.id}
                    >
                      <p className="font-black">{reaction.type}</p>
                      <p className="mt-1 text-sm font-bold text-stone-300/55">
                        {reaction.fromUser} → {reaction.toUser}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}
