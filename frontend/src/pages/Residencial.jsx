import React, { Suspense, lazy } from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import LoadingSpinner from "../components/LoadingSpinner";

const SectionPorque = lazy(() => import("../components/SectionPorque/SectionPorque"));
const SectionFooter = lazy(() => import("../components/SectionFooter/SectionFooter"));
const SectionVariedad = lazy(() => import("../components/SectionVariedad/SectionVariedad"));
const SectionEncuentra = lazy(() => import("../components/SectionEncuentra/SectionEncuentra"));
const SectionCTA = lazy(() => import("../components/SectionCTA/SectionCTA"));
const SectionComoComprar = lazy(() => import("../components/SectionComoComprar/SectionComoComprar"));
const SectionEquipo = lazy(() => import("../components/SectionEquipo/SectionEquipo"));
const Testimonials = lazy(() => import("../components/SectionOpiniones/SectionOpiniones"));

export default function Residencial({valor, busquedaHome, setBusquedaHome, autoCompleteHome,setAutoCompleteHome,setBusqueda, setSelectedOptionsTipos, setSelectedOptionsOperacion, propiedades, selectedOptionsOperacion}) {
    return (
        <>
            <HomeSearch valor={valor} busquedaHome={busquedaHome} setSelectedOptionsTipos={setSelectedOptionsTipos} setSelectedOptionsOperacion={setSelectedOptionsOperacion} selectedOptionsOperacion={selectedOptionsOperacion}  setBusqueda={setBusqueda} setBusquedaHome={setBusquedaHome} autoCompleteHome={autoCompleteHome} setAutoCompleteHome={setAutoCompleteHome}/>
            <Suspense fallback={<LoadingSpinner />}>
                <SectionPorque valor={valor}/>
                <SectionVariedad valor={valor} setBusqueda={setBusqueda} setSelectedOptionsTipos={setSelectedOptionsTipos} />
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
