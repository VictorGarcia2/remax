import React from "react";

export default function SectionOpiniones() {
  return (
    <div className=" mt-10 mb-10 px-5 font-display flex flex-col justify-center items-center text-center ">
      <p className="italic  text-2xl font-[800] text-[#7b7b7b]">
        Opiniones Verificadas en Google
      </p>
      <div className="mt-5">
        <div className="bg-[#D9D9D9] absolute shadow-[0_5px_5px] shadow-black/40 -mt-6 -ml-6  w-16 h-16 rounded-full flex justify-center items-center">
          <img src="/public/HomePageContent/user-solid 1.svg" alt="" />
        </div>
        <div className="flex flex-col items-center w-[279px] h-[212px] shadow-[0_5px_5px] shadow-black/40 bg-[#f0f0f0] p-5 font-display text-[#7b7b7b] rounded">
          <p className="font-[500] italic text-base">Fernando Gutierrez</p>
          <div className="flex gap-1 mt-3">
            <img src="/public/HomePageContent/Star.svg" alt="" />
            <img src="/public/HomePageContent/Star.svg" alt="" />
            <img src="/public/HomePageContent/Star.svg" alt="" />
            <img src="/public/HomePageContent/Star.svg" alt="" />
            <img src="/public/HomePageContent/Star.svg" alt="" />
          </div>
          <p className="mt-3 text-base">
            Muy buena atención y gran servicio por parte del asesor que me
            atendió
          </p>
        </div>
      </div>
    </div>
  );
}
