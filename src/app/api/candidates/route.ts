import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  const supabase = createSupabaseClient();
  let query = supabase
    .from("candidates")
    .select("id, role, name, image_url, display_order")
    .order("display_order");

  if (role === "spl" || role === "aspl") {
    query = query.eq("role", role);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, candidates: data });
}
