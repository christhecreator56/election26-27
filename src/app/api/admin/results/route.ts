import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { getAdminSession } from "@/lib/session";
import type { ElectionResults } from "@/lib/types";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.rpc("get_election_results");

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, results: data as ElectionResults });
}
