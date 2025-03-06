import React, { useState } from "react";
import HeaderResultadoBusqueda from "../../components/HeaderResultadoBusqueda";
import SectionFooter from "../../components/SectionFooter/SectionFooter.jsx";
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
        <div className="w-full flex flex-col text-[#7b7b7b]">
          <div className="px-5">
            <p className="">Departamento en Venta</p>
            <p>Departamento desde: $2,000,000 MXN</p>
            <div className="flex">
              <img src="/public/HomePageContent/iconmeters.svg" alt="" />
              <p>30,000m²</p>
            </div>
          </div>
          <hr className="w-full my-2 text-[#7B7B7B]" />
          <div className="w-[358px] h-[158px]  p-3 text-center flex  flex-col  justify-between items-center shadow-lg rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
            <div>
              <p> Contacta al Agente</p>
            </div>
            <div className="flex gap-15 items-center justify-between">
              <div className="">
                <p>Veronica Olan Garcia</p>
                <p>Solicita informacion</p>
                <div className="flex items-center justify-center gap-4">
                  <img
                    className="w-auto h-full"
                    src="/public/HomePageContent/whatsapp.png"
                    alt=""
                  />
                  <img
                    className="w-auto h-full"
                    src="/public/HomePageContent/correo.svg"
                    alt=""
                  />
                  <img
                    className="w-auto h-full"
                    src="/public/HomePageContent/phone.svg"
                    alt=""
                  />
                </div>
              </div>
              <div>
                <img
                  className="w-[99px] h-[104px] object-cover rounded-[15px]"
                  src="/public/HomePageContent/agente.png"
                  alt=""
                />
              </div>{" "}
              
            </div>
          </div>
          <p>
            Departamento en Venta en AV. Salvador Diaz #345, Veracruz, México.
          </p>
          <hr />
          <button className="mt-2 mx-auto bg-[#DB1C2E] w-[352px] h-[48px] text-white rounded-[10px]">
            Calculador de hipotecas
          </button>
          <div>
            <p>Descripcion del innmueble</p>
            <br />
            <p>
              ParqueViatt® Se encuentra a 200 m del periférico Raúl López
              Sánchez, vialidad que conecta la zona industrial de Gómez Palacio
              con las salidas más importantes y concurridas de La Laguna, por lo
              que es la ruta principal del tráfico de carga pesada y a tan solo
              600m del centro trailero de la ciudad.  ParqueViatt® contará con
              solo 21 bodegas que van desde los 745m2 hasta los 2,072m2, estas
              se concentran alrededor de un gran patio de maniobras que fue
              diseñado para garantizar los radios de giro de cada tráiler, para
              eficientizar su tránsito. 
            </p>
          </div>
          <div>
            <p>Informacion detallada</p>
            <div>
              <div className="flex justify-between">
                <p>Tipo de propiedad</p>
                <p>Departamento</p>
              </div>
              <div className="flex justify-between">
                <p>Estacionamiento</p>
                <p>10 Cajones</p>
              </div>
              <div className="flex justify-between">
                <p>Construcción</p>
                <p>88.93 m2</p>
              </div>
              <div className="flex justify-between">
                <p>Baños</p>
                <p>1.0</p>
              </div>
              <div className="flex justify-between">
                <p>Edad de Propiedadd</p>
                <p>10 años</p>
              </div>
              <div className="flex justify-between">
                <p>Uso de Suelo</p>
                <p>Comercial</p>
              </div>
              <div className="flex justify-between">
                <p>Niveles/Piso</p>
                <p>1</p>
              </div>
              <div className="flex justify-between">
                <p>Mantenimiento</p>
                <p>$5,208 MXN</p>
              </div>
            </div>
          </div>
          <div>
            <p>Ubicacion</p>
            <br />
            <p>
              Departamento en Venta en AV. Salvador Diaz #345, Veracruz, México.
            </p>
            <div className="w-[353px] h-[254px] bg-green-100 mx-auto rounded-[10px]"></div>
          </div>
          <div>
            <p>Amenidades</p>
            <div></div>
          </div>
          <div>
            <p>Zonas y Facilidades</p>
          </div>
        </div>
      </div>
      <SectionFooter />
    </>
  );
}
