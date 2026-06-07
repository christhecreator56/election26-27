import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function checkStudents() {
  const { data, error } = await supabase
    .from("candidates")
    .select("id, role, name, image_url, display_order");
  
  if (error) {
    console.error("Error fetching candidates:", error.message);
  } else {
    console.log("All candidates:", data);
  }
}

checkStudents();
