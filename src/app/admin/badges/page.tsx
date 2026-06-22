"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import {
  getBadges,
  getCurrentUserId,
  getUserBadges,
  grantBadge,
  revokeBadge,
  saveBadges,
  type Badge,
  type BadgeCategory
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

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedId, setSelectedId] = useState("welcome");
  const [userQuery, setUserQuery] = useState(getCurrentUserId());
  const selected = badges.find((badge) => badge.id === selectedId) ?? badges[0];
  const owned = new Set(getUserBadges(userQuery).map((item) => item.badge_id));

  useEffect(() => {
    setBadges(getBadges());
  }, []);

  function persist(next: Badge[]) {
    setBadges(next);
    saveBadges(next);
  }

  function updateSelected(patch: Partial<Badge>) {
    persist(badges.map((badge) => (badge.id === selected.id ? { ...badge, ...patch } : badge)));
  }

  function createBadge() {
    const badge: Badge = {
      id: `custom-badge-${Date.now().toString(36)}`,
      name: "Custom Badge",
      description: "Adminで作成したDemoバッジ。",
      icon: "NEW",
      rarity: "Common",
      category: "Common",
      color: "#fde68a",
      autoGrant: false,
      conditions: "Admin manual grant",
      created_at: new Date().toISOString()
    };
    persist([badge, ...badges]);
    setSelectedId(badge.id);
  }

  function removeBadge() {
    persist(badges.filter((badge) => badge.id !== selected.id));
    setSelectedId(badges[0]?.id ?? "");
  }

  function manualGrant() {
    grantBadge(selected.id, "admin", userQuery);
    setBadges([...getBadges()]);
  }

  function manualRevoke() {
    revokeBadge(selected.id, userQuery);
    setBadges([...getBadges()]);
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-7xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Badge Admin</p>
            <h1 className="mt-2 text-5xl font-black">バッジ管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">
              作成・編集・削除・手動付与・剥奪・条件編集ができます。
            </p>
          </header>

          <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <aside className="glass-panel rounded-[2rem] p-5">
              <button
                className="mb-4 w-full rounded-2xl bg-amber-100 px-4 py-3 font-black text-stone-950"
                onClick={createBadge}
                type="button"
              >
                バッジ作成
              </button>
              <div className="grid max-h-[70vh] gap-2 overflow-auto pr-1">
                {badges.map((badge) => (
                  <button
                    className={`rounded-2xl border p-3 text-left ${selected?.id === badge.id ? "border-amber-100/50 bg-amber-100/12" : "border-white/10 bg-black/24"}`}
                    key={badge.id}
                    onClick={() => setSelectedId(badge.id)}
                    type="button"
                  >
                    <p className="font-black">{badge.name}</p>
                    <p className="mt-1 text-xs font-bold text-stone-300/50">{badge.category}</p>
                  </button>
                ))}
              </div>
            </aside>

            {selected ? (
              <section className="glass-panel grid gap-5 rounded-[2rem] p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="名前"
                    onChange={(value) => updateSelected({ name: value })}
                    value={selected.name}
                  />
                  <Field
                    label="アイコン"
                    onChange={(value) => updateSelected({ icon: value })}
                    value={selected.icon}
                  />
                  <Field
                    label="色"
                    onChange={(value) => updateSelected({ color: value })}
                    value={selected.color}
                  />
                  <label className="grid gap-2 text-sm font-black text-stone-200/65">
                    カテゴリー
                    <select
                      className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                      onChange={(event) =>
                        updateSelected({
                          category: event.target.value as BadgeCategory,
                          rarity: event.target.value as BadgeCategory
                        })
                      }
                      value={selected.category}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-black text-stone-200/65 md:col-span-2">
                    説明
                    <textarea
                      className="min-h-24 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                      onChange={(event) => updateSelected({ description: event.target.value })}
                      value={selected.description}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-black text-stone-200/65 md:col-span-2">
                    自動付与条件
                    <textarea
                      className="min-h-24 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                      onChange={(event) => updateSelected({ conditions: event.target.value })}
                      value={selected.conditions}
                    />
                  </label>
                </div>

                <label className="flex items-center gap-3 font-black">
                  <input
                    checked={selected.autoGrant}
                    onChange={(event) => updateSelected({ autoGrant: event.target.checked })}
                    type="checkbox"
                  />
                  Auto Grant
                </label>

                <section className="rounded-[1.5rem] border border-white/10 bg-black/24 p-4">
                  <h2 className="text-2xl font-black">ユーザー検索 / 手動付与</h2>
                  <input
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                    onChange={(event) => setUserQuery(event.target.value)}
                    value={userQuery}
                  />
                  <p className="mt-3 text-sm font-bold text-stone-200/60">
                    所持状態: {owned.has(selected.id) ? "所持中" : "未所持"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
                      onClick={manualGrant}
                      type="button"
                    >
                      手動付与
                    </button>
                    <button
                      className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
                      onClick={manualRevoke}
                      type="button"
                    >
                      剥奪
                    </button>
                    <button
                      className="rounded-2xl border border-rose-200/30 bg-rose-300/12 px-5 py-3 font-black text-rose-100"
                      onClick={removeBadge}
                      type="button"
                    >
                      削除
                    </button>
                  </div>
                </section>
              </section>
            ) : null}
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}
