import { cookies } from "next/headers";

export const SESSION_COOKIE = "placement_session";

export interface UserSession {
  userId: string;
  username: string;
  role: "admin" | "student";
  studentId?: string | null;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const jsonStr = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(jsonStr) as UserSession;
  } catch {
    return null;
  }
}

export async function isAdminSession(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

export async function isStudentSession(studentId: string): Promise<boolean> {
  const session = await getSession();
  return session?.role === "student" && session.studentId === studentId;
}

export async function setSession(session: UserSession) {
  const cookieStore = await cookies();
  const token = Buffer.from(JSON.stringify(session)).toString("base64");
  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Backwards compatibility wrappers
export async function clearAdminSession() {
  await clearSession();
}

export async function setAdminSession() {
  await setSession({
    userId: "admin-id",
    username: "admin",
    role: "admin"
  });
}
