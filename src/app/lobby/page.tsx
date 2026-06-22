"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HeaderNavigation } from "@/components/HeaderNavigation";
import { WeatherCities } from "@/components/WeatherCities";
import {
  ensureFounderBadge,
  getBadges,
  getEquippedTitle,
  getFavoriteBadges,
  getUserProfile,
  getUserBadges,
  playBadgeSound,
  type BadgeNotification
} from "@/lib/badges-client";
import { addXp, getFocusTreeSummary, getLevelProgress } from "@/lib/level-client";
import { getCurrentPlan, seedDemoCustomRooms } from "@/lib/premium-client";
import { getRoomConfig } from "@/lib/room-config";
import { formatDuration } from "@/lib/time";
import { getRotatingWeather } from "@/lib/weather";
import { getRoomDetails } from "@/lib/work-room";
import {
  GOAL_OPTIONS,
  getEngagementProfile,
  getMonthlyMvp,
  saveEngagementProfile
} from "@/lib/engagement-client";
import type { TodayGoal } from "@/lib/engagement-client";

const FOCUS_PANEL_STORAGE_KEY = "kiitos:lobby-focus-panel-open";
const DISCORD_USER_STORAGE_KEY = "kiitos:discord-demo-user";

type DiscordUser = {
  id: string;
  name: string;
  avatarUrl: string;
};

