import React, { useEffect, useState } from "react";
import Header from "./Header";
import Search from "./Search";
import { getConsults } from "../../APi/APICall";


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
    "HomePageContent/diapo1.webp",
    "HomePageContent/diapo2.webp",
    
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);
  return (
    <>
      <div className="w-full mt-18">
        <div className="w-full absolute z-10 ">
          <Header />
          <div className="text-center w-[336px] 2xl:mt-48 font-display flex flex-col justify-content-center items-center text-white mx-auto mt-16 sm:mt-20">
            <p className="text-2xl sm:text-3xl sm:w-[730px] md:text-4xl lg:w-[730px] ">
            Tu Hogar Ideal: Espacios que Encuentran Estilo, 
              <span className="font-extrabold italic"> Comodidad y Oportunidad </span>
            </p>
            <p className="text-[1rem] sm:text-4xl sm:w-[740px] md:text-3xl mt-7">
            Encuentra propiedades residenciales únicas: hogares acogedores, modernos departamentos. Ya sea para vivir, invertir o disfrutar, te ayudamos a vender o encontrar tu próximo refugio ideal.
            </p>
            <Search data={data} setData={setData}/>
          </div>
        </div>
        <div className="h-[536px] sm:h-[680px] 2xl:h-[900px] w-full absolute z-0 bg-linear-180 from-black/60 to-100%"></div>
        <img
          loading="lazy"
          className={` object-cover h-[536px] w-full sm:h-[680px] 2xl:h-[900px] `}
          src={images[currentIndex]}
          alt=""
        />
      </div>
    </>
  );
}
