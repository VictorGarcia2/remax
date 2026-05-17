/* eslint-disable react/prop-types */
import { memo, useMemo } from "react";
import SectionFooter from "../../components/SectionFooter/SectionFooter";
import HeaderResultadoBusqueda from "../../components/HeaderResultadoBusqueda";
import SearchResultadosBusqueda from "../../components/SearchResultadosBusqueda";
import CantidadPropiedades from "../../components/CantidadPropiedades";
import CardResultado from "../../components/CardResultado";
import MenuFilter from "../../components/MenuFilter";
import FiltrosDesktop from "../../components/FiltrosDesktop";
import ActiveFilters from "../../components/ActiveFilters";
import { useEffect } from "react";
import { useSearchContext } from "../../context/SearchContext";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Helmet } from "react-helmet-async";


const ResultadosBusqueda = () => {
  // Usar el contexto para acceder a los estados compartidos
  const { 
    propiedades,
    isFilterMenuOpen,
    setIsFilterMenuOpen,
    busqueda,
    setBusqueda,
    manejoBusqueda,
    setManejoBusqueda,
    propiedadesVisibles,
    setPropiedadesVisibles,
    setAutoCompleteHome,
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
    selectedOptions,
    valor,
    selectedOptionsTipos, 
    setSelectedOptionsTipos,
    busquedaHome,
    selectedOptionsOperacion, 
    setSelectedOptionsOperacion 
  } = useSearchContext();
  useEffect(() => {
  
  }, [selectedOptionsTipos]);
  return (
    <>
      <Helmet>
        <title>Propiedades en Venta y Renta - REMAX CIN Veracruz</title>
        <meta
          name="description"
          content="Encuentra propiedades en venta y renta en Veracruz. Casas, departamentos, oficinas y terrenos. REMAX CIN - Tu mejor opción inmobiliaria."
        />
        <link rel="canonical" href="https://remaxcin.com/propiedades" />
        <meta property="og:title" content="Propiedades en Venta y Renta - REMAX CIN Veracruz" />
        <meta property="og:description" content="Encuentra propiedades en venta y renta en Veracruz. Casas, departamentos, oficinas y terrenos." />
        <meta property="og:url" content="https://remaxcin.com/propiedades" />
        <meta property="og:type" content="website" />
      </Helmet>
      <MenuFilter />
      <HeaderResultadoBusqueda />
      <Breadcrumbs propiedades={propiedades} />
      <div className="hidden lg:block">
        <FiltrosDesktop />
      </div>
      <SearchResultadosBusqueda />
      <CantidadPropiedades />
      <ActiveFilters />
      <CardResultado />
      <SectionFooter />
    </>
  );
};

export default memo(ResultadosBusqueda);
