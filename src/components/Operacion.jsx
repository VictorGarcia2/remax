import { faChevronDown, faCity, faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
export default function Operacion({ setSelectedOptionsOperacion}) {
  const [openModal, setOpenModal] = useState(true);
  const handle = () => {
    setOpenModal((prevState) => !prevState);
  };
  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    if (event.target.checked) {
      // Si está marcado, añadirlo al array
      setSelectedOptionsOperacion((prev) => [...prev, value]);
    } else {
      // Si está desmarcado, eliminarlo del array
      setSelectedOptionsOperacion((prev) => prev.filter((item) => item !== value));
    }
  };
  const lugares = [
    { icon: <FontAwesomeIcon icon={faHouse} />, nombre: 1, titulo:"Venta"},
    { icon: <FontAwesomeIcon icon={faCity} />, nombre: 2, titulo:"Renta" },
  ];
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
          className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl relative px-3 py-2 cursor-pointer"
        >
          {" "}
          <p className="text-xl"> Operacion </p>
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
          } z-10 bg-gray-100 py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4`}
        >
          <div>
            {lugares.map((lugar, index) => (
              <div
                key={index}
                className="flex  justify-between  items-center mb-4"
              >
                <div>
                  {lugar.icon}
                  <label
                    htmlFor={`checkbox-${index}`}
                    className="mx-2 text-sm font-medium text-gray-900 "
                  >
                    {lugar.titulo}
                  </label>
                </div>
                <input
                  id={`checkbox-${index}`}
                  type="checkbox"
                  name="tipo"
                  value={lugar.nombre}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-red-600  bg-gray-100 border-gray-300 rounded-sm focus:ring-red-600 "
                />
              </div>
            ))}
          </div>
        </form>
      </div>
    </>
  );
}
