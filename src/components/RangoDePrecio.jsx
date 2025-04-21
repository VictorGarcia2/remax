import { faChevronDown, faL } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function RangoDePrecio({
  precioMinimo,
  setPrecioMinimo,
  setPrecioMaximo,
  precioMaximo,
  setAplicarFiltros,
}) {
  const [openModal, setOpenModal] = useState(true);
  const handle = () => {
    setOpenModal((prevState) => !prevState);
  };
  return (
    <>
      <div
        onClick={handle}
        className={`${
          openModal && "hidden"
        } h-[1900px] w-[1000px] z-10  absolute`}
      ></div>
      <div className="flex flex-col ">
        <div
          onClick={handle}
          className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl relative   px-3 py-2 cursor-pointer"
        >
          <p className="text-lg sm:text-xl md:text-xl 2xl:text-2xl">Rango de precios</p>
          <FontAwesomeIcon
            className={`${
              openModal && "rotate-180 ease-in"
            } rotate-0 transform`}
            icon={faChevronDown}
          />
        </div>
        {/* Modal */}
        <form
          className={`${
            openModal && "hidden"
          } z-10 bg-gray-100 py-10 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4`}
        >
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              De:
              <input
                type="text"
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
            <label className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              Hasta:
              <input
                type="text"
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
                className="border-b border-t-0 border-s-0 border-e-0 px-1 w-32"
                placeholder="50,300,000 MXN"
              />
            </label>
          </div>

          <div className="flex mt-3 justify-end gap-3 items-center">
            {/* Botón Limpiar */}
            <button
              type="button"
              onClick={() => {
                setPrecioMinimo(0);
                setPrecioMaximo(Infinity);
              }}
              className="text-sm sm:text-base md:text-lg text-blueRemax hover:text-white border border-blueRemax hover:bg-blueRemax focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg px-5 py-2.5 text-center"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handle}
              className="text-sm sm:text-base md:text-lg text-white hover:text-blueRemax border bg-blueRemax border-blueRemax hover:bg-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg px-5 py-2.5 text-center"
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
