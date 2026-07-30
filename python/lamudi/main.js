const fs = require('fs');

function procesarArchivo() {
    try {
        // 1. Leemos el archivo físico correcto (sin espacios en el nombre)
        const textoJson = fs.readFileSync('lamudi_veracruz_casas.json', 'utf-8');

        // 2. Lo convertimos a objeto JS
        const db = JSON.parse(textoJson);

        // 3. Obtenemos el diccionario de listados
        const listings = db.listings || {};
        const urls = Object.keys(listings);

        // 4. Imprimimos el resumen
        console.log(`========================================`);
        console.log(`Resumen de Lamudi Scraper JSON DB`);
        console.log(`Versión: ${db.version}`);
        console.log(`Total de propiedades guardadas: ${urls.length}`);
        console.log(`========================================\n`);

        // 5. Recorremos las propiedades
        urls.forEach((url, index) => {
            const prop = listings[url].data;
            console.log(`[Propiedad ${index + 1}]`);
            console.log(`  Precio:      ${prop.precio}`);
            console.log(`  Ubicación:   ${prop.ubicacion}`);
            console.log(`  m² Lote:     ${prop.m2_totales || 'N/A'} | m² Const: ${prop.m2_construidos || 'N/A'}`);
            console.log(`  Recámaras:   ${prop.recamaras} | Baños: ${prop.banos} | Estac: ${prop.estacionamientos}`);
            console.log(`  Dirección:   ${prop.direccion}`);
            console.log(`  URL:         ${url}`);
            console.log(`----------------------------------------`);
        });

    } catch (error) {
        console.error('Error al cargar o procesar el JSON:', error.message);
    }
}

// Llamamos a la función
procesarArchivo();