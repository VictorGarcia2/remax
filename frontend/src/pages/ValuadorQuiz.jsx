import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ValuadorQuiz from '../components/ValuadorQuiz/ValuadorQuiz';
import SectionFooter from '../components/SectionFooter/SectionFooter';
import Header from '../components/SectionHome/Header';
import { useSearchContext } from '../context/SearchContext';

const ValuadorQuizPage = () => {
  const navigate = useNavigate();
  const { setSelectedOptionsOperacion, valor } = useSearchContext();

  // Función para manejar la finalización del quiz
  const handleQuizComplete = (answers, estimatedValue) => {
  
  };

  return (
    <>
      <Helmet>
        <title>Valuador de Propiedades | REMAX CIN</title>
        <meta
          name="description"
          content="Conoce el valor de tu propiedad en minutos con nuestro simulador de avalúos. Obtén una valuación precisa y gratuita de tu casa o departamento."
        />
      </Helmet>

      <Header setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
      
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pt-24 w-full">
        {/* Header con imagen de fondo */}
        <div className="relative bg-[#003da4] text-white py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-[#003da4] to-[#002d7a] opacity-90"></div>
          <div className="relative container mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fadeIn">Valuador de Propiedades</h1>
              <p className="text-xl md:text-2xl font-light mb-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
                Conoce el valor de tu casa o departamento en minutos con nuestro simulador de avalúos
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Componente del Quiz */}
            <div id="valuador-form" className="scroll-mt-24 animate-fadeIn" style={{animationDelay: '0.3s'}}>
              <ValuadorQuiz onComplete={handleQuizComplete} />
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-xl shadow-lg p-8 mt-16 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#003da4] mb-6 text-center">¿Por qué es importante una valuación profesional?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-l-4 border-[#003da4] pl-4">
                  <h3 className="font-bold text-xl mb-3">Precisión y confiabilidad</h3>
                  <p className="text-gray-700 mb-4">
                    Una valuación profesional considera factores específicos de tu propiedad que un algoritmo automatizado podría no captar completamente.
                  </p>
                </div>
                <div className="border-l-4 border-[#003da4] pl-4">
                  <h3 className="font-bold text-xl mb-3">Respaldo para decisiones financieras</h3>
                  <p className="text-gray-700 mb-4">
                    Contar con una valuación profesional te brinda un respaldo sólido para negociaciones, trámites bancarios o planificación patrimonial.
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <button 
                  onClick={() => navigate('/valuador')}
                  className={`px-8 py-3 rounded-lg hover:bg-opacity-80 transition-colors font-medium flex items-center mx-auto ${
                    valor === "comercial" ? "bg-redRemax text-white" : "bg-blueRemax text-white"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Volver a la página principal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionFooter />
    </>
  );
};

export default ValuadorQuizPage;