import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaShieldAlt, FaMapMarkerAlt, FaHome, FaKey, FaCar, FaUserShield, FaLock, FaMapMarkedAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const PIPEDRIVE_API_KEY = "02317c5467585c4251d802ab65e0c7b9f60541ee";
const PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1";
const PIPELINE_ID_DESARROLLO = 1;
const STAGE_ID_DESARROLLO = 1;
const datosClave = [
  { icon: <FaMapMarkerAlt className="text-blueRemax text-xl" />, label: "Dirección", value: "Av. Ejemplo 123, Veracruz, Ver." },
  { icon: <FaHome className="text-blueRemax text-xl" />, label: "A 15 min de", value: "Centro Histórico y playas" },
  { icon: <FaCar className="text-blueRemax text-xl" />, label: "Estacionamiento", value: "1 o 2 cajones por depa" },
];

// --- INICIO: Funciones y constantes para integración robusta con Pipedrive ---
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
// --- FIN: Funciones y constantes para integración robusta con Pipedrive ---

export default function DesarrolloTrebolII() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);
  const [touched, setTouched] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const images = [
    { url: "/fotosdesarrollo/FACHADA.webp", title: "Fachada" },
    { url: "/fotosdesarrollo/Patio interior - Trébol II.webp", title: "Patio Interior" },
    { url: "/fotosdesarrollo/renders cocina_1 - Photo.webp", title: "Cocina" },
    { url: "/fotosdesarrollo/TREBOL 2.webp", title: "Exterior" },
    { url: "/fotosdesarrollo/trebol 3.webp", title: "Exterior" },
    { url: "/fotosdesarrollo/TREBOL 5.0.webp", title: "Exterior" },
    { url: "/fotosdesarrollo/TREBOL RENDER FINAL DE NOCHE AMA copia.webp", title: "Fachada de Noche" },
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
    if (intervalRef.current) clearInterval(intervalRef.current); // Pausar al tocar
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
    resetAutoplay(); // Reanudar después del swipe
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviado(true);
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
        title: `Lead Desarrollo Trébol II - ${form.nombre}`,
        person_id: personData.data.id,
        ...(owner.id && { user_id: owner.id }),
        pipeline_id: PIPELINE_ID_DESARROLLO,
        stage_id: STAGE_ID_DESARROLLO,
        status: "open",
        visible_to: 3,
        [customFields.INTERES]: "Desarrollo Trébol II",
        [customFields.MENSAJE]: form.mensaje || "Sin mensaje"
      };
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
      // 5. Crear una nota con los detalles del formulario
      const noteContent = `Lead generado desde la web (Desarrollo Trébol II):\n\nNombre: ${form.nombre}\nEmail: ${form.email}\nTeléfono: ${form.telefono}\nMensaje: ${form.mensaje}`;
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
      setTimeout(() => {
        setEnviado(false);
        setShowModal(false);
        setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
        setTouched({});
      }, 2500);
    } catch (error) {
      setEnviado(false);
      alert(error.message || 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
    }
  };
  const isValid = form.nombre && phoneRegex.test(form.telefono);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Departamentos en venta en Boca del Rio, Veracruz",
    "description": "Departamentos en Veracruz desde 1.3 millones con cocina integral y estacionamiento. Excelente ubicación, a 15 min de centros comerciales y del centro histórico.",
    "image": "/fotosdesarrollo/FACHADA.webp",
    "brand": {
      "@type": "Brand",
      "name": "RE/MAX CIN"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "MXN",
      "price": "1300000",
      "availability": "https://schema.org/InStock",
      "url": "https://remaxcin.com/desarrollo-trebol-ii"
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#f2efe2] font-sans tracking-wide overflow-x-hidden">
      <Helmet>
        <title>Departamentos en Venta en Boca del Río, Veracruz | TRÉBOL II</title>
        <meta name="description" content="Departamentos en preventa en Veracruz desde $1.3 millones. Ubicación privilegiada, amenidades premium y seguridad. ¡Agenda tu visita gratis hoy!" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <Header  />
      {/* HERO/INTRO + FORMULARIO */}
      <section className="relative mt-20 min-h-[60vh] flex flex-col justify-center items-center text-center py-10 md:py-20 px-2 md:px-4 overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 z-0">
          <img src="/fotosdesarrollo/FACHADA.webp" alt="Fachada" className="w-full h-full object-cover opacity-60 scale-105 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#005156]/20 via-[#003d3d]/40 to-[#003d3d]/60"></div>
        </div>
        <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center bg-[#f2efe2]/90 md:bg-[#f2efe2]/80 backdrop-blur-lg rounded-2xl px-2 md:px-8 py-6 md:py-8 shadow-xl border border-[#005156]/30 text-center md:text-left">
          {/* Columna izquierda: texto */}
          <div className="flex flex-col items-center md:items-start gap-6 md:gap-4">
          <div className="flex items-center gap-2 mb-1">
            <FaShieldAlt className="text-[#005156] text-xl" />
            <span className="text-xs text-[#005156] font-semibold tracking-wide">Asesoría certificada RE/MAX CIN</span>
          </div>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block bg-[#db1c2e] text-white text-xs font-bold px-4 py-1 rounded-full mb-1 shadow "
              onClick={() => {
                const formSection = document.getElementById('formulario-hero');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          
          >
            ¡Entrega innmediata!
          </motion.span>
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-extrabold text-[#005156] mb-1 drop-shadow-lg leading-tight text-center md:text-left"
          >
            TRÉBOL II
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
              className="text-base md:text-2xl font-semibold text-[#005156]/80 mb-1 text-center md:text-left"
          >
            Tu hogar en el corazón de Veracruz
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
              className="text-sm md:text-lg text-[#005156]/80 mb-2 text-center md:text-left"
          >
            Descubre tu próximo departamento con espacios únicos diseñados para tu familia. Vive cerca de todo con la comodidad de tener un hogar, con amenidades hechas para ti.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.07 }}
              className="flex md:hidden items-center justify-center gap-2 bg-[#db1c2e] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-red-700 transition text-lg mt-4 w-full focus:outline-none focus:ring-2 focus:ring-[#005156]/40"
            onClick={() => {
                const formSection = document.getElementById('formulario-hero');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
              <FaHome className="text-white text-2xl" /> Haz clic ¡Visítanos hoy mismo!
          </motion.button>
            <div className="text-xs md:hidden text-[#005156]/80 mt-2 text-center">Sin compromiso. Un asesor certificado te contactará en minutos.</div>
          </div>
          {/* Columna derecha: formulario */}
          <section className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col justify-center border-t-8 border-[#db1c2e] max-w-md w-full mx-auto" id="formulario-hero" aria-labelledby="form-title">
            <h2 id="form-title" className="text-2xl font-bold text-[#005156] mb-6 text-center">Agenda una visita</h2>
            {enviado ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 text-green-800 p-6 rounded-xl text-center font-semibold shadow-lg border border-green-200"
              >
                ¡Visita agendada! Un asesor confirmará los detalles contigo.
        </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off" noValidate>
                <div className="relative flex flex-col gap-2">
                  <label htmlFor="nombre" className="text-[#005156] font-semibold">Nombre completo</label>
                  <input name="nombre" id="nombre" type="text" required placeholder="Nombre completo" className={`w-full p-3 rounded-lg border ${touched.nombre && !form.nombre ? 'border-red-400' : 'border-[#005156]/40'} focus:border-[#005156] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base placeholder-gray-400`} value={form.nombre} onChange={handleChange} onBlur={handleBlur} />
                  {touched.nombre && !form.nombre && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">Este campo es obligatorio</span>}
                </div>
                <div className="relative flex flex-col gap-2">
                  <label htmlFor="telefono" className="text-[#005156] font-semibold">Teléfono (10 dígitos)</label>
                  <input name="telefono" id="telefono" type="tel" required placeholder="Ej: 2291234567" className={`w-full p-3 rounded-lg border ${touched.telefono && !phoneRegex.test(form.telefono) ? 'border-red-400' : 'border-[#005156]/40'} focus:border-[#005156] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base placeholder-gray-400`} value={form.telefono} onChange={handleChange} onBlur={handleBlur} maxLength="10" />
                  {touched.telefono && !form.telefono && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">Este campo es obligatorio</span>}
                  {touched.telefono && form.telefono && !phoneRegex.test(form.telefono) && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">El teléfono debe tener 10 dígitos.</span>}
                </div>
                <div className="relative flex flex-col gap-2">
                  <label htmlFor="email" className="text-[#005156] font-semibold">Correo electrónico <span className='text-[#db1c2e]'>(opcional)</span></label>
                  <input name="email" id="email" type="email" placeholder="Correo electrónico" className={`w-full p-3 rounded-lg border ${touched.email && form.email && !emailRegex.test(form.email) ? 'border-red-400' : 'border-[#005156]/40'} focus:border-[#005156] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base placeholder-gray-400`} value={form.email} onChange={handleChange} onBlur={handleBlur} />
                  {touched.email && form.email && !emailRegex.test(form.email) && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">Formato de correo inválido</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="aceptaTerminos" checked={aceptaTerminos} onChange={e => setAceptaTerminos(e.target.checked)} required className="accent-[#db1c2e] w-4 h-4" />
                  <label htmlFor="aceptaTerminos" className="text-xs text-[#005156]">Acepto los <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" className="underline text-[#db1c2e]">Términos y Condiciones</a></label>
                </div>
                <button type="submit" disabled={!isValid || !aceptaTerminos} className={`w-full bg-[#db1c2e] text-white font-bold py-3 rounded-lg mt-2 shadow-lg transition-transform duration-200 hover:scale-105 text-lg focus:outline-none focus:ring-2 focus:ring-[#005156]/40 ${!isValid || !aceptaTerminos ? 'opacity-60 cursor-not-allowed' : ''}`}>¡Agendar mi visita!</button>
                <div className="text-xs text-[#005156] text-center mt-2 flex items-center gap-1 justify-center bg-[#f2efe2]/60 px-2 py-1 rounded"><FaLock className="inline-block mr-1 text-[#db1c2e]" />No compartimos tus datos con terceros.</div>
              </form>
            )}
          </section>
        </div>
      </section>

      {/* VIDEO TOUR */}
      <section className="w-full flex flex-col items-center py-8 px-2 bg-[#f2efe2]">
        <h2 className="text-xl md:text-2xl font-bold text-[#005156] mb-4 text-center">Conoce TRÉBOL II en video</h2>
        <div className="w-full max-w-2xl aspect-[9/16] md:aspect-video rounded-2xl overflow-hidden shadow-xl border border-[#005156]/30 bg-black flex items-center justify-center relative">
          <iframe
            id="video-tour-trebol"
            src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1242575930981064%2F&show_text=false&width=267&t=0"
            width="100%"
            height="100%"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen={true}
            title="Video tour Trébol II"
            className="w-full h-full"
          />
        </div>
        <p className="text-sm text-[#005156]/80 mt-3 text-center max-w-md">Descubre los espacios, amenidades y el entorno de Trébol II en este video.</p>
      </section>

      {/* PRECIO DESTACADO */}
      <section className="w-full flex justify-center items-center my-4 md:mt-5 py-3">
        <div className="bg-[#db1c2e] text-white text-lg md:text-xl font-extrabold px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl shadow-lg border-2 md:border-4 border-[#005156] max-w-xs md:max-w-md w-full text-center">
        Venta de departamentos desde 1,250,000 MXN
        </div>
      </section>

      {/* SLIDER REDISEÑADO */}
      <section className="relative z-10 w-full flex flex-col items-center gap-8 py-12 px-0 bg-transparent mt-4" aria-labelledby="galeria-title">
        <h2 id="galeria-title" className="text-2xl font-bold text-[#005156] mb-6 tracking-wide text-center w-full">Galería del desarrollo</h2>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full max-w-[96vw] md:max-w-[90vw] lg:max-w-[1200px] aspect-video rounded-2xl overflow-hidden shadow-2xl group bg-[#f2efe2] focus:outline-none"
          style={{ boxShadow: '0 8px 40px 0 rgba(0, 81, 86, 0.10)' }}
          onMouseEnter={() => clearInterval(intervalRef.current)}
          onMouseLeave={resetAutoplay}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex="0"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].title}
              loading="lazy"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Título con fondo degradado */}
          <div className="absolute bottom-0 left-0 p-4 text-white bg-gradient-to-r from-black/80 via-black/30 to-transparent rounded-br-2xl">
            <h4 className="text-lg font-semibold drop-shadow">{images[currentImageIndex].title}</h4>
          </div>
          {/* Flechas */}
          <button
            onClick={handlePrev}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#005156]/80 hover:bg-[#003d3d]/80 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 duration-300"
          >
            <span className="sr-only">Anterior</span>
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={handleNext}
            aria-label="Siguiente"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#005156]/80 hover:bg-[#003d3d]/80 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 duration-300"
          >
            <span className="sr-only">Siguiente</span>
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          {/* Contador */}
          <div className="absolute top-4 right-4 bg-[#005156] text-white font-bold px-4 py-1 rounded-full shadow text-sm">{currentImageIndex + 1}/{images.length}</div>
        </motion.div>
        {/* Miniaturas */}
        <div className="flex gap-4 mt-4 justify-center flex-wrap">
          {images.map((img, idx) => (
            <motion.button
              key={img.url}
              onClick={() => handleThumbClick(idx)}
              className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 focus:outline-none ${
                idx === currentImageIndex
                  ? 'ring-4 ring-[#005156] ring-offset-2'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{ width: 90, height: 60 }}
              aria-label={img.title}
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* 5. BENEFICIOS Y AMENIDADES */}
      <section className="w-full bg-white py-12 px-2 md:px-8" aria-labelledby="beneficios-title">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h2 id="beneficios-title" className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-[#005156] mb-4 text-center flex flex-col xs:flex-row items-center gap-2 xs:gap-3">
            <span className="block leading-tight">¿Por qué elegir</span>
            <span className="text-[#db1c2e] text-3xl xs:text-4xl md:text-5xl font-extrabold block leading-tight">TRÉBOL II</span>
            <span className="inline-block bg-[#db1c2e] text-white text-xs font-bold px-3 py-1 rounded-full shadow mt-2 xs:mt-0 xs:ml-2">RE/MAX CIN</span>
            </h2>
          <p className="text-base xs:text-lg text-[#005156]/80 mb-8 text-center max-w-2xl">Descubre los beneficios y amenidades que hacen de TRÉBOL II la mejor opción para tu nuevo hogar en Veracruz.</p>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <article className="bg-white rounded-2xl p-8 text-[#005156] flex flex-col gap-3 shadow-xl border-l-8 border-[#005156] hover:shadow-2xl transition-all duration-300 relative">
              <span className="absolute -top-3 left-4 bg-[#db1c2e] text-white text-xs font-bold px-3 py-1 rounded-full shadow">Ubicación</span>
              <div className="flex items-center gap-3 mb-1"><FaMapMarkerAlt className="text-[#db1c2e] text-4xl" /><span className="font-bold text-xl">Ubicación privilegiada</span></div>
                <div className="text-xs text-[#db1c2e] mb-2">Cerca de todo</div>
              <ul className="list-disc ml-6 text-base text-[#005156]/90 space-y-1">
                  <li>A 15 minutos de Centro Histórico</li>
                  <li>Playas de Veracruz</li>
                  <li>Ciudad Industrial</li>
                  <li>Centros comerciales</li>
                </ul>
              </article>
            {/* Card 2 */}
            <article className="bg-white rounded-2xl p-8 text-[#005156] flex flex-col gap-3 shadow-xl border-l-8 border-[#db1c2e] hover:shadow-2xl transition-all duration-300 relative">
              <span className="absolute -top-3 left-4 bg-[#005156] text-white text-xs font-bold px-3 py-1 rounded-full shadow">Comodidad</span>
              <div className="flex items-center gap-3 mb-1"><FaHome className="text-[#db1c2e] text-4xl" /><span className="font-bold text-xl">Vida a tu alrededor</span></div>
              <div className="text-xs text-[#005156] mb-2">Comodidad total</div>
              <ul className="list-disc ml-6 text-base text-[#005156]/90 space-y-1">
                  <li>Supermercados (Soriana, Chedraui)</li>
                  <li>Escuelas y universidades</li>
                  <li>Clínicas y servicios médicos</li>
                </ul>
              </article>
            {/* Card 3 */}
            <article className="bg-white rounded-2xl p-8 text-[#005156] flex flex-col gap-3 shadow-xl border-l-8 border-[#005156] hover:shadow-2xl transition-all duration-300 relative">
              <span className="absolute -top-3 left-4 bg-[#db1c2e] text-white text-xs font-bold px-3 py-1 rounded-full shadow">Equipamiento</span>
              <div className="flex items-center gap-3 mb-1"><FaKey className="text-[#db1c2e] text-4xl" /><span className="font-bold text-xl">Todos incluyen</span></div>
                <div className="text-xs text-[#005156] mb-2">Equipamiento premium</div>
              <ul className="list-disc ml-6 text-base text-[#005156]/90 space-y-1">
                  <li>Cocina integral</li>
                  <li>Sala-comedor</li>
                  <li>Cuarto de lavado</li>
                  <li>Recámara principal con baño completo</li>
                  <li>Estacionamiento</li>
                </ul>
              </article>
            {/* Card 4 */}
            <article className="bg-white rounded-2xl p-8 text-[#005156] flex flex-col gap-3 shadow-xl border-l-8 border-[#db1c2e] hover:shadow-2xl transition-all duration-300 relative">
              <span className="absolute -top-3 left-4 bg-[#005156] text-white text-xs font-bold px-3 py-1 rounded-full shadow">Estacionamiento</span>
              <div className="flex items-center gap-3 mb-1"><FaCar className="text-[#db1c2e] text-4xl" /><span className="font-bold text-xl">Estacionamiento</span></div>
                <div className="text-xs text-[#005156] mb-2">Acceso seguro</div>
              <ul className="list-disc ml-6 text-base text-[#005156]/90 space-y-1">
                  <li>1 o 2 cajones por departamento</li>
                  <li>Acceso controlado</li>
                  <li>Visitas</li>
                </ul>
              </article>
            </div>
        
        </div>
      </section>

      {/* 7. UBICACIÓN PREMIUM REMAX */}
      <section className="w-full bg-gradient-to-br from-[#f2efe2] via-[#eaf6f6] to-[#eaf6f6] py-16 px-4 flex flex-col items-center" aria-labelledby="ubicacion-title">
        <h2 id="ubicacion-title" className="text-4xl font-extrabold text-[#005156] mb-4 text-center drop-shadow">Ubicación privilegiada</h2>
        <p className="text-lg text-[#005156]/90 mb-8 max-w-2xl text-center">TRÉBOL II se encuentra en una de las zonas más conectadas de Veracruz, cerca de centros comerciales, escuelas, hospitales y a minutos de las mejores playas y el centro histórico.</p>
        <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl items-center justify-center">
          <ul className="flex-1 grid grid-cols-1 gap-6" aria-label="Datos clave de ubicación">
            <li>
              <article className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border-l-8 border-[#005156] relative" aria-label="Dirección">
                <span className="absolute -top-3 -left-3 bg-[#db1c2e] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Clave</span>
                <FaMapMarkerAlt className="text-[#005156] text-2xl" />
                <div>
                  <h3 className="text-[#005156] font-bold text-lg">Dirección</h3>
                  <p className="text-[#005156]/80 text-base">C. Virgilio Uribe 765, Coyol Ivec, 91780 Veracruz, Ver.</p>
                </div>
              </article>
            </li>
            <li>
              <article className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border-l-8 border-[#db1c2e] relative" aria-label="A 15 min de">
                <span className="absolute -top-3 -left-3 bg-[#005156] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Nuevo</span>
                <FaHome className="text-[#db1c2e] text-2xl" />
                <div>
                  <h3 className="text-[#005156] font-bold text-lg">A 15 min de</h3>
                  <p className="text-[#005156]/80 text-base">Centro Histórico y playas</p>
                </div>
              </article>
            </li>
            <li>
              <article className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border-l-8 border-[#db1c2e] relative" aria-label="Estacionamiento">
                <span className="absolute -top-3 -left-3 bg-[#db1c2e] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Premium</span>
                <FaCar className="text-[#db1c2e] text-2xl" />
                <div>
                  <h3 className="text-[#005156] font-bold text-lg">Estacionamiento</h3>
                  <p className="text-[#005156]/80 text-base">1 o 2 cajones por depa</p>
                </div>
              </article>
            </li>
          </ul>
          {/* Mapa con pin rojo REMAX animado */}
          <figure className="flex-1 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl  relative bg-white" aria-label="Mapa de ubicación">
            <div className="relative w-full h-[350px]">
              <iframe
                title="Ubicación TRÉBOL II"
                src="https://www.google.com/maps?q=C.+Virgilio+Uribe+765,+Coyol+Ivec,+91780+Veracruz,+Ver.&output=embed"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>
            <figcaption className="mt-2">
              <a href="https://maps.app.goo.gl/mcxAETSrJDwxj67MA" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-[#005156] font-bold hover:underline text-lg transition hover:text-[#db1c2e] border-b-2 border-transparent hover:border-[#db1c2e] pb-1">
                <FaMapMarkedAlt /> Cómo llegar
              </a>
              <div className="text-xs text-[#005156]/90 text-center mt-2 flex items-center justify-center gap-1 bg-white/80 rounded-full px-3 py-1 w-fit mx-auto shadow"><FaCheckCircle className="text-green-500" /> Ubicación verificada por REMAX</div>
            </figcaption>
          </figure>
        </div>
      </section>
      <SectionFooter />
    </main>
  );
}