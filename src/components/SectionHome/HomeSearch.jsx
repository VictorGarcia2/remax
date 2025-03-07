import React, { useEffect, useState } from "react";
import Header from "./Header";
import Search from "./Search";


export default function HomeSearch() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([])
  useEffect(() => {
    fetch('src/APi/propiedades.json')
    .then( response => response.json() )
    .then( datos => {
        setData(datos)
    });
  }, [])
  const images = [
    "HomePageContent/pexels-binyaminmellish-186077 1.jpg",
    "HomePageContent/pexels-houzlook-3797991.jpg",
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);
  return (
    <>
      <div className="w-full">
        <div className="w-full absolute z-10 ">
          <Header />
          <div className="text-center w-[336px] font-display text-2xl text-white mx-auto mt-16">
            <p>
              Bienes Raíces Residenciales:{" "}
              <span className="font-extrabold italic"> Tu Espacio </span> , tu
              Estilo para Cada
              <span className="font-extrabold italic"> Necesidad </span>
            </p>
            <p className="text-[1rem]">
              Descubre propiedades residenciales únicas: desde acogedores
              hogares y modernos departamentos hasta exclusivas fincas y
              ranchos. Encuentra el espacio perfecto para vivir, invertir o
              disfrutar de la tranquilidad. ¡Tu próximo hogar o refugio ideal te
              espera!
            </p>
            <Search data={data} setData={setData}/>
          </div>
        </div>
        <div className="h-[536px] w-full absolute z-0 bg-linear-180 from-black/60 to-100%"></div>
        <img
          loading="lazy"
          className={` object-cover h-[536px] `}
          src={images[currentIndex]}
          alt=""
        />
      </div>
    </>
  );
}
