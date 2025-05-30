import React, { Suspense, lazy, useEffect, useState } from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchContext } from "../context/SearchContext";
import { motion } from "framer-motion";

// Componente crítico cargado inmediatamente
import SectionDesarrolloDestacado from "../components/SectionDesarrolloDestacado/SectionDesarrolloDestacado";

// Lazy loading con priorización
const SectionPorque = lazy(() => import(/* webpackPrefetch: true */ "../components/SectionPorque/SectionPorque"));
const SectionVariedad = lazy(() => import(/* webpackPrefetch: true */ "../components/SectionVariedad/SectionVariedad"));

// Componentes secundarios con lazy loading normal
const SectionComoComprar = lazy(() => import("../components/SectionComoComprar/SectionComoComprar"));
const SectionCTA = lazy(() => import("../components/SectionCTA/SectionCTA"));
const Testimonials = lazy(() => import("../components/SectionOpiniones/SectionOpiniones"));
const SectionEquipo = lazy(() => import("../components/SectionEquipo/SectionEquipo"));
const SectionFooter = lazy(() => import("../components/SectionFooter/SectionFooter"));
// Componentes comentados pero aún importados - pueden causar errores
// const SectionEncuentra = lazy(() => import("../components/SectionEncuentra/SectionEncuentra"));
// const ValuadorButton = lazy(() => import("../components/ValuadorQuiz/ValuadorButton"));

// Componente de animación para envolver secciones
// Componente de animación mejorado con Framer Motion
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = React.useRef(null);

    useEffect(() => {
        // Usar IntersectionObserver para detectar cuando el elemento está en el viewport
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { 
                threshold: 0.1,
                rootMargin: "0px 0px -100px 0px" // Activa un poco antes de que el elemento sea visible
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
            
            // Verificar si el elemento ya está visible al cargar
            const rect = sectionRef.current.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                setIsVisible(true);
                observer.unobserve(sectionRef.current);
            }
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    // Variantes de animación para Framer Motion
    const variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6,
                ease: "easeOut",
                delay: delay / 1000
            }
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
};

// Botón de regreso al inicio
const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 bg-[#003da4] text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
            }`}
            aria-label="Volver al inicio"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    );
};

export default function Residencial({valor, autoCompleteHome, setAutoCompleteHome, setBusqueda, propiedades}) {
    // Usar el contexto para acceder a los estados compartidos
    const { 
        busquedaHome,
        setBusquedaHome,
        selectedOptionsTipos,
        setSelectedOptionsTipos,
        selectedOptionsOperacion, 
        setSelectedOptionsOperacion 
    } = useSearchContext();
    
    // Precarga de componentes secundarios cuando la página principal ya está visible
    useEffect(() => {
        // Función para precargar componentes menos prioritarios después de que la página principal se haya cargado
        const preloadSecondaryComponents = () => {
            // Importar componentes secundarios después de que la página principal esté lista
            const preloads = [
                import("../components/SectionComoComprar/SectionComoComprar"),
                import("../components/SectionCTA/SectionCTA"),
                import("../components/SectionOpiniones/SectionOpiniones")
            ];
            
            // Usar Promise.all para cargar en paralelo pero sin bloquear
            Promise.all(preloads).catch(() => {
                // Silenciar errores de precarga - no son críticos
            });
        };
        
        // Usar Intersection Observer para detectar cuando el usuario ha scrolleado
        // y precargar componentes solo cuando sea necesario
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if ('requestIdleCallback' in window) {
                        window.requestIdleCallback(preloadSecondaryComponents, { timeout: 1500 });
                    } else {
                        setTimeout(preloadSecondaryComponents, 1500);
                    }
                    observer.disconnect();
                }
            },
            { rootMargin: "0px 0px 500px 0px" } // Precargar cuando el usuario está a 500px de los componentes
        );
        
        // Observar el primer componente visible
        const firstSection = document.querySelector('#first-section');
        if (firstSection) {
            observer.observe(firstSection);
        } else {
            // Si no se encuentra el elemento, usar el enfoque basado en tiempo
            setTimeout(preloadSecondaryComponents, 2000);
        }
        
        return () => observer.disconnect();
    }, []);
    
    return (
        <>
            {/* Componente crítico para la interacción inicial del usuario */}
            <div className="relative z-10 mb-8">
                <Suspense fallback={<LoadingSpinner />}>
                    <HomeSearch valor={valor} setBusqueda={setBusqueda} autoCompleteHome={autoCompleteHome} setAutoCompleteHome={setAutoCompleteHome}/>
                </Suspense>
            </div>
            
         
            {/* Componentes prioritarios con su propio Suspense para carga independiente */}
            <div id="first-section" className="relative z-0 mt-16">
                <Suspense fallback={<LoadingSpinner />}>
                    <AnimatedSection delay={0}>
                        <SectionPorque valor={valor}/>
                    </AnimatedSection>
                </Suspense>
            </div>
            
            <Suspense fallback={<LoadingSpinner />}>
                <AnimatedSection delay={0.2}>
                    <SectionVariedad valor={valor} setBusqueda={setBusqueda} />
                </AnimatedSection>
            </Suspense>
            
            {/* Componente crítico cargado inmediatamente */}
            <AnimatedSection delay={0}>
                <SectionDesarrolloDestacado />
            </AnimatedSection>
            
            
            {/* Componentes secundarios con Suspense individual */}
            <Suspense fallback={<div className="h-20"></div>}>
                <AnimatedSection delay={0.3}>
                    <SectionComoComprar />
                </AnimatedSection>
            </Suspense>
            
            <Suspense fallback={<div className="h-20"></div>}>
                <AnimatedSection delay={0.4}>
                    <SectionCTA />
                </AnimatedSection>
            </Suspense>
            
            <Suspense fallback={<div className="h-20"></div>}>
                <AnimatedSection delay={0.5}>
                    <Testimonials/>
                </AnimatedSection>
            </Suspense>
            
            <Suspense fallback={<div className="h-20"></div>}>
                <AnimatedSection delay={0.6}>
                    <SectionEquipo propiedades={propiedades} />
                </AnimatedSection>
            </Suspense>
            
            <Suspense fallback={<div className="h-10"></div>}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionFooter/>
                </motion.div>
            </Suspense>
            
            {/* Botón para volver al inicio */}
            <ScrollToTopButton />
        </>
    );
}