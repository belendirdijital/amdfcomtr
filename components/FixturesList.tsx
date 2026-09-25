import TeamBadge from "@/components/TeamBadge";
import { formatDate, matchIsPlayed } from "@/lib/league";
import type { Match, Team } from "@/lib/types";

export default function FixturesList({
  matches,
  teams,
  limit
}: {
  matches: Match[];
  teams: Team[];
  limit?: number;
}) {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const visible = limit ? matches.slice(0, limit) : matches;
  const byRound = visible.reduce<Record<number, Match[]>>((acc, match) => {
    (acc[match.round] ||= []).push(match);
    return acc;
  }, {});

  if (!visible.length) {
    return <div className="site-empty">Fikstür henüz oluşturulmadı.</div>;
  }

  return (
    <div className="fixture-stack">
      {Object.entries(byRound).map(([round, roundMatches]) => (
        <section className="fixture-round" key={round}>
          <h3>{round}. Hafta</h3>
          <div className="fixture-list">
            {roundMatches.map((match) => {
              const home = teamMap.get(match.homeId);
              const away = teamMap.get(match.awayId);
              if (!home || !away) return null;
              const played = matchIsPlayed(match);
              return (
                <article className="fixture-card fixture-card--simple" key={match.id}>
                  <div className="fixture-card__meta">
                    <span>{formatDate(match.date)}</span>
                    <span>
                      {match.time} · {match.venue}
                    </span>
                  </div>
                  <div className="fixture-card__teams">
                    <TeamBadge team={home} size="sm" />
                    <strong className="fixture-score">
                      {played ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                    </strong>
                    <TeamBadge team={away} size="sm" />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
