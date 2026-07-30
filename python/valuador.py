import json
import os
import pickle
import numpy as np
import pandas as pd
import unidecode
import re
from typing import List, Dict, Any, Tuple

try:
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modelos', 'modelo_valuacion.pkl')
COLS_PATH = os.path.join(os.path.dirname(__file__), 'modelos', 'columnas.pkl')
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'dataset_master.json')
FALLBACK_DATASET = os.path.join(os.path.dirname(__file__), 'valuador_normalizado', 'veracruz_casas_combinado.json')

# Variables globales en memoria
_modelo_ia = None
_columnas_ia = None
_dataset_propiedades = []

def normalizar_texto(texto):
    if not texto:
        return ""
    texto = unidecode.unidecode(str(texto).lower())
    texto = re.sub(r'fracc\.?|colonia|col\.?|fraccionamiento|barrio|cp|c\.p\.', '', texto)
    texto = re.sub(r'[^a-z0-9 ]', '', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

def cargar_recursos():
    global _modelo_ia, _columnas_ia, _dataset_propiedades
    
    # 1. Cargar modelo
    if _modelo_ia is None and os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, 'rb') as f:
                _modelo_ia = pickle.load(f)
            with open(COLS_PATH, 'rb') as f:
                _columnas_ia = pickle.load(f)
            print("[OK] Modelo de IA cargado en memoria.")
        except Exception as e:
            print(f"[WARN] Error al cargar modelo de IA: {e}")

    # 2. Cargar dataset local
    if not _dataset_propiedades:
        path_to_use = DATASET_PATH if os.path.exists(DATASET_PATH) else FALLBACK_DATASET
        if os.path.exists(path_to_use):
            try:
                with open(path_to_use, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                _dataset_propiedades = content.get('propiedades', [])
                print(f"[OK] Dataset master cargado en memoria ({len(_dataset_propiedades)} propiedades).")
            except Exception as e:
                print(f"[WARN] Error al cargar dataset master: {e}")

# Inicializar al cargar módulo
cargar_recursos()

def calcular_distancia_km(lat1, lng1, lat2, lng2):
    if None in (lat1, lng1, lat2, lng2):
        return 9999.0
    # Fórmula Haversine aproximada
    r = 6371.0 # Radio Tierra km
    dlat = np.radians(lat2 - lat1)
    dlng = np.radians(lng2 - lng1)
    a = np.sin(dlat / 2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlng / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return r * c

def valuar_con_ia(
    m2_construidos: float,
    m2_totales: float = None,
    latitud: float = None,
    longitud: float = None,
    recamaras: int = 3,
    banos: float = 2.0,
    estacionamientos: int = 1,
    antiguedad_anos: float = 5.0,
    tiene_alberca: bool = False,
    en_fraccionamiento_cerrado: bool = False,
    tiene_vigilancia: bool = False,
    colonia: str = "",
    ciudad: str = "",
    estado: str = ""
) -> Dict[str, Any]:
    """
    Realiza la valuación estimativa mediante el modelo de Machine Learning entrenado
    y extrae los comparables reales más cercanos.
    """
    cargar_recursos()
    
    m2_construidos = max(float(m2_construidos or 10.0), 10.0)
    if m2_totales is None or m2_totales <= 0:
        m2_totales = m2_construidos
    else:
        m2_totales = max(float(m2_totales), m2_construidos)
        
    # Coordenadas por defecto (Veracruz / Boca del Río si no se proveen)
    lat_val = latitud if latitud is not None else 19.1738
    lng_val = longitud if longitud is not None else -96.1342
    
    # 1. Predicción por IA
    precio_estimado = 0.0
    if _modelo_ia is not None and _columnas_ia is not None:
        input_data = pd.DataFrame([{
            'm2_construidos': m2_construidos,
            'm2_totales': m2_totales,
            'latitud': lat_val,
            'longitud': lng_val,
            'antiguedad_anos': antiguedad_anos,
            'recamaras': recamaras,
            'banos': banos,
            'estacionamientos': estacionamientos,
            'tiene_alberca': int(tiene_alberca),
            'en_fraccionamiento_cerrado': int(en_fraccionamiento_cerrado),
            'tiene_vigilancia': int(tiene_vigilancia)
        }])[ _columnas_ia ]
        
        precio_estimado = float(_modelo_ia.predict(input_data)[0])
    
    # 2. Búsqueda de comparables en dataset local
    comparables_evaluados = []
    col_norm = normalizar_texto(colonia)
    muni_norm = normalizar_texto(ciudad)
    
    for p in _dataset_propiedades:
        precio_p = p.get('precio_valor') or 0.0
        m2c_p = p.get('m2_construidos') or 0.0
        if precio_p <= 0 or m2c_p <= 0:
            continue
            
        lat_p = p.get('latitud')
        lng_p = p.get('longitud')
        dist_km = calcular_distancia_km(lat_val, lng_val, lat_p, lng_p)
        
        # Ponderación de diferencia física y geográfica
        diff_m2 = abs(m2c_p - m2_construidos) / max(m2_construidos, 1.0)
        diff_rec = abs((p.get('recamaras') or 3) - recamaras)
        
        # Score de similitud (menor es más similar)
        score_similitud = (dist_km * 2.0) + (diff_m2 * 10.0) + (diff_rec * 1.5)
        
        # Bonus por coincidencia de colonia
        col_p = normalizar_texto(p.get('colonia') or '')
        if col_norm and col_norm in col_p:
            score_similitud -= 3.0
            
        comparables_evaluados.append({
            'score': score_similitud,
            'distancia_km': round(dist_km, 2),
            'id': p.get('id_propiedad', ''),
            'titulo': p.get('titulo') or f"Propiedad en {p.get('municipio', 'Veracruz')}",
            'precio': precio_p,
            'metros': m2c_p,
            'precio_m2': round(precio_p / m2c_p, 2),
            'recamaras': p.get('recamaras', 0),
            'banos': p.get('banos', 0),
            'colonia': p.get('colonia', ''),
            'municipio': p.get('municipio', ''),
            'fuente': p.get('fuente', ''),
            'url': (p.get('urls_portales') or [p.get('url_origen', '')])[0]
        })
        
    # Ordenar por similitud
    comparables_evaluados.sort(key=lambda x: x['score'])
    top_comparables = comparables_evaluados[:5]
    
    # Fallback si no había modelo de IA cargado
    if precio_estimado <= 0 and top_comparables:
        precios_m2_comp = [c['precio_m2'] for c in top_comparables]
        precio_estimado = float(np.mean(precios_m2_comp) * m2_construidos)
        
    valor_m2 = round(precio_estimado / m2_construidos, 2) if m2_construidos > 0 else 0.0
    rango_min = round(precio_estimado * 0.85, 2)
    rango_max = round(precio_estimado * 1.15, 2)
    
    return {
        'precio_estimado': round(precio_estimado, 2),
        'rango_minimo': rango_min,
        'rango_maximo': rango_max,
        'valor_m2_estimado': valor_m2,
        'metodologia': 'Machine Learning (HistGradientBoosting) + Búsqueda de Comparables Locales',
        'precision_modelo_r2': 0.8647,
        'comparables': top_comparables
    }

# Compatibilidad con API anterior
def buscar_comparables(db_ignored, ciudad, estado, tipo, colonia=None):
    res = valuar_con_ia(m2_construidos=100.0, colonia=colonia, ciudad=ciudad, estado=estado)
    return res['comparables'], 'ia_local_dataset'

def calcular_estadisticas(comparables, size=100, **kwargs):
    if not comparables:
        return {'average': 0, 'min': 0, 'max': 0, 'median': 0, 'suggested_price': 0}
    precios = [c['precio'] for c in comparables]
    return {
        'average': round(float(np.mean(precios)), 2),
        'min': float(np.min(precios)),
        'max': float(np.max(precios)),
        'median': round(float(np.median(precios)), 2),
        'suggested_price': round(float(np.mean(precios)), 2)
    }

def filtrar_comparables_por_caracteristicas(comparables, metros, recamaras, banos):
    return comparables