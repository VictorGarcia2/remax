import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPhoneAlt, FaMapMarkerAlt, FaStar, FaShieldAlt, FaCheckCircle, FaInfoCircle, FaCalendarCheck, FaBed, FaUtensils, FaChild, FaCar, FaChevronLeft, FaChevronRight, FaHome, FaLeaf, FaExternalLinkAlt } from "react-icons/fa";
import PropuestaModalLeadMagnet from "./PropuestaModalLeadMagnet";
import PropuestaModalPalma from "./PropuestaModalPalma";

export default function SectionDesarrollosSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showModalTrebol, setShowModalTrebol] = useState(false);
  const [showModalPalma, setShowModalPalma] = useState(false);
  const [selectedImageTrebol, setSelectedImageTrebol] = useState(null);
  const [selectedImagePalma, setSelectedImagePalma] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Datos de los desarrollos
  const desarrollos = [
    {
      id: 'trebol',
      name: 'TRÉBOL II',
      title: 'Departamentos en venta en Veracruz',
      subtitle: 'Vive en el corazón de la ciudad',
      phone: '22 92 696 629',
      priceFrom: '$1,250,000',
      email: 'remax.cin.veracruz@gmail.com',
      category: 'Desarrollo Residencial',
      link: '/desarrollo-trebol-ii',
      mapLink: 'https://maps.app.goo.gl/ejemplo-trebol', // Se puede actualizar con la ubicación real
      logo: '/logos/New_RMX_Mark_R4_RGB_cream.png',
      bgColor: 'bg-[#005156]',
      textColor: 'text-[#005156]',
      lightBg: 'bg-[#f2efe2]',
      lightText: 'text-[#f2efe2]',
      features: [
        { icon: FaInfoCircle, text: 'Departamentos de 2 a 3 recámaras desde $1,250,000' },
        { icon: FaMapMarkerAlt, text: 'Ubicación privilegiada' },
        { icon: FaStar, text: 'Amenidades exclusivas' },
        { icon: FaShieldAlt, text: 'Seguridad 24/7' },
        { icon: FaCheckCircle, text: 'Calidad RE/MAX CIN' }
      ],
      images: [
        { id: 1, src: '/fotosdesarrollo/FACHADA.webp', alt: 'Fachada del desarrollo' },
        { id: 2, src: '/fotosdesarrollo/TREBOL 2.webp', alt: 'Vista del edificio' },
        { id: 3, src: '/fotosdesarrollo/Patio interior - Trébol II.webp', alt: 'Patio interior' },
        { id: 4, src: '/fotosdesarrollo/renders cocina_1 - Photo.webp', alt: 'Interior de cocina' },
        { id: 5, src: '/fotosdesarrollo/trebol 3.webp', alt: 'Otra vista del edificio' }
      ],
      units: [
        {
          size: '90 m²',
          rooms: 3,
          description: 'Perfecto para familias que buscan espacio y confort.',
          icons: [FaBed, FaBed, FaBed]
        },
        {
          size: '70 m²',
          rooms: 2,
          description: 'Ideal para parejas o familias pequeñas.',
          icons: [FaBed, FaBed]
        }
      ],
      amenities: [
        { icon: FaUtensils, text: 'Sala-comedor amplios' },
        { icon: FaBed, text: 'Recámara principal con clóset y baño completo' },
        { icon: FaChild, text: 'Área de juegos' },
        { icon: FaCar, text: 'Cajón de estacionamiento incluido' }
      ]
    },
    {
      id: 'palma',
      name: 'Palma Departamentos',
      title: 'Palma Departamentos en Boca del Río',
      subtitle: 'Diseño contemporáneo',
      phone: '22 92 696 629',
      priceFrom: '$1,750,000',
      email: 'remax.cin.veracruz@gmail.com',
      category: 'Desarrollo Premium',
      link: '/desarrollo-palma',
      mapLink: 'https://maps.app.goo.gl/G6vDciZXxCUct7S67',
      logo: '/logos/New_RMX_Mark_R4_RGB_cream.png',
      bgColor: 'bg-[#4f634b]',
      textColor: 'text-[#4f634b]',
      lightBg: 'bg-[#f5f3f0]',
      lightText: 'text-[#d2c8b3]',
      features: [
        { icon: FaHome, text: 'Departamentos de 1 a 2 recámaras desde $1,750,000' },
        { icon: FaMapMarkerAlt, text: 'Ubicación estratégica' },
        { icon: FaLeaf, text: 'Diseño arquitectónico contemporáneo' },
        { icon: FaShieldAlt, text: 'Seguridad y privacidad' },
        { icon: FaCheckCircle, text: 'Cocina Integral' }
      ],
      images: [
        { id: 1, src: '/DesarrolloPalma/FACHADA.webp', alt: 'Fachada Torre Palma 347' },
        { id: 2, src: '/DesarrolloPalma/PALMA-SALA-COMEDOR.jpeg', alt: 'Sala-Comedor' },
        { id: 3, src: '/DesarrolloPalma/PALMA-COCINA.jpeg', alt: 'Cocina Integral' },
        { id: 4, src: '/DesarrolloPalma/PALMA- REC 1.jpeg', alt: 'Recámara Principal' },
        { id: 5, src: '/DesarrolloPalma/PALMA-REC 2.jpeg', alt: 'Segunda Recámara' },
        { id: 6, src: '/DesarrolloPalma/PALMA-ROOF TOP.jpeg', alt: 'Roof Top' }
      ],
      units: [
        {
          size: '70.75 m²',
          rooms: 1,
          description: 'Departamentos de 1 recámara con estudio.',
          icons: [FaBed]
        },
        {
          size: '76.5—87.45 m²',
          rooms: 2,
          description: 'Departamentos de 2 recámaras con espacios amplios.',
          icons: [FaBed, FaBed]
        }
      ],
      amenities: [
        { icon: FaHome, text: 'Departamentos completamente equipados' },
        { icon: FaHome, text: 'Acabados de primera calidad' },
        { icon: FaCar, text: '1 cajón de estacionamiento' },
        { icon: FaShieldAlt, text: 'Acceso controlado' }
      ]
    }
  ];

  // Autoplay functionality
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % desarrollos.length);
  }, [desarrollos.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + desarrollos.length) % desarrollos.length);
  }, [desarrollos.length]);

  const resetAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isAutoPlaying) {
      intervalRef.current = setInterval(nextSlide, 8000);
    }
  }, [nextSlide, isAutoPlaying]);

  // Inicialización de imágenes
  useEffect(() => {
    if (desarrollos.length > 0) {
      if (!selectedImageTrebol && desarrollos[0]?.images?.length > 0) {
        setSelectedImageTrebol(desarrollos[0].images[0]);
      }
      if (!selectedImagePalma && desarrollos[1]?.images?.length > 0) {
        setSelectedImagePalma(desarrollos[1].images[0]);
      }
    }
  }, [desarrollos, selectedImageTrebol, selectedImagePalma]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetAutoplay]);

  useEffect(() => {
    if (desarrollos[currentSlide]?.images?.length > 0) {
      if (currentSlide === 0 && !selectedImageTrebol) {
        setSelectedImageTrebol(desarrollos[0].images[0]);
      } else if (currentSlide === 1 && !selectedImagePalma) {
        setSelectedImagePalma(desarrollos[1].images[0]);
      }
    }
  }, [currentSlide, desarrollos, selectedImageTrebol, selectedImagePalma]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handlePrevClick = () => {
    prevSlide();
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleNextClick = () => {
    nextSlide();
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const currentDesarrollo = desarrollos[currentSlide];
  const selectedImage = currentSlide === 0 ? selectedImageTrebol : selectedImagePalma;
  
  console.log('Current slide:', currentSlide, 'Selected image:', selectedImage);
  
  const handleImageClick = (img) => {
    console.log('Image clicked:', img, 'Current slide:', currentSlide);
    if (currentSlide === 0) {
      setSelectedImageTrebol(img);
      console.log('Setting Trebol image:', img);
    } else {
      setSelectedImagePalma(img);
      console.log('Setting Palma image:', img);
    }
  };

  return (
    <section className="w-full pt-19 flex flex-col items-center justify-center bg-[#f2efe2] py-6 sm:py-10 md:py-14 px-2 sm:px-4 relative overflow-hidden">
      {/* Navegación de slides */}
      <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-20 flex items-center  gap-2 sm:gap-4">
        <div className="flex gap-1 sm:gap-2">
          {desarrollos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? currentDesarrollo.bgColor.replace('bg-', 'bg-') 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={handlePrevClick}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${currentDesarrollo.bgColor} ${currentDesarrollo.lightText} flex items-center justify-center hover:opacity-80 transition-opacity`}
          aria-label="Slide anterior"
        >
          <FaChevronLeft className="text-xs sm:text-sm" />
        </button>
        <button
          onClick={handleNextClick}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${currentDesarrollo.bgColor} ${currentDesarrollo.lightText} flex items-center justify-center hover:opacity-80 transition-opacity`}
          aria-label="Siguiente slide"
        >
          <FaChevronRight className="text-xs sm:text-sm" />
        </button>
      </div>

      {/* Caja principal con sombra y bordes redondeados */}
      <div className={`relative w-full max-w-6xl mx-auto rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-visible ${currentDesarrollo.bgColor} flex flex-col transition-all duration-500 hover:shadow-3xl`}>
        
        {/* Logo y texto central superior */}
        <div className="absolute left-1/2 -top-8 sm:-top-12 -translate-x-1/2 z-10 flex flex-col items-center">
          <img 
            src={currentDesarrollo.logo} 
            alt="Logo Remax" 
            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full shadow-lg border-2 sm:border-4 ${currentDesarrollo.bgColor} object-contain`}
          />
          <div className={`${currentDesarrollo.bgColor} px-4 sm:px-6 md:px-8 py-1 sm:py-2 rounded-b-xl sm:rounded-b-2xl shadow ${currentDesarrollo.lightText} font-bold sm:font-extrabold text-sm sm:text-lg md:text-xl -mt-1 sm:-mt-2 tracking-wide uppercase`}>
            {currentDesarrollo.name}
          </div>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col md:flex-row w-full pt-16 sm:pt-20 md:pt-24 pb-0 gap-1 sm:gap-2 md:gap-0">
          
          {/* Columna izquierda: fondo, textos y contacto */}
          <div className={`${currentDesarrollo.lightBg} md:w-1/3 w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 ${currentDesarrollo.textColor} min-h-[350px] sm:min-h-[400px] rounded-t-2xl sm:rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl`}>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 leading-tight drop-shadow-lg">
                {currentDesarrollo.title}
              </h2>
              <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${currentDesarrollo.textColor}/80`}>
                {currentDesarrollo.subtitle}
              </h3>
              <div className={`flex items-center gap-2 bg-black/10 px-3 sm:px-4 py-2 rounded-lg ${currentDesarrollo.textColor} text-base sm:text-lg mb-3 sm:mb-4 w-fit shadow-md`}>
                <FaPhoneAlt className="text-sm sm:text-base" /> 
                <span className="font-bold tracking-wide text-sm sm:text-base">{currentDesarrollo.phone}</span>
              </div>
              <ul className={`${currentDesarrollo.textColor}/90 mb-3 sm:mb-4 space-y-2 sm:space-y-3 text-sm sm:text-base`}>
                {currentDesarrollo.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 sm:gap-3">
                    <feature.icon className={`${currentDesarrollo.textColor}/60 text-lg sm:text-xl flex-shrink-0`} />
                    <span className="leading-tight">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Columna derecha: imagen principal y galería */}
          <div className={`relative md:w-2/3 w-full flex flex-col justify-between ${currentDesarrollo.bgColor} rounded-b-2xl sm:rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl`}>
            <div className="relative w-full h-48 sm:h-56 md:h-80 rounded-tr-2xl sm:rounded-tr-3xl overflow-hidden group">
              <img 
                src={selectedImage?.src || currentDesarrollo.images[0]?.src} 
                alt={selectedImage?.alt || currentDesarrollo.images[0]?.alt} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
            </div>

            {/* Galería de imágenes */}
            <div className={`flex justify-center items-center gap-2 sm:gap-4 ${currentDesarrollo.bgColor} py-2 sm:py-4 px-2 md:px-8 -mt-8 sm:-mt-12 z-10 relative rounded-xl sm:rounded-2xl shadow-lg mx-auto border ${currentDesarrollo.lightBg.replace('bg-', 'border-')} w-fit`}>
              {currentDesarrollo.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => handleImageClick(img)}
                  className={`w-10 h-12 sm:w-14 sm:h-16 md:w-24 md:h-20 object-cover rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedImage?.id === img.id 
                      ? `ring-2 ${currentDesarrollo.lightBg.replace('bg-', 'ring-')} shadow-xl` 
                      : 'ring-2 ring-transparent hover:scale-105'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover rounded-md sm:rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Características principales */}
        <div className={`w-full flex flex-col items-center justify-center ${currentDesarrollo.bgColor} py-4 sm:py-6 md:py-8 px-2 border-t border-white/10`}>
          <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center items-stretch gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
            {currentDesarrollo.units.map((unit, index) => (
              <div key={index} className={`flex-1 flex flex-col items-center ${currentDesarrollo.lightBg} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-md min-w-[200px] sm:min-w-[250px]`}>
                <div className="flex gap-1 sm:gap-2 mb-1 sm:mb-2">
                  {unit.icons.map((Icon, iconIndex) => (
                    <Icon key={iconIndex} className={`text-2xl sm:text-3xl md:text-4xl ${currentDesarrollo.textColor}`} />
                  ))}
                </div>
                <div className={`${currentDesarrollo.textColor} text-lg sm:text-xl font-bold mb-1 text-center`}>
                  {unit.size} con {unit.rooms} recámara{unit.rooms > 1 ? 's' : ''}:
                </div>
                <div className={`${currentDesarrollo.textColor}/80 text-sm sm:text-base text-center`}>
                  {unit.description}
                </div>
              </div>
            ))}
          </div>

          {/* Amenidades */}
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-2">
            {currentDesarrollo.amenities.map((amenity, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <amenity.icon className={`text-2xl sm:text-3xl ${currentDesarrollo.lightText} mb-1 sm:mb-2`} />
                <span className={`${currentDesarrollo.lightText} text-xs sm:text-sm md:text-base leading-tight`}>
                  {amenity.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior: correos, categorías y botones */}
        <div className={`flex flex-col ${currentDesarrollo.bgColor} py-6 sm:py-8 px-4 sm:px-6 md:px-8 border-t border-white/10 ${currentDesarrollo.lightText} rounded-b-2xl sm:rounded-b-3xl shadow-inner mt-2 gap-6 min-h-[200px] sm:min-h-[180px]`}>
          
          {/* Información del contacto */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-between gap-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-semibold">E-mail:</span>
                <a href={`mailto:${currentDesarrollo.email}`} className="hover:underline cursor-pointer">
                  {currentDesarrollo.email}
                </a>
              </div>
              <span className="hidden sm:inline">|</span>
              <span className="font-medium">{currentDesarrollo.category}</span>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4  sm:gap-4 pb-2">
            <a 
              href={currentDesarrollo.link} 
              className={`${currentDesarrollo.lightBg} hover:opacity-90 ${currentDesarrollo.textColor} font-bold py-4 px-6 rounded-xl shadow-lg transition-all text-base focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-center gap-3 flex-1`}
            >
              <FaInfoCircle className="text-lg" />
              Más información
            </a>
            
            <a 
              href={currentDesarrollo.mapLink} 
              target="_blank"
              rel="noopener noreferrer"
              className={`${currentDesarrollo.lightBg} hover:opacity-90 ${currentDesarrollo.textColor} font-bold py-4 px-6 rounded-xl shadow-lg transition-all text-base focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-center gap-3 flex-1`}
            >
              <FaMapMarkerAlt className="text-lg" />
              Ver Ubicación
            </a>
            
            <button 
              onClick={() => {
                if (currentSlide === 0) {
                  setShowModalTrebol(true);
                } else {
                  setShowModalPalma(true);
                }
              }} 
              className={`${currentDesarrollo.bgColor} border-2 border-white ${currentDesarrollo.lightText} hover:bg-white hover:${currentDesarrollo.textColor.replace('text-', 'text-')} font-bold py-4 px-6 rounded-xl shadow-lg transition-all text-base focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-center gap-3 flex-1`}
            >
              <FaCalendarCheck className="text-lg" />
              Agenda tu Visita
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showModalTrebol && <PropuestaModalLeadMagnet show={showModalTrebol} setShow={setShowModalTrebol} />}
      {showModalPalma && <PropuestaModalPalma show={showModalPalma} setShow={setShowModalPalma} />}
    </section>
  );
}
