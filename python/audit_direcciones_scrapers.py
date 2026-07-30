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

print("="*70)
print("     AUDITORÍA DE DIRECCIONES Y UBICACIONES POR PORTAL DE SCRAPING")
print("="*70)
print(f"Total Registros Analizados: {len(props):,}\n")

portales = {}
for p in props:
    fuente = p.get("fuente") or "Desconocido"
    if fuente not in portales:
        portales[fuente] = []
    portales[fuente].append(p)

for fuente, items in portales.items():
    total_portal = len(items)
    print(f"📌 PORTAL: {fuente.upper()} ({total_portal:,} propiedades)")
    print("-" * 70)
    
    con_direccion = 0
    con_colonia = 0
    con_municipio = 0
    incompletas = 0 # Menos de 12 caracteres o sólo nombre de municipio
    muestras_incompletas = []
    muestras_completas = []

    for item in items:
        direccion = (item.get("direccion") or item.get("ubicacion") or "").strip()
        colonia = (item.get("colonia") or "").strip()
        municipio = (item.get("municipio") or "").strip()
        
        if direccion:
            con_direccion += 1
        if colonia:
            con_colonia += 1
        if municipio:
            con_municipio += 1
            
        # Evaluar calidad de la dirección
        texto_combo = f"{direccion} {colonia} {municipio}".strip()
        if len(direccion) < 12 or direccion.lower() in ("veracruz", "boca del rio", "medellin", "tabasco", "villahermosa", "sin colonia", "n/a"):
            incompletas += 1
            if len(muestras_incompletas) < 4:
                muestras_incompletas.append(f"Dir: '{direccion}' | Col: '{colonia}' | Mun: '{municipio}'")
        else:
            if len(muestras_completas) < 2:
                muestras_completas.append(f"Dir: '{direccion}' | Col: '{colonia}'")

    pct_dir = (con_direccion / total_portal) * 100
    pct_col = (con_colonia / total_portal) * 100
    pct_incompleta = (incompletas / total_portal) * 100

    print(f"  • Direcciones Presentes  : {con_direccion:5d} / {total_portal:5d} ({pct_dir:6.2f}%)")
    print(f"  • Colonias Presentes     : {con_colonia:5d} / {total_portal:5d} ({pct_col:6.2f}%)")
    print(f"  • Direcciones Incompletas: {incompletas:5d} / {total_portal:5d} ({pct_incompleta:6.2f}%)")
    
    print("\n  🔍 Ejemplos de Direcciones Incompletas/Vagas:")
    if muestras_incompletas:
        for m in muestras_incompletas:
            print(f"     ⚠️ {m}")
    else:
        print("     ✅ Ninguna encontrada.")
        
    print("\n  ✨ Ejemplos de Direcciones Completas:")
    for m in muestras_completas:
        print(f"     ✅ {m}")
    print("\n" + "="*70)
