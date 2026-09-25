import TeamPanel from "@/components/TeamPanel";
import { getLocalSession } from "@/lib/local-auth";
import { readLocalStore } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/mode";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Takım Paneli" };

export default async function TeamPage() {
  if (!isSupabaseConfigured()) {
    const session = await getLocalSession();
    if (!session) redirect("/login?next=/team");
    if (session.role !== "team" && session.role !== "admin") redirect("/login");
    if (!session.teamId) {
      return (
        <div className="login-shell">
          <div className="login-card">
            <h1>Takım atanmadı</h1>
            <p>Hesabınıza henüz bir takım bağlanmamış.</p>
          </div>
        </div>
      );
    }
    const store = readLocalStore();
    const team = store.data.teams.find((item) => item.id === session.teamId);
    return <TeamPanel teamId={session.teamId} teamName={team?.name || "Takım"} />;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/team");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, team_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "team" && profile.role !== "admin")) {
    redirect("/login");
  }

  if (!profile.team_id) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <h1>Takım atanmadı</h1>
          <p>Hesabınıza henüz bir takım bağlanmamış. Admin ile iletişime geçin.</p>
        </div>
      </div>
    );
  }

  const { data: team } = await supabase
    .from("teams")
    .select("name")
    .eq("id", profile.team_id)
    .maybeSingle();

  return <TeamPanel teamId={profile.team_id} teamName={team?.name || "Takım"} />;
}
