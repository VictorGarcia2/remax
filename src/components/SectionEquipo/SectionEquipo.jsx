import React from "react";

export default function SectionEquipo() {
  return (
    <div className=" mt-10 mb-10 px-5 font-display flex flex-col justify-center items-center text-center">
    
    <p className="italic  text-2xl font-[800] text-[#7b7b7b]">
    ¡Únete a Nuestro Equipo de Bienes Raíces!
    </p>

    <div className="mt-4 font-display font-[400] flex flex-col    items-center">
      <p className="absolute z-10 italic mt-96 w-80 font-[700] text-[20px] text-white">Únete a nosotros y aprovecha las oportunidades del mercado inmobiliario.</p>
      <div className="absolute  w-[350px] h-[524px] rounded-2xl bg-linear-0 from-black/40 to-100%">
      </div>
      <img className=" rounded-2xl  shadow-[0_5px_5px] shadow-black/10" src="HomePageContent/mujer-llamando.jpg" alt="" />
      <button className=" z-10 shadow-[0_5px_5px] shadow-black/40 -mt-8 w-44 h-14 bg-[#003DA4] rounded-2xl text-white ">Mas información</button>
    </div>
    </div>
  );
}
