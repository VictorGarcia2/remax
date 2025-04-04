import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getConsults } from "../../APi/APICall";
export default function Search({ data, setData }) {
  const [openTipo, setOpenTipo] = useState(true);
  const [direccion, setDireccion] = useState("");
 
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log(propiedades)
  
  const handle = () => {
    setOpenTipo(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usa siempre el endpoint /api para mantener consistencia
        const response = await fetch('/api/propiedades');
        
        if (!response.ok) {
          throw new Error(`Error HTTP! estado: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (!data || data.length === 0) {
          throw new Error("No se encontraron propiedades");
        }
        
        setPropiedades(data);
      } catch (err) {
        setError(err.message);
        console.error("Error al obtener datos:", {
          error: err,
          url: '/api/propiedades'
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []); // Eliminé [handle] porque no se usa en la petición
  const handleSubmitSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = {
      direccion: formData.get("searchs"),
    };
    setDireccion(body.direccion);
  };
  return (
    <>
      <div className="mt-10 flex flex-col gap-1 pb-1 font-display ">
        <form onClick={handleSubmitSearch} action="">
          <div className=" mx-16 sm:mx-30 font-display font-ligh flex gap-1 pb-1 ">
            <p className="text-sm bg-blueRemax w-16 rounded sm:w-28 sm:h-9 sm:text-2xl font-extralight flex justify-center items-center h-7 text-center">
              {" "}
              Renta{" "}
            </p>
            <p className="text-sm bg-blueRemax w-16 sm:w-28 sm:h-9 rounded sm:text-2xl font-extralight flex justify-center items-center h-7 text-center">
              {" "}
              Venta
            </p>
          </div>
          <div className="flex gap-1 pb-1">
            <div
              onClick={handle}
              className={`${
                openTipo ? "bg-white text-[#414141]" : "bg-[#003DA4] text-white"
              } rounded-s-2xl w-16 sm:w-[116px] sm:h-16 h-11 shadow-[0_3px_1px] shadow-black/50  align-middle text-center items-center flex`}
            >
              <p className={`  text-sm sm:text-2xl text-center w-full `}>
                Tipo
              </p>
            </div>
            <input
              name="searchs"
              type="text"
              className="bg-white text-[#414141] text-sm sm:text-2xl px-3 rounded h-11 w-60 shadow-[0_3px_1px] shadow-black/50 sm:h-16 sm:w-[465px] align-middle items-center flex"
              placeholder="Busca una zona..."
            />

            <div className="rounded-e-full  w-13 h-11 sm:h-16 sm:w-20 bg-[#003DA4] align-middle  items-center flex shadow-[0_3px_1px] shadow-black/50">
              <Link to={"/resultado"} className="mx-auto">
                <button className="items-center flex">
                  <img
                    loading="lazy"
                    className="mx-auto w-4.8 sm:w-9"
                    src="HomePageContent/Search Normal.svg"
                    alt=""
                  />
                </button>
              </Link>
            </div>
          </div>
        </form>
        <div
          className={`${
            openTipo && "hidden"
          } w-60 sm:w-80 h-auto bg-white mt-1 rounded shadow-[0_3px_1px]   flex flex-col justify-center align-middle items-start shadow-black/50`}
        >
          <ol className="font-display  text-start py-4 px-5 text-base sm:text-2xl  text-[#414141]">
            <li className="flex items-center cursor-pointer  gap-1 pb-1">
              <img
                loading="lazy"
                className="w-5 sm:w-8"
                src="HomePageContent/casa.svg"
                alt=""
              />{" "}
              <p> Casa </p>{" "}
            </li>
            <li
              onClick={() => setOpenTipo(true)}
              className="flex items-center cursor-pointer  gap-1 pb-1"
            >
              <img
                loading="lazy"
                className="w-5 sm:w-8"
                src="HomePageContent/casaencondominio.svg"
                alt=""
              />
              <p>Casa en Condominio</p>
            </li>
            <li className="flex items-center cursor-pointer  gap-1 pb-1">
              <img
                loading="lazy"
                className="w-5 sm:w-8"
                src="HomePageContent/icondepartamento.svg"
                alt=""
              />
              <p>Departamento</p>
            </li>
            <li className="flex items-center cursor-pointer  gap-1 pb-1">
              <img
                loading="lazy"
                className="w-5 sm:w-8"
                src="HomePageContent/edificio.svg"
                alt=""
              />
              <p>Edificio</p>
            </li>
            <li className="flex items-center cursor-pointer  gap-1 pb-1">
              <img
                loading="lazy"
                className="w-5 sm:w-8"
                src="HomePageContent/Terreno.svg"
                alt=""
              />
              <p>Terreno</p>
            </li>
            <li className="flex items-center cursor-pointer  gap-1 pb-1">
              <img
                loading="lazy"
                className="w-5 sm:w-8"
                src="HomePageContent/desarrollo.svg"
                alt=""
              />
              <p>Desarrollo</p>
            </li>
          </ol>
        </div>
      </div>
    </>
  );
}
