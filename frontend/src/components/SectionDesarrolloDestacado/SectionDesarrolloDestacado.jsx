import React, { useState } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaStar, FaShieldAlt, FaCheckCircle, FaInfoCircle, FaCalendarCheck } from "react-icons/fa";
import PropuestaModalLeadMagnet from "./PropuestaModalLeadMagnet";

export default function SectionDesarrolloDestacado() {
  const [showModal, setShowModal] = useState(false);
  const images = [
    { id: 1, src: "/fotosdesarrollo/FACHADA.webp", alt: "Fachada del desarrollo" },
    { id: 2, src: "/fotosdesarrollo/TREBOL 2.webp", alt: "Vista del edificio" },
    { id: 3, src: "/fotosdesarrollo/Patio interior - Trébol II.webp", alt: "Patio interior" },
    { id: 4, src: "/fotosdesarrollo/renders cocina_1 - Photo.webp", alt: "Interior de cocina" },
    { id: 5, src: "/fotosdesarrollo/trebol 3.webp", alt: "Otra vista del edificio" },
  ];
  const [selectedImage, setSelectedImage] = useState(images[0]);


  return (
    <section className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-blueRemax via-blue-900 to-blue-800 py-0 md:py-14 px-2">
      {/* Caja principal con sombra y bordes redondeados */}
      <div className="relative w-full max-w-6xl mx-auto rounded-3xl shadow-2xl overflow-visible bg-white flex flex-col transition-shadow duration-300 hover:shadow-3xl">
        {/* Logo y texto central superior */}
        <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20 flex flex-col items-center">
          <img src="/logos/New_RMX_Mark_R4_RGB_cream.png" alt="Logo Remax" className="w-24 h-24 rounded-full shadow-lg border-4 border-white bg-blueRemax object-contain" />
          <div className="bg-white px-8 py-2 rounded-b-2xl shadow text-blueRemax font-extrabold text-xl -mt-2 tracking-wide uppercase">TRÉBOL II</div>
        </div>
        {/* Layout principal */}
        <div className="flex flex-col md:flex-row w-full pt-24 pb-0 gap-2 md:gap-0">
          {/* Columna izquierda: fondo azul, textos y contacto */}
          <div className="bg-blueRemax md:w-1/3 w-full flex flex-col justify-between p-8 text-white min-h-[400px] rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl">
            <div>
              <h2 className="text-4xl font-black mb-2 leading-tight drop-shadow-lg">ENCUENTRA TU HOGAR</h2>
              <h3 className="text-xl font-semibold mb-6 text-blue-100">Vive en el corazón de Veracruz</h3>
              <div className="flex items-center gap-2 bg-blue-900/80 px-4 py-2 rounded-lg text-white text-lg mb-4 w-fit shadow-md">
                <FaPhoneAlt /> <span className="font-bold tracking-wide">229 123 4567</span>
              </div>
              <a href="https://www.remaxcin.com" className="underline text-blue-200 text-base block mb-6 hover:text-white transition">www.remaxcin.com</a>
              <ul className="text-white/90 mb-4 space-y-3 text-base">
                <li className="flex items-center gap-3"><FaMapMarkerAlt className="text-blue-300 text-xl" /><span>Ubicación privilegiada</span></li>
                <li className="flex items-center gap-3"><FaStar className="text-blue-300 text-xl" /><span>Amenidades exclusivas</span></li>
                <li className="flex items-center gap-3"><FaShieldAlt className="text-blue-300 text-xl" /><span>Seguridad 24/7</span></li>
                <li className="flex items-center gap-3"><FaCheckCircle className="text-blue-300 text-xl" /><span>Calidad RE/MAX CIN</span></li>
              </ul>
            </div>
          </div>
          {/* Columna derecha: imagen principal y galería */}
          <div className="relative md:w-2/3 w-full flex flex-col justify-between bg-white rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl">
            <div className="relative w-full h-56 md:h-80 rounded-tr-3xl overflow-hidden group">
              <img src={selectedImage.src} alt={selectedImage.alt} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
            </div>
            {/* Galería de imágenes */}
            <div className="flex justify-center items-center gap-4 bg-white py-4 px-2 md:px-8 -mt-12 z-10 relative rounded-2xl shadow-lg mx-auto border border-blue-100 w-fit">
              {images.map((img) => (
                <img
                  key={img.id}
                  src={img.src}
                  alt={img.alt}
                  className={`w-20 h-16 md:w-24 md:h-20 object-cover rounded-xl border-2 transition-all duration-300 hover:shadow-2xl cursor-pointer ${selectedImage.id === img.id ? 'border-blueRemax scale-110 shadow-xl' : 'border-transparent hover:scale-105'}`}
                  onClick={() => setSelectedImage(img)}
                  tabIndex={0}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Barra inferior: correos, categorías y botones */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white py-4 px-4 md:px-8 border-t border-blue-100 text-blue-900 text-base gap-4 rounded-b-3xl shadow-inner mt-2">
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-center md:text-left text-sm">
            <span className="font-semibold">E-mail:</span>
            <a href="mailto:remax.cin.veracruz@gmail.com" className="hover:underline cursor-pointer">remax.cin.veracruz@gmail.com</a>           
            <span className="hidden md:inline">|</span>
            <span>Desarrollo Residencial</span>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <a href="/desarrollo-trebol-ii" className="bg-gradient-to-r from-blueRemax to-blue-700 hover:from-blue-800 hover:to-blueRemax text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all text-base focus:outline-none focus:ring-2 focus:ring-blueRemax/40 flex items-center justify-center">
              <FaInfoCircle className="mr-2" />
              Más información
            </a>
            <button onClick={() => setShowModal(true)} className="bg-white border-2 border-blueRemax text-blueRemax hover:bg-blueRemax hover:text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all text-base focus:outline-none focus:ring-2 focus:ring-blueRemax/40 flex items-center justify-center">
              <FaCalendarCheck className="mr-2" />
              Visita Gratis
            </button>
          </div>
        </div>
      </div>
      {showModal && <PropuestaModalLeadMagnet show={showModal} setShow={setShowModal} />}
    </section>
  );
}
