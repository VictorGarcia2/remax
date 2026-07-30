import os
import sys
import json
import datetime
from typing import Dict, Any, List

# Forzar UTF-8
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HISTORIAL_RUNS_FILE = os.path.join(BASE_DIR, "historial_scrapers.json")
MASTER_DATASET_FILE = os.path.join(BASE_DIR, "dataset_master.json")


def cargar_historial_runs() -> List[Dict[str, Any]]:
    if not os.path.exists(HISTORIAL_RUNS_FILE):
        return []
    try:
        with open(HISTORIAL_RUNS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def guardar_historial_runs(runs: List[Dict[str, Any]]):
    try:
        with open(HISTORIAL_RUNS_FILE, "w", encoding="utf-8") as f:
            json.dump(runs, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[ERROR HISTORIAL RUNS] {e}")


def registrar_corrida_scraping(
    tipo_inmueble: str,
    zona: str,
    modo: str,
    portales: List[str],
    total_procesados: int,
    nuevas_agregadas: int,
    precios_modificados: int,
    bajas_detectadas: int
):
    runs = cargar_historial_runs()
    fecha_actual = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    run_id = f"SCRAP-{datetime.datetime.now().strftime('%Y%m%d-%H%M')}"

    nueva_entrada = {
        "run_id": run_id,
        "fecha": fecha_actual,
        "tipo_inmueble": tipo_inmueble,
        "zona": zona,
        "modo": modo,
        "portales": portales,
        "total_procesados": total_procesados,
        "nuevas_agregadas": nuevas_agregadas,
        "precios_modificados": precios_modificados,
        "bajas_detectadas": bajas_detectadas,
        "estado": "completado"
    }

    runs.insert(0, nueva_entrada) # Más reciente primero
    guardar_historial_runs(runs[:100]) # Conservar las últimas 100 corridas


def procesar_historial_precios_y_bajas(props_extraidas: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Compara las propiedades extraídas contra el dataset master:
    - Detecta inmuebles nuevos
    - Detecta inmuebles con ajuste de precio y guarda su línea del tiempo
    - Detecta inmuebles que salieron del mercado (bajas/vendidas) y calcula días en mercado
    """
    if not os.path.exists(MASTER_DATASET_FILE):
        return {"nuevas": len(props_extraidas), "modificadas": 0, "bajas": 0}

    try:
        with open(MASTER_DATASET_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
        master_props = raw.get("propiedades", []) if isinstance(raw, dict) else raw
    except Exception:
        master_props = []

    fecha_hoy = datetime.datetime.now().strftime("%Y-%m-%d")

    # Mapeo de master por llave única (url_origen o id_propiedad)
    dict_master = {}
    for p in master_props:
        key = p.get("id_propiedad") or p.get("url_origen") or (p.get("urls_portales") or [""])[0]
        if key:
            dict_master[key] = p

    nuevas_count = 0
    modificadas_count = 0
    ids_vistos_hoy = set()

    for p_nuev in props_extraidas:
        key = p_nuev.get("id_propiedad") or p_nuev.get("url_origen") or (p_nuev.get("urls_portales") or [""])[0]
        if not key:
            continue

        ids_vistos_hoy.add(key)
        precio_nuevo = p_nuev.get("precio_valor") or 0.0

        if key in dict_master:
            p_exist = dict_master[key]
            precio_anterior = p_exist.get("precio_valor") or 0.0

            # Actualizar timestamp de última vez visto
            p_exist["fecha_ultimo_visto"] = fecha_hoy
            p_exist["estado_mercado"] = "activa"

            # Detectar cambio de precio
            if precio_nuevo > 0 and precio_anterior > 0 and abs(precio_nuevo - precio_anterior) > 1000:
                diff = precio_nuevo - precio_anterior
                pct = round((diff / precio_anterior) * 100, 2)

                # Mantener historial de precios
                hist = p_exist.get("historial_precios") or [
                    {"fecha": p_exist.get("fecha_primer_vista") or fecha_hoy, "precio": precio_anterior}
                ]
                hist.append({"fecha": fecha_hoy, "precio": precio_nuevo, "variacion_monto": diff, "variacion_pct": pct})
                p_exist["historial_precios"] = hist
                p_exist["precio_valor"] = precio_nuevo
                p_exist["ultimo_cambio_precio"] = {
                    "fecha": fecha_hoy,
                    "precio_anterior": precio_anterior,
                    "precio_nuevo": precio_nuevo,
                    "diferencia": diff,
                    "porcentaje": pct
                }
                modificadas_count += 1
        else:
            # Nueva propiedad
            p_nuev["fecha_primer_vista"] = fecha_hoy
            p_nuev["fecha_ultimo_visto"] = fecha_hoy
            p_nuev["estado_mercado"] = "activa"
            p_nuev["historial_precios"] = [{"fecha": fecha_hoy, "precio": precio_nuevo}]
            dict_master[key] = p_nuev
            nuevas_count += 1

    # Detectar inmuebles que ya no aparecieron (Bajas / Vendidas)
    bajas_count = 0
    for key, p in dict_master.items():
        if key not in ids_vistos_hoy and p.get("estado_mercado") == "activa":
            # Si no se ha visto en el barrido actual
            p["estado_mercado"] = "baja_o_vendida"
            p["fecha_baja"] = fecha_hoy
            
            # Calcular días en mercado (Days on Market)
            try:
                f_ini = datetime.datetime.strptime(p.get("fecha_primer_vista", fecha_hoy), "%Y-%m-%d")
                f_fin = datetime.datetime.strptime(fecha_hoy, "%Y-%m-%d")
                dias = (f_fin - f_ini).days
                p["dias_en_mercado"] = max(dias, 1)
            except Exception:
                p["dias_en_mercado"] = 1
            bajas_count += 1

    # Guardar master actualizado
    updated_list = list(dict_master.values())
    try:
        with open(MASTER_DATASET_FILE, "w", encoding="utf-8") as f:
            json.dump({"metadata": {"total_registros": len(updated_list), "actualizado_en": fecha_hoy}, "propiedades": updated_list}, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[ERROR GUARDANDO MASTER HISTÓRICO] {e}")

    return {
        "nuevas": nuevas_count,
        "modificadas": modificadas_count,
        "bajas": bajas_count
    }


def obtener_cambios_precio_recientes() -> List[Dict[str, Any]]:
    if not os.path.exists(MASTER_DATASET_FILE):
        return []
    try:
        with open(MASTER_DATASET_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
        props = raw.get("propiedades", []) if isinstance(raw, dict) else raw
        
        modificadas = [p for p in props if p.get("ultimo_cambio_precio") is not None]
        modificadas.sort(key=lambda x: x.get("ultimo_cambio_precio", {}).get("fecha", ""), reverse=True)
        return modificadas[:50]
    except Exception:
        return []


def obtener_propiedades_baja_recientes() -> List[Dict[str, Any]]:
    if not os.path.exists(MASTER_DATASET_FILE):
        return []
    try:
        with open(MASTER_DATASET_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
        props = raw.get("propiedades", []) if isinstance(raw, dict) else raw
        
        bajas = [p for p in props if p.get("estado_mercado") == "baja_o_vendida"]
        bajas.sort(key=lambda x: x.get("fecha_baja", ""), reverse=True)
        return bajas[:50]
    except Exception:
        return []
