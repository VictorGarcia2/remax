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
  menuClose,
  setMenuClose,
  busqueda,
  setBusqueda,
  manejoBusqueda,
  setManejoBusqueda,
  propiedadesVisibles,
  setPropiedadesVisibles,
  setAutoCompleteHome,
  busquedaHome,
}) {
  // El estado guardará un array con los valores seleccionados
  const [selectedOptions, setSelectedOptions] = useState([]);
  console.log(busquedaHome);
  return (
    <>
      <MenuFilter menuClose={menuClose} setMenuClose={setMenuClose} />
      <HeaderResultadoBusqueda />
      <FiltrosDesktop
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        setManejoBusqueda={setManejoBusqueda}
        setSelectedOptions={setSelectedOptions}
      />
      <SearchResultadosBusqueda
        menuClose={menuClose}
        setMenuClose={setMenuClose}
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        setManejoBusqueda={setManejoBusqueda}
      />
      <CantidadPropiedades propiedadesVisibles={propiedadesVisibles} />
      <CardResultado
        propiedades={propiedades}
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        manejoBusqueda={manejoBusqueda}
        setManejoBusqueda={setManejoBusqueda}
        setPropiedadesVisibles={setPropiedadesVisibles}
        propiedadesVisibles={propiedadesVisibles}
        setSelectedOptions={setSelectedOptions}
        selectedOptions={selectedOptions}
        setAutoCompleteHome={setAutoCompleteHome}
        busquedaHome={busquedaHome}
      />
      <SectionFooter />
    </>
  );
}
