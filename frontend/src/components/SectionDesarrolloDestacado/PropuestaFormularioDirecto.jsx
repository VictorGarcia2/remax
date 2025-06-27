import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaShieldAlt } from "react-icons/fa";

const PIPEDRIVE_API_KEY = "02317c5467585c4251d802ab65e0c7b9f60541ee";
const PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1";
const PIPELINE_ID_DESARROLLO = 2; // Cambia este valor por el ID del pipeline que desees
const STAGE_ID_DESARROLLO = 1;   // Cambia este valor por el ID de la etapa de ese pipeline

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

export default function PropuestaFormularioDirecto() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validación básica
      if (!form.nombre || !form.email || !form.telefono) {
        throw new Error('Por favor, completa todos los campos correctamente.');
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
      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
      }, 2500);
    } catch (error) {
      setEnviado(false);
      alert(error.message || 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
    }
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