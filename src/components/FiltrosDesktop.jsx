import React, { useEffect, useState } from "react";
import Tipo from "./Tipo.jsx";
import RangoDePrecio from "./RangoDePrecio.jsx";
import Operacion from "./Operacion.jsx";
import Sector from "./Sector.jsx";
import { Link } from "react-router";
import mapboxgl from "mapbox-gl";
import { faL, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LimpiarFiltro from "./LimpiarFiltro.jsx";

export default function FiltrosDesktop({
  busqueda,
  setBusqueda,
  setManejoBusqueda,
  setSelectedOptions,
  precioMinimo,
  setPrecioMinimo,
  setPrecioMaximo,
  precioMaximo,
  setAplicarFiltros,
  setSelectedOptionsTipos,
  setSelectedOptionsOperacion,
}) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";
  const [autoCompleteHome, setAutoCompleteHome] = useState([]);
  const [modalBusqueda, setModalBusqueda] = useState(true);

  const autoCompleteModal = (e) => {
    setBusqueda(e.target.value);
    if (e.target.value) {
      setModalBusqueda(false); // Se cierra cuando hay valor
    } else {
      setModalBusqueda(true); // Se abre cuando no hay valor
    }
  };
  useEffect(() => {
    const manejarBusqueda = async () => {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          busqueda
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      setAutoCompleteHome(data.features);
    };
    manejarBusqueda();
  }, [busqueda]);
  const handleSearch = (e) => {
    setManejoBusqueda((prevState) => !prevState);
    setBusqueda(e.target.textContent);
    setModalBusqueda(true);
    setTimeout(() => {
      setBusqueda("");
    }, 1000);
  };
  const [limpiar, setlimpiar] = useState(false);

  useEffect(() => {
    if (limpiar) {
      setPrecioMaximo(Infinity);
      setPrecioMinimo(0);
      setSelectedOptions([]);
      setSelectedOptionsOperacion([]);
      setSelectedOptionsTipos([]);
      setTimeout(() => {
        setlimpiar(false);
      }, 1000);
    }
  }, [limpiar]);
  return (
    <div className="grid grid-cols-2">
      <div className="flex px-21 gap-2 items-center justify-between ">
        {
          <RangoDePrecio
            setAplicarFiltros={setAplicarFiltros}
            precioMaximo={precioMaximo}
            precioMinimo={precioMinimo}
            setPrecioMinimo={setPrecioMinimo}
            setPrecioMaximo={setPrecioMaximo}
          />
        }
        <Operacion setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
        <Sector setSelectedOptions={setSelectedOptions} />
        <Tipo setSelectedOptionsTipos={setSelectedOptionsTipos} />
        <LimpiarFiltro setlimpiar={setlimpiar} />
      </div>
      <div className="flex gap-1 ">
        <input
          autoComplete="off"
          value={busqueda}
          onChange={autoCompleteModal}
          name="searchs"
          type="text"
          className="bg-white text-[#414141] text-sm sm:text-2xl px-3 rounded h-11 rounded-s-3xl w-60 shadow-[0_3px_1px] shadow-black/50 sm:h-11 sm:w-[465px] align-middle items-center flex"
          placeholder="Busca una zona..."
        />
        <div
          className={`${
            modalBusqueda && "hidden"
          } mt-13 z-50 absolute bg-white px-2 flex flex-col py-4 items-start  gap-2 rounded shadow-[0_3px_1px] shadow-black/50`}
        >
          {autoCompleteHome &&
            autoCompleteHome.map((item) => (
              <div
                onClick={handleSearch}
                className="flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[#7b7b7b]"
                />
                <p className=" text-start text-[#7b7b7b]">{item.place_name}</p>
              </div>
            ))}
        </div>
        <div
          onClick={() => setManejoBusqueda((prevState) => !prevState)}
          className="rounded-e-full cursor-pointer  w-13 h-11 sm:h-11 sm:w-15 bg-[#003DA4] align-middle  items-center flex shadow-[0_3px_1px] shadow-black/50"
        >
          <Link to={"/propiedades"} className="mx-auto">
            <button className="items-center flex cursor-pointer">
              <img
                loading="lazy"
                className="mx-auto w-4.8 sm:w-6"
                src="/HomePageContent/Search Normal.svg"
                alt=""
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
