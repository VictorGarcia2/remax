import React from "react";
import SliderComoComprar from "./SliderComoComprar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SectionComoComprar() {
  return (
    <>
     {/*  <div className="flex flex-col justify-center text-center px-5">
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
      </div> */}
      <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div class="aspect-w-16 aspect-h-7">
          <img
            class="w-full object-cover rounded-xl h-80 "
            src="/HomePageContent/jakub-zerdzicki-bqUZEAeWuok-unsplash.jpg"
            alt="Features Image"
          />
        </div>
        <div class="mt-5 lg:mt-16 grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div class="lg:col-span-1">
            <h2 class="font-bold text-2xl md:text-3xl text-gray-800 ">
              ¿Como Comprar una Propiedad?
            </h2>
            <p class="mt-2 md:mt-4 text-gray-500 ">
              No solo vendemos propiedades, creamos oportunidades. Explora
              opciones adaptadas a tus necesidades, resuelve dudas con
              consultoría 24/7 y concreta con procesos auditados. La compra de
              tu inmueble, en las manos correctas.
            </p>
          </div>
          <div class="lg:col-span-2">
            <div class="grid sm:grid-cols-3 gap-8 md:gap-12">
              <div class="flex gap-x-5">
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{color: "#003DA4",}} size="xl" />
                <div class="grow">
                  <p className="text-start w-full text-xl">
                    {" "}
                    <span className="font-[700]">
                      Busca en Nuestro Buscador Avanzado{" "}
                    </span>
                    <br /> Filtra por ubicación, precio y tipo de propiedad.
                  </p>
                </div>
              </div>

              <div class="flex gap-x-5">
                <svg
                  class="shrink-0 mt-1 size-6 text-blue-600 "
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
                <div class="grow">
                  <p className="text-start w-full text-xl">
                    {" "}
                    <span className="font-[700]">
                      Recibe Asesoría Personalizada
                    </span>
                    <br /> Un asesor REMAX te contactará para guiarte.
                  </p>
                </div>
              </div>

              <div class="flex gap-x-5">
                <svg
                  class="shrink-0 mt-1 size-6 text-blue-600 "
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <div class="grow">
                  <p className="text-start w-full text-xl">
                    {" "}
                    <span className="font-[700]">
                       Visita, Negocia y Cierra
                    </span>
                    <br /> Te acompañamos en todo el proceso para una compra
                    segura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
