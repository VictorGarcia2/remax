import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MapboxAddressInput from './MapboxAddressInput';

const QuizQuestion = ({
  question,
  currentAnswer,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  loading
}) => {
  // Estado para la respuesta actual
  const [answer, setAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [errors, setErrors] = useState({});

  // Inicializar el estado con la respuesta actual si existe
  useEffect(() => {
    if (currentAnswer) {
      if (question.type === 'multiselect') {
        setSelectedOptions(currentAnswer);
      } else if (question.type === 'contact') {
        setContactInfo(currentAnswer);
      } else {
        setAnswer(currentAnswer);
      }
    } else {
      // Reiniciar el estado si no hay respuesta
      setAnswer('');
      setSelectedOptions([]);
      setContactInfo({});
    }
    // Limpiar errores al cambiar de pregunta
    setErrors({});
  }, [question, currentAnswer]);

  // Validar el formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};

    if (question.type === 'select' && !answer) {
      newErrors.select = 'Por favor selecciona una opción';
    } else if (question.type === 'mapbox') {
      if (!answer || (typeof answer === 'object' && !answer.address)) {
        newErrors.mapbox = 'Por favor ingresa una dirección';
      } else if (typeof answer === 'object' && !answer.houseNumber) {
        newErrors.houseNumber = 'Por favor ingresa el número exterior';
      }
    } else if (question.type === 'number') {
      if (!answer) {
        newErrors.number = 'Por favor ingresa un valor';
      } else if (isNaN(answer) || parseInt(answer) <= 0) {
        newErrors.number = 'Por favor ingresa un número válido';
      }
    } else if (question.type === 'multiselect' && selectedOptions.length === 0) {
      newErrors.multiselect = 'Por favor selecciona al menos una opción';
    } else if (question.type === 'contact') {
      // Validar campos de contacto
      question.fields.forEach(field => {
        if (field.required && !contactInfo[field.id]) {
          newErrors[field.id] = `El campo ${field.label} es requerido`;
        } else if (field.type === 'email' && contactInfo[field.id]) {
          // Validación simple de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(contactInfo[field.id])) {
            newErrors[field.id] = 'Por favor ingresa un correo electrónico válido';
          }
        } else if (field.type === 'tel' && contactInfo[field.id]) {
          // Validación simple de teléfono (10 dígitos)
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(contactInfo[field.id].replace(/\D/g, ''))) {
            newErrors[field.id] = 'Por favor ingresa un número de teléfono válido (10 dígitos)';
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      let answerToSubmit;
      
      if (question.type === 'multiselect') {
        answerToSubmit = selectedOptions;
      } else if (question.type === 'contact') {
        answerToSubmit = contactInfo;
      } else {
        answerToSubmit = answer;
      }
      
      onNext({ [question.id]: answerToSubmit });
    }
  };

  // Manejar cambios en inputs de tipo select y number
  const handleChange = (e) => {
    setAnswer(e.target.value);
  };

  // Manejar cambios en el input de Mapbox
  const handleMapboxChange = (value) => {
    setAnswer(value);
  };

  // Manejar cambios en inputs de tipo multiselect
  const handleMultiSelectChange = (option) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  // Manejar cambios en inputs de tipo contact
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Renderizar el input según el tipo de pregunta
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'mapbox':
        return (
          <div className="mb-6">
            <MapboxAddressInput
              value={answer}
              onChange={handleMapboxChange}
              disabled={loading}
            />
            {errors.mapbox && <p className="text-red-500 text-sm mt-2 font-medium">{errors.mapbox}</p>}
            {errors.houseNumber && <p className="text-red-500 text-sm mt-2 font-medium">{errors.houseNumber}</p>}
          </div>
        );
        
      case 'select':
        return (
          <div className="mb-6">
            <select
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-gray-700 text-lg transition-all"
              value={answer}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Selecciona una opción</option>
              {question.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.select && <p className="text-red-500 text-sm mt-2 font-medium">{errors.select}</p>}
          </div>
        );
      
      case 'number':
        return (
          <div className="mb-6">
            <input
              type="number"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700 text-lg transition-all"
              placeholder={question.placeholder || 'Ingresa un número'}
              value={answer}
              onChange={handleChange}
              min="1"
              disabled={loading}
            />
            {errors.number && <p className="text-red-500 text-sm mt-2 font-medium">{errors.number}</p>}
          </div>
        );
      
      case 'multiselect':
        return (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map(option => (
                <div key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id={option.value}
                    checked={selectedOptions.includes(option.value)}
                    onChange={() => handleMultiSelectChange(option.value)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor={option.value} className="ml-3 block text-gray-700 cursor-pointer w-full">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.multiselect && <p className="text-red-500 text-sm mt-2 font-medium">{errors.multiselect}</p>}
          </div>
        );
      
      case 'contact':
        return (
          <div className="space-y-5">
            {question.fields.map(field => (
              <div key={field.id} className="mb-5">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}{field.required ? ' *' : ''}
                </label>
                <input
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  value={contactInfo[field.id] || ''}
                  onChange={handleContactInfoChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-700 transition-all"
                  required={field.required}
                  disabled={loading}
                  placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                />
                {errors[field.id] && <p className="text-red-500 text-sm mt-2 font-medium">{errors[field.id]}</p>}
              </div>
            ))}
          </div>
        );
      
      default:
        return <p>Tipo de pregunta no soportado</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} id="valuador-form" className="animate-fadeIn">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{question.question}</h3>
        {question.description && (
          <p className="text-gray-600 mb-6">{question.description}</p>
        )}
        {renderQuestionInput()}
      </div>
      
      <div className="flex justify-between mt-10">
        {!isFirstStep ? (
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
        ) : (
          <div></div>
        )}
        
        <button
          type="submit"
          className="px-8 py-3 bg-[#003da4] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium shadow-md"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              {isLastStep ? 'Finalizar' : 'Siguiente'}
              {!isLastStep && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

QuizQuestion.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['select', 'multiselect', 'number', 'contact', 'mapbox']).isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ),
    placeholder: PropTypes.string,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        required: PropTypes.bool,
      })
    ),
  }).isRequired,
  currentAnswer: PropTypes.any,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isFirstStep: PropTypes.bool.isRequired,
  isLastStep: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default QuizQuestion;