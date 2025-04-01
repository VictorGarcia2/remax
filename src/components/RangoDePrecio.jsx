import { faChevronDown, faL } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function RangoDePrecio() {
  const [openModal, setOpenModal] = useState(true)
  const handle = () => {
    setOpenModal(false)
  }
  return (
    <>
      <div className="flex flex-col ">
        <div onClick={handle} className="flex justify-center items-center gap-2 bg-gray-100 rounded-2xl relative w-[238px] h-[34px] px-3 cursor-pointer">
          {" "}
          <p className="text-2xl"> Rango de precios </p>
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
        {/* Modal */}
        <div className={` ${openModal && "hidden"} z-10 bg-gray-100 py-10 rounded-2xl px-4 absolute mt-13`}
        >
          <label htmlFor="">
            De:
            <input type="number" className="border-b px-1" placeholder="1000"  min="0"/>
          </label>
          <label htmlFor="">
            Hasta:
            <input type="number" className="border-b px-1" placeholder="1300000"  min="0"/>
          </label>
        </div>
      </div>
    </>
  );
}
