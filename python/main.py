from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
from valuador import buscar_comparables, calcular_estadisticas
from fastapi.middleware.cors import CORSMiddleware
from weasyprint import HTML
from fastapi.responses import Response
import requests
import base64
import os
from datetime import datetime
import random
import locale
import time

app = FastAPI()

# Inicializar Firebase
cred = credentials.Certificate("serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

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

def filtrar_comparables_por_caracteristicas(comparables, metros, recamaras, banos):
    comparables_filtrados = []
    for c in comparables:
        if c.get('metros') and metros:
            if not (0.8 * metros <= c['metros'] <= 1.2 * metros):
                continue
        if c.get('recamaras') and recamaras:
            if abs(c['recamaras'] - recamaras) > 1:
                continue
        if c.get('banos') and banos:
            if abs(c['banos'] - banos) > 1:
                continue
        comparables_filtrados.append(c)
    return comparables_filtrados

@app.get("/")
def root():
    return {"message": "API de Valuador funcionando"}

class ValuacionRequest(BaseModel):
    direccion: str
    tipo: str
    metros: float
    bedrooms: int = None
    bathrooms: int = None
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

@app.post("/valuar")
def valuar_propiedad(data: ValuacionRequest):
    # Usar colonia, ciudad y estado enviados si existen, si no, usar geocodificación
    if data.colonia and data.ciudad and data.estado:
        colonia = data.colonia.lower().strip()
        ciudad = data.ciudad.lower().strip()
        estado = data.estado.lower().strip()
        print(f"[DEBUG] Usando datos enviados por el usuario: colonia='{colonia}', ciudad='{ciudad}', estado='{estado}'")
    else:
        colonia, ciudad, estado = geocode_address(data.direccion)
        print(f"[DEBUG] Google Maps: colonia='{colonia}', ciudad='{ciudad}', estado='{estado}'")
    tipo = data.tipo.lower()
    metros = data.metros

    comparables, nivel = buscar_comparables(db, ciudad, estado, tipo, colonia)
    if not comparables:
        raise HTTPException(status_code=404, detail="No se encontraron comparables")
    stats = calcular_estadisticas(
        comparables,
        size=metros,
        address=data.direccion,
        property_type=tipo,
        bedrooms=data.bedrooms,
        bathrooms=data.bathrooms,
        age=data.age,
        condition=data.condition,
        amenities=data.amenities,
        contact_info=data.contact_info
    )
    if not stats:
        raise HTTPException(status_code=400, detail="No se pudo calcular estadísticas")
    valor_estimado = stats['average']
    return {
        "valor_estimado": valor_estimado,
        "rango": [stats['low'], stats['high']],
        "nivel_coincidencia": nivel,
        "estadisticas": stats,
        "comparables": comparables[:5]  # Solo los 5 primeros para mostrar
    }

@app.post("/reporte_pdf")
def reporte_pdf(data: ValuacionRequest):
    t0 = time.time()
    # Obtener comparables para la propiedad
    if data.colonia and data.ciudad and data.estado:
        colonia = data.colonia.lower().strip()
        ciudad = data.ciudad.lower().strip()
        estado = data.estado.lower().strip()
    else:
        colonia, ciudad, estado = geocode_address(data.direccion)
    tipo = data.tipo.lower()
    t1 = time.time()
    comparables, _ = buscar_comparables(db, ciudad, estado, tipo, colonia)
    comparables = filtrar_comparables_por_caracteristicas(
        comparables,
        data.metros,
        data.bedrooms,
        data.bathrooms
    )
    comparables = comparables[:5] if comparables else []
    t2 = time.time()
    # Calcular estadísticas para los valores de la tabla resumen
    stats = None
    try:
        from valuador import calcular_estadisticas
        stats = calcular_estadisticas(
            comparables,
            size=data.metros,
            address=data.direccion,
            property_type=tipo,
            bedrooms=data.bedrooms,
            bathrooms=data.bathrooms,
            age=data.age,
            condition=data.condition,
            amenities=data.amenities,
            contact_info=data.contact_info
        )
    except Exception as e:
        stats = None

    # Valores para la tabla resumen
    valor_total_low = stats['low'] if stats else 0
    valor_total_avg = stats['average'] if stats else 0
    valor_total_high = stats['high'] if stats else 0
    valor_m2_avg = stats['promedio_m2'] if stats else 0
    valor_m2_low = valor_m2_avg * 0.9 if stats else 0
    valor_m2_high = valor_m2_avg * 1.1 if stats else 0

    resumen_html = f'''
    <div class="section-title">2. RESUMEN DE VALORACIÓN</div>
    <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:1.1em;">
      <thead>
        <tr style="background:#0033a0; color:#fff;">
          <th style="padding:10px; border:1px solid #ccc;"> </th>
          <th style="padding:10px; border:1px solid #ccc;">Límite inferior</th>
          <th style="padding:10px; border:1px solid #ccc;">Estimado</th>
          <th style="padding:10px; border:1px solid #ccc;">Límite superior</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px; border:1px solid #ccc; font-weight:600;">Valor total</td>
          <td style="padding:10px; border:1px solid #ccc;">${valor_total_low:,.2f}</td>
          <td style="padding:10px; border:1px solid #ccc; color:#0033a0; font-weight:700;">${valor_total_avg:,.2f}</td>
          <td style="padding:10px; border:1px solid #ccc;">${valor_total_high:,.2f}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ccc; font-weight:600;">Valor por m²</td>
          <td style="padding:10px; border:1px solid #ccc;">${valor_m2_low:,.2f}</td>
          <td style="padding:10px; border:1px solid #ccc; color:#e11b22; font-weight:700;">${valor_m2_avg:,.2f}</td>
          <td style="padding:10px; border:1px solid #ccc;">${valor_m2_high:,.2f}</td>
        </tr>
      </tbody>
    </table>
    <div style="font-size:0.95em; color:#555; margin-bottom:32px;">
      <b>Notas aclaratorias:</b><br>
      1. El valor mostrado es un estimado basado en propiedades similares en la zona y puede variar.<br>
      2. El rango representa una estimación considerando posibles variaciones del mercado.<br>
      3. Este reporte es informativo y no constituye una valuación oficial.<br>
    </div>
    '''

    # Logo (base64)
    logo_path = os.path.join(os.path.dirname(__file__), '../frontend/public/logos/New_RMX_Mark_R4_RGB_cream.png')
    logo_b64 = ''
    try:
        with open(logo_path, 'rb') as f:
            logo_b64 = base64.b64encode(f.read()).decode('utf-8')
    except Exception as e:
        logo_b64 = ''
    # Fecha y ID de reporte
    try:
        locale.setlocale(locale.LC_TIME, 'es_MX.UTF-8')
    except:
        try:
            locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
        except:
            locale.setlocale(locale.LC_TIME, 'es_ES')
    fecha = datetime.now().strftime('%d de %B de %Y')
    reporte_id = random.randint(100000, 999999)
    # Construir tabla de comparables
    comparables_html = ""
    if comparables:
        comparables_html += "<div class='comparables-title'>BASADO EN OFERTAS DE PROPIEDADES SIMILARES</div>"
        comparables_html += "<table class='comparables-table'>"
        comparables_html += "<tr><th>Dirección</th><th>Precio</th><th>Metros</th><th>Precio por m²</th></tr>"
        for c in comparables:
            precio = c.get('precio', 0)
            metros = c.get('metros', 0)
            precio_m2 = round(precio / metros, 2) if metros else 0
            comparables_html += f"<tr><td>{c.get('direccion', '')}</td><td>${precio:,}</td><td>{metros}</td><td>${precio_m2:,}</td></tr>"
        comparables_html += "</table>"
    # Precio de oferta si viene en el request
    precio_oferta_html = ""
    if hasattr(data, 'precio_oferta') and data.precio_oferta:
        precio_oferta_html = f"<div class='section-title'>Precio de oferta de la propiedad</div><div class='box'><b>${data.precio_oferta:,}</b></div>"
    t3 = time.time()
    html = f"""
    <html>
    <head>
        <meta charset='utf-8'>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            @page {{
                size: letter;
                margin: 32px 24px 32px 24px;
            }}
            body {{
                font-family: 'Inter', Arial, 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
                background: #f5f7fb;
                margin: 0;
                padding: 0;
                color: #333;
            }}
            .header {{
                background: #0033a0;
                color: #fff;
                padding: 24px 32px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }}
            .header img {{
                height: 60px;
            }}
            .header .id {{
                font-size: 1.2em;
                font-weight: 600;
            }}
            h1 {{
                color: #0033a0;
                text-align: center;
                margin: 40px 0 16px 0;
                font-size: 2.4em;
            }}
            .direccion-destacada {{
                margin: 0 auto 24px auto;
                padding: 20px 32px;
                background: #eaf0fb;
                border-left: 6px solid #0033a0;
                border-radius: 8px;
                font-size: 1.2em;
                color: #0033a0;
                font-weight: 600;
                text-align: center;
                width: 96%;
                max-width: 100%;
            }}
            .fecha {{
                text-align: right;
                color: #555;
                font-size: 0.95em;
                margin: 0 32px 24px 0;
            }}
            .section-title {{
                color: #e11b22;
                font-weight: 700;
                font-size: 1.3em;
                margin: 48px 0 18px 32px;
            }}
            .caracteristicas-box {{
                background: #fff;
                border-radius: 12px;
                padding: 32px;
                margin: 0 16px 32px 16px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.05);
                display: flex;
                flex-wrap: wrap;
                gap: 48px;
            }}
            .caracteristicas-info {{
                flex: 2;
                font-size: 1em;
                line-height: 1.6;
            }}
            .caracteristicas-icones {{
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 12px;
            }}
            .caract-list {{
                display: flex;
                flex-wrap: wrap;
                gap: 24px;
            }}
            .caract-item {{
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 0.95em;
                color: #444;
            }}
            .caract-item span.emoji {{
                font-size: 1.8em;
                margin-bottom: 4px;
            }}
            .valor-box {{
                background: #fff;
                border-left: 6px solid #e11b22;
                border-radius: 12px;
                padding: 32px;
                margin: 0 16px 32px 16px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.05);
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                gap: 48px;
            }}
            .valor-main {{
                font-size: 2.4em;
                color: #0033a0;
                font-weight: 700;
            }}
            .valor-label {{
                color: #666;
                font-size: 1em;
                margin-bottom: 6px;
            }}
            .valor-m2 {{
                font-size: 1.5em;
                color: #e11b22;
                font-weight: 700;
            }}
            .comparables-title {{
                color: #0033a0;
                font-weight: 600;
                font-size: 1.2em;
                margin: 40px 0 12px 32px;
            }}
            .comparables-table {{
                width: 98%;
                margin: 0 auto 48px auto;
                border-collapse: collapse;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }}
            .comparables-table th, .comparables-table td {{
                border: 1px solid #ccc;
                padding: 12px;
                text-align: center;
                font-size: 1em;
            }}
            .comparables-table th {{
                background: #0033a0;
                color: #fff;
            }}
            .comparables-table tr:nth-child(even) {{
                background: #f9f9f9;
            }}
            .box {{
                border: 1px solid #e11b22;
                border-radius: 8px;
                background: #fff;
                padding: 10px 16px;
                display: inline-block;
                font-size: 1em;
                color: #e11b22;
                font-weight: 600;
                margin: 8px 0;
            }}
            .footer {{
                font-size: 0.9em;
                color: #888;
                margin: 48px 0;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class='header'>
            <img src='data:image/png;base64,{logo_b64}' alt='Logo REMAX' />
            <span class='id'>ID {reporte_id}</span>
        </div>
        <h1>REPORTE PREMIUM DE INMUEBLE</h1>
        <div class='direccion-destacada'>{data.direccion}</div>
        <div class='fecha'>Reporte generado el {fecha}</div>
        
        <div class='section-title'>1. CARACTERÍSTICAS DE LA PROPIEDAD</div>
        <div class='caracteristicas-box'>
            <div class='caracteristicas-info'>
                <div><b>Tipo:</b> {data.tipo}</div>
                <div><b>Metros:</b> {data.metros} m²</div>
                <div><b>Habitaciones:</b> {getattr(data, 'bedrooms', '')}</div>
                <div><b>Baños:</b> {getattr(data, 'bathrooms', '')}</div>
                <div><b>Antigüedad:</b> {getattr(data, 'age', '')}</div>
                <div><b>Condición:</b> {getattr(data, 'condition', '')}</div>
                <div><b>Dirección:</b> {data.direccion}</div>
                <div><b>Amenidades:</b> {', '.join(data.amenities) if getattr(data, 'amenities', None) else 'N/A'}</div>
            </div>
            <div class='caracteristicas-icones'>
                <div class='caract-list'>
                    <div class='caract-item'><span class='emoji'>🏠</span>Casa</div>
                    <div class='caract-item'><span class='emoji'>🛏️</span>{getattr(data, 'bedrooms', '')} Cuartos</div>
                    <div class='caract-item'><span class='emoji'>🛁</span>{getattr(data, 'bathrooms', '')} Baños</div>
                    <div class='caract-item'><span class='emoji'>📏</span>{data.metros} m²</div>
                </div>
            </div>
        </div>

        {resumen_html}

        {comparables_html}
        {precio_oferta_html}

        <div class='footer'>Reporte generado automáticamente por REMAX CIN</div>
    </body>
    </html>
"""
    t4 = time.time()
    pdf = HTML(string=html).write_pdf()
    t5 = time.time()
    print(f"[PERF] Tiempo total: {t5-t0:.2f}s | Consulta: {t2-t1:.2f}s | HTML: {t4-t3:.2f}s | PDF: {t5-t4:.2f}s")
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=reporte_inmueble.pdf"}) 