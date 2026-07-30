import requests
import json
import time
import re
import sys
import os

# Configuración
INEGI_TOKEN = "c88a6044-6526-44b4-bcc3-471732ce3c6f"
RADIO_BUSQUEDA = 1000 # 1km

def buscar_denue(palabra_clave, lat, lng):
    """
    Busca negocios en el DENUE por palabra clave y coordenadas.
    Retorna la cantidad de negocios encontrados.
    """
    url = f"https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/{palabra_clave}/{lat},{lng}/{RADIO_BUSQUEDA}/{INEGI_TOKEN}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            datos = response.json()
            return len(datos)
        else:
            return 0
    except Exception:
        return 0

def obtener_multiplicador_shf(ubicacion, estado_fallback="tabasco"):
    """
    Lee el archivo de multiplicadores generados a partir de los datos de SHF.
    Busca coincidencias inteligentes con la cadena de ubicación.
    """
    try:
        with open('shf_multiplicadores.json', 'r', encoding='utf-8') as f:
            datos = json.load(f)
            
        ubi_lower = ubicacion.lower()
        
        # Mapeos de ciudades conocidas a sus municipios oficiales del INEGI/SHF
        city_map = {
            "villahermosa": "centro",
            "boca del río": "boca del río",
            "veracruz": "veracruz",
            "nacajuca": "nacajuca"
        }
        for city, mun_key in city_map.items():
            if city in ubi_lower and mun_key in datos:
                return datos[mun_key]['cagr_anual'], datos[mun_key]['nombre']

        # Búsqueda por palabras individuales
        palabras = re.findall(r'\w+', ubi_lower)
        for palabra in palabras:
            if palabra in datos:
                return datos[palabra]['cagr_anual'], datos[palabra]['nombre']
                
        # Búsqueda parcial de claves
        for key, val in datos.items():
            if key in ubi_lower or ubi_lower in key:
                return val['cagr_anual'], val['nombre']
                
        # Fallback al estado general
        if estado_fallback in datos:
            return datos[estado_fallback]['cagr_anual'], datos[estado_fallback]['nombre']
            
        return 0.05, "Promedio Nacional"
    except FileNotFoundError:
        return 0.05, "Promedio Nacional (Sin archivo)"

def evaluar_propiedad(propiedad, estado_fallback="tabasco"):
    print(f"\n" + "="*60)
    print(f"[PROPIEDAD]: {propiedad.get('direccion', 'S/D')} ({propiedad.get('ubicacion', 'S/U')})")
    print(f"URL: {propiedad.get('url', '')}")
    print("="*60)
    
    precio_base = propiedad.get('precio_valor', 0)
    print(f"💰 Precio Base de Mercado: ${precio_base:,.2f} {propiedad.get('precio_moneda', 'MXN')}")
    
    lat = propiedad.get('lat')
    lng = propiedad.get('lng')
    
    if not lat or not lng:
        print("❌ Error: Esta propiedad no tiene latitud o longitud guardada en el JSON.")
        return None
        
    print(f"📍 Coordenadas exactas: {lat}, {lng}")
    
    # 1. Componente Macro (SHF)
    cagr_shf, zona_shf = obtener_multiplicador_shf(propiedad.get('ubicacion', ''), estado_fallback)
    print(f"\n📊 [Macro] Índice SHF para '{zona_shf}': {cagr_shf:.2%} anual (Plusvalía base)")
    
    # 2. Componente Micro (Gentrificación DENUE)
    print(f"🔍 [Micro] Consultando DENUE (Radio 1km) buscando negocios ancla...")
    
    cafeterias = buscar_denue("cafeteria", lat, lng)
    time.sleep(1) # Respetar rate-limit de INEGI
    gimnasios = buscar_denue("gimnasio", lat, lng)
    time.sleep(1)
    plazas = buscar_denue("comercial", lat, lng)
    
    total_anclas = cafeterias + gimnasios + plazas
    print(f"  - Cafeterias/Restaurantes: {cafeterias}")
    print(f"  - Gimnasios/Deportivos: {gimnasios}")
    print(f"  - Centros Comerciales/Plazas: {plazas}")
    
    # Cada ancla suma 0.4% de plusvalía micro (Máximo cap de 15%)
    prima_micro = min(0.15, total_anclas * 0.004)
    print(f"[Micro] Prima por gentrificacion estimada: +{prima_micro:.2%}")
    
    # 3. Cálculo de Valor Futuro
    tasa_total = cagr_shf + prima_micro
    valor_estimado = precio_base * (1 + tasa_total)
    ganancia_estimada = valor_estimado - precio_base
    
    print("\n" + "-"*60)
    print(f"--> PROYECCION DE VALOR A 1 ANIO: ${valor_estimado:,.2f} MXN")
    print(f"    Apreciacion Total Esperada: {tasa_total:.2%} (+${ganancia_estimada:,.2f} MXN)")
    print("-"*60)
    
    return {
        "precio_actual": precio_base,
        "valor_1_anio": valor_estimado,
        "tasa_apreciacion": tasa_total,
        "anclas_denue": total_anclas
    }

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
        
    archivo_json = 'inmuebles24_tabasco_casas.json'
    if len(sys.argv) > 1:
        archivo_json = sys.argv[1]
        
    # Validar si el archivo no existe en la ruta actual, intentar en ../inmuebles24/
    if not os.path.exists(archivo_json):
        alt_path = os.path.join("..", "inmuebles24", archivo_json)
        if os.path.exists(alt_path):
            archivo_json = alt_path
            
    print(f"Cargando base de datos: {archivo_json}")
    try:
        with open(archivo_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error cargando archivo {archivo_json}: {e}")
        return
        
    listings = data.get('listings', {})
    
    # Encontrar propiedades con coordenadas válidas
    propiedades_con_coordenadas = []
    for url, prop in listings.items():
        d = prop.get('data', {})
        if d.get('lat') is not None and d.get('lng') is not None:
            d_copy = d.copy()
            d_copy['url'] = url
            propiedades_con_coordenadas.append(d_copy)
            
    print(f"Se encontraron {len(propiedades_con_coordenadas)} propiedades con coordenadas guardadas.")
    
    if not propiedades_con_coordenadas:
        print("No hay propiedades con lat/lng para evaluar en este archivo.")
        return
        
    # Evaluamos las primeras 3 de demostración
    print("\nIniciando valuación de las primeras 3 propiedades de muestra:")
    for prop in propiedades_con_coordenadas[:3]:
        evaluar_propiedad(prop, estado_fallback="tabasco" if "tabasco" in archivo_json else "veracruz")
        time.sleep(2)

if __name__ == '__main__':
    main()
