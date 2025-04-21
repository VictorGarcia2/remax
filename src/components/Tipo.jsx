import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingUser,
  faChevronDown,
  faCity,
  faHouse,
  faMapLocationDot,
  faPenRuler,
} from "@fortawesome/free-solid-svg-icons";

export default function Tipo({ setSelectedOptionsTipos }) {
  const [openModal, setOpenModal] = useState(true);

  const lugares = [
    { icon: faHouse, nombre: "Casa", tipo_id: 1 },
    { icon: faCity, nombre: "Casa en Condominio", tipo_id: 2 },
    { icon: faBuildingUser, nombre: "Departamento", tipo_id: 3 },
    { icon: faPenRuler, nombre: "Desarrollo", tipo_id: 6 },
    { icon: faMapLocationDot, nombre: "Terreno", tipo_id: 4 },
  ];

  const toggleModal = () => setOpenModal((prev) => !prev);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedOptionsTipos((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

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
        {/* Dropdown Button */}
        <div
          onClick={toggleModal}
          className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 cursor-pointer"
        >
          <p className="text-xl">Tipo</p>
          <FontAwesomeIcon
            className={`transform ${
              openModal ? "rotate-0" : "rotate-180"
            } transition-transform`}
            icon={faChevronDown}
          />
        </div>

        {/* Modal */}
        {!openModal && (
          <form className="z-50 bg-gray-100 py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4">
            {lugares.map(({ icon, nombre, tipo_id }, index) => (
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
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600"
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
