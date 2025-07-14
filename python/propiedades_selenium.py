from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import pandas as pd

# Configura Selenium para modo headless (sin abrir ventana)
options = Options()
options.add_argument("--headless")
options.add_argument("--window-size=1920,1080")
options.add_argument("--disable-blink-features=AutomationControlled")

# Cambia el path si tu chromedriver.exe está en otro lugar
# Si está en la misma carpeta, solo pon 'chromedriver'
driver = webdriver.Chrome(options=options)

url = "https://www.propiedades.com/veracruz/casas-venta"
driver.get(url)
time.sleep(5)  # Espera a que cargue la página

# Extrae tarjetas de propiedades
cards = driver.find_elements(By.CSS_SELECTOR, "div[data-testid='listing-card']")
print(f"Se encontraron {len(cards)} tarjetas.")

data = []
for card in cards:
    try:
        titulo = card.find_element(By.CSS_SELECTOR, "h2").text
        precio = card.find_element(By.CSS_SELECTOR, "span[data-testid='listing-price']").text
        direccion = card.find_element(By.CSS_SELECTOR, "span[data-testid='listing-location']").text
        url_prop = card.find_element(By.CSS_SELECTOR, "a[data-testid='listing-card-link']").get_attribute("href")
        data.append({
            "Título": titulo,
            "Precio": precio,
            "Dirección": direccion,
            "URL": url_prop
        })
    except Exception as e:
        continue

driver.quit()

# Guarda en Excel
if data:
    df = pd.DataFrame(data)
    df.to_excel("propiedades_selenium.xlsx", index=False)
    print("Datos guardados en propiedades_selenium.xlsx")
else:
    print("No se extrajeron datos válidos.") 