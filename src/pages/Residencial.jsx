import React from "react";
import HomeSearch from "../components/SectionHome/HomeSearch";
import SectionPorque from "../components/SectionPorque/SectionPorque"
import SectionFooter  from "../components/SectionFooter/SectionFooter"
import  SectionVariedad from "../components/SectionVariedad/SectionVariedad"
import SectionEncuentra from "../components/SectionEncuentra/SectionEncuentra"
import SectionCTA from "../components/SectionCTA/SectionCTA"
import SectionComoComprar from "../components/SectionComoComprar/SectionComoComprar"
import SectionOpiniones from "../components/SectionOpiniones/SectionOpiniones"
import SectionEquipo from "../components/SectionEquipo/SectionEquipo"
export default function Residencial() {
    return (
        <>
            <HomeSearch />
            <SectionPorque />
            <SectionVariedad />
            <SectionEncuentra />
            <SectionCTA />
            <SectionComoComprar />
            <SectionOpiniones />
            <SectionEquipo />
           <SectionFooter/>
        </>
    );
}
