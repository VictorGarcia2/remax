import json
import os
import sys
from collections import defaultdict
from typing import Dict, Any, List

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_PATH = os.path.join(BASE_DIR, "dataset_master.json")


def generar_huella_digital(p: Dict[str, Any]) -> str:
    col = (p.get("colonia") or "").strip().lower()
    mun = (p.get("municipio") or "").strip().lower()
    tipo = (p.get("tipo_propiedad") or "casa").strip().lower()
    
    m2 = round(float(p.get("m2_construidos") or 0) / 4) * 4 # Bloques de 4m2
    rec = int(p.get("recamaras") or 0)
    ban = int(p.get("banos") or 0)
    
    lat = round(float(p.get("latitud") or 0), 3)
    lng = round(float(p.get("longitud") or 0), 3)

    if lat != 0 and lng != 0:
        return f"{tipo}|{mun}|{col}|{rec}|{ban}|{m2}|{lat}|{lng}"
    return f"{tipo}|{mun}|{col}|{rec}|{ban}|{m2}"


def consolidar_grupo_propiedades(grupo: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Fusiona múltiples anuncios de la misma propiedad en 1 Registro Maestro Unificado
    """
    if len(grupo) == 1:
        return grupo[0]

    # Ordenar por completitud de campos para tomar el mejor registro base
    grupo.sort(key=lambda x: (
        1 if x.get("colonia") else 0,
        1 if (x.get("m2_construidos") or 0) > 0 else 0,
        1 if (x.get("recamaras") or 0) > 0 else 0,
        len(x.get("descripcion") or "")
    ), reverse=True)

    master = dict(grupo[0])

    # Unificar URLs y Fuentes
    urls_set = set()
    fuentes_set = set()
    precios = []

    for item in grupo:
        u_orig = item.get("url_origen")
        if u_orig:
            urls_set.add(u_orig)
        for u in (item.get("urls_portales") or []):
            if u:
                urls_set.add(u)
        
        f = item.get("fuente")
        if f:
            fuentes_set.add(f)

        pr = float(item.get("precio_valor") or 0)
        if pr > 0:
            precios.append(pr)

    master["urls_portales"] = list(urls_set)
    master["url_origen"] = master["urls_portales"][0] if master["urls_portales"] else master.get("url_origen")
    master["fuente"] = " / ".join(sorted(fuentes_set))
    master["anunciada_en_portales_count"] = len(fuentes_set)

    # Gestionar rango de precios si varía entre anuncios/agencias
    if precios:
        min_p = min(precios)
        max_p = max(precios)
        master["precio_valor"] = min_p # Asignar el precio mínimo/oferta más competitiva
        if max_p > min_p:
            master["precio_rango"] = {"min": min_p, "max": max_p}
            master["variacion_anunciantes_pct"] = round(((max_p - min_p) / min_p) * 100, 2)

    # Completar campos faltantes en el master usando los otros duplicados
    for item in grupo[1:]:
        if not master.get("colonia") and item.get("colonia"):
            master["colonia"] = item["colonia"]
        if not master.get("recamaras") and item.get("recamaras"):
            master["recamaras"] = item["recamaras"]
        if not master.get("banos") and item.get("banos"):
            master["banos"] = item["banos"]
        if not master.get("latitud") and item.get("latitud"):
            master["latitud"] = item["latitud"]
            master["longitud"] = item["longitud"]

    master["observacion_deduplicacion"] = f"Consolidado de {len(grupo)} publicaciones en {master['fuente']}"
    return master


def ejecutar_deduplicacion_global():
    if not os.path.exists(MASTER_PATH):
        print(f"❌ No se encontró {MASTER_PATH}")
        return

    with open(MASTER_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    props = raw.get("propiedades", []) if isinstance(raw, dict) else raw
    total_original = len(props)

    # 1. Agrupar por huella digital
    grupos = defaultdict(list)
    for p in props:
        fp = generar_huella_digital(p)
        grupos[fp].append(p)

    # 2. Consolidar cada grupo
    consolidados = []
    total_eliminados = 0

    for fp, lista in grupos.items():
        if len(lista) > 1:
            total_eliminados += (len(lista) - 1)
        master_item = consolidar_grupo_propiedades(lista)
        consolidados.append(master_item)

    # 3. Guardar dataset sanitizado
    with open(MASTER_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "metadata": {
                "total_registros": len(consolidados),
                "total_duplicados_eliminados": total_eliminados,
                "deduplicado": True
            },
            "propiedades": consolidados
        }, f, ensure_ascii=False, indent=2)

    print("="*70)
    print("     CONSOLIDACIÓN Y DEDUPLICACIÓN GLOBAL DE PROPIEDADES")
    print("="*70)
    print(f"  • Registros Iniciales (con duplicados) : {total_original:,}")
    print(f"  • Duplicados Identificados y Fusionados: {total_eliminados:,}")
    print(f"  • Registros Únicos Consolidados Finales: {len(consolidados):,}")
    print("="*70)


if __name__ == "__main__":
    ejecutar_deduplicacion_global()
