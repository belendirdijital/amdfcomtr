import {
  CalendarDays,
  Crosshair,
  Percent,
  ShieldCheck,
  Trophy,
  UsersRound
} from "lucide-react";
import {
  getCardTotals,
  getStandings,
  getTopScorers,
  matchIsPlayed
} from "@/lib/league";
import type { LeagueData } from "@/lib/types";

export default function LeagueMetrics({
  data,
  className
}: {
  data: Pick<LeagueData, "teams" | "matches" | "goals" | "cards">;
  className?: string;
}) {
  const { teams, matches, goals, cards } = data;
  const playedCount = matches.filter(matchIsPlayed).length;
  const completionPct =
    matches.length === 0 ? 0 : Math.round((playedCount / matches.length) * 100);
  const standings = getStandings(teams, matches);
  const scorers = getTopScorers(teams, goals);
  const fairPlay = getCardTotals(teams, cards);
  const leaderName = standings[0]?.team.name || "—";
  const scorerName = scorers[0]?.playerName || "—";
  const fairPlayName = fairPlay[0]?.team.name || "—";

  return (
    <div className={["metric-grid", className].filter(Boolean).join(" ")}>
      <article className="metric-card">
        <span className="metric-card__icon metric-card__icon--green">
          <UsersRound size={15} strokeWidth={2.2} />
        </span>
        <div>
          <span>Takım</span>
          <strong>{teams.length}</strong>
        </div>
      </article>
      <article className="metric-card">
        <span className="metric-card__icon metric-card__icon--blue">
          <CalendarDays size={15} strokeWidth={2.2} />
        </span>
        <div>
          <span>Maç</span>
          <strong>
            {playedCount}/{matches.length}
          </strong>
        </div>
      </article>
      <article className="metric-card metric-card--progress">
        <span className="metric-card__icon metric-card__icon--orange">
          <Percent size={15} strokeWidth={2.2} />
        </span>
        <div>
          <span>Tamamlanma</span>
          <strong>%{completionPct}</strong>
          <div
            className="metric-card__bar"
            role="progressbar"
            aria-valuenow={completionPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Lig tamamlanma oranı"
          >
            <i style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </article>
      <article className="metric-card">
        <span className="metric-card__icon metric-card__icon--yellow">
          <Trophy size={15} strokeWidth={2.2} />
        </span>
        <div>
          <span>Lider</span>
          <strong className="metric-card__value--text" title={leaderName !== "—" ? leaderName : undefined}>
            {leaderName}
          </strong>
        </div>
      </article>
      <article className="metric-card">
        <span className="metric-card__icon metric-card__icon--red">
          <Crosshair size={15} strokeWidth={2.2} />
        </span>
        <div>
          <span>Gol kralı</span>
          <strong className="metric-card__value--text" title={scorerName !== "—" ? scorerName : undefined}>
            {scorerName}
          </strong>
        </div>
      </article>
      <article className="metric-card">
        <span className="metric-card__icon metric-card__icon--teal">
          <ShieldCheck size={15} strokeWidth={2.2} />
        </span>
        <div>
          <span>Fair play</span>
          <strong className="metric-card__value--text" title={fairPlayName !== "—" ? fairPlayName : undefined}>
            {fairPlayName}
          </strong>
        </div>
      </article>
    </div>
  );
}
