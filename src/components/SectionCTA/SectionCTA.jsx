import React from "react";

export default function () {
  return (
    <>
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-linear-to-r from-blueRemax/50 to-redRemax/20 blur-3xl w-100 h-175 rotate-[-60deg] transform -translate-x-40 "></div>
          <div className="bg-linear-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[1440px] h-200 rounded-fulls origin-top-left -rotate-12 -translate-x-60 "></div>
        </div>

        <div className="relative z-0">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="max-w-2xl text-center mx-auto">
              <div className="mt-5 max-w-2xl">
                <h1 className="block font-semibold text-gray-800 text-4xl md:text-5xl lg:text-6xl ">
                  ¿Listo para Comenzar?
                </h1>
              </div>
              <div className="mt-5 max-w-3xl">
                <p className="text-lg text-gray-600 ">
                  Haz clic en el botón de WhatsApp y un asesor experto te
                  atenderá de inmediato. ¡Es fácil, rápido y sin compromisos!
                </p>
              </div>
              <div className="mt-8 gap-3 flex justify-center">
                <button className="rounded-2xl mt-3 mb-5  shadow-[0_5px_5px] shadow-black/40 bg-blueRemax w-24  h-9 flex justify-center">
                  <img
                    className="w-6"
                    src="/HomePageContent/brand-whatsapp 1.svg"
                    alt=""
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
