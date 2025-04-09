import React, { useEffect, useState } from "react";
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
}) {

  const [countimg, setcountimg] = useState(1);

  useEffect(() => {
    if (selectedOptions.length === 0) {
      setPropiedadesVisibles(propiedades);
    } else {
      const filtered = propiedades.filter((item) => {
        return selectedOptions.some(
          (option) => item.tipos.tipo_nombre === option
        );
      });
      setPropiedadesVisibles(filtered);
    }
  }, [selectedOptions, propiedades]);

  const [currentIndexes, setCurrentIndexes] = useState(
    propiedades.map(() => 0)
  );
  const goToPrevious = (index) => {
    const isFirstImage = currentIndexes[index] === 0;
    const newIndex = isFirstImage
      ? propiedades[index].imagenes.length - 1
      : currentIndexes[index] - 1;
    setcountimg(newIndex + 1);
    setCurrentIndexes((prevIndexes) =>
      prevIndexes.map((item, idx) => (idx === index ? newIndex : item))
    );
  };
  const goToNext = (index) => {
    const isLastImage =
      currentIndexes[index] === propiedades[index].imagenes.length - 1;
    const newIndex = isLastImage ? 0 : currentIndexes[index] + 1;
    setcountimg(newIndex + 1);
    setCurrentIndexes((prevIndexes) =>
      prevIndexes.map((item, idx) => (idx === index ? newIndex : item))
    );
  };

  const seleccionPropiedad = (e) =>{
    console.log(e.target.id)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 justify-center items-start">
      <div className="overflow-y-scroll h-[700px] relative">
        <div className="grid grid-cols-1  xl:grid-cols-2 justify-center md:gap-3 items-center md:px-8">
          {propiedadesVisibles && propiedadesVisibles.length > 0 ? (
            propiedadesVisibles.map((item, index) => (
              <div
                key={index}
                className="w-full flex flex-col mt-6 mb-30 justify-center items-center"
              >
                <div className="flex absolute justify-around mx-auto gap-60">
                  <img
                    loading="lazy"
                    onClick={() => goToPrevious(index)}
                    src="HomePageContent/arrowizq.svg"
                    alt=""
                    className="cursor-pointer"
                  />
                  <img
                    loading="lazy"
                    onClick={() => goToNext(index)}
                    src="HomePageContent/arrowderecha.svg"
                    alt=""
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex">
                  <img
                    loading="lazy"
                    className="w-[353px] h-[198px] object-cover rounded-2xl"
                    src={`https://cdn.remax.com.mx/properties/${
                      item.propiedad_id
                    }/${item.imagenes.split(",")[0]}`}
                    alt=""
                  />
                </div>
                <p className="z-40 mt-19 absolute bg-black/40 rounded-full p-1 text-white text-sm">
                  {countimg}/{item.imagenes.length}
                </p>

                <Link
                  id={item.propiedad_id}
                  onClick={seleccionPropiedad}
                 /*  to={"/seleccion"} */
                  className="w-70 bg-white h-28 absolute mt-65 rounded-2xl shadow flex flex-col items-center pt-2 font-display"
                >
                  <p className="text-base font-bold text-[#7B7B7B]">
                    {item.mxn_corriente.toLocaleString("es-MX")}MXN
                  </p>
                  <p className="text-base px-2 text-center font-[500] text-[#7B7B7B]">
                    {item.calle}
                  </p>
                  <div className="flex text-[#7B7B7B] font-[500] text-[15px]">
                    <p>{item.tipos.tipo_nombre} | </p>{item.operacion === "1" ? (<p>Venta |</p>) : item.operacion === "2" ? (<p>Renta | </p>) : null}<p>{item.m2_construccion}m2</p>
                  </div>
                  <button className="bg-blue-800 rounded-2xl w-[73px] h-[29px] shadow-2xs py-1 flex items-center justify-center">
                    <img
                      loading="lazy"
                      src="HomePageContent/brand-whatsapp 1.svg"
                      alt=""
                    />
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div className=" mt-70 mx-10 w-[800px] px-9 flex flex-col justify-center items-center ">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="text-[#7b7b7b] "
                size="2xl"
              />
              <p className="text-2xl text-[#7b7b7b] text-center">
                Estamos en busca de propiedades por aquí. ¡Vuelve pronto!
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-0">
        <Mapbox
          propiedades={propiedades}
          setBusqueda={setBusqueda}
          busqueda={busqueda}
          manejoBusqueda={manejoBusqueda}
          setPropiedadesVisibles={setPropiedadesVisibles}
          propiedadesVisibles={propiedadesVisibles}
          setAutoCompleteHome={setAutoCompleteHome}
          busquedaHome={busquedaHome}
        />
      </div>
    </div>
  );
}
