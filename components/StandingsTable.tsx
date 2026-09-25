import TeamBadge from "@/components/TeamBadge";
import type { StandingRow } from "@/lib/types";

export default function StandingsTable({
  rows,
  limit
}: {
  rows: StandingRow[];
  limit?: number;
}) {
  const visible = limit ? rows.slice(0, limit) : rows;

  if (!visible.length) {
    return <div className="site-empty">Henüz puan durumu oluşmadı.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Takım</th>
            <th>O</th>
            <th>G</th>
            <th>B</th>
            <th>M</th>
            <th>AG</th>
            <th>YG</th>
            <th>AV</th>
            <th>P</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((row, index) => (
            <tr key={row.team.id}>
              <td>{index + 1}</td>
              <td>
                <TeamBadge team={row.team} size="sm" />
              </td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.gf}</td>
              <td>{row.ga}</td>
              <td>{row.gd}</td>
              <td>
                <strong>{row.points}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
