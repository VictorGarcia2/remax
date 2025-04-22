import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function RangoDePrecio({
  precioMinimo,
  setPrecioMinimo,
  setPrecioMaximo,
  precioMaximo,
  setAplicarFiltros,
}) {
  const [openModal, setOpenModal] = useState(false);

  const toggleModal = () => setOpenModal((prev) => !prev);

  const handleInputChange = (setter) => (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setter(rawValue === "" ? null : parseFloat(rawValue));
  };

  const resetFilters = () => {
    setPrecioMinimo(0);
    setPrecioMaximo(Infinity);
  };

  return (
    <div className="relative flex flex-col">
      {/* Trigger */}
      <div
        onClick={toggleModal}
        className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 cursor-pointer"
      >
        <p className="text-lg sm:text-xl md:text-xl 2xl:text-2xl">Rango de precios</p>
        <FontAwesomeIcon
          className={`transform transition-transform ${
            openModal ? "rotate-180" : "rotate-0"
          }`}
          icon={faChevronDown}
        />
      </div>

      {/* Modal */}
      {openModal && (
        <>
          <div
            onClick={toggleModal}
            className="fixed inset-0 bg-black bg-opacity-25 z-10"
          ></div>
          <form className="z-20 bg-gray-100 py-10 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4">
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                De:
                <input
                  type="text"
                  value={precioMinimo ? precioMinimo.toLocaleString() : ""}
                  onChange={handleInputChange(setPrecioMinimo)}
                  className="border-b px-1 w-32"
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
                  onChange={handleInputChange(setPrecioMaximo)}
                  className="border-b px-1 w-32"
                  placeholder="50,300,000 MXN"
                />
              </label>
            </div>

            <div className="flex mt-3 justify-end gap-3 items-center">
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm sm:text-base md:text-lg text-blueRemax hover:text-white border border-blueRemax hover:bg-blueRemax focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg px-5 py-2.5"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={toggleModal}
                className="text-sm sm:text-base md:text-lg text-white hover:text-blueRemax border bg-blueRemax border-blueRemax hover:bg-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg px-5 py-2.5"
              >
                Cerrar
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
