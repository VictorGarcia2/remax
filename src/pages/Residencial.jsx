import React from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import SectionPorque from "../components/SectionPorque/SectionPorque"
import SectionFooter  from "../components/SectionFooter/SectionFooter"
import  SectionVariedad from "../components/SectionVariedad/SectionVariedad"
import SectionEncuentra from "../components/SectionEncuentra/SectionEncuentra"
import SectionCTA from "../components/SectionCTA/SectionCTA"
import SectionComoComprar from "../components/SectionComoComprar/SectionComoComprar"

import SectionEquipo from "../components/SectionEquipo/SectionEquipo"
import Testimonials from "../components/SectionOpiniones/SectionOpiniones";
export default function Residencial({valor, busquedaHome, setBusquedaHome, autoCompleteHome,setAutoCompleteHome,setBusqueda, setSelectedOptionsTipos, setSelectedOptionsOperacion}) {
    return (
        <>
            <HomeSearch valor={valor} busquedaHome={busquedaHome} setSelectedOptionsTipos={setSelectedOptionsTipos} setSelectedOptionsOperacion={setSelectedOptionsOperacion}  setBusqueda={setBusqueda} setBusquedaHome={setBusquedaHome} autoCompleteHome={autoCompleteHome} setAutoCompleteHome={setAutoCompleteHome}/>
            <SectionPorque valor={valor}/>
            <SectionVariedad setBusqueda={setBusqueda} setSelectedOptionsTipos={setSelectedOptionsTipos} />
            <SectionEncuentra />
            <SectionComoComprar />
            <SectionCTA />
            <Testimonials/>
            <SectionEquipo />
           <SectionFooter/>
        </>
    );
}
