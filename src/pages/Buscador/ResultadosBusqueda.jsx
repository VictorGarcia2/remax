import React, { useState } from "react";
import SectionFooter from "../../components/SectionFooter/SectionFooter";
import HeaderResultadoBusqueda from "../../components/HeaderResultadoBusqueda";
import SearchResultadosBusqueda from "../../components/SearchResultadosBusqueda";
import CantidadPropiedades from "../../components/CantidadPropiedades";
import CardResultado from "../../components/CardResultado";
import MenuFilter from "../../components/MenuFilter";

export default function ResultadosBusqueda({propiedades,setPropiedades}) {

  
  return (
    <>
      <MenuFilter menuClose={menuClose} setMenuClose={setMenuClose} />
      <HeaderResultadoBusqueda />
      <SearchResultadosBusqueda  menuClose={menuClose} setMenuClose={setMenuClose} />
      <CantidadPropiedades propiedades={propiedades} />
      <CardResultado  propiedades={propiedades}/>
      <SectionFooter />
    </>
  );
}
