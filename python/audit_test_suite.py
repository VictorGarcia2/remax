import sys
import json
import time
import requests

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

API_URL = "http://127.0.0.1:8000"

print("="*60)
print("     AUDITORÍA TÉCNICA DE DIAGNÓSTICO: VALUADOR DE PROPIEDADES")
print("="*60)

test_cases = [
    {
        "nombre": "Caso 1: Entrada Estándar Residencial (Casa 180m²)",
        "payload": {
            "direccion": "Lomas del Dorado, Boca del Río, Veracruz",
            "tipo": "casa",
            "metros": 180,
            "bedrooms": 3,
            "bathrooms": 2.0,
            "colonia": "Lomas del Dorado",
            "ciudad": "Boca del Rio",
            "estado": "Veracruz"
        }
    },
    {
        "nombre": "Caso 2: Medio Baño Float (2.5 Baños)",
        "payload": {
            "direccion": "Costa de Oro, Boca del Río",
            "tipo": "casa",
            "metros": 250,
            "bedrooms": 4,
            "bathrooms": 2.5,
            "colonia": "Costa de Oro",
            "ciudad": "Boca del Rio",
            "estado": "Veracruz"
        }
    },
    {
        "nombre": "Caso 3: Metros en Cero (Metros = 0)",
        "payload": {
            "direccion": "Centro, Veracruz",
            "tipo": "casa",
            "metros": 0,
            "bedrooms": 2,
            "bathrooms": 1
        }
    },
    {
        "nombre": "Caso 4: Sin Dirección ni Colonia (Campos Nulos)",
        "payload": {
            "direccion": "",
            "tipo": "casa",
            "metros": 120
        }
    },
    {
        "nombre": "Caso 5: Inmueble Gigante (5,000 m²)",
        "payload": {
            "direccion": "Riviera Veracruzana",
            "tipo": "casa",
            "metros": 5000,
            "bedrooms": 6,
            "bathrooms": 5
        }
    },
    {
        "nombre": "Caso 6: Inmueble Micro (15 m²)",
        "payload": {
            "direccion": "Centro",
            "tipo": "departamento",
            "metros": 15,
            "bedrooms": 1,
            "bathrooms": 1
        }
    },
    {
        "nombre": "Caso 7: Colonia Desconocida o Ficticia",
        "payload": {
            "direccion": "Colonia Inexistente 99999",
            "tipo": "casa",
            "metros": 150,
            "colonia": "Colonia Ficticia 999"
        }
    },
    {
        "nombre": "Caso 8: Generación de PDF con Datos Incompletos",
        "payload": {
            "direccion": "Valle Alto, Veracruz",
            "tipo": "casa",
            "metros": 140
        },
        "endpoint": "/reporte_pdf"
    }
]

hallazgos = []

for tc in test_cases:
    endpoint = tc.get("endpoint", "/valuar")
    url = f"{API_URL}{endpoint}"
    nombre = tc["nombre"]
    payload = tc["payload"]
    
    t0 = time.time()
    try:
        r = requests.post(url, json=payload, timeout=5)
        dt = round((time.time() - t0) * 1000, 2)
        
        if r.status_code == 200:
            if endpoint == "/valuar":
                res = r.json()
                val_est = res.get("valor_estimado", 0)
                val_m2 = res.get("valor_m2", 0)
                n_comps = len(res.get("comparables", []))
                print(f"[OK] {nombre} ({dt}ms) -> Valor Est: ${val_est:,.0f} | $/m²: ${val_m2:,.0f} | Comps: {n_comps}")
                
                # Check anomaly
                if val_est <= 0:
                    hallazgos.append(f"ADVERTENCIA: {nombre} devolvió valor estimado $0.")
            else:
                bytes_pdf = len(r.content)
                print(f"[OK] {nombre} ({dt}ms) -> PDF Generado: {bytes_pdf:,} bytes")
        else:
            print(f"[FAIL {r.status_code}] {nombre} ({dt}ms) -> Resp: {r.text[:100]}")
            hallazgos.append(f"ERROR HTTP {r.status_code} en {nombre}: {r.text[:150]}")
    except Exception as e:
        print(f"[ERROR] {nombre} -> {e}")
        hallazgos.append(f"EXCEPCIÓN en {nombre}: {str(e)}")

print("\n"+"="*60)
print("                RESUMEN DE HALLAZGOS Y ERRORES")
print("="*60)
if not hallazgos:
    print("✅ No se detectaron fallos críticos durante las pruebas iniciales.")
else:
    for h in hallazgos:
        print(f"• {h}")
print("="*60)
