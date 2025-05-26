import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export default function SectionDesarrolloDestacado() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      url: "/fotosdesarrollo/FACHADA.webp",
      title: "Fachada",
    },
    {
      url: "/fotosdesarrollo/Patio interior - Trébol II.webp",
      title: "Patio Interior",
    },
    {
      url: "/fotosdesarrollo/renders cocina_1 - Photo.webp",
      title: "Cocina",
    },
    {
      url: "/fotosdesarrollo/TREBOL 2.webp",
      title: "Exterior",
    },
    {
      url: "/fotosdesarrollo/trebol 3.webp",
      title: "Exterior",
    },
    {
      url: "/fotosdesarrollo/TREBOL 5.0.webp",
      title: "Exterior",
    },
    {
      url: "/fotosdesarrollo/TREBOL RENDER FINAL DE NOCHE AMA copia.webp",
      title: "Fachada de Noche",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <section className="relative w-full py-16 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <motion.img
          key={currentImageIndex}
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].title}
          initial={{ opacity: 1, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent"></div>
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-6 w-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
        >
          <FontAwesomeIcon icon={faChevronRight} className="h-6 w-6" />
        </button>
      </div>

      <div className="relative z-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Desarrollo Destacado
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-blue-200 mb-4">
            TRÉBOL II - Tu Hogar en el Corazón de Veracruz
          </h3>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Descubre tu próxima hogar con espacios únicos diseñados para tu
            familia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
              <h3 className="text-2xl font-semibold mb-4">
                ¿Por qué elegir TRÉBOL II?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <h4 className="font-semibold">A 15 minutos de todo:</h4>
                    <ul className="list-disc ml-6 text-sm text-gray-300">
                      <li>Centro Histórico</li>
                      <li>Playas de Veracruz</li>
                      <li>Ciudad Industrial</li>
                      <li>Centros comerciales</li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <h4 className="font-semibold">Vida a tu alrededor:</h4>
                    <ul className="list-disc ml-6 text-sm text-gray-300">
                      <li>Supermercados (Soriana, Chedraui)</li>
                      <li>Escuelas y universidades</li>
                      <li>Clínicas y servicios médicos</li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 mr-3 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <h4 className="font-semibold">Todos incluyen:</h4>
                    <ul className="list-disc ml-6 text-sm text-gray-300">
                      <li>Cocina integral</li>
                      <li>Sala-comedor</li>
                      <li>Cuarto de lavado</li>
                      <li>Recámara principal con baño completo</li>
                      <li>Estacionamiento</li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
            <a href="https://treboldepartamentos.com/" target="_blank">
              <motion.button
                className="w-full bg-gradient-to-r from-blueRemax to-blueRemax hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>¡Conócelo ahora!</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-video rounded-lg overflow-hidden shadow-2xl group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <motion.img
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h4 className="text-lg font-semibold">
                {images[currentImageIndex].title}
              </h4>
              <p className="text-sm text-gray-200">
                Haz clic para ver más detalles
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