export default function LobbyPage() {
  const rooms = useMemo(() => getRoomDetails(), []);
  const [focusPanelOpen, setFocusPanelOpen] = useState(true);
  const [navPanel, setNavPanel] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premium, setPremium] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [badgeNotice, setBadgeNotice] = useState<BadgeNotification | null>(null);
  const [engagementProfile, setEngagementProfile] = useState(getEngagementProfile());
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
    setPremium(getCurrentPlan() === "premium");
    const savedDiscordUser = window.localStorage.getItem(DISCORD_USER_STORAGE_KEY);
    setDiscordUser(savedDiscordUser ? (JSON.parse(savedDiscordUser) as DiscordUser) : null);
    setEngagementProfile(getEngagementProfile());
    seedDemoCustomRooms();

    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    const syncPlan = () => setPremium(getCurrentPlan() === "premium");
    window.addEventListener("storage", syncPlan);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", syncPlan);
    };
  }, []);

  function toggleFocusPanel() {
    setFocusPanelOpen((current) => {
      const next = !current;
      window.localStorage.setItem(FOCUS_PANEL_STORAGE_KEY, next ? "open" : "closed");
      return next;
    });
  }

  function loginWithDiscordDemo() {
    const user = {
      id: "discord-demo-user",
      name: "Demo Discord",
      avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png"
    };
    window.localStorage.setItem(DISCORD_USER_STORAGE_KEY, JSON.stringify(user));
    setDiscordUser(user);
    const notice = ensureFounderBadge();
    addXp(5);
    if (notice) {
      addXp(500);
      playBadgeSound();
      setBadgeNotice(notice);
      window.setTimeout(() => setBadgeNotice(null), 5200);
    }
  }

  function logoutDiscordDemo() {
    window.localStorage.removeItem(DISCORD_USER_STORAGE_KEY);
    setDiscordUser(null);
  }

  function updateGoal(todayGoal: TodayGoal) {
    const next = { ...engagementProfile, todayGoal };
    setEngagementProfile(next);
    saveEngagementProfile(next);
  }

  function updateMessage(todayMessage: string) {
    const next = { ...engagementProfile, todayMessage };
    setEngagementProfile(next);
    saveEngagementProfile(next);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 text-stone-50">
      <LobbyBackground />
      {badgeNotice ? <LobbyBadgeToast notice={badgeNotice} /> : null}

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

          <HeaderNavigation onPanelOpen={setNavPanel} />

          <div className="flex items-center gap-3 justify-self-end">
            <button
              className="hidden rounded-full border border-white/12 bg-black/36 px-4 py-2 text-sm font-black text-stone-100/72 backdrop-blur-xl sm:block"
              onClick={() => setNavPanel("通知")}
              type="button"
            >
              🔔
            </button>
            {premium ? (
              <Link
                className="rounded-full border border-amber-100/30 bg-amber-100/14 px-4 py-2 text-sm font-black text-amber-100"
                href="/pricing"
              >
                Premium
              </Link>
            ) : null}
            <DiscordAccountButton
              onLogin={loginWithDiscordDemo}
              onLogout={logoutDiscordDemo}
              premium={premium}
              user={discordUser}
            />
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

          <section className="mx-auto grid w-full max-w-5xl gap-3 rounded-[2rem] border border-white/10 bg-black/26 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:grid-cols-[1fr_1.5fr_auto]">
            <label className="grid gap-2 text-xs font-black uppercase text-amber-100/60">
              今日の目標
              <select
                className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm font-black text-stone-50 outline-none"
                onChange={(event) => updateGoal(event.target.value as TodayGoal)}
                value={engagementProfile.todayGoal}
              >
                {GOAL_OPTIONS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase text-amber-100/60">
              今日の一言
              <input
                className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm font-bold text-stone-50 outline-none"
                onChange={(event) => updateMessage(event.target.value)}
                value={engagementProfile.todayMessage}
              />
            </label>
            <div className="rounded-2xl border border-amber-100/20 bg-amber-100/10 px-4 py-3">
              <p className="text-xs font-black uppercase text-amber-100/60">Streak</p>
              <p className="mt-1 text-lg font-black text-amber-100">
                🔥 {engagementProfile.streakDays}日連続
              </p>
            </div>
          </section>

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
              const congestion = getCongestion(room.participants.length, capacity);

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

                    <div
                      className={`mt-3 w-fit rounded-full border px-3 py-1 text-xs font-black ${congestion.className}`}
                    >
                      {congestion.label}
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

          <MonthlyMvpPanel />

          <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-amber-100/18 bg-black/26 p-4 text-center shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
            <p className="text-xs font-black uppercase tracking-normal text-amber-100/60">
              ✨ Premium
            </p>
            <h2 className="mt-2 text-2xl font-black text-amber-50 sm:text-3xl">
              Create Your Own Room
            </h2>
            <p className="mt-2 text-sm font-bold text-stone-200/58">あなただけの作業空間を作成</p>
            {premium ? (
              <Link
                className="mt-4 inline-flex rounded-full border border-amber-100/35 bg-amber-100 px-6 py-3 text-sm font-black text-stone-950 shadow-[0_0_44px_rgba(253,230,138,0.14)] transition hover:-translate-y-0.5"
                href="/custom-room/new"
              >
                ＋ Create Your Own Room
              </Link>
            ) : (
              <button
                className="mt-4 rounded-full border border-white/12 bg-black/34 px-6 py-3 text-sm font-black text-stone-100/82 backdrop-blur-xl transition hover:border-amber-100/35 hover:bg-amber-100/10"
                onClick={() => setPremiumModalOpen(true)}
                type="button"
              >
                ＋ Create Your Own Room
              </button>
            )}
          </section>
        </section>

        <footer className="lobby-footer-nav">
          {["お知らせ", "マイページ", "設定"].map((item) => (
            <button
              className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm font-black text-stone-100/78 backdrop-blur-xl"
              key={item}
              onClick={() => setActiveMenu(item)}
              type="button"
            >
              {item}
            </button>
          ))}
          <Link
            className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm font-black text-stone-100/78 backdrop-blur-xl"
            href="/ranking"
          >
            ランキング
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm font-black text-stone-100/78 backdrop-blur-xl"
            href="/friends"
          >
            フレンド
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm font-black text-stone-100/78 backdrop-blur-xl"
            href="/profile"
          >
            プロフィール
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm font-black text-stone-100/78 backdrop-blur-xl"
            href="/badges"
          >
            バッジ
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-black/28 px-5 py-3 text-sm font-black text-stone-100/78 backdrop-blur-xl"
            href="/titles"
          >
            称号
          </Link>
        </footer>
      </section>

      {navPanel ? <FeatureModal label={navPanel} onClose={() => setNavPanel(null)} /> : null}
      {premiumModalOpen ? (
        <PremiumRequiredModal onClose={() => setPremiumModalOpen(false)} />
      ) : null}
      {activeMenu ? (
        <MenuModal
          label={activeMenu}
          onClose={() => setActiveMenu(null)}
          premium={premium}
          totalFocusSeconds={totalFocusSeconds}
        />
      ) : null}
    </main>
  );
}

function MonthlyMvpPanel() {
  const mvp = getMonthlyMvp();

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-4 rounded-[2rem] border border-amber-100/20 bg-amber-100/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:grid-cols-[1fr_auto]">
      <div>
        <p className="text-xs font-black uppercase text-amber-100/65">今月のMVP</p>
        <h2 className="mt-2 text-3xl font-black">{mvp.name}</h2>
        <p className="mt-2 text-sm font-bold text-stone-200/62">
          {mvp.title} / {mvp.focusHours}時間 / {mvp.room}
        </p>
      </div>
      <Link
        className="rounded-2xl bg-amber-100 px-6 py-4 text-center font-black text-stone-950"
        href="/ranking"
      >
        ランキングを見る
      </Link>
    </section>
  );
}

