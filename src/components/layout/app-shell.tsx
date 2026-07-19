"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, CloudSun, Compass, Fish, Home, Map, ShoppingBag, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/forecast", label: "Forecast", icon: CloudSun },
  { href: "/trips", label: "Trips", icon: Compass },
  { href: "/community", label: "Community", icon: Users },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/achievements", label: "Progress", icon: Trophy },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [embedded, setEmbedded] = useState(false);
  const [account, setAccount] = useState<{ signedIn: boolean; initials: string; avatar: string | null }>({ signedIn: false, initials: "?", avatar: null });
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    setEmbedded(new URLSearchParams(window.location.search).get("embedded") === "1");
    let startY = 0;
    let triggered = false;
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? 0;
      triggered = false;
    };
    const onTouchMove = (event: TouchEvent) => {
      const top = document.scrollingElement?.scrollTop ?? window.scrollY;
      const distance = (event.touches[0]?.clientY ?? 0) - startY;
      if (!triggered && top <= 2 && distance > 90) {
        triggered = true;
        window.location.reload();
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    if (!isSupabaseConfigured()) {
      return () => {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
      };
    }
    const supabase = createClient();
    const updateAccount = async (userId?: string, email?: string, displayName?: string) => {
      if (!userId) {
        setAccount({ signedIn: false, initials: "?", avatar: null });
        document.body.dataset.profileAvatar = "";
        return;
      }
      const { data } = await supabase.from("profiles").select("display_name,avatar_path").eq("id", userId).single();
      const name: string | undefined = data?.display_name || displayName;
      const initials = (name || email || "A").split(/[\s@]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
      const avatar = data?.avatar_path ?? null;
      setAccount({ signedIn: true, initials, avatar });
      document.body.dataset.profileAvatar = avatar ?? "";
    };
    supabase.auth.getUser().then(({ data }) => updateAccount(data.user?.id, data.user?.email, data.user?.user_metadata.display_name));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAccount(session?.user.id, session?.user.email, session?.user.user_metadata.display_name);
    });
    const refreshProfile = () => supabase.auth.getUser().then(({ data }) => updateAccount(data.user?.id, data.user?.email, data.user?.user_metadata.display_name));
    window.addEventListener("anglermy-profile-updated", refreshProfile);
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("anglermy-profile-updated", refreshProfile);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className={`app-shell ${embedded ? "embedded-shell" : ""}`}>
      {!embedded && <header className="topbar">
        <Link className="brand" href="/" aria-label="AnglerMY home"><Fish aria-hidden="true" /><span>Angler<b>MY</b></span></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(({ href, label }) => <Link className={isActive(href) ? "active" : ""} href={href} key={href}>{label}</Link>)}
        </nav>
        <Link className={`icon-button profile-button ${account.avatar ? "has-avatar" : ""}`} href={account.signedIn ? "/profile" : "/auth"} title={account.signedIn ? "View profile" : "Create account or log in"} aria-label={account.signedIn ? "View profile" : "Create account or log in"}>{account.avatar ? <Image src={account.avatar} width={40} height={40} alt="Your profile" /> : account.initials}</Link>
      </header>}
      <main>{children}</main>
      {!embedded && <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.filter(({ href }) => ["/", "/map", "/forecast", "/trips", "/learn", "/market", "/achievements"].includes(href)).map(({ href, label, icon: Icon }) => (
          <Link className={isActive(href) ? "active" : ""} href={href} key={href}><Icon aria-hidden="true" /><span>{label}</span></Link>
        ))}
      </nav>}
    </div>
  );
}
