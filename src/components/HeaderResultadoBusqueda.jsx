import React from "react";
import { Link } from "react-router";
import SearchResultadosBusqueda from "./SearchResultadosBusqueda";

export default function HeaderResultadoBusqueda() {
  return (
    <div className="flex justify-center items-center xl:justify-start gap-160  w-5/6 my-10 px-10">
      <Link to={"/"}>
        <img
          loading="lazy"
          className="w-30 "
          src="logos/New_RMX_Mark_R4_RGB_dark.png"
          alt=""
        />
      </Link>
      <div className=" flex w-60 justify-around shadow-[0_3px_1px] shadow-[#BBBBBB]/50  rounded-[15px] h-[30px] border border-[#BBBBBB] ">
        <input
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
    </div>
  );
}
