import React, { useState } from "react";

export default function PropuestaModalLeadMagnet() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
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
    <section className="relative w-full py-16 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Descubre tu nuevo hogar en TRÉBOL II</h2>
        <h3 className="text-2xl md:text-3xl font-semibold text-blue-200 mb-4">Solicita el brochure digital y recibe asesoría personalizada.</h3>
        <ul className="mb-8 text-gray-200 space-y-2">
          <li>• Departamentos desde $X,XXX,XXX MXN</li>
          <li>• A 15 minutos de todo</li>
          <li>• Promociones por tiempo limitado</li>
        </ul>
        <button onClick={() => setShowModal(true)} className="bg-blueRemax text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-lg hover:bg-blue-800 transition">Descargar brochure</button>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl">×</button>
            {enviado ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg">¡Gracias! Pronto recibirás el brochure y un asesor te contactará.</div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input name="nombre" type="text" required placeholder="Nombre completo" className="w-full p-3 rounded bg-gray-100" value={form.nombre} onChange={handleChange} />
                <input name="email" type="email" required placeholder="Correo electrónico" className="w-full p-3 rounded bg-gray-100" value={form.email} onChange={handleChange} />
                <input name="telefono" type="tel" required placeholder="Teléfono" className="w-full p-3 rounded bg-gray-100" value={form.telefono} onChange={handleChange} />
                <button type="submit" className="w-full bg-blueRemax text-white font-bold py-3 rounded-lg mt-2 hover:bg-blue-800 transition">Solicitar brochure</button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
} 