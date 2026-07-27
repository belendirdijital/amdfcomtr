export type View = "overview" | "teams" | "fixtures" | "standings" | "fairplay";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  manager?: string;
};

export type Match = {
  id: string;
  round: number;
  homeId: string;
  awayId: string;
  date: string;
  time: string;
  venue: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type CardRecord = {
  id: string;
  teamId: string;
  player: string;
  yellow: number;
  red: number;
  note: string;
  createdAt: string;
};

export type LeagueData = {
  teams: Team[];
  matches: Match[];
  cards: CardRecord[];
};

export type StandingRow = {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};
