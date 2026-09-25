import { createClient } from "@/lib/supabase/server";
import { mapCard, mapGoal, mapLicense, mapMatch, mapProfile, mapTeam } from "@/lib/mappers";
import type { CardRecord, LeagueData, Match, MatchGoal, PlayerLicense, Profile, Team } from "@/lib/types";

export async function getLeagueData(): Promise<LeagueData> {
  const supabase = await createClient();
  const [teamsRes, matchesRes, goalsRes, cardsRes] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("matches").select("*").order("round").order("date"),
    supabase.from("match_goals").select("*"),
    supabase.from("cards").select("*").order("created_at", { ascending: false })
  ]);

  if (teamsRes.error) throw teamsRes.error;
  if (matchesRes.error) throw matchesRes.error;
  if (goalsRes.error) throw goalsRes.error;
  if (cardsRes.error) throw cardsRes.error;

  return {
    teams: (teamsRes.data || []).map(mapTeam),
    matches: (matchesRes.data || []).map(mapMatch),
    goals: (goalsRes.data || []).map(mapGoal),
    cards: (cardsRes.data || []).map(mapCard),
    licenses: []
  };
}

export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("teams").select("*").order("name");
  if (error) throw error;
  return (data || []).map(mapTeam);
}

export async function getMatches(): Promise<Match[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("round")
    .order("date");
  if (error) throw error;
  return (data || []).map(mapMatch);
}

export async function getGoals(): Promise<MatchGoal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_goals").select("*");
  if (error) throw error;
  return (data || []).map(mapGoal);
}

export async function getCards(): Promise<CardRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCard);
}

export async function getLicenses(teamId?: string): Promise<PlayerLicense[]> {
  const supabase = await createClient();
  let query = supabase.from("licenses").select("*").order("created_at", { ascending: false });
  if (teamId) query = query.eq("team_id", teamId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapLicense);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}
