"""
Validador del Modelo v2 - Precio/m2 Zonal + KNN Local
"""
import json
import math
import random
import sys
import os

def cargar_dataset(archivos):
    dataset = []
    for archivo in archivos:
        try:
            if not os.path.exists(archivo):
                alt = os.path.join("..", "inmuebles24", archivo)
                if os.path.exists(alt):
                    archivo = alt
            with open(archivo, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for url, prop in data.get('listings', {}).items():
                item = prop.get('data', {})
                if item.get('precio_valor') and item.get('m2_totales'):
                    m2c = item.get('m2_construidos') or item.get('m2_totales', 1)
                    if m2c and m2c > 0:
                        dataset.append({
                            'url': url,
                            'precio': item['precio_valor'],
                            'm2_totales': item.get('m2_totales', 0),
                            'm2_construidos': m2c,
                            'recamaras': item.get('recamaras', 0),
                            'banos': item.get('banos', 0),
                            'ubicacion': item.get('ubicacion', ''),
                            'lat': item.get('lat'),
                            'lng': item.get('lng'),
                            'precioM2': item['precio_valor'] / m2c
                        })
        except Exception as e:
            print(f"Error cargando {archivo}: {e}")
    return dataset

def percentile(arr, p):
    s = sorted(arr)
    idx = max(0, math.ceil(p / 100 * len(s)) - 1)
    return s[idx]

def predecir_v2(target, dataset_sin_target):
    ds = dataset_sin_target
    if len(ds) < 3:
        return None

    # Calcular precio/m2 mediano de la zona del target
    misma_zona = [d for d in ds if d['ubicacion'] == target['ubicacion'] and d['precioM2'] > 0]

    # Filtrar outliers en la zona
    if len(misma_zona) >= 5:
        pm2s = [d['precioM2'] for d in misma_zona]
        p10 = percentile(pm2s, 10)
        p90 = percentile(pm2s, 90)
        misma_zona = [d for d in misma_zona if p10 <= d['precioM2'] <= p90]

    if len(misma_zona) >= 3:
        # Usar precio/m2 mediano de la zona
        pm2_sorted = sorted([d['precioM2'] for d in misma_zona])
        medianPM2 = pm2_sorted[len(pm2_sorted) // 2]
        precio_base_zonal = medianPM2 * target['m2_construidos']
        candidatos = misma_zona
    else:
        # Fallback: todo el dataset
        all_pm2 = sorted([d['precioM2'] for d in ds if d['precioM2'] > 0])
        medianPM2 = all_pm2[len(all_pm2) // 2] if all_pm2 else 15000
        precio_base_zonal = medianPM2 * target['m2_construidos']
        candidatos = ds

    # KNN sobre candidatos
    maxM2T = max(d['m2_totales'] for d in candidatos) or 1
    maxM2C = max(d['m2_construidos'] for d in candidatos) or 1
    maxRec = max(d['recamaras'] for d in candidatos) or 1
    maxBan = max(d['banos'] for d in candidatos) or 1

    distancias = []
    for item in candidatos:
        penalty = 0
        if item['ubicacion'] != target['ubicacion']:
            penalty = 5.0

        dist = math.sqrt(
            ((item['m2_totales'] - target['m2_totales']) / maxM2T) ** 2 +
            ((item['m2_construidos'] - target['m2_construidos']) / maxM2C) ** 2 +
            ((item['recamaras'] - target['recamaras']) / maxRec) ** 2 +
            ((item['banos'] - target['banos']) / maxBan) ** 2
        ) + penalty
        distancias.append((item, dist))

    distancias.sort(key=lambda x: x[1])
    testigos = distancias[:5]

    # Precio por testigos (usando precio/m2 de cada testigo)
    sum_w, sum_p = 0, 0
    for t, d in testigos:
        w = 1 / (d + 0.01)
        precio_ajustado = t['precioM2'] * target['m2_construidos']
        sum_p += precio_ajustado * w
        sum_w += w

    precio_testigos = sum_p / sum_w if sum_w > 0 else precio_base_zonal

    # Combinar: 70% testigos, 30% zonal (si hay testigos locales)
    testigos_locales = sum(1 for t, _ in testigos if t['ubicacion'] == target['ubicacion'])
    peso_t = 0.7 if testigos_locales >= 3 else 0.5 if testigos_locales >= 1 else 0.3

    precio_final = (precio_testigos * peso_t) + (precio_base_zonal * (1 - peso_t))

    # Antigüedad neutral (x1.0) para validacion justa
    return round(precio_final / 10000) * 10000

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

    archivos = ['inmuebles24_veracruz_casas.json', 'inmuebles24_tabasco_casas.json']
    print("Cargando datasets...")
    dataset = cargar_dataset(archivos)
    print(f"Total propiedades: {len(dataset)}")

    N = min(100, len(dataset) // 5)
    random.seed(42)
    test_indices = random.sample(range(len(dataset)), N)

    errores_pct = []
    predichos = []
    reales = []

    print(f"\nValidando {N} propiedades (Leave-One-Out)...\n")
    print(f"{'#':<4} {'Real':>14} {'Predicho':>14} {'Err%':>8} {'St'} {'Zona'}")
    print("-" * 85)

    for i, idx in enumerate(test_indices):
        target = dataset[idx]
        ds_sin = [d for j, d in enumerate(dataset) if j != idx]
        pred = predecir_v2(target, ds_sin)
        if not pred or pred == 0:
            continue

        real = target['precio']
        err = abs(pred - real) / real * 100
        errores_pct.append(err)
        predichos.append(pred)
        reales.append(real)

        st = "OK" if err < 15 else "!!" if err < 25 else "XX"
        zona = target['ubicacion'][:30] if target['ubicacion'] else 'N/A'
        print(f"{i+1:<4} ${real:>12,.0f} ${pred:>12,.0f} {err:>7.1f}% [{st}] {zona}")

    if not errores_pct:
        print("No se pudo validar.")
        return

    mape = sum(errores_pct) / len(errores_pct)
    mediana = sorted(errores_pct)[len(errores_pct) // 2]
    mae = sum(abs(r - p) for r, p in zip(reales, predichos)) / len(reales)
    mean_r = sum(reales) / len(reales)
    ss_res = sum((r - p) ** 2 for r, p in zip(reales, predichos))
    ss_tot = sum((r - mean_r) ** 2 for r in reales)
    r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    d15 = sum(1 for e in errores_pct if e < 15) / len(errores_pct) * 100
    d25 = sum(1 for e in errores_pct if e < 25) / len(errores_pct) * 100

    print("\n" + "=" * 85)
    print("RESULTADOS v2 (Precio/m2 Zonal + KNN Local)")
    print("=" * 85)
    print(f"  Evaluadas:        {len(errores_pct)}")
    print(f"  MAPE:             {mape:.1f}%")
    print(f"  Mediana Error:    {mediana:.1f}%")
    print(f"  MAE:              ${mae:,.0f} MXN")
    print(f"  R-squared:        {r2:.4f}")
    print(f"  Error < 15%:      {d15:.0f}%")
    print(f"  Error < 25%:      {d25:.0f}%")
    print("=" * 85)

    if mape < 10: print("  EXCELENTE: Precision de perito profesional.")
    elif mape < 15: print("  MUY BUENO: Confiable para estimaciones comerciales.")
    elif mape < 25: print("  ACEPTABLE: Util como referencia rapida.")
    elif mape < 40: print("  REGULAR: Necesita mas datos o features.")
    else: print("  BAJO: Necesita revision.")

if __name__ == '__main__':
    main()
