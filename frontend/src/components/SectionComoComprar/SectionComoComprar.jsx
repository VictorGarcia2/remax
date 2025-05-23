import React from "react";
import SliderComoComprar from "./SliderComoComprar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SectionComoComprar() {
  return (
    <>
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="aspect-w-16 aspect-h-7">
          <img
            className="w-full object-cover rounded-xl h-80 "
            src="/HomePageContent/jakub-zerdzicki-bqUZEAeWuok-unsplash.jpg"
            alt="Features Image"
          />
        </div>
        <div className="mt-5 lg:mt-16 grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <h2 className="font-bold text-2xl md:text-3xl text-gray-800 ">
              ¿Como Comprar una Propiedad?
            </h2>
            <p className="mt-2 md:mt-4 text-gray-500 ">
              No solo vendemos propiedades, creamos oportunidades. Explora
              opciones adaptadas a tus necesidades, resuelve dudas con
              consultoría 24/7 y concreta con procesos auditados. La compra de
              tu inmueble, en las manos correctas.
            </p>
          </div>
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-3 gap-8 md:gap-12">
              <div className="flex gap-x-5">
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ height: 24, width:24}}  className="mt-2 text-blue-600" />
                <div className="grow">
                  <p className="text-start w-full text-xl">
                    {" "}
                    <span className="font-[700]">
                      Busca en Nuestro Buscador Avanzado{" "}
                    </span>
                    <br /> Filtra por ubicación, precio y tipo de propiedad.
                  </p>
                </div>
              </div>

              <div className="flex gap-x-5">
                <svg
                  className="shrink-0 mt-1 size-6 text-blue-600 "
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
                <div className="grow">
                  <p className="text-start w-full text-xl">
                    {" "}
                    <span className="font-[700]">
                      Recibe Asesoría Personalizada
                    </span>
                    <br /> Un asesor REMAX te contactará para guiarte.
                  </p>
                </div>
              </div>

              <div className="flex gap-x-5">
                <svg
                  className="shrink-0 mt-1 size-6 text-blue-600 "
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <div className="grow">
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
