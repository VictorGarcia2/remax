import React, { useEffect, useState } from "react";
import SectionFooter from "../../components/SectionFooter/SectionFooter.jsx";
import HeaderPropiedadSeleccion from "./HeaderPropiedadSeleccion.jsx";
export default function PropiedadSeleccion({ propiedades }) {
  const [animation, setAnimation] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setAnimation(true);
      setTimeout(() => {
        setAnimation(false);
      }, 4000);
    }, 3000);
  }, []);

  return (
    <>
      <HeaderPropiedadSeleccion />
      <div
        className={` transition-all duration-[900ms] ease-in-out   bottom-4 right-4 bg-blueRemax rounded-full  fixed z-50  w-[217px] h-[50px] flex items-center justify-center ${
          animation ? "translate-x-0 opacity-100 " : " opacity-0 translate-x-0 "
        }`}
      >
        <p className="text-white font-lato italic font-bold w-full px-4 text-[16px]">
          Contacta a un agente
        </p>
      </div>
      <div className="bottom-4 right-4 bg-blueRemax rounded-full  fixed z-50  w-[50px] h-[50px] flex items-center justify-center">
        <img
          className="w-8"
          src="/public/HomePageContent/brand-whatsapp 1.svg"
          alt=""
        />
      </div>
      <div className="flex flex-col justify-center items-start">
        <div className="w-full flex relative  flex-col justify-center items-center">
          <div className="absolute right-3 top-4 bg-black/50 p-1 rounded-full">
            <img
              className="w-[20px] h-[20px]"
              src="/public/HomePageContent/iconshare.png"
              alt=""
            />
          </div>
          <div className="flex w-full absolute justify-around mx-auto gap-70">
            <img
              className="w-[27px] h-[27px]"
              src="HomePageContent/arrowizq.svg"
              alt="Flecha izquierda"
            />
            <img
              className="w-[27px] h-[27px]"
              src="HomePageContent/arrowderecha.svg"
              alt="Flecha derecha"
            />
          </div>
          <div className="flex w-full">
            <img
              className="w-full object-cover h-[202px]"
              src="/public/HomePageContent/pexels-houzlook-3797991.jpg"
              alt="Imagen de propiedad"
            />
          </div>
          <p className="z-50 mt-35 absolute bg-black/40 rounded-full p-1 text-white text-sm">
            1/2
          </p>
        </div>
        <div className="w-full flex flex-col text-[#7b7b7b]">
          <div className="px-5">
            <p>Departamento en Venta</p>
            <p>Departamento desde: $2,000,000 MXN</p>
            <div className="flex">
              <img
                src="/public/HomePageContent/iconmeters.svg"
                alt="Icono de metros cuadrados"
              />
              <p>30,000m²</p>
            </div>
          </div>
          <hr className="w-full my-2 text-[#7B7B7B]" />
          <div className="w-[341px] h-[158px] p-3 text-center flex flex-col justify-between items-center shadow-[0px_4px_5px_0px] shadow-black/40 rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
            <div>
              <p className="font-bold text-[18px]">Contacta al Agente</p>
            </div>
            <div className="flex gap-15 items-center justify-between">
              <div>
                <p className="font-medium text-[16px]">Verónica Olan García</p>
                <p className="font-medium text-[16px]">Solicita información:</p>
                <div className="flex items-center justify-center gap-4">
                  <img
                    className="w-auto h-full"
                    src="/public/HomePageContent/whatsapp.png"
                    alt="WhatsApp"
                  />
                  <img
                    className="w-auto h-full"
                    src="/public/HomePageContent/correo.svg"
                    alt="Correo"
                  />
                  <img
                    className="w-auto h-full"
                    src="/public/HomePageContent/phone.svg"
                    alt="Teléfono"
                  />
                </div>
              </div>
              <div>
                <img
                  className="w-[99px] h-[104px] object-cover rounded-[15px]"
                  src="/public/HomePageContent/agente.png"
                  alt="Foto del agente"
                />
              </div>
            </div>
          </div>
          <p className="px-5 text-[18px] font-bold my-3">
            Departamento en Venta en AV. Salvador Díaz #345, Veracruz, México.
          </p>
          <hr />
          <button className="mt-3 mx-auto bg-[#DB1C2E] w-[341px] text-[18px] font-bold h-[48px] text-white rounded-[10px]">
            Calculadora de hipotecas
          </button>
          <div className="px-5 mt-5">
            <p className="font-bold text-[18px]">Descripción del inmueble</p>
            <br />
            <p>
              ParqueViatt® se encuentra a 200 m del Periférico Raúl López
              Sánchez, vialidad que conecta la zona industrial de Gómez Palacio
              con las salidas más importantes y concurridas de La Laguna, por lo
              que es la ruta principal del tráfico de carga pesada y a tan solo
              600 m del centro trailero de la ciudad. ParqueViatt® contará con
              solo 21 bodegas que van desde los 745 m² hasta los 2,072 m², estas
              se concentran alrededor de un gran patio de maniobras que fue
              diseñado para garantizar los radios de giro de cada tráiler, para
              eficientizar su tránsito.
            </p>
          </div>
          <hr className="my-4" />
          <div className=" mt-4 px-5 flex flex-col gap-4">
            <p className="font-bold text-[18px]">Información detallada</p>
            <div className=" flex flex-col gap-4">
              <div className="flex justify-between">
                <p className="text-base">Tipo de propiedad</p>
                <p className="font-bold text-base">Departamento</p>
              </div>
              <div className="flex justify-between">
                <p className="text-base">Estacionamiento</p>
                <p className="font-bold text-base">10 cajones</p>
              </div>
              <div className="flex justify-between">
                <p className="text-base">Construcción</p>
                <p className="font-bold text-base">88.93 m²</p>
              </div>
              <div className="flex justify-between">
                <p className="text-base">Baños</p>
                <p className="font-bold text-base">1.0</p>
              </div>
              <div className="flex justify-between">
                <p className="text-base">Edad de Propiedad</p>
                <p className="font-bold text-base">10 años</p>
              </div>
              <div className="flex justify-between">
                <p className="text-base">Uso de Suelo</p>
                <p className="font-bold text-base">Comercial</p>
              </div>
              <div className="flex justify-between">
                <p className="text-base">Niveles/Piso</p>
                <p className="font-bold text-base">1</p>
              </div>
              <div className="flex justify-between">
                <p className="text-base">Mantenimiento</p>
                <p className="font-bold text-base">$5,208 MXN</p>
              </div>
            </div>
          </div>
          <hr className="mt-4" />
          <div className="px-5 my-4">
            <p className="text-[18px] font-bold">Ubicación</p>

            <p className="font-regular text-[18px]">
              Departamento en Venta en AV. Salvador Díaz #345, Veracruz, México.
            </p>
            <div className="w-[353px] mt-3 h-[254px] bg-green-100 mx-auto rounded-[10px]"></div>
          </div>
          <hr className="my-3" />
          <div className="px-5">
            <p className="font-bold text-[18px]">Amenidades</p>
            <div></div>
          </div>
          <div className="px-5">
            <p className="font-bold text-[18px]">Zonas y Facilidades</p>
          </div>
        </div>
      </div>
      <SectionFooter />
    </>
  );
}
