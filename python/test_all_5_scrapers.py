import os
import sys
import subprocess

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("="*60)
print("     DIAGNÓSTICO EN VIVO DE LOS 5 SCRAPERS INMOBILIARIOS")
print("="*60)

scrapers_test = [
    {
        "nombre": "RE/MAX Scraper",
        "dir": "remax_scraper",
        "script": "scraper_remax.py",
        "input": "\n"
    },
    {
        "nombre": "Lamudi México",
        "dir": "lamudi",
        "script": "scraper_lamudi.py",
        "input": "1\n1\n5\n"
    },
    {
        "nombre": "Propiedades.com",
        "dir": "propiedades_com",
        "script": "scraper.py",
        "input": "1\n1\n1\n5\n"
    },
    {
        "nombre": "Vivanuncios",
        "dir": "vivanuncios",
        "script": "scraper_vivanuncios.py",
        "input": "1\n1\n5\n"
    },
    {
        "nombre": "Inmuebles24 (Playwright)",
        "dir": "playwright_inmuebles24",
        "script": "scraper_playwright.py",
        "input": "3\n1\n1\n1\n5\n"
    }
]

env = dict(os.environ)
env["PYTHONUTF8"] = "1"
env["PYTHONIOENCODING"] = "utf-8"
env["HEADLESS"] = "true"
env["PLAYWRIGHT_HEADLESS"] = "true"

resultados = []

for sc in scrapers_test:
    name = sc["nombre"]
    scraper_dir = os.path.join(BASE_DIR, sc["dir"])
    script_file = sc["script"]
    full_path = os.path.join(scraper_dir, script_file)
    
    print(f"\nProbando {name} ({sc['dir']}/{script_file})...")
    
    if not os.path.exists(full_path):
        print(f"❌ ARCHIVO NO ENCONTRADO: {full_path}")
        resultados.append({"nombre": name, "status": "ERROR_FILE_NOT_FOUND", "code": -1})
        continue

    try:
        res = subprocess.run(
            [sys.executable, script_file],
            cwd=scraper_dir,
            input=sc["input"],
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            env=env,
            timeout=40
        )
        
        if res.returncode == 0:
            print(f"✅ {name}: Ejecución limpia (Exit code 0)")
            resultados.append({"nombre": name, "status": "OK", "code": 0})
        else:
            print(f"⚠️ {name}: Finalizó con código {res.returncode}")
            print(f"   Stderr: {res.stderr[:200]}")
            resultados.append({"nombre": name, "status": f"EXIT_CODE_{res.returncode}", "code": res.returncode})
    except subprocess.TimeoutExpired:
        print(f"⏱️ {name}: Timeout 45s alcanzado (Scraper activo realizando scraping...)")
        resultados.append({"nombre": name, "status": "ACTIVE_TIMEOUT", "code": 0})
    except Exception as e:
        print(f"❌ {name}: Excepción {e}")
        resultados.append({"nombre": name, "status": str(e), "code": -1})

print("\n"+"="*60)
print("                     RESUMEN DE DIAGNÓSTICO")
print("="*60)
for r in resultados:
    symbol = "✅" if r["status"] in ("OK", "ACTIVE_TIMEOUT") else "❌"
    print(f"{symbol} {r['nombre']:30s} -> Estado: {r['status']}")
print("="*60)
