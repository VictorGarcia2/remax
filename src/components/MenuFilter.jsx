import React, { useState } from "react";

export default function MenuFilter({ menuClose, setMenuClose }) {
  const [openSections, setOpenSections] = useState({
    "accordion-collapse-body-1": true,
    "accordion-collapse-body-2": true,
    "accordion-collapse-body-3": true,
  });
  const toggleSection = (sectionId) => {
    setOpenSections((prevState) => ({...prevState, [sectionId]: !prevState[sectionId],}));
  };
  return (
    //Mobile
    <div
      className={`${
        menuClose && "hidden"
      }  w-screen top-0 h-screen fixed text-[#7B7B7B] font-display z-50 bg-white`}
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
              className={`transition-all duration-300 ease-in-out flex flex-col items-center  ${
                openSections["accordion-collapse-body-1"]
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden `}
              aria-labelledby="accordion-collapse-heading-1"
            >
              <div className="flex flex-col items-end text-base  mt-1 w-full px-4">
                <label className="flex items-center gap-3" htmlFor="">
                  <img
                    loading="lazy"
                    src="/HomePageContent/sectorcomercialicon.svg"
                    alt=""
                  />
                  Comercial
                  <input type="radio" name="opt" id="" />
                </label>
                <label className="flex items-center gap-3 mb-2" htmlFor="">
                  <img
                    loading="lazy"
                    src="/HomePageContent/sectorresidencialicon.svg"
                    alt=""
                  />
                  Residencial
                  <input type="radio" name="opt" id="" />
                </label>
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
              className={` transition-all duration-300 ease-in-out flex flex-col items-center  ${
                openSections["accordion-collapse-body-2"]
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden `}
              aria-labelledby="accordion-collapse-heading-2"
            >
              <div className="flex text-base flex-col items-end  mt-1 w-full px-4">
                <label className="flex items-center gap-3" htmlFor="">
                  Venta
                  <input type="checkbox" name="opt" id="" />
                </label>
                <label className="flex items-center gap-3 mb-2" htmlFor="">
                  Renta
                  <input type="checkbox" name="opt" id="" />
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
              <div className="flex text-base justify-between items-center mb-4  mt-3 w-full px-4">
                <label className="flex items-center gap-3" htmlFor="">
                  De:
                  <input
                    className="w-30 border-b border-[#7b7b7b7b]"
                    type="text"
                    name="opt"
                    placeholder="10000"
                    id=""
                  />
                </label>
                <label className="flex items-center gap-3 " htmlFor="">
                  Hasta:
                  <input
                    className="w-30 border-b border-[#7b7b7b7b]"
                    type="text"
                    name="opt"
                    placeholder="1000000"
                    id=""
                  />
                </label>
              </div>
              <hr className="w-full static text-[#7b7b7b7b]" />
            </div>
          </div>
          <div className="flex justify-evenly w-full bottom-10 fixed z-50">
            <button className="w-20 h-10 text-[#DB1C2E] rounded ">
              Limpiar
            </button>
            <button className="w-20 h-10 bg-[#DB1C2E] rounded text-white">
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
