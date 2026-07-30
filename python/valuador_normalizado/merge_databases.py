import json
import datetime

import json
import datetime
import os

# Archivos a combinar
archivos = {
    'Inmuebles24': 'inmuebles24_veracruz_casas_normalizado.json',
    'Propiedades.com': 'propiedades_veracruz_casas_normalizado.json',
    'Lamudi': 'lamudi_veracruz_casas_normalizado.json',
    'Remax': 'remax_veracruz_casas_normalizado.json',
    'Vivanuncios': 'vivanuncios_veracruz_casas_normalizado.json'
}

todas = []
metadata_fuentes = {}
fuentes_activas = []

for fuente, archivo in archivos.items():
    if os.path.exists(archivo):
        try:
            with open(archivo, 'r', encoding='utf-8') as f:
                data = json.load(f)
            props = data.get('propiedades', [])
            todas += props
            metadata_fuentes[f'registros_{fuente.lower().replace(".", "_")}'] = len(props)
            fuentes_activas.append(fuente)
            print(f"{fuente}: {len(props)} registros cargados")
        except Exception as e:
            print(f"Error al cargar {fuente} ({archivo}): {e}")
    else:
        print(f"Aviso: {archivo} no encontrado. Omitiendo fuente {fuente}.")

# Deduplicación física inteligente
print("\nIniciando deduplicación física de propiedades...")
unicas = {}
for p in todas:
    precio = p.get('precio_valor') or 0.0
    m2c = p.get('m2_construidos') or 0.0
    m2t = p.get('m2_totales') or 0.0
    rec = p.get('recamaras') or 0
    ban = p.get('banos') or 0
    
    lat = p.get('latitud')
    lng = p.get('longitud')
    lat_r = round(lat, 3) if lat is not None else 0.0
    lng_r = round(lng, 3) if lng is not None else 0.0
    
    key = (precio, m2c, m2t, rec, ban, lat_r, lng_r)
    
    if key not in unicas:
        unicas[key] = p.copy()
        unicas[key]['urls_portales'] = [p['url_origen']]
    else:
        if p['url_origen'] not in unicas[key]['urls_portales']:
            unicas[key]['urls_portales'].append(p['url_origen'])
        
        desc_existing = unicas[key].get('descripcion', '') or ''
        desc_new = p.get('descripcion', '') or ''
        if len(desc_new) > len(desc_existing) and "sin descripcion" not in desc_new.lower():
            unicas[key]['descripcion'] = p['descripcion']
            
        amen_existing = unicas[key].get('amenidades', '') or ''
        amen_new = p.get('amenidades', '') or ''
        if len(amen_new) > len(amen_existing):
            unicas[key]['amenidades'] = p['amenidades']
            
        if unicas[key].get('antiguedad_anos') is None and p.get('antiguedad_anos') is not None:
            unicas[key]['antiguedad_anos'] = p['antiguedad_anos']

propiedades_deduplicadas = list(unicas.values())
print(f"Reducción por deduplicación: {len(todas)} -> {len(propiedades_deduplicadas)} propiedades únicas.")

# Contar validos
validos = sum(1 for p in propiedades_deduplicadas if p.get('es_valido_para_valuacion'))

# Crear archivo combinado
combinado = {
    'metadata': {
        'generado_en': datetime.datetime.now().isoformat(),
        'fuentes': fuentes_activas,
        **metadata_fuentes,
        'total_registros': len(propiedades_deduplicadas),
        'registros_validos_para_valuacion': validos,
        'registros_originales_totales': len(todas)
    },
    'propiedades': propiedades_deduplicadas
}

# Guardar
with open('veracruz_casas_combinado.json', 'w', encoding='utf-8') as f:
    json.dump(combinado, f, ensure_ascii=False, indent=2)

print(f"\nTotal combinado único: {len(propiedades_deduplicadas)} registros")
print(f"Válidos para valuación: {validos}")
print("Archivo guardado: veracruz_casas_combinado.json")
