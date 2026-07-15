"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Fish, MapPin, Trophy } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { currentAngler, initialPosts } from "@/data/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type PublicProfile = { display_name: string; username: string; location: string | null; bio: string | null; avatar_path: string | null };

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState({ catches: 0, species: 0, trophy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      Promise.resolve().then(() => {
        const posts = initialPosts.filter((post) => post.author.id === id);
        const author = posts[0]?.author;
        if (author) {
          setProfile({ display_name: author.name, username: author.handle.replace(/^@/, ""), location: author.location, bio: `${author.level} sharing fishing experiences with the AnglerMY community.`, avatar_path: author.avatar });
          setStats({ catches: posts.length, species: new Set(posts.map((post) => post.species.toLowerCase())).size, trophy: posts.some((post) => Number.parseFloat(post.weight) >= 5) ? 1 : 0 });
        }
        setLoading(false);
      });
      return;
    }
    if (!isSupabaseConfigured()) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("display_name,username,location,bio,avatar_path").eq("id", id).single(),
      supabase.from("posts").select("species,weight_kg").eq("author_id", id).neq("privacy", "private"),
    ]).then(([profileResult, postsResult]) => {
      setProfile(profileResult.data);
      const posts = postsResult.data ?? [];
      setStats({ catches: posts.length, species: new Set(posts.map((post) => post.species.trim().toLowerCase())).size, trophy: posts.some((post) => Number(post.weight_kg) >= 5) ? 1 : 0 });
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="page-container public-profile-state">Loading angler profile...</div>;
  if (!profile) return <div className="page-container public-profile-state"><Fish /><h1>Profile not available</h1><p>This sample angler does not have a public database profile yet.</p><Link className="primary-button" href="/"><ArrowLeft />Back to Home</Link></div>;
  return <div className="page-container public-profile-page"><Link className="back-link" href="/"><ArrowLeft />Back to Home</Link><section className="public-profile-hero surface"><div className="profile-avatar"><Image src={profile.avatar_path || currentAngler.avatar} fill alt={profile.display_name} /></div><div><p className="eyebrow">AnglerMY member</p><h1>{profile.display_name}</h1><p className="public-handle">@{profile.username}</p><p><MapPin />{profile.location ?? "Malaysia"}</p><p>{profile.bio || "Sharing catches and fishing experiences with the AnglerMY community."}</p></div></section><section className="public-profile-stats"><div className="surface"><Fish /><strong>{stats.catches}</strong><span>Public catches</span></div><div className="surface"><Trophy /><strong>{stats.species}</strong><span>Species recorded</span></div><div className="surface"><Trophy /><strong>{stats.trophy}</strong><span>Trophy catches</span></div></section></div>;
}
