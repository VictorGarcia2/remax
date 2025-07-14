import pandas as pd
import requests
import time

API_KEY = "AIzaSyDoBmSoAPraNNjNS2NQAu-Vs85trnJuJVI"  # Reemplaza con tu API Key de Google

def geocode_address(address, api_key):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": api_key, "region": "mx"}
    response = requests.get(url, params=params)
    data = response.json()
    if data['status'] == 'OK':
        result = data['results'][0]
        components = result['address_components']
        lat = result['geometry']['location']['lat']
        lng = result['geometry']['location']['lng']
        municipio = ciudad = colonia = estado = ""
        for comp in components:
            if "administrative_area_level_2" in comp['types']:
                municipio = comp['long_name']
            if "locality" in comp['types']:
                ciudad = comp['long_name']
            if "sublocality" in comp['types'] or "neighborhood" in comp['types']:
                colonia = comp['long_name']
            if "administrative_area_level_1" in comp['types']:
                estado = comp['long_name']
        return municipio, ciudad, colonia, estado, lat, lng
    else:
        return "", "", "", "", "", ""

# Lee tu CSV original
df = pd.read_csv("lamudi_scraped.csv")

# Crea nuevas columnas para los datos enriquecidos
df["municipio_enriquecido"] = ""
df["ciudad_enriquecida"] = ""
df["colonia_enriquecida"] = ""
df["estado_enriquecido"] = ""
df["lat"] = ""
df["lng"] = ""

for idx, row in df.iterrows():
    direccion = row["Dirección"]
    print(f"Procesando: {direccion}")
    municipio, ciudad, colonia, estado, lat, lng = geocode_address(direccion, API_KEY)
    df.at[idx, "municipio_enriquecido"] = municipio
    df.at[idx, "ciudad_enriquecida"] = ciudad
    df.at[idx, "colonia_enriquecida"] = colonia
    df.at[idx, "estado_enriquecido"] = estado
    df.at[idx, "lat"] = lat
    df.at[idx, "lng"] = lng
    time.sleep(0.2)  # Para no exceder el límite de la API

# Guarda el nuevo CSV enriquecido
df.to_csv("lamudi_scraped_enriquecido.csv", index=False)
print("¡Listo! Archivo enriquecido guardado como lamudi_scraped_enriquecido.csv")