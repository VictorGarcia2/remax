import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faAward, faChartLine, faUsers, faBriefcase, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { useSearchContext } from "../context/SearchContext";

// Constantes para Pipedrive
const PIPEDRIVE_API_KEY = "02317c5467585c4251d802ab65e0c7b9f60541ee";
const PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1";

// Definición de campos personalizados para Leads en Pipedrive
const CUSTOM_FIELDS = {
  EDAD: {
    name: "Edad del Candidato",
    field_type: "double",
    validation: (value) => value >= 18 && value <= 80
  },
  NIVEL_EDUCATIVO: {
    name: "Nivel Educativo",
    field_type: "enum",
    options: ["preparatoria", "tecnico", "licenciatura", "posgrado"],
    validation: (value) => ["preparatoria", "tecnico", "licenciatura", "posgrado"].includes(value)
  },
  NIVEL_INGLES: {
    name: "Nivel de Inglés",
    field_type: "enum",
    options: ["ninguno", "basico", "intermedio", "avanzado", "fluido"],
    validation: (value) => ["ninguno", "basico", "intermedio", "avanzado", "fluido"].includes(value)
  },
  EXPERIENCIA_INMOBILIARIA: {
    name: "Experiencia Inmobiliaria",
    field_type: "enum",
    options: ["ninguna", "menos1", "1a3", "mas3"],
    validation: (value) => ["ninguna", "menos1", "1a3", "mas3"].includes(value)
  },
  OCUPACION_ACTUAL: {
    name: "Ocupación Actual",
    field_type: "varchar",
    validation: (value) => value.length > 0 && value.length <= 100
  },
  DISPONIBILIDAD: {
    name: "Disponibilidad",
    field_type: "enum",
    options: ["completa", "media", "parcial"],
    validation: (value) => ["completa", "media", "parcial"].includes(value)
  },
  DIRECCION: {
    name: "Dirección",
    field_type: "varchar",
    validation: (value) => value.length > 0
  },
  UBICACION_LAT: {
    name: "Latitud",
    field_type: "varchar",
    validation: (value) => !isNaN(parseFloat(value))
  },
  UBICACION_LNG: {
    name: "Longitud",
    field_type: "varchar",
    validation: (value) => !isNaN(parseFloat(value))
  },
  SKILL_OFFICE: {
    name: "Nivel Office",
    field_type: "double",
    validation: (value) => value >= 1 && value <= 5
  },
  SKILL_REDES: {
    name: "Nivel Redes Sociales",
    field_type: "double",
    validation: (value) => value >= 1 && value <= 5
  },
  SKILL_CRM: {
    name: "Nivel CRM",
    field_type: "double",
    validation: (value) => value >= 1 && value <= 5
  },
  SKILL_VIDEOCONF: {
    name: "Nivel Videoconferencias",
    field_type: "double",
    validation: (value) => value >= 1 && value <= 5
  },
  SKILL_MARKETING: {
    name: "Nivel Marketing Digital",
    field_type: "double",
    validation: (value) => value >= 1 && value <= 5
  },
  TIENE_AUTO: {
    name: "Tiene Automóvil",
    field_type: "varchar",
    validation: (value) => ["Sí", "No"].includes(value)
  },
  TIENE_LAPTOP: {
    name: "Tiene Laptop",
    field_type: "varchar",
    validation: (value) => ["Sí", "No"].includes(value)
  },
  TIENE_SMARTPHONE: {
    name: "Tiene Smartphone",
    field_type: "varchar",
    validation: (value) => ["Sí", "No"].includes(value)
  }
};

