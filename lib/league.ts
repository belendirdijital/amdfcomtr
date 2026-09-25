import type {
  CardRecord,
  LeagueData,
  Match,
  MatchGoal,
  ScorerRow,
  StandingRow,
  Team
} from "./types";

export const TEAM_COLORS = [
  "#F05A28",
  "#2B6EF2",
  "#14A673",
  "#7C4DFF",
  "#D9A20B",
  "#D33E55",
  "#1294A6",
  "#4E5969"
];

export const SEED_TEAM_IDS = {
  t1: "11111111-1111-1111-1111-111111111101",
  t2: "11111111-1111-1111-1111-111111111102",
  t3: "11111111-1111-1111-1111-111111111103",
  t4: "11111111-1111-1111-1111-111111111104",
  t5: "11111111-1111-1111-1111-111111111105",
  t6: "11111111-1111-1111-1111-111111111106"
} as const;

export const seedTeams: Team[] = [
  {
    id: SEED_TEAM_IDS.t1,
    name: "AMDF Veteranlar",
    shortName: "AMDF",
    color: "#F05A28",
    secondaryColor: "#2B6EF2",
    manager: "Serkan Yılmaz",
    contactPhone: "05551234567"
  },
  {
    id: SEED_TEAM_IDS.t2,
    name: "Anadolu 1985",
    shortName: "AND",
    color: "#2B6EF2",
    secondaryColor: "#D33E55",
    manager: "Murat Kaya",
    contactPhone: ""
  },
  {
    id: SEED_TEAM_IDS.t3,
    name: "Boğazın Kartalları",
    shortName: "BJK",
    color: "#4E5969",
    secondaryColor: "#D33E55",
    manager: "Levent Akın",
    contactPhone: ""
  },
  {
    id: SEED_TEAM_IDS.t4,
    name: "Kuzey Yıldızı",
    shortName: "KZY",
    color: "#14A673",
    secondaryColor: "#4E5969",
    manager: "Hakan Demir",
    contactPhone: ""
  },
  {
    id: SEED_TEAM_IDS.t5,
    name: "Şehrin Efsaneleri",
    shortName: "ŞEF",
    color: "#7C4DFF",
    secondaryColor: "#D9A20B",
    manager: "Orhan Şen",
    contactPhone: ""
  },
  {
    id: SEED_TEAM_IDS.t6,
    name: "Altın Kramponlar",
    shortName: "AKR",
    color: "#D9A20B",
    secondaryColor: "#4E5969",
    manager: "Turgay Öz",
    contactPhone: ""
  }
];

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function generateFixtures(teams: Team[], withDemoResults = false): Match[] {
  if (teams.length < 2) return [];
  const ids: Array<string | null> = teams.map((team) => team.id);
  if (ids.length % 2) ids.push(null);

  const roundsPerLeg = ids.length - 1;
  const matchesPerRound = ids.length / 2;
  const firstLeg: Match[] = [];
  let rotation = [...ids];
  const start = new Date(2026, 7, 29);

  for (let round = 0; round < roundsPerLeg; round += 1) {
    for (let index = 0; index < matchesPerRound; index += 1) {
      const a = rotation[index];
      const b = rotation[rotation.length - 1 - index];
      if (!a || !b) continue;
      const flip = (round + index) % 2 === 1;
      const homeId = flip ? b : a;
      const awayId = flip ? a : b;
      const date = new Date(start);
      date.setDate(start.getDate() + round * 7);
      const demoScores = [
        [2, 1],
        [1, 1],
        [0, 2],
        [3, 0],
        [2, 2],
        [1, 0]
      ];
      const score =
        withDemoResults && round < 2
          ? demoScores[(round * matchesPerRound + index) % demoScores.length]
          : null;

      firstLeg.push({
        id: newId(),
        round: round + 1,
        homeId,
        awayId,
        date: isoDate(date),
        time: `${String(18 + index).padStart(2, "0")}:00`,
        venue: "AMDF Arena",
        homeScore: score ? score[0] : null,
        awayScore: score ? score[1] : null
      });
    }
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
  }

  const secondLeg = firstLeg.map((match) => {
    const date = new Date(`${match.date}T12:00:00`);
    date.setDate(date.getDate() + roundsPerLeg * 7);
    return {
      ...match,
      id: newId(),
      round: match.round + roundsPerLeg,
      homeId: match.awayId,
      awayId: match.homeId,
      date: isoDate(date),
      homeScore: null,
      awayScore: null
    };
  });

  return [...firstLeg, ...secondLeg];
}

