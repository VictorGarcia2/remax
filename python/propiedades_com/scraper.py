import json
import time
import threading
import random
import re
import logging
import requests
from curl_cffi import requests as curl_requests
import uuid
import urllib.request
import urllib.parse
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
from bs4 import BeautifulSoup
from seleniumbase import SB
from json_db import PropertyDB

# Forzar UTF-8 en stdout/stderr para evitar UnicodeEncodeError en consolas Windows (cp1252)
import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def solve_akamai_challenge(sb):
    """
    Detecta y resuelve de forma robusta el desafío de Akamai Bot Manager (TEP Challenge).
    """
    title = sb.get_title()
    if "Challenge Validation" in title or sb.is_element_visible("iframe#sec-cpt-if"):
        print("      [Akamai Challenge] Detectado. Resolviendo en segundo plano...")
        try:
            sb.switch_to_frame("iframe#sec-cpt-if")
            sb.sleep(1.5)
            if sb.is_element_visible("input#robot-checkbox"):
                print("      -> Marcando casilla 'No soy un robot'...")
                sb.click("input#robot-checkbox")
                sb.sleep(2.5)
                if sb.is_element_visible(".behavioral-button"):
                    print("      -> Haciendo click en 'Continuar'...")
                    sb.click(".behavioral-button")
                sb.sleep(2)
            sb.switch_to_default_content()
            print("      -> Esperando validacion y redireccion de Akamai...")
            sb.sleep(6)
        except Exception as e:
            print(f"      [Error] Fallo al intentar resolver el challenge de Akamai: {e}")
            sb.switch_to_default_content()

def extract_json_data(html_content):
    """
    Busca y extrae el objeto JSON de propiedades inyectado en el HTML.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    scripts = [s for s in soup.find_all('script') if s.string and '{"props":' in s.string]
    
    for s in scripts:
        try:
            data = json.loads(s.string)
            props = data.get('props', {}).get('pageProps', {})
            results = props.get('initialState', {}).get('Search', {}).get('cityResults', {}) or props.get('results', {})
            properties = results.get('properties', [])
            paginate = results.get('paginate', {})
            if properties or paginate:
                return properties, paginate
        except Exception as e:
            print(f"Error parseando script JSON: {e}")
            
    return [], {}

def get_browser_cookies_and_headers(sb):
    """
    Extrae cookies y headers del navegador SeleniumBase para requests HTTP.
    """
    cookie_dict = {}
    try:
        cdp_cookies = sb.execute_cdp_cmd("Network.getAllCookies", {})
        for cookie in cdp_cookies.get("cookies", []):
            cookie_dict[cookie['name']] = cookie['value']
    except Exception:
        try:
            for cookie in sb.driver.get_cookies():
                cookie_dict[cookie['name']] = cookie['value']
        except Exception:
            logger.warning("⚠ No se pudieron extraer cookies del navegador.")
            
    try:
        ua = sb.execute_script("return navigator.userAgent;")
    except Exception:
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        
    headers = {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
    }
    
    return cookie_dict, headers

def _coerce_m2(value):
    """Convierte un valor de superficie a float positivo, o None si no es válido."""
    if value in (None, "", 0, "0"):
        return None
    try:
        f = float(value)
        return f if f > 0 else None
    except (TypeError, ValueError):
        return None

def extract_property_detail(html_content):
    """
    Extrae de la página de DETALLE: edad, terreno (size_ground), construcción
    (size_house) y estacionamientos (parking_num). Estos campos NO vienen en el
    JSON del listado; aprovechamos el mismo request que ya hacíamos para la edad.

    Devuelve {antiguedad, m2_totales, m2_construidos, estacionamientos} con None
    en lo que no se pudo determinar, o None si no se parseó absolutamente nada.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    scripts = [s for s in soup.find_all('script') if s.string and ('__NEXT_DATA__' in s.string or '{"props":' in s.string)]
    detail = {"antiguedad": None, "m2_totales": None, "m2_construidos": None, "estacionamientos": None}
    found = False
    for s in scripts:
        try:
            data = json.loads(s.string)
            props = data.get('props', {}).get('pageProps', {})
            res = props.get('initialState', {}).get('Property', {}).get('property', {}).get('results', {})
            prop_obj = res.get('property', {}) or {}
            amen_obj = res.get('amenities', {}) or {}

            age = prop_obj.get('age') if prop_obj.get('age') is not None else amen_obj.get('age')
            if age is not None:
                try:
                    detail["antiguedad"] = f"{int(age)} años" if int(age) > 0 else "A estrenar"
                    found = True
                except (TypeError, ValueError):
                    pass

            # size_ground = terreno real ; size_house = construcción real
            m2_terreno = _coerce_m2(prop_obj.get('size_ground') or amen_obj.get('size_ground'))
            m2_const = _coerce_m2(prop_obj.get('size_house') or amen_obj.get('size_house'))
            if m2_terreno is not None:
                detail["m2_totales"] = m2_terreno
                found = True
            if m2_const is not None:
                detail["m2_construidos"] = m2_const
                found = True

            parking = amen_obj.get('parking_num') if amen_obj.get('parking_num') is not None else prop_obj.get('parking_num')
            if parking is not None:
                try:
                    detail["estacionamientos"] = int(parking)
                    found = True
                except (TypeError, ValueError):
                    pass

            if found:
                return detail
        except Exception:
            pass

    # Fallback buscando en el DOM si no se encontró en el JSON
    for elem in soup.find_all(string=re.compile("EDAD DEL INMUEBLE", re.I)):
        parent = elem.parent.parent if elem.parent else None
        if parent:
            text = parent.get_text(strip=True)
            match = re.search(r'(\d+)\s*a\u00f1os', text, re.I) or re.search(r'(\d+)\s*a\xf1os', text, re.I) or re.search(r'(\d+)\s*anos', text, re.I)
            if match:
                detail["antiguedad"] = f"{match.group(1)} años"
                return detail
    return detail if found else None

