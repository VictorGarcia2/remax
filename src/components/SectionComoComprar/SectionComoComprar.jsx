import React from "react";
import SliderComoComprar from "./SliderComoComprar";
export default function SectionComoComprar() {
  return (
    <>
      <div className="flex flex-col justify-center text-center px-5">
        <div className="font-display flex -mx-2   gap-2 overflow-auto overflow-x-scroll text-center pb-10">
          <div>
            <p className="italic  text-2xl font-[800] font-display text-[#7b7b7b]">
              ¿Como Comprar una Propiedad?
            </p>
            <div className="flex px-1 flex-col justify-center gap-4">
              <div className="mx-auto  rounded shadow-[0_5px_5px] shadow-black/40 p-4 text-[#7b7b7b] bg-[#F9F9F9] w-[329px] h-[110px] flex ">
                <img
                  loading="lazy"
                  className="w-13"
                  src="HomePageContent/iconsearch.svg"
                  alt=""
                />
                <p className="text-end w-full text-[14px]">
                  {" "}
                  <span className="font-[700]">
                    Busca en Nuestro Buscador Avanzado{" "}
                  </span>
                  <br /> Filtra por ubicación, precio y tipo de propiedad.
                </p>
              </div>
              <div className="mx-auto  rounded shadow-[0_5px_5px] shadow-black/40 p-4 text-[#7b7b7b] bg-[#F9F9F9] w-[329px] h-[110px] flex ">
                <img
                  loading="lazy"
                  className="w-13"
                  src="HomePageContent/iconphone.svg"
                  alt=""
                />
                <p className="text-end w-full text-[14px]">
                  {" "}
                  <span className="font-[700]">
                    Recibe Asesoría Personalizada
                  </span>
                  <br /> Un asesor REMAX te contactará para guiarte.
                </p>
              </div>
              <div className="mx-auto  rounded shadow-[0_5px_5px] shadow-black/40 p-4 text-[#7b7b7b] bg-[#F9F9F9] w-[329px] h-[110px] flex ">
                <img
                  loading="lazy"
                  className="w-13"
                  src="HomePageContent/iconedificiocompra.svg"
                  alt=""
                />
                <p className="text-end w-full text-[14px]">
                  {" "}
                  <span className="font-[700]"> Visita, Negocia y Cierra</span>
                  <br /> Te acompañamos en todo el proceso para una compra
                  segura.
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="italic  text-2xl font-[800] font-display text-[#7b7b7b]">
              ¿Como Vender una Propiedad?
            </p>
            <div className="flex px-1 flex-col justify-center gap-4">
              <div className="mx-auto  rounded shadow-[0_5px_5px] shadow-black/40 p-4 text-[#7b7b7b] bg-[#F9F9F9] w-[329px] h-[110px] flex ">
                <img
                  loading="lazy"
                  className="w-13"
                  src="HomePageContent/valoracion.svg"
                  alt=""
                />
                <p className="text-end w-full text-[14px]">
                  {" "}
                  <span className="font-[700]">Valoración Profesional</span>
                  <br /> Obtén un precio competitivo para tu propiedad.
                </p>
              </div>
              <div className="mx-auto  rounded shadow-[0_5px_5px] shadow-black/40 p-4 text-[#7b7b7b] bg-[#F9F9F9] w-[329px] h-[110px] flex ">
                <img
                  loading="lazy"
                  className="w-13"
                  src="HomePageContent/estrategia.svg"
                  alt=""
                />
                <p className="text-end w-full text-[14px]">
                  <span className="font-[700]">Estrategia de Venta</span>
                  <br /> Promocionamos tu propiedad con herramientas avanzadas.
                </p>
              </div>
              <div className="mx-auto  rounded shadow-[0_5px_5px] shadow-black/40 p-4 text-[#7b7b7b] bg-[#F9F9F9] w-[329px] h-[110px] flex ">
                <img
                  loading="lazy"
                  className="w-13"
                  src="HomePageContent/cierre.svg"
                  alt=""
                />
                <p className="text-end w-full text-[14px]">
                  <span className="font-[700]"> Cierre Rápido y Seguro</span>
                  <br /> Gestionamos visitas, negociaciones y el proceso legal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
