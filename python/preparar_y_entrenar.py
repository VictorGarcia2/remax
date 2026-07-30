import json
import pandas as pd
import numpy as np
import pickle
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, r2_score

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

def encontrar_archivo_datos():
    rutas = [
        'valuador_normalizado/veracruz_casas_combinado.json',
        'veracruz_casas_combinado.json',
        'dataset_master.json'
    ]
    for r in rutas:
        if os.path.exists(r):
            print(f"[OK] Archivo de datos encontrado en: {r}")
            return r
            
    print("[INFO] Archivo de datos combinado no encontrado. Intentando ejecutar merge_databases.py...")
    script_merge = 'valuador_normalizado/merge_databases.py'
    if os.path.exists(script_merge):
        import subprocess
        subprocess.run([sys.executable, 'merge_databases.py'], cwd='valuador_normalizado')
        for r in rutas:
            if os.path.exists(r):
                return r
    raise FileNotFoundError("No se encontro el dataset combinado veracruz_casas_combinado.json.")

def cargar_y_preparar():
    ruta = encontrar_archivo_datos()
    with open(ruta, 'r', encoding='utf-8') as f:
        content = json.load(f)
        
    propiedades = content.get('propiedades', [])
    print(f"[INFO] Total de propiedades en dataset: {len(propiedades)}")
    
    # Reconstrucción y sanitización de direcciones y colonias incompletas
    for p in propiedades:
        dir_curr = (p.get('direccion') or '').strip()
        col = (p.get('colonia') or '').strip()
        mun = (p.get('municipio') or '').strip()
        tit = (p.get('titulo') or '').strip()
        ubi = (p.get('ubicacion') or '').strip()
        
        if not dir_curr or len(dir_curr) < 5:
            cand = ''
            if col and mun:
                cand = f"{col}, {mun}"
            elif col:
                cand = f"Col. {col}, Veracruz"
            elif ubi and len(ubi) > 5:
                cand = ubi
            elif tit and len(tit) > 5:
                cand = tit
            elif mun:
                cand = f"Zona {mun}"
            p['direccion'] = cand or "Dirección en Veracruz"

        if not p.get('titulo') or str(p.get('titulo')).strip() == '':
            tipo = (p.get('tipo_propiedad') or 'Propiedad').capitalize()
            p['titulo'] = f"{tipo} en Venta en {p.get('direccion')}"

        # Autocorrección de errores de dedo en m2 (ej. 768,710 m2 en lugar de 768.71 m2)
        m2 = p.get('m2_construidos') or 0
        precio = p.get('precio_valor') or 0
        if m2 > 3000 and precio > 500000:
            for div in (10, 100, 1000, 10000):
                cand_m2 = m2 / div
                cand_pm2 = precio / cand_m2
                if 35 <= cand_m2 <= 2000 and 4000 <= cand_pm2 <= 180000:
                    p['m2_construidos'] = cand_m2
                    p['precio_m2_construccion'] = round(cand_pm2, 2)
                    p['es_valido_para_valuacion'] = True
                    p['observacion_limpieza'] = f"Autocorregido m2 de {m2} a {cand_m2}"
                    break
            
    target_master = 'dataset_master.json'
    with open(target_master, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
    print(f"[OK] Dataset normalizado y guardado en {target_master}")

    # Deduplicación global multi-portal
    try:
        from deduplicar_dataset import ejecutar_deduplicacion_global
        ejecutar_deduplicacion_global()
        with open(target_master, 'r', encoding='utf-8') as f:
            content = json.load(f)
        propiedades = content.get('propiedades', [])
    except Exception as e:
        print(f"[DEDUP WARN] {e}")
        
    validos = [p for p in propiedades if p.get('es_valido_para_valuacion')]
    print(f"[INFO] Propiedades válidas para entrenamiento de IA: {len(validos)}")
    
    df = pd.DataFrame(validos)
    
    num_cols = ['precio_valor', 'm2_construidos', 'm2_totales', 'latitud', 'longitud', 
                'antiguedad_anos', 'recamaras', 'banos', 'estacionamientos']
                
    for col in num_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        else:
            df[col] = np.nan
            
    df['antiguedad_anos'] = df['antiguedad_anos'].fillna(10.0)
    df['recamaras'] = df['recamaras'].fillna(3.0)
    df['banos'] = df['banos'].fillna(2.0)
    df['estacionamientos'] = df['estacionamientos'].fillna(1.0)
    df['m2_totales'] = df['m2_totales'].fillna(df['m2_construidos'])
    
    bool_cols = ['tiene_alberca', 'en_fraccionamiento_cerrado', 'tiene_vigilancia']
    for b in bool_cols:
        if b in df.columns:
            df[b] = df[b].fillna(False).astype(int)
        else:
            df[b] = 0
            
    df = df[
        (df['precio_valor'] >= 200000) & (df['precio_valor'] <= 40000000) &
        (df['m2_construidos'] >= 30) & (df['m2_construidos'] <= 2000) &
        (df['latitud'].notna()) & (df['longitud'].notna())
    ]
    print(f"[INFO] Registros limpios tras remover outliers: {len(df)}")
    return df

def entrenar_modelo():
    df = cargar_y_preparar()
    
    features = [
        'm2_construidos', 'm2_totales', 'latitud', 'longitud',
        'antiguedad_anos', 'recamaras', 'banos', 'estacionamientos',
        'tiene_alberca', 'en_fraccionamiento_cerrado', 'tiene_vigilancia'
    ]
    
    X = df[features]
    y = df['precio_valor']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("\n[INFO] Entrenando modelo HistGradientBoostingRegressor...")
    model = HistGradientBoostingRegressor(
        max_iter=400,
        learning_rate=0.05,
        max_depth=10,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mape = mean_absolute_percentage_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("\n==================================================")
    print("        METRICAS DEL MODELO DE IA ENTRENADO        ")
    print("==================================================")
    print(f"MAE (Error absoluto medio): ${mae:,.2f} MXN")
    print(f"MAPE (Porcentaje de error): {mape*100:.2f}%")
    print(f"R2 Score (Precision de ajuste): {r2:.4f}")
    print("==================================================\n")
    
    os.makedirs('modelos', exist_ok=True)
    with open('modelos/modelo_valuacion.pkl', 'wb') as f:
        pickle.dump(model, f)
        
    with open('modelos/columnas.pkl', 'wb') as f:
        pickle.dump(features, f)
        
    print("[OK] Modelo guardado en 'modelos/modelo_valuacion.pkl'")
    print("[OK] Columnas guardadas en 'modelos/columnas.pkl'")

if __name__ == '__main__':
    entrenar_modelo()
