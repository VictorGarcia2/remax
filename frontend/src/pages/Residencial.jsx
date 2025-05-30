import React, { Suspense, lazy, useEffect, useState } from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSearchContext } from "../context/SearchContext";

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
const SectionEncuentra = lazy(() => import("../components/SectionEncuentra/SectionEncuentra"));
/* const ValuadorButton = lazy(() => import("../components/ValuadorQuiz/ValuadorButton")); */

// Componente de animación para envolver secciones
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = React.useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Cuando el elemento es visible en el viewport
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    // Dejar de observar después de que se haga visible
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 } // Activar cuando al menos 10% del elemento es visible
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [delay]);

    return (
        <div 
            ref={sectionRef} 
            className={`transition-all duration-700 ease-out ${
                isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10"
            } ${className}`}
        >
            {children}
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
            import("../components/SectionComoComprar/SectionComoComprar");
            import("../components/SectionCTA/SectionCTA");
            import("../components/SectionOpiniones/SectionOpiniones");
        };
        
        // Usar requestIdleCallback para cargar cuando el navegador esté inactivo
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(preloadSecondaryComponents, { timeout: 2000 });
        } else {
            // Fallback para navegadores que no soportan requestIdleCallback
            setTimeout(preloadSecondaryComponents, 2000);
        }
    }, []);
    
    return (
        <>
            {/* Componente crítico para la interacción inicial del usuario */}
            <HomeSearch valor={valor} setBusqueda={setBusqueda} autoCompleteHome={autoCompleteHome} setAutoCompleteHome={setAutoCompleteHome}/>
            
            {/* Componente crítico cargado inmediatamente */}
            <AnimatedSection>
                <SectionDesarrolloDestacado />
            </AnimatedSection>
            
            {/* Componentes prioritarios con su propio Suspense para carga independiente */}
            <Suspense fallback={<LoadingSpinner />}>
                <AnimatedSection delay={100}>
                    <SectionPorque valor={valor}/>
                </AnimatedSection>
            </Suspense>
            
            <Suspense fallback={<LoadingSpinner />}>
                <AnimatedSection delay={200}>
                    <SectionVariedad valor={valor} setBusqueda={setBusqueda} />
                </AnimatedSection>
            </Suspense>
            
            {/* Componentes secundarios agrupados en un Suspense separado */}
            <Suspense fallback={<LoadingSpinner />}>
                {/* <ValuadorButton /> */}
                {/* <SectionEncuentra valor={valor} /> */}
                <AnimatedSection delay={300}>
                    <SectionComoComprar />
                </AnimatedSection>
                
                <AnimatedSection delay={400}>
                    <SectionCTA />
                </AnimatedSection>
                
                <AnimatedSection delay={500}>
                    <Testimonials/>
                </AnimatedSection>
                
                <AnimatedSection delay={600}>
                    <SectionEquipo propiedades={propiedades} />
                </AnimatedSection>
                
                <SectionFooter/>
            </Suspense>
            
            {/* Botón para volver al inicio */}
            <ScrollToTopButton />
        </>
    );
}