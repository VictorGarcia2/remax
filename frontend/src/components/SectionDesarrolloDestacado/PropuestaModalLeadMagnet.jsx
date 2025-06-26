import React, { useState } from "react";

export default function PropuestaModalLeadMagnet({ show, setShow }) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí puedes conectar con tu CRM:
    // await fetch('https://tu-crm.com/api/leads', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(form)
    // });
    setEnviado(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl animate-fadeIn">
        <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
        <h2 className="text-2xl font-bold text-blueRemax mb-2 text-center">Solicita tu visita gratis</h2>
        <p className="text-blue-900 mb-4 text-center">Déjanos tus datos y un asesor te contactará para agendar tu visita.</p>
        {enviado ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold">¡Gracias! Pronto te contactaremos.</div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input name="nombre" type="text" required placeholder="Nombre completo" className="w-full p-3 rounded bg-gray-100 border border-blueRemax/20 focus:border-blueRemax" value={form.nombre} onChange={handleChange} />
            <input name="email" type="email" required placeholder="Correo electrónico" className="w-full p-3 rounded bg-gray-100 border border-blueRemax/20 focus:border-blueRemax" value={form.email} onChange={handleChange} />
            <input name="telefono" type="tel" required placeholder="Teléfono" className="w-full p-3 rounded bg-gray-100 border border-blueRemax/20 focus:border-blueRemax" value={form.telefono} onChange={handleChange} />
            <button type="submit" className="w-full bg-gradient-to-r from-blueRemax to-blue-700 text-white font-bold py-3 rounded-lg mt-2 hover:bg-blue-800 transition">Enviar</button>
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