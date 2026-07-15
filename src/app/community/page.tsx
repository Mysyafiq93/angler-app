"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface Community { id: string; name: string; description: string; members: number; image: string; }
const images = ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80"];
const fallback: Community[] = ["Penang Anglers Club", "Kelong Hunters Malaysia", "Siakap Casting Utara", "Beginner Anglers MY"].map((name, index) => ({ id: `demo-${index}`, name, description: ["Shore and island fishing", "Kelong and bottom fishing", "Northern casting reports", "Learn, ask, and improve"][index], members: [2300,1800,3100,3600][index], image: images[index] }));

export default function CommunityPage() {
  const [groups, setGroups] = useState(fallback); const [joined, setJoined] = useState<string[]>([]);
  useEffect(() => { if (!isSupabaseConfigured()) return; const supabase = createClient(); supabase.from("communities").select("id,name,description,community_members(count)").then(({ data }) => { if (data) setGroups(data.map((row, index) => ({ id: row.id, name: row.name, description: row.description, members: row.community_members?.[0]?.count ?? 0, image: images[index % images.length] }))); }); }, []);
  async function join(id: string) { if (!isSupabaseConfigured()) return setJoined((value) => [...value, id]); const supabase = createClient(); const { data } = await supabase.auth.getUser(); if (!data.user) return void window.location.assign("/auth"); const result = await supabase.from("community_members").upsert({ community_id: id, user_id: data.user.id }); if (!result.error) setJoined((value) => [...value, id]); }
  return <div className="page-container standard-page"><PageHeader eyebrow="Find your crew" title="Communities" description="Local groups for fishing styles, species, and places across Malaysia." /><div className="community-grid">{groups.map((group) => <article className="community-card surface" key={group.id}><div className="community-image"><Image src={group.image} fill sizes="(max-width: 700px) 100vw, 500px" alt="" /></div><div><h2>{group.name}</h2><p>{group.description}</p><span><Users />{group.members.toLocaleString()} members</span><button className="secondary-button" disabled={joined.includes(group.id)} onClick={() => join(group.id)}>{joined.includes(group.id) ? "Joined" : "Join community"}</button></div></article>)}</div></div>;
}
