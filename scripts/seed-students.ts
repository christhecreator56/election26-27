import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, key);

const xlsxPath = path.join(__dirname, "..", "STUD_DATBS.xlsx");
const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

async function main() {
  let ok = 0;
  let fail = 0;
  const batchSize = 20;
  const students = rows
    .map((row) => ({
      admission: String(row["Admission Number"] ?? "").trim(),
      name: String(row["Name"] ?? "").trim(),
      cls: String(row["Class"] ?? "").trim(),
      section: String(row["Section"] ?? "").trim(),
    }))
    .filter((s) => s.admission);

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((s) =>
        supabase.rpc("upsert_student", {
          p_admission_number: s.admission,
          p_name: s.name,
          p_class: s.cls,
          p_section: s.section,
          p_password: s.admission,
        })
      )
    );
    for (let j = 0; j < results.length; j++) {
      if (results[j].error) {
        console.error(`Failed ${batch[j].admission}:`, results[j].error!.message);
        fail++;
      } else {
        ok++;
      }
    }
    process.stdout.write(`\rSeeded ${ok}/${students.length}...`);
  }
  console.log(`\nSeeded ${ok} students, ${fail} failures`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