export function getStandings(teams: Team[], matches: Match[]): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  teams.forEach((team) => {
    rows.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0
    });
  });

  matches.forEach((match) => {
    if (match.homeScore === null || match.awayScore === null) return;
    const home = rows.get(match.homeId);
    const away = rows.get(match.awayId);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.gf += match.homeScore;
    home.ga += match.awayScore;
    away.gf += match.awayScore;
    away.ga += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  return [...rows.values()]
    .map((row) => ({ ...row, gd: row.gf - row.ga }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.team.name.localeCompare(b.team.name, "tr")
    );
}

export function getCardTotals(teams: Team[], cards: CardRecord[]) {
  return teams
    .map((team) => {
      const teamCards = cards.filter((card) => card.teamId === team.id);
      const yellow = teamCards.reduce((sum, card) => sum + card.yellow, 0);
      const red = teamCards.reduce((sum, card) => sum + card.red, 0);
      return { team, yellow, red, penalty: yellow + red * 3 };
    })
    .sort(
      (a, b) =>
        a.penalty - b.penalty ||
        a.red - b.red ||
        a.team.name.localeCompare(b.team.name, "tr")
    );
}

export function getTopScorers(teams: Team[], goals: MatchGoal[]): ScorerRow[] {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const totals = new Map<string, ScorerRow>();

  goals.forEach((goal) => {
    const team = teamMap.get(goal.teamId);
    if (!team) return;
    const key = `${goal.teamId}::${goal.playerName.trim().toLocaleLowerCase("tr-TR")}`;
    const existing = totals.get(key);
    if (existing) {
      existing.goals += goal.count;
      return;
    }
    totals.set(key, {
      playerName: goal.playerName.trim(),
      team,
      goals: goal.count
    });
  });

  return [...totals.values()].sort(
    (a, b) =>
      b.goals - a.goals ||
      a.playerName.localeCompare(b.playerName, "tr") ||
      a.team.name.localeCompare(b.team.name, "tr")
  );
}

export const seedCards: CardRecord[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    teamId: SEED_TEAM_IDS.t2,
    player: "Emre K.",
    yellow: 1,
    red: 0,
    note: "Sportmenlik dışı hareket",
    createdAt: "2026-08-29"
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    teamId: SEED_TEAM_IDS.t3,
    player: "Cenk A.",
    yellow: 2,
    red: 0,
    note: "Maç sonu toplamı",
    createdAt: "2026-09-05"
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    teamId: SEED_TEAM_IDS.t6,
    player: "Ahmet T.",
    yellow: 0,
    red: 1,
    note: "Doğrudan kırmızı kart",
    createdAt: "2026-09-05"
  }
];

export const seedGoals: MatchGoal[] = [];

export const seedData: LeagueData = {
  teams: seedTeams,
  matches: generateFixtures(seedTeams, true),
  goals: seedGoals,
  cards: seedCards,
  licenses: [],
  slides: [],
  banners: []
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export function formatDate(date: string) {
  if (!date) return "Tarih planlanmadı";
  const parsedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "Tarih planlanmadı";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(parsedDate);
}

export function matchIsPlayed(match: Match) {
  return match.homeScore !== null && match.awayScore !== null;
}

export function createTeamShortName(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const shortName =
    words.length > 1
      ? words.map((word) => word[0]).join("")
      : words[0]?.slice(0, 3) || "TKM";
  return shortName.toLocaleUpperCase("tr-TR").slice(0, 4);
}
