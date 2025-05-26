import React from 'react';
import PropTypes from 'prop-types';

const QuizResult = ({ estimatedValue, contactInfo, onReset, onComplete }) => {
  // Función para formatear valores monetarios
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="text-center animate-fadeIn">
      <div className="mb-8">
        <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">¡Valuación Completada!</h3>
        <p className="text-gray-600">Basado en la información proporcionada, hemos estimado el valor de tu propiedad.</p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl shadow-sm mb-8">
        <p className="text-gray-700 mb-3 font-medium">El valor estimado de tu propiedad es:</p>
        <div className="text-4xl font-bold text-[#003da4] mb-3">
          {formatCurrency(estimatedValue.average)}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Rango estimado: {formatCurrency(estimatedValue.low)} - {formatCurrency(estimatedValue.high)}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Valor por m²</p>
            <p className="text-xl font-semibold text-gray-800">{formatCurrency(estimatedValue.valuePerSqMeter)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Superficie</p>
            <p className="text-xl font-semibold text-gray-800">{estimatedValue.size} m²</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Información de contacto</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-700">{contactInfo.name}</p>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-700">{contactInfo.email}</p>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-gray-700">{contactInfo.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 text-left">
            <h5 className="text-md font-medium text-blue-800">Próximos pasos</h5>
            <p className="text-sm text-blue-700 mt-1">
              Un asesor inmobiliario especializado se pondrá en contacto contigo en las próximas 24 horas para brindarte una valuación más precisa y personalizada de tu propiedad.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reiniciar Valuación
        </button>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-[#003da4] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contactar Asesor
        </button>
      </div>
    </div>
  );
};

QuizResult.propTypes = {
  estimatedValue: PropTypes.shape({
    low: PropTypes.number.isRequired,
    high: PropTypes.number.isRequired,
    average: PropTypes.number.isRequired,
    valuePerSqMeter: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired
  }).isRequired,
  contactInfo: PropTypes.object.isRequired,
  onReset: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default QuizResult;