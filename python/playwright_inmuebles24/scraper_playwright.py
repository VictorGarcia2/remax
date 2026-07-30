"""
SCRAPER INMUEBLES24 ULTRARRÁPIDO - Versión Híbrida
===================================================
Usa SeleniumBase UC (uc=True) para navegar los listados sin ser bloqueado por Cloudflare,
y luego usa requests + ThreadPoolExecutor con las cookies robadas del navegador para
extraer los detalles de cada propiedad en PARALELO y ULTRARRÁPIDO (~10 propiedades simultáneas).

Esto combina lo mejor de ambos mundos:
- SeleniumBase UC: bypass de Cloudflare probado y confiable (parchea Chrome a nivel de bytes)
- requests + hilos: requests HTTP paralelos puros, sin abrir pestañas del navegador
"""
import re
import time
import base64
import logging
import random
import os
import threading
import requests
from curl_cffi import requests as curl_requests  # impersona el fingerprint TLS de Chrome (vence Cloudflare)
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
from bs4 import BeautifulSoup
from seleniumbase import SB
from json_db import PropertyDB
from utils import clean_numeric, clean_price, normalize_antiguedad

# Forzar UTF-8 en stdout/stderr para evitar UnicodeEncodeError en consolas Windows (cp1252)
import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# Configuración de logging profesional
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def parser_html(html_content, url=''):
    """
    Parsea el contenido HTML individual de una tarjeta y extrae sus atributos clave de forma estructurada.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    item = {"url": f"https://www.inmuebles24.com{url}"}
    
    # 1. Extraer Precio
    price_tag = soup.find('h2', attrs={'data-qa': 'POSTING_CARD_PRICE'})
    if not price_tag:
        price_tag = soup.find(class_=lambda x: x and 'price' in x.lower() and 'posting' in x.lower())
    
    raw_price = price_tag.get_text(strip=True) if price_tag else 'N/A'
    price_val, currency, maint_val = clean_price(raw_price)
    item['precio'] = raw_price
    item['precio_valor'] = price_val
    item['precio_moneda'] = currency
    item['mantenimiento_valor'] = maint_val
    
    # 2. Extraer Características Principales
    features_tag = soup.find('h3', attrs={'data-qa': 'POSTING_CARD_FEATURES'})
    item['caracteristicas'] = ''
    item['m2_totales'] = None
    item['m2_construidos'] = None
    item['recamaras'] = 0
    item['banos'] = 0
    item['estacionamientos'] = 0
    item['antiguedad'] = 'N/A'
    item['lat'] = None
    item['lng'] = None
    
    if features_tag:
        spans = [s.get_text(strip=True).lower() for s in features_tag.find_all('span')]
        item['caracteristicas'] = " | ".join(spans)
        
        for text in spans:
            if 'm² tot' in text:
                item['m2_totales'] = clean_numeric(text)
            elif 'm² cub' in text or 'm² const' in text:
                item['m2_construidos'] = clean_numeric(text)
            elif 'rec' in text:
                val = clean_numeric(text)
                if val is not None: item['recamaras'] = int(val)
            elif 'baño' in text:
                val = clean_numeric(text)
                if val is not None: item['banos'] = int(val)
            elif 'estac' in text:
                val = clean_numeric(text)
                if val is not None: item['estacionamientos'] = int(val)
        
    # 3. Ubicación: Dirección
    addr_tag = soup.find('h4', class_=lambda x: x and 'location-address' in x.lower())
    item['direccion'] = addr_tag.get_text(strip=True) if addr_tag else 'N/A'
    
    # 4. Ubicación: Colonia / Ciudad
    loc_tag = soup.find('h4', attrs={'data-qa': 'POSTING_CARD_LOCATION'})
    item['ubicacion'] = loc_tag.get_text(strip=True) if loc_tag else 'N/A'
    
    # 5. Descripción del inmueble
    desc_tag = soup.find(attrs={'data-qa': 'POSTING_CARD_DESCRIPTION'})
    item['descripcion'] = desc_tag.get_text(strip=True) if desc_tag else 'N/A'
    
    # 6. Amenidades extras (Pills)
    pills = soup.find_all('span', class_=lambda x: x and 'feature' in x.lower() and 'pill' in x.lower())
    item['amenidades'] = " | ".join([p.get_text(strip=True) for p in pills])
    
    return item


def parse_coordinates_fallback(html: str, soup: BeautifulSoup) -> tuple:
    """
    Intenta extraer lat y lng de mapas estáticos, iframes de Google Maps,
    o inicializaciones de Leaflet en el HTML.
    Retorna (lat, lng) o (None, None).
    """
    # 1. Buscar en URLs de Google Maps estáticos o dinámicos en todo el HTML
    map_matches = re.findall(r'(?:center|markers|q|query)=([-\d.]+),([-\d.]+)', html)
    for lat_str, lng_str in map_matches:
        try:
            lat, lng = float(lat_str), float(lng_str)
            if 14.0 <= abs(lat) <= 33.0 and 85.0 <= abs(lng) <= 120.0:
                return abs(lat), -abs(lng)
        except ValueError:
            continue

    # 2. Buscar en URLs del formato /@lat,lng en enlaces de Google Maps
    at_matches = re.findall(r'/@([-\d.]+),([-\d.]+)', html)
    for lat_str, lng_str in at_matches:
        try:
            lat, lng = float(lat_str), float(lng_str)
            if 14.0 <= abs(lat) <= 33.0 and 85.0 <= abs(lng) <= 120.0:
                return abs(lat), -abs(lng)
        except ValueError:
            continue

    # 3. Buscar en scripts o atributos que inicien Leaflet o Mapbox
    leaflet_matches = re.findall(r'(?:L\.marker|marker|LatLng)\(\s*\[?\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]?\s*\)', html)
    for lat_str, lng_str in leaflet_matches:
        try:
            lat, lng = float(lat_str), float(lng_str)
            if 14.0 <= abs(lat) <= 33.0 and 85.0 <= abs(lng) <= 120.0:
                return abs(lat), -abs(lng)
        except ValueError:
            continue

    # 4. Buscar en meta tags u otros elementos del DOM (ej. data-lat/data-lng)
    map_el = (soup.select_one("[data-lat]") or 
              soup.select_one("[data-latitude]") or 
              soup.select_one("#map") or 
              soup.select_one(".map"))
    if map_el:
        lat_val = map_el.get("data-lat") or map_el.get("data-latitude")
        lng_val = map_el.get("data-lng") or map_el.get("data-longitude")
        if lat_val and lng_val:
            try:
                lat, lng = float(lat_val), float(lng_val)
                return abs(lat), -abs(lng)
            except ValueError:
                pass

    return None, None


def extract_property_details(html_content):
    """
    Extrae las características detalladas del HTML de la página de propiedad.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    features = {}
    
    # Extraer coordenadas de variables ocultas en JS (Base64 encoded)
    lat_match = re.search(r'mapLatOf\s*=\s*[\"\']([@A-Za-z0-9\+\/\=]+)[\"\']', html_content)
    lng_match = re.search(r'mapLngOf\s*=\s*[\"\']([@A-Za-z0-9\+\/\=]+)[\"\']', html_content)
    lat, lng = None, None
    if lat_match and lng_match:
        try:
            lat = float(base64.b64decode(lat_match.group(1)).decode('utf-8'))
            lng = float(base64.b64decode(lng_match.group(1)).decode('utf-8'))
        except Exception:
            pass
            
    if lat is None or lng is None:
        flat, flng = parse_coordinates_fallback(html_content, soup)
        if flat and flng:
            lat, lng = flat, flng
            
    features['lat'] = lat
    features['lng'] = lng
            
    icon_map = {
        "icon-stotal": "m2_totales",
        "icon-scubierta": "m2_construidos",
        "icon-dormitorio": "recamaras",
        "icon-bano": "banos",
        "icon-cochera": "estacionamientos",
        "icon-antiguedad": "antiguedad"
    }
    
    items = soup.find_all('li', class_='icon-feature')
    if not items:
         items = soup.select('ul.section-icon-features li')
    
    for li in items:
        icon = li.find('i')
        icon_class = ""
        if icon:
            for cls in icon.get('class', []):
                if cls in icon_map:
                    icon_class = cls
                    break
        
        if icon_class:
            field = icon_map[icon_class]
            text = li.get_text(strip=True)
            if field == "antiguedad":
                features[field] = normalize_antiguedad(text)
            else:
                val = clean_numeric(text)
                if val is not None:
                    if field in ["recamaras", "banos", "estacionamientos"]:
                        features[field] = int(val)
                    else:
                        features[field] = val
                    
    return features


