import React, { useState } from "react";
import { Link } from "react-router";
export default function Search() {
  const [openTipo, setOpenTipo] = useState(true);
  const handle = () => {
    setOpenTipo(false);
  };
  return (
    <>
      <div className="mt-10 flex flex-col gap-1 pb-1 font-display ">
        <div className=" mx-16  font-display font-ligh flex gap-1 pb-1 ">
          <p className="text-sm bg-[#DB1C2E] w-16 rounded  flex justify-center items-center h-7 text-center">
            {" "}
            Renta{" "}
          </p>
          <p className="text-sm bg-[#DB1C2E] w-16 rounded  flex justify-center items-center h-7 text-center">
            {" "}
            Venta
          </p>
        </div>
        <div className="flex gap-1 pb-1">
          <div
            onClick={handle}
            className={`${
              openTipo ? "bg-white text-[#414141]" : "bg-[#003DA4] text-white"
            } rounded-s-full w-16 h-11 shadow-[0_3px_1px] shadow-black/50  align-middle text-center items-center flex`}
          >
            <p className={`  text-sm text-center w-full `}>Tipo</p>
          </div>

          <input
            type="text"
            className="bg-white text-[#414141] text-sm px-3 rounded h-11 w-60 shadow-[0_3px_1px] shadow-black/50"
            placeholder="Busca una zona..."
          />

          <div className="rounded-e-full  w-13 h-11 bg-[#003DA4] align-middle  items-center flex shadow-[0_3px_1px] shadow-black/50">
            <Link to={"/resultado"} className="mx-auto">
              <img
                loading="lazy"
                className="mx-auto"
                src="HomePageContent/Search Normal.svg"
                alt=""
              />
            </Link>
          </div>
        </div>
      </div>
      <div
        className={`${
          openTipo && "hidden"
        } w-60 h-auto bg-white mt-1 rounded shadow-[0_3px_1px]  flex flex-col justify-center align-middle items-start shadow-black/50`}
      >
        <ol className="font-display  text-start py-5 px-5 text-base  text-[#414141]">
          <li className="flex items-center gap-1 pb-1">
            <img
              loading="lazy"
              className="w-5"
              src="HomePageContent/casa.svg"
              alt=""
            />{" "}
            <p> Casa </p>{" "}
          </li>
          <li
            onClick={() => setOpenTipo(true)}
            className="flex items-center gap-1 pb-1"
          >
            <img
              loading="lazy"
              className="w-5"
              src="HomePageContent/casaencondominio.svg"
              alt=""
            />
            <p>Casa en Condominio</p>
          </li>
          <li className="flex items-center gap-1 pb-1">
            <img
              loading="lazy"
              className="w-5"
              src="HomePageContent/icondepartamento.svg"
              alt=""
            />
            <p>Departamento</p>
          </li>
          <li className="flex items-center gap-1 pb-1">
            <img
              loading="lazy"
              className="w-5"
              src="HomePageContent/edificio.svg"
              alt=""
            />
            <p>Edificio</p>
          </li>
          <li className="flex items-center gap-1 pb-1">
            <img
              loading="lazy"
              className="w-5"
              src="HomePageContent/Terreno.svg"
              alt=""
            />
            <p>Terreno</p>
          </li>
          <li className="flex items-center gap-1 pb-1">
            <img
              loading="lazy"
              className="w-5"
              src="HomePageContent/desarrollo.svg"
              alt=""
            />
            <p>Desarrollo</p>
          </li>
        </ol>
      </div>
    </>
  );
}
