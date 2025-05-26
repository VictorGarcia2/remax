import React from 'react';
import { Link } from 'react-router-dom';

const ValuadorButton = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-4 sm:px-6 lg:px-8 my-16 rounded-2xl shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
              ¿Quieres saber cuánto vale tu propiedad?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Utiliza nuestro valuador de propiedades gratuito y obtén una estimación del valor de tu casa o departamento en minutos.
            </p>
            <ul className="mt-6 space-y-2 text-left hidden md:block">
              <li className="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Valuación inmediata y gratuita
              </li>
              <li className="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basada en datos del mercado actual
              </li>
              <li className="flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Asesoría personalizada de expertos
              </li>
            </ul>
          </div>
          
          <div className="md:w-1/3 flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-md text-center w-full max-w-sm border border-gray-100">
              <div className="mb-4 inline-block p-3 bg-blue-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#003da4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Valuador de Propiedades</h3>
              <p className="text-gray-600 mb-6">Conoce el valor de tu propiedad en el mercado actual en solo unos minutos.</p>
              <Link
                to="/valuador?showQuiz=true"
                className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#003da4] hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Valuar mi propiedad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuadorButton;