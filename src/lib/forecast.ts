export interface ForecastPoint {
  time: string;
  temperature: number;
  rain: number;
  wind: number;
  wave: number;
  score: number;
}

export interface ForecastResult {
  current: ForecastPoint;
  hourly: ForecastPoint[];
  humidity: number;
}

export function fishingScore(rain: number, wind: number, wave: number, hour: number) {
  const primeTimeBonus = hour < 9 || hour > 17 ? 1 : 0;
  return Math.max(1, Math.min(10, 9.2 + primeTimeBonus - rain / 22 - wind / 15 - wave * 1.25));
}

export async function getForecast(latitude: number, longitude: number): Promise<ForecastResult> {
  const timezone = "Asia%2FKuala_Lumpur";
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&forecast_days=2&timezone=${timezone}`;
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&current=wave_height&hourly=wave_height&forecast_days=2&timezone=${timezone}`;
  const [weatherResponse, marineResponse] = await Promise.all([fetch(weatherUrl), fetch(marineUrl)]);
  if (!weatherResponse.ok) throw new Error("Weather forecast is unavailable");

  const weather = await weatherResponse.json();
  const marine = marineResponse.ok ? await marineResponse.json() : null;
  const hourly: ForecastPoint[] = weather.hourly.time.slice(0, 24).map((time: string, index: number) => {
    const temperature = Number(weather.hourly.temperature_2m[index] ?? 0);
    const rain = Number(weather.hourly.precipitation_probability[index] ?? 0);
    const wind = Number(weather.hourly.wind_speed_10m[index] ?? 0);
    const wave = Number(marine?.hourly?.wave_height?.[index] ?? 0);
    return { time, temperature, rain, wind, wave, score: fishingScore(rain, wind, wave, new Date(time).getHours()) };
  });
  const current = {
    time: weather.current.time,
    temperature: Number(weather.current.temperature_2m ?? 0),
    rain: Number(weather.current.precipitation ?? 0),
    wind: Number(weather.current.wind_speed_10m ?? 0),
    wave: Number(marine?.current?.wave_height ?? 0),
    score: 0,
  };
  current.score = fishingScore(current.rain, current.wind, current.wave, new Date(current.time).getHours());
  return { current, hourly, humidity: Number(weather.current.relative_humidity_2m ?? 0) };
}
