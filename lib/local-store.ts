import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { seedData, SEED_TEAM_IDS } from "@/lib/league";
import type { LeagueData, UserRole } from "@/lib/types";

export type LocalAccount = {
  id: string;
  /** Admin girişleri için */
  email?: string;
  /** Takım girişleri için */
  phone?: string;
  managerName?: string;
  password: string;
  role: UserRole;
  teamId: string | null;
};

export type LocalStore = {
  data: LeagueData;
  accounts: LocalAccount[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function defaultStore(): LocalStore {
  return {
    data: structuredClone(seedData),
    accounts: [
      {
        id: "local-admin",
        email: "admin@amdf.local",
        password: "admin123",
        role: "admin",
        teamId: null
      },
      {
        id: "local-team-1",
        phone: "05551234567",
        managerName: "Serkan Yılmaz",
        password: "takim123",
        role: "team",
        teamId: SEED_TEAM_IDS.t1
      }
    ]
  };
}

export function readLocalStore(): LocalStore {
  if (!existsSync(STORE_PATH)) {
    const store = defaultStore();
    writeLocalStore(store);
    return store;
  }

  try {
    const raw = JSON.parse(readFileSync(STORE_PATH, "utf8")) as LocalStore;
    return {
      data: {
        teams: raw.data?.teams || [],
        matches: raw.data?.matches || [],
        goals: raw.data?.goals || [],
        cards: raw.data?.cards || [],
        licenses: raw.data?.licenses || []
      },
      accounts: Array.isArray(raw.accounts) ? raw.accounts : defaultStore().accounts
    };
  } catch {
    const store = defaultStore();
    writeLocalStore(store);
    return store;
  }
}

export function writeLocalStore(store: LocalStore) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function updateLocalData(mutator: (data: LeagueData) => LeagueData) {
  const store = readLocalStore();
  store.data = mutator(store.data);
  writeLocalStore(store);
  return store.data;
}
