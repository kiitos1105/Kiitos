import { getMajorCityWeather } from "@/lib/weather";

export function WeatherCities({ compact = false }: { compact?: boolean }) {
  const cities = getMajorCityWeather();

  return (
    <section className={compact ? "weather-cities weather-cities-compact" : "weather-cities"}>
      {cities.map((city) => (
        <div className="weather-city" key={city.area}>
          <span className="text-lg text-amber-100">{city.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-stone-100">{city.area}</p>
            <p className="font-mono text-sm font-black text-amber-100">{city.temperature}</p>
            <p className="truncate text-[0.65rem] font-bold text-stone-300/55">{city.condition}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