def fetch_detail_http(url, session=None):
    """Descarga el HTML de una página de detalle usando curl_cffi para bypassear Akamai."""
    try:
        # Delay aleatorio para no saturar
        time.sleep(random.uniform(0.2, 0.8))
        
        response = _get_curl_session().get(url, timeout=15)
        if response.status_code == 200:
            html = response.text
            if "Challenge Validation" in html or "sec-cpt-if" in html:
                logger.warning(f"      ⚠ Akamai Challenge en detalle HTTP: {url}")
                return url, None
            detail = extract_property_detail(html)
            return url, detail
        elif response.status_code == 403:
            logger.warning(f"      ⚠ 403 Forbidden (Posible bloqueo de Akamai): {url}")
            return url, None
        else:
            logger.warning(f"      ⚠ HTTP {response.status_code}: {url}")
            return url, None
    except Exception as e:
        logger.error(f"      ❌ Error HTTP en {url}: {e}")
        return url, None

# Sesión curl_cffi por-hilo: el session handle de curl NO es seguro de compartir entre hilos.
_curl_tls = threading.local()
_curl_cookies = {}
_curl_headers = {}

def _get_curl_session():
    s = getattr(_curl_tls, "session", None)
    if s is None:
        s = curl_requests.Session(impersonate="chrome")
        s.headers.update(_curl_headers)
        for name, value in _curl_cookies.items():
            s.cookies.set(name, value)
        _curl_tls.session = s
    return s

