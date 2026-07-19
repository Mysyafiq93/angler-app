"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CloudRain, Droplets, Fish, LocateFixed, Search, Thermometer, Waves, Wind, Play, Pause, Layers3, BookmarkPlus, PanelRightOpen, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fishingSpots } from "@/data/mock-data";
import { getForecast, type ForecastResult } from "@/lib/forecast";
const FishingMap = dynamic(() => import("./fishing-map"), { ssr: false, loading: () => <div className="map-loading">Loading real map...</div> });

const types = ["All", "Jetty", "Kelong", "Offshore", "Freshwater", "Pond"] as const;
const mapViews = ["map", "analysis", "plans", "journal"] as const;
type MapView = (typeof mapViews)[number];

function MapSubnav({ view, onChange }: { view: MapView; onChange: (view: MapView) => void }) {
  return <nav className="map-subnav" aria-label="Map workspace views"><span className="map-brand"><Fish /> Angler</span>{mapViews.map((item) => <button className={view === item ? "active" : ""} onClick={() => onChange(item)} key={item}>{item === "map" ? "Map" : item === "analysis" ? "Analysis" : item === "plans" ? "Saved plans" : "Journal"}</button>)}</nav>;
}

function MapWorkspacePanel({ view, selected, forecast, score }: { view: Exclude<MapView, "map">; selected: typeof fishingSpots[number]; forecast: ForecastResult | null; score: number }) {
  if (view === "analysis") return <section className="map-view-panel"><div className="map-view-heading"><div><p className="eyebrow">Forecast vs actual</p><h1>Learn from every session</h1></div><span className="map-status">Live forecast</span></div><div className="analysis-compare"><div><small>Predicted score</small><strong>{score.toFixed(1)}<em>/10</em></strong><p>{forecast ? `${forecast.current.wind.toFixed(0)} km/h wind · ${forecast.current.wave.toFixed(1)} m waves` : "Waiting for forecast"}</p></div><div className="analysis-vs">VS</div><div><small>Actual result</small><strong>--</strong><p>Log your catch after the session</p></div></div><div className="map-card-grid"><article><h2>Condition breakdown</h2><p>Forecast accuracy becomes available after you log a catch from this spot.</p><div className="map-progress"><span style={{ width: `${Math.min(100, score * 10)}%` }} /></div></article><article><h2>Live catch validation</h2><p>Target species nearby</p><div className="species-row">{selected.species.map((species) => <span key={species}>{species}</span>)}</div></article></div></section>;
  if (view === "plans") return <section className="map-view-panel"><div className="map-view-heading"><div><p className="eyebrow">Saved analysis / trip plan</p><h1>Plan your next session</h1></div><button className="primary-button" type="button">Save plan</button></div><article className="plan-summary"><div><small>Location</small><strong>{selected.name}</strong><span>{selected.state} · {selected.type}</span></div><div><small>Predicted score</small><strong>{score.toFixed(1)} / 10</strong><span>Best window from live forecast</span></div><div><small>Recommended</small><strong>{selected.species[0]}</strong><span>Use the current conditions to choose technique</span></div></article><h2 className="map-section-title">Saved plans</h2><div className="saved-plan-list"><div><strong>Evening session · {selected.name}</strong><span>Very good conditions · {score.toFixed(1)}/10</span></div><div><strong>Morning bite · {selected.state}</strong><span>Review the forecast before departure</span></div></div></section>;
  return <section className="map-view-panel"><div className="map-view-heading"><div><p className="eyebrow">My journal</p><h1>Fishing history</h1></div><button className="secondary-button" type="button">Log catch</button></div><article className="journal-empty"><h2>No session logged yet</h2><p>After you fish at {selected.name}, log the result to compare the forecast with what actually happened.</p><div className="species-row">{selected.species.map((species) => <span key={species}>{species}</span>)}</div></article></section>;
}

