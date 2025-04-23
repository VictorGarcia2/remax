import {
  faBuildingUser,
  faCity,
  faHouse,
  faMapLocationDot,
  faPenRuler,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function MenuFilter({
  menuClose,
  setMenuClose,
  setPrecioMinimo,
  setPrecioMaximo,
  precioMinimo,
  precioMaximo,
  setSelectedOptionsTipos,
  setSelectedOptionsOperacion,
  setSelectedOptions,
}) {
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
    setSelectedOptionsTipos((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };
  const handleCheckboxChangeOperacion = (event) => {
    const { value, checked } = event.target;
    console.log(value)
    setSelectedOptionsOperacion((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };
  const handleCheckboxChangeSector = (event) => {
    const value = event.target.value.toLowerCase();
    if (event.target.checked) {
      // Si está marcado, añadirlo al array
      setSelectedOptions((prev) => [...prev, value]);
    } else {
      // Si está desmarcado, eliminarlo del array
      setSelectedOptions((prev) => prev.filter((item) => item !== value));
    }
  };
  const sector = [
    { icon: <FontAwesomeIcon icon={faCity} />, nombre: "Residencial" },
    { icon: <FontAwesomeIcon icon={faBuildingUser} />, nombre: "Comercial" },
  ];
  const lugares = [
    { icon: faHouse, nombre: "Casa", tipo_id: 1 },
    { icon: faBuildingUser, nombre: "Casa en Condominio", tipo_id: 2 },
    { icon: faCity, nombre: "Departamento", tipo_id: 3 },
    { icon: faPenRuler, nombre: "Desarrollo", tipo_id: 6 },
    { icon: faMapLocationDot, nombre: "Terreno", tipo_id: 4 },
  ];
  const operation = [
    { icon: faBuildingUser, nombre: 1, titulo: "Venta" },
    { icon: faCity, nombre: 2, titulo: "Renta" },
  ];

  return (
    //Mobile
    <div
      className={`${
        menuClose && "hidden"
      }  w-screen top-0 h-screen fixed text-[#7B7B7B] font-display px-5 z-50 bg-white`}
    >
      <div
        className="flex flex-col py-4 items-center w-full "
        id="accordion-collapse"
        data-accordion="collapse"
      >
        <div className="flex justify-between font-display  w-full px-5">
          <p className="text-2xl">Filtros</p>
          <img
            onClick={() => setMenuClose((prev) => !prev)}
            loading="lazy"
            className="w-7"
            src="/HomePageContent/close.svg"
            alt=""
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
                onClick={() =>
                  setOpenSections((prev) => ({
                    ...prev,
                    "accordion-collapse-body-1": !prev["accordion-collapse-body-1"],
                  }))
                }
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
                {sector.map((lugar, index) => (
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
          {/* Other sections remain unchanged */}
          <div className="flex justify-evenly w-full bottom-10 fixed z-50">
            <button
              type="button"
              className="w-20 h-10 text-[#DB1C2E] rounded "
              onClick={() => setMenuClose((prev) => !prev)}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="w-20 h-10 bg-[#DB1C2E] rounded text-white"
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
