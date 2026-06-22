"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import {
  getCurrentUserId,
  getTitles,
  getUserTitles,
  grantTitle,
  revokeTitle,
  saveTitles,
  type BadgeCategory,
  type Title
} from "@/lib/badges-client";

const RARITIES: BadgeCategory[] = [
  "Common",
  "Rare",
  "Epic",
  "Legendary",
  "Founder",
  "Premium",
  "Staff"
];

export default function AdminTitlesPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [selectedId, setSelectedId] = useState("cafe-master");
  const [userQuery, setUserQuery] = useState(getCurrentUserId());
  const selected = titles.find((title) => title.id === selectedId) ?? titles[0];
  const owned = new Set(getUserTitles(userQuery).map((item) => item.title_id));

  useEffect(() => {
    setTitles(getTitles());
  }, []);

  function persist(next: Title[]) {
    setTitles(next);
    saveTitles(next);
  }

  function updateSelected(patch: Partial<Title>) {
    persist(titles.map((title) => (title.id === selected.id ? { ...title, ...patch } : title)));
  }

  function createTitle() {
    const title: Title = {
      id: `custom-title-${Date.now().toString(36)}`,
      name: "Custom Title",
      description: "Adminで作成したDemo称号。",
      rarity: "Rare",
      autoGrant: false,
      conditions: "Admin manual grant",
      created_at: new Date().toISOString()
    };
    persist([title, ...titles]);
    setSelectedId(title.id);
  }

  function removeTitle() {
    persist(titles.filter((title) => title.id !== selected.id));
    setSelectedId(titles[0]?.id ?? "");
  }

  function manualGrant() {
    grantTitle(selected.id, "admin", userQuery);
    setTitles([...getTitles()]);
  }

  function manualRevoke() {
    revokeTitle(selected.id, userQuery);
    setTitles([...getTitles()]);
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-7xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Title Admin</p>
            <h1 className="mt-2 text-5xl font-black">称号管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">
              作成・編集・削除・手動付与・剥奪・自動解放条件編集ができます。
            </p>
          </header>

          <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <aside className="glass-panel rounded-[2rem] p-5">
              <button
                className="mb-4 w-full rounded-2xl bg-amber-100 px-4 py-3 font-black text-stone-950"
                onClick={createTitle}
                type="button"
              >
                称号作成
              </button>
              <div className="grid gap-2">
                {titles.map((title) => (
                  <button
                    className={`rounded-2xl border p-3 text-left ${selected?.id === title.id ? "border-amber-100/50 bg-amber-100/12" : "border-white/10 bg-black/24"}`}
                    key={title.id}
                    onClick={() => setSelectedId(title.id)}
                    type="button"
                  >
                    <p className="font-black">{title.name}</p>
                    <p className="mt-1 text-xs font-bold text-stone-300/50">{title.rarity}</p>
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
                  <label className="grid gap-2 text-sm font-black text-stone-200/65">
                    レアリティ
                    <select
                      className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                      onChange={(event) =>
                        updateSelected({ rarity: event.target.value as BadgeCategory })
                      }
                      value={selected.rarity}
                    >
                      {RARITIES.map((rarity) => (
                        <option key={rarity} value={rarity}>
                          {rarity}
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
                    自動解放条件
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
                      onClick={removeTitle}
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
