"use client";

import { Award, Check, Compass, Fish, Heart, Images, LockKeyhole, MessageCircle, Search, ShoppingBag, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Counts = { catches: number; species: number; trophyCatch: number; likes: number; comments: number; trips: number; listings: number };
type Achievement = { key: keyof Counts; name: string; tier: string; about: string; requirement: string; target: number; Icon: LucideIcon };

const definitions: Achievement[] = [
  { key: "catches", name: "First Catch", tier: "Bronze badge", about: "Your first step in building a verified AnglerMY catch journal.", requirement: "Post 1 catch with a species name and photo.", target: 1, Icon: Fish },
  { key: "species", name: "Species Scout", tier: "Silver badge", about: "Recognises anglers who explore Malaysia's diverse freshwater and saltwater species.", requirement: "Record 5 different species. Repeating the same species counts once.", target: 5, Icon: Search },
  { key: "trophyCatch", name: "Trophy Catch", tier: "Gold trophy", about: "Awarded for documenting a memorable heavyweight catch in your journal.", requirement: "Post 1 catch weighing 5 kg or more.", target: 1, Icon: Trophy },
  { key: "catches", name: "Catch Collector", tier: "Silver badge", about: "Rewards consistent catch reporting and a growing personal fishing history.", requirement: "Publish 10 catch posts.", target: 10, Icon: Images },
  { key: "likes", name: "Community Favourite", tier: "Gold badge", about: "Shows that other anglers value the catches and stories you share.", requirement: "Receive 25 total likes across your catch posts.", target: 25, Icon: Heart },
  { key: "comments", name: "Helpful Angler", tier: "Silver badge", about: "Celebrates useful participation and support for other community members.", requirement: "Write 10 comments on community catch posts.", target: 10, Icon: MessageCircle },
  { key: "trips", name: "Trip Explorer", tier: "Gold badge", about: "For anglers who move beyond the feed and fish together with the community.", requirement: "Join 3 fishing trips through AnglerMY.", target: 3, Icon: Compass },
  { key: "listings", name: "Market Trader", tier: "Bronze badge", about: "Recognises your first contribution to the angling marketplace.", requirement: "Publish 1 active marketplace listing.", target: 1, Icon: ShoppingBag },
];

export default function AchievementsPage() {
  const [counts, setCounts] = useState<Counts>({ catches: 0, species: 0, trophyCatch: 0, likes: 0, comments: 0, trips: 0, listings: 0 });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return window.location.replace("/auth");
      const userId = data.user.id;
      const [posts, likes, comments, trips, listings] = await Promise.all([
        supabase.from("posts").select("species,weight_kg").eq("author_id", userId),
        supabase.from("likes").select("post_id,posts!inner(author_id)", { count: "exact", head: true }).eq("posts.author_id", userId),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", userId),
        supabase.from("trip_members").select("trip_id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("marketplace_listings").select("id", { count: "exact", head: true }).eq("seller_id", userId),
      ]);
      const catchRows = posts.data ?? [];
      const species = new Set(catchRows.map((post) => post.species.trim().toLowerCase()).filter(Boolean)).size;
      const trophyCatch = catchRows.some((post) => Number(post.weight_kg) >= 5) ? 1 : 0;
      setCounts({ catches: catchRows.length, species, trophyCatch, likes: likes.count ?? 0, comments: comments.count ?? 0, trips: trips.count ?? 0, listings: listings.count ?? 0 });
    });
  }, []);

  const achievements = definitions.map((item) => ({ ...item, current: counts[item.key] }));
  const unlocked = achievements.filter((item) => item.current >= item.target).length;
  const overall = Math.round(achievements.reduce((sum, item) => sum + Math.min(item.current / item.target, 1), 0) / achievements.length * 100);

  return <div className="page-container progress-page"><header className="progress-hero surface"><div className="trophy-mark"><Award /></div><div><p className="eyebrow">Angler journey</p><h1>Progress & achievements</h1><p>Build your catch journal, discover species, and contribute to the community to earn every badge.</p></div><div className="progress-score"><strong>{overall}%</strong><span>Overall progress</span></div><div className="overall-track"><i style={{ width: `${overall}%` }} /></div><p className="unlock-summary"><Trophy /> {unlocked} of {achievements.length} achievements unlocked</p></header><section className="achievement-list" aria-label="Achievement details">{achievements.map((achievement) => { const complete = achievement.current >= achievement.target; const progress = Math.min(100, Math.round((achievement.current / achievement.target) * 100)); const Icon = achievement.Icon; return <article className={`achievement-detail surface ${complete ? "complete" : ""}`} key={achievement.name}><div className="badge-medal"><Icon /><span>{complete ? <Check /> : <LockKeyhole />}</span></div><div className="achievement-body"><div className="achievement-title"><div><p>{achievement.tier}</p><h2>{achievement.name}</h2></div><strong>{complete ? "Unlocked" : `${achievement.current} / ${achievement.target}`}</strong></div><dl><div><dt>About</dt><dd>{achievement.about}</dd></div><div><dt>Requirement</dt><dd>{achievement.requirement}</dd></div></dl><div className="achievement-progress" role="progressbar" aria-label={`${achievement.name} progress`} aria-valuemin={0} aria-valuemax={achievement.target} aria-valuenow={Math.min(achievement.current, achievement.target)}><i style={{ width: `${progress}%` }} /></div><div className="progress-caption"><span>{progress}% complete</span><span>{complete ? "Badge earned" : `${achievement.target - achievement.current} remaining`}</span></div></div></article>})}</section></div>;
}
