import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eamjllpwggmptnjvkqow.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_PTYQcV9-5kolIXoqPOLLog_Vfcy93QB";
  if (!url || !key) throw new Error("Supabase environment variables are not configured");
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || typeof window !== "undefined");
}
