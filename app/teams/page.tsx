import LeagueMetrics from "@/components/LeagueMetrics";
import PublicShell from "@/components/PublicShell";
import TeamBadge from "@/components/TeamBadge";
import { loadPublicLeagueData } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Takımlar" };

export default async function TeamsPage() {
  const { data } = await loadPublicLeagueData();

  return (
    <PublicShell
      title="Takımlar"
      description="Lige katılan takımlar ve sorumlu bilgiler."
    >
      <LeagueMetrics data={data} className="metric-grid--page" />
      <section className="team-grid">
        {data.teams.map((team) => (
          <article className="team-card" key={team.id}>
            <TeamBadge team={team} size="lg" />
            <div>
              <p>
                <strong>Kısaltma:</strong> {team.shortName}
              </p>
              {team.manager && (
                <p>
                  <strong>Sorumlu:</strong> {team.manager}
                </p>
              )}
            </div>
          </article>
        ))}
        {!data.teams.length && (
          <div className="site-empty">Henüz takım eklenmedi.</div>
        )}
      </section>
    </PublicShell>
  );
}
