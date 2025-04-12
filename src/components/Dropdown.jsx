import React from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useState } from "react";
import { faCarSide, faElevator, faPersonSwimming, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Icon({ id, open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${
        id === open ? "rotate-180" : ""
      } h-5 w-5 transition-transform`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
export function Dropdown({propiedadSeleccion}) {
  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const [openAcc1, setOpenAcc1] = useState(true);
  const [openAcc2, setOpenAcc2] = useState(true);
  const [openAcc3, setOpenAcc3] = useState(true);
  const [openAcc4, setOpenAcc4] = useState(true);
  const [openAcc5, setOpenAcc5] = useState(true);
  const [open, setOpen] = useState(openAcc1);
  const handleOpenAcc1 = () => setOpenAcc1((cur) => !cur);
  const handleOpenAcc2 = () => setOpenAcc2((cur) => !cur);
  const handleOpenAcc3 = () => setOpenAcc3((cur) => !cur);
  const handleOpenAcc4 = () => setOpenAcc4((cur) => !cur);
  const handleOpenAcc5 = () => setOpenAcc5((cur) => !cur);
  return (
    <>
      <Accordion open={openAcc1} icon={<Icon id={1} open={openAcc1} />}>
        <AccordionHeader onClick={handleOpenAcc1}>
          <p className="font-bold text-[18px] lg:text-3xl">
            Descripción del inmueble
          </p>
        </AccordionHeader>
        <AccordionBody>
          <p className="text-base lg:text-2xl">
          {propiedadSeleccion?.propiedades_meta.descripcion.replace(/[\r\n]+/g, ' ').trim() || ""} 
          </p>
        </AccordionBody>
      </Accordion>
      <Accordion open={openAcc2} icon={<Icon id={2} open={open} />}>
        <AccordionHeader onClick={handleOpenAcc2}>
          <p className="font-bold text-[18px] lg:text-3xl">
            Información detallada
          </p>
        </AccordionHeader>
        <AccordionBody>
          <div className=" flex flex-col gap-4 text-base lg:text-2xl">
            <div className="flex justify-between">
              <p className="">Tipo de propiedad</p>
              <p className="font-bold ">Departamento</p>
            </div>
            <div className="flex justify-between">
              <p className="">Estacionamiento</p>
              <p className="font-bold ">10 cajones</p>
            </div>
            <div className="flex justify-between">
              <p className="">Construcción</p>
              <p className="font-bold ">88.93 m²</p>
            </div>
            <div className="flex justify-between">
              <p className="">Baños</p>
              <p className="font-bold ">1.0</p>
            </div>
            <div className="flex justify-between">
              <p className="">Edad de Propiedad</p>
              <p className="font-bold ">10 años</p>
            </div>
            <div className="flex justify-between">
              <p className="">Uso de Suelo</p>
              <p className="font-bold ">Comercial</p>
            </div>
            <div className="flex justify-between">
              <p className="">Niveles/Piso</p>
              <p className="font-bold ">1</p>
            </div>
            <div className="flex justify-between">
              <p className="">Mantenimiento</p>
              <p className="font-bold ">$5,208 MXN</p>
            </div>
          </div>
        </AccordionBody>
      </Accordion>
      <Accordion open={openAcc3} icon={<Icon id={3} open={open} />}>
        <AccordionHeader onClick={handleOpenAcc3}>
          <p className="font-bold text-[18px] lg:text-3xl">Ubicación</p>
        </AccordionHeader>
        <AccordionBody>
          <p className="text-base lg:text-2xl">
            Departamento en Venta en AV. Salvador Díaz #345, Veracruz, México.
          </p>
          <div className="w-[353px] mt-3 h-[254px] bg-green-100 mx-auto rounded-[10px]"></div>
        </AccordionBody>
      </Accordion>
      <Accordion open={openAcc4} icon={<Icon id={4} open={open} />}>
        <AccordionHeader onClick={handleOpenAcc4}>
          <p className="font-bold text-[18px] lg:text-3xl">Amenidades</p>
        </AccordionHeader>
        <AccordionBody>
          <div className="grid grid-cols-3 gap-2">
            
            <div className="w-full">
              <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start  text-2xl ">
                <FontAwesomeIcon icon={faCarSide} className="text-[#797979]" />
                <p className="text-[#797979]">Estacionamiento</p>
              </div>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl ">
              <FontAwesomeIcon
                icon={faPersonSwimming}
                className="text-[#797979]"
              />
              <p className="text-[#797979]">Alberca</p>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl ">
              <FontAwesomeIcon icon={faElevator} className="text-[#797979]" />
              <p className="text-[#797979]">Elevador</p>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl ">
              <FontAwesomeIcon icon={faUserShield} className="text-[#797979]" />
              <p className="text-[#797979]">Caseta de Vigilancia</p>
            </div>
          </div>
        </AccordionBody>
      </Accordion>
      <Accordion open={openAcc5} icon={<Icon id={5} open={open} />}>
        <AccordionHeader onClick={handleOpenAcc5}>
          <p className="font-bold text-[18px] lg:text-3xl">
            Zonas y Facilidades
          </p>
        </AccordionHeader>
        <AccordionBody>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl">
              <p>Alumbrado</p>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl">
              <p>Caseta de vigilancia</p>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl">
              <p>Áreas comúnes</p>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl">
              <p>Bardeado</p>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl">
              <p>Gimnacios cercanos</p>
            </div>
            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2  px-2 justify-start text-2xl">
              <p>Escuelas Cercanas</p>
            </div>
           
          </div>
        </AccordionBody>
      </Accordion>
    </>
  );
}
