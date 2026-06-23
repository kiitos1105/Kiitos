"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import type { PointerEvent } from "react";
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
  saveUserProfile,
  type BadgeNotification
} from "@/lib/badges-client";
import { addXp, getFocusTreeSummary, getLevelProgress } from "@/lib/level-client";
import { hasCustomRoomAccess, seedDemoCustomRooms } from "@/lib/premium-client";
import { getRoomConfig } from "@/lib/room-config";
import { formatDuration } from "@/lib/time";
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
  const { data: session, status: authStatus } = useSession();
  const [rooms, setRooms] = useState(() => getRoomDetails());
  const [focusPanelOpen, setFocusPanelOpen] = useState(true);
  const [navPanel, setNavPanel] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [customRoomAccess, setCustomRoomAccessState] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [badgeNotice, setBadgeNotice] = useState<BadgeNotification | null>(null);
  const [engagementProfile, setEngagementProfile] = useState(getEngagementProfile());
  const totalParticipants = rooms.reduce((sum, room) => sum + room.participants.length, 0);
  const totalFocusSeconds = rooms.reduce(
    (roomSum, room) =>
      roomSum + room.participants.reduce((sum, participant) => sum + participant.elapsedSeconds, 0),
    0
  );
  const myFocusSeconds = 4 * 60 * 60 + 23 * 60;
  const sessionUser = useMemo(
    () =>
      session?.user?.id && session.user.name
        ? {
            id: session.user.id,
            name: session.user.name,
            avatarUrl: session.user.image ?? "https://cdn.discordapp.com/embed/avatars/0.png"
          }
        : null,
    [session?.user?.id, session?.user?.image, session?.user?.name]
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(FOCUS_PANEL_STORAGE_KEY);
    setFocusPanelOpen(saved ? saved === "open" : false);
    setCustomRoomAccessState(hasCustomRoomAccess());
    const savedDiscordUser = window.localStorage.getItem(DISCORD_USER_STORAGE_KEY);
    setDiscordUser(savedDiscordUser ? (JSON.parse(savedDiscordUser) as DiscordUser) : null);
    setEngagementProfile(getEngagementProfile());
    seedDemoCustomRooms();

    const syncPlan = () => {
      setCustomRoomAccessState(hasCustomRoomAccess());
    };
    const syncRooms = () => setRooms(getRoomDetails());
    window.addEventListener("storage", syncPlan);
    window.addEventListener("storage", syncRooms);
    window.addEventListener("kiitos:admin-users-change", syncRooms);

    return () => {
      window.removeEventListener("storage", syncPlan);
      window.removeEventListener("storage", syncRooms);
      window.removeEventListener("kiitos:admin-users-change", syncRooms);
    };
  }, []);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    window.localStorage.setItem(DISCORD_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    setDiscordUser(sessionUser);
    saveUserProfile({
      ...getUserProfile(),
      user_id: sessionUser.id,
      avatar_url: sessionUser.avatarUrl
    });
    const notice = ensureFounderBadge();
    addXp(5);
    if (notice) {
      addXp(500);
      playBadgeSound();
      setBadgeNotice(notice);
      window.setTimeout(() => setBadgeNotice(null), 5200);
    }
  }, [session?.user?.id, session?.user?.image, session?.user?.name, sessionUser]);

  function toggleFocusPanel() {
    setFocusPanelOpen((current) => {
      const next = !current;
      window.localStorage.setItem(FOCUS_PANEL_STORAGE_KEY, next ? "open" : "closed");
      return next;
    });
  }

  async function loginWithDiscord() {
    try {
      const response = await fetch("/api/auth/providers", { cache: "no-store" });
      const providers = response.ok ? ((await response.json()) as Record<string, unknown>) : {};
      if (!providers.discord) {
        window.location.href = "/auth/error?error=DiscordConfigMissing";
        return;
      }
      await signIn("discord", { callbackUrl: "/lobby", redirectTo: "/lobby" });
    } catch {
      window.location.href = "/auth/error?error=DiscordConfigMissing";
    }
  }

  function logoutDiscord() {
    window.localStorage.removeItem(DISCORD_USER_STORAGE_KEY);
    setDiscordUser(null);
    void signOut({ callbackUrl: "/lobby", redirectTo: "/lobby" });
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

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1680px] grid-rows-[auto_1fr_auto] gap-8 px-5 py-6 sm:px-7 lg:px-10 xl:px-12">
        <header className="lobby-header">
          <Link className="lobby-logo" href="/lobby">
            <span className="lobby-logo-mark">K</span>
            <span className="grid leading-none">
              <span className="text-sm font-black text-stone-50 sm:text-base">
                Kiitos Work Room
              </span>
              <span className="hidden text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-100/45 sm:block">
                Nordic focus lobby
              </span>
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
            <DiscordAccountButton
              loading={authStatus === "loading"}
              onLogin={loginWithDiscord}
              onLogout={logoutDiscord}
              user={sessionUser ?? discordUser}
            />
          </div>
        </header>

        <section className="relative grid min-h-0 gap-7 pt-1">
          <CollapsibleFocusPanel
            myFocusSeconds={myFocusSeconds}
            onToggle={toggleFocusPanel}
            open={focusPanelOpen}
            totalFocusSeconds={totalFocusSeconds}
            totalParticipants={totalParticipants}
          />

          <div className="mx-auto max-w-3xl pt-6 text-center lg:pt-8">
            <p className="font-serif text-lg italic tracking-normal text-amber-100/46 sm:text-xl">
              Find ☕ focus.
            </p>
            <h1 className="mt-3 text-[clamp(2.9rem,4.4vw,5.15rem)] font-black leading-[0.95] text-amber-50">
              Choose Your Room
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base font-semibold text-stone-100/66 sm:text-lg">
              今日の気分に合わせて、作業する場所を選ぼう。
            </p>
          </div>

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

                  <article className="lobby-room-content relative z-10 flex h-full flex-col justify-end p-6">
                    <div className="lobby-room-main flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-[2rem] font-black leading-none">
                          {config.name}
                        </h2>
                        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-stone-100/72">
                          {config.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-white/12 bg-black/40 px-4 py-2 font-mono text-sm font-black backdrop-blur-2xl">
                        <span className="mr-2 text-emerald-300">●</span>
                        {room.participants.length}/{capacity}人
                      </span>
                    </div>

                    <div className="mt-4 flex min-h-[2rem] flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${congestion.className}`}
                      >
                        {congestion.label}
                      </span>
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

          <section className="lobby-secondary-grid">
            <section className="lobby-intent-panel grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/26 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:grid-cols-[1fr_1fr_auto]">
              <label className="grid gap-2 text-xs font-black uppercase text-amber-100/60">
                今日の目標
                <select
                  className="h-12 rounded-2xl border border-white/10 bg-black/45 px-4 text-sm font-black text-stone-50 outline-none"
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
                  className="h-12 rounded-2xl border border-white/10 bg-black/45 px-4 text-sm font-bold text-stone-50 outline-none"
                  onChange={(event) => updateMessage(event.target.value)}
                  value={engagementProfile.todayMessage}
                />
              </label>
              <div className="grid h-full min-h-[4.75rem] content-center rounded-2xl border border-amber-100/20 bg-amber-100/10 px-4 py-3">
                <p className="text-xs font-black uppercase text-amber-100/60">Streak</p>
                <p className="mt-1 text-lg font-black text-amber-100">
                  🔥 {engagementProfile.streakDays}日連続
                </p>
              </div>
            </section>

            <section className="lobby-weather-grid">
              <WeatherCities compact minimal />
            </section>
          </section>

          <MonthlyMvpPanel />

          <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-amber-100/18 bg-black/26 p-4 text-center shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
            <p className="text-xs font-black uppercase tracking-normal text-amber-100/60">
              ✨ Custom Room
            </p>
            <h2 className="mt-2 text-2xl font-black text-amber-50 sm:text-3xl">
              Create Your Focus Room
            </h2>
            <p className="mt-2 text-sm font-bold text-stone-200/58">
              β版ではPrivate Roomを1日1回作成できます。Custom Open Roomは管理者許可制です。
            </p>
            {customRoomAccess ? (
              <Link
                className="mt-4 inline-flex rounded-full border border-amber-100/35 bg-amber-100 px-6 py-3 text-sm font-black text-stone-950 shadow-[0_0_44px_rgba(253,230,138,0.14)] transition hover:-translate-y-0.5"
                href="/custom-room/new"
              >
                ＋ Custom / Private Room
              </Link>
            ) : (
              <Link
                className="mt-4 rounded-full border border-white/12 bg-black/34 px-6 py-3 text-sm font-black text-stone-100/82 backdrop-blur-xl transition hover:border-amber-100/35 hover:bg-amber-100/10"
                href="/custom-room/new"
              >
                ＋ Private Room
              </Link>
            )}
          </section>

          <LivePreviewDock />
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

function LivePreviewDock() {
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setPosition((current) => ({
      x: Math.max(12, current.x - event.movementX),
      y: Math.max(12, current.y - event.movementY)
    }));
  }

  function endDrag() {
    setDragging(false);
  }

  return (
    <aside
      className="live-preview-dock glass-panel"
      onPointerDown={startDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      style={{ right: position.x, bottom: position.y }}
    >
      <div className="live-preview-screen">
        <span className="live-preview-pulse" />
        <span className="text-xs font-black uppercase tracking-[0.18em] text-white/72">Live</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-amber-50">Kiitos Room Cam</p>
        <p className="mt-1 truncate text-[0.68rem] font-bold text-stone-300/55">
          Drag to move
        </p>
      </div>
    </aside>
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
        Stats
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

function DiscordAccountButton({
  user,
  loading,
  onLogin,
  onLogout
}: {
  user: DiscordUser | null;
  loading: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  if (user) {
    return (
      <button
        className="flex items-center gap-3 rounded-full border border-white/12 bg-black/38 px-3 py-2 backdrop-blur-xl"
        onClick={onLogout}
        type="button"
        title="ログアウト"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${user.avatarUrl})` }}
        />
        <span className="hidden min-w-0 text-left sm:grid">
          <span className="max-w-[8.5rem] truncate text-sm font-black text-stone-50">
            {user.name}
          </span>
          <span className="mt-0.5 text-[0.65rem] font-black uppercase tracking-[0.12em] text-emerald-100/78">
            Beta Tester
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      className="rounded-full border border-indigo-200/20 bg-indigo-300/12 px-4 py-3 text-sm font-black text-indigo-100 backdrop-blur-xl transition hover:bg-indigo-300/20"
      disabled={loading}
      onClick={onLogin}
      type="button"
    >
      {loading ? "確認中..." : "Discordでログイン"}
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
      { title: "Room Theme", body: "Nordic Cafe / Night Glass / Creator Neon" },
      { title: "Beta Items", body: "β版では家具・背景・BGMの検証アイテムを無料で試せる設計です。" }
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
        title: "Beta Tester",
        body: "β版メンバーとして利用中です。Custom Open Roomは管理者が検証対象者へ許可できます。"
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