def fetch_all_details_threaded(urls, cookies, headers, concurrency=10):
    """
    Descarga los detalles (edad) de todas las URLs en paralelo usando ThreadPoolExecutor.
    Cada hilo crea su propia curl_requests.Session (thread-safe).
    """
    global _curl_cookies, _curl_headers
    _curl_cookies = cookies
    _curl_headers = headers
    results = {}
    
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = {executor.submit(fetch_detail_http, url, None): url for url in urls}
        for future in as_completed(futures):
            try:
                url, detail = future.result()
                results[url] = detail
            except Exception as e:
                url = futures[future]
                logger.error(f"      ❌ Error en hilo para {url}: {e}")
                results[url] = None
    
    return results

def clean_property_item(p: dict) -> dict:
    """
    Formatea y estandariza los datos crudos del JSON de Propiedades.com
    para que coincidan exactamente con la estructura de Inmuebles24.
    """
    url = p.get("url_property") or f"https://www.propiedades.com/inmuebles/{p.get('id')}"
    
    title = p.get("short_address") or p.get("address1") or "Sin titulo"
    desc = p.get("full_address") or title
    
    col = p.get("colony") or ""
    mun = p.get("municipality") or ""
    est = p.get("state") or ""
    parts = [x for x in [col, mun, est] if x]
    ubicacion = ", ".join(parts) if parts else "Ubicacion no disponible"
    
    direccion = p.get("address1") or title
    if "," in direccion:
        direccion = direccion.split(",")[0].strip()
        
    price_val = float(p.get("sale_price_real") or p.get("price_num") or p.get("price_real") or 0.0)
    curr = str(p.get("currency") or "MXN").replace("MN", "MXN") if str(p.get("currency") or "") == "MN" else str(p.get("currency") or "MXN")
    
    # m2: la API a veces usa campos separados para terreno vs construcción
    # Intentar campos específicos primero, luego fallback a size_m2
    # En el JSON del LISTADO, size_m2 = superficie de CONSTRUCCIÓN (verificado contra
    # size_house del detalle). NO hay terreno en el listado: m2_totales se rellena
    # luego desde la página de detalle (size_ground). No duplicar size_m2 en ambos.
    m2_const = float(p.get("construction_m2") or p.get("built_m2") or p.get("size_m2") or 0.0)
    m2_tot = float(p.get("lot_m2") or p.get("terrain_size") or 0.0)

    recs = int(p.get("bedrooms") or 0)
    banos = int(p.get("bathrooms") or 0)
    estac = int(p.get("parking_num") or 0)

    caract_parts = []
    if m2_const > 0: caract_parts.append(f"{m2_const:,.0f} m² const.")
    elif m2_tot > 0: caract_parts.append(f"{m2_tot:,.0f} m² lote")
    if recs > 0: caract_parts.append(f"{recs} rec.")
    if banos > 0: caract_parts.append(f"{banos} baños")
    if estac > 0: caract_parts.append(f"{estac} estac.")
    caracteristicas = " | ".join(caract_parts) if caract_parts else "Sin caracteristicas"
    
    amenidades_list = []
    if p.get("pool"): amenidades_list.append("Alberca")
    if p.get("private_security") or p.get("vigilance"): amenidades_list.append("Seguridad privada")
    if p.get("air_conditioning"): amenidades_list.append("Aire acondicionado")
    if p.get("cistern"): amenidades_list.append("Cisterna")
    if p.get("terrace"): amenidades_list.append("Terraza")
    if p.get("gym"): amenidades_list.append("Gimnasio")
    if p.get("elevator"): amenidades_list.append("Elevador")
    amenidades = " | ".join(amenidades_list)
    
    days_ago = p.get("days_ago")
    if p.get("is_new"):
        antiguedad = "A estrenar"
    elif days_ago is not None:
        antiguedad = f"{days_ago} en Propiedades.com" if isinstance(days_ago, int) else str(days_ago)
    else:
        antiguedad = p.get("published") or "N/A"
        
    lat = float(p.get("latitude")) if p.get("latitude") else None
    lng = float(p.get("longitude")) if p.get("longitude") else None

    return {
        "url": url,
        "precio": f"{curr} {price_val:,.0f}" if price_val > 0 else "Precio no disponible",
        "precio_valor": price_val,
        "precio_moneda": curr,
        "mantenimiento_valor": 0.0,
        "caracteristicas": caracteristicas,
        "m2_totales": m2_tot if m2_tot > 0 else None,
        "m2_construidos": m2_const if m2_const > 0 else None,
        "recamaras": recs,
        "banos": banos,
        "estacionamientos": estac,
        "antiguedad": antiguedad,
        "direccion": direccion,
        "ubicacion": ubicacion,
        "descripcion": desc,
        "amenidades": amenidades,
        "lat": lat,
        "lng": lng
    }