// Función para asegurar que existan los campos personalizados
const ensureCustomFields = async () => {
  try {
    const fieldsResponse = await fetch(
      `${PIPEDRIVE_API_URL}/dealFields?api_token=${PIPEDRIVE_API_KEY}`
    );

    if (!fieldsResponse.ok) {
      throw new Error('Error al obtener campos de Pipedrive');
    }

    const existingFields = await fieldsResponse.json();
    const customFieldIds = {};

    for (const [key, field] of Object.entries(CUSTOM_FIELDS)) {
      const existingField = existingFields.data?.find(f => f.name === field.name);
      
      if (existingField) {
        // Si el campo existe pero es de tipo enum y tiene opciones diferentes, actualizarlo
        if (field.field_type === "enum" && field.options && 
            (!existingField.options || !arraysEqual(existingField.options.map(o => o.label), field.options))) {
          const updateResponse = await fetch(
            `${PIPEDRIVE_API_URL}/dealFields/${existingField.id}?api_token=${PIPEDRIVE_API_KEY}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: field.name,
                options: field.options.map(opt => ({ label: opt }))
              })
            }
          );
          
          if (!updateResponse.ok) {
            console.warn(`No se pudo actualizar el campo ${field.name}, pero continuará con el existente`);
          }
        }
        
        customFieldIds[key] = existingField.key;
      } else {
        // Crear nuevo campo
        const payload = {
          name: field.name,
          field_type: field.field_type
        };

        if (field.field_type === "enum" && field.options) {
          payload.options = field.options.map(opt => ({ label: opt }));
        }

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

const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
};

// Lista de posibles propietarios
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
    
    // Primero intentar encontrar un usuario específico
    let owner = null;
    
    // Buscar por coincidencias exactas primero
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

    // Si no se encuentra ningún usuario específico, buscar un administrador activo
    if (!owner) {
      owner = usersData.data.find(user => 
        user.active_flag && (user.role_id === 1 || user.is_admin) // role_id 1 suele ser admin
      );
    }

    // Si aún no hay owner, tomar el primer usuario activo
    if (!owner) {
      owner = usersData.data.find(user => user.active_flag);
    }

    // Si todavía no hay owner, tomar el primer usuario
    if (!owner && usersData.data.length > 0) {
      owner = usersData.data[0];
    }

    return owner;
  } catch (error) {
    console.error('Error al buscar propietario:', error);
    throw new Error('Error al buscar propietario en Pipedrive: ' + error.message);
  }
};

export default function Reclutamiento() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    lat: null,
    lng: null,
    experience: "ninguna",
    education: "licenciatura",
    english: "basico",
    age: "",
    currentJob: "",
    availability: "completa",
    techSkills: {
      officeTools: 1,
      socialMedia: 1,
      crm: 1,
      videoConference: 1,
      digitalMarketing: 1
    },
    equipment: {
      hascar: false,
      haslaptop: false,
      hassmartphone: false
    },
    message: "" 
  });
  
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  
  // Función para buscar sugerencias de direcciones usando la API de Mapbox
  const searchAddress = async (query) => {
    if (!query) {
      setAddressSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${"pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg"}&` +
        'country=mx&' +
        'types=address&' +
        'language=es'
      );
      
      const data = await response.json();
      setAddressSuggestions(data.features);
    } catch (error) {
      console.error("Error buscando dirección:", error);
    }
  };

  // Debounce para la búsqueda de direcciones
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address) {
        searchAddress(formData.address);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.address]);  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Modal de éxito
  const SuccessModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full transform transition-all">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Solicitud enviada con éxito!</h3>
            <p className="text-gray-600 mb-6">
              Gracias por tu interés en unirte a RE/MAX CIN. Nos pondremos en contacto contigo muy pronto.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#db1c2e] hover:bg-[#db1c2e]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#db1c2e]"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  };

  const validateFormData = (data) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    // Validación de campos básicos
    if (!data.name.trim()) {
      errors.name = "El nombre es requerido";
    }

    if (!data.email.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (!emailRegex.test(data.email)) {
      errors.email = "Ingresa un correo electrónico válido";
    }

    if (!data.phone.trim()) {
      errors.phone = "El teléfono es requerido";
    } else if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
      errors.phone = "Ingresa un número de teléfono válido (10 dígitos)";
    }

    if (!data.address.trim()) {
      errors.address = "La dirección es requerida";
    }

    if (!data.age || data.age < 18 || data.age > 80) {
      errors.age = "La edad debe estar entre 18 y 80 años";
    }

    // Validación de campos personalizados usando las validaciones definidas
    Object.entries(CUSTOM_FIELDS).forEach(([key, field]) => {
      if (field.validation) {
        let value;
        switch (key) {
          case 'NIVEL_EDUCATIVO':
            value = data.education;
            break;
          case 'NIVEL_INGLES':
            value = data.english;
            break;
          case 'EXPERIENCIA_INMOBILIARIA':
            value = data.experience;
            break;
          case 'DISPONIBILIDAD':
            value = data.availability;
            break;
          case 'SKILL_OFFICE':
            value = data.techSkills.officeTools;
            break;
          case 'SKILL_REDES':
            value = data.techSkills.socialMedia;
            break;
          case 'SKILL_CRM':
            value = data.techSkills.crm;
            break;
          case 'SKILL_VIDEOCONF':
            value = data.techSkills.videoConference;
            break;
          case 'SKILL_MARKETING':
            value = data.techSkills.digitalMarketing;
            break;
          default:
            return;
        }

        if (!field.validation(value)) {
          errors[key.toLowerCase()] = `El campo ${field.name} no es válido`;
        }
      }
    });

    if (!data.message.trim()) {
      errors.message = "Por favor, cuéntanos por qué quieres unirte a RE/MAX CIN";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar datos del formulario
      const validationErrors = validateFormData(formData);
      if (Object.keys(validationErrors).length > 0) {
        throw new Error('Por favor, verifica los campos marcados en rojo');
      }

      // 1. Asegurar que existan los campos personalizados
      const customFields = await ensureCustomFields();

      // 2. Crear o actualizar la persona en Pipedrive
      const personPayload = {
        name: formData.name,
        email: [{ value: formData.email, primary: true }],
        phone: [{ value: formData.phone, primary: true }],
        visible_to: 3 // Visible para toda la compañía
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
        const personError = await personResponse.json();
        throw new Error(`Error al crear el contacto: ${personError.error || 'Error desconocido'}`);
      }

      const personData = await personResponse.json();

      // 3. Obtener el owner adecuado utilizando la nueva función
      let owner;
      try {
        owner = await findOwnerInPipedrive(PIPEDRIVE_API_KEY);
        if (!owner) {
          throw new Error('No se encontró ningún usuario disponible en Pipedrive');
        }
      } catch (error) {
        console.error('Error al buscar el propietario:', error);
        // Si no se encuentra un propietario específico, intentar crear el deal sin propietario
        owner = { id: null };
      }

      // 4. Crear el deal con todos los campos personalizados
      const dealPayload = {
        title: `Candidato: ${formData.name}`,
        person_id: personData.data.id,
        ...(owner.id && { user_id: owner.id }),
        stage_id: 1,
        status: "open",
        visible_to: 3,
        [customFields.EDAD]: formData.age,
        [customFields.NIVEL_EDUCATIVO]: formData.education,
        [customFields.NIVEL_INGLES]: formData.english,
        [customFields.EXPERIENCIA_INMOBILIARIA]: formData.experience,
        [customFields.OCUPACION_ACTUAL]: formData.currentJob,
        [customFields.DISPONIBILIDAD]: formData.availability,
        [customFields.DIRECCION]: formData.address,
        [customFields.UBICACION_LAT]: formData.lat?.toString() || "",
        [customFields.UBICACION_LNG]: formData.lng?.toString() || "",
        [customFields.SKILL_OFFICE]: formData.techSkills.officeTools,
        [customFields.SKILL_REDES]: formData.techSkills.socialMedia,
        [customFields.SKILL_CRM]: formData.techSkills.crm,
        [customFields.SKILL_VIDEOCONF]: formData.techSkills.videoConference,
        [customFields.SKILL_MARKETING]: formData.techSkills.digitalMarketing,
        [customFields.TIENE_AUTO]: formData.equipment.hascar ? "Sí" : "No",
        [customFields.TIENE_LAPTOP]: formData.equipment.haslaptop ? "Sí" : "No",
        [customFields.TIENE_SMARTPHONE]: formData.equipment.hassmartphone ? "Sí" : "No"
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
        const dealError = await dealResponse.json();
        throw new Error(`Error al crear la oportunidad: ${dealError.error || 'Error desconocido'}`);
      }

      const dealData = await dealResponse.json();

      // 5. Crear una nota con información adicional
      const noteContent = `
Información detallada del candidato:
- Edad: ${formData.age} años
- Nivel educativo: ${formData.education}
- Nivel de inglés: ${formData.english}
- Experiencia inmobiliaria: ${formData.experience}
- Ocupación actual: ${formData.currentJob}
- Disponibilidad: ${formData.availability}
- Dirección: ${formData.address}
${formData.lat && formData.lng ? `- Ubicación: Lat ${formData.lat}, Lng ${formData.lng}` : ''}

Habilidades tecnológicas (1=Básico, 5=Avanzado):
- Office: ${formData.techSkills.officeTools}/5
- Redes sociales: ${formData.techSkills.socialMedia}/5
- CRM: ${formData.techSkills.crm}/5
- Videoconferencias: ${formData.techSkills.videoConference}/5
- Marketing digital: ${formData.techSkills.digitalMarketing}/5

Equipo disponible:
- Automóvil: ${formData.equipment.hascar ? 'Sí' : 'No'}
- Laptop: ${formData.equipment.haslaptop ? 'Sí' : 'No'}
- Smartphone: ${formData.equipment.hassmartphone ? 'Sí' : 'No'}

Mensaje del candidato:
${formData.message}`;

      const noteResponse = await fetch(
        `${PIPEDRIVE_API_URL}/notes?api_token=${PIPEDRIVE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: noteContent,
            deal_id: dealData.data.id
          })
        }
      );

      if (!noteResponse.ok) {
        console.warn("No se pudo crear la nota, pero el candidato fue registrado exitosamente");
      }

      // 6. Limpiar el formulario y mostrar mensaje de éxito
      setShowSuccessModal(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        lat: null,
        lng: null,
        experience: "ninguna",
        education: "licenciatura",
        english: "basico",
        age: "",
        currentJob: "",
        availability: "completa",
        techSkills: {
          officeTools: 1,
          socialMedia: 1,
          crm: 1,
          videoConference: 1,
          digitalMarketing: 1
        },
        equipment: {
          hascar: false,
          haslaptop: false,
          hassmartphone: false
        },
        message: ""
      });

    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      toast.error(error.message || 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { valor } = useSearchContext();

  return (
    <>
      <Header />
      {showSuccessModal && <SuccessModal />}
      {/* Hero Section */}
      <div className="relative pt-20 bg-cover bg-center" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"}}>
        <div className="container mx-auto px-6 py-24">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Contenido principal */}
            <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
              <div className="inline-block bg-[#db1c2e] px-4 py-1 rounded mb-4">
                <span className="text-white font-medium">RE/MAX CIN VERACRUZ</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                TRANSFORMA TU FUTURO
                <span className="block text-[#db1c2e]">EN BIENES RAÍCES</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-xl">
                Únete al equipo líder en bienes raíces en Veracruz y desarrolla una carrera exitosa con el respaldo de RE/MAX.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a 
                  href="#contacto" 
                  className={`inline-flex items-center text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg ${
                    valor === "comercial" ? "bg-redRemax hover:bg-redRemax/80" : "bg-blueRemax hover:bg-blueRemax/80"
                  }`}
                >
                  <span>Comienza hoy</span>
                  <FontAwesomeIcon icon={faChartLine} className="ml-2" />
                </a>
                <a 
                  href="#beneficios" 
                  className="inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-all duration-300"
                >
                  <span>Conocer más</span>
                  <FontAwesomeIcon icon={faUsers} className="ml-2" />
                </a>
              </div>
            </div>
            
            {/* Tarjeta destacada */}
            <div className="w-full lg:w-1/2 lg:pl-12">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform lg:translate-y-6">
                <div className="bg-[#db1c2e] p-4 text-white text-center">
                  <h3 className="text-xl font-bold">¿Por qué unirte a RE/MAX CIN Veracruz?</h3>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-[#db1c2e] text-4xl font-bold mb-1">10+</div>
                      <p className="text-gray-600 text-sm">Años en Veracruz</p>
                    </div>
                    <div className="text-center">
                      <div className="text-[#db1c2e] text-4xl font-bold mb-1">20+</div>
                      <p className="text-gray-600 text-sm">Agentes locales</p>
                    </div>
                    <div className="text-center">
                      <div className="text-[#db1c2e] text-4xl font-bold mb-1">500+</div>
                      <p className="text-gray-600 text-sm">Propiedades</p>
                    </div>
                    <div className="text-center">
                      <div className="text-[#db1c2e] text-4xl font-bold mb-1">#1</div>
                      <p className="text-gray-600 text-sm">En Veracruz</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center mb-4">
                      <FontAwesomeIcon icon={faUsers} className="text-[#db1c2e] mr-3 text-xl" />
                      <span className="font-medium">Equipo de élite local</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <FontAwesomeIcon icon={faChartLine} className="text-[#db1c2e] mr-3 text-xl" />
                      <span className="font-medium">Oportunidades en el mercado veracruzano</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faAward} className="text-[#db1c2e] mr-3 text-xl" />
                      <span className="font-medium">Capacitación personalizada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Beneficios */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué elegir <span className="text-[#db1c2e]">RE/MAX CIN</span>?</h2>
            <div className="w-24 h-1 bg-[#db1c2e] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#db1c2e] text-3xl mb-4">
                <FontAwesomeIcon icon={faGlobe} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Marca global</h3>
              <p className="text-gray-600">Respaldo de la marca inmobiliaria #1 del mundo presente en más de 110 países.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#db1c2e] text-3xl mb-4">
                <FontAwesomeIcon icon={faAward} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Prestigio profesional</h3>
              <p className="text-gray-600">Posiciónate como un asesor inmobiliario de élite en tu mercado local.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#db1c2e] text-3xl mb-4">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Capacitación continua</h3>
              <p className="text-gray-600">Acceso a programas de formación especializados y certificaciones internacionales.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#db1c2e] text-3xl mb-4">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Crecimiento profesional</h3>
              <p className="text-gray-600">Desarrollo de carrera con posibilidades de ingresos superiores al promedio.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#db1c2e] text-3xl mb-4">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Red de contactos</h3>
              <p className="text-gray-600">Conecta con más de 140,000 agentes en todo el mundo y amplía tus oportunidades.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#db1c2e] text-3xl mb-4">
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Modelo de negocio</h3>
              <p className="text-gray-600">Sistema probado que maximiza tus resultados y potencia tu desarrollo profesional.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tu camino al <span className="text-[#db1c2e]">éxito</span></h2>
            <div className="w-24 h-1 bg-[#db1c2e] mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Línea conectora (visible en desktop) */}
              <div className="hidden md:block absolute top-24 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-1 bg-[#db1c2e] z-0"></div>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 bg-white rounded-xl shadow-md p-8 text-center relative z-10">
                  <div className="w-12 h-12 bg-[#db1c2e] rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">1</div>
                  <h3 className="text-xl font-semibold mb-3">Entrevista inicial</h3>
                  <p className="text-gray-600">Conoce nuestro modelo de negocio y resuelve todas tus dudas.</p>
                </div>
                
                <div className="flex-1 bg-white rounded-xl shadow-md p-8 text-center relative z-10">
                  <div className="w-12 h-12 bg-[#db1c2e] rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">2</div>
                  <h3 className="text-xl font-semibold mb-3">Capacitación especializada</h3>
                  <p className="text-gray-600">Recibe entrenamiento en ventas, marketing y estrategias inmobiliarias.</p>
                </div>
                
                <div className="flex-1 bg-white rounded-xl shadow-md p-8 text-center relative z-10">
                  <div className="w-12 h-12 bg-[#db1c2e] rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">3</div>
                  <h3 className="text-xl font-semibold mb-3">Desarrollo profesional</h3>
                  <p className="text-gray-600">Comienza a operar con el respaldo de la marca inmobiliaria más reconocida.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto bg-[#db1c2e] rounded-xl p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"></div>
            <div className="relative z-10 text-center">
              <svg className="w-12 h-12 mx-auto mb-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl md:text-2xl font-light italic mb-6">
                "Unirme a RE/MAX CIN fue la mejor decisión de mi carrera profesional. La capacitación, el respaldo de marca y el ambiente de trabajo me han permitido crecer exponencialmente en el sector inmobiliario."
              </p>
              <p className="text-lg">— Carlos Méndez, Asesor Inmobiliario</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section id="contacto" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* CTA llamativo */}
            <div className="bg-gradient-to-r from-[#db1c2e] to-[#e84c59] rounded-xl p-8 mb-12 text-center text-white shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¡TU OPORTUNIDAD ESTÁ AQUÍ!</h2>
              <p className="text-xl mb-6">Completa el formulario y comienza tu carrera profesional en el sector inmobiliario con el respaldo de la marca #1</p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <FontAwesomeIcon icon={faChartLine} className="text-2xl mr-2" />
                  <span className="font-medium">Ingresos ilimitados</span>
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <FontAwesomeIcon icon={faUsers} className="text-2xl mr-2" />
                  <span className="font-medium">Networking profesional</span>
                </div>
                <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-2xl mr-2" />
                  <span className="font-medium">Capacitación continua</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#db1c2e]">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Formulario de aplicación</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos personales */}                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-[#db1c2e] mb-4">Datos personales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Nombre completo</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-gray-700 mb-2 font-medium">Domicilio de residencia</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Ingresa tu dirección"
                        required
                      />
                      {addressSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {addressSuggestions.map((suggestion) => (
                            <div
                              key={suggestion.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  address: suggestion.place_name,
                                  lat: suggestion.center[1],
                                  lng: suggestion.center[0]
                                });
                                setAddressSuggestions([]);
                              }}
                            >
                              {suggestion.place_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Edad</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Teléfono</label>                      <input
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            setFormData({ ...formData, phone: value });
                          }
                        }}
                        placeholder="Ej: 2291234567"
                        maxLength="10"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Correo electrónico</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Formación y experiencia */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-[#db1c2e] mb-4">Formación y experiencia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Nivel educativo</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      >
                        <option value="preparatoria">Preparatoria</option>
                        <option value="tecnico">Técnico</option>
                        <option value="licenciatura">Licenciatura</option>
                        <option value="posgrado">Posgrado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Nivel de inglés</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.english}
                        onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                      >
                        <option value="ninguno">Ninguno</option>
                        <option value="basico">Básico</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                        <option value="fluido">Fluido</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Experiencia inmobiliaria</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      >
                        <option value="ninguna">Sin experiencia</option>
                        <option value="menos1">Menos de 1 año</option>
                        <option value="1a3">1 a 3 años</option>
                        <option value="mas3">Más de 3 años</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Ocupación actual</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.currentJob}
                        onChange={(e) => setFormData({ ...formData, currentJob: e.target.value })}
                        placeholder="Ej: Vendedor, Estudiante, etc."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Disponibilidad */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-[#db1c2e] mb-4">Disponibilidad</h4>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Disponibilidad de tiempo</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    >
                      <option value="completa">Tiempo completo</option>
                      <option value="media">Medio tiempo</option>
                      <option value="parcial">Tiempo parcial</option>
                    </select>
                  </div>
                </div>
                
                {/* Motivación */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-[#db1c2e] mb-4">Motivación</h4>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">¿Por qué quieres unirte a RE/MAX CIN Veracruz?</label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Cuéntanos sobre ti y tus objetivos profesionales..."
                      required
                    ></textarea>
                  </div>
                </div>
                
                {/* Conocimientos tecnológicos */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-[#db1c2e] mb-4">Conocimientos tecnológicos</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Herramientas de Office (Word, Excel, etc.)</label>
                      <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex items-center">
                            <input
                              type="radio"
                              name="officeTools"
                              value={value}
                              checked={formData.techSkills.officeTools === value}
                              onChange={(e) => setFormData({
                                ...formData,
                                techSkills: {
                                  ...formData.techSkills,
                                  officeTools: parseInt(e.target.value)
                                }
                              })}
                              className="hidden"
                            />
                            <div className={`w-8 h-8 flex items-center justify-center border rounded-lg cursor-pointer transition-all ${
                              formData.techSkills.officeTools === value
                                ? 'bg-[#db1c2e] text-white border-[#db1c2e]'
                                : 'border-gray-300 hover:border-[#db1c2e]'
                            }`}>
                              {value}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Redes sociales profesionales</label>
                      <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex items-center">
                            <input
                              type="radio"
                              name="socialMedia"
                              value={value}
                              checked={formData.techSkills.socialMedia === value}
                              onChange={(e) => setFormData({
                                ...formData,
                                techSkills: {
                                  ...formData.techSkills,
                                  socialMedia: parseInt(e.target.value)
                                }
                              })}
                              className="hidden"
                            />
                            <div className={`w-8 h-8 flex items-center justify-center border rounded-lg cursor-pointer transition-all ${
                              formData.techSkills.socialMedia === value
                                ? 'bg-[#db1c2e] text-white border-[#db1c2e]'
                                : 'border-gray-300 hover:border-[#db1c2e]'
                            }`}>
                              {value}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">CRM y herramientas de gestión</label>
                      <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex items-center">
                            <input
                              type="radio"
                              name="crm"
                              value={value}
                              checked={formData.techSkills.crm === value}
                              onChange={(e) => setFormData({
                                ...formData,
                                techSkills: {
                                  ...formData.techSkills,
                                  crm: parseInt(e.target.value)
                                }
                              })}
                              className="hidden"
                            />
                            <div className={`w-8 h-8 flex items-center justify-center border rounded-lg cursor-pointer transition-all ${
                              formData.techSkills.crm === value
                                ? 'bg-[#db1c2e] text-white border-[#db1c2e]'
                                : 'border-gray-300 hover:border-[#db1c2e]'
                            }`}>
                              {value}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Videoconferencias (Zoom, Meet, etc.)</label>
                      <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex items-center">
                            <input
                              type="radio"
                              name="videoConference"
                              value={value}
                              checked={formData.techSkills.videoConference === value}
                              onChange={(e) => setFormData({
                                ...formData,
                                techSkills: {
                                  ...formData.techSkills,
                                  videoConference: parseInt(e.target.value)
                                }
                              })}
                              className="hidden"
                            />
                            <div className={`w-8 h-8 flex items-center justify-center border rounded-lg cursor-pointer transition-all ${
                              formData.techSkills.videoConference === value
                                ? 'bg-[#db1c2e] text-white border-[#db1c2e]'
                                : 'border-gray-300 hover:border-[#db1c2e]'
                            }`}>
                              {value}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Marketing digital</label>
                      <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label key={value} className="flex items-center">
                            <input
                              type="radio"
                              name="digitalMarketing"
                              value={value}
                              checked={formData.techSkills.digitalMarketing === value}
                              onChange={(e) => setFormData({
                                ...formData,
                                techSkills: {
                                  ...formData.techSkills,
                                  digitalMarketing: parseInt(e.target.value)
                                }
                              })}
                              className="hidden"
                            />
                            <div className={`w-8 h-8 flex items-center justify-center border rounded-lg cursor-pointer transition-all ${
                              formData.techSkills.digitalMarketing === value
                                ? 'bg-[#db1c2e] text-white border-[#db1c2e]'
                                : 'border-gray-300 hover:border-[#db1c2e]'
                            }`}>
                              {value}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      1: Básico, 2: Intermedio bajo, 3: Intermedio, 4: Intermedio alto, 5: Avanzado
                    </p>
                  </div>
                </div>

                {/* Equipo disponible */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-[#db1c2e] mb-4">Equipo disponible</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:border-[#db1c2e]">
                      <input
                        type="checkbox"
                        checked={formData.equipment.hascar}
                        onChange={(e) => setFormData({
                          ...formData,
                          equipment: {
                            ...formData.equipment,
                            hascar: e.target.checked
                          }
                        })}
                        className="hidden"
                      />
                      <div className={`w-6 h-6 border rounded mr-3 flex items-center justify-center transition-all ${
                        formData.equipment.hascar
                          ? 'bg-[#db1c2e] border-[#db1c2e]'
                          : 'border-gray-300'
                      }`}>
                        {formData.equipment.hascar && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700">Automóvil propio</span>
                    </label>

                    <label className="flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:border-[#db1c2e]">
                      <input
                        type="checkbox"
                        checked={formData.equipment.haslaptop}
                        onChange={(e) => setFormData({
                          ...formData,
                          equipment: {
                            ...formData.equipment,
                            haslaptop: e.target.checked
                          }
                        })}
                        className="hidden"
                      />
                      <div className={`w-6 h-6 border rounded mr-3 flex items-center justify-center transition-all ${
                        formData.equipment.haslaptop
                          ? 'bg-[#db1c2e] border-[#db1c2e]'
                          : 'border-gray-300'
                      }`}>
                        {formData.equipment.haslaptop && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700">Laptop</span>
                    </label>

                    <label className="flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:border-[#db1c2e]">
                      <input
                        type="checkbox"
                        checked={formData.equipment.hassmartphone}
                        onChange={(e) => setFormData({
                          ...formData,
                          equipment: {
                            ...formData.equipment,
                            hassmartphone: e.target.checked
                          }
                        })}
                        className="hidden"
                      />
                      <div className={`w-6 h-6 border rounded mr-3 flex items-center justify-center transition-all ${
                        formData.equipment.hassmartphone
                          ? 'bg-[#db1c2e] border-[#db1c2e]'
                          : 'border-gray-300'
                      }`}>
                        {formData.equipment.hassmartphone && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700">Smartphone</span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex flex-col gap-4">                    <button 
                      type="submit" 
                      className={`w-full text-white py-4 px-6 rounded-lg transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                        valor === "comercial" ? "bg-redRemax hover:bg-redRemax/80" : "bg-blueRemax hover:bg-blueRemax/80"
                      } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                          <span>Enviando...</span>
                        </div>
                      ) : "Enviar solicitud"}
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600">También puedes contactarnos directamente:</p>
                <p className="font-medium mt-2 text-[#db1c2e]">reclutamiento@remaxcin.com | (229) 269-6629</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#db1c2e] to-[#e84c59] rounded-xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Tu futuro en bienes raíces comienza hoy</h2>
              <p className="text-xl mb-8">Con RE/MAX CIN Veracruz, tendrás todas las herramientas para alcanzar el éxito profesional que buscas.</p>
              <a
                href="#contacto"
                className="inline-block bg-white text-[#db1c2e] px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Únete a nuestro equipo
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <SectionFooter />
    </>
  );
}