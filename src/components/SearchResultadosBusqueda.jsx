import React from "react";

export default function SearchResultadosBusqueda({ menuClose, setMenuClose,setBusqueda, busqueda }) {
  const handle = () => {
    setMenuClose(false);
  };
  return (
    <div className="flex justify-center px-5 gap-4 xl:hidden">
      <div className=" flex w-60 justify-around shadow-[0_3px_1px] shadow-[#BBBBBB]/50  rounded-[15px] h-[30px] border border-[#BBBBBB] ">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className=" w-45 font-display font-[200] text-[#414141] appearance-none ring-0 focus:ring-0 focus:shadow-none focus:outline-none border-none focus:border-none"
          type="search"
          name="search"
          id=""
          placeholder="Buscar en una zona"
        />
        <img
          loading="lazy"
          className="w-5 "
          src="HomePageContent/Search Results.svg"
          alt=""
        />
      </div>
      <img
        className="xl:hidden"
        onClick={handle}
        src="HomePageContent/Filter.svg"
        alt=""
      />
    </div>
  );
}
