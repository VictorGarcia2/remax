import React from "react";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";
import CreditosHipotecariosContent from "../components/CreditosHipotecarios/CreditosHipotecariosContent";
import { Helmet } from "react-helmet-async";

export default function CreditosHipotecarios() {
  return (
    <>
      <Helmet>
        <title>Créditos Hipotecarios - REMAX CIN Veracruz</title>
        <meta
          name="description"
          content="Asesoria profesional para obtener tu crédito hipotecario. INFONAVIT, FOVISSSTE y bancarios. Mejores tasas y condiciones para comprar tu casa."
        />
        <link rel="canonical" href="https://remaxcin.com/creditos-hipotecarios" />
        <meta property="og:title" content="Créditos Hipotecarios - REMAX CIN Veracruz" />
        <meta property="og:description" content="Asesoria profesional para obtener tu crédito hipotecario. INFONAVIT, FOVISSSTE y bancarios." />
        <meta property="og:url" content="https://remaxcin.com/creditos-hipotecarios" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />
      <CreditosHipotecariosContent />
      <SectionFooter />
    </>
  );
}
