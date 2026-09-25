import FixturesList from "@/components/FixturesList";
import LeagueMetrics from "@/components/LeagueMetrics";
import PublicShell from "@/components/PublicShell";
import { loadPublicLeagueData } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fikstür" };

export default async function FixturesPage() {
  const { data } = await loadPublicLeagueData();

  return (
    <PublicShell
      title="Fikstür"
      description="Çift devre lig usulü maç programı ve sonuçlar."
    >
      <LeagueMetrics data={data} className="metric-grid--page" />
      <section className="site-panel">
        <FixturesList matches={data.matches} teams={data.teams} />
      </section>
    </PublicShell>
  );
}
