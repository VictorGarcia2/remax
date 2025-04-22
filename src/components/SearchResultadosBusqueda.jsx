import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import mapboxgl from "mapbox-gl";
import { Link } from "react-router";

mapboxgl.accessToken =
  "pk.eyJ1IjoidmljdG9yZ2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";

export default function SearchResultadosBusqueda({
  menuClose,
  setMenuClose,
  setBusqueda,
  busqueda,
  setManejoBusqueda,
}) {
  const [autoCompleteHome, setAutoCompleteHome] = useState([]);
  const [modalBusqueda, setModalBusqueda] = useState(true);

  const handleCloseMenu = () => setMenuClose(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBusqueda(value);
    setModalBusqueda(!value);
  };

  const handleSearch = (e) => {
    const selectedValue = e.target.textContent;
    setManejoBusqueda((prevState) => !prevState);
    setBusqueda(selectedValue);
    setModalBusqueda(true);
    setTimeout(() => setBusqueda(""), 1000);
  };

  useEffect(() => {
    if (!busqueda) return;

    const fetchAutocompleteResults = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            busqueda
          )}.json?access_token=${
            mapboxgl.accessToken
          }&types=address,neighborhood,place&language=es&country=MX`
        );
        const data = await response.json();
        setAutoCompleteHome(data.features || []);
      } catch (error) {
        console.error("Error fetching autocomplete results:", error);
      }
    };

    fetchAutocompleteResults();
  }, [busqueda]);

  return (
    <div className="flex justify-center items-center px-5 gap-4 xl:hidden">
      <div className="flex gap-1">
        <input
          autoComplete="off"
          value={busqueda}
          onChange={handleInputChange}
          name="searchs"
          type="text"
          className="bg-white text-[#414141] text-sm sm:text-2xl px-3 rounded h-11 rounded-s-3xl w-60 shadow-[0_3px_1px] shadow-black/50 sm:h-11 sm:w-[465px] align-middle items-center flex"
          placeholder="Busca una zona..."
        />
        {!modalBusqueda && (
          <div className="mt-13 z-50 absolute bg-white px-2 flex flex-col py-4 items-start gap-2 rounded shadow-[0_3px_1px] shadow-black/50">
            {autoCompleteHome.map((item) => (
              <div
                key={item.id}
                onClick={handleSearch}
                className="flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[#7b7b7b]"
                />
                <p className="text-start text-sm md:text-base text-[#7b7b7b]">
                  {item.place_name}
                </p>
              </div>
            ))}
          </div>
        )}
        <div
          onClick={() => setManejoBusqueda((prevState) => !prevState)}
          className="rounded-e-full cursor-pointer w-13 h-11 sm:h-11 sm:w-15 bg-[#003DA4] align-middle items-center flex shadow-[0_3px_1px] shadow-black/50"
        >
          <Link to="/propiedades" className="mx-auto">
            <button className="items-center flex cursor-pointer">
              <img
                loading="lazy"
                className="mx-auto w-4.8 sm:w-6"
                src="/HomePageContent/Search Normal.svg"
                alt="Buscar"
              />
            </button>
          </Link>
        </div>
      </div>
      <div className="xl:hidden" onClick={handleCloseMenu}>
        <FontAwesomeIcon icon={faFilter} color="#7b7b7b" size="xl" />
      </div>
    </div>
  );
}
