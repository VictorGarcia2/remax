import json
import os
import shutil
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

# Configuración de logging para seguimiento profesional
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PropertyDB:
    """
    Motor de base de datos JSON profesional para el scraper de Inmuebles24.
    Implementa escrituras atómicas, metadatos extendidos y gestión de integridad.
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._data: Dict[str, Any] = {
            "project": "Inmuebles24 Scraper DB",
            "version": "1.1",
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "last_update": None,
                "total_records": 0
            },
            "listings": {}
        }
        self._load()

    def _load(self):
        """Carga los datos desde el archivo JSON si existe."""
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'r', encoding='utf-8') as f:
                    self._data = json.load(f)
                logger.info(f"Base de datos cargada: {len(self._data['listings'])} registros.")
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Error al cargar DB. Iniciando base de datos limpia. Error: {e}")
                self._backup_corrupted()

    def _backup_corrupted(self):
        """Crea un respaldo de un archivo JSON potencialmente dañado antes de sobreescribirlo."""
        if os.path.exists(self.db_path):
            bak_path = f"{self.db_path}.corrupted_{int(datetime.now().timestamp())}.bak"
            shutil.copy2(self.db_path, bak_path)
            logger.warning(f"Archivo corrupto respaldado en: {bak_path}")

    def _save_atomic(self):
        """
        Guarda los datos de forma atómica con reintentos robustos.
        Escribe en un archivo temporal y luego lo renombra para evitar corrupción.
        """
        tmp_path = f"{self.db_path}.tmp"
        
        # Actualizar metadatos antes de guardar
        self._data["metadata"]["last_update"] = datetime.now().isoformat()
        self._data["metadata"]["total_records"] = len(self._data["listings"])
        
        try:
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump(self._data, f, indent=4, ensure_ascii=False)
            
            # Reintento robusto para evitar WinError 5 (bloqueo por Antivirus o IDE abierto)
            success = False
            for _ in range(5):
                try:
                    os.replace(tmp_path, self.db_path)
                    success = True
                    break
                except PermissionError:
                    time.sleep(0.2)
            if not success:
                os.replace(tmp_path, self.db_path)
        except Exception as e:
            logger.error(f"Fallo crítico al guardar la base de datos: {e}")
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

    def upsert(self, url: str, property_data: Dict[str, Any], autosave: bool = True) -> bool:
        """
        Inserta o actualiza una propiedad basándose en su URL única.
        Retorna True si hubo cambios significativos.

        Si autosave=False NO escribe el JSON a disco en cada llamada (mucho más
        rápido en bucles grandes). Recuerda llamar a save() al cerrar el lote/página.
        """
        now = datetime.now().isoformat()
        is_new = url not in self._data["listings"]

        if is_new:
            self._data["listings"][url] = {
                "data": property_data,
                "timestamps": {
                    "created_at": now,
                    "updated_at": now
                }
            }
            logger.debug(f"Nueva propiedad registrada: {url}")
            if autosave:
                self._save_atomic()
            return True
        else:
            # Verificar si los datos han cambiado (excluyendo timestamps)
            existing_data = self._data["listings"][url]["data"]
            if existing_data != property_data:
                self._data["listings"][url]["data"] = property_data
                self._data["listings"][url]["timestamps"]["updated_at"] = now
                logger.debug(f"Propiedad actualizada: {url}")
                if autosave:
                    self._save_atomic()
                return True

        return False

    def save(self):
        """Fuerza el guardado atómico del JSON a disco.
        Úsalo una vez tras varios upsert(autosave=False) para evitar reescribir
        el archivo completo en cada registro."""
        self._save_atomic()

    def exists(self, url: str) -> bool:
        """Verifica si una URL ya está en la base de datos."""
        return url in self._data["listings"]

    def get_all_as_list(self) -> List[Dict[str, Any]]:
        """Devuelve todos los registros como una lista plana (útil para generar CSVs)."""
        flat_list = []
        for url, record in self._data["listings"].items():
            # Aplanamos la estructura para compatibilidad con pandas/csv
            item = {"url": url}
            item.update(record["data"])
            item["scraped_created_at"] = record["timestamps"]["created_at"]
            item["scraped_updated_at"] = record["timestamps"]["updated_at"]
            flat_list.append(item)
        return flat_list
