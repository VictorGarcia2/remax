import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Mapbox from "./Mapbox";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  selectedOptionsTipos, selectedOptionsOperacion
}) {
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

  const goToPrevious = (index) => {
    const propiedadId = propiedadesVisibles[index].propiedad_id;
    const totalImages = propiedadesVisibles[index].imagenes.split(",").length;
    currentImageIndices.current[propiedadId] =
      ((currentImageIndices.current[propiedadId] || 0) - 1 + totalImages) %
      totalImages;
    forceUpdate();
  };

  /* const seleccionPropiedad = (e) => {
    setSeleccion(e.target.id)
    console.log("Propiedad seleccionada:", e.target.id);
  }; */
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 justify-center items-start">
      <div className="overflow-y-scroll h-[700px] relative">
        <div className="grid grid-cols-1 xl:grid-cols-2 justify-center md:gap-3 items-center md:px-8">
          {propiedadesVisibles && propiedadesVisibles.length > 0 ? (
            propiedadesVisibles.map((item, index) => {
              const currentIndex =
                currentImageIndices.current[item.propiedad_id] || 0;
              const imagenesArray = item.imagenes.split(",");

              return (
                <div
                  key={item.propiedad_id}
                  className="w-full flex flex-col mt-16 mb-8 justify-center items-center"
                >
                  {/* Flechas */}
                  <div className="flex absolute justify-around mx-auto gap-60">
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
                  <p className="z-40 mt-4 absolute bg-black/40 rounded-full p-1 text-white text-sm">
                    {currentIndex + 1}/{imagenesArray.length}
                  </p>

                  {/* Info propiedad */}
                  <Link
                    id={item.propiedad_id}
                    onClick={() => setSeleccion(item.propiedad_id)} // No es necesario para la ruta, pero si necesitas almacenar el ID, lo mantienes
                    to={`/propiedades/seleccion/${item.propiedad_id}`} // Usa directamente item.propiedad_id
                    className="w-[280px] bg-white h-28 absolute mt-[260px] rounded-2xl shadow flex flex-col items-center pt-2 font-display"
                  >
                    <p className="text-base font-bold text-[#7B7B7B]">
                      {Number(item.mxn_corriente).toLocaleString("en-US")}MXN
                    </p>
                    <p className="text-base px-2 text-center font-[500] text-[#7B7B7B]">
                      {item.calle}
                    </p>
                    <div className="flex text-[#7B7B7B] font-[500] text-[15px]">
                      <p>{item.tipos?.tipo_nombre || "Tipo"} | </p>
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
                    <div
                     /*  href={`https://wa.me/${
                        item.telefono_agente || "52XXXXXXXXXX"
                      }`} */
                      /* target="_blank" */
                      rel="noopener noreferrer"
                      className="bg-blue-800 rounded-2xl w-[73px] h-[29px] shadow-2xs py-1 flex items-center justify-center mt-2"
                    >
                      <img
                        loading="lazy"
                        src="HomePageContent/brand-whatsapp 1.svg"
                        alt="WhatsApp"
                      />
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="mt-[70px] mx-10 w-[800px] px-9 flex flex-col justify-center items-center">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="text-[#7b7b7b]"
                size="2xl"
              />
              <p className="text-2xl text-[#7b7b7b] text-center">
                Estamos en busca de propiedades por aquí. ¡Vuelve pronto!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="mt-0">
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
