import json
import os
import sys
from collections import defaultdict

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
print("     AUDITORÍA Y DETECCIÓN DE PROPIEDADES DUPLICADAS EN EL DATASET")
print("="*70)
print(f"Total Registros Actuales: {len(props):,}\n")

# 1. Duplicados exactos por URL
urls = defaultdict(list)
for p in props:
    u = p.get("url_origen") or (p.get("urls_portales") or [""])[0]
    if u:
        urls[u].append(p)

dup_urls = {u: items for u, items in urls.items() if len(items) > 1}
print(f"📌 1. Duplicados Exactos por URL Directa: {sum(len(v)-1 for v in dup_urls.values()):,} propiedades repetidas")

# 2. Duplicados Multi-Portal por Firma Geoespacial (Misma Ubicación + Caracteristicas)
firmas = defaultdict(list)
for p in props:
    col = (p.get("colonia") or "").strip().lower()
    mun = (p.get("municipio") or "").strip().lower()
    tipo = (p.get("tipo_propiedad") or "").strip().lower()
    m2 = round(float(p.get("m2_construidos") or 0) / 5) * 5 # Redondeado a bloques de 5m2
    rec = int(p.get("recamaras") or 0)
    ban = int(p.get("banos") or 0)
    lat = round(float(p.get("latitud") or 0), 3)
    lng = round(float(p.get("longitud") or 0), 3)

    if lat != 0 and lng != 0:
        fp = f"{tipo}|{mun}|{col}|{rec}|{ban}|{m2}|{lat}|{lng}"
    else:
        fp = f"{tipo}|{mun}|{col}|{rec}|{ban}|{m2}"

    firmas[fp].append(p)

dup_firmas = {fp: items for fp, items in firmas.items() if len(items) > 1}
total_repetidas_fp = sum(len(v) - 1 for v in dup_firmas.values())
print(f"📌 2. Duplicados Multi-Portal por Huella Digital: {total_repetidas_fp:,} propiedades duplicadas entre portales")

print("\n🔍 Ejemplos de Propiedades Repetidas en Múltiples Portales:")
count_ex = 0
for fp, items in dup_firmas.items():
    if count_ex >= 3:
        break
    fuentes = list(set(p.get("fuente") for p in items))
    if len(fuentes) > 1: # Aparece en más de 1 portal
        count_ex += 1
        print(f"\n  • Firma: {items[0].get('titulo')} ({items[0].get('direccion')})")
        for it in items:
            print(f"    - Portal: {it.get('fuente'):12s} | Precio: ${it.get('precio_valor'):,.0f} | m2: {it.get('m2_construidos')} | URL: {it.get('url_origen')[:60]}...")

print("\n" + "="*70)
