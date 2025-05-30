import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import QuizQuestion from "./QuizQuestion";
import QuizProgress from "./QuizProgress";
import QuizResult from "./QuizResult";
import Header from "../SectionHome/Header";
import SectionFooter from "../SectionFooter/SectionFooter";

const ValuadorQuiz = ({ onComplete, address }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [estimatedValue, setEstimatedValue] = useState(null);
  const [loading, setLoading] = useState(false);

  // Efecto para establecer la dirección si se proporciona
  useEffect(() => {
    if (address) {
      setAnswers((prev) => ({
        ...prev,
        address: address,
      }));
    }
  }, [address]);

  // Preguntas del quiz
  const questions = [
    {
      id: "location",
      question: "¿Cuál es la dirección de tu propiedad?",
      description:
        "La ubicación es uno de los factores más importantes para determinar el valor de una propiedad.",
      type: "mapbox",
    },
    {
      id: "propertyType",
      question: "¿Qué tipo de propiedad deseas valuar?",
      description:
        "El tipo de propiedad determina diferentes factores de valoración en el mercado inmobiliario.",
      type: "select",
      options: [
        { value: "casa", label: "Casa" },
        { value: "departamento", label: "Departamento" },
        { value: "terreno", label: "Terreno" },
        { value: "local", label: "Local Comercial" },
        { value: "oficina", label: "Oficina" },
      ],
    },
    {
      id: "size",
      question:
        "¿Cuál es el tamaño aproximado de tu propiedad en metros cuadrados?",
      description:
        "El tamaño es un factor clave para determinar el valor base de tu propiedad.",
      type: "number",
      placeholder: "Ej: 120",
    },
    {
      id: "bedrooms",
      question: "¿Cuántas habitaciones tiene tu propiedad?",
      description:
        "El número de habitaciones afecta directamente el valor de mercado de una vivienda.",
      type: "select",
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5+", label: "5 o más" },
        { value: "na", label: "No aplica" },
      ],
    },
    {
      id: "bathrooms",
      question: "¿Cuántos baños tiene tu propiedad?",
      description:
        "El número de baños es un factor importante en la valoración de una propiedad.",
      type: "select",
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4+", label: "4 o más" },
        { value: "na", label: "No aplica" },
      ],
    },
    {
      id: "age",
      question: "¿Cuál es la antigüedad aproximada de la construcción?",
      description:
        "La antigüedad afecta el valor de la propiedad debido a la depreciación y el estado general.",
      type: "select",
      options: [
        { value: "nueva", label: "Nueva o en construcción" },
        { value: "1-5", label: "1-5 años" },
        { value: "6-10", label: "6-10 años" },
        { value: "11-20", label: "11-20 años" },
        { value: "20+", label: "Más de 20 años" },
        { value: "na", label: "No aplica" },
      ],
    },
    {
      id: "condition",
      question: "¿En qué estado se encuentra la propiedad?",
      description:
        "El estado de conservación impacta significativamente en el valor de mercado.",
      type: "select",
      options: [
        { value: "excelente", label: "Excelente" },
        { value: "bueno", label: "Bueno" },
        { value: "regular", label: "Regular" },
        { value: "necesitaRemodelacion", label: "Necesita remodelación" },
      ],
    },
    {
      id: "amenities",
      question: "¿Qué amenidades tiene la propiedad?",
      description:
        "Las amenidades y características adicionales pueden aumentar significativamente el valor.",
      type: "multiselect",
      options: [
        { value: "estacionamiento", label: "Estacionamiento" },
        { value: "jardin", label: "Jardín" },
        { value: "alberca", label: "Alberca" },
        { value: "seguridad", label: "Seguridad 24/7" },
        { value: "gimnasio", label: "Gimnasio" },
        { value: "areaComun", label: "Áreas comunes" },
      ],
    },
    {
      id: "contactInfo",
      question: "¿Cómo podemos contactarte para darte más información?",
      description:
        "Un asesor inmobiliario se pondrá en contacto contigo para brindarte una valuación más precisa.",
      type: "contact",
      fields: [
        { id: "name", label: "Nombre completo", type: "text", required: true },
        {
          id: "email",
          label: "Correo electrónico",
          type: "email",
          required: true,
        },
        { id: "phone", label: "Teléfono", type: "tel", required: true },
      ],
    },
  ];

  // Calcular el valor estimado basado en las respuestas
  const calculateEstimatedValue = () => {
    setLoading(true);

    setTimeout(() => {
      // Ya no usamos valores base por zona predefinidos
      // Ahora el valor base se calcula según la dirección real

      // Factores multiplicadores por tipo de propiedad
      const propertyTypeMultipliers = {
        casa: 1.0,
        departamento: 0.9,
        terreno: 0.7,
        local: 1.2,
        oficina: 1.1,
      };

      // Factores por condición
      const conditionMultipliers = {
        excelente: 1.2,
        bueno: 1.0,
        regular: 0.8,
        necesitaRemodelacion: 0.6,
      };

      // Factores por antigüedad
      const ageMultipliers = {
        nueva: 1.3,
        "1-5": 1.2,
        "6-10": 1.0,
        "11-20": 0.8,
        "20+": 0.7,
        na: 1.0,
      };

      // Cálculo básico
      const propertyType = answers.propertyType || "casa";
      const size = parseInt(answers.size) || 100;
      const condition = answers.condition || "bueno";
      const age = answers.age || "6-10";
      const locationData = answers.location || {};
      const address =
        typeof locationData === "object"
          ? locationData.fullAddress || locationData.address || ""
          : locationData;

      // Valor base por metro cuadrado basado en la dirección
      // Usamos un algoritmo simple basado en la dirección para determinar el valor base
      let baseValuePerSqMeter = 15000; // Valor predeterminado

      // Análisis básico de la dirección para determinar el valor
      if (address) {
        const addressLower = address.toLowerCase();
        // Ajustar valor según palabras clave en la dirección
        if (
          addressLower.includes("lomas") ||
          addressLower.includes("reforma") ||
          addressLower.includes("polanco")
        ) {
          baseValuePerSqMeter = 25000; // Zonas premium
        } else if (
          addressLower.includes("centro") ||
          addressLower.includes("condesa") ||
          addressLower.includes("roma")
        ) {
          baseValuePerSqMeter = 20000; // Zonas de alto valor
        } else if (
          addressLower.includes("industrial") ||
          addressLower.includes("obrera")
        ) {
          baseValuePerSqMeter = 12000; // Zonas industriales
        } else if (
          addressLower.includes("periferia") ||
          addressLower.includes("ecatepec")
        ) {
          baseValuePerSqMeter = 8000; // Zonas periféricas
        }
      }

      // Aplicar multiplicadores
      const adjustedValue =
        baseValuePerSqMeter *
        propertyTypeMultipliers[propertyType] *
        conditionMultipliers[condition] *
        ageMultipliers[age];

      // Valor total estimado
      const totalEstimatedValue = adjustedValue * size;

      // Rango de valores (±10%)
      const lowerRange = Math.floor(totalEstimatedValue * 0.9);
      const upperRange = Math.ceil(totalEstimatedValue * 1.1);

      // Valor por metro cuadrado
      const valuePerSqMeter = Math.floor(adjustedValue);

      setEstimatedValue({
        low: lowerRange,
        high: upperRange,
        average: Math.floor(totalEstimatedValue),
        valuePerSqMeter: valuePerSqMeter,
        size: size,
        address: address,
      });

      setLoading(false);
    }, 2000);
  };

  // Manejar el avance al siguiente paso
  const handleNext = (stepAnswers) => {
    const updatedAnswers = { ...answers, ...stepAnswers };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({
        top: document.getElementById("valuador-form").offsetTop - 100,
        behavior: "smooth",
      });
    } else {
      calculateEstimatedValue();
    }
  };

  // Manejar el retroceso al paso anterior
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({
        top: document.getElementById("valuador-form").offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  // Reiniciar el quiz
  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setEstimatedValue(null);
  };

  // Manejar la finalización del quiz
  const handleComplete = () => {
    if (onComplete) {
      onComplete(answers, estimatedValue);
    }
    navigate("/inicio");
  };

  // Renderizar el componente actual según el paso
  const renderCurrentStep = () => {
    if (estimatedValue) {
      return (
        <QuizResult
          estimatedValue={estimatedValue}
          contactInfo={answers.contactInfo}
          onReset={handleReset}
          onComplete={handleComplete}
        />
      );
    }

    const currentQuestion = questions[currentStep];
    return (
      <QuizQuestion
        question={currentQuestion}
        currentAnswer={answers[currentQuestion.id]}
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === questions.length - 1}
        loading={loading}
      />
    );
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003da4] mb-6 text-center">
            Valuador de Propiedades REMAX CIN
          </h2>

          <QuizProgress
            currentStep={currentStep}
            totalSteps={questions.length}
            showResult={estimatedValue !== null}
          />

          <div className="mt-8">{renderCurrentStep()}</div>

          <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
            <p>
              Tus datos están seguros. No compartiremos tu información con
              terceros sin tu consentimiento.
            </p>
          </div>
        </div>
      </div>
      <SectionFooter/>
    </>
  );
};

ValuadorQuiz.propTypes = {
  onComplete: PropTypes.func,
  address: PropTypes.string,
};

export default ValuadorQuiz;
