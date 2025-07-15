#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para re-normalizar datos existentes en Firestore

Este script lee todos los documentos de la colección 'propiedades' y normaliza
los campos colonia, ciudad, estado y tipo usando la función normalizar_texto
para asegurar consistencia en las búsquedas.

Uso:
  python renormalizar_firestore.py

Autor: Script de normalización de datos
"""

import firebase_admin
from firebase_admin import credentials, firestore
from valuador import normalizar_texto
import time
from google.api_core import exceptions
import random

def renormalizar_datos():
    """Renormaliza todos los documentos de la colección propiedades"""
    
    # Inicializar Firebase
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Conexión con Firebase establecida.")
    except Exception as e:
        print(f"❌ Error al inicializar Firebase: {e}")
        return
    
    propiedades_ref = db.collection('propiedades')
    
    # Procesar en lotes para evitar timeouts
    print("🔄 Iniciando normalización en lotes...")
    procesados = 0
    actualizados = 0
    errores = 0
    lote_actual = 0
    tamano_lote = 100  # Procesar 100 documentos a la vez
    
    while True:
        try:
            lote_actual += 1
            print(f"\n📦 Procesando lote {lote_actual}...")
            
            # Obtener lote de documentos
            docs = list(propiedades_ref.limit(tamano_lote).offset(procesados).stream())
            
            if not docs:
                print("✅ No hay más documentos para procesar.")
                break
            
            print(f"📄 Procesando {len(docs)} documentos en este lote...")
            
            # Procesar cada documento del lote
            for doc in docs:
                try:
                    data = doc.to_dict()
                    procesados += 1
                    
                    # Guardar valores originales como backup
                    data['colonia_original'] = data.get('colonia', '')
                    data['ciudad_original'] = data.get('ciudad', '')
                    data['estado_original'] = data.get('estado', '')
                    data['tipo_original'] = data.get('tipo', '')
                    
                    # Normalizar campos
                    colonia_antigua = data.get('colonia', '')
                    ciudad_antigua = data.get('ciudad', '')
                    estado_antigua = data.get('estado', '')
                    tipo_antiguo = data.get('tipo', '')
                    
                    data['colonia'] = normalizar_texto(colonia_antigua)
                    data['ciudad'] = normalizar_texto(ciudad_antigua)
                    data['estado'] = normalizar_texto(estado_antigua)
                    data['tipo'] = normalizar_texto(tipo_antiguo)
                    
                    # Verificar si hubo cambios
                    if (colonia_antigua != data['colonia'] or 
                        ciudad_antigua != data['ciudad'] or 
                        estado_antigua != data['estado'] or 
                        tipo_antiguo != data['tipo']):
                        actualizados += 1
                        print(f"✅ [{procesados}] Actualizado: {data.get('direccion', 'N/A')[:50]}...")
                        print(f"   Colonia: '{colonia_antigua}' → '{data['colonia']}'")
                        print(f"   Ciudad: '{ciudad_antigua}' → '{data['ciudad']}'")
                        print(f"   Estado: '{estado_antigua}' → '{data['estado']}'")
                        print(f"   Tipo: '{tipo_antiguo}' → '{data['tipo']}'")
                    else:
                        print(f"⏭️  [{procesados}] Sin cambios: {data.get('direccion', 'N/A')[:50]}...")
                    
                    # Actualizar documento con reintentos
                    for intento in range(3):
                        try:
                            doc.reference.set(data)
                            break
                        except exceptions.DeadlineExceeded:
                            if intento < 2:
                                print(f"   ⏳ Timeout, reintentando... (intento {intento + 1}/3)")
                                time.sleep(2 ** intento)  # Backoff exponencial
                            else:
                                raise
                    
                except Exception as e:
                    errores += 1
                    print(f"❌ Error procesando documento {doc.id}: {e}")
                    continue
            
            # Pausa entre lotes para no sobrecargar Firestore
            print(f"⏳ Pausa de 2 segundos entre lotes...")
            time.sleep(2)
            
        except exceptions.DeadlineExceeded:
            print(f"⚠️  Timeout en lote {lote_actual}, reduciendo tamaño de lote...")
            tamano_lote = max(10, tamano_lote // 2)  # Reducir tamaño del lote
            time.sleep(5)  # Pausa más larga
            continue
        except Exception as e:
            print(f"❌ Error procesando lote {lote_actual}: {e}")
            time.sleep(5)
            continue
    
    # Resumen final
    print(f"\n{'='*60}")
    print(f"📋 RESUMEN DE NORMALIZACIÓN")
    print(f"{'='*60}")
    print(f"📊 Total de documentos procesados: {procesados}")
    print(f"✅ Documentos actualizados: {actualizados}")
    print(f"⏭️  Documentos sin cambios: {procesados - actualizados}")
    print(f"❌ Errores: {errores}")
    if procesados > 0:
        print(f"📈 Porcentaje de actualización: {(actualizados/procesados)*100:.1f}%")
    print(f"{'='*60}")
    
    if actualizados > 0:
        print("🎉 ¡Normalización completada exitosamente!")
        print("💡 Los campos originales se guardaron como backup (_original)")
    else:
        print("ℹ️  No se encontraron documentos que necesitaran normalización.")

def verificar_normalizacion():
    """Verifica que la normalización fue exitosa mostrando algunos ejemplos"""
    
    print("\n🔍 Verificando normalización...")
    
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        propiedades_ref = db.collection('propiedades')
        docs = list(propiedades_ref.limit(5).stream())
        
        print(f"📋 Mostrando {len(docs)} ejemplos:")
        for i, doc in enumerate(docs, 1):
            data = doc.to_dict()
            print(f"\n📄 Ejemplo {i}:")
            print(f"   Dirección: {data.get('direccion', 'N/A')}")
            print(f"   Colonia: '{data.get('colonia', '')}' (original: '{data.get('colonia_original', '')}')")
            print(f"   Ciudad: '{data.get('ciudad', '')}' (original: '{data.get('ciudad_original', '')}')")
            print(f"   Estado: '{data.get('estado', '')}' (original: '{data.get('estado_original', '')}')")
            print(f"   Tipo: '{data.get('tipo', '')}' (original: '{data.get('tipo_original', '')}')")
            
    except Exception as e:
        print(f"❌ Error al verificar: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando script de re-normalización de Firestore")
    print("="*60)
    
    # Preguntar confirmación
    respuesta = input("¿Estás seguro de que quieres re-normalizar todos los datos? (s/N): ")
    if respuesta.lower() not in ['s', 'si', 'sí', 'y', 'yes']:
        print("❌ Operación cancelada.")
        exit()
    
    # Ejecutar normalización
    renormalizar_datos()
    
    # Verificar resultados
    verificar_normalizacion()
    
    print("\n✨ Script completado.") 