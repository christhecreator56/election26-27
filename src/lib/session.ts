import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const STUDENT_COOKIE = "student_session";
const ADMIN_COOKIE = "admin_session";

function getSecret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "rosary-election-dev-secret"
  );
}

export type StudentSession = {
  type: "student";
  admissionNumber: string;
  name: string;
};

export type AdminSession = {
  type: "admin";
  username: string;
};

export async function setStudentSession(data: Omit<StudentSession, "type">) {
  const token = await new SignJWT({ ...data, type: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "student") return null;
    return payload as unknown as StudentSession;
  } catch {
    return null;
  }
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_COOKIE);
}

export async function setAdminSession(username: string) {
  const token = await new SignJWT({ type: "admin", username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "admin") return null;
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
