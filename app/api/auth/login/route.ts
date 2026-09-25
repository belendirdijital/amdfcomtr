import { NextResponse } from "next/server";
import { COOKIE_NAME, encodeSession } from "@/lib/local-auth";
import { readLocalStore } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/mode";
import { looksLikeEmail, normalizePhone, phoneToAuthEmail } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const identifier = String(body.identifier || body.email || body.phone || "").trim();
  const password = String(body.password || "");

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Telefon/e-posta ve şifre gerekli." },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    const asEmail = looksLikeEmail(identifier);
    const phoneDigits = normalizePhone(identifier);

    const account = store.accounts.find((item) => {
      if (item.password !== password) return false;
      if (asEmail) {
        return Boolean(item.email && item.email.toLowerCase() === identifier.toLowerCase());
      }
      return Boolean(item.phone && normalizePhone(item.phone) === phoneDigits);
    });

    if (!account) {
      return NextResponse.json(
        { error: "Telefon/e-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const token = await encodeSession({
      id: account.id,
      email: account.email,
      phone: account.phone,
      managerName: account.managerName,
      role: account.role,
      teamId: account.teamId
    });

    const response = NextResponse.json({
      ok: true,
      role: account.role,
      teamId: account.teamId,
      mode: "local"
    });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  }

  const supabase = await createClient();
  const authEmail = looksLikeEmail(identifier)
    ? identifier.toLowerCase()
    : phoneToAuthEmail(identifier);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password
  });
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || "Giriş başarısız." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, team_id")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    role: profile?.role || "team",
    teamId: profile?.team_id || null,
    mode: "supabase"
  });
}
