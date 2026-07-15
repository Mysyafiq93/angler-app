"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { CloudRain, Droplets, LocateFixed, Search, Thermometer, Waves, Wind } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fishingSpots } from "@/data/mock-data";
import { getForecast, type ForecastResult } from "@/lib/forecast";

const FishingMap = dynamic(() => import("./fishing-map"), { ssr: false, loading: () => <div className="map-loading">Loading real map...</div> });
const types = ["All", "Jetty", "Kelong", "Offshore", "Freshwater", "Pond"] as const;

export function SpotExplorer() {
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(fishingSpots[0].id);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [forecastError, setForecastError] = useState("");
  const [liveScores, setLiveScores] = useState<Record<string, number>>({});
  const spots = useMemo(() => fishingSpots.filter((spot) => (type === "All" || spot.type === type) && `${spot.name} ${spot.state} ${spot.species.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [type, query]);
  const selected = fishingSpots.find((spot) => spot.id === selectedId) ?? fishingSpots[0];

  useEffect(() => {
    let active = true;
    getForecast(selected.latitude, selected.longitude).then((result) => {
      if (!active) return;
      setForecast(result);
      setLiveScores((scores) => ({ ...scores, [selected.id]: result.current.score }));
    }).catch(() => active && setForecastError("Live conditions are temporarily unavailable."));
    return () => { active = false; };
  }, [selected]);

  function locate() {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition((position) => { setUserLocation([position.coords.latitude, position.coords.longitude]); setLocating(false); }, () => setLocating(false), { enableHighAccuracy: true, timeout: 10000 });
  }

  function selectSpot(id: string) { setForecast(null); setForecastError(""); setUserLocation(null); setSelectedId(id); }
  const score = forecast?.current.score ?? liveScores[selected.id] ?? selected.score;
  const bestWindows = forecast?.hourly.slice().sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.time.localeCompare(b.time)) ?? [];

  return <div className="map-workspace flat-map-workspace"><section className="map-panel"><div className="map-controls"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ports, states, or species" /></label><button className="icon-button" onClick={locate} title="Use my location" aria-label="Use my location"><LocateFixed className={locating ? "spin" : ""} /></button></div><div className="filter-row" role="group" aria-label="Fishing location type">{types.map((value) => <button className={type === value ? "active" : ""} onClick={() => setType(value)} key={value}>{value}</button>)}</div><FishingMap spots={spots} selected={selected} liveScores={liveScores} userLocation={userLocation} onSelect={selectSpot} /><div className="map-legend"><span><i className="score-high" />8-10 Great</span><span><i className="score-mid" />6-7.9 Fair</span><span><i className="score-low" />Below 6</span></div></section><aside className="spot-drawer surface"><div className="spot-image"><Image src={selected.image} fill sizes="400px" alt={selected.name} /><span className="live-label">Live conditions</span></div><div className="spot-content"><p className="eyebrow">{selected.type} · {selected.state}</p><h1>{selected.name}</h1><p>{selected.description}</p><div className="score-line"><strong>{score.toFixed(1)}<small>/10</small></strong><span><b>{score >= 8 ? "Great fishing" : score >= 6 ? "Fair fishing" : "Challenging"}</b><small>Current fishing score</small></span></div>{forecastError ? <p className="map-forecast-error">{forecastError}</p> : <><div className="map-condition-grid"><div><Thermometer /><span><small>Temperature</small><strong>{forecast?.current.temperature.toFixed(0) ?? "--"}°C</strong></span></div><div><Wind /><span><small>Wind</small><strong>{forecast?.current.wind.toFixed(0) ?? "--"} km/h</strong></span></div><div><Waves /><span><small>Waves</small><strong>{forecast?.current.wave.toFixed(1) ?? "--"} m</strong></span></div><div><Droplets /><span><small>Humidity</small><strong>{forecast?.humidity ?? "--"}%</strong></span></div><div><CloudRain /><span><small>Rain</small><strong>{forecast?.current.rain.toFixed(0) ?? "--"} mm</strong></span></div></div><div className="bite-windows"><h2>Best bite windows</h2>{bestWindows.map((window) => <div key={window.time}><span>{new Date(window.time).toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })}</span><strong>{window.score.toFixed(1)}/10</strong></div>)}</div></>}<h2 className="drawer-label">Target species</h2><div className="species-row">{selected.species.map((species) => <span key={species}>{species}</span>)}</div><Link className="primary-button" href={`/forecast?spot=${selected.id}`}>View full forecast</Link></div></aside></div>;
}
