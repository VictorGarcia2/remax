from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
from valuador import buscar_comparables, calcular_estadisticas
from fastapi.middleware.cors import CORSMiddleware
from weasyprint import HTML
from fastapi.responses import Response

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

@app.post("/valuar")
def valuar_propiedad(data: ValuacionRequest):
    # Extraer colonia, ciudad y estado de la dirección
    partes = [p.strip().lower() for p in data.direccion.split(",")]
    colonia = ''
    ciudad = ''
    estado = ''
    if len(partes) >= 4:
        colonia = partes[-4]
        ciudad = partes[-3]
        estado = partes[-2]
    elif len(partes) == 3:
        ciudad = partes[-3]
        estado = partes[-2]
    elif len(partes) == 2:
        ciudad = partes[0]
        estado = partes[1]
    tipo = data.tipo.lower()
    metros = data.metros

    print(f"[DEBUG] Extracción: colonia='{colonia}', ciudad='{ciudad}', estado='{estado}'")

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
    # Aquí puedes adaptar los datos según tu lógica
    html = f"""
    <html>
    <head>
        <meta charset='utf-8'>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            h1 {{ color: #003da4; }}
            .box {{ border: 1px solid #ccc; border-radius: 8px; padding: 16px; margin-bottom: 24px; }}
            .section-title {{ color: #ff9900; font-weight: bold; margin-top: 24px; }}
            .caracteristicas, .amenidades {{ margin-bottom: 8px; }}
            .valor {{ color: #0099cc; font-size: 1.5em; font-weight: bold; }}
            .tabla {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
            .tabla th, .tabla td {{ border: 1px solid #ccc; padding: 8px; text-align: center; }}
            .tabla th {{ background: #f5f5f5; }}
        </style>
    </head>
    <body>
        <h1>REPORTE PREMIUM DE INMUEBLE</h1>
        <div class='section-title'>1. CARACTERÍSTICAS DE LA PROPIEDAD</div>
        <div class='box'>
            <div class='caracteristicas'><b>Tipo:</b> {data.tipo}</div>
            <div class='caracteristicas'><b>Metros:</b> {data.metros} m²</div>
            <div class='caracteristicas'><b>Habitaciones:</b> {getattr(data, 'bedrooms', '')}</div>
            <div class='caracteristicas'><b>Baños:</b> {getattr(data, 'bathrooms', '')}</div>
            <div class='caracteristicas'><b>Antigüedad:</b> {getattr(data, 'age', '')}</div>
            <div class='caracteristicas'><b>Condición:</b> {getattr(data, 'condition', '')}</div>
            <div class='caracteristicas'><b>Dirección:</b> {data.direccion}</div>
            <div class='amenidades'><b>Amenidades:</b> {', '.join(data.amenities) if getattr(data, 'amenities', None) else ''}</div>
        </div>
        <div class='section-title'>2. ESTIMADO DE VALOR</div>
        <div class='box'>
            <table class='tabla'>
                <tr><th>Valor total estimado</th><th>Valor por m²</th></tr>
                <tr>
                    <td class='valor'>${getattr(data, 'valor_estimado', 'N/A'):,}</td>
                    <td class='valor'>${getattr(data, 'valor_m2', 'N/A'):,}</td>
                </tr>
            </table>
        </div>
        <div style='font-size:0.8em; color:#888; margin-top:32px;'>Reporte generado automáticamente por REMAX CIN</div>
    </body>
    </html>
    """
    pdf = HTML(string=html).write_pdf()
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=reporte_inmueble.pdf"}) 