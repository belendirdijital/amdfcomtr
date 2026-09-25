export type UserRole = "admin" | "team";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  manager?: string;
  contactPhone?: string;
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

export type MatchGoal = {
  id: string;
  matchId: string;
  teamId: string;
  playerName: string;
  minute: number | null;
  count: number;
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

export type PlayerLicense = {
  id: string;
  teamId: string;
  licenseNo: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  birthPlace: string;
  bloodType: string;
  club: string;
  registrationDate: string;
  visaSeason: string;
  playerPhoto: string;
  clubLogo: string;
  federationLogo: string;
  createdAt: string;
};

export type Profile = {
  id: string;
  role: UserRole;
  teamId: string | null;
};

export type LeagueData = {
  teams: Team[];
  matches: Match[];
  goals: MatchGoal[];
  cards: CardRecord[];
  licenses: PlayerLicense[];
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

export type ScorerRow = {
  playerName: string;
  team: Team;
  goals: number;
};
