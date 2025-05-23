/* eslint-disable react/prop-types */
import { memo, useMemo } from "react";
import SectionFooter from "../../components/SectionFooter/SectionFooter";
import HeaderResultadoBusqueda from "../../components/HeaderResultadoBusqueda";
import SearchResultadosBusqueda from "../../components/SearchResultadosBusqueda";
import CantidadPropiedades from "../../components/CantidadPropiedades";
import CardResultado from "../../components/CardResultado";
import MenuFilter from "../../components/MenuFilter";
import FiltrosDesktop from "../../components/FiltrosDesktop";

const ResultadosBusqueda = ({
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
  setPropiedades,
  setSelectedOptions,
  nuevas,
  setNuevas,
  precioMinimo,
  setPrecioMinimo,
  setPrecioMaximo,
  precioMaximo,
  setAplicarFiltros,
  aplicarFiltros,
  seleccion,
  setSeleccion,
  setSelectedOptionsTipos,
  selectedOptionsTipos,
  setSelectedOptionsOperacion,
  selectedOptionsOperacion,
  selectedOptions,
  valor,
}) => {
  console.log(valor);

  return (
    <>
      <MenuFilter
      valor={valor}
        setSelectedOptionsOperacion={setSelectedOptionsOperacion}
        precioMaximo={precioMaximo}
        setPrecioMaximo={setPrecioMaximo}
        precioMinimo={precioMinimo}
        setPrecioMinimo={setPrecioMinimo}
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        setSelectedOptionsTipos={setSelectedOptionsTipos}
        menuClose={menuClose}
        setMenuClose={setMenuClose}
        setSelectedOptions={setSelectedOptions}
        selectedOptions={selectedOptions}
      />
      <HeaderResultadoBusqueda />
      <div className="hidden lg:block">
        <FiltrosDesktop
          valor={valor}
          setSelectedOptionsOperacion={setSelectedOptionsOperacion}
          setSelectedOptionsTipos={setSelectedOptionsTipos}
          setAplicarFiltros={setAplicarFiltros}
          precioMaximo={precioMaximo}
          setPrecioMaximo={setPrecioMaximo}
          precioMinimo={precioMinimo}
          setPrecioMinimo={setPrecioMinimo}
          setBusqueda={setBusqueda}
          busqueda={busqueda}
          setManejoBusqueda={setManejoBusqueda}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
          selectedOptionsTipos={selectedOptionsTipos}
        />
      </div>
      <SearchResultadosBusqueda
        setSelectedOptions={setSelectedOptions}
        selectedOptions={selectedOptions}
        menuClose={menuClose}
        setMenuClose={setMenuClose}
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        setManejoBusqueda={setManejoBusqueda}
      />
      <CantidadPropiedades propiedadesVisibles={propiedadesVisibles} />
      <CardResultado
        selectedOptionsOperacion={selectedOptionsOperacion}
        selectedOptionsTipos={selectedOptionsTipos}
        seleccion={seleccion}
        setSeleccion={setSeleccion}
        aplicarFiltros={aplicarFiltros}
        precioMaximo={precioMaximo}
        setPrecioMaximo={setPrecioMaximo}
        precioMinimo={precioMinimo}
        setPrecioMinimo={setPrecioMinimo}
        nuevas={nuevas}
        setNuevas={setNuevas}
        setSelectedOptions={setSelectedOptions}
        selectedOptions={selectedOptions}
        propiedades={propiedades}
        setBusqueda={setBusqueda}
        busqueda={busqueda}
        manejoBusqueda={manejoBusqueda}
        setManejoBusqueda={setManejoBusqueda}
        setPropiedadesVisibles={setPropiedadesVisibles}
        propiedadesVisibles={propiedadesVisibles}
        setAutoCompleteHome={setAutoCompleteHome}
        busquedaHome={busquedaHome}
        setPropiedades={setPropiedades}
      />
      <SectionFooter />
    </>
  );
};

export default memo(ResultadosBusqueda);
