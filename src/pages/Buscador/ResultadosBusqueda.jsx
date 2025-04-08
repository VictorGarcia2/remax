import React, { useState } from "react";
import SectionFooter from "../../components/SectionFooter/SectionFooter";
import HeaderResultadoBusqueda from "../../components/HeaderResultadoBusqueda";
import SearchResultadosBusqueda from "../../components/SearchResultadosBusqueda";
import CantidadPropiedades from "../../components/CantidadPropiedades";
import CardResultado from "../../components/CardResultado";
import MenuFilter from "../../components/MenuFilter";
import FiltrosDesktop from "../../components/FiltrosDesktop";
export default function ResultadosBusqueda({
  propiedades,
  setPropiedades,
  menuClose,
  setMenuClose,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [manejoBusqueda, setManejoBusqueda] = useState(false);
  const [propiedadesVisibles, setPropiedadesVisibles] = useState([]);
 

  return (
    <>
      <MenuFilter menuClose={menuClose} setMenuClose={setMenuClose} />
      <HeaderResultadoBusqueda
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        setManejoBusqueda={setManejoBusqueda}
      />
      <FiltrosDesktop />
      <SearchResultadosBusqueda
        menuClose={menuClose}
        setMenuClose={setMenuClose}
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        setManejoBusqueda={setManejoBusqueda}
      />
      <CantidadPropiedades propiedades={propiedades} />
      <CardResultado
        propiedades={propiedades}
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        manejoBusqueda={manejoBusqueda}
        setManejoBusqueda={setManejoBusqueda}
        setPropiedadesVisibles={setPropiedadesVisibles}
        propiedadesVisibles={propiedadesVisibles}
      />
      <SectionFooter />
    </>
  );
}
