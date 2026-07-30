"""
scraper_lamudi.py — Lamudi.com.mx — Casas en venta en Veracruz
Produce la misma estructura JSON que inmuebles24_veracruz_casas.json.

Selectores verificados con inspección real del DOM de Lamudi (2026-05-19):
  - Cards:           div.snippet.js-snippet  → a[href^="/detalle/"]
  - Precio:          div.snippet__content__price
  - m²:              span[data-test="area-value"]
  - Recámaras:       span[data-test="bedrooms-value"]
  - Baños:           span[data-test="full-bathrooms-value"]
  - Estacionamiento: span.property__number.car_park
  - Paginación:      a[data-test="pagination-next"]  →  ?page=N
  - URL de detalle:  https://www.lamudi.com.mx/detalle/...  (sin .html)
  - URL correcta:    https://www.lamudi.com.mx/veracruz-llave/casa/for-sale/
"""

import json, re, random, logging, sys, os, uuid
import time

# Forzar UTF-8 en stdout/stderr para evitar UnicodeEncodeError en consolas Windows (cp1252)
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass
import threading
import requests
from curl_cffi import requests as curl_requests  # impersona el fingerprint TLS de Chrome (vence Cloudflare pasivo)
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
from bs4 import BeautifulSoup
from seleniumbase import SB

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'playwright_inmuebles24'))
from json_db import PropertyDB

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BASE = "https://www.lamudi.com.mx"
NORMALIZED_DIR = os.path.join(os.path.dirname(__file__), '..', 'valuador_normalizado')

# Firmas de bloqueo/captcha de Cloudflare/Lamudi (compartidas por listado y detalle)
BLOCK_SIGNATURES = [
    "cf-challenge-running", "just a moment", "enable javascript and cookies",
    "security verification", "solve this math problem", "challenge-platform",
    "verify you are human", "cf_chl", "attention required",
]

def _looks_blocked(html: str, status_code: int = 200) -> bool:
    if status_code != 200:
        return True
    low = html.lower()
    return any(sig in low for sig in BLOCK_SIGNATURES)

# Sesión curl_cffi por-hilo (el handle de curl NO es seguro de compartir entre hilos)
_curl_tls = threading.local()

def _get_curl_session():
    s = getattr(_curl_tls, "session", None)
    if s is None:
        s = curl_requests.Session(impersonate="chrome")
        _curl_tls.session = s
    return s

# ── helpers ────────────────────────────────────────────────────────────────

def _num(text: str) -> float:
    if not text:
        return 0.0
    m = re.search(r"[\d,]+(?:\.\d+)?", text.replace("\xa0", "").replace(",", ""))
    return float(m.group().replace(",", "")) if m else 0.0

def _int(text: str) -> int:
    return int(_num(text))

# ── JSON-LD geo + datos estructurados ──────────────────────────────────────

def parse_jsonld_all(soup: BeautifulSoup) -> dict:
    """Extrae lat, lng, m2_terreno, m2_construidos y antigüedad del JSON-LD schema.org."""
    result = {"lat": None, "lng": None, "m2_terreno_ld": None, "m2_construidos_ld": None, "antiguedad_ld": None}
    for sc in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(sc.string or "")
            if isinstance(ld, dict) and "@graph" in ld:
                items = ld["@graph"]
            else:
                items = ld if isinstance(ld, list) else [ld]
            for item in items:
                # Geo coordinates
                geo = item.get("geo", {})
                if geo:
                    lat = geo.get("latitude") or geo.get("lat")
                    lng = geo.get("longitude") or geo.get("lng") or geo.get("lon")
                    if lat and lng:
                        try:
                            result["lat"] = float(lat)
                            result["lng"] = float(lng)
                        except (ValueError, TypeError):
                            pass
                # Floor size (m2 construidos)
                floor = item.get("floorSize", {})
                if isinstance(floor, dict):
                    v = floor.get("value")
                    if v:
                        try: result["m2_construidos_ld"] = float(v)
                        except (ValueError, TypeError): pass
                elif floor:
                    try: result["m2_construidos_ld"] = float(floor)
                    except (ValueError, TypeError): pass
                # Lot size (m2 terreno)
                lot = item.get("lotSize", {})
                if isinstance(lot, dict):
                    v = lot.get("value")
                    if v:
                        try: result["m2_terreno_ld"] = float(v)
                        except (ValueError, TypeError): pass
                elif lot:
                    try: result["m2_terreno_ld"] = float(lot)
                    except (ValueError, TypeError): pass
                # Year built -> antigüedad
                year_built = item.get("yearBuilt")
                if year_built:
                    try:
                        from datetime import datetime
                        result["antiguedad_ld"] = datetime.now().year - int(year_built)
                    except (ValueError, TypeError):
                        pass
        except Exception:
            pass
    return result

