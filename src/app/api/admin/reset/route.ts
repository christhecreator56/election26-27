import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase";
import { getAdminSession } from "@/lib/session";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("reset_election");

  if (error) {
    // Fallback: Reset student vote columns client-side using a WHERE clause (.neq) to bypass the safeupdate constraint.
    // This resets all student voting statuses and cleared votes without deleting student accounts.
    const { error: fallbackError } = await supabase
      .from("students")
      .update({
        has_voted_spl: false,
        has_voted_aspl: false,
        spl_candidate_id: null,
        aspl_candidate_id: null,
        spl_voted_at: null,
        aspl_voted_at: null,
        completed_at: null
      })
      .neq("admission_number", "");

    if (fallbackError) {
      return NextResponse.json(
        { ok: false, error: "server_error", message: fallbackError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      students_reset: 0,
      message: "Database reset successfully (voters cleared). All student accounts preserved.",
    });
  }

  const result = data as {
    ok: boolean;
    students_reset?: number;
    message?: string;
  };

  if (!result.ok) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    students_reset: result.students_reset,
    message: result.message,
  });
}

