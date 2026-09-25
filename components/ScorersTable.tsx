import TeamBadge from "@/components/TeamBadge";
import type { ScorerRow } from "@/lib/types";

export default function ScorersTable({ rows }: { rows: ScorerRow[] }) {
  if (!rows.length) {
    return <div className="site-empty">Henüz gol kaydı girilmedi.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Oyuncu</th>
            <th>Takım</th>
            <th>Gol</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.team.id}-${row.playerName}`}>
              <td>{index + 1}</td>
              <td>
                <strong>{row.playerName}</strong>
              </td>
              <td>
                <TeamBadge team={row.team} size="sm" />
              </td>
              <td>
                <strong>{row.goals}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
