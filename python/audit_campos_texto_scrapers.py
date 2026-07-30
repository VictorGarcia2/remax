import json
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_PATH = os.path.join(BASE_DIR, "dataset_master.json")

with open(MASTER_PATH, "r", encoding="utf-8") as f:
    raw = json.load(f)

props = raw.get("propiedades", []) if isinstance(raw, dict) else raw

print("="*75)
print("     AUDITORÍA DE COMPLETITUD: COLONIA, MUNICIPIO, UBICACIÓN Y TÍTULO")
print("="*75)
print(f"Total Registros Analizados: {len(props):,}\n")

campos = [
    ("Título de Anuncio", "titulo"),
    ("Colonia", "colonia"),
    ("Municipio / Ciudad", "municipio"),
    ("Ubicación Raw", "ubicacion"),
    ("Dirección Formateada", "direccion")
]

# General
print("📊 RESULTADOS GENERALES (10,659 PROPIEDADES):")
print("-" * 75)
print(f"  {'Campo':<24} | {'Presentes':<12} | {'Porcentaje %':<12}")
print("-" * 75)
for nombre, key in campos:
    count = sum(1 for p in props if p.get(key) is not None and str(p.get(key)).strip() != "" and str(p.get(key)).lower() != "n/a")
    pct = (count / len(props)) * 100
    print(f"  {nombre:<24} | {count:6d} / {len(props):6d} | {pct:6.2f}%")

print("\n" + "="*75)

# Desglose por portal
portales = {}
for p in props:
    fuente = p.get("fuente") or "Desconocido"
    if fuente not in portales:
        portales[fuente] = []
    portales[fuente].append(p)

for fuente, items in portales.items():
    total_portal = len(items)
    print(f"\n📌 PORTAL: {fuente.upper()} ({total_portal:,} propiedades)")
    print("-" * 75)
    print(f"  {'Campo':<24} | {'Presentes':<12} | {'Porcentaje %':<12}")
    print("-" * 75)
    for nombre, key in campos:
        count = sum(1 for p in items if p.get(key) is not None and str(p.get(key)).strip() != "" and str(p.get(key)).lower() != "n/a")
        pct = (count / total_portal) * 100
        print(f"  {nombre:<24} | {count:6d} / {total_portal:6d} | {pct:6.2f}%")

print("="*75)
