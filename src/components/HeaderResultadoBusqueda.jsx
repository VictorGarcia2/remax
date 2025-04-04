import React, { useState } from "react";
import { Link } from "react-router";


export default function HeaderResultadoBusqueda() {
 
  return (
    <div className="flex  items-center xl:justify-start gap-120  w-5/6 my-10 px-10">
      <Link to={"/"}>
        <img
          loading="lazy"
          className="w-30 "
          src="logos/New_RMX_Mark_R4_RGB_dark.png"
          alt=""
        />
      </Link>
      <div className="flex gap-1 ">

                 <input
                   name="searchs"
                   type="text"
                   className="bg-white text-[#414141] text-sm sm:text-2xl px-3 rounded h-11 w-60 shadow-[0_3px_1px] shadow-black/50 sm:h-11 sm:w-[465px] align-middle items-center flex"
                   placeholder="Busca una zona..."
                 />
     
                 <div className="rounded-e-full  w-13 h-11 sm:h-11 sm:w-15 bg-[#003DA4] align-middle  items-center flex shadow-[0_3px_1px] shadow-black/50">
                   <Link to={"/resultado"} className="mx-auto">
                     <button className="items-center flex">
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
