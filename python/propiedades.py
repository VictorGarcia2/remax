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
import firebase_admin
from firebase_admin import credentials, firestore

# --- CONFIGURACIÓN DE FIREBASE ---
# (Desactivado para solo guardar en Excel/CSV)
db = None
# ---------------------------------

# URL base de propiedades.com (ejemplo para Veracruz, casas en venta)
base_url = "https://propiedades.com/veracruz/casas-venta?pagina=1"
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
    return {
        "colonia": colonia,
        "ciudad": ciudad,
        "estado": estado,
        "tipo": tipo.lower(),
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

def extract_properties_from_page(soup):
    data = []
    property_cards = soup.select("div[data-testid='listing-card']")
    print(f"Se encontraron {len(property_cards)} tarjetas de propiedad en la página.")
    for card in property_cards:
        property_data = {"Título": "No disponible", "Precio": "No disponible", 
                         "Metros cuadrados": "No disponible", "Dirección": "No disponible",
                         "Baños": "No disponible", "Recámaras": "No disponible", "URL": "No disponible"}
        # Título
        title_elem = card.select_one("h2")
        if title_elem:
            property_data["Título"] = clean_text(title_elem.get_text())
        # Precio
        price_elem = card.select_one("span[data-testid='listing-price']")
        if price_elem:
            property_data["Precio"] = clean_text(price_elem.get_text())
        # Metros cuadrados
        size_elem = card.find(string=re.compile(r"m²"))
        if size_elem:
            size_match = re.search(r"(\d+[\.,]?\d*)\s*m²", size_elem)
            if size_match:
                property_data["Metros cuadrados"] = size_match.group(1) + " m²"
        # Dirección
        address_elem = card.select_one("span[data-testid='listing-location']")
        if address_elem:
            property_data["Dirección"] = clean_text(address_elem.get_text())
        # Baños y recámaras
        features = card.select("li[data-testid='listing-features-item']")
        for feat in features:
            txt = clean_text(feat.get_text())
            if "baño" in txt.lower():
                num = re.search(r"(\d+)", txt)
                if num:
                    property_data["Baños"] = num.group(1)
            if "recámara" in txt.lower() or "habitación" in txt.lower():
                num = re.search(r"(\d+)", txt)
                if num:
                    property_data["Recámaras"] = num.group(1)
        # URL
        link_elem = card.select_one("a[data-testid='listing-card-link']")
        if link_elem and link_elem.has_attr('href'):
            property_data["URL"] = "https://www.propiedades.com" + link_elem['href']
        # Solo agregar si tiene título y precio
        if property_data["Título"] != "No disponible" and property_data["Precio"] != "No disponible":
            data.append(property_data)
    return data

def main():
    parser = argparse.ArgumentParser(description="Scraper de propiedades.com")
    parser.add_argument('--max-pages', type=int, default=10, help='Número máximo de páginas a scrapear')
    parser.add_argument('--delay', type=int, default=3, help='Segundos de espera entre páginas')
    parser.add_argument('--output', type=str, default='propiedades_propiedadescom.csv', help='Archivo de salida CSV')
    args = parser.parse_args()

    all_data = []
    page = 1
    while page <= args.max_pages:
        url = base_url if page == 1 else f"{base_url}?pagina={page}"
        print(f"\nRealizando petición a la página {page}: {url}")
        if page > 1:
            time.sleep(args.delay)
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error al obtener la página {page}: status {response.status_code}")
            break
        soup = BeautifulSoup(response.text, "html.parser")
        if page == 1:
            with open("propiedadescom_page.html", "w", encoding="utf-8") as f:
                f.write(response.text)
        page_data = extract_properties_from_page(soup)
        all_data.extend(page_data)
        # Paginación: buscar si hay un botón de siguiente
        next_btn = soup.select_one("a[aria-label='Siguiente']")
        if not next_btn:
            print("No se encontró botón de siguiente. Fin del scraping.")
            break
        page += 1
    # Eliminar duplicados por URL
    seen_urls = set()
    unique_data = []
    for item in all_data:
        if item["URL"] != "No disponible" and item["URL"] not in seen_urls:
            seen_urls.add(item["URL"])
            unique_data.append(item)
    print(f"\nPropiedades únicas extraídas: {len(unique_data)}")
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