def get_browser_cookies_and_headers(sb):
    """
    Extrae cookies y headers del navegador SeleniumBase para requests HTTP.
    Compatible con CDP Mode (SeleniumBase UC moderno).
    """
    # Obtener cookies via CDP (funciona en CDP Mode)
    cookie_dict = {}
    try:
        cdp_cookies = sb.execute_cdp_cmd("Network.getAllCookies", {})
        for cookie in cdp_cookies.get("cookies", []):
            cookie_dict[cookie['name']] = cookie['value']
    except Exception:
        try:
            # Fallback al método estándar
            for cookie in sb.driver.get_cookies():
                cookie_dict[cookie['name']] = cookie['value']
        except Exception:
            logger.warning("⚠ No se pudieron extraer cookies del navegador.")
    
    # Obtener User-Agent
    try:
        ua = sb.execute_script("return navigator.userAgent;")
    except Exception:
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    
    headers = {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.inmuebles24.com/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
    }
    
    return cookie_dict, headers


# Sesión curl_cffi por-hilo: el handle de curl NO es seguro de compartir entre hilos.
_curl_tls = threading.local()

def _get_curl_session():
    s = getattr(_curl_tls, "session", None)
    if s is None:
        s = curl_requests.Session(impersonate="chrome")
        _curl_tls.session = s
    return s