def parse_ad_location(soup: BeautifulSoup) -> dict:
    """Extrae lat, lng y código postal desde la variable adLocationData en los scripts del detalle."""
    result = {"lat": None, "lng": None, "codigo_postal": None}
    for sc in soup.find_all("script"):
        text = sc.string or ""
        if "adlocationdata" in text.lower():
            # Extraer latitud y longitud
            lat_match = re.search(r"latitude\s*:\s*[\"']?(-?\d+\.\d+)[\"']?", text)
            lng_match = re.search(r"longitude\s*:\s*[\"']?(-?\d+\.\d+)[\"']?", text)
            if lat_match:
                try: result["lat"] = float(lat_match.group(1))
                except Exception: pass
            if lng_match:
                try: result["lng"] = float(lng_match.group(1))
                except Exception: pass
            
            # Extraer dirección y código postal si existe en el address
            address_match = re.search(r"address\s*:\s*[\"`']?([^\"`'\r\n]+)[\"`']?", text)
            if address_match:
                addr = address_match.group(1).strip()
                pc_match = re.search(r"\b\d{5}\b", addr)
                if pc_match:
                    result["codigo_postal"] = pc_match.group(0)
            
            # También intentar postcode directo
            postcode_match = re.search(r"postcode\s*:\s*[\"`']?(\d{5})[\"`']?", text)
            if postcode_match:
                result["codigo_postal"] = postcode_match.group(1)
                
            break
    return result

# ── precio ─────────────────────────────────────────────────────────────────

def parse_price(soup: BeautifulSoup) -> tuple:
    moneda, valor = "MN", 0.0

    # 1. JSON-LD
    for sc in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(sc.string or "")
            items = ld if isinstance(ld, list) else [ld]
            for item in items:
                off = item.get("offers", {})
                if isinstance(off, list): off = off[0] if off else {}
                p = float(off.get("price", 0) or 0)
                if p > 0:
                    moneda = "USD" if off.get("priceCurrency") == "USD" else "MN"
                    return p, moneda
        except Exception:
            pass

    # 2. Selector verificado
    el = (soup.select_one("div.snippet__content__price") or
          soup.select_one("[class*='price']"))
    if el:
        raw = el.get_text(" ", strip=True)
        if "USD" in raw or "US$" in raw:
            moneda = "USD"
        v = _num(raw)
        if v > 0:
            valor = v

    return valor, moneda

# ── atributos físicos ──────────────────────────────────────────────────────

def parse_attributes(soup: BeautifulSoup) -> dict:
    def _get(selector):
        el = soup.select_one(selector)
        return el.get_text(strip=True) if el else ""

    # Selectores por data-test, TAG-AGNÓSTICOS: Lamudi alterna <span>/<div> entre
    # versiones (en 2026-06 area-value pasó a <div>, rompiendo 'span[data-test=...]').
    m2_const_raw = _get('[data-test="area-value"]')        # superficie CONSTRUIDA
    m2_terr_raw  = _get('[data-test="plot-area-value"]')   # superficie de TERRENO
    recs_raw     = _get('[data-test="bedrooms-value"]')
    ban_raw      = _get('[data-test="full-bathrooms-value"]')
    est_raw      = _get('[data-test="parking-spaces-value"]')

    m2_const = _num(m2_const_raw)
    m2_terr  = _num(m2_terr_raw)
    recs = _int(recs_raw)
    banos = _int(ban_raw)
    estac = _int(est_raw)

    # Fallback: tabla de especificaciones (label | value) por si cambian los data-test
    for row in soup.select('[class*="features-component__row"], [class*="features-component__item"]'):
        cells = [c.strip() for c in row.get_text("|", strip=True).split("|") if c.strip()]
        if len(cells) < 2:
            continue
        label, value = cells[0].lower(), cells[-1]
        if not m2_terr and ("terreno" in label):
            m2_terr = _num(value)
        elif not m2_const and ("construido" in label or "construcción" in label or "construccion" in label) and "año" not in label and "fecha" not in label and "antiguedad" not in label and "antigüedad" not in label and "construido en" not in label:
            m2_const = _num(value)
        elif not estac and "estacionamiento" in label:
            estac = _int(value)

    # Antigüedad y mantenimiento — tablas de detalle (Lamudi no siempre las publica)
    antiguedad = "N/A"
    mantenimiento = 0.0
    for row in soup.select("ul.listing-features li, [class*='KeyInfo'] li, [class*='attribute'] li, [class*='features-component__row']"):
        txt = row.get_text(" ", strip=True).lower()
        if any(k in txt for k in ["antigüedad", "antiguedad", "año const"]):
            v = re.search(r"\d+", txt)
            antiguedad = f"{v.group()} años" if v else txt
        elif "mantenimiento" in txt or "cuota" in txt:
            mantenimiento = _num(txt)

    return {
        "m2_totales":       m2_terr if m2_terr > 0 else None,   # terreno
        "m2_construidos":   m2_const if m2_const > 0 else None, # construcción
        "recamaras":        recs,
        "banos":            banos,
        "estacionamientos": estac,
        "antiguedad":       antiguedad,
        "mantenimiento_valor": mantenimiento,
    }

# ── ubicación ──────────────────────────────────────────────────────────────

def parse_location(soup: BeautifulSoup) -> tuple:
    # Breadcrumbs: Lamudi usa ol.breadcrumb o similar
    crumbs = [a.get_text(strip=True) for a in soup.select("ol.breadcrumb li a, [class*='breadcrumb'] a")]
    crumbs = [c for c in crumbs if c.lower() not in ("inicio", "lamudi", "home")]
    ubicacion = ", ".join(crumbs[-3:]) if crumbs else "Veracruz, Veracruz"

    addr_el = (soup.select_one("address") or
               soup.select_one("[itemprop='streetAddress']") or
               soup.select_one("[class*='location']"))
    direccion = addr_el.get_text(strip=True)[:150] if addr_el else ""

    if not direccion:
        h1 = soup.select_one("h1")
        direccion = h1.get_text(strip=True)[:120] if h1 else ""

    return direccion, ubicacion

