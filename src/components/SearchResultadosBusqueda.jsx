import React from "react";

export default function SearchResultadosBusqueda({menuClose, setMenuClose}) {

  const handle = () => {
    setMenuClose(false);
  };
  return (
    <div className="flex justify-center px-5 gap-4">
      <div className="flex w-64 shadow-[0_3px_1px] shadow-[#BBBBBB]/50 px-3 rounded-[15px] h-[30px] border border-[#BBBBBB] justify-between">
      <input
        className=" font-display font-[200] text-[#414141] appearance-none ring-0 focus:ring-0 focus:shadow-none focus:outline-none border-none focus:border-none"
        type="search"
        name="search"
        id=""
        placeholder="Buscar en una zona"
        /> <img className="w-5" src="HomePageContent/Search Results.svg" alt="" />
        </div>
      <img onClick={handle} src="HomePageContent/Filter.svg" alt="" />
    </div>
  );
}
