import React from "react";
import { Equipo } from "../components/Equipo";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";
import { Helmet } from "react-helmet-async";

export default function NuestroEquipo({propiedades}) {
  return (
    <>
      <Helmet>
        <title>Nuestro Equipo - REMAX CIN Veracruz</title>
        <meta
          name="description"
          content="Conoce a nuestro equipo de agentes inmobiliarios profesionales en REMAX CIN Veracruz. Expertos en bienes raíces listos para ayudarte."
        />
        <link rel="canonical" href="https://remaxcin.com/NuestroEquipo" />
        <meta property="og:title" content="Nuestro Equipo - REMAX CIN Veracruz" />
        <meta property="og:description" content="Conoce a nuestro equipo de agentes inmobiliarios profesionales en REMAX CIN Veracruz." />
        <meta property="og:url" content="https://remaxcin.com/NuestroEquipo" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header/>
      <div className="w-full">
        <Equipo propiedades={propiedades} />
        <SectionFooter/>
      </div>
    </>
  );
}
