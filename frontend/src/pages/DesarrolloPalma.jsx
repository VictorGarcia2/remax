import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaShieldAlt, FaMapMarkerAlt, FaHome, FaKey, FaCar, FaUserShield, FaLock, FaMapMarkedAlt, FaLeaf, FaCalendarAlt, FaPhone, FaTimes, FaExpand, FaCompress, FaUtensils, FaTree } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

// --- CONFIGURACIÓN PIPEDRIVE ---
const PIPEDRIVE_API_KEY = import.meta.env.VITE_PIPEDRIVE_API_KEY;
const PIPEDRIVE_API_URL = import.meta.env.VITE_PIPEDRIVE_API_URL || "https://api.pipedrive.com/v1";
const PIPELINE_ID_DESARROLLO = 4;
const STAGE_ID_DESARROLLO = 19; // Stage "Cualificado" (primer stage del Pipeline 4)

// --- CAMPOS PERSONALIZADOS PARA PIPEDRIVE ---
const CUSTOM_FIELDS_DESARROLLO = {
  INTERES: {
    name: "Interés del Lead",
    field_type: "varchar",
    validation: (value) => value.length > 0
  },
  MENSAJE: {
    name: "Mensaje del Lead",
    field_type: "text",
    validation: (value) => value.length > 0
  }
};

