import { faChevronDown, faL } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function RangoDePrecio() {
  const [openModal, setOpenModal] = useState(true);
  const handle = () => {
    setOpenModal(false);
  };
  return (
    <>
      <div className="flex flex-col ">
        <div
          onClick={handle}
          className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl relative  px-3 py-2 cursor-pointer"
        >
          {" "}
          <p className="text-xl"> Rango de precios </p>
          <FontAwesomeIcon className={`${openModal&& "rotate-180 ease-in"} rotate-0 transform  `} icon={faChevronDown} />
        </div>
        {/* Modal */}
        <form
          className={` ${
            openModal && "hidden"
          } z-10 bg-gray-100 py-10 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4`}
        >
          <div>
            <label htmlFor="">
              De:
              <input
                type="number"
                className="border-b px-1"
                placeholder="1000"
                min="0"
              />
            </label>
            <label htmlFor="">
              Hasta:
              <input
                type="number"
                className="border-b px-1"
                placeholder="1300000"
                min="0"
              />
            </label>
          </div>
          <div className="flex mt-3 justify-end gap-3 items-center">
            <button class="text-blueRemax hover:text-white border border-blueRemax hover:bg-blueRemax focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2  ">
              Limpiar
            </button>
            <button class="focus:outline-none text-white bg-blueRemax hover:bg-blueRemax focus:ring-4 focus:ring-blue-200  font-medium rounded-lg text-sm px-5 py-2.5 me-2 ">
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