def fetch_detail_http(url, cookies=None, headers=None):
    """
    Descarga el detalle vía curl_cffi impersonando Chrome, pasando cookies y headers
    obtenidos del navegador para bypassear Cloudflare de forma robusta.
    """
    try:
        # Delay aleatorio para no saturar
        time.sleep(random.uniform(0.1, 0.4))

        response = _get_curl_session().get(url, cookies=cookies, headers=headers, timeout=20)
        if response.status_code == 200:
            html = response.text
            # Verificar que no sea una página de Cloudflare
            if "cf-challenge-running" in html or "Just a moment" in html:
                logger.warning(f"      ⚠ Cloudflare en detalle HTTP: {url}")
                return url, {}
            details = extract_property_details(html)
            return url, details
        elif response.status_code == 403:
            logger.warning(f"      ⚠ 403 Forbidden: {url}")
            return url, {}
        elif response.status_code == 410:
            # Anuncio expirado/eliminado (no es bloqueo)
            return url, {}
        else:
            logger.warning(f"      ⚠ HTTP {response.status_code}: {url}")
            return url, {}
    except Exception as e:
        logger.error(f"      ❌ Error HTTP en {url}: {e}")
        return url, {}


def fetch_all_details_threaded(urls, cookies, headers, concurrency=10):
    """
    Descarga los detalles en paralelo (ThreadPoolExecutor) usando curl_cffi,
    pasando cookies y headers de la sesión del navegador.
    """
    results = {}

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = {executor.submit(fetch_detail_http, url, cookies, headers): url for url in urls}
        for future in as_completed(futures):
            try:
                url, details = future.result()
                results[url] = details
            except Exception as e:
                url = futures[future]
                logger.error(f"      ❌ Error en hilo para {url}: {e}")
                results[url] = {}

    return results


def fetch_details_via_browser(sb, urls):
    """
    Fallback anti-Cloudflare: descarga los detalles navegando con el navegador UC.
    Inmuebles24 valida el fingerprint TLS del navegador, por lo que los requests
    HTTP puros dan 403; el navegador sí pasa. Es secuencial (más lento) pero fiable.
    """
    results = {}
    total = len(urls)
    for i, url in enumerate(urls, 1):
        try:
            sb.driver.uc_open_with_reconnect(url, reconnect_time=3)
            sb.sleep(random.uniform(1.5, 2.8))
            html = sb.get_page_source()
            # Si aparece el challenge de Cloudflare, intentar resolverlo
            if "cf-challenge-running" in html or "Just a moment" in html or "un momento" in html.lower():
                try:
                    sb.uc_gui_click_captcha()
                    sb.sleep(3)
                    html = sb.get_page_source()
                except Exception:
                    pass
            details = extract_property_details(html)
            results[url] = details if details else {}
        except Exception as e:
            logger.error(f"      ❌ Error navegador en {url}: {e}")
            results[url] = {}
        if i % 5 == 0 or i == total:
            ok = len([d for d in results.values() if d])
            logger.info(f"      [navegador] {i}/{total} procesados ({ok} con datos)")
    return results


