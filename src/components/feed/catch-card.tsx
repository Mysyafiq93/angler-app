"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, MessageCircle, MoreHorizontal, Share2, Trash2, X, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";
import type { CatchPost } from "@/types/domain";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function CatchCard({ post, onDelete }: { post: CatchPost; onDelete?: (id: string) => void }) {
  type Comment = { id: string; body: string; created_at: string; profiles: { display_name: string; username: string; avatar_path: string | null } | { display_name: string; username: string; avatar_path: string | null }[] | null };
  const [liked, setLiked] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [postError, setPostError] = useState("");
  const databasePost = /^[0-9a-f-]{36}$/i.test(post.id);
  const ownsPost = databasePost && currentUserId === post.author.id;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  async function deletePost() {
    if (!ownsPost || !window.confirm("Delete this post? Its photo, likes, and comments will also be removed.")) return;
    setDeleting(true); setPostError("");
    const supabase = createClient();
    const { data: images } = await supabase.from("post_images").select("storage_path").eq("post_id", post.id);
    const result = await supabase.from("posts").delete().eq("id", post.id).eq("author_id", currentUserId);
    if (result.error) { setDeleting(false); return setPostError("Post could not be deleted. Please try again."); }
    const paths = images?.map((image) => image.storage_path) ?? [];
    if (paths.length) await supabase.storage.from("catch-images").remove(paths);
    onDelete?.(post.id);
  }

  async function openComments() {
    const next = !commenting;
    setCommenting(next);
    if (!next || commentsLoaded || !isSupabaseConfigured() || !databasePost) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("comments").select("id,body,created_at,profiles!comments_author_id_fkey(display_name,username,avatar_path)").eq("post_id", post.id).order("created_at", { ascending: true });
    if (error) return setCommentError("Comments could not be loaded. Please try again.");
    setComments((data as unknown as Comment[]) ?? []);
    setCommentsLoaded(true);
  }
  async function toggleLike() {
    const next = !liked; setLiked(next);
    if (!isSupabaseConfigured() || !databasePost) return;
    const supabase = createClient(); const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    if (next) await supabase.from("likes").upsert({ post_id: post.id, user_id: data.user.id });
    else await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", data.user.id);
  }
  async function addComment(formData: FormData) {
    if (!isSupabaseConfigured() || !databasePost) return;
    const supabase = createClient(); const { data } = await supabase.auth.getUser();
    if (!data.user) return void (window.location.href = "/auth");
    const body = String(formData.get("comment")).trim();
    if (!body) return;
    const result = await supabase.from("comments").insert({ post_id: post.id, author_id: data.user.id, body }).select("id,body,created_at,profiles!comments_author_id_fkey(display_name,username,avatar_path)").single();
    if (result.error) return setCommentError("Your comment could not be posted. Please try again.");
    setComments((current) => [...current, result.data as unknown as Comment]);
    setCommentsLoaded(true);
    setCommentCount((count) => count + 1);
    setCommentError("");
  }
  return <article className="catch-card surface">
    <div className="catch-head"><Link className="post-author" href={`/profile/${post.author.id}`} aria-label={`View ${post.author.name}'s profile`}><Image src={post.author.avatar} width={44} height={44} alt="" /><span><strong>{post.author.name}</strong><small>{post.author.level} · {post.createdAt}</small></span></Link>{ownsPost ? <div className="post-menu-wrap"><button className="post-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Post options" aria-expanded={menuOpen}><MoreHorizontal /></button>{menuOpen && <div className="post-menu"><button type="button" onClick={deletePost} disabled={deleting}><Trash2 />{deleting ? "Deleting..." : "Delete post"}</button></div>}</div> : <button className="text-button" type="button">Follow</button>}</div>{postError && <p className="post-error" role="alert">{postError}</p>}
    <div className="catch-copy"><h2>{post.title}</h2><p>{post.story}</p><div className="catch-tags"><span>{post.species}</span><span>{post.weight}</span><span>{post.technique}</span></div><p className="location"><MapPin aria-hidden="true" />{post.location} · {post.privacy}</p></div>
    <button className="catch-image" type="button" onClick={() => setZoomed(true)} aria-label={`Enlarge ${post.species} catch photo`}><Image src={post.image} fill sizes="(max-width: 760px) 100vw, 680px" alt={`${post.species} catch shared by ${post.author.name}`} /><span className="zoom-hint"><ZoomIn />View photo</span></button>
    <div className="post-actions"><button className={liked ? "liked" : ""} onClick={toggleLike} type="button"><Heart aria-hidden="true" fill={liked ? "currentColor" : "none"} />{post.likes + (liked ? 1 : 0)}</button><button type="button" onClick={openComments} aria-expanded={commenting}><MessageCircle aria-hidden="true" />{commentCount}</button><button type="button" onClick={() => navigator.share?.({ title: post.title, text: post.story, url: `${window.location.origin}/?post=${post.id}` })}><Share2 aria-hidden="true" />Share</button></div>{commenting && <section className="comment-panel" aria-label={`Comments on ${post.title}`}>{comments.length > 0 && <div className="comment-list">{comments.map((comment) => { const author = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles; return <div className="comment-item" key={comment.id}>{author?.avatar_path ? <Image className="comment-avatar-image" src={author.avatar_path} width={34} height={34} alt="" /> : <div className="comment-avatar">{author?.display_name?.[0]?.toUpperCase() ?? "A"}</div>}<div><p><strong>{author?.display_name ?? "AnglerMY member"}</strong><span>{new Date(comment.created_at).toLocaleDateString("en-MY")}</span></p><p>{comment.body}</p></div></div>})}</div>}{commentsLoaded && comments.length === 0 && <p className="comment-empty">No comments yet. Start the conversation.</p>}{commentError && <p className="comment-error" role="alert">{commentError}</p>}<form className="comment-form" action={addComment}><input required name="comment" maxLength={2000} placeholder="Write a comment" aria-label="Write a comment" /><button className="primary-button">Post</button></form></section>}{zoomed && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`${post.species} catch photo`} onMouseDown={(event) => { if (event.target === event.currentTarget) setZoomed(false); }}><button className="lightbox-close" type="button" onClick={() => setZoomed(false)} aria-label="Close enlarged photo"><X /></button><div className="lightbox-image"><Image src={post.image} fill sizes="100vw" alt={`${post.species} catch shared by ${post.author.name}`} /></div><p><strong>{post.author.name}</strong><span>{post.title} · {post.species}</span></p></div>}
  </article>;
}
