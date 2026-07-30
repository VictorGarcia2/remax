from valuador import valuar_con_ia
import json

def test():
    print("==================================================")
    print("     TEST DE VALUACIÓN POR MODELO DE IA Y DATASET  ")
    print("==================================================\n")
    
    res = valuar_con_ia(
        m2_construidos=180.0,
        m2_totales=200.0,
        recamaras=3,
        banos=2.5,
        estacionamientos=2,
        antiguedad_anos=3,
        tiene_alberca=True,
        en_fraccionamiento_cerrado=True,
        colonia="Lomas del Dorado",
        ciudad="Boca del Río",
        estado="Veracruz"
    )
    
    print(f"💰 Precio Estimado por IA: ${res['precio_estimado']:,.2f} MXN")
    print(f"📏 Valor por m²: ${res['valor_m2_estimado']:,.2f} MXN/m²")
    print(f"📊 Rango de Negociación Sugerido (±15%): ${res['rango_minimo']:,.2f} a ${res['rango_maximo']:,.2f} MXN")
    print(f"🔬 Metodología: {res['metodologia']} (R² = {res['precision_modelo_r2']})")
    
    print("\n--------------------------------------------------")
    print(f" Top 5 Comparables Reales Extraídos del Dataset Local ({len(res['comparables'])})")
    print("--------------------------------------------------")
    for i, c in enumerate(res['comparables'], 1):
        print(f"{i}. [{c['fuente']}] {c['titulo']}")
        print(f"   Precio: ${c['precio']:,.2f} MXN | m²: {c['metros']} | $/m²: ${c['precio_m2']:,.2f}")
        print(f"   Ubicación: {c['colonia']}, {c['municipio']} (Distancia: {c['distancia_km']} km)")
        print(f"   URL: {c['url']}\n")

if __name__ == '__main__':
    test()
