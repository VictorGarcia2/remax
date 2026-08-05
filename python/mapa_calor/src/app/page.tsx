import fs from 'fs';
import path from 'path';
import MapDashboard from './components/MapDashboard';

export const revalidate = 0; // Evita el cacheo estático para leer el JSON más reciente

export default async function Home() {
  const localMasterPath = path.join(process.cwd(), 'data', 'dataset_master.json');
  const parentMasterPath = path.join(process.cwd(), '..', 'dataset_master.json');
  const fallbackPath = path.join(process.cwd(), 'data', 'veracruz_casas_combinado.json');
  
  let filePath = fallbackPath;
  if (fs.existsSync(localMasterPath)) {
    filePath = localMasterPath;
  } else if (fs.existsSync(parentMasterPath)) {
    filePath = parentMasterPath;
  }

  const agebStatsPath = path.join(process.cwd(), 'public', 'data', 'ageb_stats.json');
  
  let data = [];
  let agebStats = {};
  let stats = {
    total_registros: 0,
    registros_validos_para_valuacion: 0,
    generado_en: new Date().toISOString()
  };

  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed)) {
        data = parsed;
        stats.total_registros = parsed.length;
        stats.registros_validos_para_valuacion = parsed.filter((p: any) => p.latitud && p.longitud).length;
      } else if (parsed.propiedades) {
        data = parsed.propiedades;
        stats = parsed.metadata || stats;
      }
    }
    if (fs.existsSync(agebStatsPath)) {
      agebStats = JSON.parse(fs.readFileSync(agebStatsPath, 'utf8'));
    }
  } catch (error) {
    console.error("Error leyendo archivos JSON", error);
  }

  return (
    <MapDashboard data={data} stats={stats} agebStats={agebStats} />
  );
}
