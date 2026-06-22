"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";

const COMMANDS = [
  { platform: "Discord", command: "/in room:cafe", description: "指定した部屋に入室" },
  { platform: "Discord", command: "/out", description: "現在の席から退出" },
  { platform: "Discord", command: "/status", description: "現在の作業状態を確認" },
  { platform: "YouTube", command: "!in cafe", description: "チャットからCafe Roomへ入室" },
  { platform: "YouTube", command: "!out", description: "チャットから退出" },
  { platform: "YouTube", command: "!status", description: "現在の状態を確認" }
];

export default function AdminBotsPage() {
  const [discordState, setDiscordState] = useState("未接続");
  const [youtubeState, setYoutubeState] = useState("未接続");

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-6xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Bot Settings</p>
            <h1 className="mt-2 text-5xl font-black">Bot設定</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">
              MVPでは接続状態とコマンド一覧を管理できます。
            </p>
          </header>

          <section className="grid gap-5 md:grid-cols-2">
            <BotStatus
              detail="discord.js adapter 準備中"
              onTest={() => setDiscordState("接続テストOK")}
              state={discordState}
              title="Discord Bot"
            />
            <BotStatus
              detail="Live Chat API adapter 準備中"
              onTest={() => setYoutubeState("接続テストOK")}
              state={youtubeState}
              title="YouTube Bot"
            />
          </section>

          <section className="glass-panel rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">コマンド一覧</h2>
            <div className="mt-5 grid gap-3">
              {COMMANDS.map((item) => (
                <div
                  className="grid gap-3 rounded-3xl border border-white/10 bg-black/24 p-4 md:grid-cols-[120px_180px_1fr]"
                  key={`${item.platform}-${item.command}`}
                >
                  <span className="font-black text-amber-100">{item.platform}</span>
                  <code className="font-mono font-black text-stone-50">{item.command}</code>
                  <p className="text-sm font-bold text-stone-200/60">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}

function BotStatus({
  title,
  state,
  detail,
  onTest
}: {
  title: string;
  state: string;
  detail: string;
  onTest: () => void;
}) {
  return (
    <article className="glass-panel rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-black">{title}</h2>
        <span className="rounded-full border border-amber-100/20 bg-amber-100/10 px-4 py-2 text-sm font-black text-amber-100">
          {state}
        </span>
      </div>
      <p className="mt-4 text-sm font-bold text-stone-200/58">{detail}</p>
      <button
        className="mt-5 rounded-2xl border border-white/10 bg-white/8 px-5 py-3 font-black transition hover:bg-white/12"
        onClick={onTest}
        type="button"
      >
        接続テスト
      </button>
    </article>
  );
}
