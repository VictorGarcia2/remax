import firebase_admin
from firebase_admin import credentials, firestore

# Inicializa la app solo una vez
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Cambia 'propiedades' por el nombre de tu colección si es diferente
docs = db.collection('propiedades').stream()
count = sum(1 for _ in docs)
print(f"Total de propiedades: {count}") 