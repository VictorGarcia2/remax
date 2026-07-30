import json
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, r2_score

def cargar_datos():
    ruta = '../valuador_normalizado/veracruz_casas_combinado.json'
    print(f"Cargando datos desde {ruta}...")
    with open(ruta, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Filtrar solo válidos
    propiedades = [p for p in data['propiedades'] if p.get('es_valido_para_valuacion')]
    print(f"Total propiedades válidas: {len(propiedades)}")
    
    df = pd.DataFrame(propiedades)
    return df

def limpiar_y_preparar(df):
    print("Preparando datos...")
    
    # 1. Variables base necesarias
    cols_necesarias = [
        'precio_valor', 'm2_construidos', 'm2_totales', 
        'latitud', 'longitud', 'antiguedad_anos',
        'recamaras', 'banos', 'estacionamientos',
        'tiene_alberca', 'en_fraccionamiento_cerrado', 'tiene_vigilancia'
    ]
    df = df[cols_necesarias].copy()
    
    # 2. Conversión de numéricos y manejo de Nulos
    # HistGradientBoostingRegressor soporta NaNs nativamente, pero es buena práctica llenar los lógicos
    df['antiguedad_anos'] = pd.to_numeric(df['antiguedad_anos'], errors='coerce')
    df['recamaras'] = pd.to_numeric(df['recamaras'], errors='coerce')
    df['banos'] = pd.to_numeric(df['banos'], errors='coerce')
    df['estacionamientos'] = pd.to_numeric(df['estacionamientos'], errors='coerce')
    
    # Llenar nulos con valores típicos
    df['antiguedad_anos'] = df['antiguedad_anos'].fillna(10) # 10 años por defecto
    df['recamaras'] = df['recamaras'].fillna(3)              # 3 recámaras promedio
    df['banos'] = df['banos'].fillna(2)                      # 2 baños promedio
    df['estacionamientos'] = df['estacionamientos'].fillna(1)# 1 auto promedio
    df['m2_totales'] = df['m2_totales'].fillna(df['m2_construidos']) # Terreno = const si falta
    
    # Convertir booleanos a 1/0
    for col in ['tiene_alberca', 'en_fraccionamiento_cerrado', 'tiene_vigilancia']:
        df[col] = df[col].astype(int)
        
    # 3. Remover Outliers (Ej: Casas de 100 pesos o de 500 millones, o mansiones de 5000 m2)
    # Rango razonable: 200 mil a 30 millones MXN
    df = df[(df['precio_valor'] > 200000) & (df['precio_valor'] < 30000000)]
    # M2 de 30 a 1500
    df = df[(df['m2_construidos'] > 30) & (df['m2_construidos'] < 1500)]
    
    print(f"Registros tras limpiar outliers: {len(df)}")
    return df

def entrenar():
    df = cargar_datos()
    df = limpiar_y_preparar(df)
    
    # Separar Features (X) y Target (y)
    X = df.drop('precio_valor', axis=1)
    y = df['precio_valor']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Entrenando modelo HistGradientBoosting (Avanzado)...")
    model = HistGradientBoostingRegressor(
        max_iter=300,
        learning_rate=0.05,
        max_depth=8,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluar
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    mape = mean_absolute_percentage_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("\n--- RESULTADOS DEL MODELO ---")
    print(f"MAE (Error promedio en pesos): ${mae:,.2f} MXN")
    print(f"MAPE (Porcentaje de error): {mape*100:.2f}%")
    print(f"R² Score: {r2:.4f}")
    
    # Guardar modelo
    os.makedirs('modelos', exist_ok=True)
    with open('modelos/modelo_valuacion.pkl', 'wb') as f:
        pickle.dump(model, f)
        
    # Guardar lista de columnas para la app
    with open('modelos/columnas.pkl', 'wb') as f:
        pickle.dump(list(X.columns), f)
        
    print("\nModelo guardado en 'modelos/modelo_valuacion.pkl'")

if __name__ == '__main__':
    entrenar()
