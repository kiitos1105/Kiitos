"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FALLBACK_WEATHER, WEATHER_CITY_CONFIGS, type WeatherCityId, type WeatherItem } from "@/lib/weather";

export type WeatherUiSettings = {
  enabledCityIds: WeatherCityId[];
  order: WeatherCityId[];
  refreshMinutes: number;
};

const WEATHER_SETTINGS_KEY = "kiitos:weather-ui-settings";

const DEFAULT_SETTINGS: WeatherUiSettings = {
  enabledCityIds: WEATHER_CITY_CONFIGS.map((city) => city.id),
  order: WEATHER_CITY_CONFIGS.map((city) => city.id),
  refreshMinutes: 5
};

export function getWeatherUiSettings(): WeatherUiSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(WEATHER_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<WeatherUiSettings>;
    return {
      enabledCityIds: parsed.enabledCityIds?.length
        ? parsed.enabledCityIds
        : DEFAULT_SETTINGS.enabledCityIds,
      order: parsed.order?.length ? parsed.order : DEFAULT_SETTINGS.order,
      refreshMinutes: Math.min(10, Math.max(5, Number(parsed.refreshMinutes) || 5))
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveWeatherUiSettings(settings: WeatherUiSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WEATHER_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("kiitos:weather-settings-change"));
}

export function WeatherCities({
  compact = false,
  minimal = false
}: {
  compact?: boolean;
  minimal?: boolean;
}) {
  const [settings, setSettings] = useState<WeatherUiSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<WeatherItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const loadWeather = useCallback(async () => {
    try {
      setStatus((current) => (items.length ? current : "loading"));
      const response = await fetch("/api/weather", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("weather failed");
      }
      setItems((await response.json()) as WeatherItem[]);
      setStatus("ready");
    } catch {
      setStatus("error");
      setItems((current) => (current.length ? current : FALLBACK_WEATHER));
    }
  }, [items.length]);

  useEffect(() => {
    setSettings(getWeatherUiSettings());
    void loadWeather();

    const sync = () => setSettings(getWeatherUiSettings());
    window.addEventListener("kiitos:weather-settings-change", sync);
    return () => window.removeEventListener("kiitos:weather-settings-change", sync);
  }, [loadWeather]);

  useEffect(() => {
    const intervalId = window.setInterval(loadWeather, settings.refreshMinutes * 60_000);
    return () => window.clearInterval(intervalId);
  }, [loadWeather, settings.refreshMinutes]);

  const visibleCities = useMemo(() => {
    const byId = new Map(items.map((item) => [item.cityId, item]));
    return settings.order
      .filter((cityId) => settings.enabledCityIds.includes(cityId))
      .map((cityId) => byId.get(cityId))
      .filter((item): item is WeatherItem => Boolean(item));
  }, [items, settings.enabledCityIds, settings.order]);

  return (
    <section
      className={`${compact ? "weather-cities weather-cities-compact" : "weather-cities"} ${
        minimal ? "weather-cities-minimal" : ""
      }`}
    >
      {status === "loading" ? (
        <div className="weather-city">
          <span className="text-lg text-amber-100">◌</span>
          <p className="text-xs font-black text-stone-100">Loading weather...</p>
        </div>
      ) : null}
      {status === "error" ? (
        <div className="weather-city">
          <span className="text-lg text-amber-100">!</span>
          <p className="text-xs font-black text-stone-100">天気情報を取得できませんでした</p>
        </div>
      ) : null}
      {visibleCities.map((city) => (
        <div className="weather-city" key={city.cityId}>
          <span className="text-lg text-amber-100">{city.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-stone-100">{city.city}</p>
            <p className="font-mono text-sm font-black text-amber-100">{city.temp}℃</p>
            {!minimal ? (
              <p className="truncate text-[0.65rem] font-bold text-stone-300/55">
                {city.weather} / {city.precipitation}mm
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
