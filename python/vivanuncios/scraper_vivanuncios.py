"""
scraper_vivanuncios.py — Vivanuncios.com.mx — Casas en venta en Veracruz
Produce la misma estructura JSON que inmuebles24_veracruz_casas_normalizado.json.

Selectores y variables extraídas del DOM real de Vivanuncios (2026-06-08):
  - URLs de listado:   a[href*="/a-venta-casa/"] o a[href*="/a-"] con ID numérico al final
  - Coordenadas:       base64-decode de 'mapLatOf' y 'mapLngOf' en script tags
  - Precio:            'precioVenta' en script dataLayer
  - Atributos:         JSON.parse de 'const mainFeatures = {...}'
  - Ubicación:         'ciudad', 'provincia', 'barrio' en script dataLayer
"""

import json
import re
import random
import logging
import sys
import os
import uuid

import time
import threading
import base64
import requests
from curl_cffi import requests as curl_requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup
from seleniumbase import SB

# Insertar path de la base de datos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'playwright_inmuebles24'))
from json_db import PropertyDB

# Fix encoding para Windows (cp1252 no soporta emojis/unicode)
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BASE = "https://www.vivanuncios.com.mx"
NORMALIZED_DIR = os.path.join(os.path.dirname(__file__), '..', 'valuador_normalizado')

# ── helpers ────────────────────────────────────────────────────────────────

def _num(text: str) -> float:
    if not text:
        return 0.0
    m = re.search(r"[\d,]+(?:\.\d+)?", text.replace("\xa0", "").replace(",", ""))
    return float(m.group().replace(",", "")) if m else 0.0

def _int(text: str) -> int:
    return int(_num(text))

def _has_keyword(text_list, keywords):
    combined = " ".join([str(t) for t in text_list if t]).lower()
    return any(kw in combined for kw in keywords)

# ── decodificador de coordenadas base64 ───────────────────────────────────

def decode_b64(val: str) -> float | None:
    if not val:
        return None
    try:
        # Añadir padding si es necesario
        missing_padding = len(val) % 4
        if missing_padding:
            val += '=' * (4 - missing_padding)
        decoded = base64.b64decode(val).decode("utf-8")
        return float(decoded)
    except Exception:
        return None

# ── check de seguridad / captchas ──────────────────────────────────────────