# ── amenidades ─────────────────────────────────────────────────────────────

_AMEN = {
    "alberca": "Alberca", "piscina": "Alberca",
    "seguridad privada": "Seguridad privada", "vigilancia": "Seguridad privada",
    "24/7": "Seguridad privada", "caseta": "Seguridad privada",
    "aire acondicionado": "Aire acondicionado", "minisplit": "Aire acondicionado",
    "cisterna": "Cisterna", "tinaco": "Cisterna",
    "terraza": "Terraza", "roof": "Terraza",
    "jardin": "Jardin", "jardín": "Jardin", "area verde": "Jardin",
    "gimnasio": "Gimnasio", "gym": "Gimnasio",
    "circuito cerrado": "Circuito Cerrado", "camaras": "Circuito Cerrado",
    "paneles solares": "Paneles solares",
    "jacuzzi": "Jacuzzi",
}

def parse_amenidades(soup: BeautifulSoup) -> str:
    txt = soup.get_text(" ").lower()
    found = {label for kw, label in _AMEN.items() if kw in txt}
    return " | ".join(sorted(found))

def check_captcha_and_alert(sb):
    """
    Detecta si hay un captcha, desafío de seguridad de Cloudflare o bloqueos de acceso,
    hace sonar una alarma repetida (Windows winsound.Beep) y pausa el scraper de forma segura.
    Una vez resuelto manualmente por el usuario, el scraper se reanuda de forma automática.
    """
    captcha_selectors = [
        "iframe[src*='recaptcha']",
        "iframe[src*='hcaptcha']",
        "iframe[src*='turnstile']",
        "div#cf-turnstile-iframe",
        "div.g-recaptcha",
        "div#hcaptcha",
        "div#challenge-stage",
    ]
    title_keywords = ["just a moment", "security check", "verify you are human", "attention required", "captcha", "security verification"]
    
    first_alert = True
    while True:
        is_blocked = False
        
        # 1. Comprobar título de la página
        try:
            title = sb.get_title().lower()
            if any(k in title for k in title_keywords):
                is_blocked = True
        except Exception:
            pass
            
        # 2. Comprobar selectores/iframes de Captchas
        if not is_blocked:
            for selector in captcha_selectors:
                try:
                    if sb.is_element_visible(selector, timeout=0.1):
                        is_blocked = True
                        break
                except Exception:
                    pass
                    
        # 3. Comprobar palabras de seguridad en el cuerpo HTML
        if not is_blocked:
            try:
                html = sb.get_page_source().lower()
                if "enable javascript and cookies" in html or ("cloudflare" in html and "challenge" in html) or "security verification" in html or "solve this math problem" in html:
                    is_blocked = True
            except Exception:
                pass
                
        # 4. Intentar auto-resolver captcha matemático (versión MEJORADA)
        if is_blocked:
            try:
                html = sb.get_page_source()
                html_lower = html.lower()
                if "solve this math problem" in html_lower or "security verification" in html_lower:
                    # DEBUG: guardar estado de captcha
                    try:
                        with open("../captcha_debug.html", "w", encoding="utf-8") as f:
                            f.write(html)
                        text = sb.get_text("body")
                        with open("../captcha_debug.txt", "w", encoding="utf-8") as f:
                            f.write(text)
                    except Exception as dbg_err:
                        logger.debug(f"Debug save error: {dbg_err}")

                    # Leer la pregunta - múltiples estrategias
                    question_text = ""
                    try:
                        question_text = sb.get_text("#math-question") or ""
                    except Exception:
                        pass

                    if not question_text:
                        try:
                            question_text = sb.execute_script("return (document.getElementById('math-question') || {}).textContent || ''") or ""
                        except Exception:
                            pass

                    # Esperar a que el input esté disponible (no solo visible)
                    input_found = False
                    for attempt in range(5):
                        try:
                            sb.wait_for_element("#math-answer", timeout=2)
                            input_found = True
                            break
                        except Exception:
                            sb.sleep(0.5)

                    if input_found:
                        print("   [Auto-Solve] Captcha matemático detectado, resolviendo...")

                        # Parsear la pregunta con manejo robusto de caracteres
                        ans = None
                        if question_text:
                            q = question_text.strip()
                            # Normalizar caracteres especiales primero
                            q_normalized = q.replace('−', '-').replace('–', '-').replace('×', '*').replace('x', '*').replace('X', '*')
                            # Buscar patrón: "número operador número"
                            m = re.search(r"(\d+)\s*([\+\-\*])\s*(\d+)", q_normalized)
                            if m:
                                n1, op, n2 = int(m.group(1)), m.group(2), int(m.group(3))
                                if op == '+':
                                    ans = n1 + n2
                                elif op == '-':
                                    ans = n1 - n2
                                elif op == '*':
                                    ans = n1 * n2
                                print(f"   [Auto-Solve] Pregunta: '{q}' -> Parseado: {n1} {op} {n2} = {ans}")

                        # Fallback: regex sobre HTML si no se pudo leer del DOM
                        if ans is None:
                            m = re.search(r"(\d+)\s*([\+\-\*×x])\s*(\d+)", html_lower)
                            if m:
                                n1_str, op_str, n2_str = m.group(1), m.group(2), m.group(3)
                                n1, n2 = int(n1_str), int(n2_str)
                                op = '+' if op_str in ['+'] else ('-' if op_str in ['-'] else '*')
                                ans = n1 + n2 if op == '+' else (n1 - n2 if op == '-' else n1 * n2)
                                print(f"   [Auto-Solve] Fallback HTML: {n1} {op} {n2} = {ans}")

                        if ans is not None:
                            # Escribir respuesta por JS (evita anti-paste)
                            try:
                                sb.execute_script(f"document.getElementById('math-answer').value = {ans};")
                                sb.execute_script("document.getElementById('math-answer').dispatchEvent(new Event('input', {bubbles: true}));")
                                sb.execute_script("document.getElementById('math-answer').dispatchEvent(new Event('change', {bubbles: true}));")
                                print(f"   [Auto-Solve] Respuesta escrita: {ans}")
                            except Exception as write_err:
                                print(f"   [Auto-Solve] Error escribiendo respuesta: {write_err}")
                                continue

                            # Espera humanizada
                            sb.sleep(random.uniform(0.8, 1.2))

                            # Enviar respuesta
                            print("   [Auto-Solve] Enviando respuesta...")
                            try:
                                sb.execute_script("if (typeof verifyChallenge === 'function') { verifyChallenge(); }")
                            except Exception as js_err:
                                logger.debug(f"verifyChallenge JS error: {js_err}")
                                try:
                                    sb.click("#verify-btn", timeout=2)
                                except Exception:
                                    try:
                                        sb.press_keys("#math-answer", "Return")
                                    except Exception:
                                        pass

                            # Esperar a confirmación (20 ciclos x 0.5s = 10 seg total)
                            verified = False
                            for wait_i in range(20):
                                sb.sleep(0.5)
                                try:
                                    current_url = sb.get_current_url()
                                    page_html = sb.get_page_source().lower()

                                    # Señales de éxito
                                    if "verify-custom-captcha" in current_url or current_url != sb.get_current_url():
                                        print("   [Auto-Solve] ✓ URL cambió - captcha resuelto.")
                                        verified = True
                                        break
                                    elif "verification successful" in page_html or "success" in page_html:
                                        print("   [Auto-Solve] ✓ Mensaje de éxito detectado.")
                                        verified = True
                                        break
                                    elif "solve this math problem" not in page_html and "security verification" not in page_html:
                                        print("   [Auto-Solve] ✓ Captcha ya no presente - resuelto.")
                                        verified = True
                                        break
                                except Exception:
                                    pass

                            if verified:
                                sb.sleep(2.0)
                                print("   [Auto-Solve] Reanudando después de captcha resuelto...")
                                continue
                            else:
                                print("   [Auto-Solve] Captcha aún presente, reintentando...")
                                continue
                        else:
                            print("   [Auto-Solve] No se pudo parsear la operación matemática. Pidiendo ayuda manual...")
                    else:
                        print("   [Auto-Solve] Input #math-answer no encontrado. Refrescando...")
                        sb.refresh()
                        sb.sleep(3.0)
                        continue
            except Exception as e:
                logger.error(f"[Auto-Solve] Excepción general: {e}")
                import traceback
                traceback.print_exc()
                
        if not is_blocked:
            if not first_alert:
                print("   [✓] ¡Desafío resuelto! Reanudando extracción automáticamente...")
            break
            
        if first_alert:
            logger.warning("[¡ALERTA!] Bloqueo o desafío de seguridad/captcha detectado.")
            print("\n" + "!" * 80)
            print("  ¡CAPTCHA O DESAFÍO CLOUDFLARE DETECTADO!")
            print("  Por favor, resuélvelo manualmente en la ventana del navegador abierta.")
            print("  El script emitirá beeps periódicos y esperará a que se resuelva...")
            print("!" * 80 + "\n")
            first_alert = False
            
        # Alarma sonora nativa en Windows
        try:
            import winsound
            # Dos tonos rápidos para llamar la atención del usuario
            winsound.Beep(1200, 250)
            winsound.Beep(1500, 150)
        except Exception:
            pass
            
        sb.sleep(4.0)

