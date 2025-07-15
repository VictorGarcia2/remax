#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extraer propiedades en venta de propiedades.com y subirlas a Firestore

Este script navega por múltiples páginas del portal propiedades.com para extraer información
de propiedades en venta, normaliza los datos y los sube a Firebase Firestore.

Uso:
  python propiedades.py --max-pages 10 --delay 3 --output propiedades_propiedadescom.csv

Autor: Basado en lamudi.py
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import argparse
import re
import time
import traceback
# import firebase_admin
# from firebase_admin import credentials, firestore
from valuador import normalizar_texto  # Importar la función de normalización
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync

# --- CONFIGURACIÓN DE FIREBASE ---
# (Desactivado para solo guardar en Excel/CSV)
db = None
# ---------------------------------

# URL base de propiedades.com (ejemplo para Veracruz, casas en venta)
base_url = "https://www.propiedades.com/veracruz/casas-venta?pagina=1"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1"
}

def clean_text(text):
    if not isinstance(text, str):
        return text
    clean = re.sub(r'[\n\r\t]+', ' ', text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    clean = clean.replace('\xa0', ' ')
    return clean

def normalizar_propiedad(item):
    direccion = item.get("Dirección", "No disponible")
    titulo = item.get("Título", "No disponible")
    url = item.get("URL", "No disponible")
    partes = [p.strip() for p in direccion.split(",") if p.strip()]
    colonia = partes[0] if len(partes) >= 1 else ""
    ciudad = partes[1] if len(partes) >= 2 else ""
    estado = partes[2] if len(partes) >= 3 else ""
    tipo = "casa"
    metros_str = item.get("Metros cuadrados", "0")
    metros_match = re.search(r"(\d+(?:[\.,]\d+)?)", metros_str.replace(",", "."))
    metros = float(metros_match.group(1)) if metros_match else 0
    precio_str = item.get("Precio", "0")
    precio_match = re.search(r"(\d+[\d,.]*)", precio_str.replace(",", ""))
    precio = int(precio_match.group(1)) if precio_match else 0
    banos_str = item.get("Baños", "0")
    banos_match = re.search(r"(\d+)", str(banos_str))
    banos = int(banos_match.group(1)) if banos_match else 0
    recamaras_str = item.get("Recámaras", "0")
    recamaras_match = re.search(r"(\d+)", str(recamaras_str))
    recamaras = int(recamaras_match.group(1)) if recamaras_match else 0
    if metros == 0 or precio == 0:
        print(f"[DESCARTADO] Sin metros o precio válido: {direccion}")
        return None
    precio_m2 = precio / metros
    if precio_m2 < 5000 or precio_m2 > 100000:
        print(f"[DESCARTADO] Outlier precio/m²={precio_m2:.2f}: {direccion}")
        return None
    
    # Normalizar campos usando la función robusta de valuador.py
    colonia_norm = normalizar_texto(colonia)
    ciudad_norm = normalizar_texto(ciudad)
    estado_norm = normalizar_texto(estado)
    tipo_norm = normalizar_texto(tipo)
    
    # Guardar también los valores originales como backup
    return {
        "colonia": colonia_norm,
        "ciudad": ciudad_norm,
        "estado": estado_norm,
        "tipo": tipo_norm,
        "colonia_original": colonia,  # Backup del valor original
        "ciudad_original": ciudad,    # Backup del valor original
        "estado_original": estado,    # Backup del valor original
        "tipo_original": tipo,        # Backup del valor original
        "direccion": direccion,
        "titulo": titulo,
        "url": url,
        "metros": metros,
        "precio": precio,
        "banos": banos,
        "recamaras": recamaras
    }

def save_to_firestore(data, collection_name='propiedades'):
    # Desactivado: no guardar en Firestore
    pass

def extract_properties_playwright(page, max_pages=1, delay=3):
    all_data = []
    for num in range(1, max_pages + 1):
        url = f"https://www.propiedades.com/veracruz/casas-venta?pagina={num}"
        print(f"Visitando: {url}")
        page.goto(url)
        time.sleep(delay)  # Espera a que cargue JS
        cards = page.query_selector_all("div[data-testid='listing-card']")
        print(f"Se encontraron {len(cards)} tarjetas.")
        for card in cards:
            try:
                titulo = card.query_selector("h2").inner_text()
                precio = card.query_selector("span[data-testid='listing-price']").inner_text()
                direccion = card.query_selector("span[data-testid='listing-location']").inner_text()
                url_prop = card.query_selector("a[data-testid='listing-card-link']").get_attribute("href")
                all_data.append({
                    "Título": titulo,
                    "Precio": precio,
                    "Dirección": direccion,
                    "URL": "https://www.propiedades.com" + url_prop if url_prop else ""
                })
            except Exception as e:
                continue
    return all_data

def main():
    parser = argparse.ArgumentParser(description="Scraper de propiedades.com (Playwright)")
    parser.add_argument('--max-pages', type=int, default=10, help='Número máximo de páginas a scrapear')
    parser.add_argument('--delay', type=int, default=3, help='Segundos de espera entre páginas')
    parser.add_argument('--output', type=str, default='propiedades_propiedadescom.csv', help='Archivo de salida CSV')
    parser.add_argument('--start-page', type=int, default=1, help='Página inicial')
    parser.add_argument('--end-page', type=int, default=None, help='Página final (incluida)')
    args = parser.parse_args()

    all_data = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Modo visible para depuración
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        page = browser.new_page(user_agent=user_agent)
        stealth_sync(page)
        # Determinar rango de páginas
        start_page = args.start_page
        end_page = args.end_page if args.end_page is not None else (start_page + args.max_pages - 1)
        for num in range(start_page, end_page + 1):
            url = f"https://www.propiedades.com/veracruz/casas-venta?pagina={num}"
            print(f"Visitando: {url}")
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            titulo = page.title()
            print("Título de la página:", titulo)
            if "just a moment" in titulo.lower():
                print("[WARN] Cloudflare challenge detectado, saltando página.")
                continue
            page.wait_for_selector("section[data-gtm^='card']", timeout=15000)
            time.sleep(args.delay)  # Espera adicional
            cards = page.query_selector_all("section[data-gtm^='card']")
            print(f"Se encontraron {len(cards)} tarjetas.")
            if len(cards) == 0:
                print("[DEBUG] Puede que la página no haya cargado bien, o el selector cambió.")
            for card in cards:
                try:
                    # Título: h3 dentro de la tarjeta
                    h3 = card.query_selector("h3")
                    titulo = h3.inner_text() if h3 else "No disponible"
                    # Precio: div con clase que contiene el precio
                    precio_div = card.query_selector("div.sc-402fc8bf-2")
                    precio = precio_div.inner_text() if precio_div else "No disponible"
                    # Dirección: span con itemprop='streetAddress' dentro de h3
                    direccion_span = card.query_selector("h3 span[itemprop='streetAddress']")
                    direccion = direccion_span.get_attribute("content") if direccion_span else "No disponible"
                    # URL: a con clase pcom-property-card-body-main-info-street
                    url_a = card.query_selector("a.pcom-property-card-body-main-info-street")
                    url_prop = url_a.get_attribute("href") if url_a else ""

                    # Extraer recámaras, baños y metros cuadrados por orden de amenities
                    amenities = card.query_selector_all("li.amenities")
                    recamaras = banos = metros = "No disponible"
                    if len(amenities) >= 3:
                        recamaras_div = amenities[0].query_selector("div.amenities-number")
                        recamaras = recamaras_div.inner_text().strip() if recamaras_div else "No disponible"
                        banos_div = amenities[1].query_selector("div.amenities-number")
                        banos = banos_div.inner_text().strip() if banos_div else "No disponible"
                        metros_div = amenities[2].query_selector("div.amenities-number")
                        metros = metros_div.inner_text().replace("m2", "").replace("m²", "").strip() if metros_div else "No disponible"

                    all_data.append({
                        "Título": titulo,
                        "Precio": precio,
                        "Dirección": direccion,
                        "URL": url_prop if url_prop else "",
                        "Metros cuadrados": metros,
                        "Recámaras": recamaras,
                        "Baños": banos
                    })
                except Exception as e:
                    print(f"[ERROR] Error extrayendo datos de una tarjeta: {e}")
                    continue
        browser.close()

    # Leer CSV existente si existe
    import os
    if os.path.exists(args.output):
        prev_df = pd.read_csv(args.output, encoding='utf-8-sig')
        prev_data = prev_df.to_dict(orient='records')
    else:
        prev_data = []
    # Unir datos previos y nuevos
    all_data_total = prev_data + all_data
    # Eliminar duplicados por URL
    seen_urls = set()
    unique_data = []
    for item in all_data_total:
        if item["URL"] != "No disponible" and item["URL"] not in seen_urls:
            seen_urls.add(item["URL"])
            unique_data.append(item)
    print(f"\nPropiedades únicas acumuladas: {len(unique_data)}")
    # Normalizar y filtrar
    normalizadas_validas = []
    for item in unique_data:
        norm_item = normalizar_propiedad(item)
        if norm_item:
            normalizadas_validas.append(norm_item)
    save_to_firestore(normalizadas_validas)
    # Guardar CSV
    if unique_data:
        df = pd.DataFrame(unique_data)
        df.to_csv(args.output, index=False, encoding='utf-8-sig')
        print(f"Datos guardados en '{args.output}'")
        # Guardar también en Excel
        try:
            excel_file = args.output.replace('.csv', '.xlsx')
            df.to_excel(excel_file, index=False)
            print(f"Datos guardados también en formato Excel: '{excel_file}'")
        except ImportError:
            print(f"Para guardar en formato Excel, instala openpyxl con: pip install openpyxl")
        except Exception as e:
            print(f"No se pudo guardar en formato Excel: {e}")
    else:
        print("No se extrajeron datos válidos.")

if __name__ == "__main__":
    main() 