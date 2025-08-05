import React, { useState } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaStar, FaShieldAlt, FaCheckCircle, FaInfoCircle, FaCalendarCheck, FaBed, FaUtensils, FaChild, FaCar, FaLeaf } from "react-icons/fa";
import PropuestaModalLeadMagnetPalma from "./PropuestaModalLeadMagnetPalma";

export default function SectionDesarrolloDestacadoPalma() {
  const [showModal, setShowModal] = useState(false);
  const images = [
    { id: 1, src: "/fotosdesarrollo/FACHADA.webp", alt: "Fachada del desarrollo Palma" },
    { id: 2, src: "/fotosdesarrollo/TREBOL 2.webp", alt: "Vista del edificio Palma" },
    { id: 3, src: "/fotosdesarrollo/Patio interior - Trébol II.webp", alt: "Jardín central Palma" },
    { id: 4, src: "/fotosdesarrollo/renders cocina_1 - Photo.webp", alt: "Interior de cocina Palma" },
    { id: 5, src: "/fotosdesarrollo/trebol 3.webp", alt: "Área verde Palma" },
  ];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <section className="w-full flex flex-col items-center justify-center bg-[#d2c8b3] py-10 md:py-14 px-2">
      {/* Caja principal con sombra y bordes redondeados */}
      <div className="relative w-full max-w-6xl mx-auto rounded-3xl shadow-2xl overflow-visible bg-[#4f634b] flex flex-col transition-shadow duration-300 hover:shadow-3xl">
        {/* Logo y texto central superior */}
        <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-0 flex flex-col items-center">
          <img src="/logos/New_RMX_Mark_R4_RGB_cream.png" alt="Logo Remax" className="w-24 h-24 rounded-full shadow-lg border-4 border-[#4f634b] bg-[#4f634b] object-contain" />
          <div className="bg-[#4f634b] px-8 py-2 rounded-b-2xl shadow text-[#d2c8b3] font-extrabold text-xl -mt-2 tracking-wide uppercase flex items-center gap-2">
            <FaLeaf className="text-[#7a8d77]" />
            PALMA DEPARTAMENTOS
          </div>
        </div>
        {/* Layout principal */}
        <div className="flex flex-col md:flex-row w-full pt-24 pb-0 gap-2 md:gap-0">
          {/* Columna izquierda: fondo, textos y contacto */}
          <div className="bg-[#d2c8b3] md:w-1/3 w-full flex flex-col justify-between p-8 text-[#4f634b] min-h-[400px] rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl">
            <div>
              <h2 className="text-4xl font-black mb-2 leading-tight drop-shadow-lg">Departamentos ecológicos en Veracruz</h2>
              <h3 className="text-xl font-semibold mb-6 text-[#4f634b]/80">Vive en armonía con la naturaleza</h3>
              <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-lg text-[#4f634b] text-lg mb-4 w-fit shadow-md">
                <FaPhoneAlt /> <span className="font-bold tracking-wide">22 92 696 629</span>
              </div>
              <ul className="text-[#4f634b]/90 mb-4 space-y-3 text-base">
                <li className="flex items-center gap-3"><FaInfoCircle className="text-[#4f634b]/60 text-xl" /><span>Departamentos de 2 a 3 recámaras desde $1,100,000</span></li>
                <li className="flex items-center gap-3"><FaLeaf className="text-[#4f634b]/60 text-xl" /><span>Desarrollo 100% ecológico</span></li>
                <li className="flex items-center gap-3"><FaMapMarkerAlt className="text-[#4f634b]/60 text-xl" /><span>Zona residencial privilegiada</span></li>
                <li className="flex items-center gap-3"><FaStar className="text-[#4f634b]/60 text-xl" /><span>Áreas verdes y jardines</span></li>
                <li className="flex items-center gap-3"><FaShieldAlt className="text-[#4f634b]/60 text-xl" /><span>Seguridad y tranquilidad</span></li>
                <li className="flex items-center gap-3"><FaCheckCircle className="text-[#4f634b]/60 text-xl" /><span>Calidad RE/MAX CIN</span></li>
              </ul>
            </div>
          </div>
          {/* Columna derecha: imagen principal y galería */}
          <div className="relative md:w-2/3 w-full flex flex-col justify-between bg-[#4f634b] rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl">
            <div className="relative w-full h-56 md:h-80 rounded-tr-3xl overflow-hidden group">
              <img src={selectedImage.src} alt={selectedImage.alt} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
            </div>
            {/* Galería de imágenes */}
            <div className="flex justify-center items-center gap-4 bg-[#4f634b] py-4 px-2 md:px-8 -mt-12 z-10 relative rounded-2xl shadow-lg mx-auto border border-[#d2c8b3] w-fit">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-16 md:w-24 md:h-20 object-cover rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d2c8b3] ${
                    selectedImage.id === img.id ? 'ring-2 ring-[#d2c8b3] shadow-xl' : 'ring-2 ring-transparent hover:scale-105'
                  }`}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Características principales y amenidades */}
        <div className="w-full flex flex-col items-center justify-center bg-[#4f634b] py-8 px-2 border-t border-[#d2c8b3]/10">
          {/* Características principales */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center items-stretch gap-8 mb-8">
            {/* 85 m² con 3 recámaras */}
            <div className="flex-1 flex flex-col items-center bg-[#d2c8b3] rounded-2xl p-6 shadow-md min-w-[250px]">
              <div className="flex gap-2 mb-2">
                <FaBed className="text-4xl text-[#4f634b]" />
                <FaBed className="text-4xl text-[#4f634b]" />
                <FaBed className="text-4xl text-[#4f634b]" />
              </div>
              <div className="text-[#4f634b] text-xl font-bold mb-1">85 m² con 3 recámaras:</div>
              <div className="text-[#4f634b]/80 text-base text-center">Perfecto para familias que buscan tranquilidad y naturaleza.</div>
            </div>
            {/* 65 m² con 2 recámaras */}
            <div className="flex-1 flex flex-col items-center bg-[#d2c8b3] rounded-2xl p-6 shadow-md min-w-[250px]">
              <div className="flex gap-2 mb-2">
                <FaBed className="text-4xl text-[#4f634b]" />
                <FaBed className="text-4xl text-[#4f634b]" />
              </div>
              <div className="text-[#4f634b] text-xl font-bold mb-1">65 m² con 2 recámaras:</div>
              <div className="text-[#4f634b]/80 text-base text-center">Ideal para parejas jóvenes o profesionales.</div>
            </div>
          </div>
          {/* Amenidades ecológicas */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-6 mt-2">
            {/* Sala-comedor con vista al jardín */}
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-3xl text-[#d2c8b3] mb-2" />
              <span className="text-[#d2c8b3] text-base">Sala-comedor con vista al jardín.</span>
            </div>
            {/* Recámara principal con balcón */}
            <div className="flex flex-col items-center text-center">
              <FaBed className="text-3xl text-[#d2c8b3] mb-2" />
              <span className="text-[#d2c8b3] text-base">Recámara principal con balcón privado.</span>
            </div>
            {/* Área de juegos ecológica */}
            <div className="flex flex-col items-center text-center">
              <FaLeaf className="text-3xl text-[#d2c8b3] mb-2" />
              <span className="text-[#d2c8b3] text-base">Jardín central con senderos</span>
            </div>
            {/* Estacionamiento techado */}
            <div className="flex flex-col items-center text-center">
              <FaCar className="text-3xl text-[#d2c8b3] mb-2" />
              <span className="text-[#d2c8b3] text-base">Estacionamiento techado incluido</span>
            </div>
          </div>
        </div>
        {/* Barra inferior: correos, categorías y botones */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#4f634b] py-4 px-4 md:px-8 border-t border-[#d2c8b3]/10 text-[#d2c8b3] text-base gap-4 rounded-b-3xl shadow-inner mt-2">
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-center md:text-left text-sm">
            <span className="font-semibold">E-mail:</span>
            <a href="mailto:remax.cin.veracruz@gmail.com" className="hover:underline cursor-pointer">remax.cin.veracruz@gmail.com</a>           
            <span className="hidden md:inline">|</span>
            <span>Desarrollo Ecológico Residencial</span>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <a href="/desarrollo-palma" className="bg-[#d2c8b3] hover:bg-[#7a8d77] text-[#4f634b] hover:text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all text-base focus:outline-none focus:ring-2 focus:ring-[#d2c8b3]/40 flex items-center justify-center">
              <FaInfoCircle className="mr-2" />
              Más información
            </a>
            <button onClick={() => setShowModal(true)} className="bg-[#4f634b] border-2 border-[#d2c8b3] text-[#d2c8b3] hover:bg-[#d2c8b3] hover:text-[#4f634b] font-bold py-3 px-6 rounded-lg shadow-md transition-all text-base focus:outline-none focus:ring-2 focus:ring-[#d2c8b3]/40 flex items-center justify-center">
              <FaCalendarCheck className="mr-2" />
              Visita Gratis
            </button>
          </div>
        </div>
      </div>
      {showModal && <PropuestaModalLeadMagnetPalma show={showModal} setShow={setShowModal} />}
    </section>
  );
}
