"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  equipTitle,
  getEquippedTitle,
  getTitles,
  getUserTitles,
  grantTitle,
  type Title
} from "@/lib/badges-client";

export default function TitlesPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [ownedTitleIds, setOwnedTitleIds] = useState<Set<string>>(new Set());
  const [equippedTitleId, setEquippedTitleId] = useState("cafe-master");
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [query, setQuery] = useState("");

  function refresh() {
    setTitles(getTitles());
    setOwnedTitleIds(new Set(getUserTitles().map((item) => item.title_id)));
    setEquippedTitleId(getEquippedTitle().id);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredTitles = useMemo(
    () => titles.filter((title) => title.name.toLowerCase().includes(query.toLowerCase())),
    [query, titles]
  );

  function unlock(title: Title) {
    grantTitle(title.id, "titles-page-demo");
    refresh();
  }

  function equip(title: Title) {
    if (!ownedTitleIds.has(title.id)) {
      return;
    }

    equipTitle(title.id);
    setEquippedTitleId(title.id);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-black/70" />

      <section className="relative z-10 mx-auto grid max-w-6xl gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-amber-100/65">Title Collection</p>
              <h1 className="mt-3 text-6xl font-black">Titles / 称号</h1>
              <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-stone-200/62">
                獲得済み称号から1つを装備できます。席では名前の上に表示されます。
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

        <section className="glass-panel grid gap-4 rounded-[2rem] p-5 md:grid-cols-[1fr_auto]">
          <input
            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-bold text-stone-50 outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="称号を検索"
            value={query}
          />
          <div className="rounded-2xl border border-amber-100/20 bg-amber-100/10 px-5 py-3 font-black text-amber-100">
            装備中: {titles.find((title) => title.id === equippedTitleId)?.name ?? "なし"}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTitles.map((title) => {
            const owned = ownedTitleIds.has(title.id);
            const equipped = equippedTitleId === title.id;

            return (
              <article
                className={`glass-panel rounded-[2rem] p-5 transition ${owned ? "opacity-100" : "grayscale opacity-50"}`}
                key={title.id}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setSelectedTitle(title)}
                  type="button"
                >
                  <p className="text-xs font-black uppercase text-amber-100/60">{title.rarity}</p>
                  <h2 className="mt-2 text-3xl font-black">{title.name}</h2>
                  <p className="mt-3 text-sm font-bold leading-6 text-stone-200/62">
                    {title.description}
                  </p>
                </button>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-black disabled:opacity-40"
                    disabled={owned}
                    onClick={() => unlock(title)}
                    type="button"
                  >
                    {owned ? "解放済み" : "Demo解放"}
                  </button>
                  <button
                    className={`rounded-2xl border px-3 py-2 text-sm font-black disabled:opacity-40 ${
                      equipped
                        ? "border-amber-100/50 bg-amber-100/14 text-amber-100"
                        : "border-white/10 bg-black/24"
                    }`}
                    disabled={!owned}
                    onClick={() => equip(title)}
                    type="button"
                  >
                    {equipped ? "装備中" : "装備する"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </section>

      {selectedTitle ? (
        <TitleModal
          equipped={equippedTitleId === selectedTitle.id}
          onClose={() => setSelectedTitle(null)}
          onEquip={() => equip(selectedTitle)}
          onUnlock={() => unlock(selectedTitle)}
          owned={ownedTitleIds.has(selectedTitle.id)}
          title={selectedTitle}
        />
      ) : null}
    </main>
  );
}

function TitleModal({
  title,
  owned,
  equipped,
  onClose,
  onUnlock,
  onEquip
}: {
  title: Title;
  owned: boolean;
  equipped: boolean;
  onClose: () => void;
  onUnlock: () => void;
  onEquip: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-6 backdrop-blur-xl">
      <section className="glass-panel w-full max-w-lg rounded-[2rem] p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-amber-100/60">{title.rarity}</p>
            <h2 className="mt-2 text-4xl font-black">{title.name}</h2>
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/8 px-4 py-2 font-black"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <p className="mt-5 text-sm font-bold leading-6 text-stone-200/64">{title.description}</p>
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/24 p-4 text-sm font-bold text-stone-200/68">
          <p>条件: {title.conditions}</p>
          <p className="mt-2">Auto Grant: {title.autoGrant ? "ON" : "OFF"}</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950 disabled:opacity-40"
            disabled={owned}
            onClick={onUnlock}
            type="button"
          >
            {owned ? "解放済み" : "Demo解放"}
          </button>
          <button
            className="rounded-2xl border border-white/12 bg-white/8 px-5 py-4 font-black disabled:opacity-40"
            disabled={!owned}
            onClick={onEquip}
            type="button"
          >
            {equipped ? "装備中" : "装備する"}
          </button>
        </div>
      </section>
    </div>
  );
}
