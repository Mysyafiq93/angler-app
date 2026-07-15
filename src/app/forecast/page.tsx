import type { Metadata } from "next";
import { ForecastDashboard } from "@/components/forecast/forecast-dashboard";

export const metadata: Metadata = { title: "Fishing Forecast" };
export default function ForecastPage() { return <ForecastDashboard />; }
