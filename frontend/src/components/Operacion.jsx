import { faChevronDown, faCity, faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function Operacion({ setSelectedOptionsOperacion }) {
  const [openModal, setOpenModal] = useState(true);

  const toggleModal = () => setOpenModal((prevState) => !prevState);

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleCheckboxChange = ({ target: { value, checked } }) => {
    const numericValue = parseInt(value, 10); // Asegúrate de que el valor sea un número
    setSelectedOptions((prev) =>
      checked ? [...prev, numericValue] : prev.filter((item) => item !== numericValue)
    );
    setSelectedOptionsOperacion((prev) =>
      checked ? [...prev, numericValue] : prev.filter((item) => item !== numericValue)
    );
  };

  const lugares = [
    { icon: faHouse, nombre: 1, titulo: "Venta" },
    { icon: faCity, nombre: 2, titulo: "Renta" },
  ];

  return (
    <div className="flex flex-col relative">
      {/* Overlay */}
      {!openModal && (
        <div
          onClick={toggleModal}
          className="fixed inset-0 z-10"
        ></div>
      )}

      {/* Header */}
      <div
        onClick={toggleModal}
        className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 cursor-pointer"
      >
        <p className="text-lg sm:text-xl md:text-xl 2xl:text-2xl">Operacion</p>
        <FontAwesomeIcon
          className={`transform transition-transform ${openModal ? "rotate-180" : "rotate-0"}`}
          icon={faChevronDown}
        />
      </div>

      {/* Modal */}
      {!openModal && (
        <form className="z-20 bg-gray-100 py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4">
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
                <input
                  id={`checkbox-${index}`}
                  type="checkbox"
                  value={nombre}
                  checked={selectedOptions.includes(nombre)}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600"
                />
              </div>
            </div>
          ))}
        </form>
      )}
    </div>
  );
}
