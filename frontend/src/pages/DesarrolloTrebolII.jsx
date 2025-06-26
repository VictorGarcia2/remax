import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaShieldAlt, FaMapMarkerAlt, FaHome, FaKey, FaCar, FaUserShield, FaLock, FaMapMarkedAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const datosClave = [
  { icon: <FaMapMarkerAlt className="text-blueRemax text-xl" />, label: "Dirección", value: "Av. Ejemplo 123, Veracruz, Ver." },
  { icon: <FaHome className="text-blueRemax text-xl" />, label: "A 15 min de", value: "Centro Histórico y playas" },
  { icon: <FaCar className="text-blueRemax text-xl" />, label: "Estacionamiento", value: "1 o 2 cajones por depa" },
];

export default function DesarrolloTrebolII() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);
  const [touched, setTouched] = useState({});
  const [showModal, setShowModal] = useState(false);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => {
      setEnviado(false);
      setShowModal(false);
      setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
      setTouched({});
    }, 2500);
  };
  const isValid = form.nombre && emailRegex.test(form.email) && phoneRegex.test(form.telefono);

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
      {/* HERO/INTRO */}
      <section className="relative mt-20 min-h-[60vh] flex flex-col justify-center items-center text-center py-20 px-4 overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 z-0">
          <img src="/fotosdesarrollo/FACHADA.webp" alt="Fachada" className="w-full h-full object-cover opacity-60 scale-105 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#005156]/10 via-[#003d3d]/20 to-[#003d3d]/40"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-4 bg-[#f2efe2]/80 backdrop-blur-lg rounded-2xl px-8 py-8 shadow-xl border border-[#005156]/30"
        >
          <div className="flex items-center gap-2 mb-1">
            <FaShieldAlt className="text-[#005156] text-xl" />
            <span className="text-xs text-[#005156] font-semibold tracking-wide">Asesoría certificada RE/MAX CIN</span>
          </div>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block bg-[#db1c2e] text-white text-xs font-bold px-4 py-1 rounded-full mb-1 shadow animate-pulse"
          >
            ¡Preventa exclusiva!
          </motion.span>
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold text-[#005156] mb-1 drop-shadow-lg leading-tight"
          >
            TRÉBOL II
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl font-semibold text-[#005156]/80 mb-1"
          >
            Tu hogar en el corazón de Veracruz
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-lg text-[#005156]/80 mb-2"
          >
            Descubre tu próximo hogar con espacios únicos diseñados para tu familia. Vive cerca de todo, con amenidades premium y la seguridad que tu familia merece.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.07 }}
            className="inline-flex items-center gap-2 bg-[#db1c2e] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-red-700 transition text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#005156]/40"
            onClick={() => {
              const formSection = document.getElementById('contacto');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <FaHome className="text-white" /> Agendar visita gratis
          </motion.button>
          <div className="text-xs text-[#005156]/80 mt-2">Sin compromiso. Un asesor certificado te contactará en minutos.</div>
        </motion.div>
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
      <section className="w-full bg-white py-16 px-2 md:px-8" aria-labelledby="beneficios-title">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Beneficios */}
          <section className="flex flex-col gap-8" aria-labelledby="beneficios-title">
            <h2 id="beneficios-title" className="text-3xl font-bold text-[#005156] mb-2 flex items-center gap-3">
              ¿Por qué elegir TRÉBOL II?
              <span className="inline-block bg-[#db1c2e] text-white text-xs font-bold px-3 py-1 rounded-full shadow ml-2">RE/MAX CIN</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <article className="bg-white rounded-2xl p-7 text-[#005156] flex flex-col gap-3 shadow-2xl border-b-4 border-[#005156]" aria-label="Ubicación privilegiada">
                <div className="flex items-center gap-3 mb-1"><FaMapMarkerAlt className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Ubicación privilegiada</span></div>
                <div className="text-xs text-[#db1c2e] mb-2">Cerca de todo <span className="ml-2 bg-[#005156] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Premium</span></div>
                <ul className="list-disc ml-6 text-base text-[#005156]/90">
                  <li>A 15 minutos de Centro Histórico</li>
                  <li>Playas de Veracruz</li>
                  <li>Ciudad Industrial</li>
                  <li>Centros comerciales</li>
                </ul>
              </article>
              <article className="bg-white rounded-2xl p-7 text-[#005156] flex flex-col gap-3 shadow-2xl border-b-4 border-[#db1c2e]" aria-label="Vida a tu alrededor">
                <div className="flex items-center gap-3 mb-1"><FaHome className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Vida a tu alrededor</span></div>
                <div className="text-xs text-[#005156] mb-2">Comodidad total <span className="ml-2 bg-[#db1c2e] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Nuevo</span></div>
                <ul className="list-disc ml-6 text-base text-[#005156]/90">
                  <li>Supermercados (Soriana, Chedraui)</li>
                  <li>Escuelas y universidades</li>
                  <li>Clínicas y servicios médicos</li>
                </ul>
              </article>
              <article className="bg-white rounded-2xl p-7 text-[#005156] flex flex-col gap-3 shadow-2xl border-b-4 border-[#005156]" aria-label="Todos incluyen">
                <div className="flex items-center gap-3 mb-1"><FaKey className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Todos incluyen</span></div>
                <div className="text-xs text-[#005156] mb-2">Equipamiento premium</div>
                <ul className="list-disc ml-6 text-base text-[#005156]/90">
                  <li>Cocina integral</li>
                  <li>Sala-comedor</li>
                  <li>Cuarto de lavado</li>
                  <li>Recámara principal con baño completo</li>
                  <li>Estacionamiento</li>
                </ul>
              </article>
              <article className="bg-white rounded-2xl p-7 text-[#005156] flex flex-col gap-3 shadow-2xl border-b-4 border-[#db1c2e]" aria-label="Estacionamiento">
                <div className="flex items-center gap-3 mb-1"><FaCar className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Estacionamiento</span></div>
                <div className="text-xs text-[#005156] mb-2">Acceso seguro</div>
                <ul className="list-disc ml-6 text-base text-[#005156]/90">
                  <li>1 o 2 cajones por departamento</li>
                  <li>Acceso controlado</li>
                  <li>Visitas</li>
                </ul>
              </article>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <FaUserShield className="text-[#005156] text-lg" />
              <span className="text-xs text-gray-700 font-semibold bg-[#f2efe2] px-2 py-1 rounded flex items-center gap-1"><FaLock className="inline-block mr-1 text-[#db1c2e]" />Tus datos están protegidos y solo los usaremos para contactarte.</span>
            </div>
          </section>
          {/* Formulario */}
          <section className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col justify-center border-t-8 border-[#db1c2e] max-w-md w-full mx-auto" id="contacto" aria-labelledby="form-title">
            <h2 id="form-title" className="text-2xl font-bold text-[#005156] mb-6 text-center">Agenda una visita gratis</h2>
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
                  <label htmlFor="email" className="text-[#005156] font-semibold">Correo electrónico</label>
                  <input name="email" id="email" type="email" required placeholder="Correo electrónico" className={`w-full p-3 rounded-lg border ${touched.email && !emailRegex.test(form.email) ? 'border-red-400' : 'border-[#005156]/40'} focus:border-[#005156] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base placeholder-gray-400`} value={form.email} onChange={handleChange} onBlur={handleBlur} />
                  {touched.email && !form.email && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">Este campo es obligatorio</span>}
                  {touched.email && form.email && !emailRegex.test(form.email) && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">Formato de correo inválido</span>}
                </div>
                <div className="relative flex flex-col gap-2">
                  <label htmlFor="telefono" className="text-[#005156] font-semibold">Teléfono (10 dígitos)</label>
                  <input name="telefono" id="telefono" type="tel" required placeholder="Ej: 2291234567" className={`w-full p-3 rounded-lg border ${touched.telefono && !phoneRegex.test(form.telefono) ? 'border-red-400' : 'border-[#005156]/40'} focus:border-[#005156] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base placeholder-gray-400`} value={form.telefono} onChange={handleChange} onBlur={handleBlur} maxLength="10" />
                  {touched.telefono && !form.telefono && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">Este campo es obligatorio</span>}
                  {touched.telefono && form.telefono && !phoneRegex.test(form.telefono) && <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded absolute -bottom-6 left-1">El teléfono debe tener 10 dígitos.</span>}
                </div>
                <button type="submit" disabled={!isValid} className={`w-full bg-[#db1c2e] text-white font-bold py-3 rounded-lg mt-2 shadow-lg transition-transform duration-200 hover:scale-105 text-lg focus:outline-none focus:ring-2 focus:ring-[#005156]/40 ${!isValid ? 'opacity-60 cursor-not-allowed' : ''}`}>¡Agendar mi visita gratis!</button>
                <div className="text-xs text-[#005156] text-center mt-2 flex items-center gap-1 justify-center bg-[#f2efe2]/60 px-2 py-1 rounded"><FaLock className="inline-block mr-1 text-[#db1c2e]" />No compartimos tus datos con terceros.</div>
              </form>
            )}
          </section>
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
                  <p className="text-[#005156]/80 text-base">Av. Ejemplo 123, Veracruz, Ver.</p>
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.123456789!2d-96.1345678!3d19.1901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c34a123456789%3A0xabcdef123456789!2sTr%C3%A9bol%20II%2C%20Veracruz!5e0!3m2!1ses-419!2smx!4v1710000000000!5m2!1ses-419!2smx"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
              {/* Pin rojo REMAX animado */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                {/* Aquí podrías poner un ícono animado si lo deseas */}
              </motion.div>
            </div>
            <figcaption className="mt-2">
              <a href="https://goo.gl/maps/ejemplo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-[#005156] font-bold hover:underline text-lg transition hover:text-[#db1c2e] border-b-2 border-transparent hover:border-[#db1c2e] pb-1">
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