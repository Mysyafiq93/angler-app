import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AnglerMY", template: "%s | AnglerMY" },
  description: "Malaysia's fishing community, catches, maps, forecasts, and trips.",
};

export const viewport: Viewport = { themeColor: "#071417", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
