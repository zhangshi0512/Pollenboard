"use client";

export interface TinyUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const USERS_KEY = "ta_users";
const SESSION_KEY = "ta_session";

function getUsers(): TinyUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setUsers(users: TinyUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(userId: string | null) {
  if (typeof window === "undefined") return;
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

function getSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  // In browsers only; not used on server
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `uid_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export const TinyAuth = {
  async signUp(email: string, password: string): Promise<TinyUser> {
    const users = getUsers();
    const exists = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      throw new Error("Email already in use");
    }
    const salt = generateId().slice(0, 8);
    const passwordHash = await sha256(`${password}:${salt}`);
    const user: TinyUser = {
      id: generateId(),
      email,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    setUsers(users);
    setSession(user.id);
    return user;
  },

  async signIn(email: string, password: string): Promise<TinyUser> {
    const users = getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) throw new Error("Invalid email or password");
    const hash = await sha256(`${password}:${user.salt}`);
    if (hash !== user.passwordHash)
      throw new Error("Invalid email or password");
    setSession(user.id);
    return user;
  },

  signOut(): void {
    setSession(null);
  },

  getCurrentUser(): TinyUser | null {
    const uid = getSessionUserId();
    if (!uid) return null;
    const users = getUsers();
    return users.find((u) => u.id === uid) || null;
  },

  deleteAccount(userId: string): void {
    const users = getUsers();
    const remaining = users.filter((u) => u.id !== userId);
    setUsers(remaining);

    // Remove per-user app data
    try {
      localStorage.removeItem(`pollenBoardPins:${userId}`);
      localStorage.removeItem(`pollenBoardTexts:${userId}`);
    } catch {}

    // Clear session if this user was logged in
    const current = getSessionUserId();
    if (current === userId) {
      setSession(null);
    }
  },
};
