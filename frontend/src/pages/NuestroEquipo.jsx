import React from "react";
import { Equipo } from "../components/Equipo";
import Header from "../components/SectionHome/Header";
import SectionFooter from "../components/SectionFooter/SectionFooter";

export default function NuestroEquipo({propiedades}) {
  return (
    <>
    <Header/>
      <Equipo propiedades={propiedades} />
      <SectionFooter/>
    </>
  );
}
