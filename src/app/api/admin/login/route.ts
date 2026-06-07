import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  const adminUser = process.env.ADMIN_USERNAME ?? "chris";
  const adminPass = process.env.ADMIN_PASSWORD ?? "1234";

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json(
      { ok: false, error: "invalid_credentials" },
      { status: 401 }
    );
  }

  await setAdminSession(username);
  return NextResponse.json({ ok: true });
}
