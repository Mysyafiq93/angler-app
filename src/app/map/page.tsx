import type { Metadata } from "next";
import { SpotExplorer } from "@/components/map/spot-explorer";

export const metadata: Metadata = { title: "Fishing Map" };
export default function MapPage() { return <SpotExplorer />; }
