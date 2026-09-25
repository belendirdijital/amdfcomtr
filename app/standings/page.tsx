import LeagueMetrics from "@/components/LeagueMetrics";
import PublicShell from "@/components/PublicShell";
import StandingsTable from "@/components/StandingsTable";
import { getStandings } from "@/lib/league";
import { loadPublicLeagueData } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Puan Durumu" };

export default async function StandingsPage() {
  const { data } = await loadPublicLeagueData();
  const rows = getStandings(data.teams, data.matches);

  return (
    <PublicShell
      title="Puan durumu"
      description="Girilen sonuçlara göre otomatik hesaplanan lig sıralaması. Eşitlikte averaj ve atılan gol dikkate alınır."
    >
      <LeagueMetrics data={data} className="metric-grid--page" />
      <section className="site-panel">
        <StandingsTable rows={rows} />
      </section>
    </PublicShell>
  );
}
