import json
import time
import urllib.request
import urllib.parse
import os
import math

DB_FILE = 'inmuebles24_veracruz_casas.json'
CACHE_FILE = 'ubicaciones_coords.json'
HTML_FILE = 'mapa_propiedades.html'

def load_data():
    path = DB_FILE
    if not os.path.exists(path):
        alt = os.path.join("..", "inmuebles24", path)
        if os.path.exists(alt):
            path = alt
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

def geocode(location_name):
    # Prepare query, ensuring it targets Veracruz, Mexico
    query = f"{location_name}, Veracruz, Mexico"
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1"
    
    req = urllib.request.Request(
        url, 
        data=None, 
        headers={
            'User-Agent': 'Inmuebles24ScraperBot/1.0 (contact: your@email.com)'
        }
    )
    
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        if data and len(data) > 0:
            return {
                "lat": float(data[0]['lat']),
                "lng": float(data[0]['lon']),
                "display_name": data[0]['display_name']
            }
    except Exception as e:
        print(f"Error geocoding {location_name}: {e}")
    return None

def main():
    print("Cargando datos de propiedades...")
    data = load_data()
    listings = data.get('listings', {})
    
    print(f"Total propiedades cargadas: {len(listings)}")
    
    # Agrupar propiedades por ubicación
    locations_dict = {}
    for url, prop in listings.items():
        ubicacion = prop.get('data', {}).get('ubicacion', 'Desconocida')
        if not ubicacion:
            ubicacion = 'Desconocida'
            
        if ubicacion not in locations_dict:
            locations_dict[ubicacion] = {
                "count": 0,
                "prices": [],
                "properties": []
            }
        
        locations_dict[ubicacion]["count"] += 1
        precio_val = prop.get('data', {}).get('precio_valor')
        if precio_val and precio_val > 0:
            locations_dict[ubicacion]["prices"].append(precio_val)
            
        locations_dict[ubicacion]["properties"].append({
            "url": url,
            "title": prop.get('data', {}).get('direccion', ''),
            "price": prop.get('data', {}).get('precio', ''),
            "rooms": prop.get('data', {}).get('recamaras', 0)
        })

    print(f"Ubicaciones únicas encontradas: {len(locations_dict)}")
    
    cache = load_cache()
    
    # Geocodificar las que faltan
    missing = [loc for loc in locations_dict.keys() if loc not in cache and loc != 'Desconocida']
    print(f"Ubicaciones a geocodificar con Nominatim: {len(missing)}")
    
    for i, loc in enumerate(missing):
        print(f"[{i+1}/{len(missing)}] Geocodificando: {loc}")
        coords = geocode(loc)
        if coords:
            cache[loc] = coords
        else:
            # Fallback trying without 'Veracruz' if it has it
            cache[loc] = {"error": "Not found"}
            
        save_cache(cache)
        time.sleep(1.2) # Respetar límite de Nominatim (1 req/sec)
        
    # Preparar datos para el mapa
    map_data = []
    for loc, info in locations_dict.items():
        if loc in cache and "lat" in cache[loc]:
            avg_price = sum(info["prices"]) / len(info["prices"]) if info["prices"] else 0
            
            map_data.append({
                "ubicacion": loc,
                "lat": cache[loc]["lat"],
                "lng": cache[loc]["lng"],
                "count": info["count"],
                "avg_price": avg_price,
                # Tomar muestra de hasta 3 propiedades para mostrar en el popup
                "sample_props": info["properties"][:3]
            })

    print("Generando archivo HTML...")
    
    # Construir HTML
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa de Propiedades Inmuebles24 - Veracruz</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    
    <style>
        :root {{
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-color: #1e293b;
            --accent: #2563eb;
            --accent-hover: #1d4ed8;
            --success: #10b981;
        }}
        
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            flex-direction: column;
            height: 100vh;
        }}
        
        header {{
            background: linear-gradient(135deg, #ffffff, #f1f5f9);
            color: #1e293b;
            padding: 1rem 2rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            z-index: 1000;
        }}
        
        h1 {{
            margin: 0;
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.5px;
        }}
        
        .subtitle {{
            font-size: 0.9rem;
            color: #64748b;
            margin-top: 4px;
        }}
        
        #map {{
            flex-grow: 1;
            width: 100%;
        }}
        
        /* Estilos para el Popup de Leaflet en modo claro */
        .leaflet-popup-content-wrapper {{
            background-color: var(--card-bg);
            color: var(--text-color);
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
            border: 1px solid #e2e8f0;
        }}
        .leaflet-popup-tip {{
            background-color: var(--card-bg);
        }}
        .leaflet-popup-close-button {{
            color: #64748b !important;
        }}
        
        .popup-content h3 {{
            margin: 0 0 10px 0;
            color: var(--accent);
            font-size: 1.1rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
        }}
        
        .stat-row {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }}
        
        .stat-value {{
            font-weight: bold;
            color: var(--success);
        }}
        
        .prop-list {{
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e1;
        }}
        
        .prop-item {{
            margin-bottom: 8px;
            font-size: 0.85rem;
            background: #f8fafc;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }}
        
        .prop-item a {{
            color: var(--accent);
            text-decoration: none;
            font-weight: 600;
        }}
        .prop-item a:hover {{
            text-decoration: underline;
            color: var(--accent-hover);
        }}
        
        .custom-marker {{
            background: rgba(59, 130, 246, 0.8);
            border: 2px solid white;
            border-radius: 50%;
            color: white;
            font-weight: bold;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }}
    </style>
</head>
<body>
    <header>
        <h1>Inmuebles24 - Mapa de Propiedades</h1>
        <div class="subtitle">Veracruz y alrededores | Mostrando agrupaciones por colonia</div>
    </header>
    
    <div id="map"></div>

    <script>
        const mapData = {json.dumps(map_data)};
        
        // Inicializar mapa centrado en Veracruz
        const map = L.map('map').setView([19.1738, -96.1342], 12);
        
        // Capa clara de CartoDB
        L.tileLayer('https://{{s}}.basemaps.cartocdn.com/light_all/{{z}}/{{x}}/{{y}}{{r}}.png', {{
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }}).addTo(map);

        // Formateador de moneda
        const formatter = new Intl.NumberFormat('es-MX', {{
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
        }});

        // Agregar marcadores
        mapData.forEach(loc => {{
            if(loc.lat && loc.lng) {{
                // Crear un icono que muestra la cantidad de propiedades
                const size = Math.min(Math.max(loc.count * 1.5 + 20, 30), 60); // Tamaño dinámico
                const icon = L.divIcon({{
                    className: 'custom-marker',
                    html: `<div>${{loc.count}}</div>`,
                    iconSize: [size, size]
                }});

                let sampleHtml = '';
                loc.sample_props.forEach(p => {{
                    sampleHtml += `
                        <div class="prop-item">
                            <a href="${{p.url}}" target="_blank">${{p.title || 'Propiedad'}}</a><br>
                            ${{p.price}} | ${{p.rooms}} rec.
                        </div>
                    `;
                }});

                const popupContent = `
                    <div class="popup-content">
                        <h3>${{loc.ubicacion}}</h3>
                        <div class="stat-row">
                            <span>Propiedades:</span>
                            <span class="stat-value">${{loc.count}}</span>
                        </div>
                        <div class="stat-row">
                            <span>Precio Promedio:</span>
                            <span class="stat-value">${{loc.avg_price > 0 ? formatter.format(loc.avg_price) : 'N/D'}}</span>
                        </div>
                        <div class="prop-list">
                            <div style="font-size:0.8rem;color:#aaa;margin-bottom:5px;">Muestra:</div>
                            ${{sampleHtml}}
                            ${{loc.count > 3 ? `<div style="text-align:center;font-size:0.8rem;margin-top:5px;color:#888;">y ${{loc.count - 3}} más...</div>` : ''}}
                        </div>
                    </div>
                `;

                L.marker([loc.lat, loc.lng], {{icon: icon}})
                    .bindPopup(popupContent, {{maxWidth: 300, minWidth: 250}})
                    .addTo(map);
            }}
        }});
        
        // Ajustar la vista para mostrar todos los marcadores si hay datos
        if(mapData.length > 0) {{
            const bounds = L.latLngBounds(mapData.map(l => [l.lat, l.lng]));
            map.fitBounds(bounds, {{padding: [50, 50]}});
        }}
    </script>
</body>
</html>
"""

    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"Mapa generado con éxito en: {HTML_FILE}")

if __name__ == "__main__":
    main()
