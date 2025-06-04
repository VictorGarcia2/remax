import React, { useEffect, useState } from 'react';

const LoadingSpinner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detectar cuando el contenido principal se ha cargado
    const handleContentLoaded = () => {
      // Esperar un poco para asegurar que el contenido se muestre correctamente
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    };

    // Verificar si el documento ya está completamente cargado
    if (document.readyState === 'complete') {
      handleContentLoaded();
    } else {
      // Si no está cargado, agregar un listener para el evento load
      window.addEventListener('load', handleContentLoaded);
      
      // También establecer un timeout de seguridad para ocultar el spinner
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // 3 segundos máximo de espera
      
      return () => {
        window.removeEventListener('load', handleContentLoaded);
        clearTimeout(timeout);
      };
    }
  }, []);

  // Si no es visible, no renderizar nada
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-300">
      <div className="relative">
        <img
          src="/logos/New_RMX_Mark_R4_RGB_dark.png"
          alt="Cargando..."
          className="w-40 h-auto animate-pulse"
        />
        <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-red-600 rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;