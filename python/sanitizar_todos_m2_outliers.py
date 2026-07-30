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
print("     LIMPIEZA Y SANITIZACIÓN GLOBAL DE ERRORES DE ESCALA DE M²")
print("="*70)
print(f"Total Registros en Dataset Master: {len(props):,}\n")

corregidos_m2 = 0
descartados = 0

for p in props:
    m2 = float(p.get("m2_construidos") or 0.0)
    m2_tot = float(p.get("m2_totales") or 0.0)
    precio = float(p.get("precio_valor") or 0.0)
    rec = int(p.get("recamaras") or 0)
    
    # 1. Detectar si m2_construidos tiene escala multiplicada por omisión de decimales
    if m2 > 2500:
        corregido = False
        # Probar factores comunes: 10, 100, 1000, 10000
        for div in (10, 100, 1000, 10000, 100000):
            cand = m2 / div
            pm2 = (precio / cand) if cand > 0 else 0
            
            # Criterios de coherencia residencial: entre 30m2 y 2500m2 y $/m2 entre $3,000 y $250,000
            if 30 <= cand <= 2500 and (pm2 == 0 or 3000 <= pm2 <= 250000):
                p["m2_construidos"] = round(cand, 2)
                if m2_tot > 2500:
                    p["m2_totales"] = round(m2_tot / div, 2)
                p["precio_m2_construccion"] = round(pm2, 2) if pm2 > 0 else 0.0
                p["es_valido_para_valuacion"] = True
                p["observacion_limpieza"] = f"Escala m2 autocorregida ({m2} -> {round(cand, 2)})"
                corregidos_m2 += 1
                corregido = True
                break
        
        if not corregido:
            # Si es un terreno gigante o valor inmanejable sin recámaras, fijar cota razonable
            if rec > 0 and rec <= 6:
                cand = max(rec * 60.0, 120.0) # Estimado por recámaras
                pm2 = round(precio / cand, 2) if precio > 0 else 0.0
                p["m2_construidos"] = cand
                p["precio_m2_construccion"] = pm2
                p["es_valido_para_valuacion"] = True
                p["observacion_limpieza"] = f"Estimación razonable m2 por recámaras ({m2} -> {cand})"
                corregidos_m2 += 1
            else:
                p["es_valido_para_valuacion"] = False
                descartados += 1
    else:
        # Calcular $/m2 normalizado si m2 es coherente
        if m2 > 0 and precio > 0:
            p["precio_m2_construccion"] = round(precio / m2, 2)
            p["es_valido_para_valuacion"] = True

# Guardar dataset sanitizado
with open(MASTER_PATH, "w", encoding="utf-8") as f:
    json.dump({"metadata": {"total_registros": len(props), "sanitizado": True}, "propiedades": props}, f, ensure_ascii=False, indent=2)

print(f"✅ Propiedades con m² Autocorregidos : {corregidos_m2:,}")
print(f"⚠️ Propiedades Inconsistentes Descartadas: {descartados:,}")
print(f"✨ Dataset Sanitizado Guardado en {MASTER_PATH}")
print("="*70)