def normalize_antiguedad(antiguedad_str):
    """Convierte la cadena de antigüedad a entero. A estrenar = 0."""
    if not antiguedad_str or antiguedad_str == "N/A":
        return None
    s = str(antiguedad_str).lower()
    if "en propiedades.com" in s:
        return None
    if "estrenar" in s or "nuevo" in s or "mes" in s or "meses" in s:
        return 0
    # Buscar números
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

def get_reverse_geocode(lat, lng, cache):
    """
    Obtiene los datos geográficos a partir de lat y lng usando Nominatim (OpenStreetMap).
    Utiliza caché para evitar banear la IP y hacer el proceso reanudable.
    """
    if lat is None or lng is None:
        return None
        
    # Clave de caché basada en 4 decimales
    cache_key = f"{lat:.4f},{lng:.4f}"
    
    if cache_key in cache:
        return cache[cache_key]
        
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'ValuadorAutomaticoBot/1.0 (script de propiedades.com local)'}
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

def normalize_and_save_data(db_filename, filename_prefix, base_url):
    """
    Lee la base de datos cruda del scraper, la normaliza para que coincida exactamente
    con el formato de Inmuebles24, y guarda el resultado normalizado tanto en la carpeta
    actual de propiedades_com como en la carpeta valuador_normalizado.
    """
    logger.info(f"--- Iniciando Normalización de Datos para {filename_prefix} ---")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    
    input_path = os.path.join(current_dir, db_filename)
    if not os.path.exists(input_path):
        logger.error(f"No se encontró el archivo de base de datos crudo en: {input_path}")
        return
        
    raw_db = {}
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            raw_db = json.load(f)
    except Exception as e:
        logger.error(f"Error al leer archivo crudo {input_path}: {e}")
        return
        
    if "listings" not in raw_db:
        logger.error("El archivo JSON no tiene la estructura de 'listings' esperada.")
        return
        
    listings = raw_db["listings"]
    total = len(listings)
    logger.info(f"Cargados {total} registros para normalizar.")
    
    # Ubicar caché de Nominatim
    cache_path = os.path.join(parent_dir, "valuador_normalizado", "nominatim_cache.json")
    if not os.path.exists(cache_path):
        cache_path = os.path.join(current_dir, "nominatim_cache.json")
        
    cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cache = json.load(f)
            logger.info(f"Caché de Nominatim cargado desde {cache_path}: {len(cache)} registros.")
        except Exception as e:
            logger.warning(f"Error al cargar caché de Nominatim: {e}. Se iniciará vacío.")
            
    normalized_data = []
    
    # Determinar tipo_propiedad dinámicamente
    tipo_propiedad = "Casa"
    if "departamento" in filename_prefix.lower() or "departamento" in base_url.lower():
        tipo_propiedad = "Departamento"
        
    # Determinar tipo_operacion dinámicamente
    tipo_operacion = "Venta"
    if "renta" in filename_prefix.lower() or "renta" in base_url.lower():
        tipo_operacion = "Renta"
        
    # Determinar estado de fallback dinámicamente
    estado_fallback = "Veracruz"
    if "tabasco" in filename_prefix.lower() or "tabasco" in base_url.lower():
        estado_fallback = "Tabasco"
        
    count = 0
    cache_modified = False
    
    for url, record in listings.items():
        count += 1
        data = record.get("data", {})
        
        if count % 20 == 0:
            logger.info(f"Normalizando {count}/{total}...")
            if cache_modified:
                try:
                    with open(cache_path, 'w', encoding='utf-8') as f:
                        json.dump(cache, f, indent=2, ensure_ascii=False)
                    cache_modified = False
                except Exception as e:
                    logger.warning(f"Error al guardar caché periódico: {e}")
                    
        # Extracción básica
        precio_valor = data.get("precio_valor", 0.0)
        precio_moneda = data.get("precio_moneda", "MXN")
        if precio_moneda == "MN": precio_moneda = "MXN"
        
        m2_construidos = data.get("m2_construidos")
        m2_totales = data.get("m2_totales")
        
        lat = data.get("lat")
        lng = data.get("lng")
        
        # Nominatim Reverse Geocoding - DESACTIVADO POR RENDIMIENTO (delay de 1.1s por item)
        estado = estado_fallback
        municipio = None
        colonia = None
        codigo_postal = None
        
        # Procesar ubicación textualmente (inmediato, en ms)
        ubicacion = data.get("ubicacion", "")
        direccion = data.get("direccion", "")
        full_loc = ubicacion if ubicacion else direccion
        parts = [p.strip() for p in full_loc.split(",") if p.strip()]
        
        # Detectar estado de forma dinámica de la ubicación
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

        # Extraer municipio y colonia de las partes de la ubicación
        if len(parts) >= 2:
            municipio = parts[1]
        if len(parts) >= 3:
            colonia = parts[2]
        elif len(parts) == 1:
            municipio = parts[0]
                
        # Variables calculadas y validaciones
        precio_m2_construccion = None
        if precio_valor and precio_valor > 0 and m2_construidos and m2_construidos > 0:
            precio_m2_construccion = round(precio_valor / m2_construidos, 2)
            
        es_valido = False
        if precio_valor >= 150000 and m2_construidos and m2_construidos >= 20 and lat and lng:
            if precio_m2_construccion and 2000 <= precio_m2_construccion <= 100000:
                es_valido = True
                
        # Modificadores Booleanos
        amenidades_str = data.get("amenidades", "")
        desc_str = data.get("descripcion", "")
        
        tiene_alberca = has_keyword([amenidades_str, desc_str], ["alberca", "piscina", "pool"])
        en_fraccionamiento_cerrado = has_keyword([desc_str, data.get("ubicacion"), data.get("direccion")], ["fraccionamiento", "fracc", "residencial", "cluster", "coto", "privada"])
        tiene_vigilancia = has_keyword([amenidades_str, desc_str], ["vigilancia", "seguridad", "24/7", "caseta", "acceso controlado", "guardia"])
        
        # Estructura normalizada exacta
        item = {
            "id_propiedad": str(uuid.uuid4()),
            "url_origen": url,
            "fuente": "Propiedades.com",
            "tipo_propiedad": tipo_propiedad,
            "tipo_operacion": tipo_operacion,
            
            # Métricas Financieras y Dimensiones
            "precio_valor": precio_valor,
            "precio_moneda": precio_moneda,
            "m2_construidos": m2_construidos,
            "m2_totales": m2_totales,
            "antiguedad_anos": normalize_antiguedad(data.get("antiguedad")),
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
            "tiene_vigilancia": tiene_vigilancia
        }
        normalized_data.append(item)
        
    # Guardar caché final si hay cambios
    if cache_modified:
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(cache, f, indent=2, ensure_ascii=False)
            logger.info(f"Caché de Nominatim guardada en: {cache_path}")
        except Exception as e:
            logger.warning(f"Error al guardar caché final: {e}")
            
    # Estructura final
    output = {
        "metadata": {
            "generado_en": datetime.now().isoformat(),
            "total_registros": len(normalized_data),
            "registros_validos_para_valuacion": sum(1 for d in normalized_data if d["es_valido_para_valuacion"])
        },
        "propiedades": normalized_data
    }
    
    # Guardar local en propiedades_com
    local_output_path = os.path.join(current_dir, f"{filename_prefix}_normalizado.json")
    try:
        with open(local_output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        logger.info(f"Datos normalizados locales guardados en: {local_output_path}")
    except Exception as e:
        logger.error(f"Error al guardar archivo normalizado local: {e}")
        
    # Guardar en valuador_normalizado
    valuador_output_path = os.path.join(parent_dir, "valuador_normalizado", f"{filename_prefix}_normalizado.json")
    try:
        os.makedirs(os.path.dirname(valuador_output_path), exist_ok=True)
        with open(valuador_output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        logger.info(f"Datos normalizados del valuador guardados en: {valuador_output_path}")
    except Exception as e:
        logger.error(f"Error al guardar archivo normalizado del valuador: {e}")

def scrape_propiedades_com(base_url, filename_prefix, max_pages=None, min_wait=3, max_wait=6, update_existing_age=False, detail_concurrency=10):
    db_filename = f"{filename_prefix}.json"
    csv_filename = f"{filename_prefix}.csv"
    excel_filename = f"{filename_prefix}.xlsx"
    
    db = PropertyDB(db_filename)
    existing_urls = set(item['url'] for item in db.get_all_as_list() if item.get('url'))
    print(f"Base de datos JSON: {len(existing_urls)} propiedades registradas previamente.")
    
    print(f"\n--- Iniciando Scraper de Propiedades.com (Híbrido) ---")
    print(f"URL de busqueda base: {base_url}")
    if not update_existing_age:
        print("[Modo Rápido Activo] Solo se consultará la edad arquitectónica en páginas de detalle para propiedades nuevas.")
    else:
        print("[Modo Actualización Histórica] Se consultará la edad arquitectónica para todas las propiedades sin edad registrada.")
        
    new_records_count = 0
    total_pages_detected = 1
    
    with SB(uc=True, test=True, locale_code="es") as sb:
        # Pagina 1 inicial
        print("\n=== Navegando a la Pagina 1 ===")
        sb.uc_open(base_url)
        sb.sleep(4)
        solve_akamai_challenge(sb)
        
        # Extraer cookies después del desafío de Akamai
        cookies, headers = get_browser_cookies_and_headers(sb)
        print(f"🍪 {len(cookies)} cookies extraídas del navegador.")
        
        html = sb.get_page_source()
        properties, paginate = extract_json_data(html)
        
        if paginate and paginate.get('pages'):
            total_pages_detected = int(paginate.get('pages'))
            print(f"Paginacion detectada: {paginate.get('items')} propiedades en {total_pages_detected} paginas totales.")
        
        pages_to_scrape = min(max_pages, total_pages_detected) if max_pages else total_pages_detected
        print(f"Objetivo de la sesion: {pages_to_scrape} paginas.")
        
        # Bucle de páginas
        for page_num in range(1, pages_to_scrape + 1):
            if page_num > 1:
                target_url = f"{base_url}?pagina={page_num}"
                print(f"\n=== Navegando a la Pagina {page_num}/{pages_to_scrape}: {target_url} ===")
                
                sb.sleep(random.uniform(min_wait, max_wait))
                sb.uc_open(target_url)
                sb.sleep(4)
                solve_akamai_challenge(sb)
                
                # Refrescar cookies
                cookies, headers = get_browser_cookies_and_headers(sb)
                
                html = sb.get_page_source()
                properties, _ = extract_json_data(html)
                
                if not properties:
                    print(f"[Aviso] Intento de recarga en P{page_num}...")
                    sb.sleep(5)
                    html = sb.get_page_source()
                    properties, _ = extract_json_data(html)
                    
                if not properties:
                    print(f"[Fin] No se encontraron propiedades en la Pagina {page_num}.")
                    break
            
            # Procesar propiedades de la página actual
            parsed_cards = []
            urls_needing_age = []
            
            for p_raw in properties:
                p_clean = clean_property_item(p_raw)
                item_url = p_clean.pop('url', None)
                if not item_url: continue
                
                is_new_url = item_url not in existing_urls
                existing_record = db._data["listings"].get(item_url, {}).get("data", {})
                # En modo "actualizar todo", re-consultar el detalle si falta la edad real
                # o si falta el terreno real (m2_totales ausente o duplicado de construcción).
                falta_edad = "en Propiedades.com" in str(existing_record.get("antiguedad", ""))
                ex_tot = existing_record.get("m2_totales")
                ex_const = existing_record.get("m2_construidos")
                falta_terreno = ex_tot is None or ex_tot == ex_const
                needs_age = is_new_url or (update_existing_age and (falta_edad or falta_terreno))
                
                parsed_cards.append((item_url, is_new_url, existing_record, p_clean, needs_age))
                if needs_age:
                    urls_needing_age.append(item_url)
                    
            # Extracción paralela de detalles (edad + terreno/construcción/estacionamiento)
            detail_results = {}
            if urls_needing_age:
                print(f"🚀 Extrayendo detalle (edad/terreno/estac.) de {len(urls_needing_age)} propiedades vía HTTP ({detail_concurrency} hilos)...")
                detail_results = fetch_all_details_threaded(urls_needing_age, cookies, headers, detail_concurrency)
                success_count = sum(1 for a in detail_results.values() if a)
                print(f"✅ Detalles extraídos exitosamente: {success_count}/{len(urls_needing_age)}")

                # Reintento rápido si fallan muchas
                if success_count < len(urls_needing_age) * 0.5:
                    failed_urls = [u for u, a in detail_results.items() if not a]
                    if failed_urls:
                        print(f"⚠ {len(failed_urls)} fallos. Reintentando con cookies frescas...")
                        cookies, headers = get_browser_cookies_and_headers(sb)
                        retry_results = fetch_all_details_threaded(failed_urls, cookies, headers, 5)
                        detail_results.update(retry_results)
            else:
                print(f"⚡ Todas las propiedades en esta página ya están completas.")

            page_new_count = 0
            page_updated_count = 0

            for item_url, is_new_url, existing_record, p_clean, needs_age in parsed_cards:
                detail = detail_results.get(item_url) if needs_age else None
                if detail:
                    if detail.get("antiguedad"):
                        p_clean["antiguedad"] = detail["antiguedad"]
                    # Terreno y construcción REALES del detalle (el listado solo trae construcción en size_m2)
                    if detail.get("m2_totales") is not None:
                        p_clean["m2_totales"] = detail["m2_totales"]
                    if detail.get("m2_construidos") is not None:
                        p_clean["m2_construidos"] = detail["m2_construidos"]
                    # El detalle suele traer estacionamiento aunque el listado no
                    if detail.get("estacionamientos") is not None and detail["estacionamientos"] > (p_clean.get("estacionamientos") or 0):
                        p_clean["estacionamientos"] = detail["estacionamientos"]
                
                if not is_new_url and existing_record:
                    merged_item = existing_record.copy()
                    for key, val in p_clean.items():
                        if key == "antiguedad" and existing_record.get(key) not in [None, 'N/A', ''] and "en Propiedades.com" not in str(existing_record.get(key, "")):
                            pass # Preserve real age if we already have it
                        elif val in (None, "", 0, 0.0) and existing_record.get(key) not in (None, "", 0, 0.0):
                            pass # No pisar un dato bueno existente (terreno/estac./etc.) con un vacío del listado
                        else:
                            merged_item[key] = val
                    item_to_save = merged_item
                else:
                    item_to_save = p_clean
                    
                if db.upsert(item_url, item_to_save, autosave=False):
                    if is_new_url:
                        new_records_count += 1
                        page_new_count += 1
                        existing_urls.add(item_url)
                    else:
                        page_updated_count += 1

            # Guardado único por página (en lugar de uno por cada registro)
            db.save()
            print(f"✅ Pagina {page_num}: {len(properties)} procesadas ({page_new_count} nuevas, {page_updated_count} actualizadas).")
            # Export CSV/XLSX diferido: cada 5 páginas (el JSON ya quedó a salvo arriba)
            if page_num % 5 == 0:
                export_data(db, csv_filename, excel_filename)

    # Export final garantizado (cubre páginas no múltiplos de 5 y cualquier break)
    export_data(db, csv_filename, excel_filename)

    print(f"\n=== PROCESO COMPLETADO ===")
    print(f"Propiedades nuevas extraidas en esta sesion: {new_records_count}")
    print(f"Total en base de datos: {len(db.get_all_as_list())}")
    
    # Auto-normalizar base de datos
    normalize_and_save_data(db_filename, filename_prefix, base_url)


def export_data(db, csv_filename, excel_filename):
    """Exporta los datos a CSV y Excel."""
    all_data = db.get_all_as_list()
    if all_data:
        df = pd.DataFrame(all_data)
        try:
            df.to_csv(csv_filename, index=False, encoding="utf-8-sig")
            logger.debug(f"CSV actualizado: {csv_filename}")
        except Exception as e:
            logger.warning(f"No se pudo guardar CSV: {e}")
            
        try:
            df.to_excel(excel_filename, index=False)
            logger.debug(f"Excel actualizado: {excel_filename}")
        except Exception as e:
            logger.warning(f"No se pudo guardar Excel: {e}")

if __name__ == "__main__":
    print("=== SCRAPER PROPIEDADES.COM (ULTRARRÁPIDO) ===")
    print("Opciones de busqueda:")
    print("1. Casas en Venta en Veracruz, Ver.")
    print("2. Departamentos en Venta en Veracruz, Ver.")
    print("3. Casas en Venta en Villahermosa, Tabasco")
    print("4. Ingresar URL personalizada")
    
    op = input("Selecciona una opcion (1/2/3/4) [por defecto 1]: ") or "1"
    
    if op == "1":
        target_url = "https://propiedades.com/veracruz-veracruz/casas-venta"
        prefix = "propiedades_veracruz_casas"
    elif op == "2":
        target_url = "https://propiedades.com/veracruz-veracruz/departamentos-venta"
        prefix = "propiedades_veracruz_departamentos"
    elif op == "3":
        target_url = "https://propiedades.com/villahermosa-tabasco/casas-venta"
        prefix = "propiedades_tabasco_casas"
    elif op == "4":
        target_url = input("Ingresa la URL completa de Propiedades.com: ").strip()
        prefix = input("Ingresa el nombre del archivo de salida (ej: veracruz_casas): ").strip()
        if not target_url or not prefix:
            print("Datos invalidos. Saliendo.")
            exit()
    else:
        print("Opcion no valida.")
        exit()
        
    modo_act = input("¿Deseas consultar la edad real SOLO de propiedades nuevas o también actualizar el historial existente? (1 = Solo nuevas [RÁPIDO], 2 = Actualizar todo) [por defecto 1]: ").strip() or "1"
    act_todo = (modo_act == "2")
    
    paginas = input("¿Cuantas paginas deseas revisar? (Presiona Enter para revisar TODAS): ").strip()
    max_p = int(paginas) if paginas.isdigit() else None
    
    conc_input = input("\n¿Grado de concurrencia HTTP para detalles? (Ej: 10) [por defecto 10]: ").strip() or "10"
    concurrency = int(conc_input) if conc_input.isdigit() else 10
    
    scrape_propiedades_com(target_url, prefix, max_pages=max_p, update_existing_age=act_todo, detail_concurrency=concurrency)
