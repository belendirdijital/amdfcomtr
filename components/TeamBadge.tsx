import { initials } from "@/lib/league";
import type { Team } from "@/lib/types";

export default function TeamBadge({
  team,
  size = "md",
  showName = true
}: {
  team: Team;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}) {
  return (
    <div className={`team-badge team-badge--${size}`}>
      <span
        className="team-mark"
        style={{
          background: `linear-gradient(135deg, ${team.color} 0 50%, ${team.secondaryColor || team.color} 50% 100%)`
        }}
      >
        {initials(team.name)}
      </span>
      {showName && <span className="team-badge__name">{team.name}</span>}
    </div>
  );
}
