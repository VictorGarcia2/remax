import React, { useState, useEffect } from "react";
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
import { Link } from "react-router";

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

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
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
              className="w-40"
              alt=""
              />
            ) : (
                <img
                src="logos/New_RMX_Mark_R4_RGB_cream.png"
                className="w-40"
                alt=""
                />
            )}
            </Link>
          <a
            href="#contact"
            className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
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
            'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
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
            className="group bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-xl inline-flex items-center gap-2"
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
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-12 text-center text-white relative overflow-hidden">
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
              className="space-y-6 bg-white/30 backdrop-blur-md p-8 rounded-3xl shadow-xl"
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
          <div className="bg-gradient-to-r from-blueRemax to-blue-400 rounded-3xl p-16 relative overflow-hidden">
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
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                🔴 Solicita tu póliza ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Poliza;
