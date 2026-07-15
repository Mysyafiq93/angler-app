"use client";

import Image from "next/image";
import { MapPin, MessageCircle, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface Product { id?: string; name: string; price: number; place: string; category: string; image: string; }
const initialProducts: Product[] = [
  { name: "Daiwa BG 4000 reel", price: 480, place: "Penang", category: "Reels", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=700&q=80" },
  { name: "Saltwater lure set", price: 75, place: "Kedah", category: "Lures", image: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=700&q=80" },
  { name: "Offshore jigging rod", price: 320, place: "Johor", category: "Rods", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80" },
  { name: "Portable tackle box", price: 95, place: "Perak", category: "Accessories", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80" },
];

export function Marketplace() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const visible = useMemo(() => products.filter((item) => `${item.name} ${item.place} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [products, query]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.from("marketplace_listings").select("id,title,price_myr,location,image_path,description").eq("status", "active").order("created_at", { ascending: false }).then(({ data }) => {
      if (!data?.length) return;
      setProducts([...data.map((row) => ({ id: row.id, name: row.title, price: Number(row.price_myr), place: row.location, category: row.description || "Fishing gear", image: row.image_path ? supabase.storage.from("marketplace-images").getPublicUrl(row.image_path).data.publicUrl : initialProducts[0].image })), ...initialProducts]);
    });
  }, []);

  async function add(formData: FormData) {
    const product: Product = { name: String(formData.get("name")), price: Number(formData.get("price")), place: String(formData.get("place")), category: String(formData.get("category")), image: initialProducts[0].image };
    if (isSupabaseConfigured()) {
      const supabase = createClient(); const { data } = await supabase.auth.getUser();
      if (!data.user) { window.location.href = "/auth"; return; }
      const result = await supabase.from("marketplace_listings").insert({ seller_id: data.user.id, title: product.name, price_myr: product.price, location: product.place, description: product.category }).select("id").single();
      if (result.error) throw result.error;
      product.id = result.data.id;
    }
    setProducts((current) => [product, ...current]);
    setOpen(false);
  }

  function contact(product: Product) {
    const message = encodeURIComponent(`Hi, I found "${product.name}" for RM${product.price} on AnglerMY. Is it available?`);
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  }

  return <div className="page-container standard-page"><PageHeader eyebrow="Community listings" title="Fishing marketplace" description="Discover equipment listed by anglers near you." action={<button className="primary-button" onClick={() => setOpen(true)}><Plus />Sell item</button>} />
    <label className="market-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rods, reels, lures, or location" /></label>
    <div className="product-grid">{visible.map((product) => <article className="product-card surface" key={`${product.name}-${product.place}`}><div><Image src={product.image} fill sizes="(max-width: 600px) 50vw, 280px" alt={product.name} /></div><p className="eyebrow"><MapPin />{product.place} · {product.category}</p><h2>{product.name}</h2><strong>RM{product.price}</strong><button className="secondary-button" onClick={() => contact(product)}><MessageCircle />Contact seller</button></article>)}</div>
    {open && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="sell-title"><form action={add}><div className="modal-head"><div><p className="eyebrow">Marketplace</p><h2 id="sell-title">List fishing gear</h2></div><button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close"><X /></button></div><div className="form-grid"><label className="wide">Item name<input required name="name" placeholder="Travel spinning rod" /></label><label>Price (RM)<input required name="price" type="number" min="0" /></label><label>Category<select name="category"><option>Rods</option><option>Reels</option><option>Lures</option><option>Accessories</option></select></label><label className="wide">Location<input required name="place" placeholder="Penang" /></label></div><button className="primary-button wide-button">Publish listing</button></form></section></div>}
  </div>;
}
