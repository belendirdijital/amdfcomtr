import LeagueMetrics from "@/components/LeagueMetrics";
import PublicShell from "@/components/PublicShell";
import TeamBadge from "@/components/TeamBadge";
import { getCardTotals } from "@/lib/league";
import { loadPublicLeagueData } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fair Play" };

export default async function FairPlayPage() {
  const { data } = await loadPublicLeagueData();
  const rows = getCardTotals(data.teams, data.cards);

  return (
    <PublicShell
      title="Fair play"
      description="Sarı ve kırmızı kart kayıtlarına göre fair play sıralaması. Ceza puanı: sarı + (kırmızı × 3)."
    >
      <LeagueMetrics data={data} className="metric-grid--page" />
      <section className="site-panel">
        {rows.length ? (
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
                {rows.map((row, index) => (
                  <tr key={row.team.id}>
                    <td>{index + 1}</td>
                    <td>
                      <TeamBadge team={row.team} size="sm" />
                    </td>
                    <td>{row.yellow}</td>
                    <td>{row.red}</td>
                    <td>
                      <strong>{row.penalty}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="site-empty">Kart kaydı yok.</div>
        )}

        {data.cards.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <h2 style={{ marginBottom: 12, fontSize: 17 }}>Son kartlar</h2>
            <div className="card-list">
              {data.cards.map((card) => {
                const team = data.teams.find((item) => item.id === card.teamId);
                return (
                  <article className="card-item" key={card.id}>
                    <div>
                      <strong>{card.player || "Oyuncu belirtilmedi"}</strong>
                      <p>{team?.name || "Takım"}</p>
                      <small>{card.note || "—"}</small>
                    </div>
                    <div>
                      <span>Sarı {card.yellow}</span>
                      <span>Kırmızı {card.red}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
