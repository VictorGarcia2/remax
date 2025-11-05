import React, { useEffect, useState, useRef } from "react";
import Tipo from "./Tipo.jsx";
import RangoDePrecio from "./RangoDePrecio.jsx";
import Operacion from "./Operacion.jsx";
import Sector from "./Sector.jsx";
import { Link } from "react-router-dom";
import { faL, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LimpiarFiltro from "./LimpiarFiltro.jsx";
import { useSearchContext } from "../context/SearchContext.jsx";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from '../config/googleMaps';

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
  selectedOptions, 
  valor
}) {

  const { 
    busquedaHome,
    setBusquedaHome,
    selectedOptionsTipos,
    setSelectedOptionsTipos,
    selectedOptionsOperacion, 
    setSelectedOptionsOperacion,
    valor: contextValor,
    setSeleccion
  } = useSearchContext(); 

  // Google Places Autocomplete
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (!isLoaded || !busquedaHome) return;
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: busquedaHome, componentRestrictions: { country: 'mx' } }, (preds) => {
      setSuggestions(preds || []);
    });
  }, [busquedaHome, isLoaded]);

  const [autoCompleteHome, setAutoCompleteHome] = useState([]);
  const [modalBusqueda, setModalBusqueda] = useState(true);
  const autoCompleteModal = (e) => {
    setBusquedaHome(e.target.value);
    if (e.target.value) {
      setModalBusqueda(false);
    } else {
      setModalBusqueda(true);
    }
  };
  
  // Usar Google Places en lugar de Mapbox
  useEffect(() => {
    if (!busquedaHome || !isLoaded) {
      setAutoCompleteHome([]);
      setModalBusqueda(true);
      return;
    }
    // Ya se maneja con Google Places AutocompleteService arriba
    // Simplemente usar las suggestions
  }, [busquedaHome, isLoaded]);


  const handleSearch = (item) => {
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
  const [limpiar, setlimpiar] = useState(false);

  // Solución al error: declarar el ref
  const inputRef = useRef(null);

  // Solución al error: declarar la función handleSearchButton
  const handleSearchButton = () => {
    if (busquedaHome && busquedaHome.trim() !== "") {
      setBusquedaHome(busquedaHome);
      setModalBusqueda(true);
      // Aquí puedes agregar lógica adicional si es necesario
    }
  };

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

  // Agrupación y resaltado
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function highlightMatch(text, query) {
    if (!query) return text;
    const safeQuery = escapeRegExp(query);
    const regex = new RegExp(`(${safeQuery})`, 'ig');
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
            <span className="text-start text-xs sm:text-sm lg:text-base text-[#7b7b7b]" dangerouslySetInnerHTML={{__html: highlightMatch(item.description, busquedaHome)}} />
          </div>
        );
      })}
    </>;
  }

  return (
    <div className="grid grid-cols-2 ">
      <div className="flex px-7 2xl:px-21 gap-2 items-center justify-between ">
        {
          <RangoDePrecio
            setAplicarFiltros={setAplicarFiltros}
            precioMaximo={precioMaximo}
            precioMinimo={precioMinimo}
            setPrecioMinimo={setPrecioMinimo}
            setPrecioMaximo={setPrecioMaximo}
          />
        }
        <Operacion selectedOptionsOperacion={selectedOptionsOperacion} setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
        <Sector setSelectedOptions={setSelectedOptions} selectedOptions={selectedOptions} />
        <Tipo  selectedOptions={selectedOptions} valor={valor} />
        <LimpiarFiltro setlimpiar={setlimpiar} />
      </div>
      <div className="flex gap-1 ">
        <input
          ref={inputRef}
          autoComplete="off"
          value={busquedaHome}
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
          {renderGroup('Colonias', colonias)}
          {renderGroup('Ciudades', ciudades)}
          {renderGroup('Estados', estados)}
        </div>
        <div
          onClick={handleSearchButton}
          className={`rounded-e-full cursor-pointer w-13 h-11 sm:h-11 sm:w-15 shadow-[0_3px_1px] shadow-black/50 align-middle items-center flex ${
            contextValor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
          } ${busquedaHome.trim() === "" ? 'opacity-50 pointer-events-none' : ''}`}
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
