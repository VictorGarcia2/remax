import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaShieldAlt } from "react-icons/fa";

export default function PropuestaFormularioDirecto() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes enviar el lead a Firestore, email, etc.
    setEnviado(true);
  };

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blueRemax via-blue-900 to-blue-800 overflow-hidden py-12">
      {/* Imagen de fondo hero */}
      <div className="absolute inset-0 z-0">
        <img src="/fotosdesarrollo/FACHADA.webp" alt="Fachada" className="w-full h-full object-cover opacity-30 scale-105 blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blueRemax/80 via-blue-900/80 to-blue-800/90"></div>
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center px-4">
        {/* Hero info y beneficios */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaShieldAlt className="text-green-400 text-2xl" />
            <span className="text-sm text-green-200 font-semibold tracking-wide">Asesoría certificada REMAX</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">TRÉBOL II: Tu hogar en el corazón de Veracruz</h2>
          <h3 className="text-xl md:text-2xl font-semibold text-blue-100 mb-4">Déjanos tus datos y recibe información exclusiva, precios y promociones.</h3>
          <ul className="mb-6 space-y-3">
            <li className="flex items-center gap-2 text-lg text-white/90"><FaCheckCircle className="text-green-400" /> Ubicación privilegiada</li>
            <li className="flex items-center gap-2 text-lg text-white/90"><FaCheckCircle className="text-green-400" /> Amenidades premium</li>
            <li className="flex items-center gap-2 text-lg text-white/90"><FaCheckCircle className="text-green-400" /> Seguridad 24/7</li>
            <li className="flex items-center gap-2 text-lg text-white/90"><FaCheckCircle className="text-green-400" /> Facilidades de pago</li>
          </ul>
          <div className="flex items-center gap-2 mt-2">
            <FaShieldAlt className="text-blueRemax text-lg" />
            <span className="text-xs text-blue-100">Tus datos están protegidos y solo los usaremos para contactarte.</span>
          </div>
        </motion.div>
        {/* Formulario destacado */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col justify-center border-t-8 border-blueRemax/80 max-w-md w-full mx-auto"
        >
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="nombre" className="text-blueRemax font-semibold">Nombre completo</label>
                <input name="nombre" id="nombre" type="text" required placeholder="Nombre completo" className="w-full p-3 rounded-lg border border-blueRemax/30 focus:border-blueRemax focus:ring-2 focus:ring-blueRemax/20 transition bg-white" value={form.nombre} onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-blueRemax font-semibold">Correo electrónico</label>
                <input name="email" id="email" type="email" required placeholder="Correo electrónico" className="w-full p-3 rounded-lg border border-blueRemax/30 focus:border-blueRemax focus:ring-2 focus:ring-blueRemax/20 transition bg-white" value={form.email} onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="telefono" className="text-blueRemax font-semibold">Teléfono</label>
                <input name="telefono" id="telefono" type="tel" required placeholder="Teléfono" className="w-full p-3 rounded-lg border border-blueRemax/30 focus:border-blueRemax focus:ring-2 focus:ring-blueRemax/20 transition bg-white" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="mensaje" className="text-blueRemax font-semibold">¿Qué te interesa saber?</label>
                <textarea name="mensaje" id="mensaje" placeholder="¿Qué te interesa saber?" className="w-full p-3 rounded-lg border border-blueRemax/30 focus:border-blueRemax focus:ring-2 focus:ring-blueRemax/20 transition bg-white min-h-[80px]" value={form.mensaje} onChange={handleChange} />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blueRemax to-blue-700 text-white font-bold py-3 rounded-lg mt-2 shadow-lg hover:from-blue-800 hover:to-blueRemax transition text-lg">¡Quiero más información!</button>
              <div className="text-xs text-gray-400 text-center mt-2">No compartimos tus datos con terceros.</div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
} 