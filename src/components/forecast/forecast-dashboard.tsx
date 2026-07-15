"use client";

import { AlertTriangle, CloudRain, Navigation, Waves, Wind } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fishingSpots } from "@/data/mock-data";
import { getForecast, type ForecastResult } from "@/lib/forecast";

export function ForecastDashboard() {
  const [spotId, setSpotId] = useState(fishingSpots[0].id);
  const [result, setResult] = useState<{ spotId: string; forecast?: ForecastResult; error?: string }>({ spotId: "" });
  const spot = fishingSpots.find((item) => item.id === spotId) ?? fishingSpots[0];

  useEffect(() => {
    let active = true;
    getForecast(spot.latitude, spot.longitude)
      .then((forecast) => { if (active) setResult({ spotId: spot.id, forecast }); })
      .catch((reason) => { if (active) setResult({ spotId: spot.id, error: reason instanceof Error ? reason.message : "Forecast unavailable" }); });
    return () => { active = false; };
  }, [spot]);
  const forecast = result.spotId === spotId ? result.forecast : undefined;
  const error = result.spotId === spotId ? result.error : undefined;
  const chartData = useMemo(() => forecast?.hourly.map((item) => ({ ...item, label: new Date(item.time).toLocaleTimeString("en-MY", { hour: "numeric" }), score: Number(item.score.toFixed(1)) })) ?? [], [forecast]);
  const best = chartData.reduce<(typeof chartData)[number] | undefined>((winner, item) => !winner || item.score > winner.score ? item : winner, undefined);

  return <div className="page-container forecast-page">
    <header className="forecast-heading"><div><p className="eyebrow">Live conditions</p><h1>Fishing forecast</h1><p>Weather and marine conditions translated into a practical fishing window.</p></div><label>Location<select value={spotId} onChange={(event) => setSpotId(event.target.value)}>{fishingSpots.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></header>
    {error && <div className="error-state"><AlertTriangle />{error}</div>}
    {!forecast && !error && <div className="loading-state">Loading live conditions...</div>}
    {forecast && <>
      <section className="forecast-overview surface"><div className="score-disc"><strong>{forecast.current.score.toFixed(1)}</strong><span>Fishing score</span></div><div><p className="eyebrow">{spot.type} · {spot.state}</p><h2>{spot.name}</h2><p>Best estimated window: <strong>{best?.label ?? "Calculating"}</strong></p></div><div className="current-temp"><strong>{forecast.current.temperature.toFixed(0)}°</strong><span>Current temperature</span></div></section>
      <section className="metric-cards"><article className="surface"><Wind /><span>Wind</span><strong>{forecast.current.wind.toFixed(0)} km/h</strong></article><article className="surface"><CloudRain /><span>Rain</span><strong>{forecast.current.rain.toFixed(0)} mm</strong></article><article className="surface"><Waves /><span>Wave</span><strong>{forecast.current.wave.toFixed(1)} m</strong></article><article className="surface"><Navigation /><span>Humidity</span><strong>{forecast.humidity}%</strong></article></section>
      <section className="chart-grid"><Chart title="Fishing score" data={chartData} dataKey="score" color="#28c76f" suffix="/10" /><Chart title="Rain probability" data={chartData} dataKey="rain" color="#4cb4e7" suffix="%" /><Chart title="Wind speed" data={chartData} dataKey="wind" color="#f3bd45" suffix=" km/h" /><Chart title="Wave height" data={chartData} dataKey="wave" color="#6ed6c0" suffix=" m" /></section>
      <section className="hourly-table surface"><div className="section-title"><h2>Hourly outlook</h2><span>Next 12 hours</span></div><div className="hourly-scroll">{chartData.slice(0, 12).map((item) => <div key={item.time}><span>{item.label}</span><strong>{item.score}</strong><small>{item.temperature.toFixed(0)}° · {item.wind.toFixed(0)} km/h</small></div>)}</div></section>
    </>}
  </div>;
}

function Chart({ title, data, dataKey, color, suffix }: { title: string; data: Record<string, string | number>[]; dataKey: string; color: string; suffix: string }) {
  return <article className="chart-card surface"><div className="section-title"><h2>{title}</h2><span>24 hours</span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.3}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1b3b40" vertical={false}/><XAxis dataKey="label" tick={{ fill: "#8fa7aa", fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: "#8fa7aa", fontSize: 11 }} axisLine={false} tickLine={false} width={34}/><Tooltip contentStyle={{ background: "#0c2024", border: "1px solid #24444a", borderRadius: 6 }} formatter={(value) => [`${value}${suffix}`, title]}/><Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#fill-${dataKey})`} strokeWidth={2}/></AreaChart></ResponsiveContainer></div></article>;
}
