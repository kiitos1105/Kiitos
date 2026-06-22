export type WeatherCityId = "tokyo" | "osaka" | "nagoya" | "fukuoka" | "sapporo";

export type WeatherItem = {
  city: string;
  cityId: WeatherCityId;
  temp: number;
  weather: string;
  icon: string;
  iconKey: string;
  precipitation: number;
  updatedAt?: string;
};

export type WeatherCityConfig = {
  id: WeatherCityId;
  city: string;
  latitude: number;
  longitude: number;
  enabled: boolean;
};

export const WEATHER_CITY_CONFIGS: WeatherCityConfig[] = [
  { id: "tokyo", city: "東京", latitude: 35.6762, longitude: 139.6503, enabled: true },
  { id: "osaka", city: "大阪", latitude: 34.6937, longitude: 135.5023, enabled: true },
  { id: "nagoya", city: "名古屋", latitude: 35.1815, longitude: 136.9066, enabled: true },
  { id: "fukuoka", city: "福岡", latitude: 33.5902, longitude: 130.4017, enabled: true },
  { id: "sapporo", city: "札幌", latitude: 43.0618, longitude: 141.3545, enabled: true }
];

export const FALLBACK_WEATHER: WeatherItem[] = [
  {
    city: "東京",
    cityId: "tokyo",
    temp: 22,
    weather: "Light Rain",
    icon: "☔",
    iconKey: "rain",
    precipitation: 1.2
  },
  {
    city: "大阪",
    cityId: "osaka",
    temp: 24,
    weather: "Cloudy",
    icon: "☁",
    iconKey: "cloud",
    precipitation: 0
  },
  {
    city: "名古屋",
    cityId: "nagoya",
    temp: 23,
    weather: "Rain",
    icon: "☔",
    iconKey: "rain",
    precipitation: 0.8
  },
  {
    city: "福岡",
    cityId: "fukuoka",
    temp: 25,
    weather: "Clear",
    icon: "☀",
    iconKey: "clear",
    precipitation: 0
  },
  {
    city: "札幌",
    cityId: "sapporo",
    temp: 18,
    weather: "Snow",
    icon: "❄",
    iconKey: "snow",
    precipitation: 0.4
  }
];

export function describeWeatherCode(code: number) {
  if (code === 0) return { weather: "Clear", icon: "☀", iconKey: "clear" };
  if (code <= 3) return { weather: "Cloudy", icon: "☁", iconKey: "cloud" };
  if (code <= 48) return { weather: "Fog", icon: "≋", iconKey: "fog" };
  if (code <= 67) return { weather: "Rain", icon: "☔", iconKey: "rain" };
  if (code <= 77) return { weather: "Snow", icon: "❄", iconKey: "snow" };
  if (code <= 82) return { weather: "Light Rain", icon: "☔", iconKey: "rain" };
  if (code <= 86) return { weather: "Snow Shower", icon: "❄", iconKey: "snow" };
  if (code <= 99) return { weather: "Thunder", icon: "⚡", iconKey: "storm" };
  return { weather: "Unknown", icon: "◌", iconKey: "unknown" };
}

export function getRotatingWeather(now = new Date()) {
  const index = Math.floor(now.getTime() / 90_000) % FALLBACK_WEATHER.length;
  const item = FALLBACK_WEATHER[index];
  return {
    area: item.city,
    condition: item.weather,
    temperature: `${item.temp}°C`,
    icon: item.icon,
    note: item.precipitation > 0 ? `降水 ${item.precipitation}mm` : "作業日和"
  };
}

export function getMajorCityWeather() {
  return FALLBACK_WEATHER;
}