export function SpotExplorer() {
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(fishingSpots[0].id);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [forecastError, setForecastError] = useState("");
  const [liveScores, setLiveScores] = useState<Record<string, number>>({});
  const [layer, setLayer] = useState<"catches" | "heat" | "wind" | "waves" | "current">("heat");
  const [hour, setHour] = useState(12);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<MapView>("map");
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  function selectSpot(id: string) { setForecast(null); setForecastError(""); setUserLocation(null); setSelectedId(id); setDetailsOpen(true); }
  function closeMapDetails() { setDetailsOpen(false); }
  const score = forecast?.current.score ?? liveScores[selected.id] ?? selected.score;
  const bestWindows = forecast?.hourly.slice().sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.time.localeCompare(b.time)) ?? [];
  const timelinePoint = forecast?.hourly[hour] ?? forecast?.current;
  const recommendation = timelinePoint ? (timelinePoint.wave < 0.8 && timelinePoint.wind < 10 ? "Casting / soft plastic" : timelinePoint.wave < 1.3 ? "Bottom fishing" : "Protected shore") : "Loading recommendation";
  const activityLabel = timelinePoint ? timelinePoint.score >= 8 ? "Very good" : timelinePoint.score >= 6 ? "Good" : "Caution" : "Waiting for forecast";

  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setHour((value) => (value + 1) % Math.max(1, forecast?.hourly.length ?? 24)), 1200); return () => window.clearInterval(timer); }, [playing, forecast]);

  return <><MapSubnav view={view} onChange={setView} />{view !== "map" ? <MapWorkspacePanel view={view} selected={selected} forecast={forecast} score={score} /> : <div className={`map-workspace flat-map-workspace ${detailsOpen ? "has-details" : ""}`}><section className="map-panel"><div className="map-controls"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ports, states, or species" /></label><button className="icon-button" onClick={locate} title="Use my location" aria-label="Use my location"><LocateFixed className={locating ? "spin" : ""} /></button></div><div className="filter-row" role="group" aria-label="Fishing location type">{types.map((value) => <button className={type === value ? "active" : ""} onClick={() => setType(value)} key={value}>{value}</button>)}</div><FishingMap spots={spots} selected={selected} liveScores={liveScores} userLocation={userLocation} layer={layer} onSelect={selectSpot} /><div className="map-legend"><span><i className="score-high" />8-10 Great</span><span><i className="score-mid" />6-7.9 Fair</span><span><i className="score-low" />Below 6</span></div><div className="map-intelligence"><div className="map-layer-row"><strong><Layers3 />Map layers</strong>{(["catches", "heat", "wind", "waves", "current"] as const).map((value) => <button className={layer === value ? "active" : ""} onClick={() => setLayer(value)} key={value}>{value}</button>)}</div><div className="map-timeline"><button className="icon-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause activity timeline" : "Play activity timeline"}>{playing ? <Pause /> : <Play />}</button><input type="range" min="0" max={Math.max(0, (forecast?.hourly.length ?? 24) - 1)} value={hour} onChange={(event) => setHour(Number(event.target.value))} /><strong>{timelinePoint ? new Date(timelinePoint.time).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</strong></div><div className="map-insight-grid"><span><small>Fishing activity</small><b>{timelinePoint?.score.toFixed(1) ?? "--"}/10 · {activityLabel}</b></span><span><small>Recommended</small><b>{recommendation}</b></span><span><small>Conditions</small><b>{timelinePoint ? `${timelinePoint.wind.toFixed(0)} km/h wind · ${timelinePoint.wave.toFixed(1)} m waves` : "Loading"}</b></span><Link className="secondary-button" href={`/trips?spot=${selected.id}`}><BookmarkPlus />Save plan</Link></div></div></section>{detailsOpen ? <aside className="spot-drawer surface"><button className="icon-button drawer-close" onClick={() => setDetailsOpen(false)} aria-label="Close location details"><X /></button><div className="spot-image"><Image src={selected.image} fill sizes="400px" alt={selected.name} /></div><div className="spot-content"><p className="eyebrow">{selected.type} · {selected.state}</p><h1>{selected.name}</h1><p>{selected.description}</p><div className="score-line"><strong>{score.toFixed(1)}<small>/10</small></strong><span><b>{score >= 8 ? "Great fishing" : score >= 6 ? "Fair fishing" : "Challenging"}</b><small>Fishing score</small></span></div>{forecastError ? <p className="map-forecast-error">{forecastError}</p> : <><div className="map-condition-grid"><div><Thermometer /><span><small>Temperature</small><strong>{forecast?.current.temperature.toFixed(0) ?? "--"}°C</strong></span></div><div><Wind /><span><small>Wind</small><strong>{forecast?.current.wind.toFixed(0) ?? "--"} km/h</strong></span></div><div><Waves /><span><small>Waves</small><strong>{forecast?.current.wave.toFixed(1) ?? "--"} m</strong></span></div><div><Droplets /><span><small>Humidity</small><strong>{forecast?.humidity ?? "--"}%</strong></span></div><div><CloudRain /><span><small>Rain</small><strong>{forecast?.current.rain.toFixed(0) ?? "--"} mm</strong></span></div></div><div className="bite-windows"><h2>Best bite windows</h2>{bestWindows.map((window) => <div key={window.time}><span>{new Date(window.time).toLocaleTimeString("en-MY", { hour: "numeric", minute: "2-digit" })}</span><strong>{window.score.toFixed(1)}/10</strong></div>)}</div></>}<h2 className="drawer-label">Target species</h2><div className="species-row">{selected.species.map((species) => <span key={species}>{species}</span>)}</div><Link className="primary-button" href={`/forecast?spot=${selected.id}`}>View full forecast</Link></div></aside> : <button className="map-detail-pill" onClick={() => setDetailsOpen(true)} aria-label="Open location conditions"><PanelRightOpen /><strong>{score.toFixed(1)}</strong><span>Fishing score<small>{selected.name}</small></span></button>}</div>}</>;
}
