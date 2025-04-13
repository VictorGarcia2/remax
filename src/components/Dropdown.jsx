import React, { useEffect, useRef } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faSnowflake, 
  faWaterLadder,
  faCouch,
  faGamepad,
  faPeopleGroup,
  faChild,
  faDoorOpen,
  faBook,
  faBoxArchive,
  faMugHot,
  faTemperatureHigh,
  faFutbol,
  faTableTennisPaddleBall,
  faKitchenSet,
  faChess,
  faBroom,
  faTv,
  faElevator,
  faSolarPanel,
  faDumbbell,
  faWater,
  faWifi,
  faHotTubPerson,
  faLeaf,
  faSoap,
  faPhone,
  faPaw,
  faFireBurner,
  faFilm,
  faChampagneGlasses,
  faSpa,
  faShieldHalved,
  faUmbrellaBeach,
  faShirt,
  faLock,
  faMountainSun,
  faTree,
  faCheck, faHouseChimney, faFire
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Añade los íconos a la biblioteca
library.add(
  faSnowflake, faWaterLadder, faCouch, faGamepad, faPeopleGroup,
  faChild, faDoorOpen, faBook, faBoxArchive, faMugHot,
  faTemperatureHigh, faFutbol, faTableTennisPaddleBall, faKitchenSet,
  faChess, faBroom, faTv, faElevator, faSolarPanel,
  faDumbbell, faWater, faWifi, faHotTubPerson, faLeaf,
  faSoap, faPhone, faPaw, faFireBurner, faFilm,
  faChampagneGlasses, faSpa, faShieldHalved, faUmbrellaBeach,
  faShirt, faLock, faMountainSun, faTree, faCheck, faHouseChimney, faFire
);
mapboxgl.accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

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
export function Dropdown({ propiedadSeleccion }) {
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
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapLoadedRef = useRef(false);
  const [mapIsReady, setMapIsReady] = useState(false);
  const colonia = propiedadSeleccion?.colonias.colonia_nombre;
  const estado = propiedadSeleccion?.estados?.estado_nombre;
  const ciudad = propiedadSeleccion?.ciudades.ciudad_nombre;
  const calle = propiedadSeleccion?.calle;
  const direccion = `${calle}, ${colonia}, ${ciudad}, ${estado}`;

  const tipoPropiedad = propiedadSeleccion?.tipos?.tipo_nombre;
  const estacionamiento = propiedadSeleccion?.estacionamientos;
  const construccion = propiedadSeleccion?.m2_construccion;
  const banos = propiedadSeleccion?.banos;
  const edadPropiedad = propiedadSeleccion?.edad_de_propiedad;
  const usoDeSuelo = propiedadSeleccion?.sector;
  const nivelPiso = propiedadSeleccion?.propiedades_meta?.niveles;
  const mantenimiento = propiedadSeleccion?.propiedades_meta?.mantenimiento;
  function removeHTMLTags(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>/g, "");
  }
  const cleanDescription = removeHTMLTags(
    propiedadSeleccion?.propiedades_meta.descripcion
  );

  const latitud = propiedadSeleccion?.latitud;
  const longitud = propiedadSeleccion?.longitud;

  useEffect(() => {
    if (mapIsReady && mapRef.current && latitud && longitud) {
      new mapboxgl.Marker({ color: "#e63946" })
        .setLngLat([longitud, latitud])
        .addTo(mapRef.current);
      mapRef.current.setCenter([longitud, latitud]);
    }
  }, [mapIsReady, latitud, longitud]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-96.135744, 19.172264], // Veracruz
      zoom: 13,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl());
    mapRef.current.on("load", () => {
      mapLoadedRef.current = true;
      setMapIsReady(true);
    });
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  const AIRE_ACONDICIONADO =
    propiedadSeleccion?.propiedades_meta?.aire_acondicionado;
  const ALBERCA = propiedadSeleccion?.propiedades_meta?.alberca;
  const AMUEBLADA = propiedadSeleccion?.propiedades_meta?.amueblada;
  const AREA_DE_JUEGOS = propiedadSeleccion?.propiedades_meta?.area_de_juegos;
  const AREAS_COMUNES = propiedadSeleccion?.propiedades_meta?.areas_comunes;
  const AREAS_NINOS = propiedadSeleccion?.propiedades_meta?.areas_ninos;
  const BALCON = propiedadSeleccion?.propiedades_meta?.balcon;
  const BIBLIOTECA = propiedadSeleccion?.propiedades_meta?.biblioteca;
  const BODEGA = propiedadSeleccion?.propiedades_meta?.bodega;
  const CAFETERIA = propiedadSeleccion?.propiedades_meta?.cafeteria;
  const CALEFACCION = propiedadSeleccion?.propiedades_meta?.calefaccion;
  const CANCHA_DE_FUTBOL =
    propiedadSeleccion?.propiedades_meta?.cancha_de_futbol;
  const CANCHA_DE_PADEL = propiedadSeleccion?.propiedades_meta?.cancha_de_padel;
  const CANCHA_DE_TENIS = propiedadSeleccion?.propiedades_meta?.cancha_de_tenis;
  const CASA_CLUB = propiedadSeleccion?.propiedades_meta?.casa_club;
  const CHIMENEA = propiedadSeleccion?.propiedades_meta?.chimenea;
  const COCINA_INTEGRAL = propiedadSeleccion?.propiedades_meta?.cocina_integral;
  const CUARTO_DE_RECREACION =
    propiedadSeleccion?.propiedades_meta?.cuarto_de_recreacion;
  const CUARTO_DE_SERVICIO =
    propiedadSeleccion?.propiedades_meta?.cuarto_de_servicio;
  const CUARTO_TV = propiedadSeleccion?.propiedades_meta?.cuarto_tv;
  const ELEVADOR = propiedadSeleccion?.propiedades_meta?.elevador;
  const ENERGIA_SOLAR = propiedadSeleccion?.propiedades_meta?.energia_solar;
  const GIMNASIO = propiedadSeleccion?.propiedades_meta?.gimnasio;
  const HIDRONEUMATICO = propiedadSeleccion?.propiedades_meta?.hidroneumatico;
  const INTERNET = propiedadSeleccion?.propiedades_meta?.internet;
  const JACUZZI = propiedadSeleccion?.propiedades_meta?.jacuzzi;
  const JARDIN = propiedadSeleccion?.propiedades_meta?.jardin;
  const LAVANDERIA = propiedadSeleccion?.propiedades_meta?.lavanderia;
  const LINEA_TELEFONICA =
    propiedadSeleccion?.propiedades_meta?.linea_telefonica;
  const MASCOTAS = propiedadSeleccion?.propiedades_meta?.mascotas;
  const PARRILLA = propiedadSeleccion?.propiedades_meta?.parrilla;
  const SALON_DE_CINE = propiedadSeleccion?.propiedades_meta?.salon_de_cine;
  const SALON_DE_FIESTAS =
    propiedadSeleccion?.propiedades_meta?.salon_de_fiestas;
  const SPA = propiedadSeleccion?.propiedades_meta?.spa;
  const SISTEMA_DE_SEGURIDAD =
    propiedadSeleccion?.propiedades_meta?.sistema_de_seguridad;
  const TERRAZA = propiedadSeleccion?.propiedades_meta?.terraza;
  const VESTIDOR = propiedadSeleccion?.propiedades_meta?.vestidor;
  const VIGILANCIA = propiedadSeleccion?.propiedades_meta?.vigilancia;
  const VISTA_PANORAMICA =
    propiedadSeleccion?.propiedades_meta?.vista_panoramica;
  const ZONA_ARBOLADA = propiedadSeleccion?.propiedades_meta?.zona_arbolada;

  const amenidadesFiltradas = {
    aire_acondicionado: "Aire acondicionado",
    alberca: "Alberca",
    amueblada: "Amueblada",
    area_de_juegos: "Área de juegos",
    areas_comunes: "Áreas comunes",
    areas_ninos: "Áreas niños",
    balcon: "Balcón",
    bardeado: "Bardeado",
    biblioteca: "Biblioteca",
    bodega: "Bodega",
    cafeteria: "Cafetería",
    calefaccion: "Calefacción",
    cancha_de_futbol: "Cancha de fútbol",
    cancha_de_padel: "Cancha de pádel",
    cancha_de_tenis: "Cancha de tenis",
    casa_club: "Casa club",
    chimenea: "Chimenea",
    cocina_integral: "Cocina integral",
    cuarto_de_recreacion: "Cuarto de recreación",
    cuarto_de_servicio: "Cuarto de servicio",
    cuarto_tv: "Cuarto TV",
    elevador: "Elevador",
    energia_solar: "Energía solar",
    gimnasio: "Gimnasio",
    hidroneumatico: "Hidroneumático",
    internet: "Internet",
    jacuzzi: "Jacuzzi",
    jardin: "Jardín",
    lavanderia: "Lavandería",
    linea_telefonica: "Línea telefónica",
    mascotas: "Mascotas",
    parrilla: "Parrilla",
    salon_de_cine: "Salón de cine",
    salon_de_fiestas: "Salón de fiestas",
    spa: "Spa",
    sistema_de_seguridad: "Sistema de seguridad",
    terraza: "Terraza",
    vestidor: "Vestidor",
    vigilancia: "Vigilancia",
    vista_panoramica: "Vista panorámica",
    zona_arbolada: "Zona arbolada",
  };
  const amenidadesDisponibles = Object.entries(amenidadesFiltradas)
    .filter(([key]) => propiedadSeleccion?.propiedades_meta?.[key] === 1)
    .map(([key, label]) => ({
      key,
      label,
      icon: getAmenityIcon(key), // Función que asigna íconos
    }));

  // Función que asigna íconos de FontAwesome a cada amenidad
  function getAmenityIcon(amenityKey) {
    const iconMap = {
      aire_acondicionado: faSnowflake,
      alberca: faWaterLadder,
      amueblada: faCouch,
      area_de_juegos: faGamepad,
      areas_comunes: faPeopleGroup,
      areas_ninos: faChild,
      balcon: faDoorOpen,
      biblioteca: faBook,
      bodega: faBoxArchive,
      cafeteria: faMugHot,
      calefaccion: faTemperatureHigh,
      cancha_de_futbol: faFutbol,
      cancha_de_padel: faTableTennisPaddleBall,
      cancha_de_tenis: faTableTennisPaddleBall, // Usa el mismo ícono si no hay otro
      casa_club: faHouseChimney,
      chimenea: faFire,
      cocina_integral: faKitchenSet,
      cuarto_de_recreacion: faChess,
      cuarto_de_servicio: faBroom,
      cuarto_tv: faTv,
      elevador: faElevator,
      energia_solar: faSolarPanel,
      gimnasio: faDumbbell,
      hidroneumatico: faWater,
      internet: faWifi,
      jacuzzi: faHotTubPerson,
      jardin: faLeaf,
      lavanderia: faSoap,
      linea_telefonica: faPhone,
      mascotas: faPaw,
      parrilla: faFireBurner,
      salon_de_cine: faFilm,
      salon_de_fiestas: faChampagneGlasses,
      spa: faSpa,
      sistema_de_seguridad: faShieldHalved,
      terraza: faUmbrellaBeach,
      vestidor: faShirt,
      vigilancia: faLock,
      vista_panoramica: faMountainSun,
      zona_arbolada: faTree,
    };

    return iconMap[amenityKey] || "fa-solid fa-check"; // Ícono por defecto
  }

  // Resultado final (array de objetos con label e icono)
  console.log(amenidadesDisponibles);
  return (
    <>
      <Accordion open={openAcc1} icon={<Icon id={1} open={openAcc1} />}>
        <AccordionHeader onClick={handleOpenAcc1}>
          <p className="font-bold text-[18px] lg:text-3xl">
            Descripción del inmueble
          </p>
        </AccordionHeader>
        <AccordionBody>
          <p className="text-base lg:text-2xl">{cleanDescription}</p>
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
              <p className="font-bold ">{tipoPropiedad}</p>
            </div>
            <div className="flex justify-between">
              <p className="">Estacionamiento</p>
              <p className="font-bold ">{estacionamiento}</p>
            </div>
            <div className="flex justify-between">
              <p className="">Construcción</p>
              <p className="font-bold ">{construccion} m²</p>
            </div>
            <div className="flex justify-between">
              <p className="">Baños</p>
              <p className="font-bold ">{banos}</p>
            </div>
            <div className="flex justify-between">
              <p className="">Edad de Propiedad</p>
              <p className="font-bold ">{edadPropiedad} años</p>
            </div>
            <div className="flex justify-between">
              <p className="">Uso de Suelo</p>
              <p className="font-bold ">{usoDeSuelo}</p>
            </div>
            <div className="flex justify-between">
              <p className="">Niveles/Piso</p>
              <p className="font-bold ">{nivelPiso}</p>
            </div>
            <div className="flex justify-between">
              <p className="">Mantenimiento</p>
              <p className="font-bold ">${mantenimiento} MXN</p>
            </div>
          </div>
        </AccordionBody>
      </Accordion>
      <Accordion open={openAcc3} icon={<Icon id={3} open={open} />}>
        <AccordionHeader onClick={handleOpenAcc3}>
          <p className="font-bold text-[18px] lg:text-3xl">Ubicación</p>
        </AccordionHeader>
        <AccordionBody>
          <p className="text-base lg:text-2xl">{direccion}, México</p>
          <br />
          <div className="w-full flex flex-col lg:flex-row gap-4">
            {/* Mapa */}
            <div className="w-full h-[400px] relative">
              <div
                ref={mapContainerRef}
                style={{ width: "100%", height: "100%" }}
                className="rounded-xl overflow-hidden"
              />
            </div>
          </div>
        </AccordionBody>
      </Accordion>
      <Accordion open={openAcc4} icon={<Icon id={4} open={open} />}>
        <AccordionHeader onClick={handleOpenAcc4}>
          <p className="font-bold text-[18px] lg:text-3xl">Amenidades</p>
        </AccordionHeader>
        <AccordionBody>
          <div className="flex flex-wrap gap-2">
            {amenidadesDisponibles &&
              amenidadesDisponibles.map((item) => (
                <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2 px-2 text-2xl">
                  <FontAwesomeIcon icon={item.icon} className="text-[#797979]"/>
                  <p className="text-[#797979]">{item.label}</p>
                </div>
              ))}

            {/*   <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2 px-2 text-2xl">
              <FontAwesomeIcon
                icon={faPersonSwimming}
                className="text-[#797979]"
              />
              <p className="text-[#797979]">Alberca</p>
            </div>

            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2 px-2 text-2xl">
              <FontAwesomeIcon icon={faElevator} className="text-[#797979]" />
              <p className="text-[#797979]">Elevador</p>
            </div>

            <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2 px-2 text-2xl col-span-3">
              <FontAwesomeIcon icon={faUserShield} className="text-[#797979]" />
              <p className="text-[#797979]">Caseta de Vigilancia</p>
            </div> */}
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
          <div className="flex flex-wrap gap-2">
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
