"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Camera, Check, Fish, LoaderCircle, LogOut, MapPin, Ruler, Search, Target, Trophy } from "lucide-react";
import { currentAngler, initialPosts } from "@/data/mock-data";
import { CatchCard } from "@/components/feed/catch-card";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState(currentAngler);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");
  const [stats, setStats] = useState({ catches: 0, followers: 0, following: 0, trips: 0, likes: 0, comments: 0, listings: 0, species: 0, heaviest: 0 });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return window.location.replace("/auth");
      const userId = data.user.id;
      const [profileResult, catchesResult, followersResult, followingResult, tripsResult, commentsResult, listingsResult, likesResult] = await Promise.all([
        supabase.from("profiles").select("id,display_name,username,location,bio,avatar_path").eq("id", userId).single(),
        supabase.from("posts").select("species,weight_kg").eq("author_id", userId),
        supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", userId),
        supabase.from("trip_members").select("trip_id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", userId),
        supabase.from("marketplace_listings").select("id", { count: "exact", head: true }).eq("seller_id", userId),
        supabase.from("likes").select("post_id,posts!inner(author_id)", { count: "exact", head: true }).eq("posts.author_id", userId),
      ]);
      const row = profileResult.data;
      if (row) setProfile({ id: row.id, name: row.display_name, handle: `@${row.username}`, location: row.location ?? "Malaysia", avatar: row.avatar_path || currentAngler.avatar, level: "Community Angler" });
      const catchRows = catchesResult.data ?? [];
      const species = new Set(catchRows.map((post) => post.species.trim().toLowerCase()).filter(Boolean)).size;
      const heaviest = catchRows.reduce((largest, post) => Math.max(largest, Number(post.weight_kg) || 0), 0);
      setStats({ catches: catchRows.length, followers: followersResult.count ?? 0, following: followingResult.count ?? 0, trips: tripsResult.count ?? 0, likes: likesResult.count ?? 0, comments: commentsResult.count ?? 0, listings: listingsResult.count ?? 0, species, heaviest });
    });
  }, []);
  async function signOut() {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    window.location.href = "/auth";
  }
  async function changeAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !isSupabaseConfigured()) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) return setAvatarMessage("Use a JPG, PNG, or WebP image under 5 MB.");
    setAvatarBusy(true); setAvatarMessage("");
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) { setAvatarBusy(false); return window.location.replace("/auth"); }
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${data.user.id}/avatar-${Date.now()}.${extension}`;
    const upload = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) { setAvatarBusy(false); return setAvatarMessage(upload.error.message); }
    const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const update = await supabase.from("profiles").update({ avatar_path: publicUrl, updated_at: new Date().toISOString() }).eq("id", data.user.id);
    if (update.error) { setAvatarBusy(false); return setAvatarMessage(update.error.message); }
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    setProfile((current) => ({ ...current, avatar: publicUrl }));
    window.dispatchEvent(new Event("anglermy-profile-updated"));
    setAvatarMessage("Profile photo updated.");
    setAvatarBusy(false);
  }
  const badgeChecks = [stats.catches >= 1, stats.species >= 5, stats.heaviest >= 5, stats.catches >= 10, stats.likes >= 25, stats.comments >= 10, stats.trips >= 3, stats.listings >= 1];
  const earnedBadges = badgeChecks.filter(Boolean).length;
  return <div className="page-container profile-page"><section className="profile-hero surface"><div className="profile-avatar"><Image src={profile.avatar} fill alt={profile.name} /><label className="avatar-change" title="Change profile photo">{avatarBusy ? <LoaderCircle className="spin" /> : <Camera />}<span>Change photo</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={changeAvatar} disabled={avatarBusy} /></label></div><div><p className="eyebrow">{profile.level}</p><h1>{profile.name}</h1><p>{profile.handle} · <MapPin />{profile.location}</p><p>Weekend angler exploring Malaysian coasts, kelongs, and freshwater lakes.</p>{avatarMessage && <p className="avatar-message" role="status">{avatarMessage}</p>}</div><button className="secondary-button" onClick={signOut}><LogOut />Log out</button><div className="profile-stats"><div><strong>{stats.catches}</strong><span>Catches</span></div><div><strong>{stats.species}</strong><span>Species</span></div><div><strong>{earnedBadges}</strong><span>Badges</span></div><div><strong>{stats.trips}</strong><span>Trips</span></div></div></section><section className="profile-trophy surface"><div className="profile-trophy-head"><div><p className="eyebrow">Collector profile</p><h2><Trophy /> Trophy cabinet</h2></div><strong>{earnedBadges}<span>/8 earned</span></strong></div><div className="collector-summary"><div><Fish /><span><small>Catch collection</small><strong>{stats.catches} catches</strong></span></div><div><Search /><span><small>Species discovered</small><strong>{stats.species} unique</strong></span></div><div><Ruler /><span><small>Largest recorded</small><strong>{stats.heaviest ? `${stats.heaviest.toFixed(1)} kg` : "No weight yet"}</strong></span></div></div><div className="mini-badges" aria-label="Earned badge overview">{[{ label: "First Catch", done: badgeChecks[0] }, { label: "Species Scout", done: badgeChecks[1] }, { label: "Trophy Catch", done: badgeChecks[2] }, { label: "Collector", done: badgeChecks[3] }].map((badge) => <div className={badge.done ? "earned" : ""} key={badge.label}><span>{badge.done ? <Check /> : <Award />}</span><small>{badge.label}</small></div>)}</div><Link className="primary-button" href="/achievements">See all achievement details</Link></section><div className="profile-layout"><div className="feed"><h2>Recent catches</h2>{stats.catches > 0 ? <CatchCard post={{ ...initialPosts[0], author: profile }} /> : <div className="profile-empty surface"><Target /><h3>No catches shared yet</h3><p>Your latest catch will appear here after you publish it from Home.</p></div>}</div><aside className="rail-list surface"><h3><Award />Angler summary</h3><p><span><strong>{stats.followers} followers</strong><small>{stats.following} anglers followed</small></span></p><p><span><strong>{stats.likes} catch likes</strong><small>{stats.comments} helpful comments shared</small></span></p><p><span><strong>{stats.listings} market listings</strong><small>Community marketplace activity</small></span></p></aside></div></div>;
}
