// Debug script para verificar que los formularios envían al pipeline correcto
console.log('🔍 VERIFICANDO CONFIGURACIÓN DE PIPELINES');
console.log('==========================================');

// Verificar si las constantes están definidas correctamente
try {
  // Esto solo funciona si el script se ejecuta en el contexto de la página
  console.log('📋 Verificando configuración...');
  
  const configuraciones = {
    'DesarrolloPalma.jsx': 'Pipeline ID 4',
    'PropuestaModalPalma.jsx': 'Pipeline ID 4',
    'DesarrolloTrebolII.jsx': 'Pipeline ID 1',
    'PropuestaModalLeadMagnet.jsx': 'Pipeline ID 2'
  };
  
  console.log('📊 CONFIGURACIÓN ACTUAL:');
  Object.entries(configuraciones).forEach(([archivo, pipeline]) => {
    console.log(`${archivo}: ${pipeline}`);
  });
  
  console.log('\n🎯 PARA DEPURAR EN EL NAVEGADOR:');
  console.log('1. Abre las herramientas de desarrollador (F12)');
  console.log('2. Ve a la pestaña "Network"');
  console.log('3. Envía un formulario de Torre Palma');
  console.log('4. Busca la petición a "/deals"');
  console.log('5. Revisa el payload que se envía');
  console.log('6. Verifica que pipeline_id sea 4');
  
} catch (error) {
  console.error('Error en el debug:', error);
}
