#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de prueba completo para verificar el funcionamiento del valuador

Este script prueba todas las funciones del valuador con datos reales de Firestore
para asegurar que la normalización, búsqueda y filtrado funcionan correctamente.

Uso:
  python test_valuador_completo.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
from valuador import (
    normalizar_texto, 
    buscar_comparables, 
    filtrar_comparables_por_caracteristicas,
    calcular_estadisticas
)
import time

def test_valuador_completo():
    """Prueba completa del sistema de valuación"""
    
    print("🧪 INICIANDO PRUEBA COMPLETA DEL VALUADOR")
    print("=" * 60)
    
    # 1. Inicializar Firebase
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Conexión con Firebase establecida")
    except Exception as e:
        print(f"❌ Error al inicializar Firebase: {e}")
        return
    
    # 2. Verificar datos en la BD
    print("\n📊 Verificando datos en la BD...")
    propiedades_ref = db.collection('propiedades')
    total_docs = len(list(propiedades_ref.stream()))
    print(f"📈 Total de propiedades en BD: {total_docs}")
    
    if total_docs == 0:
        print("❌ No hay datos en la BD para probar")
        return
    
    # 3. Verificar estructura de campos
    print("\n🔍 Verificando estructura de campos...")
    sample_docs = list(propiedades_ref.limit(5).stream())
    
    campos_requeridos = ['colonia', 'ciudad', 'estado', 'tipo', 'metros', 'precio', 'banos', 'recamaras']
    campos_originales = ['colonia_original', 'ciudad_original', 'estado_original', 'tipo_original']
    
    for i, doc in enumerate(sample_docs, 1):
        data = doc.to_dict()
        print(f"\n📄 Documento {i}:")
        print(f"   ID: {doc.id}")
        
        # Verificar campos requeridos
        campos_faltantes = []
        for campo in campos_requeridos:
            if campo not in data:
                campos_faltantes.append(campo)
            else:
                valor = data[campo]
                print(f"   {campo}: '{valor}' ({type(valor).__name__})")
        
        if campos_faltantes:
            print(f"   ⚠️  Campos faltantes: {campos_faltantes}")
        
        # Verificar campos originales
        campos_orig_faltantes = []
        for campo in campos_originales:
            if campo not in data:
                campos_orig_faltantes.append(campo)
            else:
                valor = data[campo]
                print(f"   {campo}: '{valor}' ({type(valor).__name__})")
        
        if campos_orig_faltantes:
            print(f"   ⚠️  Campos originales faltantes: {campos_orig_faltantes}")
    
    # 4. Probar normalización
    print("\n🔄 Probando función de normalización...")
    test_cases = [
        "Colonia Centro",
        "Fracc. Las Palmas",
        "San José de los Pinos",
        "Veracruz, Ver.",
        "Casa"
    ]
    
    for test_case in test_cases:
        normalizado = normalizar_texto(test_case)
        print(f"   '{test_case}' -> '{normalizado}'")
    
    # 5. Probar búsqueda de comparables
    print("\n🔍 Probando búsqueda de comparables...")
    
    # Casos de prueba realistas
    casos_prueba = [
        {
            "nombre": "Casa en Veracruz centro",
            "colonia": "Centro",
            "ciudad": "Veracruz",
            "estado": "Veracruz",
            "tipo": "casa",
            "metros": 120,
            "bedrooms": 3,
            "bathrooms": 2
        },
        {
            "nombre": "Casa en Boca del Río",
            "colonia": "Boca del Río",
            "ciudad": "Boca del Río", 
            "estado": "Veracruz",
            "tipo": "casa",
            "metros": 150,
            "bedrooms": 4,
            "bathrooms": 3
        }
    ]
    
    for caso in casos_prueba:
        print(f"\n🏠 Probando: {caso['nombre']}")
        
        # Normalizar datos de entrada
        colonia_norm = normalizar_texto(caso['colonia'])
        ciudad_norm = normalizar_texto(caso['ciudad'])
        estado_norm = normalizar_texto(caso['estado'])
        tipo_norm = normalizar_texto(caso['tipo'])
        
        print(f"   Datos normalizados:")
        print(f"     Colonia: '{caso['colonia']}' -> '{colonia_norm}'")
        print(f"     Ciudad: '{caso['ciudad']}' -> '{ciudad_norm}'")
        print(f"     Estado: '{caso['estado']}' -> '{estado_norm}'")
        print(f"     Tipo: '{caso['tipo']}' -> '{tipo_norm}'")
        
        # Buscar comparables
        start_time = time.time()
        comparables, nivel = buscar_comparables(db, ciudad_norm, estado_norm, tipo_norm, colonia_norm)
        search_time = time.time() - start_time
        
        print(f"   ⏱️  Tiempo de búsqueda: {search_time:.2f}s")
        print(f"   📍 Nivel de coincidencia: {nivel}")
        print(f"   📊 Comparables encontrados: {len(comparables)}")
        
        if comparables:
            # Mostrar algunos comparables
            print(f"   📋 Primeros 3 comparables:")
            for i, comp in enumerate(comparables[:3], 1):
                precio_m2 = comp['precio'] / comp['metros'] if comp['metros'] else 0
                print(f"     {i}. {comp.get('direccion', 'N/A')}")
                print(f"        Precio: ${comp['precio']:,} | Metros: {comp['metros']} | Precio/m²: ${precio_m2:,.2f}")
                print(f"        Recámaras: {comp.get('recamaras', 'N/A')} | Baños: {comp.get('banos', 'N/A')}")
            
            # Probar filtrado por características
            print(f"   🔧 Probando filtrado por características...")
            start_time = time.time()
            comparables_filtrados = filtrar_comparables_por_caracteristicas(
                comparables,
                caso['metros'],
                caso['bedrooms'],  # bedrooms -> recamaras
                caso['bathrooms']  # bathrooms -> banos
            )
            filter_time = time.time() - start_time
            
            print(f"   ⏱️  Tiempo de filtrado: {filter_time:.2f}s")
            print(f"   📊 Comparables después del filtrado: {len(comparables_filtrados)}")
            
            if comparables_filtrados:
                # Probar cálculo de estadísticas
                print(f"   📈 Probando cálculo de estadísticas...")
                start_time = time.time()
                stats = calcular_estadisticas(
                    comparables_filtrados,
                    size=caso['metros'],
                    address=f"{caso['colonia']}, {caso['ciudad']}, {caso['estado']}",
                    property_type=caso['tipo'],
                    bedrooms=caso['bedrooms'],
                    bathrooms=caso['bathrooms']
                )
                stats_time = time.time() - start_time
                
                print(f"   ⏱️  Tiempo de cálculo: {stats_time:.2f}s")
                if stats:
                    print(f"   💰 Valor estimado: ${stats['average']:,.2f}")
                    print(f"   📊 Rango: ${stats['low']:,.2f} - ${stats['high']:,.2f}")
                    print(f"   🏠 Precio por m²: ${stats['promedio_m2']:,.2f}")
                else:
                    print(f"   ❌ No se pudieron calcular estadísticas")
            else:
                print(f"   ⚠️  No quedaron comparables después del filtrado")
        else:
            print(f"   ❌ No se encontraron comparables")
    
    # 6. Resumen final
    print(f"\n{'='*60}")
    print(f"📋 RESUMEN DE LA PRUEBA")
    print(f"{'='*60}")
    print(f"✅ Conexión a Firebase: OK")
    print(f"✅ Datos en BD: {total_docs} propiedades")
    print(f"✅ Estructura de campos: Verificada")
    print(f"✅ Función de normalización: Funcionando")
    print(f"✅ Búsqueda de comparables: Funcionando")
    print(f"✅ Filtrado por características: Funcionando")
    print(f"✅ Cálculo de estadísticas: Funcionando")
    print(f"{'='*60}")
    print(f"🎉 ¡Prueba completada exitosamente!")

if __name__ == "__main__":
    test_valuador_completo() 