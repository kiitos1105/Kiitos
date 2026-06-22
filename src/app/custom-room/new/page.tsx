"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createCustomRoom,
  getCustomRoomTypeTemplate,
  getCustomRoomTypeTemplates,
  isPremiumUser,
  type CustomRoomTypeId
} from "@/lib/premium-client";

const ROOM_TYPES = getCustomRoomTypeTemplates();

export default function NewCustomRoomPage() {
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<CustomRoomTypeId>("cafe-style");
  const selectedType = getCustomRoomTypeTemplate(selectedTypeId);
  const [name, setName] = useState("My Cafe Work Room");
  const [description, setDescription] = useState(selectedType.description);
  const [theme, setTheme] = useState(selectedType.theme);
  const [backgroundImage, setBackgroundImage] = useState(selectedType.imageUrl);
  const [bgm, setBgm] = useState(selectedType.bgm);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [capacity, setCapacity] = useState(selectedType.recommendedCapacity);

  useEffect(() => {
    setPremium(isPremiumUser());
  }, []);

  function selectRoomType(typeId: CustomRoomTypeId) {
    const template = getCustomRoomTypeTemplate(typeId);
    setSelectedTypeId(typeId);
    setDescription(template.description);
    setTheme(template.theme);
    setBackgroundImage(template.imageUrl);
    setBgm(template.bgm);
    setCapacity(template.recommendedCapacity);
    setVisibility(template.visibilityHint.includes("非公開") ? "private" : "public");
  }

  function saveRoom() {
    if (!premium) {
      return;
    }

    const room = createCustomRoom({
      name,
      description,
      roomTypeId: selectedTypeId,
      theme,
      backgroundImage,
      bgm,
      visibility,
      capacity
    });
    router.push(`/custom-room/${room.id}`);
  }

  if (!premium) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cafe-950 p-6 text-stone-50">
        <div className="home-background pointer-events-none fixed inset-0 opacity-40" />
        <div className="pointer-events-none fixed inset-0 bg-black/65" />
        <section className="glass-panel relative z-10 max-w-xl rounded-[2.25rem] p-8 text-center">
          <p className="text-sm font-black uppercase text-amber-100/65">Premium Required</p>
          <h1 className="mt-3 text-5xl font-black">Custom Open RoomはPremium限定です</h1>
          <p className="mt-4 text-sm font-bold leading-6 text-stone-200/62">
            Demo Premiumを有効化すると、このブラウザですぐに部屋作成を試せます。
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
              href="/pricing"
            >
              Pricingへ
            </Link>
            <Link
              className="rounded-2xl border border-white/12 bg-white/8 px-6 py-4 font-black"
              href="/lobby"
            >
              Lobbyへ戻る
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-42" />
      <div className="pointer-events-none fixed inset-0 bg-black/64" />

      <section className="relative z-10 mx-auto grid max-w-6xl gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <p className="text-sm font-black uppercase text-amber-100/65">Premium Custom Room</p>
          <h1 className="mt-3 text-6xl font-black">カスタムルームを作成</h1>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-stone-200/62">
            ダミーデータ保存ですが、作成後は入室・座席選択・退出・編集まで操作できます。
          </p>
        </header>

        <section className="glass-panel rounded-[2rem] p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-amber-100/60">Room Type</p>
              <h2 className="mt-2 text-3xl font-black">ルームタイプ選択</h2>
            </div>
            <p className="text-sm font-bold text-stone-200/58">
              選択すると背景・座席レイアウト・BGM・初期ルールを自動セットします。
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ROOM_TYPES.map((type) => {
              const selected = selectedTypeId === type.id;

              return (
                <button
                  className={`group overflow-hidden rounded-[1.75rem] border text-left transition hover:-translate-y-1 ${
                    selected
                      ? "border-amber-100/70 bg-amber-100/14 shadow-[0_0_46px_rgba(253,230,138,0.16)]"
                      : "border-white/10 bg-black/28"
                  }`}
                  key={type.id}
                  onClick={() => selectRoomType(type.id)}
                  type="button"
                >
                  <div
                    className="h-36 bg-cover bg-center transition duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${type.imageUrl})` }}
                  />
                  <div className="grid gap-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-black">{type.name}</h3>
                      <span className="rounded-full border border-white/10 bg-black/28 px-2 py-1 text-[0.65rem] font-black text-amber-100">
                        {type.capacityGuide}
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-5 text-stone-200/62">
                      {type.description}
                    </p>
                    <div className="grid gap-1 text-[0.68rem] font-black uppercase text-stone-300/55">
                      <span>Use: {type.useCase}</span>
                      <span>BGM: {type.bgm}</span>
                      <span>{type.visibilityHint}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <form
            className="glass-panel grid gap-4 rounded-[2rem] p-6"
            onSubmit={(event) => event.preventDefault()}
          >
            <Field label="部屋名" onChange={setName} value={name} />
            <Field label="説明" onChange={setDescription} value={description} textarea />
            <Field label="テーマ" onChange={setTheme} value={theme} />
            <Field label="背景画像" onChange={setBackgroundImage} value={backgroundImage} />
            <Field label="BGM" onChange={setBgm} value={bgm} />

            <section className="rounded-[1.5rem] border border-white/10 bg-black/24 p-4">
              <p className="text-xs font-black uppercase text-amber-100/60">初期ルール</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedType.defaultRules.map((rule) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/28 px-3 py-2 text-xs font-black text-stone-100/72"
                    key={rule}
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-stone-200/65">
                公開設定
                <select
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                  onChange={(event) => setVisibility(event.target.value as "public" | "private")}
                  value={visibility}
                >
                  <option value="public">公開</option>
                  <option value="private">非公開</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-stone-200/65">
                定員
                <input
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                  max={8}
                  min={1}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                  type="number"
                  value={capacity}
                />
              </label>
            </div>

            <button
              className="mt-2 rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
              onClick={saveRoom}
              type="button"
            >
              保存して部屋を開く
            </button>
          </form>

          <aside className="glass-panel overflow-hidden rounded-[2rem]">
            <div
              className="h-72 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <div className="p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">Preview</p>
              <h2 className="mt-2 text-4xl font-black">{name}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-stone-200/62">{description}</p>
              <div className="mt-5 grid gap-2 text-sm font-black text-stone-100/75">
                <p>Type: {selectedType.name}</p>
                <p>Theme: {theme}</p>
                <p>BGM: {bgm}</p>
                <p>Invite: 作成後に自動発行</p>
                <p>
                  {visibility === "public" ? "公開" : "非公開"} / {capacity} seats
                </p>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  const className =
    "rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none";

  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      {textarea ? (
        <textarea
          className={`${className} min-h-28`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className={className}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      )}
    </label>
  );
}
