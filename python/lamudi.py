#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para extraer propiedades en venta de Lamudi Veracruz

Este script navega por múltiples páginas del portal Lamudi para extraer información
de propiedades en venta en Veracruz, incluyendo título, precio, metros cuadrados,
dirección, número de baños y recámaras.

Uso:
  python lamudi.py --max-pages 15 --delay 3 --output propiedades_veracruz.csv

Autor: Desarrollado con asistencia de GitHub Copilot
Fecha: 2023
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
# Asegúrate de que el archivo serviceAccountKey.json está en la misma carpeta
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Conexión con Firebase establecida.")
except Exception as e:
    print(f"Error al inicializar Firebase: {e}")
    print("Asegúrate de que el archivo 'serviceAccountKey.json' existe y es correcto.")
    db = None
# ---------------------------------

# URL base de la página de Lamudi
base_url = "https://www.lamudi.com.mx/veracruz-llave/veracruz/casa/for-sale/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

# Función para extraer propiedades de una página
def extract_properties_from_page(soup):
    data = []
    total_links = 0
    processed_items = 0
    extracted_items = 0
    
    # Intentar varios selectores para encontrar las propiedades
    property_items = []
    
    # Método 1: Buscar enlaces a detalles de propiedades que contengan información detallada
    property_links = soup.select("a[href*='detalle']")
    total_links += len(property_links)
    if property_links:
        print(f"Se encontraron {len(property_links)} enlaces a propiedades en esta página")
        property_items = []
        for link in property_links:
            container = link.find_parent("div")
            if container:
                # Guardamos también el enlace asociado con el contenedor para usarlo después
                container.property_url = link.get('href', '')
                property_items.append(container)
    
    # Método 2: Buscar directamente los contenedores de propiedades (tarjetas)
    card_items = []
    selectors = [
        ".card", 
        ".listing-card", 
        "[class*='property-item']",
        "[class*='snippet']",
        "[class*='property-card']",
        "[class*='property'] [class*='card']",
        ".listing",
        "[class*='listing']",
        "[data-test='listing-card']"
    ]
    
    for selector in selectors:
        items = soup.select(selector)
        if items:
            print(f"Selector '{selector}': {len(items)} elementos encontrados")
            for item in items:
                # Buscar también el enlace asociado
                link = item.find('a', href=True)
                if link:
                    item.property_url = link['href']
                    total_links += 1
            card_items.extend(items)
    
    if card_items:
        print(f"Método de tarjetas: Se encontraron {len(card_items)} contenedores de propiedades")
        # Si ya teníamos elementos, añadimos estos nuevos solo si son diferentes
        if property_items:
            # Combinar los resultados, evitando duplicados
            existing_urls = set()
            for item in property_items:
                if hasattr(item, 'property_url'):
                    existing_urls.add(item.property_url)
            
            for item in card_items:
                if hasattr(item, 'property_url') and item.property_url not in existing_urls:
                    property_items.append(item)
        else:
            property_items = card_items
    
    # Método 3: Buscar elementos que contengan tanto título como precio
    title_price_items = []
    titles = soup.select(".snippet__content__title, h2, h3, [class*='title']")
    for title in titles:
        container = title.find_parent("div")
        if container and container.find(string=re.compile(r'\$')):
            # Buscar enlaces en este contenedor
            links = container.find_all('a', href=True)
            if links:
                container.property_url = links[0]['href']
            title_price_items.append(container)
    
    if title_price_items:
        print(f"Método de título+precio: Se encontraron {len(title_price_items)} elementos")
        # Combinar con los resultados previos, evitando duplicados
        if property_items:
            existing_urls = set()
            for item in property_items:
                if hasattr(item, 'property_url'):
                    existing_urls.add(item.property_url)
            
            for item in title_price_items:
                if not hasattr(item, 'property_url') or item.property_url not in existing_urls:
                    property_items.append(item)
        else:
            property_items = title_price_items
    
    # Método 4: Búsqueda por precio
    if len(property_items) < 10:  # Si tenemos muy pocos elementos, intentar otro método
        print("Buscando elementos adicionales por precio...")
        price_items = []
        # Buscar cualquier caja/div que contiene al menos un precio en formato $XX,XXX MXN
        price_elements = soup.find_all(string=re.compile(r'\$\s*[\d,.]+\s*MXN'))
        
        if price_elements:
            print(f"Se encontraron {len(price_elements)} elementos con precios")
            
            for price_elem in price_elements:
                container = price_elem.parent
                if container:
                    # Buscar al menos 5 niveles hacia arriba para encontrar un contenedor adecuado
                    for _ in range(5):
                        if container.name == 'div' and len(container.find_all('div')) > 3:
                            # Buscar enlaces en este contenedor
                            links = container.find_all('a', href=True)
                            if links:
                                container.property_url = links[0]['href']
                            price_items.append(container)
                            break
                        container = container.parent
                        if not container or container.name == 'body':
                            break
            
            if price_items:
                print(f"Método por precio: Se encontraron {len(price_items)} posibles contenedores")
                # Combinar con los resultados previos
                if property_items:
                    existing_urls = set()
                    for item in property_items:
                        if hasattr(item, 'property_url'):
                            existing_urls.add(item.property_url)
                    
                    for item in price_items:
                        if not hasattr(item, 'property_url') or item.property_url not in existing_urls:
                            property_items.append(item)
                else:
                    property_items = price_items
    
    # Si aún no hay elementos suficientes o ninguno, guardar el HTML para análisis posterior
    if len(property_items) < 5:
        print("¡ADVERTENCIA! Se encontraron muy pocas propiedades en la página.")
        with open(f"lamudi_page_error.html", "w", encoding="utf-8") as f:
            f.write(str(soup))
        print("HTML guardado para análisis en lamudi_page_error.html")
        if len(property_items) == 0:
            return []
    
    print(f"\nProcesando {len(property_items)} elementos de propiedades encontrados...")
    
    # Procesar cada propiedad encontrada
    for property_container in property_items:
        processed_items += 1
        
        # Saltamos si el contenedor está vacío
        if not property_container:
            continue
            
        # Diccionario para almacenar los datos de esta propiedad
        property_data = {"Título": "No disponible", "Precio": "No disponible", 
                         "Metros cuadrados": "No disponible", "Dirección": "No disponible",
                         "Baños": "No disponible", "Recámaras": "No disponible", "URL": "No disponible"}
        
        # Intentar obtener la URL de la propiedad
        try:
            if hasattr(property_container, 'property_url'):
                property_data["URL"] = property_container.property_url
            else:
                # Buscar enlaces dentro del contenedor
                links = property_container.find_all('a', href=True)
                for link in links:
                    href = link.get('href', '')
                    if 'detalle' in href or 'property' in href:
                        property_data["URL"] = href
                        break
        except Exception:
            pass

        # Buscar título - intentar varios selectores
        title_element = (property_container.select_one(".snippet__content__title") or 
                         property_container.select_one("h2.title") or 
                         property_container.select_one("h3") or 
                         property_container.select_one("h2") or 
                         property_container.select_one("[class*='title']") or
                         property_container.select_one("[data-test='title']"))
        
        if title_element:
            title_text = title_element.get_text(strip=True)
            if title_text and not title_text.startswith("Destacado") and not "Whatsapp" in title_text and not "Contactar" in title_text:
                property_data["Título"] = title_text
        
        # Si aún no tenemos título, buscamos en todo el contenedor usando regex
        if property_data["Título"] == "No disponible":
            for element in property_container.find_all(['h1', 'h2', 'h3', 'h4', 'strong']):
                text = element.get_text(strip=True)
                if text and re.search(r'(Casa|Departamento|Inmueble|Propiedad)\s+en\s+.*', text, re.IGNORECASE):
                    property_data["Título"] = text
                    break
        
        # Buscar precio - intentar varios selectores
        price_element = (property_container.select_one('.snippet__content__price') or
                         property_container.select_one('[class*="price"]') or
                         property_container.select_one('[data-test="price"]'))
        
        if price_element:
            property_data["Precio"] = price_element.get_text(strip=True)
        else:
            # Método alternativo si no encuentra la clase específica
            # Buscar cualquier texto que parezca un precio ($X,XXX,XXX MXN)
            price_texts = []
            for element in property_container.find_all(['div', 'span', 'p']):
                if element.string and re.search(r'\$\s*[\d,.]+\s*(MXN|USD|EUR)', element.string, re.IGNORECASE):
                    price_texts.append(element.string)
                    
            if not price_texts:
                # Búsqueda más genérica si la anterior falla
                price_texts = property_container.find_all(string=re.compile(r'\$\s*[\d,.]+'))
                
            if price_texts:
                property_data["Precio"] = price_texts[0].strip()
        
        # Buscar metros cuadrados - intentar varios selectores
        size_element = (property_container.select_one('.property__number.area') or 
                        property_container.select_one('[data-test="area-value"]') or
                        property_container.select_one('[class*="area"]'))
        
        if size_element:
            property_data["Metros cuadrados"] = size_element.get_text(strip=True)
        else:
            # Método alternativo usando expresiones regulares para buscar patrón de metros cuadrados
            size_texts = []
            
            # Buscar en textos directos
            for element in property_container.find_all(['span', 'div']):
                if element.string and re.search(r'\d+\s*m²|\d+\s*m2|\d+\s*metros', element.string, re.IGNORECASE):
                    size_texts.append(element.string)
            
            # Si no encontramos nada, buscar en el HTML completo del contenedor
            if not size_texts:
                area_matches = re.findall(r'(\d+)\s*m²|(\d+)\s*m2|(\d+)\s*metros', property_container.get_text(), re.IGNORECASE)
                if area_matches:
                    for match_groups in area_matches:
                        # Tomar el primer grupo que no sea vacío
                        area = next((m for m in match_groups if m), None)
                        if area:
                            size_texts.append(f"{area} m²")
            
            if size_texts:
                property_data["Metros cuadrados"] = size_texts[0].strip()
        
        # Limpiar y normalizar el formato de metros cuadrados si lo encontramos
        if property_data["Metros cuadrados"] != "No disponible":
            # Extraer solo el número y la unidad m²
            area_match = re.search(r'(\d+(?:[\.,]\d+)?)\s*(?:m²|m2|metros)', property_data["Metros cuadrados"], re.IGNORECASE)
            if area_match:
                property_data["Metros cuadrados"] = f"{area_match.group(1)} m²"
        
        # Buscar dirección - intentar varios selectores
        address_element = (property_container.select_one("[class*='address']") or 
                          property_container.select_one("[class*='location']") or
                          property_container.select_one("[data-test='address']"))
        
        if address_element:
            property_data["Dirección"] = address_element.get_text(strip=True)
        elif title_element and re.search(r'en Venta en\s+', title_element.get_text()):
            # Extraer dirección del título si tiene formato "Casa en Venta en [Dirección]"
            match = re.search(r'en Venta en\s+(.+)', title_element.get_text())
            if match:
                property_data["Dirección"] = match.group(1).strip()
        
        # Si aún no tenemos dirección, buscar cualquier texto que parezca una ubicación de Veracruz
        if property_data["Dirección"] == "No disponible":
            location_texts = property_container.find_all(string=re.compile(r'Veracruz|Boca del Río|Alvarado|Medellín', re.IGNORECASE))
            if location_texts:
                for loc in location_texts:
                    # Verificar que no sea parte del título o precio
                    if "Venta" not in loc and "$" not in loc:
                        property_data["Dirección"] = loc.strip()
                        break
          # Buscar número de baños - intentar varios selectores
        bathrooms_element = (property_container.select_one('.property__number.bathrooms') or 
                            property_container.select_one('[data-test="full-bathrooms-value"]') or
                            property_container.select_one('[class*="bathroom"]'))
        
        if bathrooms_element:
            bath_text = bathrooms_element.get_text(strip=True)
            # Extraer solo el número
            bath_match = re.search(r'(\d+)', bath_text)
            if bath_match:
                property_data["Baños"] = bath_match.group(1)
            else:
                property_data["Baños"] = bath_text
        else:
            # Método alternativo 1: buscar texto cercano a "baño(s)"
            bath_found = False
            for element in property_container.find_all(['span', 'div']):
                if element.string and re.search(r'baño', element.string, re.IGNORECASE):
                    # Buscar el número cerca al texto
                    bath_match = re.search(r'(\d+)\s*baño', element.string, re.IGNORECASE)
                    if bath_match:
                        property_data["Baños"] = bath_match.group(1)
                        bath_found = True
                        break
            
            # Método alternativo 2: buscar número cercano a la palabra "baño" en el HTML padre
            if not bath_found:
                for element in property_container.find_all(['span', 'div']):
                    text = element.get_text(strip=True)
                    if re.search(r'^\d+$', text) and re.search(r'baño', str(element.parent).lower()):
                        property_data["Baños"] = text
                        bath_found = True
                        break
            
            # Método alternativo 3: buscar cualquier coincidencia de patrón "X baños" en todo el texto
            if not bath_found:
                bath_matches = re.findall(r'(\d+)\s*baño', property_container.get_text(), re.IGNORECASE)
                if bath_matches:
                    property_data["Baños"] = bath_matches[0]

        # Buscar número de recámaras/cuartos - intentar varios selectores
        bedrooms_element = (property_container.select_one('.property__number.bedrooms') or 
                           property_container.select_one('[data-test="bedrooms-value"]') or
                           property_container.select_one('[class*="bedroom"]'))
        
        if bedrooms_element:
            bed_text = bedrooms_element.get_text(strip=True)
            # Extraer solo el número
            bed_match = re.search(r'(\d+)', bed_text)
            if bed_match:
                property_data["Recámaras"] = bed_match.group(1)
            else:
                property_data["Recámaras"] = bed_text
        else:
            # Método alternativo 1: buscar texto cercano a palabras relacionadas con dormitorios
            bed_found = False
            bed_keywords = ['recámara', 'recamara', 'cuarto', 'dormitorio', 'habitaci']
            
            for element in property_container.find_all(['span', 'div']):
                if element.string:
                    for keyword in bed_keywords:
                        if keyword in element.string.lower():
                            # Buscar el número cerca al texto
                            bed_match = re.search(r'(\d+)\s*' + keyword, element.string.lower())
                            if bed_match:
                                property_data["Recámaras"] = bed_match.group(1)
                                bed_found = True
                                break
                if bed_found:
                    break
            
            # Método alternativo 2: buscar número cercano a palabras de dormitorios en el HTML padre
            if not bed_found:
                for element in property_container.find_all(['span', 'div']):
                    text = element.get_text(strip=True)
                    if re.search(r'^\d+$', text):
                        parent_text = str(element.parent).lower()
                        for keyword in bed_keywords:
                            if keyword in parent_text:
                                property_data["Recámaras"] = text
                                bed_found = True
                                break
                    if bed_found:
                        break
            
            # Método alternativo 3: buscar cualquier coincidencia de patrón en todo el texto
            if not bed_found:
                for keyword in bed_keywords:
                    bed_matches = re.findall(r'(\d+)\s*' + keyword, property_container.get_text().lower())
                    if bed_matches:
                        property_data["Recámaras"] = bed_matches[0]
                        break        # Si al menos tenemos título y precio, añadimos la propiedad
        try:
            if hasattr(property_container, 'property_url'):
                property_data["URL"] = property_container.property_url
            else:
                # Buscar enlaces dentro del contenedor
                links = property_container.find_all('a', href=True)
                for link in links:
                    href = link.get('href', '')
                    if 'detalle' in href or 'property' in href:
                        property_data["URL"] = href
                        break
        except Exception:
            pass

        # Si al menos tenemos título y precio, añadimos la propiedad
        if property_data["Título"] != "No disponible" and property_data["Precio"] != "No disponible":
            data.append(property_data)
            extracted_items += 1
    
    print(f"Se procesaron {processed_items} elementos y se extrajeron {extracted_items} propiedades con título y precio.")
    return data

