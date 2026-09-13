"use client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
export default function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const { error: signInError } =
      await getSupabaseBrowser().auth.signInWithPassword({ email, password });
    if (signInError) return setError(signInError.message);
    router.replace("/admin");
    router.refresh();
  };
  return (
    <main className="admin-login">
      <p className="eyebrow">BWA operations</p>
      <h1>Staff access</h1>
      <p>
        {params.get("reason") === "config"
          ? "Supabase authentication needs to be configured before staff access can be enabled."
          : "Use your BWA staff account to access orders, inventory, and operations."}
      </p>
      <form onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="btn btn-primary">Sign in</button>
      </form>
    </main>
  );
}
