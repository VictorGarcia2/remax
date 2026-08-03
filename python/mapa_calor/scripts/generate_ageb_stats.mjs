import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';

// Rutas a los archivos
const PROPERTIES_FILE = fs.existsSync(path.join(process.cwd(), '..', 'dataset_master.json')) 
  ? path.join(process.cwd(), '..', 'dataset_master.json')
  : path.join(process.cwd(), 'data', 'veracruz_casas_combinado.json');

const AGEB_FILE = path.join(process.cwd(), 'public', 'geojson', 'ageb.geojson');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'ageb_stats.json');

async function main() {
  console.log('Iniciando procesamiento espacial de AGEBs...');

  // 1. Cargar datos
  if (!fs.existsSync(PROPERTIES_FILE)) {
    console.error(`Error: Archivo de propiedades no encontrado en ${PROPERTIES_FILE}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(AGEB_FILE)) {
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log(`[INFO] Usando estadísticas AGEB pre-calculadas en ${OUTPUT_FILE}`);
      process.exit(0);
    }
    console.error(`Error: Archivo AGEB no encontrado en ${AGEB_FILE}`);
    process.exit(1);
  }

  const propsRaw = JSON.parse(fs.readFileSync(PROPERTIES_FILE, 'utf8'));
  const propsList = Array.isArray(propsRaw) ? propsRaw : (propsRaw.propiedades || []);
  const agebData = JSON.parse(fs.readFileSync(AGEB_FILE, 'utf8'));

  // Asegurar que la salida exista
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 2. Preparar diccionario de AGEBs
  const agebStats = {};

  const agebPolygons = agebData.features;

  console.log(`Cargados ${agebPolygons.length} polígonos AGEB y ${propsList.length} propiedades.`);
  console.log('Cruzando coordenadas con polígonos INEGI AGEB...');

  // Convertir todas las propiedades válidas a puntos de turf
  const points = propsList
    .filter(p => p.latitud && p.longitud)
    .map(p => {
      const pm2 = p.precio_m2_construccion || (p.m2_construidos > 0 ? p.precio_valor / p.m2_construidos : null);
      return turf.point([p.longitud, p.latitud], {
        id: p.id_propiedad,
        precio_m2: pm2,
        colonia: p.colonia
      });
    });

  const pointsFc = turf.featureCollection(points);

  // 3. Spatial Join
  // Para cada AGEB, encontrar cuántos puntos caen dentro
  let countProcessed = 0;
  
  for (const feature of agebPolygons) {
    countProcessed++;
    if (countProcessed % 1000 === 0) {
      console.log(`Procesando AGEB ${countProcessed}/${agebPolygons.length}...`);
    }

    const { CVE_ENT, CVE_MUN, CVE_LOC, CVE_AGEB } = feature.properties;
    // Construir una clave única para el AGEB (manejar posible undefined en CVE_LOC)
    const locPart = CVE_LOC || '0000';
    const agebId = `${CVE_ENT}_${CVE_MUN}_${locPart}_${CVE_AGEB}`;

    // Obtener los puntos dentro de este polígono
    let ptsWithin;
    try {
      ptsWithin = turf.pointsWithinPolygon(pointsFc, feature);
    } catch (e) {
      // Ignorar geometrías inválidas
      continue;
    }

    if (ptsWithin.features.length > 0) {
      const numProperties = ptsWithin.features.length;
      let sumPrecioM2 = 0;
      let countValidosM2 = 0;
      const colonias = {};

      ptsWithin.features.forEach(pt => {
        if (pt.properties.precio_m2 != null) {
          sumPrecioM2 += pt.properties.precio_m2;
          countValidosM2++;
        }
        if (pt.properties.colonia) {
          colonias[pt.properties.colonia] = (colonias[pt.properties.colonia] || 0) + 1;
        }
      });

      const avgPrecioM2 = countValidosM2 > 0 ? (sumPrecioM2 / countValidosM2) : null;

      let coloniaPredominante = "Desconocida";
      let maxCount = 0;
      for (const col in colonias) {
        if (colonias[col] > maxCount) {
          maxCount = colonias[col];
          coloniaPredominante = col;
        }
      }

      agebStats[agebId] = {
        count: numProperties,
        avg_precio_m2: avgPrecioM2,
        sum_precio_m2: sumPrecioM2, // Opcional, para debug
        colonia_predominante: coloniaPredominante
      };
    }
  }

  console.log(`Cruce terminado. ${Object.keys(agebStats).length} AGEBs tienen propiedades.`);

  // 4. Guardar archivo
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(agebStats, null, 2), 'utf8');
  console.log(`Estadísticas guardadas exitosamente en ${OUTPUT_FILE}`);
}

main().catch(console.error);
