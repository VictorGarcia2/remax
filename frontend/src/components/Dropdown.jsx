import React, { useEffect, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from '../config/googleMaps';
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useState } from "react";
import { 
  Snowflake, 
  Waves, 
  Sofa, 
  Gamepad2, 
  Users, 
  Baby, 
  DoorOpen, 
  Book, 
  Archive, 
  Coffee, 
  Thermometer, 
  Trophy, 
  Dumbbell, 
  Wifi, 
  Bath, 
  Leaf, 
  WashingMachine, 
  Phone, 
  PawPrint, 
  Flame, 
  Film, 
  Wine, 
  Flower2, 
  ShieldCheck, 
  Umbrella, 
  Shirt, 
  Lock, 
  Mountain, 
  TreeDeciduous, 
  Check, 
  Home,
  ChefHat,
  Tv,
  ArrowUpSquare,
  Sun,
  Timer
} from 'lucide-react';

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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
  
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);
  
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

  const mapCenter = latitud && longitud 
    ? { lat: parseFloat(latitud), lng: parseFloat(longitud) }
    : { lat: 19.172264, lng: -96.135744 }; // Veracruz por defecto

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
      aire_acondicionado: Snowflake,
      alberca: Waves,
      amueblada: Sofa,
      area_de_juegos: Gamepad2,
      areas_comunes: Users,
      areas_ninos: Baby,
      balcon: DoorOpen,
      biblioteca: Book,
      bodega: Archive,
      cafeteria: Coffee,
      calefaccion: Thermometer,
      cancha_de_futbol: Trophy,
      cancha_de_padel: Trophy,
      cancha_de_tenis: Trophy,
      casa_club: Home,
      chimenea: Flame,
      cocina_integral: ChefHat,
      cuarto_de_recreacion: Gamepad2,
      cuarto_de_servicio: WashingMachine,
      cuarto_tv: Tv,
      elevador: ArrowUpSquare,
      energia_solar: Sun,
      gimnasio: Dumbbell,
      hidroneumatico: Waves,
      internet: Wifi,
      jacuzzi: Bath,
      jardin: Leaf,
      lavanderia: WashingMachine,
      linea_telefonica: Phone,
      mascotas: PawPrint,
      parrilla: Flame,
      salon_de_cine: Film,
      salon_de_fiestas: Wine,
      spa: Flower2,
      sistema_de_seguridad: ShieldCheck,
      terraza: Umbrella,
      vestidor: Shirt,
      vigilancia: Lock,
      vista_panoramica: Mountain,
      zona_arbolada: TreeDeciduous,
    };

    return iconMap[amenityKey] || Check;
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
            {/* Mapa de Google */}
            <div className="w-full h-[400px] relative">
              {isLoaded && latitud && longitud ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCenter}
                  zoom={15}
                  onLoad={map => { mapRef.current = map; }}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                  }}
                >
                  <Marker position={mapCenter} />
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                  <p className="text-gray-500">Cargando mapa...</p>
                </div>
              )}
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
              amenidadesDisponibles.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.label} className="bg-[#D9D9D9] flex items-center gap-2 rounded py-2 px-2 text-base lg:text-2xl">
                    <IconComponent size={20} className="text-[#797979]"/>
                    <p className="text-[#797979]">{item.label}</p>
                  </div>
                );
              })}
          </div>
        </AccordionBody>
      </Accordion>

    </>
  );
}
