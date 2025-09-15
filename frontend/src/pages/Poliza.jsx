/* eslint-disable react/no-unescaped-entities */
import  { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle2,
  Contact,
  Search,
  FileSignature,
  Wallet,
  MessageSquareQuote,
  Lock,
  ChevronDown,
  Phone,
  Mail,
  Send,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

// Constantes para Pipedrive
const PIPEDRIVE_API_KEY = "02317c5467585c4251d802ab65e0c7b9f60541ee";
const PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1";

// Lista de posibles propietarios
const OWNER_MATCHES = [
  { type: 'name', value: 'veronica' },
  { type: 'name', value: 'verónica' },
  { type: 'email', value: 'adm.remaxrna@gmail.com' },
  { type: 'email', value: 'remaxcincoleccion@gmail.com' }
];

const findOwnerInPipedrive = async (apiKey) => {
  try {
    const response = await fetch(`${PIPEDRIVE_API_URL}/users?api_token=${apiKey}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch Pipedrive users');
    }

    const users = data.data;
    for (const user of users) {
      for (const match of OWNER_MATCHES) {
        if (match.type === 'name' && user.name.toLowerCase().includes(match.value)) {
          return user.id;
        }
        if (match.type === 'email' && user.email.toLowerCase() === match.value) {
          return user.id;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding owner in Pipedrive:', error);
    return null;
  }
};

function Poliza() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    propertyType: "Casa",
    rentPrice: "",
    preferCall: "No",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Modal de éxito
  const SuccessModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              ¡Formulario enviado con éxito!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Gracias por enviar la información. Nos pondremos en contacto contigo pronto.
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={() => setShowSuccessModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Encontrar el owner en Pipedrive
      const owner = await findOwnerInPipedrive(PIPEDRIVE_API_KEY);

      // 2. Crear la persona en Pipedrive
      const personResponse = await fetch(`${PIPEDRIVE_API_URL}/persons?api_token=${PIPEDRIVE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: [{ value: formData.email, primary: true }],
          phone: [{ value: formData.phone, primary: true }],
          owner_id: owner?.id || null,
        }),
      });

      if (!personResponse.ok) {
        throw new Error('Error al crear el contacto en Pipedrive');
      }

      const personData = await personResponse.json();      // 3. Crear el deal en Pipedrive
      const dealResponse = await fetch(`${PIPEDRIVE_API_URL}/deals?api_token=${PIPEDRIVE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },          body: JSON.stringify({
            title: `Póliza - ${formData.name}`,
            person_id: personData.data.id,
            user_id: owner?.id || null,
            stage_id: 1,
            pipeline_id: 1,
            status: "open",
            value: formData.rentPrice ? parseFloat(formData.rentPrice) : 0,
            currency: "MXN",
            visible_to: 3
          }),
      });      if (!dealResponse.ok) {
        const dealError = await dealResponse.json();
        throw new Error(`Error al crear el trato en Pipedrive: ${dealError.error || 'Error desconocido'}`);
      }

      const dealData = await dealResponse.json();
      if (!dealData.success) {
        throw new Error(`Error al crear el trato: ${dealData.error || 'Error desconocido'}`);
      }

      // 4. Agregar una nota con los detalles del formulario
      const noteContent = `
        Detalles de la solicitud de Póliza:
        
        Información general:
        - Nombre: ${formData.name}
        - Ubicación del inmueble: ${formData.location}
        - Tipo de inmueble: ${formData.propertyType}
        - Precio estimado de renta: ${formData.rentPrice}
        - Prefiere llamada: ${formData.preferCall}
        - Teléfono: ${formData.phone}
        - Email: ${formData.email}

        La persona está interesada en contratar una póliza de rentas para su propiedad.
      `;

      const noteResponse = await fetch(`${PIPEDRIVE_API_URL}/notes?api_token=${PIPEDRIVE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: noteContent,
          deal_id: dealData.data.id,
          person_id: personData.data.id,
        }),
      });

      setShowSuccessModal(true);
      setFormData({
        name: "",
        location: "",
        propertyType: "Casa",
        rentPrice: "",
        preferCall: "No",
        phone: "",
        email: "",
      });

    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      toast.error(error.message || 'Hubo un error al enviar el formulario. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      id: "1",
      question: "¿Qué cubre la Póliza de Rentas?",
      answer:
        "Pago garantizado de renta, respaldo legal, evaluación del inquilino, y en algunos casos, cobertura por daños o adeudos.",
    },
    {
      id: "2",
      question: "¿Cuánto cuesta la póliza?",
      answer:
        "La póliza es accesible y proporcional al monto de renta. Te ofrecemos una cotización personalizada sin compromiso.",
    },
    {
      id: "3",
      question: "¿Necesito un fiador tradicional?",
      answer:
        "No. Gracias a nuestra evaluación profesional del inquilino, no es necesario.",
    },
    {
      id: "4",
      question: "¿Quién me asesora en todo el proceso?",
      answer:
        "Un asesor certificado RE/MAX CIN te acompaña desde el primer contacto hasta la firma del contrato.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Pólizas de Renta - REMAX CIN Veracruz</title>
        <meta
          name="description"
          content="Protege tu inversión inmobiliaria con nuestras pólizas de renta. Garantía de pagos, respaldo legal y evaluación profesional de inquilinos."
        />
        <link rel="canonical" href="https://remaxcin.com/Polizas-de-renta" />
        <meta property="og:title" content="Pólizas de Renta - REMAX CIN Veracruz" />
        <meta property="og:description" content="Protege tu inversión inmobiliaria con nuestras pólizas de renta. Garantía de pagos y respaldo legal." />
        <meta property="og:url" content="https://remaxcin.com/Polizas-de-renta" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-lg shadow-md py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
            <Link to={"/"} className="flex items-center">
          {isScrolled ? (
              <img
              src="logos/New_RMX_Mark_R4_RGB_dark.png"
              className="w-37 md:w-40"
              alt=""
              />
            ) : (
                <img
                src="logos/New_RMX_Mark_R4_RGB_cream.png"
                className="w-37 md:w-40"
                alt=""
                />
            )}
            </Link>
          <a
            href="#contact"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
          >
            Solicitar póliza
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/90"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center text-white">
            Póliza de Rentas
            <span className="block text-blue-400">con respaldo RE/MAX CIN</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-200">
            Renta tu propiedad con seguridad, respaldo legal y la garantía de
            recibir tus pagos puntualmente. Sin fiador, sin riesgos.
          </p>
          <a
            href="#contact"
            className="group bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-xl inline-flex items-center gap-2"
          >
            🔵 Solicita tu póliza ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            ¿Por qué contratar una{" "}
            <span className="gradient-text">Póliza de Rentas</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Wallet className="w-12 h-12 text-blue-600" />,
                title: "Pagos garantizados",
                description: "Cada mes, aunque el inquilino no pague",
              },
              {
                icon: <Search className="w-12 h-12 text-blue-600" />,
                title: "Evaluación profesional",
                description: "Del perfil del inquilino",
              },
              {
                icon: <Shield className="w-12 h-12 text-blue-600" />,
                title: "Respaldo legal completo",
                description: "En caso de incumplimiento",
              },
              {
                icon: <CheckCircle2 className="w-12 h-12 text-blue-600" />,
                title: "Cobertura total",
                description: "Por daños, adeudos o incumplimientos",
              },
              {
                icon: <Contact className="w-12 h-12 text-blue-600" />,
                title: "Sin fiador",
                description: "No necesitas fiador tradicional",
              },
              {
                icon: <Send className="w-12 h-12 text-blue-600" />,
                title: "Proceso digital",
                description: "Rápido y sin complicaciones",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl shadow-lg card-hover"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-2xl">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            ¿Cómo <span className="gradient-text">funciona</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Contact className="w-12 h-12 text-blue-600" />,
                title: "Contáctanos",
                description: "Danos los datos básicos de tu propiedad",
              },
              {
                icon: <Search className="w-12 h-12 text-blue-600" />,
                title: "Evaluación",
                description:
                  "Evaluamos al inquilino y preparamos la documentación",
              },
              {
                icon: <FileSignature className="w-12 h-12 text-blue-600" />,
                title: "Firma",
                description: "Se firma el contrato con respaldo legal",
              },
              {
                icon: <Wallet className="w-12 h-12 text-blue-600" />,
                title: "Pagos",
                description:
                  "Recibes tus pagos mensualmente, con total tranquilidad",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg card-hover relative"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-2xl">{step.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] opacity-10"></div>
            <div className="relative z-10">
              <MessageSquareQuote className="w-16 h-16 mx-auto mb-8 animate-float" />
              <blockquote className="text-2xl font-light italic mb-8">
                "Renté mi departamento en Boca del Río con RE/MAX CIN y contraté
                la Póliza de Rentas. Todo fue muy ágil y profesional. Ahora
                tengo tranquilidad total mes a mes, ¡y sin preocuparme por
                impagos o fiadores complicados!"
              </blockquote>
              <p className="text-xl">— María L. González, Propietaria feliz</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section
        id="contact"
        className="py-32 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
               Solicita tu póliza en{" "}
              <span className="gradient-text">menos de 1 minuto</span>
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl"
            >
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Nombre completo
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Ubicación del inmueble
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Tipo de inmueble
                </label>
                <select
                  className="input-field"
                  value={formData.propertyType}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyType: e.target.value })
                  }
                  required
                >
                  <option>Casa</option>
                  <option>Departamento</option>
                  <option>Local comercial</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Precio estimado de renta mensual
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.rentPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, rentPrice: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  ¿Prefieres que te llamemos?
                </label>
                <select
                  className="input-field"
                  value={formData.preferCall}
                  onChange={(e) =>
                    setFormData({ ...formData, preferCall: e.target.value })
                  }
                  required
                >
                  <option>No</option>
                  <option>Sí</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  WhatsApp o Teléfono de contacto
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Solicitar ahora
              </button>
            </form>
            <div className="mt-12 text-center space-y-4">
              <p className="flex items-center justify-center gap-2 text-gray-600">
                <Phone className="w-5 h-5" />
                También puedes escribirnos directamente a WhatsApp
              </p>
              <p className="flex items-center justify-center gap-2 text-gray-600">
                <Mail className="w-5 h-5" />O por correo: contact@remaxcin.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            Preguntas <span className="gradient-text">frecuentes</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  className="w-full px-8 py-6 text-left flex justify-between items-center"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === faq.id ? null : faq.id
                    )
                  }
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-blue-600 transition-transform duration-300 ${
                      activeAccordion === faq.id ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {activeAccordion === faq.id && (
                  <div className="px-8 py-6 bg-gray-50">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-blueRemax to-blue-400 rounded-2xl p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] opacity-10"></div>
            <div className="relative z-10">
              <Lock className="w-16 h-16 text-white mx-auto mb-8 animate-float" />
              <h2 className="text-4xl font-bold mb-6 text-white">
                Confía en los expertos. Renta con seguridad, respaldo y
                tranquilidad.
              </h2>
              <p className="text-xl text-white/90 mb-12">
                Con RE/MAX CIN y Póliza de Rentas México®, tu inversión está
                protegida.
              </p>
              <a
                href="#contact"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                🔴 Solicita tu póliza ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg p-8 max-w-md w-full">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          ¡Formulario enviado con éxito!
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Gracias por enviar la información. Nos pondremos en contacto contigo pronto.
        </p>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => setShowSuccessModal(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </>
  );
}

export default Poliza;
