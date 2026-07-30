#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de prueba completo para verificar el funcionamiento del valuador sin Firebase
"""
import sys
import os

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from valuador import valuar_con_ia, normalizar_texto

def test_valuador_completo():
    print("=" * 60)
    print("   PRUEBA COMPLETA DEL SISTEMA DE VALUACIÓN POR IA (LOCAL)")
    print("=" * 60)
    
    Casos_prueba = [
        {
            "nombre": "Casa Residencial en Boca del Río",
            "metros": 180.0,
            "recamaras": 3,
            "banos": 2.5,
            "colonia": "Lomas del Dorado",
            "ciudad": "Boca del Río",
            "estado": "Veracruz"
        },
        {
            "nombre": "Casa Media en Fracc. Reforma",
            "metros": 150.0,
            "recamaras": 3,
            "banos": 2.0,
            "colonia": "Reforma",
            "ciudad": "Veracruz",
            "estado": "Veracruz"
        },
        {
            "nombre": "Casa Amplia en Riviera Veracruzana",
            "metros": 260.0,
            "recamaras": 4,
            "banos": 4.0,
            "colonia": "Lomas de la Rioja",
            "ciudad": "Alvarado",
            "estado": "Veracruz"
        }
    ]
    
    for i, caso in enumerate(Casos_prueba, 1):
        print(f"\nCaso {i}: {caso['nombre']}")
        print(f"Ubicacion: {caso['colonia']}, {caso['ciudad']}, {caso['estado']}")
        print(f"Especificaciones: {caso['metros']} m², {caso['recamaras']} recamaras, {caso['banos']} baños")
        
        res = valuar_con_ia(
            m2_construidos=caso['metros'],
            m2_totales=caso['metros'],
            recamaras=caso['recamaras'],
            banos=caso['banos'],
            colonia=caso['colonia'],
            ciudad=caso['ciudad'],
            estado=caso['estado']
        )
        
        print(f"-> Precio Sugerido por IA: ${res['precio_estimado']:,.2f} MXN (${res['valor_m2_estimado']:,.2f}/m²)")
        print(f"-> Rango Estimado (±15%): ${res['rango_minimo']:,.2f} - ${res['rango_maximo']:,.2f} MXN")
        print(f"-> Comparables Encontrados: {len(res['comparables'])}")
        for comp in res['comparables'][:2]:
            print(f"   * [{comp['fuente']}] ${comp['precio']:,.2f} | {comp['metros']} m² | {comp['colonia']} | {comp['url']}")
        print("-" * 50)
        
    print("\n✅ TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO.")

if __name__ == '__main__':
    test_valuador_completo()