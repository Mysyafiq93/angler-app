"use client";

import { useEffect, useState } from "react";
import { CreateCatch } from "./create-catch";
import { CatchCard } from "./catch-card";
import { initialPosts } from "@/data/mock-data";
import type { CatchPost } from "@/types/domain";
import { currentAngler } from "@/data/mock-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface DatabasePost {
  id: string; title: string; story: string; species: string; weight_kg: number | null;
  technique: string | null; location_label: string | null; privacy: string; created_at: string;
  profiles: { id: string; display_name: string; username: string; location: string | null; avatar_path: string | null } | { id: string; display_name: string; username: string; location: string | null; avatar_path: string | null }[] | null;
  post_images: { storage_path: string }[]; likes: { count: number }[]; comments: { count: number }[];
}

export function HomeFeed() {
  const [posts, setPosts] = useState<CatchPost[]>(isSupabaseConfigured() ? [] : initialPosts);
  const [activeAngler, setActiveAngler] = useState(currentAngler);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      Promise.all([
        supabase.auth.getUser(),
        supabase.from("posts").select("id,title,story,species,weight_kg,technique,location_label,privacy,created_at,profiles!posts_author_id_fkey(id,display_name,username,location,avatar_path),post_images(storage_path),likes(count),comments(count)").order("created_at", { ascending: false }).limit(30),
      ]).then(async ([userResult, postsResult]) => {
        if (userResult.data.user) {
          const { data: profile } = await supabase.from("profiles").select("display_name,username,location,avatar_path").eq("id", userResult.data.user.id).single();
          if (profile) setActiveAngler({ id: userResult.data.user.id, name: profile.display_name, handle: `@${profile.username}`, location: profile.location ?? "Malaysia", avatar: profile.avatar_path || currentAngler.avatar, level: "Community Angler" });
        }
        const data = postsResult.data;
        if (!data) { setLoading(false); return; }
        const mapped = (data as unknown as DatabasePost[]).map((row): CatchPost => {
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          const imagePath = row.post_images?.[0]?.storage_path;
          return { id: row.id, author: { id: profile?.id ?? "angler", name: profile?.display_name ?? "AnglerMY member", handle: `@${profile?.username ?? "angler"}`, location: profile?.location ?? "Malaysia", avatar: profile?.avatar_path || currentAngler.avatar, level: "Community Angler" }, title: row.title, story: row.story, species: row.species, weight: row.weight_kg ? `${row.weight_kg} kg` : "", technique: row.technique ?? "", location: row.location_label ?? "Malaysia", privacy: row.privacy === "state" ? "State only" : row.privacy === "private" ? "Private" : "Approximate area", image: imagePath ? supabase.storage.from("catch-images").getPublicUrl(imagePath).data.publicUrl : initialPosts[0].image, createdAt: new Date(row.created_at).toLocaleDateString("en-MY"), likes: row.likes?.[0]?.count ?? 0, comments: row.comments?.[0]?.count ?? 0 };
        });
        setPosts(mapped);
        setLoading(false);
      });
    } else {
      const saved = localStorage.getItem("anglermy-demo-posts");
      if (saved) Promise.resolve().then(() => setPosts([...JSON.parse(saved), ...initialPosts]));
    }
  }, []);

  async function create(post: CatchPost) {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { window.location.href = "/auth"; throw new Error("Sign in to publish a catch"); }
      const privacy = post.privacy === "State only" ? "state" : post.privacy === "Private" ? "private" : "approximate";
      const weight = Number.parseFloat(post.weight.replace(/[^0-9.]/g, "")) || null;
      const { data: savedPost, error } = await supabase.from("posts").insert({ author_id: userData.user.id, title: post.title, story: post.story, species: post.species, weight_kg: weight, technique: post.technique, location_label: post.location, privacy }).select("id").single();
      if (error) throw error;
      if (post.image.startsWith("data:")) {
        const blob = await fetch(post.image).then((response) => response.blob());
        const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
        const path = `${userData.user.id}/${savedPost.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from("catch-images").upload(path, blob, { contentType: blob.type, upsert: false });
        if (upload.error) throw upload.error;
        const imageRow = await supabase.from("post_images").insert({ post_id: savedPost.id, owner_id: userData.user.id, storage_path: path });
        if (imageRow.error) throw imageRow.error;
        post.image = supabase.storage.from("catch-images").getPublicUrl(path).data.publicUrl;
      }
      post.id = savedPost.id;
      post.author = { ...activeAngler, id: userData.user.id };
      setPosts((current) => [post, ...current]);
      return;
    }
    setPosts((current) => [post, ...current]);
    try {
      const saved = JSON.parse(localStorage.getItem("anglermy-demo-posts") ?? "[]") as CatchPost[];
      localStorage.setItem("anglermy-demo-posts", JSON.stringify([post, ...saved].slice(0, 4)));
    } catch {
      // Large phone photos can exceed browser storage; Supabase Storage removes this limit later.
    }
  }

  if (loading) return <div className="feed" aria-busy="true"><div className="surface feed-loading">Loading your feed...</div></div>;
  return <div className="feed"><CreateCatch onCreate={create} angler={activeAngler} />{posts.map((post) => <CatchCard post={post} onDelete={(id) => setPosts((current) => current.filter((item) => item.id !== id))} key={post.id} />)}</div>;
}
