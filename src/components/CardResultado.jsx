import React, { useState } from "react";
import { Link } from "react-router";
export default function CardResultado({ propiedades }) {
  console.log(propiedades);
  const [countimg, setcountimg] = useState(1);
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
  return (
    <div className="flex flex-col justify-center items-center">
      {propiedades &&
        propiedades.map((item, index) => (
          <div
            key={index}
            className="w-full flex flex-col mt-6 mb-30 justify-center items-center"
          >
            <div className="flex absolute justify-around mx-auto gap-70">
              <img
                loading="lazy"
                onClick={() => goToPrevious(index)}
                src="HomePageContent/arrowizq.svg"
                alt=""
              />
              <img
                loading="lazy"
                onClick={() => goToNext(index)}
                src="HomePageContent/arrowderecha.svg"
                alt=""
              />
            </div>
            <div className="flex">
              <img
                loading="lazy"
                className="w-[353px] h-[198px] rounded-2xl"
                src={item.imagenes[currentIndexes[index]]}
                alt=""
              />
            </div>
            <p className=" z-40 mt-19 absolute bg-black/40 rounded-full p-1 text-white text-sm  ">
              {countimg}/{propiedades.length}
            </p>

            <Link
              to={"/seleccion"}
              className="w-60 bg-white h-28 absolute mt-56 rounded-2xl shadow flex flex-col items-center pt-2 font-display"
            >
              <p className="text-base font-bold text-[#7B7B7B]">
                {item.precio.toLocaleString("es-MX")}MXN
              </p>
              <p className="text-base  px-2 text-center font-[500] text-[#7B7B7B]">
                {item.direccion}
              </p>
              <div className="flex text-[#7B7B7B] font-[500] text-[15px]">
                <p>{item.tipoPropiedad} | </p>
                <p>{item.tipoTransaccion}| </p>
                <p>{item.metrosCuadrados}m2</p>
              </div>
              <button className="bg-blue-800 rounded-2xl w-[73px] h-[29px] shadow-2xs py-1 flex items-center justify-center ">
                {" "}
                <img loading="lazy" src="HomePageContent/brand-whatsapp 1.svg" alt="" />
              </button>
            </Link>
          </div>
        ))}
    </div>
  );
}
