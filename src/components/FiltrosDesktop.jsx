import React from "react";
import Tipo from "./Tipo.jsx";
import RangoDePrecio from "./RangoDePrecio.jsx";
import Operacion from "./Operacion.jsx";
import Sector from "./Sector.jsx";
import { Link } from "react-router";

export default function FiltrosDesktop({
  busqueda,
  setBusqueda,
  setManejoBusqueda,
  setSelectedOptions
}) {
  return (
    <div className="grid grid-cols-2">
      <div className="flex px-17 gap-2 items-center ">
        <RangoDePrecio />
        <Operacion />
        <Sector setSelectedOptions={setSelectedOptions} />
        <Tipo setSelectedOptions={setSelectedOptions}/>
      </div>
      <div className="flex gap-1 ">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          name="searchs"
          type="text"
          className="bg-white text-[#414141] text-sm sm:text-2xl px-3 rounded h-11 rounded-s-3xl w-60 shadow-[0_3px_1px] shadow-black/50 sm:h-11 sm:w-[465px] align-middle items-center flex"
          placeholder="Busca una zona..."
        />
        <div
          onClick={() => setManejoBusqueda((prevState) => !prevState)}
          className="rounded-e-full cursor-pointer  w-13 h-11 sm:h-11 sm:w-15 bg-[#003DA4] align-middle  items-center flex shadow-[0_3px_1px] shadow-black/50"
        >
          <Link to={"/resultado"} className="mx-auto">
            <button className="items-center flex cursor-pointer">
              <img
                loading="lazy"
                className="mx-auto w-4.8 sm:w-6"
                src="HomePageContent/Search Normal.svg"
                alt=""
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
