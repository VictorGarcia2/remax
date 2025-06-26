import React, { useState, useEffect } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

export default function PropuestaModalLeadMagnet({ show, setShow }) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [enviado, setEnviado] = useState(false);
  const [touched, setTouched] = useState({});

  const errors = {
    nombre: !form.nombre,
    email: !emailRegex.test(form.email),
    telefono: !phoneRegex.test(form.telefono),
  };

  const isValid = !errors.nombre && !errors.email && !errors.telefono;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ nombre: true, email: true, telefono: true });
      return;
    }
    // Aquí puedes conectar con tu CRM:
    // await fetch('https://tu-crm.com/api/leads', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(form)
    // });
    setEnviado(true);
    setTimeout(() => {
      setShow(false);
      setEnviado(false);
      setForm({ nombre: "", email: "", telefono: "" });
      setTouched({});
    }, 3000);
  };

  useEffect(() => {
    // Reset form state when modal is closed
    if (!show) {
      setForm({ nombre: "", email: "", telefono: "" });
      setTouched({});
      setEnviado(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#f2efe2] rounded-2xl p-8 max-w-md w-full relative shadow-2xl animate-fadeIn">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-4 text-[#005156]/60 hover:text-[#005156] text-3xl font-bold transition-colors"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-[#005156] mb-2 text-center">
          Solicita tu visita gratis
        </h2>
        <p className="text-[#005156]/80 mb-6 text-center">
          Déjanos tus datos y un asesor te contactará para agendar tu visita.
        </p>
        {enviado ? (
          <div className="bg-[#005156]/10 text-[#005156] p-4 rounded-lg text-center font-semibold">
            <p className="font-bold">¡Gracias! Hemos recibido tus datos.</p>
            <p className="text-sm">
              Pronto un asesor se pondrá en contacto contigo.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="relative">
              <input
                name="nombre"
                type="text"
                required
                placeholder="Nombre completo"
                className={`w-full p-3 rounded-lg bg-white border ${
                  touched.nombre && errors.nombre
                    ? "border-red-500"
                    : "border-[#005156]/30"
                } focus:border-[#005156] focus:ring-2 focus:ring-[#005156]/20 transition`}
                value={form.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.nombre && errors.nombre && (
                <span className="text-xs text-red-600 absolute -bottom-5 left-1">
                  El nombre es obligatorio.
                </span>
              )}
            </div>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder="Correo electrónico"
                className={`w-full p-3 rounded-lg bg-white border ${
                  touched.email && errors.email
                    ? "border-red-500"
                    : "border-[#005156]/30"
                } focus:border-[#005156] focus:ring-2 focus:ring-[#005156]/20 transition`}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <span className="text-xs text-red-600 absolute -bottom-5 left-1">
                  Formato de correo inválido.
                </span>
              )}
            </div>
            <div className="relative">
              <input
                name="telefono"
                type="tel"
                required
                placeholder="Teléfono (10 dígitos)"
                maxLength="10"
                className={`w-full p-3 rounded-lg bg-white border ${
                  touched.telefono && errors.telefono
                    ? "border-red-500"
                    : "border-[#005156]/30"
                } focus:border-[#005156] focus:ring-2 focus:ring-[#005156]/20 transition`}
                value={form.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.telefono && errors.telefono && (
                <span className="text-xs text-red-600 absolute -bottom-5 left-1">
                  El teléfono debe tener 10 dígitos.
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full bg-[#005156] text-[#f2efe2] font-bold py-3 rounded-lg mt-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                !isValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Enviar y agendar visita
            </button>
          </form>
        )}
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }
      `}</style>
    </div>
  );
}