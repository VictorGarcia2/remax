import React, { useEffect, useState } from "react";
import SectionFooter from "../../components/SectionFooter/SectionFooter.jsx";
import HeaderPropiedadSeleccion from "./HeaderPropiedadSeleccion.jsx";
import { Dropdown } from "../../components/Dropdown.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faX } from "@fortawesome/free-solid-svg-icons";
import Paginacion from "../../components/Pagination.jsx";
import axios from "axios";
export default function PropiedadSeleccion() {
  const [propiedades, setPropiedades] = useState([]);
  console.log(propiedades[0]);
  const [fotoEscogida, setFotoEscogida] = useState();
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState();
  const countPage = propiedades.length;
  useEffect(() => {
    if (propiedades[pagina]) {
      const resultado = propiedades[pagina - 1].image + 1;
      // Imprime la imagen en esa posición
      setFotoEscogida(resultado);
    } else {
      console.log("No existe una propiedad en esa página.");
    }
    setTotalPaginas(countPage);
  }, [pagina]);
  const imagenes = [
    {
      alt: "Libro sobre mesa",
      image:
        "https://images.unsplash.com/photo-1743076851851-0762b336b56d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      alt: "Ciudad al atardecer",
      image:
        "https://images.unsplash.com/photo-1741705877378-124c4c259e30?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      alt: "Ciudad al atardecer",
      image:
        "https://images.unsplash.com/photo-1741850826374-47b63fd4a840?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      alt: "Ciudad al atardecer",
      image:
        "https://images.unsplash.com/photo-1725120425314-8f455c4792fd?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      alt: "Ciudad al atardecer",
      image:
        "https://images.unsplash.com/photo-1725120425314-8f455c4792fd?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  useEffect(() => {
    setPropiedades(imagenes);
    /*  axios
      .get("https://localhost:3000/character")
      .then((res) => {
        setPropiedades(res.data.results);
      })
      .catch((err) => {
        console.error(" Error en frontend:", err);
        setLoading(false);
      }); */
  }, []);
  const [openGallery, setOpenGallery] = useState(true);
  const handleAbrir = () => {
    setOpenGallery(false);
  };
  const handleCerrar = () => {
    setOpenGallery(true);
  };
  const [animation, setAnimation] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setAnimation(true);
      setTimeout(() => {
        setAnimation(false);
      }, 4000);
    }, 3000);
  }, []);
  return (
    <>
      <div
        className={` ${
          openGallery && "invisible"
        } flex flex-col bg-black/70 -mt-5 justify-center items-center  w-full h-full fixed   p-0 z-40 "`}
      >
        <div className="w-[1000px] pt-6  bg-white rounded-2xl flex flex-col justify-center items-center shadow-[0px_4px_5px_0px] shadow-black/40">
          <div className="w-full flex flex-col  items-end px-12 pt-5  top-2">
            <FontAwesomeIcon
              onClick={handleCerrar}
              icon={faX}
              size="2xl"
              className="cursor-pointer hover:text-blueRemax active:text-blueRemax"
            />
          </div>
          <br />
          <br />
          <img
            loading="lazy"
            className="w-[90%] h-130 object-cover "
            src={fotoEscogida}
            alt={fotoEscogida}
          />
          <div className="py-7">
            <Paginacion setPagina={setPagina} totalPaginas={totalPaginas} />
          </div>
        </div>
      </div>
      <HeaderPropiedadSeleccion />
      <div
        className={`transition-all duration-[900ms]  lg:invisible  ease-in-out   bottom-4 right-4 bg-blueRemax rounded-full  fixed z-50  w-[217px] h-[50px] flex items-center justify-center ${
          animation ? "translate-x-0 opacity-100 " : " opacity-0 translate-x-0 "
        }`}
      >
        <p className="text-white font-lato italic font-bold w-full px-4 text-[16px]">
          Contacta a un agente
        </p>
      </div>
      <div className="bottom-4 right-4 lg:invisible  bg-blueRemax rounded-full  fixed z-50  w-[50px] h-[50px] flex items-center justify-center">
        <img
          loading="lazy"
          className="w-8"
          src="HomePageContent/brand-whatsapp 1.svg"
          alt=""
        />
      </div>
      <div className="flex flex-col  px-2 justify-center items-start">
        {/* Galería móvil */}
        <div className="w-full lg:hidden flex relative  flex-col justify-center items-center">
          <div className="absolute right-3 top-4 bg-black/50 p-1 rounded-full">
            <img
              loading="lazy"
              className="w-[20px] h-[20px]"
              src="HomePageContent/iconshare.png"
              alt=""
            />
          </div>
          <div className="flex w-full absolute justify-around mx-auto gap-70">
            <img
              loading="lazy"
              className="w-[27px] h-[27px] cursor-pointer"
              src="HomePageContent/arrowizq.svg"
              alt="Flecha izquierda"
            />
            <img
              loading="lazy"
              className="w-[27px] h-[27px] cursor-pointer"
              src="HomePageContent/arrowderecha.svg"
              alt="Flecha derecha"
            />
          </div>
          <div className="flex  w-full">
            <img
              loading="lazy"
              className="w-full object-cover h-[202px] cursor-pointer"
              src="HomePageContent/pexels-fotoaibe-1571460 1.jpg"
              alt="Imagen de propiedad"
            />
          </div>
          <p className="z-20 mt-35 absolute bg-black/40 rounded-full p-1 text-white text-sm">
            1/2
          </p>
        </div>
        {/* Galería Desktop */}
        <div className="grid grid-cols-2 gap-2 w-full ">
          <div>
            <img
              onClick={handleAbrir}
              id={propiedades[0]}
              className="rounded-2xl w-full object-cover  h-[569px] cursor-pointer"
              src={propiedades[0]?.image}
              alt=""
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="">
              <img
                onClick={handleAbrir}
                id={propiedades[1]}
                className="rounded-2xl  h-[277px] w-full object-cover cursor-pointer"
                src={propiedades[1]?.image}
                alt=""
              />
            </div>
            <div className="">
              <img
                onClick={handleAbrir}
                id={propiedades[2]}
                className="rounded-2xl h-[277px]  w-full object-cover cursor-pointer"
                src={propiedades[2]?.image}
                alt=""
              />
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 text-[#7b7b7b]">
          <div>
            <div className="px-5 pt-5">
              <p className="lg:text-3xl">Departamento en Venta</p>
              <p className="lg:text-3xl font-bold">
                Departamento desde: $2,000,000 MXN
              </p>
              <div className="flex lg:gap-2 lg:mt-2">
                <img
                  className=" lg:w-10"
                  loading="lazy"
                  src="HomePageContent/iconmeters.svg"
                  alt="Icono de metros cuadrados"
                />
                <p className="lg:text-3xl">30,000m²</p>
              </div>
            </div>
            <hr className="w-full my-2 text-[#7B7B7B]" />
            {/* Contacta a un agente móvil */}
            <div className="w-[341px] lg:hidden h-[158px] p-3 text-center flex flex-col justify-between items-center shadow-[0px_4px_5px_0px] shadow-black/40 rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
              <div>
                <p className="font-bold text-[18px]">Contacta al Agente</p>
              </div>
              <div className="flex gap-15 items-center justify-between">
                <div>
                  <p className="font-medium text-[16px]">
                    Verónica Olan García
                  </p>
                  <p className="font-medium text-[16px]">
                    Solicita información:
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <FontAwesomeIcon
                      icon={faWhatsapp}
                      style={{ width: "20px", height: "40px", color: "gray" }}
                    />
                    <img
                      loading="lazy"
                      className="w-auto h-full"
                      src="HomePageContent/correo.svg"
                      alt="Correo"
                    />
                    <img
                      loading="lazy"
                      className="w-auto h-full"
                      src="HomePageContent/phone.svg"
                      alt="Teléfono"
                    />
                  </div>
                </div>
                <div>
                  <img
                    loading="lazy"
                    className="w-[99px] h-[104px] object-cover rounded-[15px]"
                    src="HomePageContent/agente.png"
                    alt="Foto del agente"
                  />
                </div>
              </div>
            </div>
            <p className="px-5 text-[18px] lg:text-3xl font-bold my-3">
              Departamento en Venta en AV. Salvador Díaz #345, Veracruz, México.
            </p>
            <hr />
            {/* Calculadora de hipotecas móvil */}
            <button className="mt-3 lg:hidden mx-auto bg-[#DB1C2E] w-[341px] text-[18px] font-bold h-[48px] text-white rounded-[10px]">
              Calculadora de hipotecas
            </button>
            <div className="px-5 mt-5">
              <Dropdown />
            </div>
          </div>
          {/* Contacta a un agente desktop */}
          <div className=" overflow-visible    relative">
            <div className="sticky top-2 pb-1 ">
              <div className="w-[551px] h-[237px] p-3 text-center flex flex-col justify-evenly items-center shadow-[0px_4px_5px_0px] shadow-black/40 rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
                <div>
                  <p className="font-bold text-[18px] lg:text-3xl">
                    Contacta al Agente
                  </p>
                </div>
                <div className="flex gap-15  items-center justify-between">
                  <div>
                    <p className="font-medium  text-[16px] lg:text-2xl">
                      Verónica Olan García
                    </p>
                    <p className="font-medium text-[16px] lg:text-xl">
                      Solicita información:
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <FontAwesomeIcon
                        icon={faWhatsapp}
                        style={{ width: "40px", height: "40px", color: "gray" }}
                      />
                      <img
                        loading="lazy"
                        className="w-11 h-full"
                        src="HomePageContent/correo.svg"
                        alt="Correo"
                      />
                      <img
                        loading="lazy"
                        className="w-8 h-full"
                        src="HomePageContent/phone.svg"
                        alt="Teléfono"
                      />
                    </div>
                  </div>
                  <div>
                    <img
                      loading="lazy"
                      className="w-[99px] h-[104px] lg:w-[152px] lg:h-[152px] object-cover rounded-[15px]"
                      src="HomePageContent/agente.png"
                      alt="Foto del agente"
                    />
                  </div>
                </div>
              </div>
              <div className="w-[551px]  gap-10  p-3 text-center flex flex-col justify-evenly items-center shadow-[0px_4px_5px_0px] shadow-black/40 rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
                <div className="text-start items-start w-full px-6">
                  <p className="font-bold   text-[18px] lg:text-3xl pt-4">
                    Contáctanos
                  </p>
                </div>
                <div className="flex  ">
                  <form action=" " className="w-full flex flex-col ">
                    {/* Aquí va un formulario con nombres, teléfono y correo electrónico, con dos botones */}
                    <div className="flex flex-col w-120 text-2xl text-start gap-3">
                      <label htmlFor="">
                        Nombre(s)
                        <input
                          type="text"
                          placeholder="Juan Martín"
                          className="border border-gray-300 rounded-lg p-2 w-full"
                        />
                      </label>
                      <label htmlFor="">
                        Teléfono
                        <input
                          type="number"
                          placeholder="9932402987"
                          className="border border-gray-300 rounded-lg p-2 w-full"
                        />
                      </label>
                      <label htmlFor="">
                        Correo Electrónico
                        <input
                          type="email"
                          placeholder="example@gmail.com"
                          className="border border-gray-300 rounded-lg p-2 w-full"
                        />
                      </label>
                      <div className="flex flex-col py-4 justify-center gap-5">
                        <button className="bg-blueRemax h-[50px] rounded">
                          <FontAwesomeIcon
                            icon={faWhatsapp}
                            size="xl"
                            style={{ color: "white" }}
                          />
                        </button>
                        <button className="bg-redRemax h-[50px] text-white text-2xl rounded">
                          Calculadora de Hipotecas
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionFooter />
    </>
  );
}
