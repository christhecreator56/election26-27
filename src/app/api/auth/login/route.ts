import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { setStudentSession } from "@/lib/session";
import type { LoginResult } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const admissionNumber = String(body.admissionNumber ?? "").trim();

  if (!admissionNumber) {
    return NextResponse.json(
      { ok: false, error: "invalid_credentials" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc("verify_student", {
    p_admission_number: admissionNumber,
    p_password: admissionNumber,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 }
    );
  }

  const result = data as LoginResult;

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "invalid_credentials" },
      { status: 401 }
    );
  }

  if (result.already_voted) {
    return NextResponse.json({
      ok: true,
      already_voted: true,
      name: result.name,
    });
  }

  await setStudentSession({
    admissionNumber: result.admission_number!,
    name: result.name!,
  });

  return NextResponse.json({
    ok: true,
    already_voted: false,
    name: result.name,
    next_step: result.next_step,
  });
}
