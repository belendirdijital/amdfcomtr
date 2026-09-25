"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Giriş başarısız.");

      const next = searchParams.get("next");
      if (next) {
        router.replace(next);
      } else if (payload.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/team");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={onSubmit}>
        <Link href="/" className="site-brand" style={{ marginBottom: 4 }}>
          <BrandMark />
          <span>
            <strong>Anadolu Masterler</strong>
            <small>Panel girişi</small>
          </span>
        </Link>
        <h1>Panele giriş</h1>
        <p>Admin e-posta, takım telefon numarası ile giriş yapar.</p>
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "var(--paper)",
            border: "1px solid var(--soft-line)",
            fontSize: 13,
            color: "var(--muted)"
          }}
        >
          Yerel test — Admin: <strong>admin@amdf.local</strong> / <strong>admin123</strong>
          <br />
          Takım: <strong>05551234567</strong> / <strong>takim123</strong>
        </div>
        <label className="form-field">
          <span>Telefon veya e-posta</span>
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
            autoComplete="username"
            placeholder="05xx… veya admin@…"
          />
        </label>
        <label className="form-field">
          <span>Şifre</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş yap"}
        </button>
      </form>
    </div>
  );
}
