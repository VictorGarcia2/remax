import {
  faBuilding,
  faBuildingCircleCheck,
  faBuildingColumns,
  faBuildingUser,
  faCity,
  faHouse,
  faHouseChimney,
  faHouseUser,
  faIndustry,
  faMap,
  faMapLocation,
  faMapLocationDot,
  faPenRuler,
  faStore,
  faTractor,
  faTreeCity,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useSearchContext } from "../context/SearchContext";

export default function MenuFilter({
  menuClose,
  setMenuClose,
  setPrecioMinimo,
  setPrecioMaximo,
  precioMinimo,
  precioMaximo,
  setSelectedOptions,
  selectedOptions,
  valor,
}) {

  const { 
    busquedaHome,
    setBusquedaHome,
    selectedOptionsTipos,
    setSelectedOptionsTipos,
    selectedOptionsOperacion, 
    setSelectedOptionsOperacion 
  } = useSearchContext();
  const [openSections, setOpenSections] = useState({
    "accordion-collapse-body-1": true,
    "accordion-collapse-body-2": true,
    "accordion-collapse-body-3": true,
    "accordion-collapse-body-4": true,
  });
  const toggleSection = (sectionId) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId],
    }));
  };
  const handleCheckboxChangeTipo = (event) => {
    const { value, checked } = event.target;
    const intValue = parseInt(value);
    setSelectedOptionsTipos((prev) =>
      checked ? [...prev, intValue] : prev.filter((item) => item !== intValue)
    );
  };
  const handleCheckboxChangeOperacion = (event) => {
    const { value, checked } = event.target;
    console.log(value);
    setSelectedOptionsOperacion((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };
  const handleCheckboxChangeSector = (event) => {
    const sector = sectors.find((s) => s.name === event.target.value);
    const valuesToAddOrRemove = sector.values || [
      event.target.value.toLowerCase(),
    ];

    setSelectedOptions((prev) =>
      event.target.checked
        ? [...prev, ...valuesToAddOrRemove]
        : prev.filter((item) => !valuesToAddOrRemove.includes(item))
    );
  };
  const sectors = [
    {
      icon: <FontAwesomeIcon icon={faCity} />,
      nombre: "Residencial",
      name: "Residencial",
    },
    {
      icon: <FontAwesomeIcon icon={faBuildingUser} />,
      nombre: "Comercial/Industrial",
      name: "Comercial/Industrial",
      values: ["comercial", "industrial"],
    },
  ];

  const lugares = [
    {
      tipo_id: 1,
      nombre: "Casa",
      sector: "residencial",
      src: "/HomePageContent/casa.svg",
      icon: faHouse
    },
    {
      tipo_id: 1,
      nombre: "Casa",
      sector: "comercial",
      src: "/HomePageContent/casa.svg",
      icon: faBuilding
    },
    {
      tipo_id: 9,
      nombre: "Local",
      sector: "comercial",
      src: "/HomePageContent/casa.svg",
      icon: faStore
    },
    {
      tipo_id: 2,
      nombre: "Casa en Condominio",
      sector: "residencial", 
      src: "/HomePageContent/casaencondominio.svg",
      icon: faHouseUser
    },
    {
      tipo_id: 2,
      nombre: "Condominio",
      sector: "comercial", 
      src: "/HomePageContent/casaencondominio.svg",
      icon: faBuildingCircleCheck
    },
    {
      tipo_id: 2,
      nombre: "Oficina",
      sector: "comercial", 
      src: "/HomePageContent/casaencondominio.svg",
      icon: faBuildingColumns
    },
    {
      tipo_id: 2,
      nombre: "Plaza",
      sector: "comercial", 
      src: "/HomePageContent/casaencondominio.svg",
      icon: faStore
    },
    {
      tipo_id: 3,
      nombre: "Departamento",
      sector: "residencial",
      src: "/HomePageContent/icondepartamento.svg",
      icon: faBuilding
    },
    {
      tipo_id: 4,
      nombre: "Terreno",
      sector: "residencial",
      src: "/HomePageContent/terreno.svg",
      icon: faMapLocation
    },
    {
      tipo_id: 5,
      nombre: "Terreno - Residencial",
      sector: "residencial",
      src: "/HomePageContent/terreno-residencial.svg",
      icon: faMapLocation
    },
    {
      tipo_id: 6,
      nombre: "Desarrollo",
      sector: "residencial",
      src: "/HomePageContent/desarrollo.svg",
      icon: faBuildingCircleCheck
    },
    {
      tipo_id: 7,
      nombre: "Bodega - Industrial",
      sector: "comercial",
      src: "/HomePageContent/bodega-industrial.svg",
      icon: faWarehouse
    },
    {
      tipo_id: 8,
      nombre: "Edificio",
      sector: "comercial",
      src: "/HomePageContent/edificio.svg",
      icon: faBuildingColumns
    },
    {
      tipo_id: 10,
      nombre: "Terreno",
      sector: "comercial",
      src: "/HomePageContent/terreno-comercial.svg",
      icon: faMapLocation
    },
    {
      tipo_id: 14,
      nombre: "Finca/Rancho",
      sector: "comercial",
      src: "/HomePageContent/finca-rancho.svg",
      icon: faTractor
    },
    {
      tipo_id: 19,
      nombre: "Bodega",
      sector: "comercial",
      src: "/HomePageContent/bodega-comercial.svg",
      icon: faWarehouse
    },
  ];

  const getColorClass = () => {
    const tieneComercial =
      selectedOptions.includes("comercial") ||
      selectedOptions.includes("industrial");
    return tieneComercial
      ? "text-red-600 focus:ring-red-600"
      : "text-blue-600 focus:ring-blue-600";
  };

  const propiedadesFiltradas = lugares.filter((lugar) => {
    const tieneComercial =
      selectedOptions.includes("comercial") ||
      selectedOptions.includes("industrial");
    const tieneResidencial = selectedOptions.includes("residencial");

    // Si no hay opciones seleccionadas, usar el valor por defecto
    if (selectedOptions.length === 0) {
      return lugar.sector === (valor?.toLowerCase() || "residencial");
    }

    // Si ambos sectores están seleccionados, mostrar todas las propiedades
    if (tieneComercial && tieneResidencial) {
      return true;
    }

    // Si solo está seleccionado comercial/industrial, mostrar solo propiedades comerciales
    if (tieneComercial) {
      return lugar.sector === "comercial";
    }

    // Si solo está seleccionado residencial, mostrar solo propiedades residenciales
    if (tieneResidencial) {
      return lugar.sector === "residencial";
    }

    // Si no hay ningún sector seleccionado, mostrar todas las propiedades
    return true;
  });

  const operation = [
    { icon: faBuildingUser, nombre: 1, titulo: "Venta" },
    { icon: faCity, nombre: 2, titulo: "Renta" },
  ];

  return (
    //Mobile
    <div
      className={`${
        menuClose && "hidden"
      }  w-screen top-0 h-full overflow-y-scroll  fixed text-[#7B7B7B] font-display px-2 z-50 bg-white`}
    >
      <div
        className="flex flex-col py-4 items-center w-full "
        id="accordion-collapse"
        data-accordion="collapse"
      >
        <div className="flex justify-between font-display  w-full px-5">
          <p className="text-2xl">Filtros</p>
          <img
            onClick={() => setMenuClose(true)}
            loading="lazy"
            className="w-7"
            src="/HomePageContent/close.svg"
            alt="Cerrar menú de filtros"
            title="Cerrar filtros"
          />
        </div>
        <form className="mt-10 w-full font-lightitalic">
          <div className="rounded-[8px] gap-3 ">
            <div
              className="flex items-center px-5 justify-end"
              id="accordion-collapse-heading-1"
            >
              <button
                type="button"
                className="px-4 text-2xl font-display"
                onClick={() => toggleSection("accordion-collapse-body-1")}
                aria-expanded={
                  openSections["accordion-collapse-body-1"] || false
                }
                aria-controls="accordion-collapse-body-1"
              >
                Sector
              </button>
              <svg
                data-accordion-icon
                className={`w-3 h-3 shrink-0 transition-transform duration-300 ${
                  openSections["accordion-collapse-body-1"]
                    ? "rotate-0"
                    : "rotate-180"
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </div>
            <div
              id="accordion-collapse-body-1"
              className={`transition-all duration-300 ease-in-out flex flex-col items-end  ${
                openSections["accordion-collapse-body-1"]
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden `}
              aria-labelledby="accordion-collapse-heading-1"
            >
              <div className="z-50  flex text-base flex-col items-end   mt-1 px-4">
                {sectors.map((lugar, index) => (
                  <div
                    key={index}
                    className="flex  justify-between  items-center mb-4"
                  >
                    <div>
                      {lugar.icon}
                      <label
                        htmlFor={`checkbox-${index}`}
                        className="mx-2 text-sm font-medium text-gray-900 "
                      >
                        {lugar.nombre}
                      </label>
                    </div>
                    <input
                      id={`checkbox-${index}`}
                      type="checkbox"
                      name="tipo"
                      value={lugar.nombre}
                      onChange={handleCheckboxChangeSector}
                      className="w-4 h-4 text-red-600  bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600 "
                    />
                  </div>
                ))}
              </div>

              <hr className="w-full static text-[#7b7b7b7b]" />
            </div>
          </div>
          <div className="rounded-[8px] mt-2 gap-3 ">
            <div
              className="flex items-center px-5 justify-end"
              id="accordion-collapse-heading-2"
            >
              <button
                type="button"
                className="px-4 text-2xl font-display"
                onClick={() => toggleSection("accordion-collapse-body-2")}
                aria-expanded={
                  openSections["accordion-collapse-body-2"] || false
                }
                aria-controls="accordion-collapse-body-2"
              >
                Operacion
              </button>
              <svg
                data-accordion-icon
                className={`w-3 h-3 shrink-0 transition-transform duration-300 ${
                  openSections["accordion-collapse-body-2"]
                    ? "rotate-0"
                    : "rotate-180"
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </div>
            <div
              id="accordion-collapse-body-2"
              className={` transition-all duration-300 ease-in-out flex flex-col items-end ${
                openSections["accordion-collapse-body-2"]
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden `}
              aria-labelledby="accordion-collapse-heading-2"
            >
              <form className="z-50   flex text-base flex-col items-end  mt-1 px-4">
                {operation.map(({ icon, nombre, titulo }, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-4"
                  >
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={icon} />
                      <label
                        htmlFor={`checkbox-${index}`}
                        className="mx-2 text-sm font-medium text-gray-900"
                      >
                        {titulo}
                      </label>
                    </div>
                    <input
                      id={`checkbox-${index}`}
                      type="checkbox"
                      value={nombre}
                      onChange={handleCheckboxChangeOperacion}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600"
                    />
                  </div>
                ))}
              </form>
              <hr className="w-full static text-[#7b7b7b7b]" />
            </div>
          </div>
          <div className="rounded-[8px] mt-2 gap-3 ">
            <div
              className="flex items-center px-5 justify-end"
              id="accordion-collapse-heading-3"
            >
              <button
                type="button"
                className="px-4 text-2xl font-display"
                onClick={() => toggleSection("accordion-collapse-body-3")}
                aria-expanded={
                  openSections["accordion-collapse-body-3"] || false
                }
                aria-controls="accordion-collapse-body-3"
              >
                Rango de precios
              </button>
              <svg
                data-accordion-icon
                className={`w-3 h-3 shrink-0 transition-transform duration-300 ${
                  openSections["accordion-collapse-body-3"]
                    ? "rotate-0"
                    : "rotate-180"
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </div>
            <div
              id="accordion-collapse-body-3"
              className={` transition-all duration-300 ease-in-out flex flex-col items-center  ${
                openSections["accordion-collapse-body-3"]
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden `}
              aria-labelledby="accordion-collapse-heading-3"
            >
              <div className="flex mb-3 mt-3 gap-2">
                <label className="flex items-center gap-2">
                  De:
                  <input
                    type="text" // Cambiado de number a text para mejor control del formato
                    value={precioMinimo ? precioMinimo.toLocaleString() : ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      setPrecioMinimo(
                        rawValue === "" ? null : parseFloat(rawValue)
                      );
                    }}
                    className="border-b border-t-0 border-s-0 border-e-0 px-1 w-32"
                    placeholder="1,000 MXN"
                  />
                </label>
                <label className="flex items-center gap-2">
                  Hasta:
                  <input
                    type="text" // Cambiado de number a text
                    value={
                      precioMaximo && precioMaximo !== Infinity
                        ? precioMaximo.toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "");
                      setPrecioMaximo(
                        rawValue === "" ? null : parseFloat(rawValue)
                      );
                    }}
                    className="border-b border-t-0 border-s-0 border-e-0 px-1 w-35"
                    placeholder="50,300,000 MXN"
                  />
                </label>
              </div>
              <hr className="w-full static text-[#7b7b7b7b]" />
            </div>
          </div>
          <div className="rounded-[8px] mt-2 gap-3 ">
            <div
              className="flex items-center px-5 justify-end"
              id="accordion-collapse-heading-3"
            >
              <button
                type="button"
                className="px-4 text-2xl font-display"
                onClick={() => toggleSection("accordion-collapse-body-4")}
                aria-expanded={
                  openSections["accordion-collapse-body-3"] || false
                }
                aria-controls="accordion-collapse-body-3"
              >
                Tipos
              </button>
              <svg
                data-accordion-icon
                className={`w-3 h-3 shrink-0 transition-transform duration-300 ${
                  openSections["accordion-collapse-body-4"]
                    ? "rotate-0"
                    : "rotate-180"
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </div>
            <div
              id="accordion-collapse-body-3"
              className={` transition-all duration-300 ease-in-out flex flex-col items-end  ${
                openSections["accordion-collapse-body-4"]
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden `}
              aria-labelledby="accordion-collapse-heading-3"
            >
              <form className="z-50 overflow-y-scroll h-60  flex text-base flex-col items-end   mt-1 px-4 ">
                {propiedadesFiltradas.map(
                  ({ icon, nombre, tipo_id }, index) => (
                    <div
                      key={tipo_id}
                      className="flex justify-between items-center mb-4"
                    >
                      <label className="flex items-center cursor-pointer w-full justify-between">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={icon} />
                          <span className="mx-2 text-sm font-medium text-gray-900">
                            {nombre}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          name="tipo"
                          value={tipo_id}
                          onChange={handleCheckboxChangeTipo}
                          className={`w-4 h-4 ${getColorClass()} bg-gray-100 border-gray-300 rounded-sm`}
                        />
                      </label>
                    </div>
                  )
                )}
              </form>
              <hr className="w-full static text-[#7b7b7b7b]" />
            </div>
          </div>
          <div className="flex justify-evenly w-full bottom-10 mt-10 z-50">
            <button
              type="button"
              className="w-20 h-10 text-[#DB1C2E] cursor-pointer rounded "
              onClick={() => setMenuClose((prev) => !prev)}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="w-20 h-10 bg-[#DB1C2E] rounded cursor-pointer text-white"
              onClick={() => setMenuClose((prev) => !prev)}
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
