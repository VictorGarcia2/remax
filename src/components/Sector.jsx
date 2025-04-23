import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCity,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

export default function Sector({ selectedOptions, setSelectedOptions }) {
  const [openModal, setOpenModal] = useState(false);
  const modalRef = useRef(null);

  const toggleModal = () => setOpenModal((prev) => !prev);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setOpenModal(false);
    }
  };

  useEffect(() => {
    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  const sectors = [
    { icon: faHouse, name: "Residencial", nombre: "Residencial" },
    {
      icon: faCity,
      name: "Comercial/Industrial",
      nombre: "Comercial/Industrial",
      values: ["comercial", "industrial"],
    },
  ];

  const handleCheckboxChange = (event) => {
    const sector = sectors.find((s) => s.name === event.target.value);
    const valuesToAddOrRemove = sector.values || [
      event.target.value.toLowerCase(),
    ];

    setSelectedOptions((prev) =>
      event.target.checked
        ? [...prev, ...valuesToAddOrRemove]
        : prev.filter((item) => !valuesToAddOrRemove.includes(item))
    );
  };

  return (
    <div className="flex flex-col relative">
      {/* Trigger */}
      <div
        onClick={toggleModal}
        className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 cursor-pointer"
      >
        <p className="text-lg sm:text-xl md:text-xl 2xl:text-2xl">Sector</p>
        <FontAwesomeIcon
          className={`transform transition-transform ${
            openModal ? "rotate-180" : "rotate-0"
          }`}
          icon={faChevronDown}
        />
      </div>

      {/* Modal */}
      {openModal && (
        <form
          ref={modalRef}
          className="z-50 bg-gray-100 py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4"
        >
          {sectors.map((sector, index) => (
            <div key={index} className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={sector.icon} />
                <label
                  htmlFor={`checkbox-${index}`}
                  className="mx-2 text-sm font-medium text-gray-900"
                >
                  {sector.name}
                </label>
              </div>
              <input
                id={`checkbox-${index}`}
                type="checkbox"
                value={sector.name}
                checked={selectedOptions.includes(sector.name.toLowerCase())}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600"
              />
            </div>
          ))}
        </form>
      )}
    </div>
  );
}
