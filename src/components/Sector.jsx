import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function Sector({ setSelectedOptions }) {
  const [openModal, setOpenModal] = useState(true);
  const handle = () => {
    setOpenModal((prevState) => !prevState);
  };
  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    if (event.target.checked) {
      // Si está marcado, añadirlo al array
      setSelectedOptions((prev) => [...prev, value]);
    } else {
      // Si está desmarcado, eliminarlo del array
      setSelectedOptions((prev) => prev.filter((item) => item !== value));
    }
  };
  return (
    <>
      <div
        onClick={handle}
        className={`${
          openModal && "hidden"
        } h-[1900px] w-[1000px] z-20  absolute`}
      ></div>
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
          <p className="text-xl"> Sector </p>
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
          } z-50 bg-gray-100 py-5 rounded-2xl px-4 absolute mt-13 flex flex-col gap-4`}
        >
          <div>
            <div class="flex items-center mb-4">
              <label
                for="default-checkbox"
                class="mx-2 text-sm font-medium text-gray-900 "
              >
                Residencial
              </label>

              <input
                id="default-checkbox"
                onChange={handleCheckboxChange}
                type="checkbox"
                value=""
                class="w-4 h-4 text-blueRemax bg-gray-100 border-gray-300 rounded-sm focus:ring-blueRemax "
              />
            </div>
            <div class="flex items-center mb-4">
              <label
                for="default-checkbox"
                class="mx-2 text-sm font-medium text-gray-900 "
              >
                Comercial/Industrial
              </label>
              <input
                onChange={handleCheckboxChange}
                id="default-checkbox"
                type="checkbox"
                value=""
                class="w-4 h-4 text-blueRemax bg-gray-100 border-gray-300 rounded-sm focus:ring-blueRemax "
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