def scrape_inmuebles24(base_search_path, filename_prefix, start_page=1, max_pages=None, 
                       update_existing_details=False, detail_concurrency=10):
    base_url = "https://www.inmuebles24.com/"
    csv_filename = f"{filename_prefix}.csv"
    excel_filename = f"{filename_prefix}.xlsx"
    db_filename = f"{filename_prefix}.json"
    
    # Cargar base de datos
    db = PropertyDB(db_filename)
    existing_urls = set(item['url'] for item in db.get_all_as_list() if item.get('url'))
    logger.info(f"Base de datos JSON: {len(existing_urls)} registros en {db_filename}.")

    new_records_count = 0
    pages_to_scrape = max_pages if max_pages else 100
    
    with SB(uc=True, test=True, locale_code="es") as sb:
        # ============================================================
        # FASE 1: Bypass de Cloudflare con SeleniumBase UC
        # ============================================================
        logger.info("🛡️  Iniciando bypass de Cloudflare con SeleniumBase UC...")
        sb.driver.uc_open_with_reconnect(base_url, reconnect_time=4)
        logger.info("Esperando validación de Cloudflare...")
        try:
            sb.sleep(5)
            sb.uc_gui_click_captcha()
            sb.sleep(3)
        except Exception:
            pass
        logger.info("✅ Bypass de Cloudflare completado.")
        
        # ============================================================
        # FASE 2: Extraer cookies y headers para HTTP paralelo
        # ============================================================
        cookies, headers = get_browser_cookies_and_headers(sb)
        logger.info(f"🍪 {len(cookies)} cookies extraídas del navegador.")
        
        cf_clearance = cookies.get('cf_clearance', '')
        if cf_clearance:
            logger.info(f"✅ Cookie cf_clearance encontrada: {cf_clearance[:20]}...")
        else:
            logger.warning("⚠ No se encontró cf_clearance. Los requests de detalle podrían fallar.")
        
        # ============================================================
        # FASE 3: Ciclo de paginación (navegador) + detalles (HTTP hilos)
        # ============================================================
        for page in range(start_page, start_page + pages_to_scrape):
            if page == 1:
                target_url = f"{base_url}{base_search_path}.html"
            else:
                target_url = f"{base_url}{base_search_path}-pagina-{page}.html"
                
            logger.info(f"\n{'='*60}")
            logger.info(f"[Página {page}] {target_url}")
            logger.info(f"{'='*60}")
            
            # Navegar al listado con el navegador UC (bypass garantizado)
            cards_data = []
            for retry in range(1, 4):
                sb.open(target_url)
                sb.sleep(3)
                sb.scroll_to_bottom()
                sb.sleep(2)
                
                # Extraer tarjetas con JS
                script = """
                let results = [];
                let cards = document.querySelectorAll('div[data-to-posting], [data-qa="posting"]');
                for (let card of cards) {
                    let item = {};
                    item.url = "https://www.inmuebles24.com" + (card.getAttribute('data-to-posting') || '');
                    item.html = card.innerHTML || '';
                    item.text = card.innerText || '';
                    results.push(item);
                }
                return results;
                """
                cards_data = sb.execute_script(script)
                
                if cards_data:
                    break
                else:
                    logger.warning(f"⚠ Intento {retry}/3: Sin tarjetas en página {page}. Reintentando...")
                    sb.sleep(5)
            
            if not cards_data:
                logger.error(f"❌ No se pudieron cargar anuncios en la página {page}.")
                break
                
            logger.info(f"📋 {len(cards_data)} anuncios encontrados en página {page}.")
            
            # Refrescar cookies después de cada navegación exitosa
            cookies, headers = get_browser_cookies_and_headers(sb)
            
            # Parsear datos básicos del listado
            parsed_cards = []
            urls_needing_details = []
            
            for card in cards_data:
                url = card.get('url', '')
                if not url or url == "https://www.inmuebles24.com":
                    continue
                
                is_new_url = url not in existing_urls
                existing_record = db._data["listings"].get(url, {}).get("data", {})
                
                parsed_item = parser_html(card.get('html', ''), url.replace("https://www.inmuebles24.com", ""))
                if parsed_item['precio'] == 'N/A' and card.get('text'):
                    parsed_item['raw_text'] = card.get('text').replace('\n', ' | ')
                
                needs_details = is_new_url or (
                    update_existing_details and (
                        existing_record.get('lat') is None or 
                        existing_record.get('antiguedad') in ['N/A', None, '']
                    )
                )
                
                parsed_cards.append((url, is_new_url, existing_record, parsed_item, needs_details))
                
                if needs_details:
                    urls_needing_details.append(url)
            
            # ============================================================
            # EXTRACCIÓN DE DETALLES ULTRARRÁPIDA (HTTP hilos, sin navegador)
            # ============================================================
            detail_results = {}
            if urls_needing_details:
                logger.info(f"🚀 Extrayendo detalles de {len(urls_needing_details)} propiedades vía HTTP ({detail_concurrency} hilos)...")
                
                detail_results = fetch_all_details_threaded(
                    urls_needing_details, cookies, headers, detail_concurrency
                )
                
                success_count = len([d for d in detail_results.values() if d])
                logger.info(f"✅ Detalles extraídos: {success_count}/{len(urls_needing_details)}")
                
                # Si muchos fallaron, reintentar con cookies frescas
                if success_count < len(urls_needing_details) * 0.5:
                    failed_urls = [u for u, d in detail_results.items() if not d]
                    if failed_urls:
                        logger.warning(f"⚠ {len(failed_urls)} detalles fallidos. Reintentando...")
                        cookies, headers = get_browser_cookies_and_headers(sb)
                        retry_results = fetch_all_details_threaded(
                            failed_urls, cookies, headers, 5
                        )
                        detail_results.update(retry_results)

                # Fallback robusto: lo que el HTTP no logró (403/Cloudflare) se baja con el navegador
                still_failed = [u for u, d in detail_results.items() if not d]
                if still_failed:
                    logger.info(f"🌐 {len(still_failed)} detalles vía NAVEGADOR (fallback anti-Cloudflare)...")
                    browser_results = fetch_details_via_browser(sb, still_failed)
                    detail_results.update(browser_results)
                    success_count = len([d for d in detail_results.values() if d])
                    logger.info(f"✅ Detalles tras fallback navegador: {success_count}/{len(urls_needing_details)}")
            else:
                logger.info(f"⚡ Todas las propiedades ya están en la base de datos.")
            
            # Combinar e insertar
            page_new_count = 0
            page_updated_count = 0
            
            for url, is_new_url, existing_record, parsed_item, needs_details in parsed_cards:
                if needs_details and url in detail_results and detail_results[url]:
                    parsed_item.update(detail_results[url])
                
                # Merge inteligente
                if not is_new_url and existing_record:
                    merged_item = existing_record.copy()
                    for key, val in parsed_item.items():
                        if key in ["lat", "lng", "antiguedad"]:
                            if existing_record.get(key) not in [None, 'N/A', '']:
                                continue
                        merged_item[key] = val
                    item_to_save = merged_item
                else:
                    item_to_save = parsed_item
                
                # Quitar clave url del valor
                item_data = item_to_save.copy()
                if 'url' in item_data:
                    item_data.pop('url')
                
                if db.upsert(url, item_data, autosave=False):
                    if is_new_url:
                        new_records_count += 1
                        page_new_count += 1
                        existing_urls.add(url)
                    else:
                        page_updated_count += 1

            # Guardado único por página (en lugar de uno por cada registro)
            db.save()
            logger.info(f"✅ Página {page} completada: {page_new_count} nuevas, {page_updated_count} actualizadas.")
            # Export CSV/XLSX diferido: cada 5 páginas (el JSON ya quedó a salvo arriba)
            if page % 5 == 0:
                export_data(db, csv_filename, excel_filename)
            
            # Auto-stop
            if len(cards_data) > 0 and page_new_count == 0 and page_updated_count == 0 and not update_existing_details:
                logger.info("🏁 Todos los anuncios de esta página ya existen. Finalizando paginación.")
                break
            
            # Pausa entre páginas
            wait = random.uniform(3, 5)
            logger.info(f"⏳ Esperando {wait:.1f}s antes de la siguiente página...")
            sb.sleep(wait)
    
    # Export final garantizado (cubre las páginas no múltiplos de 5 y cualquier break)
    export_data(db, csv_filename, excel_filename)

    logger.info(f"\n{'='*60}")
    logger.info(f"=== PROCESO COMPLETADO ===")
    logger.info(f"Propiedades nuevas: {new_records_count}")
    logger.info(f"Total en base de datos: {len(db.get_all_as_list())}")
    logger.info(f"{'='*60}")

    # Auto-normalización hacia valuador_normalizado (consistente con los demás scrapers)
    try:
        norm_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "valuador_normalizado")
        if norm_dir not in sys.path:
            sys.path.insert(0, norm_dir)
        import normalizador_valuacion as nv
        nv.CACHE_FILE = os.path.join(norm_dir, "nominatim_cache.json")
        out_path = os.path.join(norm_dir, f"{filename_prefix}_normalizado.json")
        nv.process_data(db_filename, out_path)
        logger.info(f"📤 Normalizado generado en: {out_path}")
    except Exception as e:
        logger.warning(f"⚠ No se pudo auto-normalizar inmuebles24: {e}")


