"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getBadges,
  getFavoriteBadges,
  getUserBadges,
  grantBadge,
  playBadgeSound,
  setFavoriteBadges,
  type Badge,
  type BadgeCategory,
  type BadgeNotification,
  type UserBadge
} from "@/lib/badges-client";

const CATEGORIES: BadgeCategory[] = [
  "Common",
  "Rare",
  "Epic",
  "Legendary",
  "Founder",
  "Premium",
  "Event",
  "Staff",
  "Secret"
];

type BadgeTab = "獲得済み" | "未獲得" | BadgeCategory;

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [activeTab, setActiveTab] = useState<BadgeTab>("獲得済み");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [favoriteBadgeIds, setFavoriteBadgeIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<BadgeNotification | null>(null);

  function refresh() {
    setBadges(getBadges());
    setUserBadges(getUserBadges());
    setFavoriteBadgeIds(getFavoriteBadges().map((badge) => badge.id));
  }

  useEffect(() => {
    refresh();
  }, []);

  const ownedBadgeIds = useMemo(
    () => new Set(userBadges.map((item) => item.badge_id)),
    [userBadges]
  );
  const userBadgeById = useMemo(
    () => new Map(userBadges.map((item) => [item.badge_id, item])),
    [userBadges]
  );
  const ownedBadges = useMemo(
    () => badges.filter((badge) => ownedBadgeIds.has(badge.id)),
    [badges, ownedBadgeIds]
  );
  const visibleBadges = useMemo(() => {
    if (activeTab === "獲得済み") {
      return ownedBadges;
    }

    if (activeTab === "未獲得") {
      return badges.filter((badge) => !ownedBadgeIds.has(badge.id));
    }

    return badges.filter((badge) => badge.category === activeTab);
  }, [activeTab, badges, ownedBadgeIds, ownedBadges]);

  function unlockBadge(badge: Badge) {
    const granted = grantBadge(badge.id, "badges-page-demo");
    refresh();
    if (granted) {
      playBadgeSound();
      setNotice({
        title: "Badge Unlocked!",
        body: `${badge.name} を獲得しました。`,
        badgeId: badge.id
      });
      window.setTimeout(() => setNotice(null), 4200);
    }
  }

  function toggleFavorite(badge: Badge) {
    if (!ownedBadgeIds.has(badge.id)) {
      return;
    }

    const next = favoriteBadgeIds.includes(badge.id)
      ? favoriteBadgeIds.filter((id) => id !== badge.id)
      : [badge.id, ...favoriteBadgeIds].slice(0, 3);
    setFavoriteBadges(next);
    setFavoriteBadgeIds(next);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-black/68" />

      {notice ? <BadgeToast notice={notice} /> : null}

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-amber-100/65">Earned Badges</p>
              <h1 className="mt-3 text-6xl font-black">獲得済みバッジ</h1>
              <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-stone-200/62">
                今まで獲得したバッジを確認できます。お気に入り3個はプロフィール上部と座席上アバター横に表示されます。
              </p>
            </div>
            <Link
              className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
              href="/lobby"
            >
              Lobbyへ
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="glass-panel rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase text-amber-100/60">Profile Badges</p>
            <h2 className="mt-2 text-3xl font-black">お気に入りバッジ</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {favoriteBadgeIds.length === 0 ? (
                <p className="text-sm font-bold text-stone-200/56">
                  獲得済みバッジから最大3つ選択できます。
                </p>
              ) : (
                favoriteBadgeIds.map((badgeId) => {
                  const badge = badges.find((item) => item.id === badgeId);
                  if (!badge) {
                    return null;
                  }

                  return (
                    <button
                      className="rounded-2xl border border-amber-100/25 bg-amber-100/12 px-4 py-3 text-sm font-black text-amber-100"
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      type="button"
                    >
                      {badge.icon} {badge.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase text-amber-100/60">Collection</p>
            <div className="mt-2 grid grid-cols-3 gap-3 text-center">
              <Metric label="獲得済み" value={`${ownedBadges.length}`} />
              <Metric label="未獲得" value={`${badges.length - ownedBadges.length}`} />
              <Metric label="Favorite" value={`${favoriteBadgeIds.length}/3`} />
            </div>
          </div>
        </section>

        <nav className="glass-panel flex gap-2 overflow-x-auto rounded-[2rem] p-3">
          {(["獲得済み", "未獲得", ...CATEGORIES] as const).map((category) => (
            <button
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                activeTab === category
                  ? "bg-amber-100 text-stone-950"
                  : "bg-black/24 text-stone-100/72"
              }`}
              key={category}
              onClick={() => setActiveTab(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </nav>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleBadges.length === 0 ? (
            <div className="glass-panel rounded-[2rem] p-6 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <h2 className="text-3xl font-black">表示できるバッジがありません</h2>
              <p className="mt-3 text-sm font-bold text-stone-200/60">
                別カテゴリーを選ぶか、未獲得タブからDemo獲得できます。
              </p>
            </div>
          ) : null}
          {visibleBadges.map((badge) => {
            const owned = ownedBadgeIds.has(badge.id);
            const favorite = favoriteBadgeIds.includes(badge.id);
            const userBadge = userBadgeById.get(badge.id);

            return (
              <article
                className={`glass-panel rounded-[2rem] p-5 transition ${
                  owned
                    ? "border-amber-100/24 opacity-100 shadow-[0_0_42px_rgba(253,230,138,0.1)]"
                    : "grayscale opacity-48"
                }`}
                key={badge.id}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setSelectedBadge(badge)}
                  type="button"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="grid h-16 w-16 place-items-center rounded-2xl text-lg font-black text-stone-950"
                      style={{ backgroundColor: owned ? badge.color : "#78716c" }}
                    >
                      {badge.icon}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-2xl font-black">{badge.name}</h2>
                      <p className="mt-1 text-xs font-black uppercase text-stone-300/50">
                        {badge.category}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-stone-200/62">
                    {badge.description}
                  </p>
                  <div className="mt-4 grid gap-2 rounded-[1.25rem] border border-white/10 bg-black/24 p-3 text-xs font-bold text-stone-200/62">
                    <p>レア度: {badge.rarity}</p>
                    {owned ? (
                      <p>取得日時: {formatGrantedAt(userBadge?.granted_at)}</p>
                    ) : (
                      <p>取得条件: {badge.conditions}</p>
                    )}
                  </div>
                </button>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-black disabled:opacity-40"
                    disabled={owned}
                    onClick={() => unlockBadge(badge)}
                    type="button"
                  >
                    {owned ? "取得済み" : "Demo獲得"}
                  </button>
                  <button
                    className={`rounded-2xl border px-3 py-2 text-sm font-black disabled:opacity-40 ${
                      favorite
                        ? "border-amber-100/50 bg-amber-100/14 text-amber-100"
                        : "border-white/10 bg-black/24"
                    }`}
                    disabled={!owned}
                    onClick={() => toggleFavorite(badge)}
                    type="button"
                  >
                    {favorite ? "お気に入り" : "代表にする"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </section>

      {selectedBadge ? (
        <BadgeDetailModal
          badge={selectedBadge}
          favorite={favoriteBadgeIds.includes(selectedBadge.id)}
          grantedAt={userBadgeById.get(selectedBadge.id)?.granted_at}
          onClose={() => setSelectedBadge(null)}
          onFavorite={() => toggleFavorite(selectedBadge)}
          onUnlock={() => unlockBadge(selectedBadge)}
          owned={ownedBadgeIds.has(selectedBadge.id)}
        />
      ) : null}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-3">
      <p className="text-[0.65rem] font-black uppercase text-stone-300/48">{label}</p>
      <p className="mt-1 text-2xl font-black text-amber-100">{value}</p>
    </div>
  );
}

function BadgeToast({ notice }: { notice: BadgeNotification }) {
  return (
    <div className="fixed right-5 top-5 z-50 glass-panel max-w-sm rounded-[1.75rem] border-amber-100/40 p-5 shadow-[0_0_60px_rgba(253,230,138,0.22)]">
      <p className="text-xs font-black uppercase text-amber-100/70">{notice.title}</p>
      <p className="mt-2 text-lg font-black">{notice.body}</p>
    </div>
  );
}

function BadgeDetailModal({
  badge,
  owned,
  favorite,
  grantedAt,
  onClose,
  onUnlock,
  onFavorite
}: {
  badge: Badge;
  owned: boolean;
  favorite: boolean;
  grantedAt?: string;
  onClose: () => void;
  onUnlock: () => void;
  onFavorite: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-6 backdrop-blur-xl">
      <section className="glass-panel w-full max-w-xl rounded-[2rem] p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className="grid h-20 w-20 place-items-center rounded-3xl text-xl font-black text-stone-950"
              style={{ backgroundColor: owned ? badge.color : "#78716c" }}
            >
              {badge.icon}
            </span>
            <div>
              <p className="text-xs font-black uppercase text-amber-100/60">{badge.category}</p>
              <h2 className="mt-1 text-4xl font-black">{badge.name}</h2>
            </div>
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 font-black"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <p className="mt-6 text-sm font-bold leading-6 text-stone-200/64">{badge.description}</p>
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/24 p-4 text-sm font-bold text-stone-200/68">
          <p>レア度: {badge.rarity}</p>
          <p className="mt-2">取得日時: {owned ? formatGrantedAt(grantedAt) : "未獲得"}</p>
          <p>条件: {badge.conditions}</p>
          <p className="mt-2">Auto Grant: {badge.autoGrant ? "ON" : "OFF"}</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950 disabled:opacity-40"
            disabled={owned}
            onClick={onUnlock}
            type="button"
          >
            {owned ? "取得済み" : "Demo獲得"}
          </button>
          <button
            className="rounded-2xl border border-white/12 bg-white/8 px-5 py-4 font-black disabled:opacity-40"
            disabled={!owned}
            onClick={onFavorite}
            type="button"
          >
            {favorite ? "お気に入り解除" : "お気に入りにする"}
          </button>
        </div>
      </section>
    </div>
  );
}

function formatGrantedAt(value?: string) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString("ja-JP");
}
