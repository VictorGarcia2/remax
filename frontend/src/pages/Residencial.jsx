import React, { Suspense, lazy, useEffect, useState, useRef, memo } from "react";

// Importar HomeSearch directamente para carga prioritaria
import HomeSearch from "../components/SectionHome/HomeSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchContext } from "../context/SearchContext";
import { motion } from "framer-motion";

// Importar solo los componentes críticos directamente
import SectionDesarrolloDestacado from "../components/SectionDesarrolloDestacado/SectionDesarrolloDestacado";

// Lazy loaded components con prioridades
const SectionPorque = lazy(() => import("../components/SectionPorque/SectionPorque"));
const SectionVariedad = lazy(() => import("../components/SectionVariedad/SectionVariedad"));
const SectionComoComprar = lazy(() => import("../components/SectionComoComprar/SectionComoComprar"));
const SectionCTA = lazy(() => import("../components/SectionCTA/SectionCTA"));
const Testimonials = lazy(() => import("../components/SectionOpiniones/SectionOpiniones"));
const SectionEquipo = lazy(() => import("../components/SectionEquipo/SectionEquipo"));
const SectionFooter = lazy(() => import("../components/SectionFooter/SectionFooter"));

// Placeholder optimizado con dimensiones específicas para cada sección
const Placeholder = memo(({ height = 20, className = "" }) => (
  <div style={{ height: `${height}px`, width: "100%" }} className={`bg-gray-50 ${className}`} />
));

// Placeholders específicos para cada sección para evitar layout shifts
const SectionPlaceholders = {
  porQue: <Placeholder height={400} className="mb-8" />,
  variedad: <Placeholder height={600} className="mb-8" />,
  comoComprar: <Placeholder height={500} className="mb-8" />,
  cta: <Placeholder height={300} className="mb-8" />,
  testimonials: <Placeholder height={450} className="mb-8" />,
  equipo: <Placeholder height={550} className="mb-8" />,
  footer: <Placeholder height={200} />
};

// AnimatedSection optimizado
const AnimatedSection = memo(({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    observer.observe(currentRef);

    // Optimización: verificar visibilidad inicial
    if (currentRef.getBoundingClientRect().top < window.innerHeight) {
      setIsVisible(true);
      observer.unobserve(currentRef);
    }

    return () => currentRef && observer.unobserve(currentRef);
  }, []);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", delay: delay / 1000 }
    }
  };

  return (
    <div ref={sectionRef} className={className}>
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={variants}
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </div>
  );
});

// ScrollToTopButton optimizado
const ScrollToTopButton = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const { valor } = useSearchContext();

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 500);
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300 ${
        valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
      } ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
      }`}
      aria-label="Volver al inicio"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
});

// Componente principal optimizado
const Residencial = ({
  valor,
  autoCompleteHome,
  setAutoCompleteHome,
  setBusqueda,
  propiedades,
}) => {
  const {
    selectedOptionsOperacion,
    setSelectedOptionsOperacion,
    valor: contextValor,
  } = useSearchContext();

  const firstSectionRef = useRef(null);
  const [showSectionPorque, setShowSectionPorque] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    variedad: false,
    comoComprar: false,
    cta: false,
    testimonials: false,
    equipo: false,
    footer: false
  });

  // Cargar SectionPorque después de que HomeSearch esté listo
  useEffect(() => {
    const timer = setTimeout(() => setShowSectionPorque(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Optimización: usar IntersectionObserver en lugar de eventos de scroll
  useEffect(() => {
    // Crear un observer para cada sección
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.dataset.section;
            if (sectionId && !visibleSections[sectionId]) {
              setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
              // Dejar de observar una vez que se ha cargado
              sectionObserver.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.1 }
    );
    
    // Observar todos los contenedores de sección
    const sectionContainers = document.querySelectorAll('[data-section]');
    sectionContainers.forEach(container => {
      sectionObserver.observe(container);
    });
    
    return () => {
      sectionContainers.forEach(container => {
        sectionObserver.unobserve(container);
      });
    };
  }, []);

  return (
    <>
      <div ref={firstSectionRef} className=" z-20">
        <HomeSearch
          valor={valor}
          setBusqueda={setBusqueda}
          autoCompleteHome={autoCompleteHome}
          setAutoCompleteHome={setAutoCompleteHome}
        />
      </div>

      <div className=" z-10">
        <Suspense fallback={SectionPlaceholders.porQue}>
          {showSectionPorque ? <SectionPorque valor={valor} /> : <div style={{height: "400px"}} />}
        </Suspense>
      </div>

      <div className="section-variedad-container" data-section="variedad">
        <Suspense fallback={SectionPlaceholders.variedad}>
          <AnimatedSection delay={0.2}>
            {visibleSections.variedad ? 
              <SectionVariedad valor={valor} setBusqueda={setBusqueda} /> : 
              <div style={{height: "600px"}} />}
          </AnimatedSection>
        </Suspense>
      </div>

      {contextValor === "residencial" && (
        <AnimatedSection delay={0}>
          <SectionDesarrolloDestacado />
        </AnimatedSection>
      )}

      <div className="section-como-comprar-container" data-section="comoComprar">
        <Suspense fallback={SectionPlaceholders.comoComprar}>
          <AnimatedSection delay={0.3}>
            {visibleSections.comoComprar ? 
              <SectionComoComprar /> : 
              <div style={{height: "500px"}} />}
          </AnimatedSection>
        </Suspense>
      </div>

      <div className="section-cta-container" data-section="cta">
        <Suspense fallback={SectionPlaceholders.cta}>
          <AnimatedSection delay={0.4}>
            {visibleSections.cta ? 
              <SectionCTA /> : 
              <div style={{height: "300px"}} />}
          </AnimatedSection>
        </Suspense>
      </div>

      <div className="section-testimonials-container" data-section="testimonials">
        <Suspense fallback={SectionPlaceholders.testimonials}>
          <AnimatedSection delay={0.5}>
            {visibleSections.testimonials ? 
              <Testimonials /> : 
              <div style={{height: "450px"}} />}
          </AnimatedSection>
        </Suspense>
      </div>

      <div className="section-equipo-container" data-section="equipo">
        <Suspense fallback={SectionPlaceholders.equipo}>
          <AnimatedSection delay={0.6}>
            {visibleSections.equipo ? 
              <SectionEquipo propiedades={propiedades} /> : 
              <div style={{height: "550px"}} />}
          </AnimatedSection>
        </Suspense>
      </div>

      <div className="section-footer-container" data-section="footer">
        <Suspense fallback={SectionPlaceholders.footer}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {visibleSections.footer ? 
              <SectionFooter /> : 
              <div style={{height: "200px"}} />}
          </motion.div>
        </Suspense>
      </div>

      <ScrollToTopButton />
    </>
  );
};

export default memo(Residencial);