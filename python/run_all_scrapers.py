import subprocess
import os
import sys

# Forzar UTF-8 en stdout/stderr para evitar UnicodeEncodeError en consolas Windows (cp1252)
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

def main():
    print("==================================================")
    print("        ORQUESTADOR AUTOMÁTICO DE SCRAPERS        ")
    print("==================================================")
    print("Responde estas preguntas una sola vez y el sistema")
    print("se encargará de ejecutar todos los scrapers por ti.\n")
    
    print("¿Qué zona deseas scrapear?")
    print("1. Veracruz (Casas en Venta)")
    print("2. Tabasco (Casas en Venta)")
    opcion_estado = input("Selecciona una opción (1/2) [1]: ").strip() or "1"
    
    print("\n¿Modo de actualización?")
    print("1. Rápido (Solo propiedades nuevas) [Recomendado]")
    print("2. Completo (Actualizar historial existente) [Lento]")
    modo = input("Selecciona (1/2) [1]: ").strip() or "1"
    
    paginas = input("\n¿Límite de páginas por portal? (Enter para TODAS): ").strip()
    
    conc = input("\nNivel de concurrencia HTTP [10]: ").strip() or "10"
    
    print("\n==================================================")
    print("¡Todo listo! Iniciando ejecución secuencial automática...")
    print("Puedes dejar la computadora trabajando sola.")
    print("==================================================\n")

    # Mapeo de respuestas para cada script (simulación de teclado)
    inputs_map = {}
    
    if opcion_estado == "1":
        inputs_map["lamudi"] = f"1\n{paginas}\n{conc}\n"
        inputs_map["propiedades_com"] = f"1\n{modo}\n{paginas}\n{conc}\n"
        inputs_map["vivanuncios"] = f"1\n{paginas}\n{conc}\n"
        inputs_map["playwright_inmuebles24"] = f"3\n{modo}\n1\n{paginas}\n{conc}\n"
    else:
        # Tabasco
        inputs_map["lamudi"] = f"5\nhttps://www.lamudi.com.mx/tabasco/casa/for-sale/\nlamudi_tabasco_casas\n{paginas}\n{conc}\n"
        inputs_map["propiedades_com"] = f"3\n{modo}\n{paginas}\n{conc}\n"
        inputs_map["vivanuncios"] = f"2\nhttps://www.vivanuncios.com.mx/s-casas-en-venta/tabasco/v1c1293l1026p1\nvivanuncios_tabasco_casas\n{paginas}\n{conc}\n"
        inputs_map["playwright_inmuebles24"] = f"1\n{modo}\n1\n{paginas}\n{conc}\n"
        
    inputs_map["remax_scraper"] = "\n"

    scrapers = [
        {"dir": "lamudi", "script": "scraper_lamudi.py"},
        {"dir": "propiedades_com", "script": "scraper.py"},
        {"dir": "vivanuncios", "script": "scraper_vivanuncios.py"},
        {"dir": "remax_scraper", "script": "scraper_remax.py"},
        {"dir": "playwright_inmuebles24", "script": "scraper_playwright.py"}
    ]

    base_dir = os.path.dirname(os.path.abspath(__file__))

    for scraper in scrapers:
        scraper_dir = os.path.join(base_dir, scraper["dir"])
        script_path = scraper["script"]
        
        print(f"\n{'='*50}")
        print(f"Ejecutando automáticamente: {scraper['dir']}/{script_path}")
        print(f"{'='*50}\n")
        
        # Enviar el input automático al subprocess
        auto_input = inputs_map.get(scraper["dir"], "\n")

        # Forzar UTF-8 en los hijos (evita UnicodeEncodeError por emojis en cp1252)
        child_env = dict(os.environ)
        child_env["PYTHONUTF8"] = "1"
        child_env["PYTHONIOENCODING"] = "utf-8"

        try:
            result = subprocess.run(
                [sys.executable, script_path],
                cwd=scraper_dir,
                input=auto_input,
                text=True,
                check=False,
                env=child_env
            )
            
            if result.returncode == 0:
                print(f"\n[ÉXITO] {scraper['dir']} finalizó correctamente.\n")
            else:
                print(f"\n[ADVERTENCIA] {scraper['dir']} terminó con código de error {result.returncode}.\n")
                
        except Exception as e:
            print(f"\n[ERROR] No se pudo ejecutar {scraper['dir']}: {e}\n")

    print("==================================================")
    print("✅ Todos los scrapers han finalizado su ejecución automática.")
    print("==================================================")

if __name__ == "__main__":
    main()
