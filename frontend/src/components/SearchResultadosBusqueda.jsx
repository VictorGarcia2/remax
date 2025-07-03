import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import mapboxgl from "mapbox-gl";
import { Link } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";

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
  const { valor } = useSearchContext();

  const [inputValue, setInputValue] = useState(busqueda || "");
  const inputRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const handleCloseMenu = () => setMenuClose(false);

  // Petición a Mapbox en cada cambio de texto para autocompletar
  useEffect(() => {
    if (!inputValue) {
      setAutoCompleteHome([]);
      setModalBusqueda(true);
      return;
    }
    const fetchAutocompleteResults = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            inputValue
          )}.json?access_token=${
            mapboxgl.accessToken
          }&types=address,neighborhood,place&language=es&country=MX`
        );
        const data = await response.json();
        setAutoCompleteHome(data.features || []);
        setModalBusqueda(false);
      } catch (error) {
        setAutoCompleteHome([]);
        setModalBusqueda(true);
      }
    };
    fetchAutocompleteResults();
  }, [inputValue]);

  // Cerrar sugerencias al perder foco
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setModalBusqueda(true);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navegación con teclado
  const handleInputKeyDown = (e) => {
    if (!autoCompleteHome.length) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev + 1) % autoCompleteHome.length);
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev - 1 + autoCompleteHome.length) % autoCompleteHome.length);
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        handleSuggestionClick(autoCompleteHome[highlightedIndex].place_name);
      } else if (inputValue.trim() !== "") {
        setBusqueda(inputValue);
        setManejoBusqueda((prevState) => !prevState);
        setModalBusqueda(true);
        setInputValue("");
        setAutoCompleteHome([]);
        setHighlightedIndex(-1);
        setTimeout(() => setBusqueda(""), 1000);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleSearchButton = () => {
    if (inputValue.trim() === "") return;
    setBusqueda(inputValue);
    setManejoBusqueda((prevState) => !prevState);
    setModalBusqueda(true);
    setInputValue("");
    setAutoCompleteHome([]);
    setHighlightedIndex(-1);
    setTimeout(() => setBusqueda(""), 1000);
  };

  const handleSuggestionClick = (placeName) => {
    setInputValue("");
    setBusqueda(placeName);
    setManejoBusqueda((prevState) => !prevState);
    setModalBusqueda(true);
    setAutoCompleteHome([]);
    setHighlightedIndex(-1);
    setTimeout(() => setBusqueda(""), 1000);
  };

  return (
    <div className="flex justify-center items-center px-5 gap-4 lg:hidden">
      <div className="flex gap-1">
        <input
          ref={inputRef}
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          name="searchs"
          type="text"
          className="bg-white text-[#414141] text-sm sm:text-2xl px-3 rounded h-11 rounded-s-3xl w-60 shadow-[0_3px_1px] shadow-black/50 sm:h-11 sm:w-[465px] align-middle items-center flex"
          placeholder="Busca una zona..."
        />
        {!modalBusqueda && (
          <div className="mt-13 z-50 absolute bg-white px-2 flex flex-col py-4 items-start gap-2 rounded shadow-[0_3px_1px] shadow-black/50">
            {autoCompleteHome.length === 0 && (
              <div className="text-gray-400 text-sm px-2 py-1">No se encontraron resultados</div>
            )}
            {autoCompleteHome.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSuggestionClick(item.place_name)}
                className={`flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer ${highlightedIndex === idx ? 'bg-gray-200' : ''}`}
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
          onClick={handleSearchButton}
          className={`rounded-e-full cursor-pointer w-13 h-11 sm:h-11 sm:w-15 align-middle items-center flex shadow-[0_3px_1px] shadow-black/50 ${
            valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
          } ${inputValue.trim() === "" ? 'opacity-50 pointer-events-none' : ''}`}
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
