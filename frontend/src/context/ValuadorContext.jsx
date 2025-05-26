import { createContext, useState, useContext } from 'react';

// Crear el contexto
export const ValuadorContext = createContext();

// Hook personalizado para usar el contexto
export const useValuadorContext = () => {
  const context = useContext(ValuadorContext);
  if (!context) {
    throw new Error('useValuadorContext debe ser usado dentro de un ValuadorProvider');
  }
  return context;
};

// Proveedor del contexto
export const ValuadorProvider = ({ children }) => {
  // Estado para almacenar las respuestas del quiz
  const [quizAnswers, setQuizAnswers] = useState({});
  
  // Estado para almacenar el resultado de la valuación
  const [valuationResult, setValuationResult] = useState(null);
  
  // Estado para controlar el paso actual del quiz
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  
  // Estado para controlar si el quiz ha sido completado
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Función para actualizar las respuestas del quiz
  const updateQuizAnswers = (newAnswers) => {
    setQuizAnswers(prev => ({
      ...prev,
      ...newAnswers
    }));
  };

  // Función para reiniciar el quiz
  const resetQuiz = () => {
    setQuizAnswers({});
    setValuationResult(null);
    setCurrentQuizStep(0);
    setQuizCompleted(false);
  };

  // Función para establecer el resultado de la valuación
  const setValuation = (result) => {
    setValuationResult(result);
    setQuizCompleted(true);
  };

  return (
    <ValuadorContext.Provider 
      value={{
        quizAnswers,
        updateQuizAnswers,
        valuationResult,
        setValuation,
        currentQuizStep,
        setCurrentQuizStep,
        quizCompleted,
        setQuizCompleted,
        resetQuiz
      }}
    >
      {children}
    </ValuadorContext.Provider>
  );
};