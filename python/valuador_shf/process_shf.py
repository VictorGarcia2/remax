import pandas as pd
import json

def main():
    print("Leyendo archivo Excel de la SHF...")
    try:
        df = pd.read_excel('Indice_SHF_datos_abiertos_1_trim_2026.xlsx', sheet_name='Indice SHF datos abiertos')
    except Exception as e:
        print(f"Error leyendo Excel: {e}")
        return

    # Renombrar columna de Año para evitar problemas de encoding
    df.rename(columns={df.columns[5]: 'Anio'}, inplace=True)
    
    # Limpiar strings
    df['Municipio'] = df['Municipio'].astype(str).str.strip()
    df['Estado'] = df['Estado'].astype(str).str.strip()
    
    resultados = {}
    
    # 1. Procesar todos los Municipios disponibles
    df_muns = df[df['Municipio'] != 'nan']
    for mun, df_mun in df_muns.groupby('Municipio'):
        df_yearly = df_mun.groupby('Anio')['Indice'].mean().reset_index().sort_values('Anio')
        if len(df_yearly) >= 2:
            anio_ini = df_yearly.iloc[0]['Anio']
            indice_ini = df_yearly.iloc[0]['Indice']
            anio_fin = df_yearly.iloc[-1]['Anio']
            indice_fin = df_yearly.iloc[-1]['Indice']
            
            n_anios = anio_fin - anio_ini
            cagr = (indice_fin / indice_ini) ** (1 / n_anios) - 1 if n_anios > 0 else 0
            
            resultados[mun.lower()] = {
                'nombre': mun,
                'nivel': 'municipio',
                'cagr_anual': cagr,
                'indice_actual': float(indice_fin),
                'periodo': f"{anio_ini}-{anio_fin}"
            }

    # 2. Procesar todos los Estados como fallback
    df_estados = df[df['Estado'] != 'nan']
    for estado, df_est in df_estados.groupby('Estado'):
        df_yearly = df_est.groupby('Anio')['Indice'].mean().reset_index().sort_values('Anio')
        if len(df_yearly) >= 2:
            anio_ini = df_yearly.iloc[0]['Anio']
            indice_ini = df_yearly.iloc[0]['Indice']
            anio_fin = df_yearly.iloc[-1]['Anio']
            indice_fin = df_yearly.iloc[-1]['Indice']
            
            n_anios = anio_fin - anio_ini
            cagr = (indice_fin / indice_ini) ** (1 / n_anios) - 1 if n_anios > 0 else 0
            
            resultados[estado.lower()] = {
                'nombre': estado,
                'nivel': 'estado',
                'cagr_anual': cagr,
                'indice_actual': float(indice_fin),
                'periodo': f"{anio_ini}-{anio_fin}"
            }
            
    # Guardar resultados
    with open('shf_multiplicadores.json', 'w', encoding='utf-8') as f:
        json.dump(resultados, f, indent=4, ensure_ascii=False)
        
    print(f"Éxito: Se procesaron {len(resultados)} zonas (estados y municipios) en 'shf_multiplicadores.json'")

if __name__ == '__main__':
    main()