# Función para limpiar el texto de un campo
def clean_text(text):
    if not isinstance(text, str):
        return text
    
    # Eliminar saltos de línea, tabs y espacios múltiples
    clean = re.sub(r'[\n\r\t]+', ' ', text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    # Eliminar caracteres no deseados y normalizar
    clean = clean.replace('\xa0', ' ')  # Reemplazar caracteres no rompibles
    
    return clean

def save_to_firestore(data, collection_name='propiedades'):
    """Guarda una lista de diccionarios en una colección de Firestore."""
    if not db:
        print("No se pueden guardar los datos en Firestore porque la conexión no fue establecida.")
        return
    
    if not data:
        print("No hay datos para guardar en Firestore.")
        return

    print(f"\n{'='*60}")
    print(f"GUARDANDO DATOS EN FIRESTORE")
    print(f"Colección: {collection_name}")
    print(f"{'='*60}")

    batch = db.batch()
    operations_in_batch = 0
    total_saved = 0
    
    for item in data:
        # Usamos la URL como ID del documento para evitar duplicados
        doc_id = item.get("URL")
        if not doc_id or doc_id == "No disponible":
            # Si no hay URL, generamos un ID automático
            doc_ref = db.collection(collection_name).document()
        else:
            # Limpiamos la URL para que sea un ID de documento válido
            # Firestore no permite / en los IDs
            clean_id = re.sub(r'[\/*?:"<>|]', '_', doc_id)
            # Los IDs no pueden tener más de 1500 bytes. Asumimos que la URL es más corta.
            doc_ref = db.collection(collection_name).document(clean_id)
        
        batch.set(doc_ref, item)
        operations_in_batch += 1
        
        # Firestore permite un máximo de 500 operaciones por batch
        if operations_in_batch == 499:
            print(f"Enviando batch de {operations_in_batch} documentos a Firestore...")
            batch.commit()
            total_saved += operations_in_batch
            batch = db.batch() # Iniciar un nuevo batch
            operations_in_batch = 0 # Resetear el contador

    # Enviar el último batch si contiene operaciones
    if operations_in_batch > 0:
        print(f"Enviando batch final de {operations_in_batch} documentos a Firestore...")
        batch.commit()
        total_saved += operations_in_batch

    print(f"\nSe han guardado un total de {total_saved} propiedades en la colección '{collection_name}' de Firestore.")


try:
        
    # Configuración de argumentos de línea de comandos
    parser = argparse.ArgumentParser(description='Scrape de propiedades en Lamudi Veracruz')
    parser.add_argument('--max-pages', type=int, default=36, help='Número máximo de páginas a procesar (por defecto: 10)')
    parser.add_argument('--delay', type=int, default=2, help='Retraso en segundos entre solicitudes (por defecto: 2)')
    parser.add_argument('--output', type=str, default='lamudi_scraped.csv', help='Nombre del archivo de salida (por defecto: lamudi_scraped.csv)')
    
    args = parser.parse_args()
    
    all_data = []
    page = 1
    max_pages = args.max_pages  # Límite de páginas a recorrer
    delay_seconds = args.delay
    output_file = args.output
    
    print(f"\n{'='*60}")
    print(f"INICIANDO SCRAPING DE LAMUDI VERACRUZ")
    print(f"- URL: {base_url}")
    print(f"- Máximo de páginas: {max_pages}")
    print(f"- Archivo de salida: {output_file}")
    print(f"{'='*60}\n")
    
    while page <= max_pages:
        # Construir la URL para la página actual
        if page == 1:
            url = base_url
        else:
            url = f"{base_url}?page={page}"
        
        print(f"\nRealizando petición a la página {page}: {url}")
        
        # Añadir un pequeño retraso para no sobrecargar el servidor
        if page > 1:
            print("Esperando unos segundos antes de la siguiente petición...")
            time.sleep(2)  # Esperar 2 segundos entre peticiones
            
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Verifica si la respuesta fue exitosa
        soup = BeautifulSoup(response.text, "html.parser")
        
        print(f"Código de estado: {response.status_code}")
        print(f"Tamaño de la respuesta: {len(response.text)} bytes")
        
        # Si es la primera página, guardar el HTML para análisis offline
        if page == 1:
            with open("lamudi_page.html", "w", encoding="utf-8") as f:
                f.write(response.text)
            print("HTML de la primera página guardado en lamudi_page.html para análisis")
        
        # Extraer propiedades de la página actual
        page_data = extract_properties_from_page(soup)
        all_data.extend(page_data)
          # Verificar si hay más páginas - comprobar múltiples posibles selectores para la paginación
        next_page_link = (soup.select_one("a[rel='next']") or 
                         soup.select_one("a.next") or 
                         soup.select_one("a.pagination__link--next") or
                         soup.select_one(".pagination a:contains('Siguiente')") or
                         soup.select_one(".next a") or
                         soup.select_one("[class*='pagination'] a[class*='next']") or
                         soup.select_one("[data-page-link-next]"))
        
        # Método alternativo: buscar cualquier enlace que contenga la página siguiente
        if not next_page_link:
            # Buscar enlaces que parezcan ser de paginación (contienen ?page= o similares)
            pagination_links = soup.select("a[href*='page=']")
            for link in pagination_links:
                href = link.get('href', '')
                # Buscar el número de página en el enlace
                page_match = re.search(r'page=(\d+)', href)
                if page_match and int(page_match.group(1)) == page + 1:
                    next_page_link = link
                    break
        
        # Si aún no se encontró, verificar si la URL actual ya tiene paginación y construir la siguiente manualmente
        if not next_page_link and page_data:
            print(f"No se encontró enlace directo a la siguiente página, intentando URL manual para página {page+1}")
            # Continuamos de todas formas porque tenemos datos
            page += 1
            continue
        
        if not next_page_link or not page_data:  # Si no hay enlace a la siguiente página o no hay datos
            print(f"No se encontró enlace a la siguiente página o no hay más propiedades. Terminando en la página {page}.")
            break
            
        page += 1
        
    print(f"\nSe han recopilado datos de {page} páginas en total.")
      # Eliminar duplicados basados en URL primero, luego en título y precio
    unique_data = []
    seen_urls = set()
    seen_title_price = set()
    duplicates_count = 0
    
    for item in all_data:
        # Primero intentamos usar la URL como identificador único
        if item["URL"] != "No disponible":
            if item["URL"] in seen_urls:
                duplicates_count += 1
                continue
            seen_urls.add(item["URL"])
            unique_data.append(item)
        else:
            # Si no hay URL, usamos título y precio como antes
            identifier = (item["Título"], item["Precio"])
            if identifier in seen_title_price:
                duplicates_count += 1
                continue
            seen_title_price.add(identifier)
            unique_data.append(item)
    
    print(f"\nSe encontraron {duplicates_count} propiedades duplicadas que fueron eliminadas.")
    print(f"Propiedades únicas restantes: {len(unique_data)}")

    # Guardar en Firestore
    save_to_firestore(unique_data)

    # --- El código para guardar en CSV y Excel se mantiene por si se necesita como respaldo ---
    # Exportar a CSV
    if unique_data:
        print(f"\n{'='*60}")
        print(f"PROCESANDO Y GUARDANDO DATOS LOCALMENTE (CSV/EXCEL)")
        print(f"{'='*60}")
        
        # Primero limpiamos los datos antes de crear el DataFrame
        for item in unique_data:
            for key, value in item.items():
                item[key] = clean_text(value)
                
                # Normalizar específicamente algunos campos
                if key == "Precio" and item[key] != "No disponible":
                    # Asegurarnos de que el formato del precio es consistente
                    price_match = re.search(r'(\$\s*[\d,.]+)\s*(MXN|USD|EUR)?', item[key])
                    if price_match:
                        item[key] = price_match.group(1).strip()
                
                elif key == "Metros cuadrados" and item[key] != "No disponible":
                    # Normalizar el formato de metros cuadrados
                    area_match = re.search(r'(\d+(?:[\.,]\d+)?)\s*(?:m²|m2|metros)', item[key])
                    if area_match:
                        item[key] = f"{area_match.group(1)} m²"
                        
        # Creamos un DataFrame con los datos ya limpios
        df = pd.DataFrame(unique_data)
        
        # Asegurarnos de que todos los valores son strings limpios
        for col in df.columns:
            df[col] = df[col].astype(str)
            df[col] = df[col].apply(clean_text)
        
        # Resumen estadístico
        print(f"\nResumen de datos extraídos:")
        print(f"- Total de propiedades: {len(df)}")
        print(f"- Propiedades con precio: {len(df[df['Precio'] != 'No disponible'])}")
        print(f"- Propiedades con metros cuadrados: {len(df[df['Metros cuadrados'] != 'No disponible'])}")
        print(f"- Propiedades con baños: {len(df[df['Baños'] != 'No disponible'])}")
        print(f"- Propiedades con recámaras: {len(df[df['Recámaras'] != 'No disponible'])}")
        
        # En lugar de usar to_csv, vamos a escribir el archivo manualmente para tener control total
        with open(output_file, "w", encoding="utf-8-sig", newline='') as f:
            # Escribir encabezados
            f.write(",".join([f'"{col}"' for col in df.columns]) + "\n")
            
            # Escribir cada fila
            for _, row in df.iterrows():
                values = []
                for val in row:
                    # Escapar comillas dobles y envolver en comillas
                    clean_val = str(val).replace('"', '""')
                    values.append(f'"{clean_val}"')
                f.write(",".join(values) + "\n")
        
        print(f"\nMuestra de datos (primeras 5 filas):")
        print(df.head())
        print(f"\nDatos guardados en '{output_file}'")
        
        # Guardar también en formato Excel si pandas está disponible
        try:
            excel_file = output_file.replace('.csv', '.xlsx')
            df.to_excel(excel_file, index=False)
            print(f"Datos guardados también en formato Excel: '{excel_file}'")
        except ImportError:
            print(f"Para guardar en formato Excel, instala openpyxl con: pip install openpyxl")
        except Exception as e:
            print(f"No se pudo guardar en formato Excel: {e}")
            
    else:
        print("No se pudieron extraer datos de propiedades. El sitio web puede haber cambiado su estructura o está protegido contra scraping.")
        # Crear un DataFrame vacío y guardarlo manualmente
        headers = ["Título", "Precio", "Metros cuadrados", "Dirección", "Baños", "Recámaras", "URL"]
        with open(output_file, "w", encoding="utf-8-sig", newline='') as f:
            f.write(",".join([f'"{h}"' for h in headers]) + "\n")
        print(pd.DataFrame(columns=headers))
        
except requests.exceptions.RequestException as e:
    print(f"Error al hacer la petición: {e}")
    # Crear un DataFrame vacío para mantener la estructura esperada
    df = pd.DataFrame(columns=["Título", "Precio", "Metros cuadrados", "Dirección", "Baños", "Recámaras"])
    df.to_csv(output_file, index=False, sep=',', encoding='utf-8-sig', quoting=1)
    print(df)
except Exception as e:
    print(f"Error inesperado: {e}")
    import traceback
    traceback.print_exc()

# Mensaje final con instrucciones
print("\nSi deseas extraer más páginas, puedes usar:")
print("python lamudi.py --max-pages 20 --delay 3")
print("\nPara obtener ayuda:")
print("python lamudi.py --help")
