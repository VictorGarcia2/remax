import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
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