import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchContext } from "../context/SearchContext";
import { motion } from "framer-motion";
import PropuestaFormularioDirecto from "../components/SectionDesarrolloDestacado/PropuestaFormularioDirecto";
import Header from "../components/SectionHome/Header";

// Lazy loaded components con preload hints
const SectionPorque = lazy(() =>
  import(
    /* webpackPrefetch: true, webpackChunkName: "section-porque" */ "../components/SectionPorque/SectionPorque"
  )
);
const SectionVariedad = lazy(() =>
  import(/* webpackChunkName: "section-variedad" */ "../components/SectionVariedad/SectionVariedad")
);
const SectionComoComprar = lazy(() =>
  import(/* webpackChunkName: "section-como-comprar" */ "../components/SectionComoComprar/SectionComoComprar")
);
const SectionCTA = lazy(() => 
  import(/* webpackChunkName: "section-cta" */ "../components/SectionCTA/SectionCTA")
);
const Testimonials = lazy(() =>
  import(/* webpackChunkName: "testimonials" */ "../components/SectionOpiniones/SectionOpiniones")
);
const SectionEquipo = lazy(() =>
  import(/* webpackChunkName: "section-equipo" */ "../components/SectionEquipo/SectionEquipo")
);
const SectionFooter = lazy(() =>
  import(/* webpackChunkName: "section-footer" */ "../components/SectionFooter/SectionFooter")
);
const SectionDesarrolloDestacado = lazy(() =>
  import(/* webpackChunkName: "section-desarrollo" */ "../components/SectionDesarrolloDestacado/SectionDesarrolloDestacado")
);

// Placeholder component optimizado para evitar layout shifts
const Placeholder = ({ height = 200 }) => (
  <div 
    style={{ 
      height: `${height}px`,
      minHeight: `${height}px`,
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    aria-hidden="true"
  >
    <LoadingSpinner />
  </div>
);

// AnimatedSection optimizado para evitar forced reflow
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
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
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const variants = {
    hidden: { 
      opacity: 0, 
      transform: "translateY(30px)",
    },
    visible: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: delay / 1000,
      },
    },
  };

  return (
    <div ref={sectionRef} className={className}>
      <motion.div
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={variants}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const toggleVisibility = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsVisible(window.pageYOffset > 500);
          ticking = false;
        });
        ticking = true;
      }
    };

    const throttledToggleVisibility = () => {
      toggleVisibility();
    };

    window.addEventListener("scroll", throttledToggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", throttledToggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-[#003da4] text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ 
        transform: isVisible ? 'scale(1)' : 'scale(0)',
        willChange: 'transform, opacity'
      }}
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
};

export default React.memo(function Residencial({
  valor,
  autoCompleteHome,
  setAutoCompleteHome,
  setBusqueda,
  propiedades,
}) {
  const {
    busquedaHome,
    setBusquedaHome,
    selectedOptionsTipos,
    setSelectedOptionsTipos,
    selectedOptionsOperacion,
    setSelectedOptionsOperacion,
  } = useSearchContext();

  const firstSectionRef = useRef(null);

  useEffect(() => {
    // Preload componentes críticos con timeout para no bloquear el hilo principal
    const preloadSecondaryComponents = () => {
      setTimeout(() => {
        const preloads = [
          import("../components/SectionComoComprar/SectionComoComprar"),
          import("../components/SectionCTA/SectionCTA"),
          import("../components/SectionOpiniones/SectionOpiniones"),
          import("../components/SectionEquipo/SectionEquipo"),
        ];
        Promise.all(preloads).catch(() => {
          console.warn('Some components failed to preload');
        });
      }, 100);
    };
    
    // Usar requestIdleCallback si está disponible
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadSecondaryComponents);
    } else {
      preloadSecondaryComponents();
    }
  }, []);

  // Memoizar props estáticas para evitar re-renders
  const homeSearchProps = useMemo(() => ({
    valor,
    setBusqueda,
    autoCompleteHome,
    setAutoCompleteHome,
  }), [valor, setBusqueda, autoCompleteHome, setAutoCompleteHome]);

  const headerProps = useMemo(() => ({
    setSelectedOptionsOperacion,
  }), [setSelectedOptionsOperacion]);

  return (
    <main className="min-h-screen bg-white w-full">
      <section className="z-50">
        <Header {...headerProps} />
      </section>
      <section ref={firstSectionRef} className="relative z-0 w-full" aria-labelledby="busqueda-title">
        <h1 id="busqueda-title" className="sr-only">Búsqueda de propiedades residenciales</h1>
        <HomeSearch {...homeSearchProps} />
      </section>

      <section className="relative  w-full" aria-labelledby="porque-title">
        <h2 id="porque-title" className="sr-only">¿Por qué elegir residencial?</h2>
        <SectionPorque valor={valor} />
      </section>

      <Suspense fallback={<Placeholder height={400} />}>
        <section aria-labelledby="variedad-title">
          <h2 id="variedad-title" className="sr-only">Variedad de propiedades residenciales</h2>
          <AnimatedSection delay={0.2}>
            <SectionVariedad valor={valor} setBusqueda={setBusqueda} />
          </AnimatedSection>
        </section>
      </Suspense>

      {/* Aplicar carga diferida a SectionDesarrolloDestacado solo si valor es "residencial" */}
      {valor === "residencial" && (
        <Suspense fallback={<Placeholder height={300} />}>
          <section aria-labelledby="destacado-title">
            <h2 id="destacado-title" className="sr-only">Desarrollo destacado</h2>
            <AnimatedSection delay={0}>
              <SectionDesarrolloDestacado />
            </AnimatedSection>
          </section>
        </Suspense>
      )}

      <Suspense fallback={<Placeholder height={500} />}>
        <section aria-labelledby="como-comprar-title">
          <h2 id="como-comprar-title" className="sr-only">Cómo comprar una propiedad residencial</h2>
          <AnimatedSection delay={0.3}>
            <SectionComoComprar />
          </AnimatedSection>
        </section>
      </Suspense>

      <Suspense fallback={<Placeholder height={250} />}>
        <section aria-labelledby="cta-title">
          <h2 id="cta-title" className="sr-only">Llamado a la acción</h2>
          <AnimatedSection delay={0.4}>
            <SectionCTA />
          </AnimatedSection>
        </section>
      </Suspense>

      <Suspense fallback={<Placeholder height={400} />}>
        <section aria-labelledby="testimonios-title">
          <h2 id="testimonios-title" className="sr-only">Testimonios de clientes</h2>
          <AnimatedSection delay={0.5}>
            <Testimonials />
          </AnimatedSection>
        </section>
      </Suspense>

      <Suspense fallback={<Placeholder height={350} />}>
        <section aria-labelledby="equipo-title">
          <h2 id="equipo-title" className="sr-only">Nuestro equipo</h2>
          <AnimatedSection delay={0.6}>
            <SectionEquipo propiedades={propiedades} valor={valor} />
          </AnimatedSection>
        </section>
      </Suspense>

      <Suspense fallback={<Placeholder height={300} />}>
        <footer>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ willChange: 'opacity' }}
          >
            <SectionFooter />
          </motion.div>
        </footer>
      </Suspense>

      <ScrollToTopButton />
    </main>
  );
});
