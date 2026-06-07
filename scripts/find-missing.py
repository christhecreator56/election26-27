import openpyxl
import os
import json
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = {}
with open(os.path.join(ROOT, ".env.local")) as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split("=", 1)
            env[k] = v

url = env["NEXT_PUBLIC_SUPABASE_URL"]
key = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

# Fetch all DB admission numbers via RPC workaround - use rest API
req = urllib.request.Request(
    f"{url}/rest/v1/students?select=admission_number,name",
    headers={"apikey": key, "Authorization": f"Bearer {key}"},
)
with urllib.request.urlopen(req) as resp:
    db_rows = json.loads(resp.read())

db_adms = {r["admission_number"]: r["name"] for r in db_rows}

wb = openpyxl.load_workbook(os.path.join(ROOT, "STUD_DATBS.xlsx"))
ws = wb.active
excel_rows = []
for r in ws.iter_rows(min_row=2, values_only=True):
    if not r[1]:
        continue
    adm = str(r[1]).strip()
    excel_rows.append((adm, str(r[2]).strip(), r[0]))

excel_adms = {a[0] for a in excel_rows}
missing_in_db = sorted(excel_adms - set(db_adms.keys()))
extra_in_db = sorted(set(db_adms.keys()) - excel_adms)

print(f"Excel unique admissions: {len(excel_adms)}")
print(f"DB students: {len(db_adms)}")
print(f"Missing in DB ({len(missing_in_db)}):", missing_in_db)
print(f"Extra in DB only ({len(extra_in_db)}):", extra_in_db[:10])

from collections import Counter
c = Counter(a[0] for a in excel_rows)
for adm, count in c.items():
    if count > 1:
        names = [x[1] for x in excel_rows if x[0] == adm]
        print(f"Duplicate {adm} ({count}x): {names}")
        print(f"  In DB as: {db_adms.get(adm, 'NOT FOUND')}")
