import { readLocalStore } from "@/lib/local-store";
import { getLeagueData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/mode";
import type { LeagueData } from "@/lib/types";

export { isSupabaseConfigured };

export async function loadPublicLeagueData(): Promise<{
  data: LeagueData;
  configured: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { data: readLocalStore().data, configured: false };
  }

  try {
    const data = await getLeagueData();
    return { data, configured: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Veriler yüklenemedi.";
    return { data: readLocalStore().data, configured: true, error: message };
  }
}
