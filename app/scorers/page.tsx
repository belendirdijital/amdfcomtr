import LeagueMetrics from "@/components/LeagueMetrics";
import PublicShell from "@/components/PublicShell";
import ScorersTable from "@/components/ScorersTable";
import { getTopScorers } from "@/lib/league";
import { loadPublicLeagueData } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gol Kralı" };

export default async function ScorersPage() {
  const { data } = await loadPublicLeagueData();
  const rows = getTopScorers(data.teams, data.goals);

  return (
    <PublicShell
      title="Gol kralı"
      description="Maçlara girilen oyuncu gol kayıtlarından oluşan gol krallığı sıralaması."
    >
      <LeagueMetrics data={data} className="metric-grid--page" />
      <section className="site-panel">
        <ScorersTable rows={rows} />
      </section>
    </PublicShell>
  );
}
