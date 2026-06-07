import os
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "STUD_DATBS.xlsx")
OUT_DIR = os.path.join(ROOT, "scripts", "seed_batches")

wb = openpyxl.load_workbook(XLSX)
ws = wb.active
rows = list(ws.iter_rows(min_row=2, values_only=True))

os.makedirs(OUT_DIR, exist_ok=True)
batch_size = 40
batches = []

for i in range(0, len(rows), batch_size):
    batch = rows[i : i + batch_size]
    calls = []
    for r in batch:
        if not r[1]:
            continue
        adm = str(r[1]).replace("'", "''")
        name = str(r[2]).replace("'", "''")
        cls = str(r[3]).replace("'", "''")
        sec = str(r[4]).replace("'", "''")
        calls.append(
            f"SELECT upsert_student('{adm}', '{name}', '{cls}', '{sec}', '{adm}');"
        )
    batches.append("\n".join(calls))

for idx, content in enumerate(batches):
    path = os.path.join(OUT_DIR, f"batch_{idx:03d}.sql")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Generated {len(batches)} batches for {len(rows)} students")
