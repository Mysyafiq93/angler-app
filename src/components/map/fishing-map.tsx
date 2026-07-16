"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { FishingSpot } from "@/types/domain";

export default function FishingMap({ spots, selected, liveScores, userLocation, onSelect }: { spots: FishingSpot[]; selected: FishingSpot; liveScores: Record<string, number>; userLocation: [number, number] | null; layer?: string; onSelect: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: ref.current, style: "https://tiles.openfreemap.org/styles/liberty", center: [selected.longitude, selected.latitude], zoom: 10.5 });
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [selected.latitude, selected.longitude]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = spots.map((spot) => {
      const score = liveScores[spot.id] ?? spot.score;
      const element = document.createElement("button");
      element.className = `gl-fishing-marker ${selected.id === spot.id ? "active" : ""}`;
      element.type = "button";
      element.innerHTML = `<span>🐟</span><strong>${score.toFixed(1)}</strong>`;
      element.setAttribute("aria-label", `${spot.name}, fishing score ${score.toFixed(1)}`);
      element.onclick = () => onSelect(spot.id);
      return new maplibregl.Marker({ element }).setLngLat([spot.longitude, spot.latitude]).setPopup(new maplibregl.Popup({ offset: 28 }).setHTML(`<strong>${spot.name}</strong><br>${spot.type} · ${spot.state}<br>Fishing score: ${score.toFixed(1)}/10`)).addTo(map);
    });
  }, [spots, selected.id, liveScores, onSelect]);
  useEffect(() => { const map = mapRef.current; if (!map) return; const center = userLocation ?? [selected.longitude, selected.latitude] as [number, number]; map.flyTo({ center, zoom: userLocation ? 12 : 10.5, duration: 700 }); }, [selected, userLocation]);
  return <div ref={ref} className="real-map" aria-label="Interactive fishing activity map" />;
}
