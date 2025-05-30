import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faBuildingUser,
  faChevronDown,
  faCity,
  faHouse,
  faHouseChimney,
  faIndustry,
  faMap,
  faMapLocationDot,
  faPenRuler,
  faTreeCity,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchContext } from "../context/SearchContext";

export default function Tipo({selectedOptions, valor }) {
  const { 
    busquedaHome,
    setBusquedaHome,
    selectedOptionsTipos,
    setSelectedOptionsTipos,
    selectedOptionsOperacion, 
    setSelectedOptionsOperacion 
  } = useSearchContext();
  const [openModal, setOpenModal] = useState(true);
  
  // Determinar el sector actual basado en selectedOptions
  useEffect(() => {
    // Limpiar las selecciones cuando cambia el sector
   
    
    // Si selectedOptions incluye "comercial" o "industrial", mostrar opciones comerciales
    const isComercial = selectedOptions.some(option => 
      ["comercial", "industrial"].includes(option.toLowerCase())
    );
    
    // Si no hay selección en selectedOptions, usar el valor por defecto
    if (selectedOptions.length === 0) {
      setSelectedSector(valor?.toLowerCase() || "residencial");
    } else {
      setSelectedSector(isComercial ? "comercial" : "residencial");
    }
  }, [selectedOptions, valor]);
  const [selectedSector, setSelectedSector] = useState(valor);

  // Actualizar el sector seleccionado cuando cambia el valor
  useEffect(() => {
    setSelectedSector(valor);
    // Limpiar las selecciones cuando cambia el sector
    
  }, [valor]);

  
  // Determinar el color basado en el sector y selectedOptions
  const getColorClass = () => {
    if (valor?.toLowerCase() === 'comercial' || selectedOptions.includes("comercial")) {
      return 'text-red-600 focus:ring-red-600';
    }
    return 'text-blue-600 focus:ring-blue-600';
  };

  const lugares = [
    { icon: faHouse, nombre: "Casa", tipo_id: 1, sector: "residencial" },
    { icon: faHouseChimney, nombre: "Casa en Condominio", tipo_id: 2, sector: "residencial" },
    { icon: faBuilding, nombre: "Departamento", tipo_id: 3, sector: "residencial" },
    { icon: faPenRuler, nombre: "Desarrollo", tipo_id: 6, sector: "residencial" },
    { icon: faMap, nombre: "Terreno", tipo_id: 4, sector: "residencial" },
    { icon: faMap, nombre: "Terreno", tipo_id: 10, sector: "comercial" },
    /* { icon: faMap, nombre: "Terreno", tipo_id: 5, sector: "residencial" }, */
    { icon: faBuilding, nombre: "Edificio", tipo_id: 8, sector: "comercial" },
    { icon: faTreeCity, nombre: "Finca/Rancho", tipo_id: 14, sector: "residencial" },
    { icon: faWarehouse, nombre: "Bodega", tipo_id: 19, sector: "comercial" },
    { icon: faIndustry, nombre: "Nave Industrial", tipo_id: 7, sector: "comercial" },
  ];

  const propiedadesFiltradas = lugares.filter(lugar => {
    // Si hay opciones seleccionadas, filtrar por esas opciones
    if (selectedOptions.length > 0) {
      // Si ambos sectores están seleccionados, mostrar todas las propiedades
      const tieneComercial = selectedOptions.includes("comercial") || selectedOptions.includes("industrial");
      const tieneResidencial = selectedOptions.includes("residencial");
      
      if (tieneComercial && tieneResidencial) {
        return true; // Mostrar todas las propiedades
      }
      
      // Si solo está seleccionado uno de los sectores, filtrar por ese sector
      if (tieneComercial) {
        return lugar.sector === "comercial";
      }
      if (tieneResidencial) {
        return lugar.sector === "residencial";
      }
    }
    
    // Si no hay opciones seleccionadas, usar el valor por defecto
    return lugar.sector === (valor?.toLowerCase() || "residencial");
  });


  const toggleModal = () => setOpenModal((prev) => !prev);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const intValue = parseInt(value);
    setSelectedOptionsTipos((prev) =>
      checked ? [...prev, intValue] : prev.filter((item) => item !== intValue)
    );
  };

  return (
    <>
      {!openModal && (
        <div
          onClick={toggleModal}
          className="h-[1900px] w-[1000px] z-10 absolute"
        ></div>
      )}

      <div className="flex flex-col">
        <div
          onClick={toggleModal}
          className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 cursor-pointer"
        >
          <p className="text-lg sm:text-xl md:text-xl 2xl:text-2xl">Tipo</p>
          <FontAwesomeIcon
            className={`transform ${
              openModal ? "rotate-0" : "rotate-180"
            } transition-transform`}
            icon={faChevronDown}
          />
        </div>

        {!openModal && (
          <form className="z-50 bg-gray-100 py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4">
            {propiedadesFiltradas.map(({ icon, nombre, tipo_id }) => (
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
                    checked={selectedOptionsTipos.includes(tipo_id)}
                    onChange={handleCheckboxChange}
                    className={`w-4 h-4 ${getColorClass()} bg-gray-100 border-gray-300 rounded-sm`}
                  />
                </label>
              </div>
            ))}
          </form>
        )}
      </div>
    </>
  );
}

