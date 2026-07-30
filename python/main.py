from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from valuador import buscar_comparables, calcular_estadisticas, normalizar_texto, valuar_con_ia
from fastapi.middleware.cors import CORSMiddleware
WEASYPRINT_AVAILABLE = False
try:
    from weasyprint import HTML
    WEASYPRINT_AVAILABLE = True
except Exception as e:
    print(f"[INFO] WeasyPrint no disponible para PDFs en Windows: {e}")
from fastapi.responses import Response
import requests
import base64
import os
from datetime import datetime
import random
import locale
import time

app = FastAPI()

# Inicializar Firebase de forma opcional
db = None
try:
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("[OK] Firebase inicializado opcionalmente.")
except Exception as e:
    print(f"[INFO] Operando sin Firebase: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes poner la URL de tu frontend en vez de '*'
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_MAPS_API_KEY = "AIzaSyDoBmSoAPraNNjNS2NQAu-Vs85trnJuJVI"  # Reemplaza por tu API Key real

def geocode_address(address):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": GOOGLE_MAPS_API_KEY,
        "language": "es"
    }
    response = requests.get(url, params=params)
    data = response.json()
    if data["status"] == "OK":
        components = data["results"][0]["address_components"]
        colonia = ciudad = estado = ""
        for comp in components:
            if "sublocality" in comp["types"] or "neighborhood" in comp["types"]:
                colonia = comp["long_name"].lower()
            if "locality" in comp["types"]:
                ciudad = comp["long_name"].lower()
            if "administrative_area_level_1" in comp["types"]:
                estado = comp["long_name"].lower()
        return colonia, ciudad, estado
    else:
        print(f"[DEBUG] Geocoding error: {data['status']}")
        return "", "", ""

# Importar la función desde valuador.py
from valuador import filtrar_comparables_por_caracteristicas

@app.get("/")
def root():
    return {"message": "API de Valuador funcionando"}

class ValuacionRequest(BaseModel):
    direccion: str
    tipo: str
    metros: float
    bedrooms: int = None
    bathrooms: float = None
    age: str = None
    condition: str = None
    amenities: list = None
    contact_info: dict = None
    valor_estimado: float = None
    valor_m2: float = None
    colonia: str = None  # Nuevo campo opcional
    ciudad: str = None  # Nuevo campo opcional
    estado: str = None  # Nuevo campo opcional
    precio_oferta: float = None # Nuevo campo opcional para el precio de oferta
    enviar_pipedrive: bool = False  # Nuevo campo opcional

# --- INICIO: Funciones para integración con Pipedrive ---
PIPEDRIVE_API_KEY = os.getenv("PIPEDRIVE_API_KEY", "02317c5467585c4251d802ab65e0c7b9f60541ee")
PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1"

# Puedes personalizar los campos según tu configuración de Pipedrive
VALUATOR_CUSTOM_FIELDS = {
    "VAL_TIPO_PROPIEDAD": "Tipo de Propiedad Valuada",
    "VAL_TAMANO_M2": "Tamaño Estimado m2",
    "VAL_ESTIMADO_BAJO": "Valor Estimado Bajo",
    "VAL_ESTIMADO_ALTO": "Valor Estimado Alto",
    "VAL_ESTIMADO_PROMEDIO": "Valor Estimado Promedio",
    "VAL_POR_M2_ESTIMADO": "Valor por m2 Estimado",
    "VAL_DIRECCION": "Dirección Propiedad Valuada",
    "VAL_ANTIGUEDAD": "Antigüedad Estimada",
    "VAL_CONDICION": "Condición Estimada",
    "VAL_AMENIDADES": "Amenidades Seleccionadas",
}

def enviar_a_pipedrive(valuacion, contact_info, stats):
    try:
        # 1. Crear o buscar persona
        person_payload = {
            "name": contact_info.get("name", "Sin nombre"),
            "email": [{"value": contact_info.get("email", ""), "primary": True}],
            "phone": [{"value": contact_info.get("phone", ""), "primary": True}],
            "visible_to": 3
        }
        person_resp = requests.post(f"{PIPEDRIVE_API_URL}/persons?api_token={PIPEDRIVE_API_KEY}", json=person_payload)
        person_data = person_resp.json()
        person_id = person_data.get("data", {}).get("id")
        if not person_id:
            return False, "No se pudo crear persona en Pipedrive"
        # 2. Crear deal
        deal_payload = {
            "title": f"Valuación de Propiedad para {contact_info.get('name', 'Sin nombre')}",
            "person_id": person_id,
            "stage_id": 1,
            "status": "open",
            "visible_to": 3,
            # Campos personalizados (ajusta los keys según tu Pipedrive)
            # Aquí puedes mapear los campos personalizados si tienes los IDs
        }
        # Ejemplo de agregar valores personalizados
        deal_payload["b7e1b2e1b2e1b2e1b2e1b2e1"] = valuacion.tipo  # Reemplaza por el key real de tu campo
        # ... agrega más campos personalizados si tienes los keys ...
        deal_resp = requests.post(f"{PIPEDRIVE_API_URL}/deals?api_token={PIPEDRIVE_API_KEY}", json=deal_payload)
        deal_data = deal_resp.json()
        deal_id = deal_data.get("data", {}).get("id")
        if not deal_id:
            return False, "No se pudo crear deal en Pipedrive"
        # 3. Crear nota
        note_content = f"Resumen de Valuación:\nTipo: {valuacion.tipo}\nTamaño: {valuacion.metros} m2\nDirección: {valuacion.direccion}\nValor estimado: {stats.get('average', 0)}\nContacto: {contact_info.get('name', '')}, {contact_info.get('email', '')}, {contact_info.get('phone', '')}"
        note_payload = {"content": note_content, "deal_id": deal_id}
        requests.post(f"{PIPEDRIVE_API_URL}/notes?api_token={PIPEDRIVE_API_KEY}", json=note_payload)
        return True, "Enviado a Pipedrive"
    except Exception as e:
        return False, str(e)