def check_captcha_and_alert(sb):
    # Si podemos extraer URLs de listado, no estamos bloqueados
    try:
        html = sb.get_page_source()
        if extract_listing_urls(html):
            return  # No estamos bloqueados, salir inmediatamente!
    except Exception:
        pass

    captcha_selectors = [
        "iframe[src*='recaptcha']",
        "iframe[src*='hcaptcha']",
        "iframe[src*='turnstile']",
        "div#cf-turnstile-iframe",
        "div.g-recaptcha",
        "div#challenge-stage",
    ]
    title_keywords = ["just a moment", "security check", "verify you are human", "attention required", "captcha", "security verification"]
    
    first_alert = True
    while True:
        is_blocked = False
        try:
            # Si hay URLs de listado en el DOM, definitivamente no estamos bloqueados
            html = sb.get_page_source()
            if extract_listing_urls(html):
                break
        except Exception:
            pass
            
        try:
            title = sb.get_title().lower()
            if any(k in title for k in title_keywords):
                is_blocked = True
        except Exception:
            pass
            
        if not is_blocked:
            for selector in captcha_selectors:
                try:
                    if sb.is_element_visible(selector):
                        is_blocked = True
                        break
                except Exception:
                    pass
                    
        if not is_blocked:
            try:
                html = sb.get_page_source().lower()
                if "enable javascript and cookies" in html or ("cloudflare" in html and "challenge" in html) or "security verification" in html or "solve this math problem" in html:
                    is_blocked = True
            except Exception:
                pass
                
        # 4. Intentar auto-resolver captcha matemático
        if is_blocked:
            try:
                html = sb.get_page_source().lower()
                if "solve this math problem" in html:
                    input_selector = "#math-answer, input[type='number'], input[type='text']:not([hidden]), input:not([type])"
                    
                    if sb.is_element_visible(input_selector):
                        print("   [Auto-Solve] Intentando resolver captcha matemático automáticamente...")
                        text = sb.get_text("body")
                        import re
                        match = re.search(r"(\d+)\s*([\+\-\*xX×−–/÷])\s*(\d+)\s*=", text)
                        if match:
                            num1, op, num2 = int(match.group(1)), match.group(2).lower(), int(match.group(3))
                            if op == '+':
                                ans = num1 + num2
                            elif op in ['-', '−', '–']:
                                ans = num1 - num2
                            elif op in ['*', 'x', 'X', '×']:
                                ans = num1 * num2
                            elif op in ['/', '÷']:
                                ans = num1 // num2 if num2 != 0 else 0
                            else:
                                ans = num1 + num2
                            
                            # Limpiar input, escribir y presionar ENTER para hacer submit sin depender del click
                            sb.clear(input_selector)
                            sb.type(input_selector, str(ans) + "\n")
                            sb.sleep(1.0)
                            
                            # Intento de respaldo para hacer click en el botón "Verify" si el Enter no funcionó
                            try:
                                if sb.is_element_visible("#verify-btn"):
                                    sb.click("#verify-btn")
                                elif sb.is_element_visible("button"):
                                    sb.click("button")
                                elif sb.is_element_visible("input[type='submit']"):
                                    sb.click("input[type='submit']")
                            except Exception:
                                pass
                                
                            print(f"   [Auto-Solve] Respuesta {ans} enviada (Enter/Click). Esperando validación...")
                            sb.sleep(4.0)
                            # Verificar si hubo error "incorrect" o si sigue igual
                            html_after = sb.get_page_source().lower()
                            if "incorrect" in html_after or "try again" in html_after:
                                print("   [Auto-Solve] Respuesta incorrecta. Refrescando...")
                                sb.refresh()
                                sb.sleep(4.0)
                            continue # Vuelve a evaluar si sigue bloqueado
                    else:
                        print("   [Auto-Solve] Input no visible (quizás atascado). Refrescando...")
                        sb.refresh()
                        sb.sleep(5.0)
                        continue
            except Exception as e:
                pass
                
        if not is_blocked:
            if not first_alert:
                print("   [✓] ¡Desafío resuelto! Reanudando...")
            break
            
        if first_alert:
            logger.warning("[¡ALERTA!] Bloqueo o desafío de seguridad/captcha detectado.")
            print("\n" + "!" * 80)
            print("  ¡CAPTCHA O DESAFÍO CLOUDFLARE DETECTADO!")
            print("  Por favor, resuélvelo manualmente en la ventana del navegador abierta.")
            print("  El script emitirá beeps periódicos y esperará a que se resuelva...")
            print("!" * 80 + "\n")
            first_alert = False
            
        try:
            import winsound
            winsound.Beep(1200, 250)
            winsound.Beep(1500, 150)
        except Exception:
            pass
            
        sb.sleep(4.0)

# ── cookies y headers de SeleniumBase ───────────────────────────────────────

def get_browser_cookies_and_headers(sb):
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
            pass
            
    try:
        ua = sb.execute_script("return navigator.userAgent;")
    except Exception:
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    
    headers = {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
        "Referer": "https://www.vivanuncios.com.mx/",
        "Connection": "keep-alive",
    }
    return cookie_dict, headers

# ── extractor de detalles ───────────────────────────────────────────────────

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

