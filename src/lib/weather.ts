export type WeatherItem = {
  area: string;
  condition: string;
  temperature: string;
  note: string;
};

export const JAPAN_WEATHER: WeatherItem[] = [
  { area: "北海道", condition: "Snow Glow", temperature: "-2°C", note: "静かな雪と白い夜" },
  { area: "仙台", condition: "Cloudy", temperature: "6°C", note: "窓辺に薄い雲" },
  { area: "東京", condition: "Light Rain", temperature: "9°C", note: "雨音と暖色ライト" },
  { area: "名古屋", condition: "Clear Night", temperature: "8°C", note: "澄んだ夜風" },
  { area: "大阪", condition: "Warm Lights", temperature: "10°C", note: "街明かりが柔らかい" },
  { area: "広島", condition: "Mist", temperature: "7°C", note: "少し霞んだ集中日和" },
  { area: "福岡", condition: "Calm", temperature: "11°C", note: "穏やかな夜の空気" },
  { area: "沖縄", condition: "Breeze", temperature: "18°C", note: "ゆるい風と深夜作業" }
];

export function getRotatingWeather(now = new Date()) {
  const index = Math.floor(now.getTime() / 90_000) % JAPAN_WEATHER.length;
  return JAPAN_WEATHER[index];
}