// --- FUNCIONES PIPEDRIVE ---
const ensureCustomFieldsDesarrollo = async () => {
  try {
    const fieldsResponse = await fetch(
      `${PIPEDRIVE_API_URL}/dealFields?api_token=${PIPEDRIVE_API_KEY}`
    );
    if (!fieldsResponse.ok) {
      throw new Error('Error al obtener campos de Pipedrive');
    }
    const existingFields = await fieldsResponse.json();
    const customFieldIds = {};
    
    for (const [key, field] of Object.entries(CUSTOM_FIELDS_DESARROLLO)) {
      const existingField = existingFields.data?.find(f => f.name === field.name);
      if (existingField) {
        customFieldIds[key] = existingField.key;
      } else {
        const payload = {
          name: field.name,
          field_type: field.field_type
        };
        const createResponse = await fetch(
          `${PIPEDRIVE_API_URL}/dealFields?api_token=${PIPEDRIVE_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        );
        if (!createResponse.ok) {
          throw new Error(`Error al crear campo ${field.name}`);
        }
        const newField = await createResponse.json();
        if (newField.success) {
          customFieldIds[key] = newField.data.key;
        } else {
          throw new Error(`Error al crear campo ${field.name}: ${newField.error || 'Error desconocido'}`);
        }
      }
    }
    return customFieldIds;
  } catch (error) {
    console.error("Error al verificar/crear campos personalizados:", error);
    throw error;
  }
};

const OWNER_MATCHES = [
  { type: 'name', value: 'veronica' },
  { type: 'name', value: 'verónica' },
  { type: 'email', value: 'adm.remaxrna@gmail.com' },
  { type: 'email', value: 'remaxcincoleccion@gmail.com' }
];

const findOwnerInPipedrive = async (apiKey) => {
  try {
    const usersResponse = await fetch(
      `${PIPEDRIVE_API_URL}/users?api_token=${apiKey}`
    );
    if (!usersResponse.ok) {
      throw new Error('Error al obtener usuarios de Pipedrive');
    }
    const usersData = await usersResponse.json();
    
    let owner = null;
    for (const match of OWNER_MATCHES) {
      owner = usersData.data.find(user => {
        if (match.type === 'email') {
          return user.email?.toLowerCase() === match.value.toLowerCase();
        } else {
          return user.name?.toLowerCase().includes(match.value.toLowerCase());
        }
      });
      if (owner) break;
    }
    
    if (!owner) {
      owner = usersData.data.find(user =>
        user.active_flag && (user.role_id === 1 || user.is_admin)
      );
    }
    if (!owner) {
      owner = usersData.data.find(user => user.active_flag);
    }
    if (!owner && usersData.data.length > 0) {
      owner = usersData.data[0];
    }
    
    return owner;
  } catch (error) {
    console.error('Error al buscar propietario:', error);
    throw new Error('Error al buscar propietario en Pipedrive: ' + error.message);
  }
};

const datosClave = [
  { icon: <FaMapMarkerAlt className="text-[#4f634b] text-xl" />, label: "Dirección", value: "Punta Roca Partida 205, Graciano Sánchez, 94293 Veracruz, Ver.." },
  { icon: <FaHome className="text-[#4f634b] text-xl" />, label: "A 10 min de", value: "Playas y centro comercial" },
  { icon: <FaCar className="text-[#4f634b] text-xl" />, label: "Estacionamiento", value: "1 o 2 cajones por depa" },
];

export default function DesarrolloPalma() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);
  const [touched, setTouched] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [submitError, setSubmitError] = useState(null);

  const images = [
    { url: "/DesarrolloPalma/PALMA-SALA-COMEDOR.jpeg", title: "Sala-Comedor" },
    { url: "/DesarrolloPalma/PALMA-COCINA.jpeg", title: "Cocina Integral" },
    { url: "/DesarrolloPalma/PALMA- REC 1.jpeg", title: "Recámara Principal" },
    { url: "/DesarrolloPalma/PALMA-REC 2.jpeg", title: "Segunda Recámara" },
    { url: "/DesarrolloPalma/PALMA-BAÑO.jpeg", title: "Baño Completo" },
    { url: "/DesarrolloPalma/PALMA-ESTUDIO.jpeg", title: "Área de Estudio" },
    { url: "/DesarrolloPalma/PALMA-ROOF TOP.jpeg", title: "Roof Top" },
    { url: "/DesarrolloPalma/PALMA-PLANTA AZOTEA.jpeg", title: "Nivel 1" },
  ];

  const intervalRef = useRef(null);

  const nextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const resetAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextImage, 5000);
  }, [nextImage]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetAutoplay]);

  const handlePrev = () => {
    prevImage();
    resetAutoplay();
  };

  const handleNext = () => {
    nextImage();
    resetAutoplay();
  };

  const handleThumbClick = (index) => {
    setCurrentImageIndex(index);
    resetAutoplay();
  };

  // Swipe en mobile
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (diff > 50) {
      prevImage();
    } else if (diff < -50) {
      nextImage();
    }
    touchStartX.current = null;
    resetAutoplay();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'Escape' && isZoomed) {
      closeZoom();
    }
  };

  // Funciones para el zoom modal
  const openZoom = (index = currentImageIndex) => {
    setZoomImageIndex(index);
    setIsZoomed(true);
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  };

  const closeZoom = () => {
    setIsZoomed(false);
    document.body.style.overflow = 'unset';
  };

  const nextZoomImage = () => {
    setZoomImageIndex(prev => (prev + 1) % images.length);
  };

  const prevZoomImage = () => {
    setZoomImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  // Manejo de swipe en zoom modal
  const touchStartXZoom = useRef(null);
  const handleZoomTouchStart = (e) => {
    touchStartXZoom.current = e.touches[0].clientX;
  };
  
  const handleZoomTouchEnd = (e) => {
    if (touchStartXZoom.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXZoom.current;
    if (diff > 50) {
      prevZoomImage();
    } else if (diff < -50) {
      nextZoomImage();
    }
    touchStartXZoom.current = null;
  };

  // Cleanup del overflow cuando se desmonta el componente
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isZoomed) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextZoomImage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevZoomImage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeZoom();
      }
    };

    if (isZoomed) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isZoomed]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviado(true);
    setSubmitError(null);
    
    try {
      // Validación básica
      if (!form.nombre || !phoneRegex.test(form.telefono)) {
        throw new Error('Por favor, completa todos los campos obligatorios correctamente.');
      }

      // 1. Asegurar que existan los campos personalizados
      const customFields = await ensureCustomFieldsDesarrollo();

      // 2. Crear o actualizar la persona en Pipedrive
      const personPayload = {
        name: form.nombre,
        email: [{ value: form.email, primary: true }],
        phone: [{ value: form.telefono, primary: true }],
        visible_to: 3
      };

      const personResponse = await fetch(
        `${PIPEDRIVE_API_URL}/persons?api_token=${PIPEDRIVE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(personPayload)
        }
      );

      if (!personResponse.ok) {
        throw new Error('Error al crear el contacto en Pipedrive');
      }

      const personData = await personResponse.json();

      // 3. Obtener el owner adecuado
      let owner;
      try {
        owner = await findOwnerInPipedrive(PIPEDRIVE_API_KEY);
        if (!owner) {
          throw new Error('No se encontró ningún usuario disponible en Pipedrive');
        }
      } catch (error) {
        console.error('Error al buscar el propietario:', error);
        owner = { id: null };
      }

      // 4. Crear el deal con campos personalizados
      const dealPayload = {
        title: `Lead Torre Palma 347 - ${form.nombre}`,
        person_id: personData.data.id,
        ...(owner.id && { user_id: owner.id }),
        pipeline_id: PIPELINE_ID_DESARROLLO,
        stage_id: STAGE_ID_DESARROLLO,
        status: "open",
        visible_to: 3,
        [customFields.INTERES]: "Torre Palma 347",
        [customFields.MENSAJE]: form.mensaje || "Sin mensaje"
      };

      // 🔍 DEBUG: Verificar qué pipeline se está enviando


      const dealResponse = await fetch(
        `${PIPEDRIVE_API_URL}/deals?api_token=${PIPEDRIVE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dealPayload)
        }
      );

      if (!dealResponse.ok) {
        throw new Error('Error al crear la oportunidad en Pipedrive');
      }

      const dealData = await dealResponse.json();

      // 🔍 DEBUG: Verificar la respuesta de Pipedrive


      // 5. Crear una nota con los detalles del formulario
      const noteContent = `Lead generado desde la web (Torre Palma 347):\n\nNombre: ${form.nombre}\nEmail: ${form.email}\nTeléfono: ${form.telefono}\nMensaje: ${form.mensaje}`;
      
      await fetch(
        `${PIPEDRIVE_API_URL}/notes?api_token=${PIPEDRIVE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: noteContent,
            deal_id: dealData.data.id,
            person_id: personData.data.id
          })
        }
      );



      // Éxito - resetear formulario después de un delay
      setTimeout(() => {
        setEnviado(false);
        setShowModal(false);
        setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
        setTouched({});
        setSubmitError(null);
      }, 2500);

    } catch (error) {
      console.error('Error al enviar a Pipedrive:', error);
      setSubmitError(error.message);
      
      // Mostrar error al usuario pero aún así cerrar el modal después de más tiempo
      setTimeout(() => {
        setEnviado(false);
        setShowModal(false);
        setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
        setTouched({});
        setSubmitError(null);
      }, 4000);
    }
  };
  const isValid = form.nombre && phoneRegex.test(form.telefono);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Torre Palma 347 Departamentos en venta en Veracruz",
    "description": "Torre Palma 347 departamentos en Veracruz desde 1.7 millones. 1-2 recámaras con estacionamiento incluido en ubicación premium.",
    "image": "/DesarrolloPalma/PALMA-SALA-COMEDOR.jpeg",
    "brand": {
      "@type": "Brand",
      "name": "RE/MAX CIN"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "MXN",
      "price": "1750000",
      "availability": "https://schema.org/InStock",
      "url": "https://remaxcin.com/desarrollo-palma"
    }
  };

  return (
    <main className="w-full min-h-screen bg-white font-sans tracking-wide overflow-x-hidden scroll-pt-20">
      <Helmet>
        <title>Palma Departamentos en Venta en Veracruz | Desarrollo Exclusivo</title>
        <meta name="description" content="Torre Palma 347 departamentos en Veracruz desde $1.75 millones. 1-2 recámaras, estacionamiento incluido, ubicación premium. ¡Agenda tu visita!" />
        <link rel="canonical" href="https://remaxcin.com/desarrollo-palma" />
        <meta property="og:url" content="https://remaxcin.com/desarrollo-palma" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Palma Departamentos en Venta en Veracruz | Desarrollo Exclusivo" />
        <meta property="og:description" content="Torre Palma 347 departamentos en Veracruz desde $1.75 millones. 1-2 recámaras, estacionamiento incluido, ubicación premium. ¡Agenda tu visita!" />
        <meta property="og:image" content="https://remaxcin.com/DesarrolloPalma/FACHADA.webp" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <Header />
      
      {/* HERO LUXURY MINIMALISTA CON IMAGEN DE FONDO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        {/* Imagen de fondo principal */}
        <div className="absolute inset-0 bg-[url('/DesarrolloPalma/FACHADA.webp')] bg-cover bg-center sm:bg-center"></div>
        <div className="absolute inset-0 bg-[#4f634b]/60"></div>
        
        {/* Líneas geométricas minimalistas - responsive */}
        <div className="absolute top-20 sm:top-24 lg:top-32 left-4 sm:left-8 lg:left-20 w-12 sm:w-16 lg:w-24 h-px bg-white/30"></div>
        <div className="absolute top-20 sm:top-24 lg:top-32 left-4 sm:left-8 lg:left-20 w-px h-12 sm:h-16 lg:h-24 bg-white/30"></div>
        <div className="hidden sm:block absolute bottom-12 lg:bottom-20 right-8 lg:right-20 w-16 lg:w-24 h-px bg-white/20"></div>
        <div className="hidden sm:block absolute bottom-12 lg:bottom-20 right-24 lg:right-44 w-px h-16 lg:h-24 bg-white/20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-20 items-center">
            
            {/* Contenido principal minimalista - 3 columnas */}
            <div className="lg:col-span-3 space-y-8 lg:space-y-12">
              
         

              {/* Título minimalista */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-thin text-white leading-none mb-4 sm:mb-6 lg:mb-8 tracking-tight">
                  PALMA
                  <br />
                  <span className="text-[#d2c8b3] font-light italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
                    Departamentos
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 font-light leading-relaxed max-w-3xl">
                  Espacios <span className="font-medium text-[#d2c8b3]">contemporáneos</span> diseñados para tu comodidad
                  <br className="hidden sm:block" />
                  <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#d2c8b3]/90 mt-2 lg:mt-4 block">Desde $1,750,000 MXN</span>
                </p>
              </motion.div>

              {/* Stats minimalistas */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-8"
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-5 lg:p-8 text-center shadow-sm hover:shadow-md hover:bg-white/15 transition-all duration-300">
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-white mb-2 lg:mb-3">60—90</div>
                  <div className="text-xs font-medium text-[#d2c8b3] uppercase tracking-widest">m² construidos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-5 lg:p-8 text-center shadow-sm hover:shadow-md hover:bg-white/15 transition-all duration-300">
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-white mb-2 lg:mb-3">1—2</div>
                  <div className="text-xs font-medium text-[#d2c8b3] uppercase tracking-widest">recámaras</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-5 lg:p-8 text-center shadow-sm hover:shadow-md hover:bg-white/15 transition-all duration-300">
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-white mb-2 lg:mb-3">6</div>
                  <div className="text-xs font-medium text-[#d2c8b3] uppercase tracking-widest">departamentos</div>
                </div>
              </motion.div>

              {/* Amenidades minimalistas */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/20"
              >
                <div className="flex items-center gap-3 lg:gap-4 bg-white/10 backdrop-blur-sm p-3 sm:p-4 lg:p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border border-white/60 flex items-center justify-center flex-shrink-0">
                    <FaHome className="text-white text-xs sm:text-sm" />
                  </div>
                  <span className="font-light text-white text-xs sm:text-sm tracking-wide">Espacios contemporáneos diseñados para tu comodidad</span>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 bg-white/10 backdrop-blur-sm p-3 sm:p-4 lg:p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border border-white/60 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-white text-xs sm:text-sm" />
                  </div>
                  <span className="font-light text-white text-xs sm:text-sm tracking-wide">Ubicación estratégica</span>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 bg-white/10 backdrop-blur-sm p-3 sm:p-4 lg:p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border border-white/60 flex items-center justify-center flex-shrink-0">
                    <FaUtensils className="text-white text-xs sm:text-sm" />
                  </div>
                  <span className="font-light text-white text-xs sm:text-sm tracking-wide">Cocina integral</span>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 bg-white/10 backdrop-blur-sm p-3 sm:p-4 lg:p-6 hover:bg-white/15 transition-all duration-300">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 border border-white/60 flex items-center justify-center flex-shrink-0">
                    <FaTree className="text-white text-xs sm:text-sm" />
                  </div>
                  <span className="font-light text-white text-xs sm:text-sm tracking-wide">Área común: Roof Garden</span>
                </div>
              </motion.div>

              {/* Imagen principal en mobile - ahora oculta porque tenemos fondo */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="hidden"
              >
                <img 
                  src="/DesarrolloPalma/PALMA-COCINA.jpeg" 
                  alt="Palma Residences" 
                  className="w-full h-[400px] object-cover"
                />
              </motion.div>
            </div>

            {/* Formulario minimalista - 2 columnas */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="lg:col-span-2 mt-8 lg:mt-0 pt-4 sm:pt-0"
              id="contacto"
            >
              <div className="bg-white border border-[#d2c8b3]/30 shadow-lg p-4 sm:p-6 lg:p-10 sticky top-20 sm:top-24 lg:top-32 max-w-md mx-auto lg:max-w-none">
                {enviado ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6 sm:py-8 lg:py-12"
                  >
                    {submitError ? (
                      <>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border border-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8">
                          <FaTimes className="text-red-500 text-base sm:text-lg lg:text-2xl" />
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-red-600 mb-3 sm:mb-4 lg:mb-6 tracking-wide">Error al Enviar</h3>
                        <p className="text-sm sm:text-base text-red-600/80 font-light">{submitError}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border border-[#7a8d77] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8">
                          <FaCheckCircle className="text-[#7a8d77] text-base sm:text-lg lg:text-2xl" />
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-[#4f634b] mb-3 sm:mb-4 lg:mb-6 tracking-wide">Experiencia Reservada</h3>
                        <p className="text-sm sm:text-base text-[#4f634b]/80 font-light">Su asesor personal lo contactará en las próximas horas para coordinar su visita privada.</p>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <>
                    <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border border-[#4f634b] flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                        <FaHome className="text-[#4f634b] text-sm sm:text-base lg:text-lg" />
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#4f634b] mb-2 sm:mb-3 lg:mb-4 tracking-wide">
                        Agenda <span className="font-medium text-[#7a8d77]">Tu Visita</span>
                      </h3>
                      <p className="text-sm sm:text-base text-[#4f634b]/80 font-light leading-relaxed px-2">
                       Descubre tu próximo departamento de la mano de nuestros especialistas
                      </p>
                      
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 lg:space-y-8">
                      <div className="relative">
                        <label htmlFor="nombre" className="block text-[#4f634b] font-medium mb-2 lg:mb-3 text-xs sm:text-sm tracking-wide uppercase">Nombre Completo</label>
                        <input 
                          name="nombre" 
                          id="nombre" 
                          type="text" 
                          required 
                          placeholder="Su nombre completo" 
                          className={`w-full p-3 sm:p-4 border ${touched.nombre && !form.nombre ? 'border-red-400' : 'border-[#d2c8b3]/50'} focus:border-[#7a8d77] focus:outline-none transition-all duration-300 bg-white text-sm font-light tracking-wide shadow-sm hover:shadow-md`} 
                          value={form.nombre} 
                          onChange={handleChange} 
                          onBlur={handleBlur} 
                        />
                        {touched.nombre && !form.nombre && <span className="text-xs text-red-500 absolute -bottom-5 left-0 font-light">Campo requerido</span>}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div className="relative">
                          <label htmlFor="telefono" className="block text-[#4f634b] font-medium mb-2 lg:mb-3 text-xs sm:text-sm tracking-wide uppercase">Teléfono</label>
                          <input 
                            name="telefono" 
                            id="telefono" 
                            type="tel" 
                            required 
                            placeholder="229 123 4567" 
                            className={`w-full p-3 sm:p-4 border ${touched.telefono && !phoneRegex.test(form.telefono) ? 'border-red-400' : 'border-[#d2c8b3]/50'} focus:border-[#7a8d77] focus:outline-none transition-all duration-300 bg-white text-sm font-light tracking-wide shadow-sm hover:shadow-md`} 
                            value={form.telefono} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            maxLength="10" 
                          />
                          {touched.telefono && !form.telefono && <span className="text-xs text-red-500 absolute -bottom-5 left-0 font-light">Requerido</span>}
                          {touched.telefono && form.telefono && !phoneRegex.test(form.telefono) && <span className="text-xs text-red-500 absolute -bottom-5 left-0 font-light">10 dígitos</span>}
                        </div>

                        <div className="relative">
                          <label htmlFor="email" className="block text-[#4f634b] font-medium mb-2 lg:mb-3 text-xs sm:text-sm tracking-wide uppercase">Correo Electrónico (Opcional)</label>
                          <input 
                            name="email" 
                            id="email" 
                            type="email" 
                            placeholder="su@email.com" 
                            className={`w-full p-3 sm:p-4 border ${touched.email && form.email && !emailRegex.test(form.email) ? 'border-red-400' : 'border-[#d2c8b3]/50'} focus:border-[#7a8d77] focus:outline-none transition-all duration-300 bg-white text-sm font-light tracking-wide shadow-sm hover:shadow-md`} 
                            value={form.email} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                          />
                          {touched.email && form.email && !emailRegex.test(form.email) && <span className="text-xs text-red-500 absolute -bottom-5 left-0 font-light">Email inválido</span>}
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={!isValid} 
                        className={`w-full bg-[#4f634b] text-white font-medium py-3 sm:py-4 px-4 sm:px-6 lg:px-8 text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 tracking-wide uppercase shadow-sm hover:shadow-md ${
                          !isValid ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#7a8d77] transform hover:translate-y-[-1px]'
                        }`}
                      >
                        <FaCalendarAlt className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline">Enviar</span>
                        <span className="sm:hidden">Reservar Visita</span>
                      </button>

                      <div className="text-center pt-3 sm:pt-4 lg:pt-6 space-y-2 sm:space-y-3 lg:space-y-4">
                        <p className="text-xs text-[#4f634b]/60 flex items-center justify-center gap-2 font-light tracking-wide">
                          <FaLock className="text-[#7a8d77]" />
                          Información 100% confidencial
                        </p>
                        <p className="text-xs text-[#4f634b]/60 font-light tracking-wide max-w-xs mx-auto leading-relaxed text-center px-2">
                          Al enviar la información, acepta automáticamente nuestros{' '}
                          <a 
                            href="/terminos-y-condiciones" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#7a8d77] hover:text-[#4f634b] underline transition-colors duration-300"
                          >
                            términos y condiciones
                          </a>
                        </p>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GALERÍA MINIMALISTA LUXURY */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center justify-center gap-3 sm:gap-4 text-[#4f634b] px-6 sm:px-8 py-4 sm:py-6 mb-6 sm:mb-8 tracking-wider uppercase text-xs font-medium"
            >
              <img 
                src="/DesarrolloPalma/LOGO-DEPAR.webp" 
                alt="Palma Departamentos"
                className="w-16 h-16 sm:w-24 sm:h-24 md:w-48 md:h-48 object-contain"
              />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-thin text-[#4f634b] mb-6 sm:mb-8 leading-none tracking-tight"
            >
              Vivir en
              <br />
              <span className="text-[#7a8d77] font-light italic">
                 Palma
              </span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl lg:text-2xl text-[#4f634b]/70 max-w-4xl mx-auto leading-relaxed font-light px-4"
            >
             Tu estilo de vida debe tener un lugar exclusivo en una de las mejores zonas de Boca del Río.
            </motion.p>
          </div>

          {/* Grid de características principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16 sm:mb-20 lg:mb-24">
            
            {/* Característica 1 - Roof Garden */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="group relative"
            >
              <div className="bg-white p-8 sm:p-10 lg:p-12 border border-[#d2c8b3]/30 hover:shadow-lg transition-all duration-300 relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border border-[#4f634b] flex items-center justify-center mb-6 sm:mb-8 group-hover:border-[#7a8d77] transition-all duration-300">
                  <FaTree className="text-[#4f634b] text-lg sm:text-xl lg:text-2xl group-hover:text-[#7a8d77] transition-colors duration-300" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-4 sm:mb-6 tracking-wide">Roof Garden</h3>
                <p className="text-[#4f634b]/70 leading-relaxed mb-6 sm:mb-8 font-light text-sm sm:text-base">
                  Disfruta con familia y amigos en el área común donde podrás crear tus momentos especiales.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base font-medium text-[#4f634b] mb-3">Esta área cuenta con:</h4>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Asador</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Mesas y sillas cómodas</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Barra con tarja</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Característica 2 - Diseñado para ti */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative"
            >
              <div className="bg-white p-8 sm:p-10 lg:p-12 border border-[#d2c8b3]/30 hover:shadow-lg transition-all duration-300 relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border border-[#4f634b] flex items-center justify-center mb-6 sm:mb-8 group-hover:border-[#7a8d77] transition-all duration-300">
                  <FaHome className="text-[#4f634b] text-lg sm:text-xl lg:text-2xl group-hover:text-[#7a8d77] transition-colors duration-300" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-4 sm:mb-6 tracking-wide">Diseñado para ti</h3>
                <p className="text-[#4f634b]/70 leading-relaxed mb-6 sm:mb-8 font-light text-sm sm:text-base">
                  Todos nuestros departamentos cuentan con espacios funcionales y acabados de calidad.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base font-medium text-[#4f634b] mb-3">Todos nuestros departamentos cuentan con:</h4>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Cocina integral</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Sala - Comedor</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Cuarto de lavado</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Baño</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 py-1">
                    <div className="w-2 h-px bg-[#7a8d77]"></div>
                    <span className="text-xs sm:text-sm text-[#4f634b] font-light">Cajón de estacionamiento</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Característica 3 - Diversifica tu espacio */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="group relative"
            >
              <div className="bg-white p-8 sm:p-10 lg:p-12 border border-[#d2c8b3]/30 hover:shadow-lg transition-all duration-300 relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border border-[#4f634b] flex items-center justify-center mb-6 sm:mb-8 group-hover:border-[#7a8d77] transition-all duration-300">
                  <FaKey className="text-[#4f634b] text-lg sm:text-xl lg:text-2xl group-hover:text-[#7a8d77] transition-colors duration-300" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-4 sm:mb-6 tracking-wide">Diversifica tu espacio</h3>
                <p className="text-[#4f634b]/70 leading-relaxed mb-6 sm:mb-8 font-light text-sm sm:text-base">
                  2 Modelos de departamentos que puedes configurar de acuerdo a tu estilo.
                </p>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-[#4f634b] mb-2">Palma Mallorca:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 sm:gap-4 py-1">
                        <div className="w-2 h-px bg-[#7a8d77]"></div>
                        <span className="text-xs sm:text-sm text-[#4f634b] font-light">1 recámara principal + baño completo</span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 py-1">
                        <div className="w-2 h-px bg-[#7a8d77]"></div>
                        <span className="text-xs sm:text-sm text-[#4f634b] font-light">1 cuarto de estudio</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[#4f634b] mb-2">Palma Real:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 sm:gap-4 py-1">
                        <div className="w-2 h-px bg-[#7a8d77]"></div>
                        <span className="text-xs sm:text-sm text-[#4f634b] font-light">1 recámara principal + baño completo</span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 py-1">
                        <div className="w-2 h-px bg-[#7a8d77]"></div>
                        <span className="text-xs sm:text-sm text-[#4f634b] font-light">1 recámara adicional</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#d2c8b3]/30">
                    <div className="flex items-center gap-3 sm:gap-4 py-1">
                      <div className="w-2 h-px bg-[#7a8d77]"></div>
                      <span className="text-xs sm:text-sm text-[#4f634b] font-light">Las recámaras incluyen clósets</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Galería minimalista */}
          <div className="relative">
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-[#4f634b] mb-2 sm:mb-3 lg:mb-4 tracking-wide">Portfolio Visual</h3>
              <p className="text-[#4f634b]/70 font-light text-sm sm:text-base">Cada espacio refleja nuestra filosofía de elegancia discreta</p>
            </div>
            
            {/* Marco minimalista para la imagen principal */}
            <div className="relative border border-[#d2c8b3]/50 overflow-hidden shadow-sm mb-3 sm:mb-6 lg:mb-10" 
                 onKeyDown={handleKeyDown} 
                 tabIndex={0}
                 onTouchStart={handleTouchStart} 
                 onTouchEnd={handleTouchEnd}>
              
              <div className="relative h-[320px] sm:h-[380px] md:h-[480px] lg:h-[600px] xl:h-[700px] bg-white">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex].url}
                    alt={images[currentImageIndex].title}
                    className="w-full h-full object-cover cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    onClick={() => openZoom(currentImageIndex)}
                  />
                </AnimatePresence>
                
                {/* Overlay minimalista */}
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Botón de zoom - solo visible en mobile */}
                <button
                  onClick={() => openZoom(currentImageIndex)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white border border-white/30 flex items-center justify-center transition-all duration-300 text-[#4f634b] lg:hidden"
                  aria-label="Ampliar imagen"
                >
                  <FaExpand className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                
                {/* Información minimalista */}
                <div className="absolute bottom-3 sm:bottom-4 lg:bottom-8 left-3 sm:left-4 lg:left-8 text-white">
                  <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-4 lg:p-6 text-[#4f634b] max-w-xs sm:max-w-sm lg:max-w-md">
                    <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-light mb-1 sm:mb-2 tracking-wide">{images[currentImageIndex].title}</h4>
                    <p className="text-xs sm:text-sm font-light mb-1 sm:mb-2 lg:mb-3 opacity-80">
                      Diseño arquitectónico contemporáneo
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-xs font-medium tracking-wider uppercase">
                      <span>
                        {currentImageIndex + 1} / {images.length}
                      </span>
                      <div className="w-4 sm:w-6 lg:w-8 h-px bg-[#7a8d77]"></div>
                      <span className="hidden sm:inline">Palma Residences</span>
                    </div>
                  </div>
                </div>

                {/* Controles minimalistas */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-3 lg:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 text-white group"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-3 lg:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 text-white group"
                  aria-label="Siguiente imagen"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Indicadores minimalistas */}
                <div className="absolute bottom-2 sm:bottom-3 lg:bottom-8 right-2 sm:right-3 lg:right-8">
                  <div className="bg-white/90 backdrop-blur-sm p-1 sm:p-1.5 lg:p-3">
                    <div className="flex gap-0.5 sm:gap-1 lg:gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleThumbClick(index)}
                          className={`w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 transition-all duration-300 ${
                            index === currentImageIndex 
                              ? 'bg-[#4f634b]' 
                              : 'bg-[#d2c8b3] hover:bg-[#7a8d77]'
                          }`}
                          aria-label={`Ver imagen ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnails minimalistas */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1 sm:gap-2">
              {images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    handleThumbClick(index);
                    // En móvil, abrir zoom directamente
                    if (window.innerWidth < 1024) {
                      setTimeout(() => openZoom(index), 100);
                    }
                  }}
                  onDoubleClick={() => openZoom(index)} // Doble clic en desktop
                  className={`relative overflow-hidden aspect-square transition-all duration-300 border ${
                    index === currentImageIndex 
                      ? 'border-[#4f634b] opacity-100' 
                      : 'border-[#d2c8b3]/50 opacity-70 hover:opacity-90 hover:border-[#7a8d77]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay simple */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-0.5 sm:p-1 lg:p-2">
                    <span className="text-[#4f634b] text-xs font-light truncate block">
                      {image.title}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE ZOOM PARA GALERÍA */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-black/90 via-black/95 to-black/90 z-[100] flex items-center justify-center p-4 pt-20 sm:pt-24 lg:pt-4 backdrop-blur-sm"
            onClick={closeZoom}
            onTouchStart={handleZoomTouchStart}
            onTouchEnd={handleZoomTouchEnd}
          >
            <div className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center pb-4">
              {/* Imagen ampliada mejorada */}
              <motion.div
                key={zoomImageIndex}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ duration: 0.4, type: "spring", damping: 25, stiffness: 200 }}
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[zoomImageIndex].url}
                  alt={images[zoomImageIndex].title}
                  className="max-w-full max-h-[70vh] sm:max-h-[80vh] lg:max-h-full object-contain rounded-lg shadow-2xl"
                />
                
                {/* Efecto de brillo */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
              </motion.div>

              {/* Botón cerrar mejorado */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={closeZoom}
                className="absolute top-4 sm:top-4 lg:top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/95 to-white/85 hover:from-white hover:to-white/95 border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 text-[#4f634b] shadow-lg backdrop-blur-sm z-10 group"
                aria-label="Cerrar zoom"
              >
                <FaTimes className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              </motion.button>

              {/* Controles de navegación mejorados */}
              {images.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      prevZoomImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-white/95 to-white/85 hover:from-white hover:to-white/95 border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 text-[#4f634b] shadow-lg backdrop-blur-sm group"
                    aria-label="Imagen anterior"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      nextZoomImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-white/95 to-white/85 hover:from-white hover:to-white/95 border border-white/30 rounded-full flex items-center justify-center transition-all duration-300 text-[#4f634b] shadow-lg backdrop-blur-sm group"
                    aria-label="Siguiente imagen"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </>
              )}

              {/* Información simplificada */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-white/95 via-white/90 to-white/85 backdrop-blur-lg p-4 text-[#4f634b] rounded-lg shadow-lg border border-white/20"
              >
                {/* Título e indicador */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg sm:text-xl font-light tracking-wide text-[#4f634b] mb-1">
                      {images[zoomImageIndex].title}
                    </h4>
                    <p className="text-sm text-[#7a8d77] font-light">Torre Palma 347</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-[#4f634b]/10 rounded-full px-3 py-1">
                      <span className="text-xs font-medium tracking-wider">
                        {zoomImageIndex + 1} de {images.length}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomImageIndex(index);
                          }}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            index === zoomImageIndex 
                              ? 'bg-[#4f634b] scale-125' 
                              : 'bg-[#d2c8b3] hover:bg-[#7a8d77] hover:scale-110'
                          }`}
                          aria-label={`Ver imagen ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECCIÓN DE DEPARTAMENTOS DISPONIBLES */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-thin text-[#4f634b] mb-6 sm:mb-8 leading-none tracking-tight"
            >
              Conoce nuestros
              <br />
              <span className="text-[#7a8d77] font-light italic">Modelos</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl lg:text-2xl text-[#4f634b]/70 max-w-4xl mx-auto leading-relaxed font-light px-4"
            >
              Cada departamento ha sido diseñado con atención al detalle y acabados de primera calidad
            </motion.p>
          </div>

          {/* Grid de departamentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Departamento 101 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white border border-[#d2c8b3]/30 p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#4f634b] mb-1 sm:mb-2">Depto 101</h3>
                  <p className="text-xs sm:text-sm text-[#7a8d77] font-medium uppercase tracking-wide">Planta Baja</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl lg:text-2xl font-light text-[#4f634b] mb-1">$2,190,000</div>
                  <div className="text-xs text-[#7a8d77] uppercase tracking-wide">MXN</div>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Tamaño:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">87.45 m²</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Distribución:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">2 rec / 2 baños / patio</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Estacionamiento:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">Con cajón de estacionamiento</span>
                </div>
              </div>
            </motion.div>

            {/* Departamento 102 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-white border border-[#d2c8b3]/30 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-1 sm:mb-2">Depto 102</h3>
                  <p className="text-xs sm:text-sm text-[#7a8d77] font-medium uppercase tracking-wide">Planta Baja</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-light text-[#4f634b] mb-1">$1,750,000</div>
                  <div className="text-xs text-[#7a8d77] uppercase tracking-wide">MXN</div>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Tamaño:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">70.75 m²</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Distribución:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">1 rec / 1 estudio / 1 1/2 baño</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Estacionamiento:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">Con cajón de estacionamiento</span>
                </div>
              </div>
            </motion.div>

            {/* Departamento 201 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white border border-[#d2c8b3]/30 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-1 sm:mb-2">Depto 201</h3>
                  <p className="text-xs sm:text-sm text-[#7a8d77] font-medium uppercase tracking-wide">Segundo Piso</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-light text-[#4f634b] mb-1">$2,050,000</div>
                  <div className="text-xs text-[#7a8d77] uppercase tracking-wide">MXN</div>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Tamaño:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">84.75 m²</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Distribución:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">2 rec / 2 baños</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Estacionamiento:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">Con cajón de estacionamiento</span>
                </div>
              </div>
            </motion.div>

            {/* Departamento 202 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-white border border-[#d2c8b3]/30 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-1 sm:mb-2">Depto 202</h3>
                  <p className="text-xs sm:text-sm text-[#7a8d77] font-medium uppercase tracking-wide">Segundo Piso</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-light text-[#4f634b] mb-1">$1,815,000</div>
                  <div className="text-xs text-[#7a8d77] uppercase tracking-wide">MXN</div>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Tamaño:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">76.5 m²</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Distribución:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">2 rec / 2 baños</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Estacionamiento:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">Con cajón de estacionamiento</span>
                </div>
              </div>
            </motion.div>

            {/* Departamento 301 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white border border-[#d2c8b3]/30 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-1 sm:mb-2">Depto 301</h3>
                  <p className="text-xs sm:text-sm text-[#7a8d77] font-medium uppercase tracking-wide">Tercer Piso</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-light text-[#4f634b] mb-1">$2,050,000</div>
                  <div className="text-xs text-[#7a8d77] uppercase tracking-wide">MXN</div>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Tamaño:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">84.75 m²</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Distribución:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">2 rec / 2 baños</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Estacionamiento:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">Con cajón de estacionamiento</span>
                </div>
              </div>
            </motion.div>

            {/* Departamento 302 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-white border border-[#d2c8b3]/30 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-1 sm:mb-2">Depto 302</h3>
                  <p className="text-xs sm:text-sm text-[#7a8d77] font-medium uppercase tracking-wide">Tercer Piso</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xl sm:text-2xl font-light text-[#4f634b] mb-1">$1,815,000</div>
                  <div className="text-xs text-[#7a8d77] uppercase tracking-wide">MXN</div>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Tamaño:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">76.5 m²</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2 border-b border-[#d2c8b3]/20">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Distribución:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">2 rec / 2 baños</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-[#4f634b]/70">Estacionamiento:</span>
                  <span className="text-xs sm:text-sm font-medium text-[#4f634b]">Con cajón de estacionamiento</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Nota importante */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-12 sm:mt-16 p-6 sm:p-8 bg-[#fafafa] border border-[#d2c8b3]/30"
          >
            <p className="text-[#4f634b]/80 text-xs sm:text-sm font-light leading-relaxed">
              <span className="font-medium">Nota importante:</span> Todos los departamentos incluyen 1 cajón de estacionamiento. 
              Los precios están sujetos a disponibilidad y pueden modificarse sin previo aviso. 
              Consulte condiciones especiales de financiamiento disponibles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN DE UBICACIÓN MINIMALISTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-thin text-[#4f634b] mb-6 sm:mb-8 leading-tight tracking-tight"
            >
              Departamentos en Boca del Río,
              <br />
              <span className="text-[#7a8d77] font-light italic"> donde cada destino está a tu alcance</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-start mb-12 sm:mb-16 lg:mb-20">
            {/* Contenido de ubicación minimalista */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 sm:space-y-10 lg:space-y-12"
            >
              <div className="space-y-6 sm:space-y-8">
                <div className="border-l border-[#d2c8b3] pl-6 sm:pl-8 py-4 sm:py-6 hover:border-[#7a8d77] transition-colors duration-300">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[#4f634b] flex items-center justify-center flex-shrink-0 mt-1 sm:mt-2">
                      <FaMapMarkerAlt className="text-[#4f634b] text-base sm:text-lg" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg sm:text-xl text-[#4f634b] mb-3 sm:mb-4 tracking-wide">Conectividad Absoluta</h4>
                      <p className="text-[#4f634b]/70 leading-relaxed font-light text-sm sm:text-base">
                        A tan sólo 10 minutos de las mejores playas y centros comerciales
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l border-[#d2c8b3] pl-6 sm:pl-8 py-4 sm:py-6 hover:border-[#7a8d77] transition-colors duration-300">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[#4f634b] flex items-center justify-center flex-shrink-0 mt-1 sm:mt-2">
                      <FaHome className="text-[#4f634b] text-base sm:text-lg" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg sm:text-xl text-[#4f634b] mb-3 sm:mb-4 tracking-wide">Rodeado de servicios</h4>
                      <p className="text-[#4f634b]/70 leading-relaxed font-light text-sm sm:text-base">
                        Escuelas, hospitales, supermercados y restaurantes exclusivos en un radio de 5 km
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-l border-[#d2c8b3] pl-6 sm:pl-8 py-4 sm:py-6 hover:border-[#7a8d77] transition-colors duration-300">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[#4f634b] flex items-center justify-center flex-shrink-0 mt-1 sm:mt-2">
                      <FaCar className="text-[#4f634b] text-base sm:text-lg" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg sm:text-xl text-[#4f634b] mb-3 sm:mb-4 tracking-wide">Movilidad Inteligente</h4>
                      <p className="text-[#4f634b]/70 leading-relaxed font-light text-sm sm:text-base">
                        Acceso directo a las principales avenidas y calles
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <a 
                href="https://www.google.com/maps/place/P.%C2%BA+Puerto+Banderas,+La+Tampiquera,+94293+Boca+del+R%C3%ADo,+Ver./@19.1122402,-96.1127698,19z/data=!3m1!4b1!4m15!1m8!3m7!1s0x85c341b5153fd133:0x7e5457c869c627ff!2sC.+Acayucan,+Veracruz!3b1!8m2!3d19.1121642!4d-96.1115465!16s%2Fg%2F1tf_1dkz!3m5!1s0x85c341b53e323de5:0xb925b5ab199153d!8m2!3d19.1122389!4d-96.1115521!16s%2Fg%2F11g6457fyv?entry=ttu&g_ep=EgoyMDI1MDgwNi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto border border-[#4f634b] text-[#4f634b] px-6 sm:px-8 py-3 sm:py-4 hover:bg-[#4f634b] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium tracking-wide uppercase"
              >
                <FaMapMarkedAlt />
                Ver en Google Maps
              </a>
            </motion.div>

            {/* Mapa minimalista */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative order-first lg:order-last"
            >
              <div className="border border-[#d2c8b3]/50 overflow-hidden shadow-sm h-[300px] sm:h-[400px] lg:h-[600px] relative">
                <iframe
                  title="Ubicación PALMA RESIDENCES"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d937.0320400000001!2d-96.110806!3d19.112801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA2JzQ2LjEiTiA5NsKwMDYnMzguOSJX!5e0!3m2!1ses-419!2smx!4v1691234567890!5m2!1ses-419!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale contrast-125"
                ></iframe>
                
                {/* Pin mejorado */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      damping: 20,
                      delay: 0.5 
                    }}
                    className="relative flex flex-col items-center"
                  >
                    {/* Pin principal con logo */}
                    <div className="relative">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 border-3 border-[#4f634b] bg-white rounded-full flex items-center justify-center shadow-xl">
                        <img 
                          src="/DesarrolloPalma/LOGO-DEPAR.webp" 
                          alt="Palma Departamentos"
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        />
                      </div>
                      
                      {/* Punto de anclaje del pin */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#4f634b]"></div>
                    </div>
                    
                    {/* Etiqueta del pin */}
                    <div className="mt-2 bg-[#4f634b] text-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-xs font-bold tracking-wide uppercase">Torre Palma 347</span>
                    </div>
                    
                    {/* Efecto de pulso */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.7, 0, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute top-0 w-14 h-14 sm:w-16 sm:h-16 border-2 border-[#4f634b] rounded-full"
                    ></motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Información de ubicación */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 space-y-2">
                <div className="bg-white/95 border border-[#d2c8b3]/50 px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#7a8d77] text-xs sm:text-sm" />
                    <span className="text-xs font-medium text-[#4f634b] tracking-wide uppercase">Ubicación Verificada</span>
                  </div>
                </div>
                
              </div>
            </motion.div>
          </div>

          {/* Grid de distancias minimalista */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#d2c8b3]/30"
          >
            <div className="bg-white p-6 sm:p-8 text-center hover:bg-[#fafafa] transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-2 sm:mb-3">5min</div>
              <div className="text-xs font-medium text-[#7a8d77] uppercase tracking-widest">a las playas</div>
            </div>
            <div className="bg-white p-6 sm:p-8 text-center hover:bg-[#fafafa] transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-2 sm:mb-3">8min</div>
              <div className="text-xs font-medium text-[#7a8d77] uppercase tracking-widest">plaza comercial</div>
            </div>
            <div className="bg-white p-6 sm:p-8 text-center hover:bg-[#fafafa] transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-light text-[#4f634b] mb-2 sm:mb-3">24/7</div>
              <div className="text-xs font-medium text-[#7a8d77] uppercase tracking-widest">conectividad</div>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionFooter />
    </main>
  );
}