def parse_detail(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    
    # 1. Encontrar el script de DataLayer (Script 8/precioVenta/barrio/etc.)
    precio_valor = 0.0
    precio_moneda = "MXN"
    tipo_propiedad = "Casa"
    tipo_operacion = "Venta"
    colonia = None
    municipio = None
    estado = "Veracruz"
    
    lat = None
    lng = None
    
    features = {}
    
    for sc in soup.find_all("script"):
        text = sc.string or ""
        
        # Coordenadas Base64 (mapLatOf y mapLngOf)
        if "maplatof" in text.lower():
            lat_match = re.search(r"const\s+mapLatOf\s*=\s*[\"']([^\"']+)[\"']", text)
            lng_match = re.search(r"const\s+mapLngOf\s*=\s*[\"']([^\"']+)[\"']", text)
            if lat_match:
                lat = decode_b64(lat_match.group(1))
            if lng_match:
                lng = decode_b64(lng_match.group(1))
                
    if lat is None or lng is None:
        flat, flng = parse_coordinates_fallback(html, soup)
        if flat and flng:
            lat, lng = flat, flng
            
    for sc in soup.find_all("script"):
        text = sc.string or ""
        if "precioventa" in text.lower():
            # Precio
            price_match = re.search(r"['\"]precioVenta['\"]\s*:\s*['\"]([^'\"]+)['\"]", text)
            if price_match:
                val = price_match.group(1).strip()
                precio_moneda = "USD" if "USD" in val or "US$" in val else "MXN"
                try:
                    precio_valor = float(re.search(r"\d+", val.replace(",", "")).group())
                except Exception:
                    pass
            
            # Tipo de propiedad y operación
            prop_match = re.search(r"['\"]tipoDePropiedad['\"]\s*:\s*['\"]([^'\"]+)['\"]", text)
            if prop_match:
                tipo_propiedad = prop_match.group(1).strip()
                
            op_match = re.search(r"['\"]tipoDeOperacion['\"]\s*:\s*['\"]([^'\"]+)['\"]", text)
            if op_match:
                tipo_operacion = op_match.group(1).strip().capitalize()
                
            # Ubicación
            col_match = re.search(r"['\"]barrio['\"]\s*:\s*['\"]([^'\"]+)['\"]", text)
            if col_match:
                colonia = col_match.group(1).strip()
                
            mun_match = re.search(r"['\"]ciudad['\"]\s*:\s*['\"]([^'\"]+)['\"]", text)
            if mun_match:
                municipio = mun_match.group(1).strip()
                
            est_match = re.search(r"['\"]provincia['\"]\s*:\s*['\"]([^'\"]+)['\"]", text)
            if est_match:
                estado = est_match.group(1).strip()
        
        # Atributos físicos (mainFeatures JSON object) — Robust brace-balancing parser
        if "const mainfeatures" in text.lower():
            start_idx = text.find("const mainFeatures =")
            if start_idx != -1:
                brace_start = text.find("{", start_idx)
                if brace_start != -1:
                    counter = 0
                    brace_end = -1
                    for idx in range(brace_start, len(text)):
                        if text[idx] == "{":
                            counter += 1
                        elif text[idx] == "}":
                            counter -= 1
                            if counter == 0:
                                brace_end = idx + 1
                                break
                    if brace_end != -1:
                        try:
                            features = json.loads(text[brace_start:brace_end])
                        except Exception:
                            pass

    # Mapeo de atributos físicos desde mainFeatures
    m2_totales = None
    m2_construidos = None
    recamaras = 0
    banos = 0
    estac = 0
    antiguedad = "N/A"
    
    # CFT100 = lote (m2 totales), CFT101 = cubierto (m2 construidos), CFT3 = baños, CFT7 = estacionamientos, CFT2 = recámaras, CFT5 = antigüedad
    if "CFT100" in features:
        try: m2_totales = float(features["CFT100"].get("value", 0))
        except (ValueError, TypeError): pass
    if "CFT101" in features:
        try: m2_construidos = float(features["CFT101"].get("value", 0))
        except (ValueError, TypeError): pass
    if "CFT3" in features:
        try: banos = int(float(features["CFT3"].get("value", 0)))
        except (ValueError, TypeError): pass
    if "CFT7" in features:
        try: estac = int(float(features["CFT7"].get("value", 0)))
        except (ValueError, TypeError): pass
    if "CFT2" in features:
        try: recamaras = int(float(features["CFT2"].get("value", 0)))
        except (ValueError, TypeError): pass
    if "CFT5" in features:
        antiguedad = features["CFT5"].get("value", "N/A")

    # Fallback de m2_totales
    if m2_totales is None:
        m2_totales = m2_construidos

    # Dirección y descripción desde el DOM
    desc_el = soup.select_one("div#longDescription, div.section-description, #reactDescription div, [class*='description-module'] div, [class*='posting-description-text']")
    descripcion = desc_el.get_text(" ", strip=True)[:800] if desc_el else "Sin descripcion"
    
    title_el = soup.select_one("h1")
    titulo = title_el.get_text(strip=True) if title_el else ""

    # Extraer dirección desde JSON-LD o meta
    direccion = ""
    for sc in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(sc.string or "")
            if isinstance(ld, dict) and ld.get("@type") == "House":
                addr = ld.get("address", {})
                if isinstance(addr, dict):
                    street = addr.get("streetAddress", "")
                    reg = addr.get("addressRegion", "")
                    loc = addr.get("addressLocality", "")
                    direccion = ", ".join([p for p in [street, reg, loc] if p])
        except Exception:
            pass

    if not direccion:
        direccion = f"{colonia or ''}, {municipio or ''}, {estado or ''}".strip(", ")

    # Mantenimiento
    mantenimiento = 0.0
    maint_match = re.search(r"mantenimiento\s*:\s*\$?([\d,]+)", descripcion.lower())
    if maint_match:
        try:
            mantenimiento = float(maint_match.group(1).replace(",", ""))
        except Exception:
            pass

    # Amenidades básicas
    amenidades_list = []
    text_lower = html.lower()
    if any(k in text_lower for k in ["alberca", "piscina", "pool"]):
        amenidades_list.append("Alberca")
    if any(k in text_lower for k in ["seguridad", "vigilancia", "caseta", "24/7"]):
        amenidades_list.append("Seguridad privada")
    if any(k in text_lower for k in ["aire acondicionado", "minisplit"]):
        amenidades_list.append("Aire acondicionado")
    if any(k in text_lower for k in ["cisterna", "tinaco"]):
        amenidades_list.append("Cisterna")
    if "terraza" in text_lower:
        amenidades_list.append("Terraza")
    if "jardin" in text_lower or "jardín" in text_lower:
        amenidades_list.append("Jardin")
    
    amenidades = " | ".join(amenidades_list)

    return {
        "precio":              f"{precio_moneda} {precio_valor:,.0f}" if precio_valor > 0 else "Precio no disponible",
        "precio_valor":        precio_valor,
        "precio_moneda":       precio_moneda,
        "mantenimiento_valor": mantenimiento,
        "caracteristicas":     f"{m2_totales or 0} m² lote | {recamaras} rec. | {banos} banos | {estac} estac.",
        "m2_totales":          m2_totales,
        "m2_construidos":      m2_construidos,
        "recamaras":           recamaras,
        "banos":               banos,
        "estacionamientos":    estac,
        "antiguedad":          antiguedad,
        "direccion":           direccion[:150],
        "ubicacion":           f"{estado or 'Veracruz'}, {municipio or ''}, {colonia or ''}".strip(", "),
        "descripcion":         descripcion,
        "amenidades":          amenidades,
        "lat":                 lat,
        "lng":                 lng,
        "tipo_propiedad":      tipo_propiedad,
        "tipo_operacion":      tipo_operacion,
    }

# ── HTTP paralelo y cookies ──────────────────────────────────────────────────

def fetch_detail_http(url, session=None):
    try:
        time.sleep(random.uniform(0.2, 0.8))
        response = _get_curl_session().get(url, timeout=15)
        if response.status_code == 200:
            html = response.text
            if "cf-challenge-running" in html or "Just a moment" in html or "enable javascript and cookies" in html.lower():
                logger.warning(f"      ⚠ Bloqueo en detalle HTTP: {url}")
                return url, {}
            details = parse_detail(html, url)
            return url, details
        elif response.status_code == 403:
            logger.warning(f"      ⚠ 403 Forbidden: {url}")
            return url, {}
        else:
            logger.warning(f"      ⚠ HTTP {response.status_code}: {url}")
            return url, {}
    except Exception as e:
        logger.error(f"      ❌ Error HTTP en {url}: {e}")
        return url, {}

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
    global _curl_cookies, _curl_headers
    _curl_cookies = cookies
    _curl_headers = headers
    results = {}
    
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = {executor.submit(fetch_detail_http, url, None): url for url in urls}
        for future in as_completed(futures):
            try:
                url, details = future.result()
                results[url] = details
            except Exception as e:
                url = futures[future]
                logger.error(f"      ❌ Error en hilo para {url}: {e}")
                results[url] = {}
    
    return results

# ── URLs del listado ────────────────────────────────────────────────────────

def extract_listing_urls(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    urls = set()

    for a in soup.find_all("a", href=True):
        href = a["href"]
        # Las URLs de detalle en vivanuncios tienen un ID numérico largo al final
        if href.startswith("/a-") and re.search(r"/\d+(?:\?|$)", href):
            clean_href = href.split("?")[0]
            urls.add(BASE + clean_href)

    logger.info(f"   -> {len(urls)} URLs de listado extraídas.")
    return list(urls)

# ── paginación ─────────────────────────────────────────────────────────────

def get_next_page_url(base_url: str, page_num: int) -> str:
    # Vivanuncios requiere AMBOS: page-N/ en la ruta Y pN al final del query
    # Formato: https://www.vivanuncios.com.mx/s-casas-en-venta/veracruz/page-N/v1c1293l1029pN
    # Para página 1 no se necesita page-1/
    
    # Primero limpiar cualquier page-N/ existente
    clean = re.sub(r'/page-\d+/', '/', base_url)
    # Luego limpiar el sufijo pN
    clean = re.sub(r'p\d+$', '', clean)
    
    if page_num == 1:
        return f"{clean}p1"
    
    # Insertar page-N/ antes del último segmento de la ruta
    # Ej: /s-casas-en-venta/veracruz/v1c1293l1029 -> /s-casas-en-venta/veracruz/page-N/v1c1293l1029pN
    parts = clean.rstrip('/').rsplit('/', 1)
    if len(parts) == 2:
        return f"{parts[0]}/page-{page_num}/{parts[1]}p{page_num}"
    return f"{clean}p{page_num}"

# ── exportación ─────────────────────────────────────────────────────────────

def export_data(db, csv_path, excel_path):
    data = db.get_all_as_list()
    if not data:
        return
    import pandas as pd
    df = pd.DataFrame(data)
    try:   df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    except Exception as e: logger.warning(f"CSV error: {e}")
    try:   df.to_excel(excel_path, index=False)
    except Exception as e: logger.warning(f"Excel error: {e}")

# ── recolección rápida de URLs vía HTTP ─────────────────────────────────────

def collect_all_listing_urls_http(base_url: str, max_pages: int = None) -> list:
    """
    Fase 1: Recopilar todas las URLs de listado usando requests (rápido).
    Vivanuncios no requiere JS para devolver los links de listado.
    Detecta páginas duplicadas para detenerse automáticamente.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
    }
    
    all_urls = set()
    page_num = 1
    dup_run = 0

    print("=== FASE 1: Recopilando URLs de listado vía HTTP (rápido) ===")
    
    while True:
        url = get_next_page_url(base_url, page_num)
        print(f"  Página {page_num}: {url} ... ", end="", flush=True)
        
        try:
            r = curl_requests.get(url, headers=headers, impersonate="chrome", timeout=15)
            if r.status_code == 403:
                print(f"⚠ 403 Forbidden — posible bloqueo.")
                break
            if r.status_code != 200:
                print(f"⚠ HTTP {r.status_code}")
                break
                
            page_urls = extract_listing_urls(r.text)
            new_urls = set(page_urls) - all_urls
            
            print(f"{len(page_urls)} listados, {len(new_urls)} nuevos")
            
            if len(new_urls) == 0:
                dup_run += 1
                if dup_run >= 2:
                    print("  [Fin] 2 páginas consecutivas sin listados nuevos.")
                    break
            else:
                dup_run = 0
                all_urls.update(new_urls)
            
            if not page_urls:
                print("  [Fin] Página vacía.")
                break
                
            if max_pages and page_num >= max_pages:
                print(f"  [Límite] {max_pages} páginas alcanzadas.")
                break
                
        except Exception as e:
            logger.warning(f"Error HTTP en página {page_num}: {e}")
            break
        
        page_num += 1
        time.sleep(random.uniform(0.3, 0.8))  # Pausa corta entre páginas
    
    print(f"\n  Total URLs únicas recopiladas: {len(all_urls)}\n")
    return list(all_urls)

# ── scraper principal ───────────────────────────────────────────────────────

def scrape_vivanuncios(base_url: str, prefix: str, max_pages: int = None,
                      min_wait: float = 3, max_wait: float = 6, detail_concurrency: int = 10):
    db  = PropertyDB(f"{prefix}.json")
    csv = f"{prefix}.csv"
    xls = f"{prefix}.xlsx"

    existing = set()
    for item in db.get_all_as_list():
        url = item.get("url")
        if not url:
            continue
        precio_valor = item.get("precio_valor", 0) or 0
        direccion = item.get("direccion", "") or ""
        lat = item.get("lat")
        lng = item.get("lng")
        # Consideramos "existente" si tiene precio y coordenadas (lat/lng) para sanación progresiva
        if precio_valor > 0 and "humano" not in direccion.lower() and "captcha" not in direccion.lower() and lat is not None and lng is not None:
            existing.add(url)

    print(f"\nBD: {len(db.get_all_as_list())} propiedades registradas en total.")
    print(f"Propiedades válidas con coordenadas (omitidas): {len(existing)}")
    print(f"Propiedades incompletas/bloqueadas (serán re-analizadas): {len(db.get_all_as_list()) - len(existing)}")
    print(f"URL: {base_url}\n")

    # ── Fase 1: Recopilar URLs rápido vía HTTP ──
    all_listing_urls = collect_all_listing_urls_http(base_url, max_pages)
    
    # Filtrar las que ya tenemos completas
    urls_needing_details = [u for u in all_listing_urls if u not in existing]
    
    # También incluir las incompletas de la BD para re-análisis
    for item in db.get_all_as_list():
        url = item.get("url")
        if url and url not in existing and url not in urls_needing_details:
            urls_needing_details.append(url)
    
    print(f"URLs totales encontradas: {len(all_listing_urls)}")
    print(f"URLs que necesitan extracción de detalles: {len(urls_needing_details)}")
    print(f"URLs ya completas (omitidas): {len(existing)}")
    
    if not urls_needing_details:
        print("\n[✓] Todas las propiedades ya están completas en la base de datos.")
        export_data(db, csv, xls)
        normalize_and_export(db, prefix)
        return

    # ── Fase 2: Obtener cookies del navegador (una sola vez) ──
    print(f"\n=== FASE 2: Obteniendo cookies del navegador ===")
    cookies = {}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
        "Referer": "https://www.vivanuncios.com.mx/",
        "Connection": "keep-alive",
    }
    
    # Intentar primero sin cookies (muchas páginas de detalle funcionan directamente)
    test_url = urls_needing_details[0]
    try:
        r = requests.get(test_url, headers=headers, timeout=15)
        if r.status_code == 200 and "cf-challenge-running" not in r.text and "Just a moment" not in r.text:
            print("  [✓] Detalles accesibles sin cookies del navegador. Saltando SeleniumBase.")
        else:
            raise Exception("Necesita cookies")
    except Exception:
        print("  -> Abriendo navegador para obtener cookies...")
        try:
            with SB(uc=True, test=True, locale_code="es") as sb:
                sb.uc_open(base_url)
                sb.sleep(random.uniform(3.0, 5.0))
                check_captcha_and_alert(sb)
                cookies, headers = get_browser_cookies_and_headers(sb)
                print(f"  [✓] Cookies obtenidas: {len(cookies)} cookies")
        except Exception as e:
            logger.warning(f"Error obteniendo cookies: {e}. Continuando sin cookies...")

    # ── Fase 3: Extraer detalles en paralelo ──
    new_total = 0
    batch_size = 30  # Procesar en lotes para mostrar progreso
    
    for batch_start in range(0, len(urls_needing_details), batch_size):
        batch = urls_needing_details[batch_start:batch_start + batch_size]
        batch_num = (batch_start // batch_size) + 1
        total_batches = (len(urls_needing_details) + batch_size - 1) // batch_size
        
        print(f"\n=== FASE 3: Lote {batch_num}/{total_batches} — {len(batch)} propiedades ({detail_concurrency} hilos) ===")
        
        detail_results = fetch_all_details_threaded(batch, cookies, headers, detail_concurrency)
        
        success_count = 0
        batch_new = 0
        for url, data in detail_results.items():
            if data:
                success_count += 1
                if db.upsert(url, data, autosave=False):
                    new_total += 1
                    batch_new += 1
                    existing.add(url)
                    print(f"   [OK] {data.get('precio','?'):>15} | {data.get('ubicacion','?')[:40]}")

        # Guardado único por lote (en lugar de uno por cada registro)
        db.save()
        print(f"  Lote {batch_num}: {success_count}/{len(batch)} exitosos, {batch_new} nuevos guardados.")
        # Export CSV/XLSX diferido: cada 5 lotes (el JSON ya quedó a salvo arriba)
        if batch_num % 5 == 0:
            export_data(db, csv, xls)

    # Export final garantizado (cubre lotes no múltiplos de 5)
    export_data(db, csv, xls)

    print(f"\n=== COMPLETADO === Nuevas: {new_total} | Total BD: {len(db.get_all_as_list())}")
    normalize_and_export(db, prefix)

# ── normalización automática ────────────────────────────────────────────────

def _normalize_antiguedad(antiguedad_str):
    if not antiguedad_str or antiguedad_str == "N/A":
        return None
    s = str(antiguedad_str).lower()
    if "estrenar" in s or "nuevo" in s:
        return 0
    match = re.search(r'\d+', s)
    if match:
        return int(match.group())
    return None

def normalize_and_export(db, prefix):
    from datetime import datetime
    os.makedirs(NORMALIZED_DIR, exist_ok=True)
    output_path = os.path.join(NORMALIZED_DIR, f"{prefix}_normalizado.json")

    print(f"\n=== NORMALIZANDO DATOS ===")
    print(f"Destino: {output_path}")

    all_records = db.get_all_as_list()
    normalized = []

    for record in all_records:
        precio_valor = record.get("precio_valor", 0.0) or 0.0
        precio_moneda = record.get("precio_moneda", "MXN")
        if precio_moneda == "MN":
            precio_moneda = "MXN"

        m2_construidos = record.get("m2_construidos")
        m2_totales = record.get("m2_totales") or m2_construidos

        lat = record.get("lat")
        lng = record.get("lng")

        # Estado, municipio y colonia desde ubicación estructurada
        ubicacion_str = record.get("ubicacion", "Veracruz, Veracruz")
        parts = [p.strip() for p in ubicacion_str.split(",")]
        
        estado = "Veracruz"
        municipio = None
        colonia = None
        
        if len(parts) >= 3:
            estado = parts[0]
            municipio = parts[1]
            colonia = parts[2]
        elif len(parts) == 2:
            estado = parts[0]
            municipio = parts[1]
        elif len(parts) == 1:
            municipio = parts[0]

        # Limpiar estado
        if estado and "veracruz" in estado.lower():
            estado = "Veracruz"

        # Precio/m2
        precio_m2 = None
        if precio_valor > 0 and m2_construidos and m2_construidos > 0:
            precio_m2 = round(precio_valor / m2_construidos, 2)

        # Validación para avalúo
        es_valido = False
        if precio_valor >= 150000 and m2_construidos and m2_construidos >= 20:
            if precio_m2 and 2000 <= precio_m2 <= 100000:
                if lat is not None and lng is not None:
                    es_valido = True

        # Modificadores booleanos
        amenidades = record.get("amenidades", "")
        desc = record.get("descripcion", "")
        direccion = record.get("direccion", "")

        tiene_alberca = _has_keyword([amenidades, desc], ["alberca", "piscina", "pool"])
        en_fracc = _has_keyword([desc, ubicacion_str, direccion],
                                ["fraccionamiento", "fracc", "residencial", "cluster", "coto", "privada", "lomas del sol", "lomas de la rioja"])
        tiene_vigilancia = _has_keyword([amenidades, desc],
                                        ["vigilancia", "seguridad", "24/7", "caseta", "acceso controlado", "guardia"])

        antiguedad_anos = _normalize_antiguedad(record.get("antiguedad"))

        tipo_prop = record.get("tipo_propiedad", "Casa")
        if tipo_prop in ("Casa", "Casa en Condominio"):
            tipo_prop = "Casa"
        elif tipo_prop == "Departamento":
            tipo_prop = "Departamento"
        else:
            tipo_prop = "Casa"

        item = {
            "id_propiedad": str(uuid.uuid4()),
            "url_origen": record.get("url", ""),
            "fuente": "Vivanuncios",
            "tipo_propiedad": tipo_prop,
            "tipo_operacion": "Venta",
            "precio_valor": precio_valor,
            "precio_moneda": precio_moneda,
            "m2_construidos": m2_construidos,
            "m2_totales": m2_totales,
            "antiguedad_anos": antiguedad_anos,
            "recamaras": record.get("recamaras"),
            "banos": record.get("banos"),
            "estacionamientos": record.get("estacionamientos"),
            "estado": estado,
            "municipio": municipio,
            "colonia": colonia,
            "codigo_postal": None, # Vivanuncios rara vez lo incluye estructurado
            "latitud": lat,
            "longitud": lng,
            "precio_m2_construccion": precio_m2,
            "es_valido_para_valuacion": es_valido,
            "tiene_alberca": tiene_alberca,
            "en_fraccionamiento_cerrado": en_fracc,
            "tiene_vigilancia": tiene_vigilancia,
        }
        normalized.append(item)

    validos = sum(1 for d in normalized if d["es_valido_para_valuacion"])

    output = {
        "metadata": {
            "generado_en": datetime.now().isoformat(),
            "total_registros": len(normalized),
            "registros_validos_para_valuacion": validos
        },
        "propiedades": normalized
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Total procesados: {len(normalized)}")
    print(f"Válidos para valuación: {validos}")
    print(f"Archivo normalizado: {output_path}")

# ── punto de entrada ────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== SCRAPER VIVANUNCIOS.COM.MX ===")
    print("1. Casas en venta — Veracruz (v1c1293l1029p1)")
    print("2. URL personalizada")

    op = input("Opcion [1]: ").strip() or "1"

    if op == "1":
        target_url = "https://www.vivanuncios.com.mx/s-casas-en-venta/veracruz/v1c1293l1029p1"
        prefix = "vivanuncios_veracruz_casas"
    elif op == "2":
        target_url = input("URL de listado Vivanuncios: ").strip()
        prefix = input("Nombre de archivo (ej: vivanuncios_veracruz): ").strip()
        if not target_url or not prefix:
            print("Datos inválidos."); exit()
    else:
        print("Opción inválida."); exit()

    pags = input("Cuántas páginas? (Enter = TODAS): ").strip()
    max_p = int(pags) if pags.isdigit() else None
    
    conc_input = input("\n¿Concurrencia HTTP para detalles? (Ej: 10) [por defecto 10]: ").strip() or "10"
    concurrency = int(conc_input) if conc_input.isdigit() else 10

    scrape_vivanuncios(target_url, prefix, max_pages=max_p, detail_concurrency=concurrency)
