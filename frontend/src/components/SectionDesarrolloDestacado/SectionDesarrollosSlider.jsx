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
      name: 'TORRE PALMA 347',
      title: 'Arquitectura contemporánea en Veracruz',
      subtitle: 'Lujo y elegancia frente al mar',
      phone: '22 92 696 629',
      priceFrom: '$1,700,000',
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
        { icon: FaHome, text: 'Departamentos de 1 a 2 recámaras desde $1,700,000' },
        { icon: FaMapMarkerAlt, text: 'Ubicación premium frente al mar' },
        { icon: FaLeaf, text: 'Diseño arquitectónico contemporáneo' },
        { icon: FaShieldAlt, text: 'Seguridad y privacidad' },
        { icon: FaCheckCircle, text: 'Acabados de lujo' }
      ],
      images: [
        { id: 1, src: '/DesarrolloPalma/PALMA-SALA-COMEDOR.jpeg', alt: 'Sala-Comedor' },
        { id: 2, src: '/DesarrolloPalma/PALMA-COCINA.jpeg', alt: 'Cocina Integral' },
        { id: 3, src: '/DesarrolloPalma/PALMA- REC 1.jpeg', alt: 'Recámara Principal' },
        { id: 4, src: '/DesarrolloPalma/PALMA-REC 2.jpeg', alt: 'Segunda Recámara' },
        { id: 5, src: '/DesarrolloPalma/PALMA-ROOF TOP.jpeg', alt: 'Roof Top' }
      ],
      units: [
        {
          size: '57—67 m²',
          rooms: 1,
          description: 'Estudios y departamentos de 1 recámara con diseño moderno.',
          icons: [FaBed]
        },
        {
          size: '76—86 m²',
          rooms: 2,
          description: 'Departamentos de 2 recámaras con vista panorámica.',
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
    <section className="w-full flex flex-col items-center justify-center bg-[#f2efe2] py-10 md:py-14 px-2 relative overflow-hidden">
      {/* Navegación de slides */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <div className="flex gap-2">
          {desarrollos.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
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
          className={`w-10 h-10 rounded-full ${currentDesarrollo.bgColor} ${currentDesarrollo.lightText} flex items-center justify-center hover:opacity-80 transition-opacity`}
          aria-label="Slide anterior"
        >
          <FaChevronLeft className="text-sm" />
        </button>
        <button
          onClick={handleNextClick}
          className={`w-10 h-10 rounded-full ${currentDesarrollo.bgColor} ${currentDesarrollo.lightText} flex items-center justify-center hover:opacity-80 transition-opacity`}
          aria-label="Siguiente slide"
        >
          <FaChevronRight className="text-sm" />
        </button>
      </div>

      {/* Caja principal con sombra y bordes redondeados */}
      <div className={`relative w-full max-w-6xl mx-auto rounded-3xl shadow-2xl overflow-visible ${currentDesarrollo.bgColor} flex flex-col transition-all duration-500 hover:shadow-3xl`}>
        
        {/* Logo y texto central superior */}
        <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-10 flex flex-col items-center">
          <img 
            src={currentDesarrollo.logo} 
            alt="Logo Remax" 
            className={`w-24 h-24 rounded-full shadow-lg border-4 ${currentDesarrollo.bgColor} object-contain`}
          />
          <div className={`${currentDesarrollo.bgColor} px-8 py-2 rounded-b-2xl shadow ${currentDesarrollo.lightText} font-extrabold text-xl -mt-2 tracking-wide uppercase`}>
            {currentDesarrollo.name}
          </div>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col md:flex-row w-full pt-24 pb-0 gap-2 md:gap-0">
          
          {/* Columna izquierda: fondo, textos y contacto */}
          <div className={`${currentDesarrollo.lightBg} md:w-1/3 w-full flex flex-col justify-between p-8 ${currentDesarrollo.textColor} min-h-[400px] rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl`}>
            <div>
              <h2 className="text-4xl font-black mb-2 leading-tight drop-shadow-lg">
                {currentDesarrollo.title}
              </h2>
              <h3 className={`text-xl font-semibold mb-6 ${currentDesarrollo.textColor}/80`}>
                {currentDesarrollo.subtitle}
              </h3>
              <div className={`flex items-center gap-2 bg-black/10 px-4 py-2 rounded-lg ${currentDesarrollo.textColor} text-lg mb-4 w-fit shadow-md`}>
                <FaPhoneAlt /> 
                <span className="font-bold tracking-wide">{currentDesarrollo.phone}</span>
              </div>
              <ul className={`${currentDesarrollo.textColor}/90 mb-4 space-y-3 text-base`}>
                {currentDesarrollo.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <feature.icon className={`${currentDesarrollo.textColor}/60 text-xl`} />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Columna derecha: imagen principal y galería */}
          <div className={`relative md:w-2/3 w-full flex flex-col justify-between ${currentDesarrollo.bgColor} rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl`}>
            <div className="relative w-full h-56 md:h-80 rounded-tr-3xl overflow-hidden group">
              <img 
                src={selectedImage?.src || currentDesarrollo.images[0]?.src} 
                alt={selectedImage?.alt || currentDesarrollo.images[0]?.alt} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
            </div>

            {/* Galería de imágenes */}
            <div className={`flex justify-center items-center gap-4 ${currentDesarrollo.bgColor} py-4 px-2 md:px-8 -mt-12 z-10 relative rounded-2xl shadow-lg mx-auto border ${currentDesarrollo.lightBg.replace('bg-', 'border-')} w-fit`}>
              {currentDesarrollo.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => handleImageClick(img)}
                  className={`w-14 h-16 md:w-24 md:h-20 object-cover rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedImage?.id === img.id 
                      ? `ring-2 ${currentDesarrollo.lightBg.replace('bg-', 'ring-')} shadow-xl` 
                      : 'ring-2 ring-transparent hover:scale-105'
                  }`}
                >
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

        {/* Características principales */}
        <div className={`w-full flex flex-col items-center justify-center ${currentDesarrollo.bgColor} py-8 px-2 border-t border-white/10`}>
          <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center items-stretch gap-8 mb-8">
            {currentDesarrollo.units.map((unit, index) => (
              <div key={index} className={`flex-1 flex flex-col items-center ${currentDesarrollo.lightBg} rounded-2xl p-6 shadow-md min-w-[250px]`}>
                <div className="flex gap-2 mb-2">
                  {unit.icons.map((Icon, iconIndex) => (
                    <Icon key={iconIndex} className={`text-4xl ${currentDesarrollo.textColor}`} />
                  ))}
                </div>
                <div className={`${currentDesarrollo.textColor} text-xl font-bold mb-1`}>
                  {unit.size} con {unit.rooms} recámara{unit.rooms > 1 ? 's' : ''}:
                </div>
                <div className={`${currentDesarrollo.textColor}/80 text-base text-center`}>
                  {unit.description}
                </div>
              </div>
            ))}
          </div>

          {/* Amenidades */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-6 mt-2">
            {currentDesarrollo.amenities.map((amenity, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <amenity.icon className={`text-3xl ${currentDesarrollo.lightText} mb-2`} />
                <span className={`${currentDesarrollo.lightText} text-base`}>
                  {amenity.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra inferior: correos, categorías y botones */}
        <div className={`flex flex-col md:flex-row items-center justify-between ${currentDesarrollo.bgColor} py-4 px-4 md:px-8 border-t border-white/10 ${currentDesarrollo.lightText} text-base gap-4 rounded-b-3xl shadow-inner mt-2`}>
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-center md:text-left text-sm">
            <span className="font-semibold">E-mail:</span>
            <a href={`mailto:${currentDesarrollo.email}`} className="hover:underline cursor-pointer">
              {currentDesarrollo.email}
            </a>           
            <span className="hidden md:inline">|</span>
            <span>{currentDesarrollo.category}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0 justify-center md:justify-end">
            <a 
              href={currentDesarrollo.link} 
              className={`${currentDesarrollo.lightBg} hover:opacity-90 ${currentDesarrollo.textColor} font-bold py-3 px-4 md:px-6 rounded-lg shadow-md transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-center`}
            >
              <FaInfoCircle className="mr-2" />
              Más información
            </a>
            <a 
              href={currentDesarrollo.mapLink} 
              target="_blank"
              rel="noopener noreferrer"
              className={`${currentDesarrollo.lightBg} hover:opacity-90 ${currentDesarrollo.textColor} font-bold py-3 px-4 md:px-6 rounded-lg shadow-md transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-center`}
            >
              <FaMapMarkerAlt className="mr-2" />
              Ubicación
            </a>
            <button 
              onClick={() => {
                if (currentSlide === 0) {
                  setShowModalTrebol(true);
                } else {
                  setShowModalPalma(true);
                }
              }} 
              className={`${currentDesarrollo.bgColor} border-2 border-white ${currentDesarrollo.lightText} hover:bg-white hover:${currentDesarrollo.textColor.replace('text-', 'text-')} font-bold py-3 px-4 md:px-6 rounded-lg shadow-md transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-center`}
            >
              <FaCalendarCheck className="mr-2" />
              Visita Gratis
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
