import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { getStudentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const role = body.role as string;
  const candidateId = body.candidateId as string;

  if (!role || !candidateId) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc("cast_vote", {
    p_admission_number: session.admissionNumber,
    p_role: role,
    p_candidate_id: candidateId,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const result = data as { ok: boolean; error?: string; next_step?: string };

  if (!result.ok) {
    const status = result.error === "already_voted" ? 409 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, next_step: result.next_step });
}