def export_data(db, csv_filename, excel_filename):
    """Exporta los datos de la base de datos JSON a archivos CSV y Excel."""
    all_data = db.get_all_as_list()
    if all_data:
        df = pd.DataFrame(all_data)
        try:
            df.to_csv(csv_filename, index=False, encoding="utf-8-sig")
        except PermissionError:
            logger.warning(f"⚠ Permiso denegado para escribir en {csv_filename}.")
        except Exception as e:
            logger.warning(f"Error escribiendo CSV: {e}")
            
        try:
            df.to_excel(excel_filename, index=False)
        except PermissionError:
            logger.warning(f"⚠ Permiso denegado para escribir en {excel_filename}.")
        except Exception as e:
            logger.warning(f"Error escribiendo Excel: {e}")


if __name__ == "__main__":
    import sys
    
    print("=== SCRAPER INMUEBLES24 ULTRARRÁPIDO (UC + HTTP Paralelo) ===")
    print("Combina SeleniumBase UC (bypass Cloudflare) + HTTP paralelo (velocidad máxima)")
    print()
    print("Selecciona una opción de búsqueda:")
    print("1. Casas en Venta en Tabasco")
    print("2. Departamentos en Venta en Tabasco")
    print("3. Casas en Venta en Veracruz")
    print("4. Departamentos en Venta en Veracruz")
    print("5. Ingresar ruta de búsqueda personalizada")
    
    op = input("Selecciona una opción (1/2/3/4/5) [por defecto 3]: ").strip() or "3"
    
    if op == "1":
        base_search_path = "casas-en-venta-en-tabasco-provincia"
        prefix = "inmuebles24_tabasco_casas"
    elif op == "2":
        base_search_path = "departamentos-en-venta-en-tabasco-provincia"
        prefix = "inmuebles24_tabasco_departamentos"
    elif op == "3":
        base_search_path = "casas-en-venta-en-veracruz-provincia"
        prefix = "inmuebles24_veracruz_casas"
    elif op == "4":
        base_search_path = "departamentos-en-venta-en-veracruz-provincia"
        prefix = "inmuebles24_veracruz_departamentos"
    elif op == "5":
        base_search_path = input("Ruta de búsqueda (ej: casas-en-venta-en-boca-del-rio): ").strip()
        base_search_path = re.sub(r'^\/|\.html$', '', base_search_path)
        prefix = input("Prefijo del archivo de salida (ej: inmuebles24_boca_del_rio_casas): ").strip()
        if not base_search_path or not prefix:
            print("Datos inválidos.")
            sys.exit()
    else:
        print("Opción inválida.")
        sys.exit()
        
    modo_act = input("\n¿Deseas extraer detalles profundos (coordenadas, antigüedad real) SOLO de propiedades nuevas o actualizar también registros antiguos?\n1 = Solo nuevas (Modo Rápido) [RÁPIDO - por defecto]\n2 = Actualizar historial incompleto [LENTO]\nSelección (1/2): ").strip() or "1"
    act_todo = (modo_act == "2")
    
    pagina_inicio = input("\n¿Desde qué página empezar? (Ej: 1) [por defecto 1]: ").strip() or "1"
    pagina_inicio = int(pagina_inicio) if pagina_inicio.isdigit() else 1
    
    paginas = input("¿Cuántas páginas revisar? (Presiona Enter para revisar hasta 100): ").strip()
    max_p = int(paginas) if paginas.isdigit() else 100
    
    conc_input = input("\n¿Grado de concurrencia HTTP para detalles? (Ej: 10) [por defecto 10]: ").strip() or "10"
    concurrency = int(conc_input) if conc_input.isdigit() else 10
    
    scrape_inmuebles24(
        base_search_path=base_search_path,
        filename_prefix=prefix,
        start_page=pagina_inicio,
        max_pages=max_p,
        update_existing_details=act_todo,
        detail_concurrency=concurrency
    )
