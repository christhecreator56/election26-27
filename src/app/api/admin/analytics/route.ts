import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { getAdminSession } from "@/lib/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = createSupabaseClient();
  
  // Fetch class, section and voting status for all students
  const { data: students, error } = await supabase
    .from("students")
    .select("class, section, has_voted_spl, has_voted_aspl");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Aggregate Turnout Statistics
  const classStats: Record<string, { class: string; total: number; voted: number }> = {};
  const sectionStats: Record<string, { section: string; total: number; voted: number }> = {};
  const classSectionStats: Record<string, { class: string; section: string; total: number; voted: number }> = {};

  let totalStudents = 0;
  let totalVoted = 0;

  students.forEach((s) => {
    totalStudents++;
    const hasVoted = s.has_voted_spl || s.has_voted_aspl;
    if (hasVoted) {
      totalVoted++;
    }

    const cls = s.class ? String(s.class).trim() : "Unknown";
    const sec = s.section ? String(s.section).trim() : "Unknown";
    const classSecKey = `${cls}-${sec}`;

    // Class stats
    if (!classStats[cls]) {
      classStats[cls] = { class: cls, total: 0, voted: 0 };
    }
    classStats[cls].total++;
    if (hasVoted) classStats[cls].voted++;

    // Section stats
    if (!sectionStats[sec]) {
      sectionStats[sec] = { section: sec, total: 0, voted: 0 };
    }
    sectionStats[sec].total++;
    if (hasVoted) sectionStats[sec].voted++;

    // Class-Section stats
    if (!classSectionStats[classSecKey]) {
      classSectionStats[classSecKey] = { class: cls, section: sec, total: 0, voted: 0 };
    }
    classSectionStats[classSecKey].total++;
    if (hasVoted) classSectionStats[classSecKey].voted++;
  });

  // Convert to sorted arrays
  const classArray = Object.values(classStats).sort((a, b) => a.class.localeCompare(b.class, undefined, { numeric: true }));
  const sectionArray = Object.values(sectionStats).sort((a, b) => a.section.localeCompare(b.section));
  const classSectionArray = Object.values(classSectionStats).sort((a, b) => {
    const classComp = a.class.localeCompare(b.class, undefined, { numeric: true });
    if (classComp !== 0) return classComp;
    return a.section.localeCompare(b.section);
  });

  return NextResponse.json({
    ok: true,
    summary: {
      total_students: totalStudents,
      total_voted: totalVoted,
      turnout_percentage: totalStudents > 0 ? parseFloat(((totalVoted / totalStudents) * 100).toFixed(2)) : 0
    },
    class_turnout: classArray,
    section_turnout: sectionArray,
    class_section_turnout: classSectionArray
  });
}
