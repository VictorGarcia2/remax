import React, { useState, useEffect } from "react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

// --- CONFIGURACIÓN PIPEDRIVE ---
const PIPEDRIVE_API_KEY = import.meta.env.VITE_PIPEDRIVE_API_KEY;
const PIPEDRIVE_API_URL = import.meta.env.VITE_PIPEDRIVE_API_URL || "https://api.pipedrive.com/v1";
const PIPELINE_ID_DESARROLLO = 4; // Pipeline específico para Torre Palma 347
const STAGE_ID_DESARROLLO = 19; // Stage "Cualificado" (primer stage del Pipeline 4)

// --- CAMPOS PERSONALIZADOS PARA PIPEDRIVE ---
const CUSTOM_FIELDS_DESARROLLO = {
  INTERES: {
    name: "Interés del Lead",
    field_type: "varchar",
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

export default function PropuestaModalPalma({ show, setShow }) {
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
    try {
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
        [customFields.INTERES]: "Torre Palma 347"
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
      const noteContent = `Lead generado desde la web (Torre Palma 347 - Slider Home):\n\nNombre: ${form.nombre}\nEmail: ${form.email}\nTeléfono: ${form.telefono}`;
      
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
        setShow(false);
        setEnviado(false);
        setForm({ nombre: "", email: "", telefono: "" });
        setTouched({});
      }, 3000);
      
    } catch (error) {
      setEnviado(false);
      alert(error.message || 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
    }
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
          className="absolute top-3 right-4 text-[#4f634b]/60 hover:text-[#4f634b] text-3xl font-bold transition-colors"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-[#4f634b] mb-2 text-center">
          Solicita tu visita gratis
        </h2>
        <p className="text-[#4f634b]/80 mb-6 text-center">
          Déjanos tus datos y un asesor te contactará para agendar tu visita.
        </p>
        {enviado ? (
          <div className="bg-[#4f634b]/10 text-[#4f634b] p-4 rounded-lg text-center font-semibold">
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
                    : "border-[#4f634b]/30"
                } focus:border-[#4f634b] focus:ring-2 focus:ring-[#4f634b]/20 transition`}
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
                    : "border-[#4f634b]/30"
                } focus:border-[#4f634b] focus:ring-2 focus:ring-[#4f634b]/20 transition`}
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
                    : "border-[#4f634b]/30"
                } focus:border-[#4f634b] focus:ring-2 focus:ring-[#4f634b]/20 transition`}
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
              className={`w-full bg-[#4f634b] text-[#f2efe2] font-bold py-3 rounded-lg mt-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
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
