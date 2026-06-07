import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { getStudentSession } from "@/lib/session";
import type { StudentStatus } from "@/lib/types";

export async function GET() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc("get_student_status", {
    p_admission_number: session.admissionNumber,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const status = data as StudentStatus;
  return NextResponse.json({
    ...status,
    ok: true,
    name: session.name,
  });
}
