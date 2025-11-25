import React, { useState, useEffect } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

export default function PropuestaModalLeadMagnetPalma({ show, setShow }) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [touched, setTouched] = useState({});
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        setShow(false);
        setForm({ nombre: "", email: "", telefono: "" });
        setTouched({});
      }, 2500);
    }
  };

  const isValid = form.nombre && emailRegex.test(form.email) && phoneRegex.test(form.telefono);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#d2c8b3] rounded-2xl shadow-2xl max-w-md w-full mx-auto relative overflow-hidden border-4 border-[#7a8d77]">
        {/* Botón cerrar */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-[#4f634b] hover:text-[#7a8d77] text-2xl z-10 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center transition"
        >
          ×
        </button>

        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[#4f634b] to-[#7a8d77] text-white p-6 text-center relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">🌿 Propuesta Especial PALMA</h3>
            <p className="text-[#d2c8b3] text-sm">Desarrollo ecológico - Precio de preventa</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {enviado ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-[#4f634b] mb-2">¡Propuesta enviada!</h4>
              <p className="text-[#4f634b]/80">Un especialista te contactará en los próximos minutos con tu propuesta personalizada.</p>
            </div>
          ) : (
            <>
              {/* Beneficios destacados */}
              <div className="bg-[#4f634b]/5 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-[#4f634b] mb-3 text-center">🎯 Beneficios exclusivos de preventa:</h4>
                <ul className="text-sm text-[#4f634b]/80 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7a8d77] rounded-full"></span>
                    <span>Precio preferencial desde $1,750,000</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7a8d77] rounded-full"></span>
                    <span>0% de enganche hasta marzo 2025</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7a8d77] rounded-full"></span>
                    <span>Muebles de cocina incluidos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7a8d77] rounded-full"></span>
                    <span>Estacionamiento techado sin costo</span>
                  </li>
                </ul>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    name="nombre"
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    className={`w-full p-3 rounded-lg border ${
                      touched.nombre && !form.nombre ? 'border-red-400' : 'border-[#4f634b]/30'
                    } focus:border-[#7a8d77] focus:ring-2 focus:ring-[#7a8d77]/20 transition bg-white text-base`}
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.nombre && !form.nombre && (
                    <span className="text-xs text-red-500 absolute -bottom-5 left-1">
                      Este campo es obligatorio
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Tu correo electrónico"
                    className={`w-full p-3 rounded-lg border ${
                      touched.email && !emailRegex.test(form.email) ? 'border-red-400' : 'border-[#4f634b]/30'
                    } focus:border-[#7a8d77] focus:ring-2 focus:ring-[#7a8d77]/20 transition bg-white text-base`}
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && !form.email && (
                    <span className="text-xs text-red-500 absolute -bottom-5 left-1">
                      Este campo es obligatorio
                    </span>
                  )}
                  {touched.email && form.email && !emailRegex.test(form.email) && (
                    <span className="text-xs text-red-500 absolute -bottom-5 left-1">
                      Formato de correo inválido
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    name="telefono"
                    type="tel"
                    required
                    placeholder="Tu teléfono (10 dígitos)"
                    className={`w-full p-3 rounded-lg border ${
                      touched.telefono && !phoneRegex.test(form.telefono) ? 'border-red-400' : 'border-[#4f634b]/30'
                    } focus:border-[#7a8d77] focus:ring-2 focus:ring-[#7a8d77]/20 transition bg-white text-base`}
                    value={form.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="10"
                  />
                  {touched.telefono && !form.telefono && (
                    <span className="text-xs text-red-500 absolute -bottom-5 left-1">
                      Este campo es obligatorio
                    </span>
                  )}
                  {touched.telefono && form.telefono && !phoneRegex.test(form.telefono) && (
                    <span className="text-xs text-red-500 absolute -bottom-5 left-1">
                      El teléfono debe tener 10 dígitos
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isValid}
                  className={`w-full bg-gradient-to-r from-[#7a8d77] to-[#4f634b] text-white font-bold py-4 rounded-lg shadow-lg transition-all text-lg ${
                    !isValid ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  🌿 Recibir mi propuesta ecológica
                </button>
              </form>

              {/* Footer del modal */}
              <div className="text-center mt-4">
                <p className="text-xs text-[#4f634b]/60">
                  🔒 Tus datos están seguros. Solo nos contactaremos contigo para enviar tu propuesta personalizada.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
