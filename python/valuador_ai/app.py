import gradio as gr
import pandas as pd
import pickle
import os

# Cargar el modelo
ruta_modelo = 'modelos/modelo_valuacion.pkl'
ruta_cols = 'modelos/columnas.pkl'

if not os.path.exists(ruta_modelo):
    print("Error: El modelo no existe. Ejecuta 'python entrenar_modelo.py' primero.")
    exit()

with open(ruta_modelo, 'rb') as f:
    modelo = pickle.load(f)
with open(ruta_cols, 'rb') as f:
    columnas = pickle.load(f)

def valuar_propiedad(m2_construidos, m2_totales, latitud, longitud, 
                     antiguedad, recamaras, banos, estacionamientos,
                     alberca, fracc, vigilancia):
    
    # Crear DataFrame con 1 fila
    data = {
        'm2_construidos': [m2_construidos],
        'm2_totales': [m2_totales],
        'latitud': [latitud],
        'longitud': [longitud],
        'antiguedad_anos': [antiguedad],
        'recamaras': [recamaras],
        'banos': [banos],
        'estacionamientos': [estacionamientos],
        'tiene_alberca': [1 if alberca else 0],
        'en_fraccionamiento_cerrado': [1 if fracc else 0],
        'tiene_vigilancia': [1 if vigilancia else 0]
    }
    df = pd.DataFrame(data)
    # Reordenar columnas para que coincidan con el entrenamiento
    df = df[columnas]
    
    # Predecir
    prediccion = modelo.predict(df)[0]
    
    # Formatear salida
    precio_formateado = f"${prediccion:,.2f} MXN"
    
    # Calcular rango de confianza aproximado (+- 15%)
    minimo = f"${prediccion * 0.85:,.2f}"
    maximo = f"${prediccion * 1.15:,.2f}"
    
    return precio_formateado, f"{minimo} - {maximo}"

# Interfaz con Gradio
with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🤖 Valuador Inmobiliario de Inteligencia Artificial (Veracruz)")
    gr.Markdown("Este modelo de Machine Learning fue entrenado con más de 12,000 propiedades reales.")
    
    with gr.Row():
        with gr.Column():
            gr.Markdown("### 📏 Dimensiones y Edad")
            m2_const = gr.Number(label="M² Construidos", value=150)
            m2_terr = gr.Number(label="M² Terreno", value=150)
            antiguedad = gr.Slider(0, 50, value=5, step=1, label="Antigüedad (Años)")
            
            gr.Markdown("### 🛏️ Distribución")
            recamaras = gr.Slider(1, 10, value=3, step=1, label="Recámaras")
            banos = gr.Slider(1, 10, value=2, step=0.5, label="Baños")
            estac = gr.Slider(0, 10, value=2, step=1, label="Estacionamientos")
            
        with gr.Column():
            gr.Markdown("### 📍 Ubicación Exacta")
            gr.Markdown("*(Ejemplo: 19.1276, -96.1083)*")
            lat = gr.Number(label="Latitud", value=19.1093)
            lng = gr.Number(label="Longitud", value=-96.1496)
            
            gr.Markdown("### ✨ Modificadores de Plusvalía")
            alberca = gr.Checkbox(label="¿Tiene Alberca?")
            fracc = gr.Checkbox(label="¿Está en Fraccionamiento Cerrado?")
            vigilancia = gr.Checkbox(label="¿Tiene Vigilancia 24/7?")
            
            btn = gr.Button("Valuar Propiedad", variant="primary")
            
    with gr.Row():
        with gr.Column():
            gr.Markdown("## 💰 Valor Estimado de Mercado")
            precio_final = gr.Textbox(label="Precio Sugerido", text_align="center", scale=2)
            rango = gr.Textbox(label="Rango de Negociación Esperado (±15%)")
            
    btn.click(
        fn=valuar_propiedad,
        inputs=[m2_const, m2_terr, lat, lng, antiguedad, recamaras, banos, estac, alberca, fracc, vigilancia],
        outputs=[precio_final, rango]
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
