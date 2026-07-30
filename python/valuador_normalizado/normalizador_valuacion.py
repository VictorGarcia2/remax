import json
import uuid
import time
import urllib.request
import urllib.parse
import os
import argparse
import logging
from datetime import datetime

# Configuración de Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuraciones Globales
CACHE_FILE = 'nominatim_cache.json'
USER_AGENT = 'ValuadorAutomaticoBot/1.0 (script de valuacion local)'

def load_json(filepath):
    """Carga un archivo JSON."""
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_json(data, filepath):
    """Guarda un diccionario como JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_reverse_geocode(lat, lng, cache):
    """
    Obtiene los datos geográficos a partir de lat y lng usando Nominatim (OpenStreetMap).
    Utiliza caché para evitar banear la IP y hacer el proceso reanudable.
    """
    if lat is None or lng is None:
        return None
        
    # Clave de caché basada en 4 decimales (aprox 11 metros de precisión, ideal para no repetir casas vecinas)
    cache_key = f"{lat:.4f},{lng:.4f}"
    
    if cache_key in cache:
        return cache[cache_key]
        
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': USER_AGENT}
    )
    
    try:
        # Nominatim requiere máximo 1 petición por segundo
        time.sleep(1.1) 
        
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            cache[cache_key] = data
            return data
    except Exception as e:
        logger.warning(f"Error en Nominatim para {lat}, {lng}: {e}")
        return None

def get_forward_geocode(colonia, municipio, estado, cache):
    """
    Realiza geocodificación directa (Forward Geocoding) usando Nominatim
    para encontrar las coordenadas a partir de la dirección/colonia.
    Usa caché local para evitar consultas excesivas.
    """
    parts = [x for x in [colonia, municipio, estado, "México"] if x and "no disponible" not in x.lower() and "s/u" not in x.lower()]
    if len(parts) < 2:
        return None
        
    query_str = ", ".join(parts)
    cache_key = f"forward:{query_str.lower()}"
    
    if cache_key in cache:
        return cache[cache_key]
        
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query_str)}&format=json&limit=1"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': USER_AGENT}
    )
    
    try:
        # Nominatim requiere máximo 1 petición por segundo
        time.sleep(1.1)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            if data:
                res = {
                    "lat": float(data[0]["lat"]),
                    "lng": float(data[0]["lon"]),
                    "display_name": data[0]["display_name"]
                }
                cache[cache_key] = res
                return res
            else:
                # Fallback sin la colonia
                if len(parts) > 2:
                    fallback_query = ", ".join(parts[1:])
                    fallback_key = f"forward:{fallback_query.lower()}"
                    if fallback_key in cache:
                        return cache[fallback_key]
                    
                    url_fb = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(fallback_query)}&format=json&limit=1"
                    req_fb = urllib.request.Request(url_fb, headers={'User-Agent': USER_AGENT})
                    time.sleep(1.1)
                    with urllib.request.urlopen(req_fb, timeout=10) as response_fb:
                        data_fb = json.loads(response_fb.read().decode())
                        if data_fb:
                            res_fb = {
                                "lat": float(data_fb[0]["lat"]),
                                "lng": float(data_fb[0]["lon"]),
                                "display_name": data_fb[0]["display_name"]
                            }
                            cache[fallback_key] = res_fb
                            cache[cache_key] = res_fb
                            return res_fb
    except Exception as e:
        logger.warning(f"Error en Nominatim forward para '{query_str}': {e}")
        
    cache[cache_key] = None
    return None

def normalize_antiguedad(antiguedad_str):
    """Convierte la cadena de antigüedad a entero. A estrenar = 0."""
    if not antiguedad_str or antiguedad_str == "N/A":
        return None
    s = str(antiguedad_str).lower()
    # Placeholder "X en Propiedades.com" = tiempo publicado, NO edad real
    if "en propiedades.com" in s:
        return None
    if "estrenar" in s or "nuevo" in s or "mes" in s or "meses" in s:
        return 0
    # Buscar números
    import re
    match = re.search(r'\d+', s)
    if match:
        return int(match.group())
    return None

def has_keyword(text_list, keywords):
    """Busca si alguna palabra clave está en los textos."""
    combined_text = " ".join([str(t) for t in text_list if t]).lower()
    for kw in keywords:
        if kw in combined_text:
            return True
    return False

def process_data(input_file, output_file, limit=None):
    logger.info(f"Cargando archivo de entrada: {input_file}")
    raw_db = load_json(input_file)
    
    if "listings" not in raw_db:
        logger.error("El archivo JSON no tiene la estructura de 'listings' esperada.")
        return
        
    listings = raw_db["listings"]
    total = len(listings)
    
    if limit:
        logger.info(f"Se procesarán solo los primeros {limit} registros.")
        listings = dict(list(listings.items())[:limit])
        total = limit

    cache = load_json(CACHE_FILE)
    logger.info(f"Caché de Nominatim cargado: {len(cache)} registros.")
    
    normalized_data = []
    
    count = 0
    for url, record in listings.items():
        count += 1
        data = record.get("data", {})
        
        if count % 10 == 0:
            logger.info(f"Procesando {count}/{total}...")
            save_json(cache, CACHE_FILE) # Guardado de caché periódico
        
        # ── EXTRACCIÓN BÁSICA ──
        precio_valor = data.get("precio_valor", 0.0)
        precio_moneda = data.get("precio_moneda", "MXN")
        if precio_moneda == "MN": precio_moneda = "MXN"
        
        m2_construidos = data.get("m2_construidos")
        m2_totales = data.get("m2_totales")
        
        lat_raw = data.get("lat")
        lng_raw = data.get("lng")
        
        # ── EXTRACCION DE UBICACION (RÁPIDA) ──
        estado = None
        municipio = None
        colonia = None
        codigo_postal = None
        
        # Usar la ubicación del scraper directamente
        ubicacion = data.get("ubicacion", "")
        direccion = data.get("direccion", "")
        
        full_loc = ubicacion if ubicacion else direccion
        parts = [p.strip() for p in full_loc.split(",") if p.strip()]
        
        # Intentar detectar estado dinámicamente de la ubicación
        for part in parts:
            pl = part.lower()
            if "veracruz" in pl:
                estado = "Veracruz"
            elif "tabasco" in pl:
                estado = "Tabasco"
            elif "puebla" in pl:
                estado = "Puebla"
            elif "oaxaca" in pl:
                estado = "Oaxaca"
        
        # Fallback: inferir del nombre del archivo de entrada
        if not estado:
            input_lower = os.path.basename(input_file).lower()
            if "tabasco" in input_lower:
                estado = "Tabasco"
            elif "veracruz" in input_lower:
                estado = "Veracruz"
            else:
                estado = "Veracruz"  # fallback final
        
        if len(parts) >= 2:
            municipio = parts[1]
        if len(parts) >= 3:
            colonia = parts[2]
        elif len(parts) == 1:
            municipio = parts[0]
            
        # ── PROCESAMIENTO Y CORRECCIÓN DE COORDENADAS ──
        lat = None
        lng = None
        coords_en_bbox = False
        
        # 1. Intentar limpiar y corregir invertidas
        if lat_raw is not None and lng_raw is not None:
            try:
                lat_f = float(lat_raw)
                lng_f = float(lng_raw)
                # Si latitud y longitud están invertidas (lat negativa y lng positiva en rangos de MX)
                if (lat_f < 0 and lng_f > 0) or (14.0 <= lng_f <= 33.0 and -120.0 <= lat_f <= -85.0):
                    lat_f, lng_f = lng_f, lat_f
                lat, lng = lat_f, lng_f
            except (ValueError, TypeError):
                pass
                
        # Bounding boxes de estados con margen
        bbox = {
            "veracruz": {"lat": (16.8, 22.8), "lng": (-99.5, -93.0)},
            "tabasco": {"lat": (17.0, 19.0), "lng": (-94.5, -90.5)}
        }
        
        estado_key = estado.lower() if estado else "veracruz"
        state_bbox = bbox.get(estado_key, bbox["veracruz"])
        
        # 2. Validar si están dentro de la región esperada
        if lat is not None and lng is not None:
            if state_bbox["lat"][0] <= lat <= state_bbox["lat"][1] and state_bbox["lng"][0] <= lng <= state_bbox["lng"][1]:
                coords_en_bbox = True
                
        # 3. Fallback: Geocodificación directa si falló la validación o no hay coordenadas
        if not coords_en_bbox and (colonia or municipio):
            res_forward = get_forward_geocode(colonia, municipio, estado, cache)
            if res_forward:
                lat_f = res_forward["lat"]
                lng_f = res_forward["lng"]
                if state_bbox["lat"][0] <= lat_f <= state_bbox["lat"][1] and state_bbox["lng"][0] <= lng_f <= state_bbox["lng"][1]:
                    lat = lat_f
                    lng = lng_f
                    coords_en_bbox = True
                    logger.info(f"Geocodificación de respaldo exitosa para '{colonia}, {municipio}': {lat}, {lng}")
                
        # ── VARIABLES CALCULADAS Y REGLAS DEL VALUADOR ──
        precio_m2_construccion = None
        if precio_valor and precio_valor > 0 and m2_construidos and m2_construidos > 0:
            precio_m2_construccion = round(precio_valor / m2_construidos, 2)
            
        # Filtro Validador: Excluye datos basura e inmorales
        es_valido = False
        if precio_valor >= 150000 and m2_construidos and m2_construidos >= 20 and coords_en_bbox:
            # Filtro adicional anti-spam
            if precio_m2_construccion and 2000 <= precio_m2_construccion <= 100000:
                es_valido = True
                
        # ── MODIFICADORES BOOLEANOS ──
        amenidades_str = data.get("amenidades", "")
        desc_str = data.get("descripcion", "")
        caract_str = data.get("caracteristicas", "")
        
        tiene_alberca = has_keyword([amenidades_str, desc_str], ["alberca", "piscina", "pool"])
        en_fraccionamiento_cerrado = has_keyword([desc_str, data.get("ubicacion"), data.get("direccion")], ["fraccionamiento", "fracc", "residencial", "cluster", "coto", "privada"])
        tiene_vigilancia = has_keyword([amenidades_str, desc_str], ["vigilancia", "seguridad", "24/7", "caseta", "acceso controlado", "guardia"])
        
        fuente_inferida = os.path.basename(input_file).split('_')[0].capitalize()
        if "Propiedades" in os.path.basename(input_file):
            fuente_inferida = "Propiedades.com"
            
        # ── ESTRUCTURA NORMALIZADA ──
        item = {
            "id_propiedad": str(uuid.uuid4()),
            "url_origen": url,
            "fuente": fuente_inferida,
            "tipo_propiedad": "Casa",
            "tipo_operacion": "Venta",
            
            # Métricas Financieras y Dimensiones
            "precio_valor": precio_valor,
            "precio_moneda": precio_moneda,
            "mantenimiento_valor": data.get("mantenimiento_valor", 0.0),
            "m2_construidos": m2_construidos,
            "m2_totales": m2_totales,
            "antiguedad_anos": normalize_antiguedad(data.get("antiguedad")),
            
            # Distribución (Cuartos, etc.)
            "recamaras": data.get("recamaras"),
            "banos": data.get("banos"),
            "estacionamientos": data.get("estacionamientos"),
            
            # Geolocalización Estandarizada
            "estado": estado,
            "municipio": municipio,
            "colonia": colonia,
            "codigo_postal": codigo_postal,
            "latitud": lat,
            "longitud": lng,
            
            # Variables Calculadas
            "precio_m2_construccion": precio_m2_construccion,
            "es_valido_para_valuacion": es_valido,
            
            # Modificadores de Valor (Booleanos)
            "tiene_alberca": tiene_alberca,
            "en_fraccionamiento_cerrado": en_fraccionamiento_cerrado,
            "tiene_vigilancia": tiene_vigilancia,
            
            # Textos Originales
            "descripcion": data.get("descripcion", ""),
            "amenidades": data.get("amenidades", "")
        }
        
        normalized_data.append(item)
        
    # Guardado Final
    save_json(cache, CACHE_FILE)
    
    output = {
        "metadata": {
            "generado_en": datetime.now().isoformat(),
            "total_registros": len(normalized_data),
            "registros_validos_para_valuacion": sum(1 for d in normalized_data if d["es_valido_para_valuacion"])
        },
        "propiedades": normalized_data
    }
    
    save_json(output, output_file)
    logger.info(f"\n¡Proceso Finalizado! Datos guardados en {output_file}")
    logger.info(f"Total procesados: {len(normalized_data)}")
    logger.info(f"Válidos para valuador: {output['metadata']['registros_validos_para_valuacion']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Normaliza la DB inmobiliaria y extrae Geo-datos exactos vía Nominatim.")
    parser.add_argument("--input", type=str, default="../playwright_inmuebles24/inmuebles24_veracruz_casas.json", help="Ruta al JSON de entrada")
    parser.add_argument("--output", type=str, default="inmuebles24_veracruz_casas_normalizado.json", help="Ruta al JSON de salida")
    parser.add_argument("--limit", type=int, default=6800, help="Límite de propiedades a procesar")
    args = parser.parse_args()
    
    process_data(args.input, args.output, limit=args.limit)
