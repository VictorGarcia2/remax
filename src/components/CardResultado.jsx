import React, { useState } from "react";
export default function CardResultado({ propiedades }) {
  const [countimg, setcountimg] = useState();
  const [currentIndexes, setCurrentIndexes] = useState(
    propiedades.map(() => 0)
  );
  const goToPrevious = (index) => {
    const isFirstImage = currentIndexes[index] === 0;
    const newIndex = isFirstImage
      ? propiedades[index].gallery.length - 1
      : currentIndexes[index] - 1;
    setcountimg(newIndex + 1);
    setCurrentIndexes((prevIndexes) =>
      prevIndexes.map((item, idx) => (idx === index ? newIndex : item))
    );
  };
  const goToNext = (index) => {
    const isLastImage =
      currentIndexes[index] === propiedades[index].gallery.length - 1;
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
            key={item.id}
            className="w-full flex flex-col mt-6 mb-30 justify-center items-center"
          >
            <div className="flex absolute justify-around mx-auto gap-70">
              <img
                onClick={() => goToPrevious(index)}
                src="HomePageContent/arrowizq.svg"
                alt=""
              />
              <img
                onClick={() => goToNext(index)}
                src="HomePageContent/arrowderecha.svg"
                alt=""
              />
            </div>
            <div className="flex">
              <img
                className="w-[353px] h-[198px] rounded-2xl"
                src={item.gallery[currentIndexes[index]]}
                alt=""
              />
            </div>
            <p className=" z-50 mt-19 absolute bg-black/40 rounded-full p-1 text-white text-sm  ">
              {countimg}/{propiedades.length}
            </p>
            <div className="w-60 bg-white h-28 absolute mt-56 rounded-2xl shadow flex flex-col items-center pt-2 font-display">
              <p className="text-base font-bold text-[#7B7B7B]">
                {item.precio}
              </p>
              <p className="text-base font-[300] text-[#7B7B7B]">
                {item.ubicacion}
              </p>
              <div className="flex text-[#7B7B7B] text-[15px]">
                <p>{item.tipoPropiedad} | </p>
                <p>{item.tipoOperacion}| </p>
                <p>{item.metrosCuadrados}</p>
              </div>
              <button className="bg-blue-800 rounded-2xl w-[73px] h-[29px] shadow-2xs py-1 flex items-center justify-center ">
                {" "}
                <img
                  src="HomePageContent/brand-whatsapp 1.svg"
                  alt=""
                />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
