const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      cookie: options.cookie ?? "",
    },
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, setCookie };
}

function extractCookie(setCookie, name) {
  const line = setCookie.find((c) => c.startsWith(`${name}=`));
  if (!line) return "";
  return line.split(";")[0];
}

async function main() {
  let passed = 0;
  let failed = 0;

  function assert(label, cond) {
    if (cond) {
      console.log(`✓ ${label}`);
      passed++;
    } else {
      console.error(`✗ ${label}`);
      failed++;
    }
  }

  // Invalid login
  const bad = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ admissionNumber: "00000" }),
  });
  assert("Invalid login returns 401", bad.status === 401);

  // Valid login
  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ admissionNumber: "7426" }),
  });
  const studentCookie = extractCookie(login.setCookie, "student_session");
  assert("Valid login returns 200", login.status === 200 && login.data.ok);
  assert("Routes to SPL", login.data.next_step === "spl");

  // Get candidates
  const cands = await request("/api/candidates?role=spl");
  assert("SPL candidates count 4", cands.data.candidates?.length === 4);

  // Cast SPL vote
  const splId = cands.data.candidates[0].id;
  const voteSpl = await request("/api/vote", {
    method: "POST",
    cookie: studentCookie,
    body: JSON.stringify({ role: "spl", candidateId: splId }),
  });
  assert("SPL vote succeeds", voteSpl.status === 200 && voteSpl.data.ok);

  // Duplicate SPL vote
  const dupSpl = await request("/api/vote", {
    method: "POST",
    cookie: studentCookie,
    body: JSON.stringify({ role: "spl", candidateId: splId }),
  });
  assert("Duplicate SPL vote rejected", dupSpl.status === 409);

  // ASPL vote
  const asplCands = await request("/api/candidates?role=aspl");
  const asplId = asplCands.data.candidates[0].id;
  const voteAspl = await request("/api/vote", {
    method: "POST",
    cookie: studentCookie,
    body: JSON.stringify({ role: "aspl", candidateId: asplId }),
  });
  assert("ASPL vote succeeds", voteAspl.status === 200 && voteAspl.data.ok);

  // Re-login after complete
  const relogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ admissionNumber: "7426" }),
  });
  assert("Re-login shows already voted", relogin.data.already_voted === true);

  // Admin login
  const adminLogin = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username: "chris", password: "1234" }),
  });
  const adminCookie = extractCookie(adminLogin.setCookie, "admin_session");
  assert("Admin login succeeds", adminLogin.status === 200);

  const results = await request("/api/admin/results", { cookie: adminCookie });
  assert("Admin results load", results.status === 200 && results.data.results);
  assert(
    "Audit log includes test voter",
    results.data.results.voters.some((v) => v.admission_number === "7426")
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
