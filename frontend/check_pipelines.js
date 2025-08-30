// Script para verificar todos los pipelines disponibles en Pipedrive
const PIPEDRIVE_API_KEY = "02317c5467585c4251d802ab65e0c7b9f60541ee";
const PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1";

async function checkPipelines() {
  try {
    console.log("🔍 Consultando pipelines disponibles...\n");
    
    const response = await fetch(`${PIPEDRIVE_API_URL}/pipelines?api_token=${PIPEDRIVE_API_KEY}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log("📋 PIPELINES DISPONIBLES:");
      console.log("=" * 50);
      
      data.data.forEach(pipeline => {
        console.log(`ID: ${pipeline.id}`);
        console.log(`Nombre: ${pipeline.name}`);
        console.log(`URL: https://remaxcin.pipedrive.com/pipeline/${pipeline.id}/user/everyone`);
        console.log(`Activo: ${pipeline.active ? 'Sí' : 'No'}`);
        console.log("-".repeat(30));
      });
      
      console.log("\n🎯 PIPELINES ACTUALMENTE USADOS EN EL CÓDIGO:");
      console.log("- Trébol II: Pipeline ID 1");
      console.log("- Torre Palma: Pipeline ID 4");
      console.log("- Reclutamiento: Pipeline ID 2");
      console.log("- Pólizas: Pipeline ID 1");
      
    } else {
      console.error("❌ Error al obtener pipelines:", data);
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
}

checkPipelines();
