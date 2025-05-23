import React from "react";

export default function SectionEquipo() {
  return (
    <>
      <div className="  sm:hidden mt-10 mb-10 px-5 font-display flex flex-col justify-center items-center text-center">
        <p className="italic  text-2xl font-[800] text-[#7b7b7b]">
          Recibe primero las mejores oportunidades industriales. ¡Suscríbete
          ahora!
        </p>

        <div className="mt-4 relative font-display  font-[400] flex flex-col    items-center">
          <p className="absolute z-10 italic bottom-15 bg-black/30  rounded-2xl p-1  w-80 font-[700] text-[20px] text-white">
            Únete a nosotros y aprovecha las oportunidades del mercado
            inmobiliario.
          </p>

          <img
            className=" rounded-2xl  shadow-[0_5px_5px] shadow-black/10"
            src="/HomePageContent/mujer-llamando.jpg"
            alt=""
          />
          <button className=" z-10 shadow-[0_5px_5px] shadow-black/40 -mt-8 w-44 h-14 bg-[#003DA4] rounded-2xl text-white ">
            Mas información
          </button>
        </div>
      </div>
      <div className=" hidden sm:visible   mt-10 mb-10 px-5 font-display sm:flex gap-10 justify-center items-center text-center">
        <img
          className=" rounded-2xl w-[462px] h-[514px] object-cover  shadow-[0_5px_5px] shadow-black/10"
          src="/HomePageContent/mujer-llamando.jpg"
          alt=""
        />
        <div className="mt-4  font-display gap-4  font-[400]  flex flex-col    items-center">
          <p className="italic  text-5xl w-[480px] font-[800] text-[#7b7b7b]">
            Recibe primero las mejores oportunidades industriales. ¡Suscríbete
            ahora!!
          </p>
          <p className=" z-10 italic bottom-15 text-4xl   rounded-2xl p-1  w-80 font-[700] text-[20px] text-[#7b7b7b]">
            Únete a nosotros y aprovecha las oportunidades del mercado
            inmobiliario.
          </p>

          <button className=" z-10 shadow-[0_5px_5px] shadow-black/40 w-44 h-14 bg-[#003DA4] rounded-2xl text-white ">
            Mas información
          </button>
        </div>
      </div>
    </>
  );
}
