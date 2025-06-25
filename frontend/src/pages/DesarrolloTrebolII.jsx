import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaShieldAlt, FaMapMarkerAlt, FaHome, FaKey, FaCar, FaUserShield, FaLock, FaMapMarkedAlt } from "react-icons/fa";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Swipe en mobile
  let touchStartX = null;
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX - touchStartX > 50) prevImage();
    if (touchEndX - touchStartX < -50) nextImage();
    touchStartX = null;
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
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
  const isValid = form.nombre && form.email && form.telefono;

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 font-sans tracking-wide overflow-x-hidden">
      <Header  />
      {/* 3. HERO/INTRO */}
      <section className="relative mt-20 min-h-[60vh] flex flex-col justify-center items-center text-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/fotosdesarrollo/FACHADA.webp" alt="Fachada" className="w-full h-full object-cover opacity-60 scale-105 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-blueRemax/90 via-blue-900/80 to-blue-800/90"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-4 bg-white/20 backdrop-blur-lg rounded-2xl px-8 py-8 shadow-xl border border-white/30"
        >
          <div className="flex items-center gap-2 mb-1">
            <FaShieldAlt className="text-white text-xl" />
            <span className="text-xs text-white font-semibold tracking-wide">Asesoría certificada RE/MAX CIN</span>
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
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-1 drop-shadow-lg leading-tight"
          >
            TRÉBOL II
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl font-semibold text-blue-100 mb-1"
          >
            Tu hogar en el corazón de Veracruz
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-lg text-blue-50 mb-2"
          >
            Descubre tu próximo hogar con espacios únicos diseñados para tu familia. Vive cerca de todo, con amenidades premium y la seguridad que tu familia merece.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.07 }}
            className="inline-flex items-center gap-2 bg-[#db1c2e] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-red-700 transition text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blueRemax/40"
            onClick={() => {
              const formSection = document.getElementById('contacto');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <FaCheckCircle className="text-white" /> Solicita información
          </motion.button>
          <div className="text-xs text-blue-100 mt-2">Sin compromiso. Un asesor certificado te contactará en minutos.</div>
        </motion.div>
      </section>

      {/* 4. SLIDER REDISEÑADO SIN BORDES Y MÁS ANCHO */}
      <section className="relative z-10 w-full flex flex-col items-center gap-8 py-12 px-0 bg-transparent mt-4">
        <h3 className="text-2xl font-bold text-blueRemax mb-6 tracking-wide text-center w-full">Galería del desarrollo</h3>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full max-w-[96vw] md:max-w-[90vw] lg:max-w-[1200px] aspect-video rounded-2xl overflow-hidden shadow-2xl group bg-white"
          style={{ boxShadow: '0 8px 40px 0 rgba(30, 64, 175, 0.10)' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
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
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blueRemax hover:bg-blue-800 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all z-10"
          >
            <span className="sr-only">Anterior</span>
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blueRemax hover:bg-blue-800 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all z-10"
          >
            <span className="sr-only">Siguiente</span>
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          {/* Contador */}
          <div className="absolute top-4 right-4 bg-blueRemax text-white font-bold px-4 py-1 rounded-full shadow text-sm">{currentImageIndex + 1}/{images.length}</div>
        </motion.div>
        {/* Miniaturas */}
        <div className="flex gap-4 mt-4 justify-center flex-wrap">
          {images.map((img, idx) => (
            <motion.button
              key={img.url}
              onClick={() => setCurrentImageIndex(idx)}
              whileHover={{ scale: 1.10 }}
              className={`rounded-xl overflow-hidden shadow-lg transition-all duration-200 ${idx === currentImageIndex ? 'scale-110 bg-white/90' : 'opacity-80 bg-white/60'}`}
              style={{ width: 90, height: 60 }}
              aria-label={img.title}
            >
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* 5. BENEFICIOS Y AMENIDADES */}
      <section className="w-full bg-white py-16 px-2 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Beneficios */}
          <div className="flex flex-col gap-8">
            <h3 className="text-3xl font-bold text-blueRemax mb-2 flex items-center gap-3">
              ¿Por qué elegir TRÉBOL II?
              <span className="inline-block bg-[#db1c2e] text-white text-xs font-bold px-3 py-1 rounded-full shadow ml-2">RE/MAX CIN</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-7 text-blue-900 flex flex-col gap-3 shadow-2xl border-b-4 border-blueRemax">
                <div className="flex items-center gap-3 mb-1"><FaMapMarkerAlt className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Ubicación privilegiada</span></div>
                <div className="text-xs text-[#db1c2e] mb-2">Cerca de todo <span className="ml-2 bg-blueRemax text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Premium</span></div>
                <ul className="list-disc ml-6 text-base text-blue-900/90">
                  <li>A 15 minutos de Centro Histórico</li>
                  <li>Playas de Veracruz</li>
                  <li>Ciudad Industrial</li>
                  <li>Centros comerciales</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-7 text-blue-900 flex flex-col gap-3 shadow-2xl border-b-4 border-[#db1c2e]">
                <div className="flex items-center gap-3 mb-1"><FaHome className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Vida a tu alrededor</span></div>
                <div className="text-xs text-blueRemax mb-2">Comodidad total <span className="ml-2 bg-[#db1c2e] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Nuevo</span></div>
                <ul className="list-disc ml-6 text-base text-blue-900/90">
                  <li>Supermercados (Soriana, Chedraui)</li>
                  <li>Escuelas y universidades</li>
                  <li>Clínicas y servicios médicos</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-7 text-blue-900 flex flex-col gap-3 shadow-2xl border-b-4 border-blueRemax">
                <div className="flex items-center gap-3 mb-1"><FaKey className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Todos incluyen</span></div>
                <div className="text-xs text-blueRemax mb-2">Equipamiento premium</div>
                <ul className="list-disc ml-6 text-base text-blue-900/90">
                  <li>Cocina integral</li>
                  <li>Sala-comedor</li>
                  <li>Cuarto de lavado</li>
                  <li>Recámara principal con baño completo</li>
                  <li>Estacionamiento</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-7 text-blue-900 flex flex-col gap-3 shadow-2xl border-b-4 border-[#db1c2e]">
                <div className="flex items-center gap-3 mb-1"><FaCar className="text-[#db1c2e] text-3xl" /><span className="font-bold text-lg">Estacionamiento</span></div>
                <div className="text-xs text-blueRemax mb-2">Acceso seguro</div>
                <ul className="list-disc ml-6 text-base text-blue-900/90">
                  <li>1 o 2 cajones por departamento</li>
                  <li>Acceso controlado</li>
                  <li>Visitas</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <FaUserShield className="text-blueRemax text-lg" />
              <span className="text-xs text-gray-700 font-semibold bg-blue-50 px-2 py-1 rounded flex items-center gap-1"><FaLock className="inline-block mr-1 text-[#db1c2e]" />Tus datos están protegidos y solo los usaremos para contactarte.</span>
            </div>
          </div>
          {/* Formulario */}
          <div className="bg-blue-50 rounded-2xl shadow-2xl p-10 flex flex-col justify-center border-t-8 border-[#db1c2e] max-w-md w-full mx-auto" id="contacto">
            <h4 className="text-2xl font-bold text-blueRemax mb-4 text-center">Solicita información</h4>
            {enviado ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-100 text-green-800 p-6 rounded-xl text-center font-semibold shadow-lg"
              >
                ¡Gracias! Un asesor te contactará en menos de 24h.
              </motion.div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
                <div className="flex flex-col gap-2">
                  <label htmlFor="nombre" className="text-blueRemax font-semibold">Nombre completo</label>
                  <input name="nombre" id="nombre" type="text" required placeholder="Nombre completo" className={`w-full p-3 rounded-lg border ${touched.nombre && !form.nombre ? 'border-red-400' : 'border-blueRemax/30'} focus:border-[#db1c2e] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base`} value={form.nombre} onChange={handleChange} onBlur={handleBlur} />
                  {touched.nombre && !form.nombre && <span className="text-xs text-red-500">Este campo es obligatorio</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-blueRemax font-semibold">Correo electrónico</label>
                  <input name="email" id="email" type="email" required placeholder="Correo electrónico" className={`w-full p-3 rounded-lg border ${touched.email && !form.email ? 'border-red-400' : 'border-blueRemax/30'} focus:border-[#db1c2e] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base`} value={form.email} onChange={handleChange} onBlur={handleBlur} />
                  {touched.email && !form.email && <span className="text-xs text-red-500">Este campo es obligatorio</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="telefono" className="text-blueRemax font-semibold">Teléfono</label>
                  <input name="telefono" id="telefono" type="tel" required placeholder="Teléfono" className={`w-full p-3 rounded-lg border ${touched.telefono && !form.telefono ? 'border-red-400' : 'border-blueRemax/30'} focus:border-[#db1c2e] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white text-base`} value={form.telefono} onChange={handleChange} onBlur={handleBlur} />
                  {touched.telefono && !form.telefono && <span className="text-xs text-red-500">Este campo es obligatorio</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="mensaje" className="text-blueRemax font-semibold">¿Qué te interesa saber?</label>
                  <textarea name="mensaje" id="mensaje" placeholder="¿Qué te interesa saber?" className="w-full p-3 rounded-lg border border-blueRemax/30 focus:border-[#db1c2e] focus:ring-2 focus:ring-[#db1c2e]/20 transition bg-white min-h-[80px] text-base" value={form.mensaje} onChange={handleChange} />
                </div>
                <button type="submit" disabled={!isValid} className={`w-full bg-[#db1c2e] text-white font-bold py-3 rounded-lg mt-2 shadow-lg transition-transform duration-200 hover:scale-105 text-lg focus:outline-none focus:ring-2 focus:ring-blueRemax/40 ${!isValid ? 'opacity-60 cursor-not-allowed' : ''}`}>¡Quiero más información!</button>
                <div className="text-xs text-blueRemax text-center mt-2 flex items-center gap-1 justify-center bg-blue-100/60 px-2 py-1 rounded"><FaLock className="inline-block mr-1 text-[#db1c2e]" />No compartimos tus datos con terceros.</div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 7. UBICACIÓN PREMIUM REMAX */}
      <section className="w-full bg-gradient-to-br from-white via-blue-50 to-blue-100 py-16 px-4 flex flex-col items-center">
        <h3 className="text-4xl font-extrabold text-blueRemax mb-4 text-center drop-shadow">Ubicación privilegiada</h3>
        <p className="text-lg text-gray-800 mb-8 max-w-2xl text-center">TRÉBOL II se encuentra en una de las zonas más conectadas de Veracruz, cerca de centros comerciales, escuelas, hospitales y a minutos de las mejores playas y el centro histórico.</p>
        <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl items-center justify-center">
          <div className="flex-1 grid grid-cols-1 gap-6">
            {/* Cards de datos clave */}
            <div className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border-l-8 border-blueRemax relative">
              <span className="absolute -top-3 -left-3 bg-[#db1c2e] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Clave</span>
              <FaMapMarkerAlt className="text-[#db1c2e] text-2xl" />
              <div>
                <div className="text-blueRemax font-bold text-lg">Dirección</div>
                <div className="text-gray-700 text-base">Av. Ejemplo 123, Veracruz, Ver.</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border-l-8 border-[#db1c2e] relative">
              <span className="absolute -top-3 -left-3 bg-blueRemax text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Nuevo</span>
              <FaHome className="text-[#db1c2e] text-2xl" />
              <div>
                <div className="text-blueRemax font-bold text-lg">A 15 min de</div>
                <div className="text-gray-700 text-base">Centro Histórico y playas</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border-l-8 border-[#db1c2e] relative">
              <span className="absolute -top-3 -left-3 bg-[#db1c2e] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">Premium</span>
              <FaCar className="text-[#db1c2e] text-2xl" />
              <div>
                <div className="text-blueRemax font-bold text-lg">Estacionamiento</div>
                <div className="text-gray-700 text-base">1 o 2 cajones por depa</div>
              </div>
            </div>
          </div>
          {/* Mapa con pin rojo REMAX animado */}
          <div className="flex-1 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl  relative bg-white">
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
                <div className="w-10 h-10 rounded-full bg-[#db1c2e] border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
              </motion.div>
            </div>
            <a href="https://goo.gl/maps/ejemplo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-2 text-blueRemax font-bold hover:underline text-lg transition hover:text-[#db1c2e] border-b-2 border-transparent hover:border-[#db1c2e] pb-1">
              <FaMapMarkedAlt /> Cómo llegar
            </a>
            <div className="text-xs text-blue-900 text-center mt-2 flex items-center justify-center gap-1 bg-white/80 rounded-full px-3 py-1 w-fit mx-auto shadow"><FaCheckCircle className="text-green-500" /> Ubicación verificada por REMAX</div>
          </div>
        </div>
      </section>
      <SectionFooter />
    </main>
  );
} 