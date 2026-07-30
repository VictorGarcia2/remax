import fs from 'fs';
import path from 'path';
import shapefile from 'shapefile';
import proj4 from 'proj4';

// Proyección de INEGI (MEXICO_ITRF_2008_LCC) extraída del archivo .prj
const INEGI_PROJ = "+proj=lcc +lat_1=17.5 +lat_2=29.5 +lat_0=12 +lon_0=-102 +x_0=2500000 +y_0=0 +ellps=GRS80 +units=m +no_defs";
const WGS84 = "EPSG:4326";

const publicDir = path.join(process.cwd(), 'public');
const shpDir = path.join(publicDir, 'Marco Geoestadístico Nacional');
const outDir = path.join(publicDir, 'geojson');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const filesToConvert = [
    { dir: '2025_1_30_ENT', name: '2025_1_30_ENT', out: 'entidad.geojson' },
    { dir: '2025_1_30_A', name: '2025_1_30_A', out: 'ageb.geojson' },
    { dir: '2025_1_30_M', name: '2025_1_30_M', out: 'manzanas.geojson' }
];

// Función recursiva para transformar coordenadas
function reprojectCoordinates(coords) {
    if (typeof coords[0] === 'number') {
        // Es un par de coordenadas [X, Y]
        return proj4(INEGI_PROJ, WGS84, coords);
    }
    // Es un arreglo anidado (Polígono o MultiPolígono)
    return coords.map(c => reprojectCoordinates(c));
}

async function convertAll() {
    for (const file of filesToConvert) {
        const shpPath = path.join(shpDir, file.dir, `${file.name}.shp`);
        const dbfPath = path.join(shpDir, file.dir, `${file.name}.dbf`);
        const outPath = path.join(outDir, file.out);
        
        console.log(`Convirtiendo y reproyectando ${shpPath}...`);
        try {
            const geojson = {
                type: "FeatureCollection",
                features: []
            };

            const source = await shapefile.open(shpPath, dbfPath, { encoding: 'utf-8' });
            
            let result;
            while (!(result = await source.read()).done) {
                // Filtramos campos nulos para ahorrar muchísimo peso
                if (result.value.properties) {
                    const props = result.value.properties;
                    result.value.properties = {};
                    if (props.CVE_ENT) result.value.properties.CVE_ENT = props.CVE_ENT;
                    if (props.CVE_MUN) result.value.properties.CVE_MUN = props.CVE_MUN;
                    if (props.CVE_AGEB) result.value.properties.CVE_AGEB = props.CVE_AGEB;
                    if (props.CVE_MZA) result.value.properties.CVE_MZA = props.CVE_MZA;
                }
                
                // Reproyectar la geometría a WGS84
                if (result.value.geometry && result.value.geometry.coordinates) {
                    result.value.geometry.coordinates = reprojectCoordinates(result.value.geometry.coordinates);
                }

                geojson.features.push(result.value);
            }
            
            fs.writeFileSync(outPath, JSON.stringify(geojson));
            console.log(`✅ Guardado: ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
            
        } catch (e) {
            console.error(`❌ Error convirtiendo ${file.name}:`, e);
        }
    }
    console.log("¡Proceso de conversión terminado!");
}

convertAll();
