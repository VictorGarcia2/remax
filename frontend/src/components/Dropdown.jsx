import React, { useEffect, useRef } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useState } from "react";
// import mapboxgl from "mapbox-gl"; // Eliminamos la importación estática
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
// mapboxgl.accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

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
  const [mapboxglInstance, setMapboxglInstance] = useState(null); // Nuevo estado para la instancia de mapboxgl
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
  
  const DescripcionInmueble = ({ descripcion }) => {
    const cleanDescription = removeHTMLTags(descripcion);
  
    // Separar por asteriscos (posibles subtítulos o secciones)
    const secciones = cleanDescription.split('*').filter(Boolean);
  
    return (
      <div className="space-y-4 text-gray-800  leading-relaxed">
        {secciones.map((seccion, index) => {
          // Si hay guiones, convertirlos en lista
          const partes = seccion.split('-').filter(Boolean);
  
          if (partes.length > 1) {
            const titulo = partes[0].trim();
            const items = partes.slice(1);
  
            return (
              <div key={index}>
                <p className="font-bold text-base lg:text-2xl text-[#7b7b7b]">{titulo}</p>
                <ul className="list-disc list-inside ml-4 text-base lg:text-2xl text-[#7b7b7b]">
                  {items.map((item, i) => (
                    <li key={i}>{item.trim()}</li>
                  ))}
                </ul>
              </div>
            );
          }
  
          // Si no hay guiones, renderizar como párrafo normal
          return (
            <p key={index} className="text-justify text-base lg:text-2xl text-[#7b7b7b]">
              {seccion.trim()}
            </p>
          );
        })}
      </div>
    );
  };
  
  const latitud = propiedadSeleccion?.latitud;
  const longitud = propiedadSeleccion?.longitud;

  useEffect(() => {
    if (mapIsReady && mapRef.current && latitud && longitud && mapboxglInstance) {
      new mapboxglInstance.Marker({ color: "#e63946" })
        .setLngLat([longitud, latitud])
        .addTo(mapRef.current);
      mapRef.current.setCenter([longitud, latitud]);
    }
  }, [mapIsReady, latitud, longitud, mapboxglInstance]);

  // Efecto para cargar dinámicamente la librería mapboxgl
  useEffect(() => {
    import('mapbox-gl').then((module) => {
      const loadedMapboxgl = module.default;
      loadedMapboxgl.accessToken = "pk.eyJ1IjoidmljdG9yZ2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";
      setMapboxglInstance(loadedMapboxgl);
    });
  }, []); // Se ejecuta solo una vez para cargar la librería

  // Efecto para inicializar el mapa una vez que mapboxglInstance y el contenedor estén listos
  useEffect(() => {
    if (!mapContainerRef.current || !mapboxglInstance) return;
    if (mapRef.current) return; // Evitar la reinicialización si el mapa ya existe

    mapRef.current = new mapboxglInstance.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-96.135744, 19.172264], // Veracruz
      zoom: 13,
    });
    mapRef.current.addControl(new mapboxglInstance.NavigationControl());
    mapRef.current.on("load", () => {
      mapLoadedRef.current = true;
      setMapIsReady(true);
    });
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [mapboxglInstance]); // Depende de mapboxglInstance para ejecutarse cuando esté cargado

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
  
  return (
    <>
      <Accordion open={openAcc1} icon={<Icon id={1} open={openAcc1} />}>
        <AccordionHeader onClick={handleOpenAcc1}>
          <p className="font-bold text-[18px] lg:text-3xl">
            Descripción del inmueble
          </p>
        </AccordionHeader>
        <AccordionBody>
        <DescripcionInmueble descripcion={propiedadSeleccion?.propiedades_meta.descripcion}/>
        </AccordionBody>
      </Accordion>
      <Accordion open={openAcc2} icon={<Icon id={2} open={open} />}>
        <AccordionHeader onClick={handleOpenAcc2}>
          <p className="font-bold text-lg lg:text-3xl">
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
          <p className="font-bold text-[18px] lg:text-3xl">Amenidades y Zonas</p>
        </AccordionHeader>
        <AccordionBody>
          <div className="flex flex-wrap gap-2">
            {amenidadesDisponibles &&
              amenidadesDisponibles.map((item) => (
                <div className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2 px-2 text-base lg:text-2xl">
                  <FontAwesomeIcon icon={item.icon} className="text-[#797979]"/>
                  <p className="text-[#797979]">{item.label}</p>
                </div>
              ))}
          </div>
        </AccordionBody>
      </Accordion>

    </>
  );
}
