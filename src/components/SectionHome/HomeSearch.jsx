import React, { useEffect, useState } from "react";
import Header from "./Header";
import Search from "./Search";

export default function HomeSearch({
  busquedaHome,
  setBusquedaHome,
  autoCompleteHome,
  setAutoCompleteHome,
  setBusqueda,
  setSelectedOptionsTipos,
  setSelectedOptionsOperacion,
  valor,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null); // se inicializa vacío
  const imagesByValor = {
    comercial: [
      "/HomePageContent/comercial/comercial1.webp",
      "/HomePageContent/comercial/comercial2.webp",
      "/HomePageContent/comercial/comercial3.webp",
    ],
    residencial: [
      "/HomePageContent/residencial/residencial (1).webp",
      "/HomePageContent/residencial/residencial (2).webp",
      "/HomePageContent/residencial/residencial (3).webp",
      "/HomePageContent/residencial/residencial (4).webp",
    ],
  };

  const images = imagesByValor[valor] || [
    "/HomePageContent/comercial/comercial1.webp",
    "/HomePageContent/comercial/comercial2.webp",
  ];

  // Control de slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  // Sincronizar selectedKey desde localStorage o prop valor
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedKey");
      setSelectedKey(stored || valor);
    }
  }, [valor]);

  // Guardar en localStorage cada vez que selectedKey cambia
  useEffect(() => {
    if (selectedKey) {
      localStorage.setItem("selectedKey", selectedKey);
    }
  }, [selectedKey]);

  const content = [
    {
      key: "comercial",
      tittle: (
        <>
          Tu Hogar Ideal: Espacios que Encuentran Estilo,
          <span className="font-extrabold italic">
            {" "}
            Comodidad y Oportunidad{" "}
          </span>
        </>
      ),
      description:
        "Encuentra propiedades residenciales únicas: hogares acogedores, modernos departamentos. Ya sea para vivir, invertir o disfrutar, te ayudamos a vender o encontrar tu próximo refugio ideal.",
    },
    {
      key: "residencial",
      tittle: (
        <>
          Bienes Raíces{" "}
          <span className="font-extrabold italic"> Residenciales: </span> Tu
          Espacio, tu <span className="font-extrabold italic"> Estilo </span>{" "}
          para <span className="font-extrabold italic"> Cada </span> Necesidad
        </>
      ),
      description:
        "Descubre propiedades residenciales únicas: desde acogedores hogares y modernos departamentos hasta exclusivas fincas y ranchos. Encuentra el espacio perfecto para vivir, invertir o disfrutar de la tranquilidad. ¡Tu próximo hogar o refugio ideal te espera!",
    },
  ];

  const selectedContent =
    content.find((item) => item.key === selectedKey) || content[0];

  return (
    <div className="w-full mt-18">
      <div className="w-full absolute z-10">
        <Header setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
        <div className="text-center w-[336px] 2xl:mt-48 font-display flex flex-col justify-content-center items-center text-white mx-auto mt-16 sm:mt-20">
          <p className="text-2xl sm:text-3xl sm:w-[730px] md:text-4xl lg:w-[730px]">
            {selectedContent.tittle}
          </p>
          <p className="text-[1rem] sm:text-4xl sm:w-[740px] md:text-3xl mt-7">
            {selectedContent.description}
          </p>
          <Search
            setSelectedOptionsOperacion={setSelectedOptionsOperacion}
            setSelectedOptionsTipos={setSelectedOptionsTipos}
            data={data}
            setData={setData}
            setBusqueda={setBusqueda}
            busquedaHome={busquedaHome}
            setBusquedaHome={setBusquedaHome}
            autoCompleteHome={autoCompleteHome}
            setAutoCompleteHome={setAutoCompleteHome}
          />
        </div>
      </div>
      <div className="h-[536px] sm:h-[680px] 2xl:h-[900px] w-full absolute z-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <img
        className="object-cover h-[536px] w-full sm:h-[680px] 2xl:h-[900px]"
        src={images[currentIndex]}
        alt="Imagen de fondo"
      />
    </div>
  );
}