function getCongestion(current: number, capacity: number) {
  const ratio = capacity > 0 ? current / capacity : 0;
  if (ratio >= 1)
    return { label: "⛔ 満席", className: "border-rose-200/50 bg-rose-300/18 text-rose-100" };
  if (ratio > 0.7)
    return { label: "🔴 混雑", className: "border-orange-200/50 bg-orange-300/18 text-orange-100" };
  if (ratio > 0.4)
    return { label: "🟡 普通", className: "border-amber-200/50 bg-amber-300/18 text-amber-100" };
  return {
    label: "🟢 空いてる",
    className: "border-emerald-200/50 bg-emerald-300/18 text-emerald-100"
  };
}

function LobbyBadgeToast({ notice }: { notice: BadgeNotification }) {
  return (
    <div className="glass-panel fixed right-5 top-5 z-50 max-w-sm rounded-[1.75rem] border-amber-100/40 p-5 shadow-[0_0_60px_rgba(253,230,138,0.22)]">
      <p className="text-xs font-black uppercase text-amber-100/70">{notice.title}</p>
      <p className="mt-2 text-lg font-black">{notice.body}</p>
    </div>
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

function DiscordAccountButton({
  user,
  premium,
  onLogin,
  onLogout
}: {
  user: DiscordUser | null;
  premium: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  if (user) {
    return (
      <button
        className="flex items-center gap-3 rounded-full border border-white/12 bg-black/38 px-3 py-2 backdrop-blur-xl"
        onClick={onLogout}
        type="button"
        title="Demoログアウト"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${user.avatarUrl})` }}
        />
        <span className="hidden font-black sm:inline">{user.name}</span>
        {premium ? (
          <span className="hidden text-xs font-black text-amber-100 sm:inline">Premium</span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      className="rounded-full border border-indigo-200/20 bg-indigo-300/12 px-4 py-3 text-sm font-black text-indigo-100 backdrop-blur-xl transition hover:bg-indigo-300/20"
      onClick={onLogin}
      type="button"
    >
      Discordでログイン
    </button>
  );
}

function FeatureModal({ label, onClose }: { label: string; onClose: () => void }) {
  const items: Record<string, { title: string; body: string }[]> = {
    Friends: [
      { title: "フレンド一覧", body: "Demo Friend: Mika / Sora / Aoi" },
      { title: "招待リンク", body: "Discord OAuth接続後、フレンド招待を送れる設計です。" }
    ],
    Stats: [
      { title: "今日の集中", body: "4:23:00" },
      { title: "週間レポート", body: "Cafe Roomでの集中が多めです。" }
    ],
    Shop: [
      { title: "Premium", body: "Custom Room作成をDemoで有効化できます。" },
      { title: "Room Theme", body: "Nordic Cafe / Night Glass / Creator Neon" }
    ],
    通知: [{ title: "通知", body: "入室、退出、アナウンス通知をここに表示します。" }]
  };
  const content = items[label] ?? [{ title: label, body: "Demoデータで操作できるパネルです。" }];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/58 p-6 backdrop-blur-xl">
      <section className="glass-panel max-w-md rounded-[2rem] p-7">
        <p className="text-sm font-black uppercase text-amber-100/60">Kiitos Panel</p>
        <h2 className="mt-3 text-4xl font-black">{label}</h2>
        <div className="mt-5 grid gap-3">
          {content.map((item) => (
            <article
              className="rounded-2xl border border-white/10 bg-black/24 p-4"
              key={item.title}
            >
              <h3 className="font-black text-amber-100">{item.title}</h3>
              <p className="mt-2 text-sm font-bold leading-6 text-stone-200/62">{item.body}</p>
            </article>
          ))}
        </div>
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

function PremiumRequiredModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/58 p-6 backdrop-blur-xl">
      <section className="glass-panel max-w-md rounded-[2rem] p-7 text-center">
        <p className="text-sm font-black uppercase text-amber-100/60">Premium Feature</p>
        <h2 className="mt-3 text-4xl font-black">Custom Open RoomはPremium限定です</h2>
        <p className="mt-4 text-sm font-bold leading-6 text-stone-200/60">
          Custom Open RoomはPremiumユーザー向けです。Demo Premiumを有効にするとすぐ使えます。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="rounded-full border border-white/10 bg-white/8 px-5 py-3 font-black"
            onClick={onClose}
            type="button"
          >
            閉じる
          </button>
          <Link
            className="rounded-full bg-amber-100 px-5 py-3 font-black text-stone-950"
            href="/pricing"
          >
            Pricingへ
          </Link>
        </div>
      </section>
    </div>
  );
}

function MenuModal({
  label,
  totalFocusSeconds,
  premium,
  onClose
}: {
  label: string;
  totalFocusSeconds: number;
  premium: boolean;
  onClose: () => void;
}) {
  const content = getMenuContent(label, totalFocusSeconds, premium);
  const favoriteBadges = getFavoriteBadges();
  const equippedTitle = getEquippedTitle();
  const profile = getUserProfile();
  const level = getLevelProgress(profile);
  const tree = getFocusTreeSummary(profile);
  const ownedBadgeIds = new Set(getUserBadges().map((badge) => badge.badge_id));
  const ownedBadges = getBadges().filter((badge) => ownedBadgeIds.has(badge.id));

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
          {label === "マイページ" ? (
            <article className="rounded-3xl border border-amber-100/20 bg-amber-100/10 p-4">
              <h3 className="text-xl font-black text-amber-100">装備中プロフィール</h3>
              <div className="mt-3 grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/24 p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-amber-100/60">
                      {equippedTitle.name}
                    </p>
                    <p className="text-4xl font-black">Lv.{level.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-100">{profile.coin} Coin</p>
                    <p className="text-xs font-bold text-stone-300/55">累計XP {profile.xp}</p>
                  </div>
                </div>
                <div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-100"
                      style={{ width: `${level.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-stone-300/55">
                    次レベルまで あと{level.toNext}XP
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-[1.5rem] border border-emerald-100/20 bg-emerald-100/10 p-4">
                <p className="text-xs font-black uppercase text-emerald-100/70">Focus Tree</p>
                <p className="mt-2 text-4xl">{tree.stage.icon}</p>
                <p className="mt-1 text-lg font-black">{tree.stage.name}</p>
                <p className="mt-1 text-xs font-bold text-stone-200/60">
                  累計集中時間 {tree.totalHours}時間 /{" "}
                  {tree.next ? `次まであと${tree.hoursToNext}時間` : "Legend Tree到達"}
                </p>
              </div>
              <p className="mt-2 text-sm font-bold text-stone-200/65">
                獲得済みバッジ: {ownedBadges.length}個
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {favoriteBadges.map((badge) => (
                  <Link
                    className="rounded-full border border-white/10 bg-black/24 px-3 py-2 text-xs font-black"
                    href="/badges"
                    key={badge.id}
                  >
                    {badge.icon} {badge.name}
                  </Link>
                ))}
                <Link
                  className="rounded-full border border-white/10 bg-black/24 px-3 py-2 text-xs font-black"
                  href="/badges"
                >
                  お気に入りバッジを選ぶ
                </Link>
                <Link
                  className="rounded-full bg-amber-100 px-3 py-2 text-xs font-black text-stone-950"
                  href="/titles"
                >
                  称号を変更
                </Link>
              </div>
              <div className="mt-4 grid max-h-44 gap-2 overflow-auto pr-1">
                {ownedBadges.map((badge) => (
                  <Link
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-black"
                    href="/badges"
                    key={badge.id}
                  >
                    <span>
                      {badge.icon} {badge.name}
                    </span>
                    <span className="text-xs text-stone-300/55">{badge.rarity}</span>
                  </Link>
                ))}
              </div>
            </article>
          ) : null}
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

function getMenuContent(label: string, totalFocusSeconds: number, premium: boolean) {
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
      {
        title: "今日の集中時間ランキング",
        body: `Lv.25 Cafe Master Mikaがトップ。みんなの合計集中時間は ${focus} です。`
      },
      {
        title: "今週の集中時間ランキング",
        body: "1位 Lv.25 Cafe Master Mika / 2位 Lv.22 Night Owl Sora / 3位 Lv.19 Bookworm Aoi"
      },
      {
        title: "部屋別ランキング",
        body: "Cafe Room と Creator Room が人気です。各参加者一覧にもLvを表示します。"
      }
    ],
    マイページ: [
      {
        title: "Discordユーザー情報",
        body: "Discord OAuth接続後、Discord IDをuser_idとして紐づけます。"
      },
      {
        title: "Premium",
        body: premium
          ? "Premium有効。Custom Open Roomを作成できます。"
          : "Free。PricingからDemo Premiumを有効化できます。"
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
