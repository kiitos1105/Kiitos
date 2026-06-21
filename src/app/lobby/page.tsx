"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HeaderNavigation } from "@/components/HeaderNavigation";
import { WeatherCities } from "@/components/WeatherCities";
import { getRoomConfig } from "@/lib/room-config";
import { formatDuration } from "@/lib/time";
import { getRotatingWeather } from "@/lib/weather";
import { getRoomDetails } from "@/lib/work-room";

const FOCUS_PANEL_STORAGE_KEY = "kiitos:lobby-focus-panel-open";

type DiscordUser = {
  id: string;
  name: string;
  avatarUrl: string;
};

export default function LobbyPage() {
  const rooms = useMemo(() => getRoomDetails(), []);
  const [focusPanelOpen, setFocusPanelOpen] = useState(true);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [discordUser] = useState<DiscordUser | null>(null);
  const [, setTick] = useState(0);
  const now = new Date();
  const weather = getRotatingWeather(now);
  const totalParticipants = rooms.reduce((sum, room) => sum + room.participants.length, 0);
  const totalFocusSeconds = rooms.reduce(
    (roomSum, room) =>
      roomSum + room.participants.reduce((sum, participant) => sum + participant.elapsedSeconds, 0),
    0
  );
  const myFocusSeconds = 4 * 60 * 60 + 23 * 60;

  useEffect(() => {
    const saved = window.localStorage.getItem(FOCUS_PANEL_STORAGE_KEY);
    const shouldCollapseForSmallScreen = window.matchMedia("(max-width: 760px)").matches;
    setFocusPanelOpen(saved ? saved === "open" : !shouldCollapseForSmallScreen);

    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function toggleFocusPanel() {
    setFocusPanelOpen((current) => {
      const next = !current;
      window.localStorage.setItem(FOCUS_PANEL_STORAGE_KEY, next ? "open" : "closed");
      return next;
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 text-stone-50">
      <LobbyBackground />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1820px] grid-rows-[auto_1fr_auto] gap-5 px-5 py-5 lg:px-8">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link className="flex items-center gap-3 justify-self-start" href="/lobby">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-400/90 text-xl font-black text-stone-950">
              K
            </span>
            <span className="hidden text-xl font-black text-sky-100/90 sm:inline">
              Kiitos Work Room
            </span>
          </Link>

          <HeaderNavigation onComingSoon={setComingSoon} />

          <div className="flex items-center gap-3 justify-self-end">
            <button
              className="hidden rounded-full border border-white/12 bg-black/36 px-4 py-2 text-sm font-black text-stone-100/72 backdrop-blur-xl sm:block"
              onClick={() => setComingSoon("通知")}
              type="button"
            >
              🔔
            </button>
            <DiscordAccountButton user={discordUser} />
          </div>
        </header>

        <section className="relative grid min-h-0 gap-5 pt-2">
          <CollapsibleFocusPanel
            myFocusSeconds={myFocusSeconds}
            onToggle={toggleFocusPanel}
            open={focusPanelOpen}
            totalFocusSeconds={totalFocusSeconds}
            totalParticipants={totalParticipants}
          />

          <div className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-2xl italic tracking-normal text-amber-100/46">
              Find ☕ focus.
            </p>
            <h1 className="mt-1 text-[clamp(3.8rem,6vw,7.7rem)] font-black leading-none text-amber-50">
              Choose Your Room
            </h1>
            <p className="mt-4 text-lg font-semibold text-stone-100/68">
              今日の気分に合わせて、作業する場所を選ぼう。
            </p>
          </div>

          <aside className="lobby-status-cluster">
            <StatusTile icon="♪" label="BGM" value="Lo-Fi Rain" sub="soft cafe mix" />
            <StatusTile
              icon="☁"
              label={weather.area}
              value={weather.condition}
              sub={`${weather.temperature} / ${weather.note}`}
            />
            <StatusTile icon="◷" label="Time" value={formatClock(now)} sub="Japan time" />
          </aside>

          <section className="weather-strip glass-panel">
            <p className="shrink-0 text-xs font-black uppercase tracking-normal text-amber-100/60">
              Weather
            </p>
            <WeatherCities compact />
          </section>

          <section className="lobby-room-grid">
            {rooms.map((room, index) => {
              const config = getRoomConfig(room.roomId);
              const capacity = room.seats.length;
              const tags = config.mood.split(" / ").slice(0, 3);

              return (
                <Link
                  className={`lobby-room-card group ${index < 3 ? "lobby-room-card-top" : "lobby-room-card-bottom"}`}
                  href={`/rooms/${room.roomId}`}
                  key={room.roomId}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${config.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/8" />
                  <div
                    className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${config.accent.glow} to-transparent`}
                  />

                  <article className="relative z-10 flex h-full flex-col justify-end p-6">
                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-4xl font-black leading-none">{config.name}</h2>
                        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-stone-100/72">
                          {config.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/12 bg-black/40 px-4 py-2 font-mono text-sm font-black backdrop-blur-2xl">
                        <span className="mr-2 text-emerald-300">●</span>
                        {room.participants.length}/{capacity}人
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          className="rounded-full border border-white/12 bg-black/32 px-3 py-1 text-xs font-black text-stone-100/70 backdrop-blur-xl"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                </Link>
              );
            })}
          </section>
        </section>

        <footer className="lobby-footer-nav">
          {["お知らせ", "ランキング", "バッジ", "マイページ", "設定"].map((item) => (
            <button
              className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm font-black text-stone-100/78 backdrop-blur-xl"
              key={item}
              onClick={() => setActiveMenu(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </footer>
      </section>

      {comingSoon ? (
        <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />
      ) : null}
      {activeMenu ? (
        <MenuModal
          label={activeMenu}
          onClose={() => setActiveMenu(null)}
          totalFocusSeconds={totalFocusSeconds}
        />
      ) : null}
    </main>
  );
}

function CollapsibleFocusPanel({
  open,
  totalParticipants,
  totalFocusSeconds,
  myFocusSeconds,
  onToggle
}: {
  open: boolean;
  totalParticipants: number;
  totalFocusSeconds: number;
  myFocusSeconds: number;
  onToggle: () => void;
}) {
  if (!open) {
    return (
      <button
        aria-label="集中ステータスを開く"
        className="focus-panel-collapsed glass-panel"
        onClick={onToggle}
        type="button"
      >
        ☕
      </button>
    );
  }

  return (
    <aside className="focus-panel glass-panel">
      <button className="focus-panel-close" onClick={onToggle} type="button">
        −
      </button>
      <FocusMetric icon="☕" label="オンライン人数" value={`${totalParticipants}人`} delta="+12" />
      <FocusMetric
        icon="♨"
        label="今日の集中時間"
        value={`${Math.floor(totalFocusSeconds / 3600)}時間`}
      />
      <FocusMetric icon="◷" label="あなたの集中時間" value={formatDuration(myFocusSeconds)} />
      <button className="mt-2 rounded-full border border-white/12 bg-black/25 px-5 py-3 text-sm font-black text-stone-100/78">
        もっと見る →
      </button>
    </aside>
  );
}

function FocusMetric({
  icon,
  label,
  value,
  delta
}: {
  icon: string;
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-2xl border border-amber-100/22 bg-black/24 text-lg">
        {icon}
      </span>
      <div>
        <p className="text-[0.65rem] font-black text-stone-300/48">{label}</p>
        <p className="mt-1 font-mono text-2xl font-black text-amber-100">
          {value}
          {delta ? <span className="ml-3 text-xs text-emerald-300">{delta}</span> : null}
        </p>
      </div>
    </div>
  );
}

function StatusTile({
  icon,
  label,
  value,
  sub
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass-panel rounded-[1.45rem] p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl text-amber-100">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-black text-stone-100">{value}</p>
          <p className="mt-1 truncate text-xs font-bold text-stone-300/50">
            {label} · {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

function DiscordAccountButton({ user }: { user: DiscordUser | null }) {
  if (user) {
    return (
      <button
        className="flex items-center gap-3 rounded-full border border-white/12 bg-black/38 px-3 py-2 backdrop-blur-xl"
        type="button"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${user.avatarUrl})` }}
        />
        <span className="hidden font-black sm:inline">{user.name}</span>
      </button>
    );
  }

  return (
    <button
      className="rounded-full border border-indigo-200/20 bg-indigo-300/12 px-4 py-3 text-sm font-black text-indigo-100 backdrop-blur-xl transition hover:bg-indigo-300/20"
      onClick={() =>
        window.alert("Discord OAuth 専用ログインを接続予定です。メール登録は作りません。")
      }
      type="button"
    >
      Discordでログイン
    </button>
  );
}

function ComingSoonModal({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/58 p-6 backdrop-blur-xl">
      <section className="glass-panel max-w-md rounded-[2rem] p-7 text-center">
        <p className="text-sm font-black uppercase text-amber-100/60">Coming Soon</p>
        <h2 className="mt-3 text-4xl font-black">{label}</h2>
        <p className="mt-4 text-sm font-bold leading-6 text-stone-200/60">
          ここは今後のアップデートで開放します。クリックしても画面は壊れません。
        </p>
        <button
          className="mt-6 rounded-full bg-amber-100 px-6 py-3 font-black text-stone-950"
          onClick={onClose}
          type="button"
        >
          閉じる
        </button>
      </section>
    </div>
  );
}

function MenuModal({
  label,
  totalFocusSeconds,
  onClose
}: {
  label: string;
  totalFocusSeconds: number;
  onClose: () => void;
}) {
  const content = getMenuContent(label, totalFocusSeconds);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/58 p-6 backdrop-blur-xl">
      <section className="glass-panel max-h-[82vh] w-full max-w-3xl overflow-auto rounded-[2rem] p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-amber-100/60">Kiitos Menu</p>
            <h2 className="mt-3 text-4xl font-black">{label}</h2>
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 font-black"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {content.map((item) => (
            <article
              className="rounded-3xl border border-white/10 bg-black/24 p-4"
              key={item.title}
            >
              <h3 className="text-xl font-black text-amber-100">{item.title}</h3>
              <p className="mt-2 text-sm font-bold leading-6 text-stone-200/65">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function getMenuContent(label: string, totalFocusSeconds: number) {
  const focus = formatDuration(totalFocusSeconds);
  const map: Record<string, { title: string; body: string }[]> = {
    お知らせ: [
      {
        title: "アップデート情報",
        body: "座席手動調整モードとDiscord専用ログイン導線を追加しました。"
      },
      { title: "イベント告知", body: "週末にCafe Roomで朝活フォーカス会を予定しています。" },
      { title: "メンテナンス情報", body: "現在メンテナンス予定はありません。" }
    ],
    ランキング: [
      { title: "今日の集中時間ランキング", body: `みんなの合計集中時間は ${focus} です。` },
      { title: "今週の集中時間ランキング", body: "1位 Mika / 2位 Sora / 3位 Aoi" },
      { title: "部屋別ランキング", body: "Cafe Room と Creator Room が人気です。" }
    ],
    バッジ: [
      { title: "Founder Badge", body: "初期メンバーに付与される記念バッジです。" },
      { title: "Cafe Lover", body: "Cafe Roomで集中時間を積み重ねると獲得できます。" },
      { title: "Night Owl", body: "Night Roomで深夜作業を続ける人向けです。" },
      { title: "Focus Master", body: "長時間集中を達成した人に付与されます。" },
      { title: "Beta Tester", body: "Kiitos Work Roomの改善に参加した人向けです。" }
    ],
    マイページ: [
      {
        title: "Discordユーザー情報",
        body: "Discord OAuth接続後、Discord IDをuser_idとして紐づけます。"
      },
      { title: "今日の集中時間", body: "4:23:00" },
      { title: "累計集中時間", body: "128:40:00" },
      { title: "所属部屋", body: "Cafe Room / Night Room" },
      { title: "獲得バッジ", body: "Founder Badge, Cafe Lover, Beta Tester" }
    ],
    設定: [
      { title: "BGM表示", body: "ON" },
      { title: "雨アニメ", body: "OFF。ロビーでは動く線を表示しません。" },
      { title: "通知", body: "ON" },
      { title: "表示テーマ", body: "Apple × Nordic Cafe × Kiitos" },
      { title: "Admin導線", body: "右下のAdminボタンから /admin/login に移動できます。" },
      { title: "Discord連携状態", body: "未接続。メール登録は使いません。" }
    ]
  };

  return map[label] ?? [];
}

function LobbyBackground() {
  return (
    <>
      <div className="home-background pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_48%_42%,rgba(255,190,112,0.08),transparent_34%),linear-gradient(180deg,rgba(2,4,5,0.12),rgba(2,4,5,0.45))]" />
      <div className="pointer-events-none fixed inset-0 bg-black/35" />
    </>
  );
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}
