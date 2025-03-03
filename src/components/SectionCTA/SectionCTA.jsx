import React from "react";

export default function () {
  return (
    <div className=" mt-10 mb-10  bg-[#EFEFEF] font-display flex flex-col justify-center items-center text-center ">
      <div className="px-5 mt-5 flex flex-col justify-center items-center text-[#7b7b7b]">
        <h2 className="italic  text-2xl font-[800]">¿Listo para Comenzar?</h2>
        <p className="text-base ">
          Haz clic en el botón de WhatsApp y un asesor experto te atenderá de
          inmediato. ¡Es fácil, rápido y sin compromisos!
        </p>
        <button className="rounded-2xl mt-3 mb-5  shadow-[0_5px_5px] shadow-black/40 bg-[#5CD16A] w-20 h-7 flex justify-center">
          <img src="HomePageContent/brand-whatsapp 1.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
