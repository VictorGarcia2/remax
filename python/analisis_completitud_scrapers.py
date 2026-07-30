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

print("="*65)
print("     AUDITORÍA DE INTEGRIDAD Y COMPLETITUD DE DATOS POR PORTAL")
print("="*65)
print(f"Total Registros Consolidados en Base de Datos: {len(props):,}\n")

portales = {}
for p in props:
    fuente = p.get("fuente") or "Desconocido"
    if fuente not in portales:
        portales[fuente] = []
    portales[fuente].append(p)

campos_clave = [
    ("Precio ($)", "precio_valor"),
    ("Metros Const. (m²)", "m2_construidos"),
    ("Metros Terreno (m²)", "m2_totales"),
    ("Recámaras", "recamaras"),
    ("Baños", "banos"),
    ("Estacionamientos", "estacionamientos"),
    ("Latitud", "latitud"),
    ("Longitud", "longitud"),
    ("Colonia", "colonia"),
    ("Municipio", "municipio"),
    ("URL Origen", "urls_portales")
]

for fuente, items in portales.items():
    total_portal = len(items)
    print(f"📌 PORTAL: {fuente.upper()} ({total_portal:,} propiedades extraídas)")
    print("-" * 65)
    print(f"  {'Campo':<24} | {'Completos':<12} | {'Porcentaje %':<12}")
    print("-" * 65)
    
    for nombre_c, field in campos_clave:
        completos = 0
        for item in items:
            val = item.get(field)
            if val is not None and val != "" and val != 0 and val != []:
                completos += 1
        pct = (completos / total_portal) * 100
        print(f"  {nombre_c:<24} | {completos:6d} / {total_portal:6d} | {pct:6.2f}%")
    print("\n")

print("="*65)
