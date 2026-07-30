import subprocess
import sys
import os

# Test 1-page Lamudi scraping with the captcha fix
BASE_DIR = r"c:\Users\tikoc\Downloads\scrappinginmuebles24"
LAMUDI_DIR = os.path.join(BASE_DIR, "lamudi")

print("=" * 60)
print("TEST: Scraper Lamudi con Fix de Captcha (1 página)")
print("=" * 60)

child_env = dict(os.environ)
child_env["PYTHONUTF8"] = "1"
child_env["PYTHONIOENCODING"] = "utf-8"

# Input: opcion 5 (custom), URL, nombre, 1 página, concurrencia
test_input = "5\nhttps://www.lamudi.com.mx/veracruz-llave/casa/for-sale/\ntest_captcha_fix_1p\n1\n10\n"

try:
    result = subprocess.run(
        [sys.executable, "scraper_lamudi.py"],
        cwd=LAMUDI_DIR,
        input=test_input,
        text=True,
        capture_output=True,
        env=child_env,
        timeout=600
    )
    
    print(f"\nCódigo de salida: {result.returncode}")
    
    if "captcha" in result.stderr.lower() or "autom" in result.stderr.lower():
        print("\n[STDOUT RELEVANTE]")
        for line in result.stderr.split('\n'):
            if 'auto' in line.lower() or 'captcha' in line.lower() or 'verificat' in line.lower():
                print(f"  {line}")
    
    # Check if output file was created
    json_file = os.path.join(LAMUDI_DIR, "test_captcha_fix_1p.json")
    if os.path.exists(json_file):
        import json
        with open(json_file) as f:
            data = json.load(f)
        count = len(data.get("listings", {}))
        print(f"\n✓ Archivo generado: {count} registros encontrados")
    else:
        print(f"\n✗ No se generó archivo: {json_file}")
        print(f"\nSTDERR:\n{result.stderr[-1000:]}")

except subprocess.TimeoutExpired:
    print("✗ Timeout (600s) - posiblemente bloqueado en captcha manual")
except Exception as e:
    print(f"✗ Error: {e}")
