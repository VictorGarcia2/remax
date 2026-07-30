import re

def clean_numeric(text):
    """
    Extrae solo los números de una cadena, manejando decimales.
    Ej: '162 m²' -> 162.0, '2.5 baños' -> 2.5
    """
    if text is None or text == 'N/A' or not str(text).strip():
        return None
    
    # Eliminar espacios y comas para facilitar la extracción de números grandes
    clean_text = str(text).replace(',', '').replace(' ', '')
    match = re.search(r'(\d+(?:\.\d+)?)', clean_text)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None

def clean_price(price_str):
    """
    Extrae el valor numérico, la moneda y el mantenimiento de una cadena de precio.
    Ej: 'MN 3,490,000' -> (3490000.0, 'MN', 0.0)
    Ej: 'MN 3,670,000Mantenimiento MN 1,300' -> (3670000.0, 'MN', 1300.0)
    """
    if price_str is None or price_str == 'N/A':
        return None, None, 0.0
    
    price_str = str(price_str).replace('\\n', ' ').strip()
    
    # 1. Moneda (MN o USD)
    currency = 'MN'
    if 'USD' in price_str.upper():
        currency = 'USD'
    
    # 2. Mantenimiento
    maint_val = 0.0
    if 'Mantenimiento' in price_str:
        parts = re.split(r'Mantenimiento', price_str, flags=re.IGNORECASE)
        main_price_part = parts[0]
        maint_part = parts[1]
        maint_match = re.search(r'(\d+(?:[.,]\d+)?)', maint_part.replace(',', '').replace(' ', ''))
        if maint_match:
            maint_val = float(maint_match.group(1))
    else:
        main_price_part = price_str
    
    # 3. Valor Principal
    # Limpiamos palabras como 'Desde'
    main_price_part = re.sub(r'(Desde|Consultar|Precio)', '', main_price_part, flags=re.IGNORECASE)
    # Eliminar espacios y comas para facilitar la extracción
    main_price_part = main_price_part.replace(',', '').replace(' ', '')
    price_match = re.search(r'(\d+(?:\.\d+)?)', main_price_part)
    price_val = None
    if price_match:
        price_val = float(price_match.group(1))
        
    return price_val, currency, maint_val

def normalize_antiguedad(text):
    """
    Normaliza el campo de antigüedad.
    """
    if text is None or text == 'N/A':
        return 'N/A'
    
    text = str(text).strip().lower()
    if 'estrenar' in text or text == '0':
        return 'A estrenar'
    if 'construcción' in text:
        return 'En construcción'
    
    # Si es un número (años)
    match = re.search(r'(\d+)', text)
    if match:
        return f"{match.group(1)} años"
    
    return text.capitalize()
