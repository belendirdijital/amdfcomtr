import type { UserRole } from "@/lib/types";

export type LocalSession = {
  id: string;
  email?: string;
  phone?: string;
  managerName?: string;
  role: UserRole;
  teamId: string | null;
};

export const COOKIE_NAME = "amdf_local_session";

function secret() {
  return process.env.LOCAL_AUTH_SECRET || "amdf-local-dev-secret";
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  view.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(signature);
}

export async function encodeSession(session: LocalSession) {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function decodeSession(
  token: string | undefined | null
): Promise<LocalSession | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = await sign(payload);
  if (signature !== expected) return null;
  try {
    const json = new TextDecoder().decode(fromBase64Url(payload));
    return JSON.parse(json) as LocalSession;
  } catch {
    return null;
  }
}

export async function getLocalSession(): Promise<LocalSession | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
}
