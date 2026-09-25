import type {
  CardRecord,
  Match,
  MatchGoal,
  PlayerLicense,
  Profile,
  SiteBanner,
  SiteSlide,
  SlideFeature,
  Team,
  UserRole
} from "./types";

type TeamRow = {
  id: string;
  name: string;
  short_name: string;
  color: string;
  secondary_color: string;
  manager: string | null;
  contact_phone: string | null;
};

type MatchRow = {
  id: string;
  round: number;
  home_id: string;
  away_id: string;
  date: string;
  time: string;
  venue: string;
  home_score: number | null;
  away_score: number | null;
};

type GoalRow = {
  id: string;
  match_id: string;
  team_id: string;
  player_name: string;
  minute: number | null;
  count: number;
};

type CardRow = {
  id: string;
  team_id: string;
  player: string;
  yellow: number;
  red: number;
  note: string;
  created_at: string;
};

type LicenseRow = {
  id: string;
  team_id: string;
  license_no: string;
  first_name: string;
  last_name: string;
  national_id: string;
  birth_date: string;
  birth_place: string;
  blood_type: string;
  club: string;
  registration_date: string;
  visa_season: string;
  player_photo: string;
  club_logo: string;
  federation_logo: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  role: UserRole;
  team_id: string | null;
};

type SlideRow = {
  id: string;
  eyebrow: string;
  title: string;
  title_highlight: string;
  description: string;
  cta_label: string;
  cta_href: string;
  image_url: string;
  features: SlideFeature[] | null;
  sort_order: number;
  enabled: boolean;
};

type BannerRow = {
  id: string;
  category: string;
  title: string;
  description: string;
  button_label: string;
  href: string;
  image_url: string;
  sort_order: number;
  enabled: boolean;
};

export function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    color: row.color,
    secondaryColor: row.secondary_color,
    manager: row.manager || "",
    contactPhone: row.contact_phone || ""
  };
}

export function toTeamRow(team: Team) {
  return {
    id: team.id,
    name: team.name,
    short_name: team.shortName,
    color: team.color,
    secondary_color: team.secondaryColor,
    manager: team.manager || "",
    contact_phone: team.contactPhone || ""
  };
}

export function mapMatch(row: MatchRow): Match {
  return {
    id: row.id,
    round: row.round,
    homeId: row.home_id,
    awayId: row.away_id,
    date: row.date,
    time: row.time,
    venue: row.venue,
    homeScore: row.home_score,
    awayScore: row.away_score
  };
}

export function toMatchRow(match: Match) {
  return {
    id: match.id,
    round: match.round,
    home_id: match.homeId,
    away_id: match.awayId,
    date: match.date,
    time: match.time,
    venue: match.venue,
    home_score: match.homeScore,
    away_score: match.awayScore
  };
}

export function mapGoal(row: GoalRow): MatchGoal {
  return {
    id: row.id,
    matchId: row.match_id,
    teamId: row.team_id,
    playerName: row.player_name,
    minute: row.minute,
    count: row.count
  };
}

export function toGoalRow(goal: MatchGoal) {
  return {
    id: goal.id,
    match_id: goal.matchId,
    team_id: goal.teamId,
    player_name: goal.playerName,
    minute: goal.minute,
    count: goal.count
  };
}

export function mapCard(row: CardRow): CardRecord {
  return {
    id: row.id,
    teamId: row.team_id,
    player: row.player,
    yellow: row.yellow,
    red: row.red,
    note: row.note,
    createdAt: row.created_at?.slice(0, 10) || row.created_at
  };
}

export function toCardRow(card: CardRecord) {
  return {
    id: card.id,
    team_id: card.teamId,
    player: card.player,
    yellow: card.yellow,
    red: card.red,
    note: card.note,
    created_at: card.createdAt
  };
}

export function mapLicense(row: LicenseRow): PlayerLicense {
  return {
    id: row.id,
    teamId: row.team_id,
    licenseNo: row.license_no,
    firstName: row.first_name,
    lastName: row.last_name,
    nationalId: row.national_id,
    birthDate: row.birth_date,
    birthPlace: row.birth_place,
    bloodType: row.blood_type,
    club: row.club,
    registrationDate: row.registration_date,
    visaSeason: row.visa_season,
    playerPhoto: row.player_photo,
    clubLogo: row.club_logo,
    federationLogo: row.federation_logo || "",
    createdAt: row.created_at
  };
}

export function toLicenseRow(license: PlayerLicense) {
  return {
    id: license.id,
    team_id: license.teamId,
    license_no: license.licenseNo,
    first_name: license.firstName,
    last_name: license.lastName,
    national_id: license.nationalId,
    birth_date: license.birthDate,
    birth_place: license.birthPlace,
    blood_type: license.bloodType,
    club: license.club,
    registration_date: license.registrationDate,
    visa_season: license.visaSeason,
    player_photo: license.playerPhoto,
    club_logo: license.clubLogo,
    federation_logo: license.federationLogo || "",
    created_at: license.createdAt
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    role: row.role,
    teamId: row.team_id
  };
}

function normalizeFeatures(raw: SlideFeature[] | null | undefined): SlideFeature[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      title: String(item?.title || "").trim(),
      subtitle: String(item?.subtitle || "").trim()
    }))
    .filter((item) => item.title);
}

export function mapSlide(row: SlideRow): SiteSlide {
  return {
    id: row.id,
    eyebrow: row.eyebrow || "",
    title: row.title,
    titleHighlight: row.title_highlight || "",
    description: row.description || "",
    ctaLabel: row.cta_label || "",
    ctaHref: row.cta_href || "",
    imageUrl: row.image_url,
    features: normalizeFeatures(row.features),
    sortOrder: row.sort_order ?? 0,
    enabled: Boolean(row.enabled)
  };
}

export function toSlideRow(slide: SiteSlide) {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow || "",
    title: slide.title,
    title_highlight: slide.titleHighlight || "",
    description: slide.description || "",
    cta_label: slide.ctaLabel || "",
    cta_href: slide.ctaHref || "",
    image_url: slide.imageUrl,
    features: normalizeFeatures(slide.features),
    sort_order: slide.sortOrder ?? 0,
    enabled: Boolean(slide.enabled)
  };
}

export function mapBanner(row: BannerRow): SiteBanner {
  return {
    id: row.id,
    category: row.category || "",
    title: row.title,
    description: row.description || "",
    buttonLabel: row.button_label || "",
    href: row.href || "",
    imageUrl: row.image_url,
    sortOrder: row.sort_order ?? 0,
    enabled: Boolean(row.enabled)
  };
}

export function toBannerRow(banner: SiteBanner) {
  return {
    id: banner.id,
    category: banner.category || "",
    title: banner.title,
    description: banner.description || "",
    button_label: banner.buttonLabel || "",
    href: banner.href || "",
    image_url: banner.imageUrl,
    sort_order: banner.sortOrder ?? 0,
    enabled: Boolean(banner.enabled)
  };
}
