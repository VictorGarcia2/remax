const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Función para generar el sitemap
async function updateSitemap() {
  try {
  
    
    // Obtener todas las propiedades desde la API
    const response = await axios.get('https://remaxcin.com/api/propiedades');
    const propiedades = response.data.data.rows;
    
  

    // Crear el encabezado del sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Páginas Principales -->
  <url>
    <loc>https://remaxcin.mx/</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/inicio</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/propiedades</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/NuestroEquipo</loc>
    <priority>0.7</priority>
  </url>
  
  <!-- Páginas Legales -->
  <url>
    <loc>https://remaxcin.mx/Polizas-de-renta</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/terminos-y-condiciones</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/codigo-de-etica</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://remaxcin.mx/politica-de-privacidad</loc>
    <priority>0.5</priority>
  </url>

  <!-- Propiedades Dinámicas -->`;

    // Agregar cada propiedad al sitemap
    propiedades.forEach(propiedad => {
      sitemap += `
  <url>
    <loc>https://remaxcin.mx/propiedades/seleccion/${propiedad.propiedad_id}</loc>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`;
    });

    // Cerrar el sitemap
    sitemap += `
</urlset>`;

    // Guardar el sitemap en el directorio público
    const sitemapPath = path.join(__dirname, '../frontend/public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    
    console.log(`Sitemap actualizado exitosamente en: ${sitemapPath}`);
    console.log(`Total de propiedades indexadas: ${propiedades.length}`);
  } catch (error) {
    console.error('Error al actualizar el sitemap:', error);
  }
}

// Ejecutar la función
updateSitemap();

module.exports = { updateSitemap };