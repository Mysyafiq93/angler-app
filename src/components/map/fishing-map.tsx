"use client";

import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { FishingSpot } from "@/types/domain";

function MapFocus({ selected, userLocation }: { selected: FishingSpot; userLocation: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(userLocation ?? [selected.latitude, selected.longitude], userLocation ? 12 : 11, { duration: 0.8 });
  }, [map, selected, userLocation]);
  return null;
}

function scoreMarker(score: number, active: boolean) {
  return L.divIcon({ className: "fishing-map-marker-wrap", html: `<span class="fishing-map-marker${active ? " active" : ""}"><b>${score.toFixed(1)}</b><small>FISH</small></span>`, iconSize: [48, 58], iconAnchor: [24, 56], popupAnchor: [0, -50] });
}

export default function FishingMap({ spots, selected, liveScores, userLocation, onSelect }: { spots: FishingSpot[]; selected: FishingSpot; liveScores: Record<string, number>; userLocation: [number, number] | null; onSelect: (id: string) => void }) {
  return <MapContainer className="real-map" center={[selected.latitude, selected.longitude]} zoom={10} zoomControl attributionControl>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <MapFocus selected={selected} userLocation={userLocation} />
    {spots.map((spot) => <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={scoreMarker(liveScores[spot.id] ?? spot.score, selected.id === spot.id)} eventHandlers={{ click: () => onSelect(spot.id) }}><Popup><strong>{spot.name}</strong><br />{spot.type} · {spot.state}<br />Fishing score: {(liveScores[spot.id] ?? spot.score).toFixed(1)}/10</Popup></Marker>)}
    {userLocation && <CircleMarker center={userLocation} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#177ea8", fillOpacity: 1 }}><Popup>Your current location</Popup></CircleMarker>}
  </MapContainer>;
}
