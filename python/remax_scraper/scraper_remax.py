import os
import json
import uuid
import re
import sys
import requests

# Forzar UTF-8 en stdout/stderr para evitar UnicodeEncodeError en consolas Windows (cp1252)
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

API_URL = "https://remaxcin-pagina-backend.780gcc.easypanel.host/api/propiedades"
RAW_OUTPUT = os.path.join(os.path.dirname(__file__), "remax_propiedades.json")
NORMALIZED_DIR = os.path.join(os.path.dirname(__file__), "..", "valuador_normalizado")
NORMALIZED_OUTPUT = os.path.join(NORMALIZED_DIR, "remax_veracruz_casas_normalizado.json")

def _has_keyword(text_list, keywords):
    combined = " ".join([str(t) for t in text_list if t]).lower()
    return any(kw in combined for kw in keywords)

def fetch_remax_data():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
    }
    print(f"Fetching properties from Remax API: {API_URL}")
    try:
        response = requests.get(API_URL, headers=headers, timeout=20)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Primer intento falló: {e}. Reintentando...")
        import time
        time.sleep(3)
        response = requests.get(API_URL, headers=headers, timeout=30)
        response.raise_for_status()
    data = response.json()
    rows = data.get("data", {}).get("rows", [])
    print(f"Successfully fetched {len(rows)} properties from API.")
    
    # Save raw data
    os.makedirs(os.path.dirname(RAW_OUTPUT), exist_ok=True)
    with open(RAW_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved raw data to {RAW_OUTPUT}")
    return rows

def normalize_remax_data(rows):
    normalized = []
    
    for row in rows:
        # 1. Filtros principales:
        # Estado debe ser Veracruz
        estado = row.get("estados", {}).get("estado_nombre", "")
        if estado.lower() != "veracruz":
            continue
            
        # Tipo de propiedad residencial
        tipo_nombre = row.get("tipos", {}).get("tipo_nombre", "")
        if tipo_nombre in ("Casa", "Casa en Condominio"):
            tipo_propiedad = "Casa"
        elif tipo_nombre == "Departamento":
            tipo_propiedad = "Departamento"
        else:
            # Omitir terrenos, bodegas, oficinas, locales, etc.
            continue
            
        # Operación de venta
        operacion = str(row.get("operacion", ""))
        titulo = row.get("titulo", "")
        # Operación "1" representa Venta. Si no, validar título
        if operacion != "1" and "venta" not in titulo.lower():
            continue
            
        # 2. Mapeo de campos:
        # Precio y moneda
        moneda = row.get("moneda", "MXN")
        if moneda == "USD":
            precio_valor = float(row.get("usd_original") or row.get("usd_corriente") or 0.0)
            precio_moneda = "USD"
        else:
            precio_valor = float(row.get("mxn_original") or row.get("mxn_corriente") or 0.0)
            precio_moneda = "MXN"
            
        # Si sigue siendo 0, intentar la otra moneda como fallback
        if precio_valor == 0.0:
            if moneda == "USD":
                precio_valor = float(row.get("mxn_original") or row.get("mxn_corriente") or 0.0)
                precio_moneda = "MXN"
            else:
                precio_valor = float(row.get("usd_original") or row.get("usd_corriente") or 0.0)
                precio_moneda = "USD"

        # Área construida y terreno
        m2_construidos = None
        m2_construccion_raw = row.get("m2_construccion")
        if m2_construccion_raw:
            try: m2_construidos = float(m2_construccion_raw)
            except (ValueError, TypeError): pass
            
        m2_totales = None
        # Buscar en m2_terreno_ y meta m2_terreno
        meta = row.get("propiedades_meta", {}) or {}
        m2_terreno_raw = row.get("m2_terreno_") or meta.get("m2_terreno")
        if m2_terreno_raw:
            try: m2_totales = float(m2_terreno_raw)
            except (ValueError, TypeError): pass
            
        # Si no tiene m2_totales, usar m2_construidos
        if m2_totales is None:
            m2_totales = m2_construidos

        # Recámaras, baños, estacionamientos
        recamaras = None
        rec_raw = meta.get("recamaras") or row.get("recamaras")
        if rec_raw is not None:
            try: recamaras = int(rec_raw)
            except (ValueError, TypeError): pass
            
        banos = None
        ban_raw = meta.get("banos") or row.get("banos")
        if ban_raw is not None:
            try: banos = int(ban_raw)
            except (ValueError, TypeError): pass
            
        estacionamientos = None
        est_raw = meta.get("estacionamiento") or meta.get("estacionamientos") or row.get("estacionamientos")
        if est_raw is not None:
            try: estacionamientos = int(est_raw)
            except (ValueError, TypeError): pass

        # Antigüedad
        antiguedad_anos = None
        edad_raw = row.get("edad_de_propiedad") or meta.get("edad_de_propiedad")
        if edad_raw is not None:
            try: antiguedad_anos = int(edad_raw)
            except (ValueError, TypeError): pass

        # Ubicación estructurada
        municipio = row.get("ciudades", {}).get("ciudad_nombre") or row.get("municipios", {}).get("municipio_nombre")
        colonia = row.get("colonias", {}).get("colonia_nombre")
        codigo_postal = row.get("postal")

        # Coordenadas
        lat = None
        lat_raw = row.get("latitud")
        if lat_raw is not None:
            try: lat = float(lat_raw)
            except (ValueError, TypeError): pass
            
        lng = None
        lng_raw = row.get("longitud")
        if lng_raw is not None:
            try: lng = float(lng_raw)
            except (ValueError, TypeError): pass

        # Precio por m2 construccion
        precio_m2 = None
        if precio_valor > 0 and m2_construidos and m2_construidos > 0:
            precio_m2 = round(precio_valor / m2_construidos, 2)

        # Validación
        es_valido = False
        if precio_valor >= 150000 and m2_construidos and m2_construidos >= 20:
            if precio_m2 and 2000 <= precio_m2 <= 100000:
                # Asegurar que tiene coordenadas
                if lat is not None and lng is not None:
                    es_valido = True

        # Modificadores booleanos
        desc = meta.get("descripcion", "")
        keywords = row.get("searchkeywords", "")
        calle = row.get("calle", "")
        
        tiene_alberca = (
            bool(meta.get("alberca")) or 
            _has_keyword([desc, keywords, titulo], ["alberca", "piscina", "pool"])
        )
        en_fracc = _has_keyword(
            [desc, keywords, titulo, calle, colonia],
            ["fraccionamiento", "fracc", "residencial", "cluster", "coto", "privada", "lomas del sol", "lomas de la rioja"]
        )
        tiene_vigilancia = (
            bool(meta.get("vigilancia") or meta.get("caseta_vigilancia") or meta.get("sistema_seguridad")) or
            _has_keyword([desc, keywords, titulo], ["vigilancia", "seguridad", "24/7", "caseta", "acceso controlado", "guardia"])
        )

        item = {
            "id_propiedad": str(uuid.uuid4()),
            "url_origen": f"https://www.remax.com.mx/propiedades/{row.get('clave', '')}",
            "fuente": "Remax",
            "tipo_propiedad": tipo_propiedad,
            "tipo_operacion": "Venta",
            "precio_valor": precio_valor,
            "precio_moneda": precio_moneda,
            "m2_construidos": m2_construidos,
            "m2_totales": m2_totales,
            "antiguedad_anos": antiguedad_anos,
            "recamaras": recamaras,
            "banos": banos,
            "estacionamientos": estacionamientos,
            "estado": "Veracruz",
            "municipio": municipio,
            "colonia": colonia,
            "codigo_postal": codigo_postal,
            "latitud": lat,
            "longitud": lng,
            "precio_m2_construccion": precio_m2,
            "es_valido_para_valuacion": es_valido,
            "tiene_alberca": tiene_alberca,
            "en_fraccionamiento_cerrado": en_fracc,
            "tiene_vigilancia": tiene_vigilancia,
        }
        normalized.append(item)
        
    return normalized

def main():
    rows = fetch_remax_data()
    normalized = normalize_remax_data(rows)
    
    validos = sum(1 for p in normalized if p["es_valido_para_valuacion"])
    
    from datetime import datetime
    os.makedirs(NORMALIZED_DIR, exist_ok=True)
    
    output_data = {
        "metadata": {
            "generado_en": datetime.now().isoformat(),
            "total_registros": len(normalized),
            "registros_validos_para_valuacion": validos
        },
        "propiedades": normalized
    }
    
    with open(NORMALIZED_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"\n=== REMAX NORMALIZACIÓN COMPLETADA ===")
    print(f"Total procesadas (Veracruz Residencial Venta): {len(normalized)}")
    print(f"Válidas para valuación: {validos}")
    print(f"Guardado en: {NORMALIZED_OUTPUT}")

if __name__ == "__main__":
    main()
