"use client";

import Image from "next/image";
import { Camera, ImagePlus, MapPin, X } from "lucide-react";
import { useState } from "react";
import { currentAngler } from "@/data/mock-data";
import type { CatchPost, Privacy } from "@/types/domain";

async function compressCatchImage(file: File) {
  if (!file.type.startsWith("image/")) return file;
  const source = typeof createImageBitmap === "undefined"
    ? await new Promise<HTMLImageElement>((resolve, reject) => { const image = new globalThis.Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = URL.createObjectURL(file); })
    : await createImageBitmap(file);
  const scale = Math.min(1, 1600 / source.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  return blob ? new File([blob], "catch.webp", { type: "image/webp" }) : file;
}

export function CreateCatch({ onCreate, angler = currentAngler }: { onCreate: (post: CatchPost) => void | Promise<void>; angler?: typeof currentAngler }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("");
    try {
      await onCreate({ id: crypto.randomUUID(), author: angler, title: String(formData.get("title")), story: String(formData.get("story")), species: String(formData.get("species")), weight: String(formData.get("weight")), technique: String(formData.get("technique")), location: String(formData.get("location")), privacy: String(formData.get("privacy")) as Privacy, image: preview || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85", createdAt: "Just now", likes: 0, comments: 0 });
      setOpen(false); setPreview("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not publish catch");
    }
  }

  return <>
    <button className="composer surface" type="button" onClick={() => setOpen(true)}><Image src={angler.avatar} width={42} height={42} alt="" /><span>Share your latest catch...</span><ImagePlus aria-hidden="true" /></button>
    {open && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-catch-title">
      <form action={submit}>
        <div className="modal-head"><div><p className="eyebrow">Catch report</p><h2 id="create-catch-title">Create a post</h2></div><button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close"><X /></button></div>
        <label className="photo-picker"><Camera aria-hidden="true" /><strong>{preview ? "Change photo" : "Add catch photo"}</strong><span>Use your camera or photo library</span><input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const compressed = await compressCatchImage(file); const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(compressed); } catch { const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(file); } }} /></label>
        {preview && <div className="photo-preview"><Image src={preview} fill alt="Catch preview" unoptimized /></div>}
        <div className="form-grid"><label className="wide">Catch title<input required name="title" defaultValue="My latest catch" /></label><label>Species<input required name="species" placeholder="Siakap" /></label><label>Weight<input name="weight" placeholder="3.2 kg" /></label><label className="wide">Technique or bait<input name="technique" placeholder="Bottom fishing · Live prawn" /></label><label className="wide">Story<textarea name="story" rows={4} placeholder="Tell the community about the session" /></label><label><MapPin aria-hidden="true" />Location<input name="location" defaultValue="Penang, Malaysia" /></label><label>Location privacy<select name="privacy" defaultValue="Approximate area"><option>Approximate area</option><option>State only</option><option>Private</option></select></label></div>
        <button className="primary-button wide-button" type="submit">Publish catch</button>{message && <p className="auth-message">{message}</p>}
      </form>
    </section></div>}
  </>;
}
