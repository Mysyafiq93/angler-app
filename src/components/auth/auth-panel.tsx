"use client";

import { Fish, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace("/");
    });
  }, []);

  function changeMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setMessage("");
  }

  async function submit(formData: FormData) {
    if (!isSupabaseConfigured()) return setMessage("Database credentials are not configured yet.");
    setBusy(true); setMessage("");
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    if (mode === "register" && password !== String(formData.get("confirmPassword"))) {
      setBusy(false);
      return setMessage("Passwords do not match.");
    }
    const supabase = createClient();
    const result = mode === "register"
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: String(formData.get("displayName")), username: String(formData.get("username")) } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "register" && !result.data.session) {
      setMode("login");
      return setMessage("Account created. Log in with your new account.");
    }
    window.location.href = "/";
  }

  return <section className="auth-panel surface"><div className="auth-brand"><Fish /><div><p className="eyebrow">AnglerMY account</p><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1></div></div><p className="auth-intro">{mode === "login" ? "Log in with the account you created before." : "Create a testing account and start immediately. No email verification is required."}</p><div className="segmented"><button type="button" className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}><UserPlus />Create account</button><button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}><LogIn />Log in</button></div><form action={submit}>{mode === "register" && <><label>Display name<input required name="displayName" autoComplete="name" placeholder="Mohamad Syafiq" /></label><label>Username<input required name="username" minLength={3} autoComplete="username" placeholder="syafiqangler" /></label></>}<label>Email<input required name="email" type="email" autoComplete="email" placeholder="test@example.com" /></label><label>Password<input required name="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>{mode === "register" && <label>Confirm password<input required name="confirmPassword" type="password" minLength={8} autoComplete="new-password" /></label>}<button className="primary-button wide-button" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button>{message && <p className="auth-message" role="status">{message}</p>}</form><p className="auth-switch">{mode === "register" ? "Already have an account?" : "New to AnglerMY?"} <button type="button" onClick={() => changeMode(mode === "register" ? "login" : "register")}>{mode === "register" ? "Log in" : "Create an account"}</button></p></section>;
}
