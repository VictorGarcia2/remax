import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function Tipo() {
  const lugares = [
    { nombre: "Bodega" },
    { nombre: "Casa" },
    { nombre: "Condominio" },
    { nombre: "Oficina" },
    { nombre: "Plaza" },
    { nombre: "Edificio" },
    { nombre: "Local" },
    { nombre: "Finca/Rancho" },
    { nombre: "Terreno" }
  ];
  const [openModal, setOpenModal] = useState(true);
  const handle = () => {
    setOpenModal(false);
  };
  return (
    <>
      <div className="flex flex-col ">
        <div
          onClick={handle}
          className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl relative px-3 py-2 cursor-pointer"
        >
          {" "}
          <p className="text-xl"> Tipo </p>
          <FontAwesomeIcon
            className={`${
              openModal && "rotate-180 ease-in"
            } rotate-0 transform  `}
            icon={faChevronDown}
          />
        </div>
        {/* Modal */}
        <form
          className={` ${
            openModal && "hidden"
          } z-50 bg-gray-100 z- py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4`}
        >
          <div>
            {
              lugares.map((lugar, index) => (
                <div key={index} className="flex justify-between  items-center mb-4">
                  <label
                    for="default-checkbox"
                    class="mx-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    {lugar.nombre}
                  </label>

                  <input
                    id="default-checkbox"
                    type="checkbox"
                    value=""
                    class="w-4 h-4 text-red-600  bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600 "
                  />
                </div>
              ))
            }           
          </div>
        </form>
      </div>
    </>
  );
}
