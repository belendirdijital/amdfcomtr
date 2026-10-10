import { CalendarDays, Clock, MapPin } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { formatDate, getByeTeams, matchIsPlayed } from "@/lib/league";
import type { Match, MatchGoal, Team } from "@/lib/types";

function ScorerList({ goals, align }: { goals: MatchGoal[]; align: "home" | "away" }) {
  return (
    <ul className={`fixture-scorers fixture-scorers--${align}`}>
      {goals.map((goal) => (
        <li key={goal.id}>
          <span className="fixture-scorers__ball" aria-hidden>
            ⚽
          </span>
          {goal.playerName}
          {goal.count > 1 && ` (${goal.count})`}
          {goal.minute != null && <span className="fixture-scorers__minute">{goal.minute}&apos;</span>}
        </li>
      ))}
    </ul>
  );
}

export default function FixturesList({
  matches,
  allMatches,
  teams,
  goals = [],
  limit
}: {
  matches: Match[];
  /** Bay hesabı için tam fikstür; `matches` filtrelenmiş bir alt kümeyse verilmeli. */
  allMatches?: Match[];
  teams: Team[];
  goals?: MatchGoal[];
  limit?: number;
}) {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const goalsByMatch = goals.reduce<Map<string, MatchGoal[]>>((acc, goal) => {
    const list = acc.get(goal.matchId);
    if (list) list.push(goal);
    else acc.set(goal.matchId, [goal]);
    return acc;
  }, new Map());
  const byMinute = (a: MatchGoal, b: MatchGoal) => (a.minute ?? 999) - (b.minute ?? 999);
  const byes = getByeTeams(teams, allMatches || matches);
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
      {Object.entries(byRound).map(([round, roundMatches]) => {
        const byeTeam = byes.get(Number(round));
        return (
          <section className="fixture-round" key={round}>
            <h3>{round}. Hafta</h3>
            <div className="fixture-list">
              {roundMatches.map((match) => {
                const home = teamMap.get(match.homeId);
                const away = teamMap.get(match.awayId);
                if (!home || !away) return null;
                const played = matchIsPlayed(match);
                const matchGoals = played ? goalsByMatch.get(match.id) || [] : [];
                const homeGoals = matchGoals.filter((goal) => goal.teamId === home.id).sort(byMinute);
                const awayGoals = matchGoals.filter((goal) => goal.teamId === away.id).sort(byMinute);
                return (
                  <article className="fixture-card fixture-card--simple" key={match.id}>
                    <div className="fixture-card__meta">
                      <span className="fixture-meta-item">
                        <CalendarDays size={13} aria-hidden />
                        <em>Tarih:</em> {formatDate(match.date)}
                      </span>
                      <span className="fixture-card__meta-group">
                        {match.time && (
                          <span className="fixture-meta-item">
                            <Clock size={13} aria-hidden />
                            <em>Maç saati:</em> {match.time}
                          </span>
                        )}
                        {match.venue && (
                          <span className="fixture-meta-item">
                            <MapPin size={13} aria-hidden />
                            <em>Stad:</em> {match.venue}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="fixture-card__teams">
                      <div className="fixture-card__side fixture-card__side--home">
                        <TeamBadge team={home} size="sm" />
                      </div>
                      <strong className="fixture-score">
                        {played ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                      </strong>
                      <div className="fixture-card__side fixture-card__side--away">
                        <TeamBadge team={away} size="sm" />
                      </div>
                    </div>
                    {(homeGoals.length > 0 || awayGoals.length > 0) && (
                      <div className="fixture-card__teams fixture-card__goals">
                        <ScorerList goals={homeGoals} align="home" />
                        <span className="fixture-score fixture-score--spacer" aria-hidden />
                        <ScorerList goals={awayGoals} align="away" />
                      </div>
                    )}
                  </article>
                );
              })}
              {byeTeam && (
                <article className="fixture-card fixture-card--simple fixture-card--bye">
                  <div className="fixture-bye">
                    <span className="fixture-bye__tag">BAY</span>
                    <TeamBadge team={byeTeam} size="sm" />
                  </div>
                </article>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
