import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

export default function () {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  return (
    <>
      {shareModalOpen && (
        <div
          className="flex flex-col justify-center items-center fixed z-50 w-full h-full top-0 bg-white/70"
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="text-end">
                  <FontAwesomeIcon
                    icon={faXmark}
                    size="2xl"
                    className="cursor-pointer"
                    onClick={() => setShareModalOpen(false)}
                  />
                </div>
                <div className="flex justify-center">
                  <img
                    className="max-w-[200px]"
                    src="/logos/New_RMX_Mark_R4_RGB_dark.png"
                    alt=""
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Envianos mensaje por WhatsApp
                </h1>
                <p className="text-gray-600">
                  Si estas interesado en vender tu inmueble, envíanos un mensaje
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 bg-blueRemax text-white rounded-lg shadow-sm hover:bg-blueRemax/80 transition-colors duration-200"
                  aria-label="Contactar por WhatsApp"
                  onClick={() => {
                    const whatsappLink = `https://wa.me/5212292696629?text=${encodeURIComponent(
                      "Estoy interesado en vender mi inmueble."
                    )}`;
                    window.open(whatsappLink, "_blank");
                  }}
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                  <span className="text-sm sm:text-base md:text-lg">
                    Contactar por WhatsApp
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
                  ¿Pensando en vender tu inmueble?
                </h1>
              </div>
              <div className="mt-5 max-w-3xl">
                <p className="text-lg text-gray-600 ">
                  Vende al mejor precio: Valoración GRATIS de tu propiedad con
                  análisis de mercado de la mano de un experto. ¡Descubre cuánto
                  vale tu inmueble con base en tu zona!
                </p>
              </div>
              <div className="mt-8 gap-3 flex justify-center">
                <button
                  className="rounded-2xl mt-3 mb-5 shadow-[0_5px_5px] shadow-black/40 bg-blueRemax w-24 h-9 flex justify-center"
                  onClick={() => setShareModalOpen(true)}
                >
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
