import React, { Suspense, lazy } from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import SectionDesarrolloDestacado from "../components/SectionDesarrolloDestacado/SectionDesarrolloDestacado";
import ValuadorButton from "../components/ValuadorQuiz/ValuadorButton";
import { useSearchContext } from "../context/SearchContext";
const SectionPorque = lazy(() => import("../components/SectionPorque/SectionPorque"));
const SectionFooter = lazy(() => import("../components/SectionFooter/SectionFooter"));
const SectionVariedad = lazy(() => import("../components/SectionVariedad/SectionVariedad"));
const SectionEncuentra = lazy(() => import("../components/SectionEncuentra/SectionEncuentra"));
const SectionCTA = lazy(() => import("../components/SectionCTA/SectionCTA"));
const SectionComoComprar = lazy(() => import("../components/SectionComoComprar/SectionComoComprar"));
const SectionEquipo = lazy(() => import("../components/SectionEquipo/SectionEquipo"));
const Testimonials = lazy(() => import("../components/SectionOpiniones/SectionOpiniones"));

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
    
    return (
        <>
            <HomeSearch valor={valor} setBusqueda={setBusqueda} autoCompleteHome={autoCompleteHome} setAutoCompleteHome={setAutoCompleteHome}/>
            <Suspense fallback={<LoadingSpinner />}>
                <SectionPorque valor={valor}/>
                <SectionVariedad valor={valor} setBusqueda={setBusqueda} />
                {/* Componente del Valuador */}
                <SectionDesarrolloDestacado />
               {/*  <ValuadorButton /> */}
               {/*  <SectionEncuentra valor={valor} /> */}
                <SectionComoComprar />
                <SectionCTA />
                <Testimonials/>
                <SectionEquipo  propiedades={propiedades} />
                <SectionFooter/>
            
            </Suspense>
        </>
    );
}
