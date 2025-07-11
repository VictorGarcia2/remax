from firebase_admin import firestore
from typing import List, Dict, Any
import numpy as np
import unidecode
from rapidfuzz import process
import re

def normalizar_texto(texto):
    if not texto:
        return ""
    texto = unidecode.unidecode(texto.lower())
    texto = re.sub(r'fracc\.?|colonia|col\.?|fraccionamiento|barrio|cp|c\.p\.', '', texto)
    texto = re.sub(r'[^a-z0-9 ]', '', texto)
    texto = re.sub(r'\s+', ' ', texto).strip()
    return texto

def mejor_coincidencia(valor, lista_opciones):
    valor_norm = normalizar_texto(valor)
    opciones_norm = [normalizar_texto(x) for x in lista_opciones]
    resultado = process.extractOne(valor_norm, opciones_norm, score_cutoff=80)
    if resultado:
        idx = opciones_norm.index(resultado[0])
        return lista_opciones[idx]
    return None

def buscar_comparables(db, ciudad, estado, tipo, colonia=None):
    print(f"[DEBUG] Entrando a buscar_comparables con colonia='{colonia}', ciudad='{ciudad}', estado='{estado}', tipo='{tipo}'")
    propiedades_ref = db.collection('propiedades')
    comparables = []
    nivel = ''
    colonia_norm = normalizar_texto(colonia)
    ciudad_norm = normalizar_texto(ciudad)
    estado_norm = normalizar_texto(estado)
    tipo_norm = normalizar_texto(tipo)

    def filtrar_outliers(lista):
        return [c for c in lista if c.get('precio') and c.get('metros') and c['metros'] > 0 and 5000 <= c['precio']/c['metros'] <= 100000]

    # 1. Coincidencia exacta
    if colonia_norm and ciudad_norm and estado_norm:
        docs = propiedades_ref.where('colonia', '==', colonia_norm).where('ciudad', '==', ciudad_norm).where('estado', '==', estado_norm).where('tipo', '==', tipo_norm).stream()
        comparables = filtrar_outliers([doc.to_dict() for doc in docs])
        print(f"[DEBUG] colonia+ciudad+estado+tipo: {colonia_norm}, {ciudad_norm}, {estado_norm}, {tipo_norm} -> {len(comparables)} encontrados")
        if comparables:
            nivel = 'colonia+ciudad+estado+tipo'
            precios_m2 = [c['precio']/c['metros'] for c in comparables]
            print(f"[DEBUG] Precios por m2 (colonia+ciudad+estado+tipo): {precios_m2}")
            return comparables, nivel
    # 2. Coincidencia difusa de colonia
    if ciudad_norm and estado_norm and colonia_norm:
        docs = propiedades_ref.where('ciudad', '==', ciudad_norm).where('estado', '==', estado_norm).where('tipo', '==', tipo_norm).stream()
        propiedades = [doc.to_dict() for doc in docs]
        colonias_bd = list(set([normalizar_texto(p.get('colonia', '')) for p in propiedades]))
        print(f"[DEBUG] Colonias en BD (normalizadas): {colonias_bd}")
        mejor_col = mejor_coincidencia(colonia, colonias_bd)
        print(f"[DEBUG] Mejor coincidencia difusa para colonia: {mejor_col}")
        if mejor_col:
            comparables = filtrar_outliers([p for p in propiedades if normalizar_texto(p.get('colonia', '')) == normalizar_texto(mejor_col)])
            print(f"[DEBUG] colonia_fuzzy+ciudad+estado+tipo: {mejor_col}, {ciudad_norm}, {estado_norm}, {tipo_norm} -> {len(comparables)} encontrados")
            if comparables:
                nivel = 'colonia_fuzzy+ciudad+estado+tipo'
                precios_m2 = [c['precio']/c['metros'] for c in comparables]
                print(f"[DEBUG] Precios por m2 (colonia_fuzzy+ciudad+estado+tipo): {precios_m2}")
                return comparables, nivel
    # 3. ciudad+estado+tipo
    if ciudad_norm and estado_norm:
        docs = propiedades_ref.where('ciudad', '==', ciudad_norm).where('estado', '==', estado_norm).where('tipo', '==', tipo_norm).stream()
        comparables = filtrar_outliers([doc.to_dict() for doc in docs])
        print(f"[DEBUG] ciudad+estado+tipo: {ciudad_norm}, {estado_norm}, {tipo_norm} -> {len(comparables)} encontrados")
        if comparables:
            nivel = 'ciudad+estado+tipo'
            precios_m2 = [c['precio']/c['metros'] for c in comparables]
            print(f"[DEBUG] Precios por m2 (ciudad+estado+tipo): {precios_m2}")
            return comparables, nivel
    # 4. estado+tipo
    if estado_norm:
        docs = propiedades_ref.where('estado', '==', estado_norm).where('tipo', '==', tipo_norm).stream()
        comparables = filtrar_outliers([doc.to_dict() for doc in docs])
        print(f"[DEBUG] estado+tipo: {estado_norm}, {tipo_norm} -> {len(comparables)} encontrados")
        if comparables:
            nivel = 'estado+tipo'
            precios_m2 = [c['precio']/c['metros'] for c in comparables]
            print(f"[DEBUG] Precios por m2 (estado+tipo): {precios_m2}")
            return comparables, nivel
    # 5. solo tipo
    docs = propiedades_ref.where('tipo', '==', tipo_norm).stream()
    comparables = filtrar_outliers([doc.to_dict() for doc in docs])
    print(f"[DEBUG] solo tipo: {tipo_norm} -> {len(comparables)} encontrados")
    if comparables:
        nivel = 'tipo'
        precios_m2 = [c['precio']/c['metros'] for c in comparables]
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

if __name__ == "__main__":
    import firebase_admin
    from firebase_admin import credentials, firestore

    # Inicializa Firebase
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    # Parámetros de outlier
    MIN_M2 = 5000
    MAX_M2 = 100000

    print("Buscando outliers en la colección 'propiedades'...")
    propiedades_ref = db.collection("propiedades")
    docs = propiedades_ref.stream()
    outliers = []
    for doc in docs:
        data = doc.to_dict()
        precio = data.get("precio")
        metros = data.get("metros")
        direccion = data.get("direccion", "")
        if not precio or not metros or metros == 0:
            continue
        precio_m2 = precio / metros
        if precio_m2 < MIN_M2 or precio_m2 > MAX_M2:
            outliers.append({
                "id": doc.id,
                "precio": precio,
                "metros": metros,
                "precio_m2": precio_m2,
                "direccion": direccion
            })
    print(f"Se encontraron {len(outliers)} outliers:")
    for o in outliers:
        print(f"ID: {o['id']} | Precio: {o['precio']} | Metros: {o['metros']} | Precio/m²: {o['precio_m2']:.2f} | Dirección: {o['direccion']}") 