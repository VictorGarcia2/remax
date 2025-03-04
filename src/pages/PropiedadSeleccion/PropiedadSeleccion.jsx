import React, { useState } from "react";
import HeaderResultadoBusqueda from "../../components/HeaderResultadoBusqueda";
export default function PropiedadSeleccion({ propiedades }) {
  return (
    <>
      <HeaderResultadoBusqueda />
      <div className="flex flex-col justify-center items-start">
        <div className="w-full flex flex-col justify-center items-center">
          <div className="flex absolute justify-around mx-auto gap-70">
            <img src="HomePageContent/arrowizq.svg" alt="" />
            <img src="HomePageContent/arrowderecha.svg" alt="" />
          </div>
          <div className="flex w-full">
            <img
              className="w-full object-cover h-[202px]"
              src="/public/HomePageContent/pexels-houzlook-3797991.jpg"
              alt=""
            />
          </div>
          <p className=" z-50 mt-35 absolute bg-black/40 rounded-full p-1 text-white text-sm  ">
            {" "}
            1/2
          </p>
        </div>
        <div className="w-full text-[#7b7b7b]">
          <div className="px-5">
            <p className="">Departamento en Venta</p>
            <p>Departamento desde: $2,000,000 MXN</p>
            <div className="flex">
              <img src="/public/HomePageContent/iconmeters.svg" alt="" />
              <p>30,000m²</p>
            </div>
          </div>
          <hr className="w-full text-[#7B7B7B]" />
          <div>
            <p> Contacta al Agente</p>
            <div>
              <p>Veronica Olan Garcia</p>
              <p>Solicita informacion</p>
              <div>
                <img src="/public/HomePageContent/whatsapp.png" alt="" />
                <img src="/public/HomePageContent/correo.svg" alt="" />
                <img src="/public/HomePageContent/phone.svg" alt="" />
              </div>
            </div>
            <div>
              <img src="" alt="" />
            </div>
          </div>
          <p>Departamento  en  Venta en  AV. Salvador Diaz #345, Verazcruz, México.</p>
        </div>
      </div>
    </>
  );
}
