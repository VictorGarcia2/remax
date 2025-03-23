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
export default function Residencial() {
    return (
        <>
            <HomeSearch />
            <SectionPorque />
            <SectionVariedad />
            <SectionEncuentra />
            <SectionComoComprar />
            <SectionCTA />
            <Testimonials/>
            <SectionEquipo />
           <SectionFooter/>
        </>
    );
}
