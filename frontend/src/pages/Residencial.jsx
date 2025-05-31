import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  useRef,
} from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchContext } from "../context/SearchContext";
import { motion } from "framer-motion";
import SectionDesarrolloDestacado from "../components/SectionDesarrolloDestacado/SectionDesarrolloDestacado";

// Lazy loaded components
const SectionPorque = lazy(() =>
  import(
    /* webpackPrefetch: true */ "../components/SectionPorque/SectionPorque"
  )
);
const SectionVariedad = lazy(() =>
  import("../components/SectionVariedad/SectionVariedad")
);
const SectionComoComprar = lazy(() =>
  import("../components/SectionComoComprar/SectionComoComprar")
);
const SectionCTA = lazy(() => import("../components/SectionCTA/SectionCTA"));
const Testimonials = lazy(() =>
  import("../components/SectionOpiniones/SectionOpiniones")
);
const SectionEquipo = lazy(() =>
  import("../components/SectionEquipo/SectionEquipo")
);
const SectionFooter = lazy(() =>
  import("../components/SectionFooter/SectionFooter")
);

// Placeholder component for fallbacks
const Placeholder = ({ height = 20 }) => (
  <div style={{ height: `${height}px` }} />
);

// AnimatedSection mejorado
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
        rootMargin: "0px 0px -100px 0px",
      }
    );

    observer.observe(currentRef);

    const rect = currentRef.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      observer.unobserve(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
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
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 500);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-[#003da4] text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300 ${
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
};

export default function Residencial({
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
    const preloadSecondaryComponents = () => {
      const preloads = [
        import("../components/SectionComoComprar/SectionComoComprar"),
        import("../components/SectionCTA/SectionCTA"),
        import("../components/SectionOpiniones/SectionOpiniones"),
      ];
      Promise.all(preloads).catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(preloadSecondaryComponents, {
              timeout: 1500,
            });
          } else {
            setTimeout(preloadSecondaryComponents, 1500);
          }
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 500px 0px" }
    );

    if (firstSectionRef.current) {
      observer.observe(firstSectionRef.current);
    } else {
      setTimeout(preloadSecondaryComponents, 2000);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={firstSectionRef} className="relative z-20">
        <HomeSearch
          valor={valor}
          setBusqueda={setBusqueda}
          autoCompleteHome={autoCompleteHome}
          setAutoCompleteHome={setAutoCompleteHome}
        />
      </div>

      <div className=" relative z-10">
        <Suspense fallback={<LoadingSpinner />}>
          <SectionPorque valor={valor} />
        </Suspense>
      </div>

      <Suspense fallback={<Placeholder />}>
        <AnimatedSection delay={0.2}>
          <SectionVariedad valor={valor} setBusqueda={setBusqueda} />
        </AnimatedSection>
      </Suspense>

      <AnimatedSection delay={0}>
        <SectionDesarrolloDestacado />
      </AnimatedSection>

      <Suspense fallback={<Placeholder />}>
        <AnimatedSection delay={0.3}>
          <SectionComoComprar />
        </AnimatedSection>
      </Suspense>

      <Suspense fallback={<Placeholder />}>
        <AnimatedSection delay={0.4}>
          <SectionCTA />
        </AnimatedSection>
      </Suspense>

      <Suspense fallback={<Placeholder />}>
        <AnimatedSection delay={0.5}>
          <Testimonials />
        </AnimatedSection>
      </Suspense>

      <Suspense fallback={<Placeholder />}>
        <AnimatedSection delay={0.6}>
          <SectionEquipo propiedades={propiedades} />
        </AnimatedSection>
      </Suspense>

      <Suspense fallback={<Placeholder height={10} />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SectionFooter />
        </motion.div>
      </Suspense>

      <ScrollToTopButton />
    </>
  );
}
