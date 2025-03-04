import React, { useEffect, useState } from "react";
import Header from "./Header"
import Search from "./Search";
/* import { Propiedades } from "../../APi/propiedades"; */

export default function HomeSearch() {
  const [currentIndex, setCurrentIndex] = useState(0);
   /* const [data, setData] = useState([])
   console.log(data)
  useEffect(() => {
    Propiedades()
      .then((response) => setData(response))
      .catch(error => console.error(error))
  }, [])
 */
  // Array de imágenes (reemplaza con tus propias URLs)
  const images = [
    "HomePageContent/pexels-binyaminmellish-186077 1.jpg",
    "HomePageContent/pexels-houzlook-3797991.jpg",
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      
    }, 5000); 
    return () => clearInterval(interval);
  }, [images.length ]);
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
          <Search/>
          </div>
        </div>
        <div className="h-[536px] w-full absolute z-0 bg-linear-180 from-black/60 to-100%"></div>
        <img
          className={` object-cover h-[536px] `} src={images[currentIndex]}
          alt=""
        />
      </div>
    </>
  );
}
