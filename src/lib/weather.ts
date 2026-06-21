export type WeatherItem = {
  area: string;
  condition: string;
  temperature: string;
  icon: string;
  note: string;
};

export const JAPAN_WEATHER: WeatherItem[] = [
  {
    area: "北海道",
    condition: "Snow Glow",
    temperature: "-2°C",
    icon: "❄",
    note: "静かな雪と白い夜"
  },
  { area: "仙台", condition: "Cloudy", temperature: "6°C", icon: "☁", note: "窓辺に薄い雲" },
  {
    area: "東京",
    condition: "Light Rain",
    temperature: "22°C",
    icon: "☂",
    note: "雨音と暖色ライト"
  },
  { area: "名古屋", condition: "Rain", temperature: "23°C", icon: "☔", note: "しっとり集中" },
  { area: "大阪", condition: "Cloudy", temperature: "24°C", icon: "☁", note: "街明かりが柔らかい" },
  { area: "広島", condition: "Mist", temperature: "7°C", icon: "≋", note: "少し霞んだ集中日和" },
  { area: "福岡", condition: "Sunny", temperature: "25°C", icon: "☀", note: "穏やかな夜の空気" },
  { area: "沖縄", condition: "Breeze", temperature: "18°C", icon: "◌", note: "ゆるい風と深夜作業" }
];

export const MAJOR_CITY_WEATHER: WeatherItem[] = [
  { area: "東京", condition: "晴れ", temperature: "22°C", icon: "☀", note: "作業日和" },
  { area: "大阪", condition: "曇り", temperature: "24°C", icon: "☁", note: "落ち着いた夜" },
  { area: "名古屋", condition: "雨", temperature: "23°C", icon: "☂", note: "雨音集中" },
  { area: "福岡", condition: "晴れ", temperature: "25°C", icon: "☀", note: "軽い夜風" },
  { area: "札幌", condition: "雪", temperature: "18°C", icon: "❄", note: "静かな空気" }
];

export function getRotatingWeather(now = new Date()) {
  const index = Math.floor(now.getTime() / 90_000) % JAPAN_WEATHER.length;
  return JAPAN_WEATHER[index];
}

export function getMajorCityWeather() {
  return MAJOR_CITY_WEATHER;
}
