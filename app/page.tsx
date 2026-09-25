import Link from "next/link";
import FixturesList from "@/components/FixturesList";
import LeagueMetrics from "@/components/LeagueMetrics";
import PublicShell from "@/components/PublicShell";
import ScorersTable from "@/components/ScorersTable";
import StandingsTable from "@/components/StandingsTable";
import {
  getCardTotals,
  getStandings,
  getTopScorers,
  matchIsPlayed
} from "@/lib/league";
import { loadPublicLeagueData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data, configured, error } = await loadPublicLeagueData();
  const standings = getStandings(data.teams, data.matches);
  const scorers = getTopScorers(data.teams, data.goals).slice(0, 5);
  const fairPlay = getCardTotals(data.teams, data.cards).slice(0, 5);
  const upcoming = data.matches.filter((match) => !matchIsPlayed(match)).slice(0, 4);

  return (
    <PublicShell
      title="Veteranlar Ligi"
      description="Puan durumu, fikstür, gol kralı ve fair play — canlı takip. Veriler yalnızca yönetim panelinden güncellenir."
    >
      {!configured && (
        <div className="site-panel" style={{ marginBottom: 18 }}>
                    <strong>Kurulum:</strong> Şu an yerel moddasınız (Supabase yok).
          Admin paneli çalışır; veriler sunucudaki <code>data/store.json</code> dosyasına yazılır.
          Giriş: <code>admin@amdf.local</code> / <code>admin123</code>
        </div>
      )}
      {error && (
        <div className="site-panel" style={{ marginBottom: 18 }}>
          <strong>Veri hatası:</strong> {error}
        </div>
      )}

      <LeagueMetrics data={data} className="metric-grid--page" />

      <div className="site-grid site-grid--2">
        <section className="site-panel">
          <div className="panel-heading">
            <h2>Puan durumu</h2>
            <Link href="/standings">Tümü</Link>
          </div>
          <StandingsTable rows={standings} limit={6} />
        </section>
        <section className="site-panel">
          <div className="panel-heading">
            <h2>Yaklaşan maçlar</h2>
            <Link href="/fixtures">Fikstür</Link>
          </div>
          <FixturesList matches={upcoming} teams={data.teams} />
        </section>
        <section className="site-panel">
          <div className="panel-heading">
            <h2>Gol kralı</h2>
            <Link href="/scorers">Tümü</Link>
          </div>
          <ScorersTable rows={scorers} />
        </section>
        <section className="site-panel">
          <div className="panel-heading">
            <h2>Fair play</h2>
            <Link href="/fairplay">Tümü</Link>
          </div>
          {fairPlay.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Takım</th>
                    <th>Sarı</th>
                    <th>Kırmızı</th>
                    <th>Ceza</th>
                  </tr>
                </thead>
                <tbody>
                  {fairPlay.map((row, index) => (
                    <tr key={row.team.id}>
                      <td>{index + 1}</td>
                      <td>{row.team.name}</td>
                      <td>{row.yellow}</td>
                      <td>{row.red}</td>
                      <td>{row.penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="site-empty">Kart kaydı yok.</div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