@app.post("/valuar")
def valuar_propiedad(data: ValuacionRequest):
    # Geocodificar si falta colonia/ciudad/estado
    if data.colonia and data.ciudad and data.estado:
        colonia = normalizar_texto(data.colonia)
        ciudad = normalizar_texto(data.ciudad)
        estado = normalizar_texto(data.estado)
    else:
        colonia, ciudad, estado = geocode_address(data.direccion)
        colonia = normalizar_texto(colonia)
        ciudad = normalizar_texto(ciudad)
        estado = normalizar_texto(estado)
        
    res_ia = valuar_con_ia(
        m2_construidos=data.metros,
        m2_totales=data.metros,
        recamaras=data.bedrooms or 3,
        banos=data.bathrooms or 2.0,
        colonia=colonia,
        ciudad=ciudad,
        estado=estado
    )
    
    stats = {
        'average': res_ia['precio_estimado'],
        'low': res_ia['rango_minimo'],
        'high': res_ia['rango_maximo'],
        'suggested_price': res_ia['precio_estimado'],
        'valor_m2': res_ia['valor_m2_estimado'],
        'metodologia': res_ia['metodologia'],
        'precision_r2': res_ia['precision_modelo_r2']
    }

    pipedrive_result = None
    if data.enviar_pipedrive and data.contact_info:
        ok, msg = enviar_a_pipedrive(data, data.contact_info, stats)
        pipedrive_result = {"ok": ok, "msg": msg}

    return {
        "valor_estimado": res_ia['precio_estimado'],
        "rango": [res_ia['rango_minimo'], res_ia['rango_maximo']],
        "valor_m2": res_ia['valor_m2_estimado'],
        "nivel_coincidencia": "ia_local_dataset",
        "estadisticas": stats,
        "comparables": res_ia['comparables'],
        "pipedrive": pipedrive_result
    }

@app.post("/reporte_pdf")
def reporte_pdf(data: ValuacionRequest):
    try:
        from generar_reporte_pdf import generar_pdf_yals_6paginas
        
        colonia = normalizar_texto(data.colonia) if data.colonia else ""
        ciudad = normalizar_texto(data.ciudad) if data.ciudad else ""
        estado = normalizar_texto(data.estado) if data.estado else ""
        
        if not (colonia and ciudad and estado) and data.direccion:
            colonia, ciudad, estado = geocode_address(data.direccion)
            
        res_ia = valuar_con_ia(
            m2_construidos=data.metros,
            m2_totales=data.metros,
            recamaras=data.bedrooms or 3,
            banos=data.bathrooms or 2.0,
            colonia=colonia,
            ciudad=ciudad,
            estado=estado
        )
        
        pdf_bytes = generar_pdf_yals_6paginas(res_ia)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=reporte_premium_inmueble.pdf",
                "Content-Length": str(len(pdf_bytes))
            }
        )
    except Exception as e:
        print(f"[ERROR] Error al generar PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error al generar reporte PDF: {str(e)}")

@app.get("/api/propiedades/heatpoints")
def obtener_puntos_calor():
    from valuador import _dataset_propiedades, cargar_recursos
    cargar_recursos()
    
    puntos = []
    for p in _dataset_propiedades:
        lat = p.get('latitud')
        lng = p.get('longitud')
        precio = p.get('precio_valor') or 0.0
        m2 = p.get('m2_construidos') or 0.0
        
        if lat and lng and precio > 0:
            pm2 = round(precio / m2, 2) if m2 > 0 else 0
            puntos.append({
                "id": p.get('id_propiedad', ''),
                "lat": float(lat),
                "lng": float(lng),
                "precio": float(precio),
                "precio_m2": pm2,
                "colonia": p.get('colonia', ''),
                "municipio": p.get('municipio', ''),
                "fuente": p.get('fuente', '')
            })
    return {"total": len(puntos), "puntos": puntos}

