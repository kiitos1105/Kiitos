"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import {
  getWeatherUiSettings,
  saveWeatherUiSettings,
  type WeatherUiSettings
} from "@/components/WeatherCities";
import { WEATHER_CITY_CONFIGS, type WeatherCityId, type WeatherItem } from "@/lib/weather";

export default function AdminWeatherPage() {
  const [settings, setSettings] = useState<WeatherUiSettings>({
    enabledCityIds: WEATHER_CITY_CONFIGS.map((city) => city.id),
    order: WEATHER_CITY_CONFIGS.map((city) => city.id),
    refreshMinutes: 5
  });
  const [weather, setWeather] = useState<WeatherItem[]>([]);
  const [status, setStatus] = useState("API状態を確認できます。");

  useEffect(() => {
    setSettings(getWeatherUiSettings());
    void refreshWeather();
  }, []);

  async function refreshWeather() {
    setStatus("Open-Meteoから取得中...");
    try {
      const response = await fetch("/api/weather", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("weather fetch failed");
      }
      setWeather((await response.json()) as WeatherItem[]);
      setStatus("API取得に成功しました。");
    } catch {
      setStatus("天気情報を取得できませんでした。画面側はフォールバック表示を使います。");
    }
  }

  function toggleCity(cityId: WeatherCityId) {
    setSettings((current) => {
      const enabled = current.enabledCityIds.includes(cityId);
      return {
        ...current,
        enabledCityIds: enabled
          ? current.enabledCityIds.filter((id) => id !== cityId)
          : [...current.enabledCityIds, cityId]
      };
    });
  }

  function move(cityId: WeatherCityId, direction: -1 | 1) {
    setSettings((current) => {
      const order = [...current.order];
      const index = order.indexOf(cityId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) {
        return current;
      }
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return { ...current, order };
    });
  }

  function save() {
    saveWeatherUiSettings(settings);
    setStatus("保存しました。表示中の天気カードへ反映されます。");
  }

  const weatherById = new Map(weather.map((item) => [item.cityId, item]));

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-6xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Weather Admin</p>
            <h1 className="mt-2 text-5xl font-black">天気設定</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">{status}</p>
          </header>

          <section className="glass-panel rounded-[2rem] p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <label className="grid gap-2 text-sm font-black text-stone-200/65">
                更新間隔
                <select
                  className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                  onChange={(event) =>
                    setSettings({ ...settings, refreshMinutes: Number(event.target.value) })
                  }
                  value={settings.refreshMinutes}
                >
                  <option value={5}>5分</option>
                  <option value={10}>10分</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 font-black"
                  onClick={() => void refreshWeather()}
                  type="button"
                >
                  手動更新
                </button>
                <button
                  className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
                  onClick={save}
                  type="button"
                >
                  天気設定を保存
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            {settings.order.map((cityId) => {
              const config = WEATHER_CITY_CONFIGS.find((city) => city.id === cityId);
              if (!config) return null;
              const item = weatherById.get(cityId);
              const enabled = settings.enabledCityIds.includes(cityId);

              return (
                <article
                  className="glass-panel grid gap-4 rounded-[2rem] p-5 lg:grid-cols-[1fr_auto_auto_auto]"
                  key={cityId}
                >
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-black">
                      <input
                        checked={enabled}
                        onChange={() => toggleCity(cityId)}
                        type="checkbox"
                      />
                      表示
                    </label>
                    <div>
                      <h2 className="text-2xl font-black">{config.city}</h2>
                      <p className="mt-1 text-sm font-bold text-stone-200/58">
                        {item
                          ? `${item.icon} ${item.weather} / ${item.temp}℃ / 降水 ${item.precipitation}mm`
                          : "未取得"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-black"
                    onClick={() => move(cityId, -1)}
                    type="button"
                  >
                    上へ
                  </button>
                  <button
                    className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-black"
                    onClick={() => move(cityId, 1)}
                    type="button"
                  >
                    下へ
                  </button>
                  <span
                    className={`rounded-2xl border px-4 py-3 text-center font-black ${
                      enabled
                        ? "border-emerald-100/25 bg-emerald-100/10 text-emerald-100"
                        : "border-white/10 bg-black/24 text-stone-400"
                    }`}
                  >
                    {enabled ? "ON" : "OFF"}
                  </span>
                </article>
              );
            })}
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}
