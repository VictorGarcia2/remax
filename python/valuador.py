from firebase_admin import firestore
from typing import List, Dict, Any
import numpy as np

def buscar_comparables(db, ciudad, estado, tipo, colonia=None):
    print(f"[DEBUG] Entrando a buscar_comparables con colonia='{colonia}', ciudad='{ciudad}', estado='{estado}', tipo='{tipo}'")
    propiedades_ref = db.collection('propiedades')
    comparables = []
    nivel = ''

    # 0. colonia+ciudad+estado+tipo
    if colonia and ciudad and estado:
        docs = propiedades_ref.where('colonia', '==', colonia).where('ciudad', '==', ciudad).where('estado', '==', estado).where('tipo', '==', tipo).stream()
        comparables = [doc.to_dict() for doc in docs]
        print(f"[DEBUG] colonia+ciudad+estado+tipo: {colonia}, {ciudad}, {estado}, {tipo} -> {len(comparables)} encontrados")
        if comparables:
            nivel = 'colonia+ciudad+estado+tipo'
            precios_m2 = [c['precio']/c['metros'] for c in comparables if c.get('precio') and c.get('metros') and c['metros'] > 0]
            print(f"[DEBUG] Precios por m2 (colonia+ciudad+estado+tipo): {precios_m2}")
            return comparables, nivel
    # 1. ciudad+estado+tipo
    if ciudad and estado:
        docs = propiedades_ref.where('ciudad', '==', ciudad).where('estado', '==', estado).where('tipo', '==', tipo).stream()
        comparables = [doc.to_dict() for doc in docs]
        print(f"[DEBUG] ciudad+estado+tipo: {ciudad}, {estado}, {tipo} -> {len(comparables)} encontrados")
        if comparables:
            nivel = 'ciudad+estado+tipo'
            precios_m2 = [c['precio']/c['metros'] for c in comparables if c.get('precio') and c.get('metros') and c['metros'] > 0]
            print(f"[DEBUG] Precios por m2 (ciudad+estado+tipo): {precios_m2}")
            return comparables, nivel
    # 2. estado+tipo
    if estado:
        docs = propiedades_ref.where('estado', '==', estado).where('tipo', '==', tipo).stream()
        comparables = [doc.to_dict() for doc in docs]
        print(f"[DEBUG] estado+tipo: {estado}, {tipo} -> {len(comparables)} encontrados")
        if comparables:
            nivel = 'estado+tipo'
            precios_m2 = [c['precio']/c['metros'] for c in comparables if c.get('precio') and c.get('metros') and c['metros'] > 0]
            print(f"[DEBUG] Precios por m2 (estado+tipo): {precios_m2}")
            return comparables, nivel
    # 3. solo tipo
    docs = propiedades_ref.where('tipo', '==', tipo).stream()
    comparables = [doc.to_dict() for doc in docs]
    print(f"[DEBUG] solo tipo: {tipo} -> {len(comparables)} encontrados")
    if comparables:
        nivel = 'tipo'
        precios_m2 = [c['precio']/c['metros'] for c in comparables if c.get('precio') and c.get('metros') and c['metros'] > 0]
        print(f"[DEBUG] Precios por m2 (solo tipo): {precios_m2}")
        return comparables, nivel
    print("[DEBUG] No se encontraron comparables")
    return [], ''

def calcular_estadisticas(comparables: List[Dict[str, Any]],
                        size: float = None,
                        address: str = None,
                        property_type: str = None,
                        bedrooms: int = None,
                        bathrooms: int = None,
                        age: str = None,
                        condition: str = None,
                        amenities: list = None,
                        contact_info: dict = None) -> dict:
    precios_m2 = [c['precio']/c['metros'] for c in comparables if c.get('precio') and c.get('metros') and c['metros'] > 0]
    if not precios_m2:
        return {}
    arr = np.array(precios_m2)
    promedio_m2 = float(np.mean(arr))
    mediana_m2 = float(np.median(arr))
    min_m2 = float(np.min(arr))
    max_m2 = float(np.max(arr))
    std_m2 = float(np.std(arr))
    n_comparables = len(arr)

    # Cálculo de valores estimados
    if size is not None:
        valor_estimado = promedio_m2 * size
        low = int(valor_estimado * 0.9)
        high = int(valor_estimado * 1.1)
        average = int(valor_estimado)
        value_per_m2 = int(promedio_m2)
    else:
        valor_estimado = None
        low = None
        high = None
        average = None
        value_per_m2 = None

    return {
        'low': low,
        'high': high,
        'average': average,
        'valuePerSqMeter': value_per_m2,
        'size': size,
        'address': address,
        'propertyType': property_type,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'age': age,
        'condition': condition,
        'amenities': amenities,
        'contactInfo': contact_info,
        'promedio_m2': promedio_m2,
        'mediana_m2': mediana_m2,
        'min_m2': min_m2,
        'max_m2': max_m2,
        'std_m2': std_m2,
        'n_comparables': n_comparables
    } 