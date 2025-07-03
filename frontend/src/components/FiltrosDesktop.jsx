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
    valor: contextValor
  } = useSearchContext(); 


  const [autoCompleteHome, setAutoCompleteHome] = useState([]);
  const [modalBusqueda, setModalBusqueda] = useState(true);
  const [inputValue, setInputValue] = useState(busqueda || "");
  const inputRef = useRef(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Petición a Mapbox en cada cambio de texto para autocompletar
  useEffect(() => {
    if (!inputValue) {
      setAutoCompleteHome([]);
      setModalBusqueda(true);
      return;
    }
    const fetchAutocompleteResults = async () => {
      try {
        const mapboxglModule = await import('mapbox-gl');
        const mapboxgl = mapboxglModule.default;
        const accessToken = "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            inputValue
          )}.json?access_token=${accessToken}&types=place,address&language=es&country=MX`
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const filteredData = data.features.map((item) => {
            if (item.place_type.includes("place")) {
              return { ...item, category: "ciudad" };
            } else if (item.place_type.includes("address")) {
              return { ...item, category: "direccion" };
            }
            return item;
          });
          setAutoCompleteHome(filteredData);
          setModalBusqueda(false);
        } else {
          setAutoCompleteHome([]);
          setModalBusqueda(true);
        }
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
        <Operacion setSelectedOptionsOperacion={setSelectedOptionsOperacion} />
        <Sector setSelectedOptions={setSelectedOptions} selectedOptions={selectedOptions} />
        <Tipo  selectedOptions={selectedOptions} valor={valor} />
        <LimpiarFiltro setlimpiar={setlimpiar} />
      </div>
      <div className="flex gap-1 ">
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
        <div
          className={`${
            modalBusqueda && "hidden"
          } mt-13 z-50 absolute bg-white px-2 flex flex-col py-4 items-start  gap-2 rounded shadow-[0_3px_1px] shadow-black/50`}
        >
          {autoCompleteHome.length === 0 && (
            <div className="text-gray-400 text-sm px-2 py-1">No se encontraron resultados</div>
          )}
          <p className="font-bold text-start px-2 text-xs sm:text-sm lg:text-base text-[#7b7b7b]">
            Ciudades
          </p>
          {autoCompleteHome
            .filter((item) => item.category === "ciudad")
            .map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSuggestionClick(item.place_name)}
                className={`flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer ${highlightedIndex === idx ? 'bg-gray-200' : ''}`}
              >
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[#7b7b7b]"
                />
                <p className="text-start text-xs sm:text-sm lg:text-base text-[#7b7b7b]">
                  {item.place_name}
                </p>
              </div>
            ))}
          <p className="text-start font-bold px-2 text-xs sm:text-sm lg:text-base text-[#7b7b7b]">
            Direcciones
          </p>
          {autoCompleteHome
            .filter((item) => item.category === "direccion")
            .map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSuggestionClick(item.place_name)}
                className={`flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer ${highlightedIndex === idx + autoCompleteHome.filter(i => i.category === 'ciudad').length ? 'bg-gray-200' : ''}`}
              >
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[#7b7b7b]"
                />
                <p className="text-start text-xs sm:text-sm lg:text-base text-[#7b7b7b]">
                  {item.place_name}
                </p>
              </div>
            ))}
        </div>
        <div
          onClick={handleSearchButton}
          className={`rounded-e-full cursor-pointer w-13 h-11 sm:h-11 sm:w-15 shadow-[0_3px_1px] shadow-black/50 align-middle items-center flex ${
            contextValor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
          } ${inputValue.trim() === "" ? 'opacity-50 pointer-events-none' : ''}`}
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
