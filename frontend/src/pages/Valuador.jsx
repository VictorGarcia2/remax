import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useValuadorContext } from '../context/ValuadorContext';
import SectionFooter from '../components/SectionFooter/SectionFooter';
import ValuadorQuiz from '../components/ValuadorQuiz/ValuadorQuiz';
import Header from '../components/SectionHome/Header';
import { useNavigate } from 'react-router-dom';
import { useSearchContext } from '../context/SearchContext';

const Valuador = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const { quizCompleted, resetQuiz } = useValuadorContext();
  const navigate = useNavigate();
  const { valor } = useSearchContext();
  
  // Verificar si hay un parámetro en la URL que indique mostrar el quiz
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const showQuizParam = searchParams.get('showQuiz');
    
    if (showQuizParam === 'true') {
      resetQuiz();
      setShowQuiz(true);
      setTimeout(() => {
        const quizElement = document.getElementById('valuador-form');
        if (quizElement) {
          quizElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  // Función para manejar la finalización del quiz
  const handleQuizComplete = (answers, estimatedValue) => {
  
  };

  // Función para iniciar el quiz
  const startQuiz = () => {
    navigate('/ValuadorQuiz');
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
      <Header/>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        {/* Header con imagen de fondo */}
        <div className="relative bg-[#003da4] text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#003da4] to-[#002d7a] opacity-90"></div>
          {/* Elementos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full"></div>
            <div className="absolute top-1/2 -right-24 w-64 h-64 bg-white rounded-full"></div>
            <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-white rounded-full"></div>
          </div>
          
          <div className="mt-20 relative container mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">Valuador de Propiedades</h1>
              <p className="text-xl md:text-2xl font-light mb-10 animate-fadeIn" style={{animationDelay: '0.2s'}}>
                Conoce el valor de tu casa o departamento en minutos con nuestro simulador de avalúos
              </p>
              <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-xl animate-fadeIn" style={{animationDelay: '0.3s'}}>
                <p className="text-xl font-medium mb-6">Ingresa tus datos y obtén:</p>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-start">
                    <div className="bg-white/20 rounded-full p-1 mr-3 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg">El valor comercial de tu propiedad con la mayor precisión del mercado</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-white/20 rounded-full p-1 mr-3 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg">El valor por metro cuadrado según las características de tu propiedad</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-white/20 rounded-full p-1 mr-3 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg">Asesoría personalizada de un experto inmobiliario</span>
                  </li>
                </ul>
                <button onClick={startQuiz} className={`inline-block w-full py-4 px-6 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 text-center text-lg shadow-lg transform hover:-translate-y-1 ${
                  valor === "comercial" ? "bg-redRemax text-white" : "bg-blueRemax text-white"
                }`}>
                  Valuar mi propiedad
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            {/* Introducción */}
            <div className="text-center mb-20 animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 relative inline-block">
                ¿Cómo funciona el simulador de avalúo?
                <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-[#003da4] to-[#002d7a] rounded-full"></div>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#003da4] to-[#0052d4] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">
                    1
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-800">Cuéntanos sobre el inmueble</h3>
                  <p className="text-gray-600 leading-relaxed">Son varios los factores que nuestro sistema debe tomar en cuenta para realizar un avalúo preciso de tu propiedad.</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#003da4] to-[#0052d4] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">
                    2
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-800">Análisis de datos profundos</h3>
                  <p className="text-gray-600 leading-relaxed">Nuestro sistema compara los datos de tu propiedad con miles de transacciones realizadas en tu zona.</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#003da4] to-[#0052d4] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">
                    3
                  </div>
                  <h3 className="font-bold text-xl mb-4 text-gray-800">Recibe el avalúo al instante</h3>
                  <p className="text-gray-600 leading-relaxed">Tras realizar un avalúo automatizado, podrás ver en pantalla el valor de tu inmueble junto a datos relevantes.</p>
                </div>
              </div>
              
              {/* CTA para el quiz */}
              <div className="mt-16 bg-gradient-to-r from-[#003da4] to-[#0052d4] p-10 rounded-2xl shadow-xl text-white animate-fadeIn" style={{animationDelay: '0.6s'}}>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para conocer el valor de tu propiedad?</h3>
                <p className="text-lg mb-8 max-w-2xl mx-auto">Nuestro valuador te dará una estimación precisa basada en datos reales del mercado inmobiliario.</p>
                <button 
                  onClick={startQuiz} 
                  className={`inline-block py-4 px-8 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 text-lg shadow-lg transform hover:-translate-y-1 ${
                    valor === "comercial" ? "bg-redRemax text-white" : "bg-blueRemax text-white"
                  }`}
                >
                  Iniciar valuación ahora
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-2xl shadow-xl p-10 mt-20 border border-gray-100 animate-fadeIn" style={{animationDelay: '0.5s'}}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center relative inline-block mx-auto">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#003da4] to-[#0052d4]">¿Por qué valuar tu propiedad?</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-gray-800">Conoce el valor real de tu inversión</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Saber el valor actual de tu propiedad te permite tomar decisiones informadas sobre tu patrimonio y planificar mejor tu futuro financiero.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-gray-800">Prepárate para vender o rentar</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Si estás considerando vender o rentar tu propiedad, conocer su valor de mercado te ayudará a establecer un precio competitivo y realista.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-gray-800">Planifica mejoras con retorno</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Identifica qué mejoras pueden aumentar significativamente el valor de tu propiedad y cuáles tienen mejor retorno de inversión.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-gray-800">Actualiza tus seguros</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Asegúrate de que tu póliza de seguro refleje el valor actual de tu propiedad para estar adecuadamente protegido.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de preguntas frecuentes */}
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 animate-fadeIn" style={{animationDelay: '0.6s'}}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 relative inline-block">
                  Preguntas Frecuentes
                  <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-[#003da4] to-[#0052d4] rounded-full"></div>
                </h2>
                <p className="text-gray-600 mt-6 text-lg">Todo lo que necesitas saber sobre nuestro servicio de valuación</p>
              </div>
              
              <div className="space-y-6 animate-fadeIn" style={{animationDelay: '0.7s'}}>
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800">¿Qué tan precisa es esta valuación?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Esta herramienta proporciona una estimación inicial basada en datos generales del mercado. 
                        Para una valuación más precisa, un asesor inmobiliario realizará un análisis detallado considerando 
                        las características específicas de tu propiedad y comparables en la zona.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800">¿Cuánto tiempo toma recibir una valuación profesional?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Después de completar el formulario, un asesor de REMAX CIN se pondrá en contacto contigo en un plazo 
                        máximo de 24 horas hábiles para coordinar una valuación profesional de tu propiedad.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800">¿Tiene algún costo este servicio?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        La valuación inicial a través de esta herramienta es completamente gratuita. Si decides 
                        solicitar una valuación profesional más detallada, nuestro asesor te informará sobre las opciones disponibles.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-lg shadow-md mr-4 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-3 text-gray-800">¿Qué información necesito tener a mano?</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Para obtener una estimación más precisa, es útil contar con información sobre la ubicación exacta, 
                        metros cuadrados de construcción y terreno, número de habitaciones y baños, antigüedad de la construcción 
                        y características especiales de tu propiedad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de contacto con CTA para el quiz */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 bg-gradient-to-br from-[#003da4] to-[#0052d4] p-12 text-white flex flex-col justify-center animate-fadeIn" style={{animationDelay: '0.8s'}}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para conocer el valor de tu propiedad?</h2>
                    <p className="text-gray-100 mb-8 text-lg">
                      Nuestros asesores inmobiliarios están listos para ayudarte a determinar el valor real de tu propiedad 
                      y asesorarte en todo el proceso de venta o renta.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <a 
                        href="#contacto" 
                        className="inline-block bg-white text-[#003da4] font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300 text-center shadow-lg"
                      >
                        Contactar a un Asesor
                      </a>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 p-12 flex flex-col justify-center animate-fadeIn" style={{animationDelay: '0.9s'}}>
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-[#003da4] to-[#0052d4] p-3 rounded-full shadow-md mr-4">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Valuación Rápida</h3>
                    </div>
                    
                    <p className="text-gray-700 mb-8">
                      Obtén una estimación del valor de tu propiedad en menos de 5 minutos con nuestro cuestionario interactivo.
                    </p>
                    
                    <button 
                      onClick={startQuiz} 
                      className={`inline-block bg-gradient-to-r from-[#003da4] to-[#0052d4] text-white font-bold py-4 px-8 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition duration-300 text-center shadow-md w-full md:w-auto ${
                        valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <span>Iniciar Valuación Ahora</span>
                        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionFooter />
    </>
  );
};

export default Valuador;