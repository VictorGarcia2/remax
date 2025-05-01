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

export default function Tipo({ selectedOptionsTipos, setSelectedOptionsTipos }) {
  const [openModal, setOpenModal] = useState(true);

  const lugares = [
    { icon: faHouse, nombre: "Casa", tipo_id: 1 },
    { icon: faCity, nombre: "Casa en Condominio", tipo_id: 2 },
    { icon: faBuildingUser, nombre: "Departamento", tipo_id: 3 },
    { icon: faPenRuler, nombre: "Desarrollo", tipo_id: 6 },
    { icon: faMapLocationDot, nombre: "Terreno", tipo_id: 4 },
    { icon: faMapLocationDot, nombre: "Terreno - Comercial", tipo_id: 10 },
    { icon: faMapLocationDot, nombre: "Terreno - Residencial", tipo_id: 5 },
    { icon: faBuildingUser, nombre: "Edificio", tipo_id: 8 },
    { icon: faBuildingUser, nombre: "Finca/Rancho", tipo_id: 14 },
    { icon: faBuildingUser, nombre: "Bodega - Comercial", tipo_id: 19 },
    { icon: faBuildingUser, nombre: "Bodega - Industrial", tipo_id: 7 },
  ];

/* "tipos": {
          "tipo_id": 10,
          "tipo_nombre": "Terreno - Comercial",
          "sector_nombre": "comercial"
        },


        "tipos": {
          "tipo_id": 9,
          "tipo_nombre": "Local - Comercial",
          "sector_nombre": "comercial"
        },
        "tipos": {
          "tipo_id": 7,
          "tipo_nombre": "Bodega - Comercial",
          "sector_nombre": "comercial"
        },
        "tipos": {
          "tipo_id": 10,
          "tipo_nombre": "Terreno - Comercial",
          "sector_nombre": "comercial"
        },
        "tipos": {
          "tipo_id": 13,
          "tipo_nombre": "Edificio - Comercial",
          "sector_nombre": "comercial"
        },
        "tipos": {
          "tipo_id": 14,
          "tipo_nombre": "Finca/Rancho - Comercial",
          "sector_nombre": "comercial"
        }, */


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
            {lugares.map(({ icon, nombre, tipo_id }) => (
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

