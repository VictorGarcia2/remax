import React, { useState, useEffect } from "react";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faAward, faChartLine, faUsers, faBriefcase, faGraduationCap } from "@fortawesome/free-solid-svg-icons";

export default function Reclutamiento() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    experience: "ninguna",
    education: "licenciatura",
    english: "basico",
    age: "",
    currentJob: "",
    availability: "completa",
    message: "" 
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Aquí iría la lógica para enviar el formulario
  };

  return (
    <>
      <Header />
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
                  className="inline-flex items-center bg-[#db1c2e] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#c01828] transition-all duration-300 shadow-lg"
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
                {/* Datos personales */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
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
                      <label className="block text-gray-700 mb-2 font-medium">Teléfono</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#db1c2e] focus:border-[#db1c2e]"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#db1c2e] text-white py-4 px-6 rounded-lg hover:bg-[#c01828] transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    ENVIAR MI SOLICITUD
                  </button>
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