import { NextResponse } from "next/server";
import { getLocalSession } from "@/lib/local-auth";
import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/mode";
import { mapLicense, toLicenseRow } from "@/lib/mappers";
import { createClient } from "@/lib/supabase/server";
import type { PlayerLicense } from "@/lib/types";

export async function GET() {
  if (!isSupabaseConfigured()) {
    const session = await getLocalSession();
    if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    const store = readLocalStore();
    const licenses =
      session.role === "admin"
        ? store.data.licenses
        : store.data.licenses.filter((item) => item.teamId === session.teamId);
    return NextResponse.json({ licenses });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, team_id")
    .eq("id", user.id)
    .maybeSingle();

  let query = supabase.from("licenses").select("*").order("created_at", { ascending: false });
  if (profile?.role === "team" && profile.team_id) {
    query = query.eq("team_id", profile.team_id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ licenses: (data || []).map(mapLicense) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { license: PlayerLicense };

  if (!isSupabaseConfigured()) {
    const session = await getLocalSession();
    if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    if (session.role === "team" && body.license.teamId !== session.teamId) {
      return NextResponse.json({ error: "Sadece kendi takımınıza lisans ekleyebilirsiniz." }, { status: 403 });
    }
    const store = readLocalStore();
    store.data.licenses = [body.license, ...store.data.licenses];
    writeLocalStore(store);
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("licenses").insert(toLicenseRow(body.license));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  if (!isSupabaseConfigured()) {
    const session = await getLocalSession();
    if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    const store = readLocalStore();
    const license = store.data.licenses.find((item) => item.id === id);
    if (!license) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
    if (session.role === "team" && license.teamId !== session.teamId) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    store.data.licenses = store.data.licenses.filter((item) => item.id !== id);
    writeLocalStore(store);
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("licenses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
