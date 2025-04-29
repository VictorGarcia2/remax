import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Mapbox from "./Mapbox";
import {
  faCircleExclamation,
  faList,
  faMap,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Share2 } from "lucide-react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
export default function CardResultado({
  propiedades,
  setBusqueda,
  busqueda,
  manejoBusqueda,
  setPropiedadesVisibles,
  propiedadesVisibles,
  selectedOptions,
  setAutoCompleteHome,
  busquedaHome,
  setSelectedOptions,
  nuevas,
  setNuevas,
  precioMinimo,
  setPrecioMinimo,
  setPrecioMaximo,
  precioMaximo,
  aplicarFiltros,
  setSeleccion,
  seleccion,
  selectedOptionsTipos,
  selectedOptionsOperacion,
}) {
  console.log(seleccion);
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const currentImageIndices = useRef({});
  const goToNext = (index) => {
    const propiedadId = propiedadesVisibles[index].propiedad_id;
    const totalImages = propiedadesVisibles[index].imagenes.split(",").length;
    currentImageIndices.current[propiedadId] =
      ((currentImageIndices.current[propiedadId] || 0) + 1) % totalImages;
    forceUpdate();
  };
  const [mapa, setMapa] = useState(false);
  const goToPrevious = (index) => {
    const propiedadId = propiedadesVisibles[index].propiedad_id;
    const totalImages = propiedadesVisibles[index].imagenes.split(",").length;
    currentImageIndices.current[propiedadId] =
      ((currentImageIndices.current[propiedadId] || 0) - 1 + totalImages) %
      totalImages;
    forceUpdate();
  };
  function truncateByCharacters(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  const [mostrarMapa, setMostrarMapa] = useState();
  const mostrar = [
    {
      icon: "faList",
      nombre: "Lista",
    },
    {
      icon: "faMap",
      nombre: "Mapa",
    },
  ];
  const [shareModalOpen, setShareModalOpen] = useState(true);
  const handle = () => {
    setMapa((prevState) => !prevState);
  };
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 justify-center  items-start">
      <div
        className={`${
          shareModalOpen && "invisible"
        } flex flex-col justify-center items-center fixed z-50 w-full h-full top-0 bg-white/70`}
      >
        <div className="min-h-screen  flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
            <div className="text-end   ">
              <FontAwesomeIcon icon={faXmark}  size="2xl" className="cursor-pointer"  onClick={()=> setShareModalOpen(true)}/>
            </div>
              <div className="flex justify-center">
                <img
                  className="max-w-[200px]"
                  src="/logos/New_RMX_Mark_R4_RGB_dark.png"
                  alt=""
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Envianos mensaje por WhatsApp
              </h1>
              <p className="text-gray-600">
                Si estas interesado en esta propiedad, envíanos un mensaje
              </p>
            </div>

            <div className="flex justify-center">
              <button
                className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 bg-blueRemax text-white rounded-lg shadow-sm hover:bg-blueRemax/80 transition-colors duration-200"
                aria-label="Contactar por WhatsApp"
                onClick={() => {
                  const mensaje = `Estoy interesado en esta propiedad: ${window.location.origin}/propiedades/seleccion/${seleccion}`;
                  const whatsappLink = `https://wa.me/521234567890?text=${encodeURIComponent(
                    mensaje
                  )}`;
                  window.open(whatsappLink, "_blank");
                }}
              >
                <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                <span className="text-sm sm:text-base md:text-lg">
                  Contactar por WhatsApp
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed lg:invisible z-40 flex bottom-10 left-30 w-full">
        <button
          onClick={() => {
            handle();
            setMostrarMapa((prevState) => (prevState === 0 ? 1 : 0));
          }}
          type="button"
          className="inline-flex mx-auto gap-2 bg-gray-900  items-center px-4 py-2 text-sm font-medium text-white border-gray-900 rounded-3xl hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-redRemax/50 focus:bg-redRemax focus:text-white"
        >
          <FontAwesomeIcon icon={mostrarMapa === 0 ? faList : faMap} />
          {mostrarMapa === 0 ? mostrar[0].nombre : mostrar[1].nombre}
        </button>
      </div>
      <div
        className={`${
          mapa && "hidden"
        } overflow-y-scroll h-[660px] lg:h-[700px] relative`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 justify-center md:gap-3 pb-22 items-center md:px-8 relative">
          {propiedadesVisibles && propiedadesVisibles.length > 0 ? (
            propiedadesVisibles.map((item, index) => {
              const currentIndex =
                currentImageIndices.current[item.propiedad_id] || 0;
              const imagenesArray = item.imagenes.split(",");
              return (
                <div
                  key={item.propiedad_id}
                  className="w-full flex flex-col mt-5  mb-30 lg:mb-20 justify-center items-center"
                >
                  {/* Flechas */}
                  <div className="flex absolute justify-around mx-auto gap-70 xl:gap-40 2xl:gap-50 ">
                    <img
                      loading="lazy"
                      onClick={() => goToPrevious(index)}
                      src="/HomePageContent/arrowizq.svg"
                      alt="Anterior"
                      className="cursor-pointer"
                    />
                    <img
                      loading="lazy"
                      onClick={() => goToNext(index)}
                      src="/HomePageContent/arrowderecha.svg"
                      alt="Siguiente"
                      className="cursor-pointer"
                    />
                  </div>

                  {/* Imagen actual */}
                  <div className="flex">
                    <img
                      loading="lazy"
                      className="w-[353px] h-[198px] object-cover rounded-2xl"
                      src={`https://cdn.remax.com.mx/properties/${item.propiedad_id}/${imagenesArray[currentIndex]}`}
                      alt={`Imagen ${currentIndex + 1}`}
                    />
                  </div>

                  {/* Paginación */}
                  <p className="z-40 mt-27 absolute bg-black/40 rounded-full p-1 text-white text-sm">
                    {currentIndex + 1}/{imagenesArray.length}
                  </p>

                  {/* Info propiedad */}
                  <div className="2xl:w-[280px] bg-white h-28 absolute mt-[260px] rounded-2xl shadow flex flex-col items-center pt-2 font-display">
                    <Link
                      id={item.propiedad_id}
                      onClick={() => setSeleccion(item.propiedad_id)} // No es necesario para la ruta, pero si necesitas almacenar el ID, lo mantienes
                      to={`/propiedades/seleccion/${item.propiedad_id}`} // Usa directamente item.propiedad_id
                      className=" text-center "
                    >
                      <p className="text-base font-bold text-[#7B7B7B]">
                        {Number(item.mxn_corriente).toLocaleString("en-US")}MXN
                      </p>
                      <p className="text-base px-2 text-center w-[250px] font-[500] text-[#7B7B7B]">
                        {truncateByCharacters(item.calle, 20)}
                      </p>
                      <div className="flex text-[#7B7B7B] font-[500] text-[15px]">
                        <p>
                          {truncateByCharacters(
                            item.tipos?.tipo_nombre,
                            15 || "Tipo"
                          )}{" "}
                          |{" "}
                        </p>
                        <p>
                          {item.operacion === "1"
                            ? "Venta"
                            : item.operacion === "2"
                            ? "Renta"
                            : "N/A"}{" "}
                          |
                        </p>
                        <p>{item.m2_construccion}m²</p>
                      </div>
                    </Link>
                    <div
                      onClick={() => {
                        setShareModalOpen(false);
                        setSeleccion(item.propiedad_id);
                      }}
                      rel="noopener noreferrer"
                      className="bg-blue-800 rounded-2xl w-[73px] h-[29px] shadow-2xs py-1 flex items-center justify-center cursor-pointer mt-4 z-40"
                    >
                      <img
                        loading="lazy"
                        src="HomePageContent/brand-whatsapp 1.svg"
                        alt="WhatsApp"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="mt-[70px] h-full   mx-auto my-auto w-full px-9 flex flex-col absolute ">
              <div className="items-center my-55 flex flex-col justify-center">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="text-[#7b7b7b]"
                  size="2xl"
                />
                <p className="text-2xl text-[#7b7b7b] text-center">
                  Estamos en busca de propiedades por aquí. ¡Vuelve pronto!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mapa */}
      <div className={`${mapa ? "" : "invisible"} mt-0 xl:visible`}>
        <Mapbox
          selectedOptionsOperacion={selectedOptionsOperacion}
          aplicarFiltros={aplicarFiltros}
          precioMaximo={precioMaximo}
          setPrecioMaximo={setPrecioMaximo}
          precioMinimo={precioMinimo}
          setPrecioMinimo={setPrecioMinimo}
          setNuevas={setNuevas}
          nuevas={nuevas}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
          propiedades={propiedades}
          setBusqueda={setBusqueda}
          busqueda={busqueda}
          manejoBusqueda={manejoBusqueda}
          setPropiedadesVisibles={setPropiedadesVisibles}
          propiedadesVisibles={propiedadesVisibles}
          setAutoCompleteHome={setAutoCompleteHome}
          busquedaHome={busquedaHome}
          selectedOptionsTipos={selectedOptionsTipos}
        />
      </div>
    </div>
  );
}
