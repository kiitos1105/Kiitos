import { NextResponse } from "next/server";
import { describeWeatherCode, WEATHER_CITY_CONFIGS, type WeatherItem } from "@/lib/weather";

export const dynamic = "force-dynamic";
export const revalidate = 300;

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    precipitation?: number;
    weather_code?: number;
    time?: string;
  };
};

export async function GET() {
  const latitude = WEATHER_CITY_CONFIGS.map((city) => city.latitude).join(",");
  const longitude = WEATHER_CITY_CONFIGS.map((city) => city.longitude).join(",");
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("current", "temperature_2m,precipitation,weather_code");
  url.searchParams.set("timezone", "Asia/Tokyo");

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new Error(`Open-Meteo ${response.status}`);
    }

    const data = (await response.json()) as OpenMeteoResponse | OpenMeteoResponse[];
    const locations = Array.isArray(data) ? data : [data];
    const weather: WeatherItem[] = WEATHER_CITY_CONFIGS.map((city, index) => {
      const current = locations[index]?.current;
      const code = Number(current?.weather_code ?? 0);
      const described = describeWeatherCode(code);

      return {
        city: city.city,
        cityId: city.id,
        temp: Math.round(Number(current?.temperature_2m ?? 0)),
        weather: described.weather,
        icon: described.icon,
        iconKey: described.iconKey,
        precipitation: Number(current?.precipitation ?? 0),
        updatedAt: current?.time ?? new Date().toISOString()
      };
    });

    return NextResponse.json(weather, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "天気情報を取得できませんでした",
        detail: error instanceof Error ? error.message : "Unknown weather error"
      },
      { status: 502 }
    );
  }
}
