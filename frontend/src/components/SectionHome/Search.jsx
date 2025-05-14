import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import mapboxgl from "mapbox-gl";
export default function Search({
  busquedaHome,
  setBusquedaHome,
  autoCompleteHome,
  setAutoCompleteHome,
  setBusqueda,
  setSelectedOptionsTipos,
  setSelectedOptionsOperacion,
  selectedOptionsOperacion
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  console.log(selectedItem)
  const [openTipo, setOpenTipo] = useState(true);
  const [direccion, setDireccion] = useState("");
  const [modalBusqueda, setModalBusqueda] = useState(true);
  mapboxgl.accessToken =
    "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";
  const handleOperacion = (event) => {
    const value = event.target.id;
    if (event) {
      setSelectedItem(value);
      // Si está marcado, añadirlo al array y mantener solo el último elemento
      setSelectedOptionsOperacion([value]);
    } else {
      // Si está desmarcado, eliminarlo del array
      setSelectedOptionsOperacion((prev) =>
        prev.filter((item) => item !== value)
      );
    }
  };
  const handleTipos = (event) => {
    const value = event.target.id;
    if (event) {
      console.log(typeof value);
      setOpenTipo(true);
      setSelectedOptionsTipos([value]);
    } else {
      setSelectedOptionsTipos((prev) => prev.filter((item) => item !== value));
    }
  };
  const operacion = [
    { id: "1", operacion: "Venta" },
    { id: "2", operacion: "Renta" },
  ];
  const tiposPropiedad = [
    {
      tipo_id: 1,
      tipo_nombre: "Casa",
      sector_nombre: "residencial",
      src: "/HomePageContent/casa.svg",
    },
    {
      tipo_id: 2,
      tipo_nombre: "Casa en Condominio",
      sector_nombre: "residencial",
      src: "/HomePageContent/casaencondominio.svg",
    },
    {
      tipo_id: 3,
      tipo_nombre: "Departamento",
      sector_nombre: "residencial",
      src: "/HomePageContent/icondepartamento.svg",
    },
    {
      tipo_id: 4,
      tipo_nombre: "Terreno",
      sector_nombre: "residencial",
      src: "/HomePageContent/Terreno.svg",
    },
    {
      tipo_id: 6,
      tipo_nombre: "Desarrollo",
      sector_nombre: "residencial",
      src: "/HomePageContent/desarrollo.svg",
    },
  ];

  const navigate = useNavigate();
  const handleSearch = (e) => {
    setBusqueda("");
    setBusquedaHome(e.target.textContent);
    navigate("/propiedades");
    setModalBusqueda(true);
  };
  const autoCompleteModal = (e) => {
    setBusquedaHome(e.target.value);
    if (e.target.value) {
      setModalBusqueda(false); // Se cierra cuando hay valor
    } else {
      setModalBusqueda(true); // Se abre cuando no hay valor
    }
  };
  useEffect(() => {
    const manejarBusqueda = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            busquedaHome
          )}.json?access_token=${
            mapboxgl.accessToken
          }&types=place,address&language=es&country=MX`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          // Filtramos y etiquetamos los resultados
          const filteredData = data.features.map((item) => {
            if (item.place_type.includes("place")) {
              return { ...item, category: "ciudad" };
            } else if (item.place_type.includes("address")) {
              return { ...item, category: "direccion" };
            }
            return item;
          });
          setAutoCompleteHome(filteredData);
        } else {
          setAutoCompleteHome([]);
        }
      } catch (error) {
        console.error("Error al buscar lugar:", error);
        setAutoCompleteHome([]);
      }
    };

    if (busquedaHome) {
      manejarBusqueda();
    }
  }, [busquedaHome]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-1 pb-1 font-display">
        <form action="">
          <div className="mx-13 sm:mx-16 lg:mx-30 font-display font-light flex gap-1 pb-1">
            {operacion &&
              operacion.map((item) => (
                <label
                  key={item.id}
                  className={`text-sm sm:text-sm lg:text-base cursor-pointer ${
                    selectedItem === item.id
                      ? "bg-blueRemax text-white"
                      : "bg-white text-[#414141]"
                  } hover:bg-blueRemax hover:text-white w-12 sm:w-20 lg:w-28 sm:h-8 lg:h-9 rounded flex justify-center items-center h-7 font-normal text-center`}
                >
                  <input
                    type="checkbox"
                    id={item.id}
                    onChange={handleOperacion}
                    className="hidden"
                  />
                  {item.operacion}
                </label>
              ))}
          </div>
          <div className="flex gap-1 pb-1">
            <div
              onClick={() => setOpenTipo((prevState) => !prevState)}
              className={`${
                openTipo ? "bg-white text-[#414141]" : "bg-[#003DA4] text-white"
              } cursor-pointer hover:bg-blueRemax hover:text-white rounded-s-2xl w-12  sm:w-20 lg:w-[116px] sm:h-12 lg:h-16 h-10 shadow-[0_3px_1px] shadow-black/50 align-middle text-center items-center flex`}
            >
              <p className="text-sm sm:text-sm lg:text-2xl text-center w-full">
                Tipo
              </p>
            </div>
            <div className="flex flex-col relative gap-2">
              <input
                autoComplete="off"
                value={busquedaHome}
                onChange={autoCompleteModal}
                name="searchs"
                type="text"
                className="bg-white text-[#414141] text-sm sm:text-sm lg:text-2xl px-3 rounded h-10 sm:h-12 lg:h-16  w-60 lg:w-[465px] shadow-[0_3px_1px] shadow-black/50 align-middle items-center flex"
                placeholder="Busca una zona..."
              />
              <div
                className={`${
                  modalBusqueda && "invisible"
                } top-12 sm:top-14 lg:top-19 absolute bg-white px-2 flex flex-col py-4 items-start gap-2 rounded shadow-[0_3px_1px] shadow-black/50`}
              >
                <p className="text-start font-bold px-2 text-sm sm:text-sm lg:text-base text-[#7b7b7b]">
                  Ciudades
                </p>
                {autoCompleteHome
                  .filter((item) => item.category === "ciudad")
                  .map((item) => (
                    <div
                      key={item.id} // Asegúrate de poner key
                      onClick={handleSearch}
                      className="flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-[#7b7b7b]"
                      />
                      <p className="text-start text-sm sm:text-sm lg:text-base text-[#7b7b7b]">
                        {item.place_name}
                      </p>
                    </div>
                  ))}

                <p className="text-start px-2 font-bold text-sm sm:text-sm lg:text-base text-[#7b7b7b]">
                  Direcciones
                </p>
                {autoCompleteHome
                  .filter((item) => item.category === "direccion")
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={handleSearch}
                      className="flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-[#7b7b7b]"
                      />
                      <p className="text-start text-sm sm:text-sm lg:text-base text-[#7b7b7b]">
                        {item.place_name}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
            <div
              onClick={handleSearch}
              className="rounded-e-full cursor-pointer w-10 sm:w-14 lg:w-20 h-10 sm:h-12 lg:h-16 bg-[#003DA4] align-middle items-center flex shadow-[0_3px_1px] shadow-black/50"
            >
              <Link to={"/propiedades"} className="mx-auto cursor-pointer">
                <button className="items-center flex">
                  <img
                    loading="lazy"
                    className="mx-auto w-4 sm:w-6 lg:w-9 cursor-pointer"
                    src="/HomePageContent/Search Normal.svg"
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
          } w-40 sm:w-60 lg:w-80 h-auto bg-white mt-1 rounded shadow-[0_3px_1px] flex flex-col justify-center align-middle items-center shadow-black/50`}
        >
          <ol className="font-display text-start py-4 text-sm sm:text-base lg:text-2xl text-[#414141]">
            {tiposPropiedad &&
              tiposPropiedad.map((item) => (
                <li
                  onClick={handleTipos}
                  className="hover:bg-gray-200 py-2 px-5 w-full flex items-center cursor-pointer gap-1"
                >
                  <img
                    loading="lazy"
                    className="w-4 sm:w-6 lg:w-8"
                    src={item.src}
                    alt=""
                  />
                  <p id={item.tipo_id}>{item.tipo_nombre}</p>
                </li>
              ))}
          </ol>
        </div>
      </div>
    </>
  );
}