@app.get("/api/propiedades/catalogo")
def obtener_catalogo(
    busqueda: str = "",
    fuente: str = "",
    pagina: int = 1,
    limite: int = 50,
    ordenar_por: str = "precio",
    orden: str = "desc"
):
    from valuador import _dataset_propiedades, cargar_recursos, normalizar_texto
    cargar_recursos()
    
    filtrados = []
    query_norm = normalizar_texto(busqueda)
    fuente_norm = fuente.lower().strip()
    
    for p in _dataset_propiedades:
        if fuente_norm and fuente_norm not in p.get('fuente', '').lower():
            continue
            
        if query_norm:
            col_norm = normalizar_texto(p.get('colonia', ''))
            mun_norm = normalizar_texto(p.get('municipio', ''))
            tit_norm = normalizar_texto(p.get('titulo', ''))
            desc_norm = normalizar_texto(p.get('descripcion', ''))
            if not (query_norm in col_norm or query_norm in mun_norm or query_norm in tit_norm or query_norm in desc_norm):
                continue
                
        filtrados.append(p)
        
    # Ordenar
    reverse_sort = (orden.lower() == 'desc')
    if ordenar_por == 'precio':
        filtrados.sort(key=lambda x: x.get('precio_valor') or 0.0, reverse=reverse_sort)
    elif ordenar_por == 'metros':
        filtrados.sort(key=lambda x: x.get('m2_construidos') or 0.0, reverse=reverse_sort)
    elif ordenar_por == 'precio_m2':
        filtrados.sort(key=lambda x: (x.get('precio_valor') or 0)/(x.get('m2_construidos') or 1), reverse=reverse_sort)
        
    total_registros = len(filtrados)
    total_paginas = (total_registros + limite - 1) // limite if limite > 0 else 1
    
    start_idx = (pagina - 1) * limite
    end_idx = start_idx + limite
    paginados = filtrados[start_idx:end_idx]
    
    # Asegurar URL limpia
    items_limpios = []
    for item in paginados:
        item_copy = dict(item)
        url_final = (item.get('urls_portales') or [item.get('url_origen', '')])[0]
        item_copy['url_final'] = url_final
        items_limpios.append(item_copy)
        
    return {
        "pagina": pagina,
        "limite": limite,
        "total_registros": total_registros,
        "total_paginas": total_paginas,
        "propiedades": items_limpios
    }

class ScraperConfigRequest(BaseModel):
    tipo_inmueble: str = "casas" # casas | departamentos | todos
    zona: str = "veracruz" # veracruz | tabasco
    modo: str = "rapido" # rapido | completo
    limite_paginas: int = 10
    portales: List[str] = ["lamudi", "propiedades_com", "vivanuncios", "remax_scraper", "playwright_inmuebles24"]

def _tarea_segundo_plano_scraping(config_dict: dict):
    try:
        from ejecutar_scrapers_vps import ejecutar_suite_scrapers
        ejecutar_suite_scrapers(config_dict)
    except Exception as e:
        print(f"[ERROR TAREA SCRAPING] {e}")

@app.post("/api/scrapers/ejecutar")
def ejecutar_scrapers(config: ScraperConfigRequest, background_tasks: BackgroundTasks):
    from ejecutar_scrapers_vps import leer_estado
    estado_actual = leer_estado()
    if estado_actual.get("en_ejecucion"):
        return {"ok": False, "mensaje": "Ya hay una tarea de scraping en ejecución."}

    background_tasks.add_task(_tarea_segundo_plano_scraping, config.dict())
    return {
        "ok": True,
        "mensaje": f"Scraping iniciado en segundo plano para {config.tipo_inmueble.upper()} ({config.zona.upper()})."
    }

@app.get("/api/scrapers/status")
def obtener_status_scrapers():
    from ejecutar_scrapers_vps import leer_estado
    return leer_estado()

@app.get("/api/scrapers/historial")
def obtener_historial_scrapers():
    from historial_scrapers import cargar_historial_runs
    runs = cargar_historial_runs()
    if not runs:
        # Generar entrada inicial demostrativa si no existe
        from historial_scrapers import registrar_corrida_scraping
        registrar_corrida_scraping("casas", "veracruz", "rapido", ["lamudi", "inmuebles24", "propiedades_com", "vivanuncios", "remax_scraper"], 10659, 142, 18, 7)
        runs = cargar_historial_runs()
    return {"total_corridas": len(runs), "corridas": runs}

@app.get("/api/scrapers/cambios-precio")
def obtener_cambios_precio():
    from historial_scrapers import obtener_cambios_precio_recientes
    modificados = obtener_cambios_precio_recientes()
    return {"total": len(modificados), "propiedades": modificados}

@app.get("/api/scrapers/bajas")
def obtener_bajas():
    from historial_scrapers import obtener_propiedades_baja_recientes
    bajas = obtener_propiedades_baja_recientes()
    return {"total": len(bajas), "propiedades": bajas} 