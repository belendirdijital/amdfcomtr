import { NextResponse } from "next/server";
import { getLocalSession } from "@/lib/local-auth";
import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/mode";
import {
  mapCard,
  mapGoal,
  mapLicense,
  mapMatch,
  mapTeam,
  toCardRow,
  toGoalRow,
  toLicenseRow,
  toMatchRow,
  toTeamRow
} from "@/lib/mappers";
import { createClient } from "@/lib/supabase/server";
import type { LeagueData } from "@/lib/types";

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    const session = await getLocalSession();
    if (!session || session.role !== "admin") return null;
    return session;
  }
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    return NextResponse.json({ data: store.data, mode: "local" });
  }

  const supabase = await createClient();
  const [teams, matches, goals, cards, licenses] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("matches").select("*").order("round").order("date"),
    supabase.from("match_goals").select("*"),
    supabase.from("cards").select("*").order("created_at", { ascending: false }),
    supabase.from("licenses").select("*").order("created_at", { ascending: false })
  ]);

  if (teams.error || matches.error || goals.error || cards.error || licenses.error) {
    return NextResponse.json(
      {
        error:
          teams.error?.message ||
          matches.error?.message ||
          goals.error?.message ||
          cards.error?.message ||
          licenses.error?.message
      },
      { status: 500 }
    );
  }

  const data: LeagueData = {
    teams: (teams.data || []).map(mapTeam),
    matches: (matches.data || []).map(mapMatch),
    goals: (goals.data || []).map(mapGoal),
    cards: (cards.data || []).map(mapCard),
    licenses: (licenses.data || []).map(mapLicense)
  };

  return NextResponse.json({ data, mode: "supabase" });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = (await request.json()) as { data: LeagueData };
  if (!body?.data) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const store = readLocalStore();
    store.data = body.data;
    writeLocalStore(store);
    return NextResponse.json({ ok: true, data: store.data });
  }

  const supabase = await createClient();
  const data = body.data;

  // Full sync for admin saves: replace child tables carefully
  await supabase.from("match_goals").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("cards").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("licenses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  if (data.teams.length) {
    const { error } = await supabase.from("teams").insert(data.teams.map(toTeamRow));
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (data.matches.length) {
    const { error } = await supabase.from("matches").insert(data.matches.map(toMatchRow));
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (data.goals.length) {
    const { error } = await supabase.from("match_goals").insert(data.goals.map(toGoalRow));
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (data.cards.length) {
    const { error } = await supabase.from("cards").insert(data.cards.map(toCardRow));
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (data.licenses.length) {
    const { error } = await supabase.from("licenses").insert(data.licenses.map(toLicenseRow));
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