# ── HTTP paralelo y cookies ──────────────────────────────────────────────────

def get_browser_cookies_and_headers(sb):
    """Extrae cookies y headers del navegador SeleniumBase para requests HTTP."""
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
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    
    headers = {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.lamudi.com.mx/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    return cookie_dict, headers


def fetch_detail_http(url, cookies=None, headers=None):
    """
    Descarga el detalle vía curl_cffi impersonando Chrome (vence el Cloudflare pasivo
    de Lamudi reutilizando cookies y headers del navegador).
    """
    try:
        time.sleep(random.uniform(0.2, 0.6))
        response = _get_curl_session().get(url, cookies=cookies, headers=headers, timeout=20)
        if response.status_code == 200:
            # Lamudi declara ISO-8859-1 en headers pero el contenido es UTF-8 → forzar
            # UTF-8 evita el mojibake ("LocalizaciÃ³n", "RÃ­o") en dirección/ubicación.
            response.encoding = "utf-8"
            html = response.text
            if _looks_blocked(html):
                logger.warning(f"      ⚠ Bloqueo/captcha en detalle HTTP: {url}")
                return url, {}
            details = parse_detail(html, url)
            # Rechazar datos parseados de páginas incompletas (sin precio = basura)
            if details.get("precio_valor", 0) <= 0:
                logger.warning(f"      ⚠ Precio no encontrado (posible bloqueo silencioso): {url}")
                return url, {}
            return url, details
        elif response.status_code == 403:
            logger.warning(f"      ⚠ 403 Forbidden: {url}")
            return url, {}
        elif response.status_code == 410:
            return url, {}  # anuncio expirado/eliminado (no es bloqueo)
        else:
            logger.warning(f"      ⚠ HTTP {response.status_code}: {url}")
            return url, {}
    except Exception as e:
        logger.error(f"      ❌ Error HTTP en {url}: {e}")
        return url, {}


def fetch_all_details_threaded(urls, cookies=None, headers=None, concurrency=10):
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

# ── detalle ────────────────────────────────────────────────────────────────

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
    precio_valor, precio_moneda = parse_price(soup)
    attrs = parse_attributes(soup)
    jsonld = parse_jsonld_all(soup)
    ad_loc = parse_ad_location(soup)

    recs  = attrs["recamaras"]
    banos = attrs["banos"]
    estac = attrs["estacionamientos"]
    # Priorizar JSON-LD sobre selectores DOM para m2
    m2c   = jsonld["m2_construidos_ld"] if jsonld["m2_construidos_ld"] is not None else attrs["m2_construidos"]
    m2t   = jsonld["m2_terreno_ld"] if jsonld["m2_terreno_ld"] is not None else (attrs["m2_totales"] if attrs["m2_totales"] is not None else m2c)

    caract = []
    if m2t:  caract.append(f"{m2t:,.0f} m² lote")
    if recs: caract.append(f"{recs} rec.")
    if banos == 1: caract.append("1 bano")
    elif banos > 1: caract.append(f"{banos} banos")
    if estac: caract.append(f"{estac} estac.")
    caracteristicas = " | ".join(caract) if caract else "Sin caracteristicas"

    direccion, ubicacion = parse_location(soup)

    # Antigüedad: priorizar JSON-LD yearBuilt
    antiguedad = attrs["antiguedad"]
    if jsonld["antiguedad_ld"] is not None:
        antiguedad = f"{jsonld['antiguedad_ld']} años"

    # Selector de descripción: buscar div/section de descripción de manera más genérica
    desc_el = (soup.select_one("[class*='description-content']") or
               soup.select_one("div[class*='description']") or
               soup.select_one("[class*='description'] p") or
               soup.select_one("[itemprop='description']") or
               soup.select_one("div.listing-description") or
               soup.select_one("[class*='Description']"))
    descripcion = desc_el.get_text(" ", strip=True)[:800] if desc_el else "Sin descripcion"

    lat = ad_loc["lat"] or jsonld["lat"]
    lng = ad_loc["lng"] or jsonld["lng"]
    if lat is None or lng is None:
        flat, flng = parse_coordinates_fallback(html, soup)
        if flat and flng:
            lat = flat
            lng = flng

    codigo_postal = ad_loc["codigo_postal"]

    return {
        "precio":              f"{precio_moneda} {precio_valor:,.0f}" if precio_valor > 0 else "Precio no disponible",
        "precio_valor":        precio_valor,
        "precio_moneda":       precio_moneda,
        "mantenimiento_valor": attrs["mantenimiento_valor"],
        "caracteristicas":     caracteristicas,
        "m2_totales":          m2t,
        "m2_construidos":      m2c,
        "recamaras":           recs,
        "banos":               banos,
        "estacionamientos":    estac,
        "antiguedad":          antiguedad,
        "direccion":           direccion,
        "ubicacion":           ubicacion,
        "descripcion":         descripcion,
        "amenidades":          parse_amenidades(soup),
        "lat":                 lat,
        "lng":                 lng,
        "codigo_postal":       codigo_postal,
    }

# ── URLs del listado ────────────────────────────────────────────────────────

def extract_listing_urls(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    urls = set()

    # Selector principal verificado: cards con href a /detalle/
    for a in soup.select("div.snippet a[href^='/detalle/'], div.js-snippet a[href^='/detalle/']"):
        href = a.get("href", "")
        if href:
            urls.add(BASE + href.split("?")[0])

    # Fallback: cualquier <a> que apunte a /detalle/
    if not urls:
        for a in soup.find_all("a", href=re.compile(r"^/detalle/")):
            urls.add(BASE + a["href"].split("?")[0])

    # Fallback 2: URLs absolutas de lamudi con /detalle/
    if not urls:
        for a in soup.find_all("a", href=re.compile(r"lamudi\.com\.mx/detalle/")):
            urls.add(a["href"].split("?")[0])

    logger.info(f"   -> {len(urls)} URLs extraidas")
    return list(urls)

# ── paginación ─────────────────────────────────────────────────────────────

def get_next_page_url(soup: BeautifulSoup, current_url: str, page_num: int) -> str | None:
    # Botón "Siguiente" verificado: data-test="pagination-next"
    btn = (soup.select_one('a[data-test="pagination-next"]') or
           soup.select_one("a.pagination__link.arrow.enabled") or
           soup.select_one("a[rel='next']"))
    if btn and btn.get("href"):
        href = btn["href"]
        return BASE + href if href.startswith("/") else href

    # Construcción manual ?page=N
    base = re.sub(r"[?&]page=\d+", "", current_url).rstrip("?&")
    sep = "&" if "?" in base else "?"
    return f"{base}{sep}page={page_num}"

# ── exportación ─────────────────────────────────────────────────────────────

def export_data(db, csv_path, excel_path):
    data = db.get_all_as_list()
    if not data:
        return
    df = pd.DataFrame(data)
    try:   df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    except Exception as e: logger.warning(f"CSV error: {e}")
    try:   df.to_excel(excel_path, index=False)
    except Exception as e: logger.warning(f"Excel error: {e}")

# ── navegador lazy + listado por curl_cffi ───────────────────────────────────

class _LazyBrowser:
    """Abre SeleniumBase UC SOLO cuando se necesita (fallback anti-captcha).
    El listado de Lamudi hoy se baja por curl_cffi; el navegador es la red de
    seguridad por si Cloudflare escalara a un challenge activo desde otra IP."""
    def __init__(self):
        self._cm = None
        self.sb = None

    def get(self):
        if self.sb is None:
            logger.info("   -> 🌐 Abriendo navegador (fallback anti-captcha de Cloudflare)...")
            self._cm = SB(uc=True, test=True, locale_code="es")
            self.sb = self._cm.__enter__()
        return self.sb

    def close(self):
        if self._cm is not None:
            try:
                self._cm.__exit__(None, None, None)
            except Exception:
                pass
        self._cm = None
        self.sb = None


def _scroll_listings(sb):
    """Scroll para forzar el lazy-load de tarjetas en el DOM del navegador (solo fallback)."""
    last_card_count = 0
    for _ in range(6):
        sb.scroll_to_bottom()
        sb.sleep(random.uniform(1.5, 2.5))
        soup = BeautifulSoup(sb.get_page_source(), "html.parser")
        count = len(soup.select("div.snippet, div.js-snippet, a[href^='/detalle/']"))
        if count == last_card_count:
            sb.execute_script("window.scrollBy(0, -400);")
            sb.sleep(0.5)
            sb.scroll_to_bottom()
            sb.sleep(2.0)
            soup = BeautifulSoup(sb.get_page_source(), "html.parser")
            count = len(soup.select("div.snippet, div.js-snippet, a[href^='/detalle/']"))
            if count == last_card_count:
                break
        last_card_count = count


def fetch_listing_html(url, browser):
    """
    Devuelve (html, via). Intenta el listado por curl_cffi (rápido, sin navegador);
    si Cloudflare bloquea o no aparecen fichas, cae al navegador (lazy) con scroll.
    via ∈ {'curl_cffi', 'navegador', None}.
    """
    # 1) Vía rápida: curl_cffi impersonando Chrome (el HTML server-side ya trae las 30 fichas)
    try:
        r = _get_curl_session().get(url, timeout=25)
        r.encoding = "utf-8"
        html = r.text
        if not _looks_blocked(html, r.status_code) and extract_listing_urls(html):
            return html, "curl_cffi"
        logger.info(f"   -> curl_cffi no usable (status={r.status_code}); recurriendo al navegador...")
    except Exception as e:
        logger.warning(f"   -> curl_cffi listado falló ({e}); recurriendo al navegador...")

    # 2) Fallback: navegador con scroll
    try:
        sb = browser.get()
        sb.uc_open(url)
        sb.sleep(random.uniform(4.0, 6.0))
        check_captcha_and_alert(sb)
        _scroll_listings(sb)
        return sb.get_page_source(), "navegador"
    except Exception as e:
        logger.warning(f"   -> Error en navegador para {url}: {e}")
        return None, None


# ── scraper principal ───────────────────────────────────────────────────────

def scrape_lamudi(base_url: str, prefix: str, max_pages: int = None,
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
        m2_const = item.get("m2_construidos")
        # "Existente/completa" = precio + coords + SIN bloqueo + m² construidos.
        # Exigir m² evita el deadlock: antes un registro con precio/coords pero SIN m²
        # se marcaba completo y nunca se re-escarbaba, quedando inválido para el valuador.
        if (precio_valor > 0 and "humano" not in direccion.lower()
                and "captcha" not in direccion.lower()
                and lat is not None and lng is not None
                and m2_const):
            existing.add(url)

    print(f"\nBD: {len(db.get_all_as_list())} propiedades registradas en total.")
    print(f"Propiedades válidas (serán omitidas): {len(existing)}")
    print(f"Propiedades incompletas/bloqueadas (serán re-escarbadas y corregidas): {len(db.get_all_as_list()) - len(existing)}")
    print(f"URL: {base_url}\n")

    new_total = 0
    page_num  = 1
    current   = base_url
    empty_run = 0

    browser = _LazyBrowser()
    try:
        while True:
            print(f"\n=== Pagina {page_num}: {current} ===")
            
            # Obtener listado de forma inteligente (curl_cffi con fallback a browser)
            html, via = fetch_listing_html(current, browser)
            if not html:
                print("   ❌ No se pudo obtener el listado. Saliendo.")
                break
                
            if via == "curl_cffi":
                print("   -> Listado obtenido vía curl_cffi (rápido, sin navegador).")
            else:
                print("   -> Listado obtenido vía navegador con scroll.")

            soup = BeautifulSoup(html, "html.parser")
            urls = extract_listing_urls(html)

            if not urls:
                empty_run += 1
                print(f"[Aviso] Sin fichas (intento {empty_run}/3)")
                if empty_run >= 3:
                    print("[Fin] Tres paginas vacias consecutivas.")
                    break
                page_num += 1
                current = get_next_page_url(soup, current, page_num)
                if browser.sb is not None:
                    browser.sb.sleep(random.uniform(min_wait, max_wait))
                else:
                    time.sleep(random.uniform(min_wait, max_wait))
                continue

            empty_run = 0
            page_new  = 0
            
            # Refrescar cookies si el navegador está levantado
            cookies = {}
            headers = {}
            if browser.sb is not None:
                cookies, headers = get_browser_cookies_and_headers(browser.sb)
            
            urls_needing_details = []
            for url in urls:
                if url not in existing:
                    urls_needing_details.append(url)
                    
            if urls_needing_details:
                print(f"   -> Extrayendo detalles de {len(urls_needing_details)} propiedades vía HTTP ({detail_concurrency} hilos)...")
                detail_results = fetch_all_details_threaded(urls_needing_details, cookies, headers, detail_concurrency)
                
                success_count = len([d for d in detail_results.values() if d])
                print(f"   -> Detalles extraídos: {success_count}/{len(urls_needing_details)}")
                
                # Reintentar fallidos con cookies frescas: si falló más de la mitad, levantar navegador
                failed_urls = [u for u, d in detail_results.items() if not d]
                if failed_urls and (success_count < len(urls_needing_details) * 0.5 or browser.sb is None):
                    print(f"   -> ⚠ Reintentando {len(failed_urls)} detalles fallidos con cookies frescas...")
                    sb = browser.get()
                    sb.uc_open(current)
                    sb.sleep(4.0)
                    check_captcha_and_alert(sb)
                    cookies, headers = get_browser_cookies_and_headers(sb)
                    retry_results = fetch_all_details_threaded(failed_urls, cookies, headers, 5)
                    detail_results.update(retry_results)
                    failed_urls = [u for u, d in detail_results.items() if not d]
                
                # FALLBACK: Si HTTP sigue fallando (captcha de Lamudi), usar el navegador directamente
                if failed_urls and len(failed_urls) > len(urls_needing_details) * 0.5:
                    print(f"   -> 🌐 HTTP bloqueado por captcha. Usando navegador para {len(failed_urls)} URLs restantes...")
                    sb = browser.get()
                    for i, fail_url in enumerate(failed_urls):
                        try:
                            sb.open(fail_url)
                            sb.sleep(random.uniform(1.0, 2.0))
                            check_captcha_and_alert(sb)
                            detail_html = sb.get_page_source()
                            detail_data = parse_detail(detail_html, fail_url)
                            if detail_data.get("precio_valor", 0) > 0:
                                detail_results[fail_url] = detail_data
                                print(f"      [🌐 {i+1}/{len(failed_urls)}] {detail_data.get('precio')} | {detail_data.get('ubicacion','')[:40]}")
                            else:
                                print(f"      [⚠ {i+1}/{len(failed_urls)}] Sin precio aún después del navegador: {fail_url}")
                        except Exception as e:
                            logger.warning(f"      ❌ Error navegador en {fail_url}: {e}")
                        
                for url, data in detail_results.items():
                    if data:
                        if db.upsert(url, data, autosave=False):
                            new_total += 1
                            page_new  += 1
                            existing.add(url)
                            print(f"      [OK] {url} - {data.get('precio')} | {data.get('ubicacion')}")
            else:
                 print("   -> Todas las propiedades de esta página ya existen en la base de datos.")

            # Guardado único por página (en lugar de uno por cada registro)
            db.save()
            print(f"Pagina {page_num}: {len(urls)} fichas, {page_new} nuevas.")
            # Export CSV/XLSX diferido: cada 5 páginas (el JSON ya quedó a salvo arriba)
            if page_num % 5 == 0:
                export_data(db, csv, xls)

            if max_pages and page_num >= max_pages:
                print(f"[Limite] {max_pages} paginas alcanzadas.")
                break

            page_num += 1
            next_url = get_next_page_url(soup, current, page_num)
            if not next_url or next_url == current:
                print("[Fin] No hay mas paginas.")
                break
            current = next_url
            if browser.sb is not None:
                browser.sb.sleep(random.uniform(min_wait, max_wait))
            else:
                time.sleep(random.uniform(min_wait, max_wait))
    finally:
        browser.close()

    # Export final garantizado (cubre páginas no múltiplos de 5 y cualquier break)
    export_data(db, csv, xls)

    print(f"\n=== COMPLETADO === Nuevas: {new_total} | Total BD: {len(db.get_all_as_list())}")

    # ── Normalización automática ──
    normalize_and_export(db, prefix)


# ── normalización automática ────────────────────────────────────────────────

def _normalize_antiguedad(antiguedad_str):
    """Convierte la cadena de antigüedad a entero. A estrenar = 0."""
    if not antiguedad_str or antiguedad_str == "N/A":
        return None
    s = str(antiguedad_str).lower()
    if "estrenar" in s or "nuevo" in s:
        return 0
    match = re.search(r'\d+', s)
    if match:
        return int(match.group())
    return None

def _has_keyword(text_list, keywords):
    """Busca si alguna palabra clave está en los textos."""
    combined = " ".join([str(t) for t in text_list if t]).lower()
    return any(kw in combined for kw in keywords)

def _parse_ubicacion_text(ubicacion_str):
    """
    Parsea el campo ubicacion de Lamudi para extraer estado, municipio y colonia.
    Formatos típicos:
      - "Veracruz Llave, Alvarado, Lomas de la Rioja"
      - "Venta, Casas, Veracruz Llave"
    """
    parts = [p.strip() for p in ubicacion_str.split(",")] if ubicacion_str else []
    estado = "Veracruz"
    municipio = None
    colonia = None

    # Filtrar palabras genéricas que no son ubicación
    skip = {"venta", "renta", "casas", "casa", "departamentos", "departamento",
            "terrenos", "terreno", "oficinas", "locales"}
    parts = [p for p in parts if p.lower() not in skip]

    # Normalizar "Veracruz Llave" -> "Veracruz"
    for i, p in enumerate(parts):
        if "veracruz" in p.lower() and "llave" in p.lower():
            parts[i] = "Veracruz"

    if len(parts) >= 3:
        # estado, municipio, colonia
        estado = parts[0]
        municipio = parts[1]
        colonia = parts[2]
    elif len(parts) == 2:
        estado = parts[0] if "veracruz" in parts[0].lower() or "tabasco" in parts[0].lower() else "Veracruz"
        municipio = parts[1] if estado == parts[0] else parts[0]
        colonia = parts[1] if municipio != parts[1] else None
    elif len(parts) == 1:
        if "veracruz" not in parts[0].lower():
            municipio = parts[0]

    # Normalizar estado
    if estado and "veracruz" in estado.lower():
        estado = "Veracruz"
    elif estado and "tabasco" in estado.lower():
        estado = "Tabasco"

    return estado, municipio, colonia

def normalize_and_export(db, prefix):
    """
    Convierte toda la BD cruda de Lamudi al formato normalizado del valuador
    y lo guarda en ../valuador_normalizado/{prefix}_normalizado.json
    """
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
        codigo_postal = record.get("codigo_postal")

        # Parsear ubicación del texto
        ubicacion_str = record.get("ubicacion", "")
        estado, municipio, colonia = _parse_ubicacion_text(ubicacion_str)

        # Fallback: intentar extraer colonia de la dirección si no se obtuvo
        if not colonia:
            direccion = record.get("direccion", "")
            dir_parts = [p.strip() for p in direccion.split(",")] if direccion else []
            if dir_parts and dir_parts[0] and len(dir_parts[0]) > 2:
                colonia = dir_parts[0]

        # Precio/m2
        precio_m2 = None
        if precio_valor > 0 and m2_construidos and m2_construidos > 0:
            precio_m2 = round(precio_valor / m2_construidos, 2)

        # Validación
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
                                ["fraccionamiento", "fracc", "residencial", "cluster", "coto", "privada"])
        tiene_vigilancia = _has_keyword([amenidades, desc],
                                        ["vigilancia", "seguridad", "24/7", "caseta", "acceso controlado", "guardia"])

        antiguedad_anos = _normalize_antiguedad(record.get("antiguedad"))

        item = {
            "id_propiedad": str(uuid.uuid4()),
            "url_origen": record.get("url", ""),
            "fuente": "Lamudi",
            "tipo_propiedad": "Casa",
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
    print("=== SCRAPER LAMUDI.COM.MX ===")
    print("1. Casas en venta — Veracruz, Ver.")
    print("2. Departamentos en venta — Veracruz, Ver.")
    print("3. Casas en venta — Villahermosa, Tabasco")
    print("4. Casas en venta — Boca del Rio, Ver.")
    print("5. URL personalizada")

    op = input("Opcion [1]: ").strip() or "1"

    opts = {
        "1": ("https://www.lamudi.com.mx/veracruz-llave/casa/for-sale/", "lamudi_veracruz_casas"),
        "2": ("https://www.lamudi.com.mx/veracruz-llave/veracruz/departamento/for-sale/", "lamudi_veracruz_deptos"),
        "3": ("https://www.lamudi.com.mx/tabasco/villahermosa/casa/for-sale/", "lamudi_tabasco_casas"),
        "4": ("https://www.lamudi.com.mx/veracruz-llave/boca-del-rio/casa/for-sale/", "lamudi_bocadelrio_casas"),
    }

    if op in opts:
        target_url, prefix = opts[op]
    elif op == "5":
        target_url = input("URL de Lamudi: ").strip()
        prefix = input("Nombre de archivo (ej: lamudi_veracruz): ").strip()
        if not target_url or not prefix:
            print("Datos invalidos."); exit()
    else:
        print("Opcion invalida."); exit()

    pags = input("Cuantas paginas? (Enter = TODAS): ").strip()
    max_p = int(pags) if pags.isdigit() else None
    
    conc_input = input("\n¿Grado de concurrencia HTTP para detalles? (Ej: 10) [por defecto 10]: ").strip() or "10"
    concurrency = int(conc_input) if conc_input.isdigit() else 10

    scrape_lamudi(target_url, prefix, max_pages=max_p, detail_concurrency=concurrency)
