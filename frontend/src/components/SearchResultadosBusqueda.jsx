import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import { useJsApiLoader } from "@react-google-maps/api";

export default function SearchResultadosBusqueda({
  menuClose,
  setMenuClose,
  setBusqueda,
  busqueda,
  setManejoBusqueda,
}) {
  const [modalBusqueda, setModalBusqueda] = useState(true);
  const {
    valor,
    busquedaHome,
    setBusquedaHome,
    setSeleccion
  } = useSearchContext();

  // Solución al error: declarar el ref
  const inputRef = useRef(null);

  // Solución al error: declarar la función handleSearchButton
  const handleSearchButton = () => {
    if (busquedaHome && busquedaHome.trim() !== "") {
      setBusquedaHome(busquedaHome);
      setModalBusqueda(true);
    }
  };

  // Solución al error: declarar la función handleInputKeyDown
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchButton();
    }
  };

  // Google Places Autocomplete
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDoBmSoAPraNNjNS2NQAu-Vs85trnJuJVI",
    libraries: ["places"],
  });
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (!isLoaded || !busquedaHome) return;
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: busquedaHome, componentRestrictions: { country: 'mx' } }, (preds) => {
      setSuggestions(preds || []);
    });
  }, [busquedaHome, isLoaded]);

  const handleCloseMenu = () => setMenuClose(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBusquedaHome(value);
    setModalBusqueda(!value);
  };

  const handleSearch = async (item) => {
    setModalBusqueda(true);
    setBusquedaHome(item.description);
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: item.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          setSeleccion({
            description: item.description,
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          setSeleccion({ description: item.description });
        }
      });
    } else {
      setSeleccion({ description: item.description });
    }
    setTimeout(() => setBusquedaHome(''), 100);
  };

  // Agrupación y resaltado
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'ig');
    return text.replace(regex, '<b>$1</b>');
  }
  const colonias = suggestions.filter(s => (s.types || []).some(t => ["neighborhood","sublocality","route"].includes(t)));
  const ciudades = suggestions.filter(s => (s.types || []).some(t => ["locality","administrative_area_level_3","administrative_area_level_2"].includes(t)));
  const estados = suggestions.filter(s => (s.types || []).some(t => ["administrative_area_level_1"].includes(t)));
  const ids = new Set();
  function renderGroup(title, arr) {
    if (!arr.length) return null;
    return <>
      <p className="font-bold text-[#7b7b7b] text-xs sm:text-sm lg:text-base mt-2 mb-1">{title}</p>
      {arr.map(item => {
        if (ids.has(item.place_id)) return null;
        ids.add(item.place_id);
        return (
          <div
            key={item.place_id}
            onClick={() => handleSearch(item)}
            className="flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer"
          >
            <FontAwesomeIcon icon={faLocationDot} className="text-[#7b7b7b]" />
            <span className="text-start text-sm md:text-base text-[#7b7b7b]" dangerouslySetInnerHTML={{__html: highlightMatch(item.description, busquedaHome)}} />
          </div>
        );
      })}
    </>;
  }

  return (
    <div className="flex justify-center items-center px-5 gap-4 lg:hidden">
      <div className="flex gap-1">
        <input
          ref={inputRef}
          autoComplete="off"
          value={busquedaHome}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          name="searchs"
          type="text"
          className="bg-white text-[#414141] text-sm sm:text-2xl px-3 rounded h-11 rounded-s-3xl w-60 shadow-[0_3px_1px] shadow-black/50 sm:h-11 sm:w-[465px] align-middle items-center flex"
          placeholder="Busca una zona..."
        />
        {!modalBusqueda && (
          <div className="mt-13 z-50 absolute bg-white px-2 flex flex-col py-4 items-start gap-2 rounded shadow-[0_3px_1px] shadow-black/50">
            {renderGroup('Colonias', colonias)}
            {renderGroup('Ciudades', ciudades)}
            {renderGroup('Estados', estados)}
          </div>
        )}
        <div
          onClick={handleSearchButton}
          className={`rounded-e-full cursor-pointer w-13 h-11 sm:h-11 sm:w-15 align-middle items-center flex shadow-[0_3px_1px] shadow-black/50 ${
            valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
          } ${busquedaHome.trim() === "" ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Link to="/propiedades" className="mx-auto">
            <button className="items-center flex cursor-pointer" type="button">
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
