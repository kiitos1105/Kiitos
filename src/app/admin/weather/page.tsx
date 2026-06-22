"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { MAJOR_CITY_WEATHER } from "@/lib/weather";

type WeatherForm = {
  area: string;
  condition: string;
  temperature: string;
  icon: string;
  enabled: boolean;
};

export default function AdminWeatherPage() {
  const [items, setItems] = useState<WeatherForm[]>(
    MAJOR_CITY_WEATHER.map((item) => ({ ...item, enabled: true }))
  );
  const [status, setStatus] = useState("5都市の天気ダミーデータを編集できます。");

  function update(index: number, patch: Partial<WeatherForm>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-6xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Weather Admin</p>
            <h1 className="mt-2 text-5xl font-black">天気設定</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">{status}</p>
          </header>

          <section className="grid gap-4">
            {items.map((item, index) => (
              <article
                className="glass-panel grid gap-4 rounded-[2rem] p-5 lg:grid-cols-[120px_1fr_1fr_100px_120px]"
                key={item.area}
              >
                <label className="flex items-center gap-2 text-sm font-black">
                  <input
                    checked={item.enabled}
                    onChange={(event) => update(index, { enabled: event.target.checked })}
                    type="checkbox"
                  />
                  {item.area}
                </label>
                <Field
                  label="天気"
                  onChange={(value) => update(index, { condition: value })}
                  value={item.condition}
                />
                <Field
                  label="気温"
                  onChange={(value) => update(index, { temperature: value })}
                  value={item.temperature}
                />
                <Field
                  label="アイコン"
                  onChange={(value) => update(index, { icon: value })}
                  value={item.icon}
                />
                <div className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
                  <p className="text-xs font-black text-stone-300/45">Preview</p>
                  <p className="mt-1 text-lg font-black text-amber-100">
                    {item.enabled ? `${item.icon} ${item.condition} ${item.temperature}` : "OFF"}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <button
            className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
            onClick={() =>
              setStatus("保存しました。MVPでは画面内のダミー設定として保持しています。")
            }
            type="button"
          >
            天気設定を保存
          </button>
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
