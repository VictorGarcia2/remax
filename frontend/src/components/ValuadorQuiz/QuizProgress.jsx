import React from 'react';
import PropTypes from 'prop-types';

const QuizProgress = ({ currentStep, totalSteps, showResult }) => {
  // Calcular el porcentaje de progreso
  const progressPercentage = showResult ? 100 : Math.round((currentStep / totalSteps) * 100);
  
  // Generar los pasos para la visualización
  const steps = [];
  for (let i = 0; i < totalSteps; i++) {
    steps.push(i);
  }
  
  return (
    <div className="mb-8">
      {/* Barra de progreso con porcentaje */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">
          {showResult ? 'Resultado' : `Pregunta ${currentStep + 1} de ${totalSteps}`}
        </span>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
          {progressPercentage}% Completado
        </span>
      </div>
      
      {/* Barra de progreso principal */}
      <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
        <div 
          className="bg-[#003da4] h-3 rounded-full transition-all duration-500 ease-in-out shadow-sm" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Indicadores de pasos */}
      <div className="flex justify-between mt-4">
        {steps.map((step) => (
          <div 
            key={step} 
            className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${step <= currentStep ? 'bg-[#003da4] text-white' : 'bg-gray-200 text-gray-500'} ${step === currentStep && !showResult ? 'ring-4 ring-blue-100' : ''}`}
          >
            <span className="text-xs font-medium">{step + 1}</span>
            {step < totalSteps - 1 && (
              <div 
                className={`absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 ${step < currentStep ? 'bg-[#003da4]' : 'bg-gray-200'}`}
              ></div>
            )}
          </div>
        ))}
        {/* Indicador de resultado */}
        <div 
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${showResult ? 'bg-green-500 text-white ring-4 ring-green-100' : 'bg-gray-200 text-gray-500'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

QuizProgress.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  showResult: PropTypes.bool.isRequired
};

export default QuizProgress;