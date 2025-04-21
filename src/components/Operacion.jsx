import { faChevronDown, faCity, faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function Operacion({ setSelectedOptionsOperacion }) {
  const [openModal, setOpenModal] = useState(true);

  const toggleModal = () => setOpenModal((prevState) => !prevState);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    
    setSelectedOptionsOperacion((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const lugares = [
    { icon: faHouse, nombre: 1, titulo: "Venta" },
    { icon: faCity, nombre: 2, titulo: "Renta" },
  ];

  return (
    <>
      {/* Overlay */}
      {!openModal && (
        <div
          onClick={toggleModal}
          className="h-[1900px] w-[1000px] z-10 absolute"
        ></div>
      )}

      <div className="flex flex-col">
        {/* Header */}
        <div
          onClick={toggleModal}
          className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 cursor-pointer"
        >
          <p className="text-lg sm:text-xl md:text-xl 2xl:text-2xl">Operacion</p>
          <FontAwesomeIcon
            className={`transform transition-transform ${
              openModal ? "rotate-180" : "rotate-0"
            }`}
            icon={faChevronDown}
          />
        </div>

        {/* Modal */}
        {!openModal && (
          <form className="z-10 bg-gray-100 py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4">
            {lugares.map(({ icon, nombre, titulo }, index) => (
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
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600"
                />
              </div>
            ))}
          </form>
        )}
      </div>
    </>
  );
}
