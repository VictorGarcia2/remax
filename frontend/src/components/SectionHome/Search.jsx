import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faHouse, faHouseUser, faBuilding, faMapLocation, faBuildingCircleCheck, faWarehouse, faBuildingColumns, faStore, faTractor } from "@fortawesome/free-solid-svg-icons";
import mapboxgl from "mapbox-gl";
import { useSearchContext } from "../../context/SearchContext";
import { useGooglePlacesAutocomplete } from '../../hooks/useGooglePlacesAutocomplete';
import { useJsApiLoader } from "@react-google-maps/api";

export default function Search({
  autoCompleteHome,
  setAutoCompleteHome,
  valor
}) {
  // Usar el contexto para acceder a los estados compartidos
  const { 
    busquedaHome,
    setBusquedaHome,
    selectedOptionsTipos,
    setSelectedOptionsTipos,
    selectedOptionsOperacion, 
    setSelectedOptionsOperacion,
    setSeleccion
  } = useSearchContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [openTipo, setOpenTipo] = useState(false);
  const [modalBusqueda, setModalBusqueda] = useState(true);
  const modalRef = useRef(null);
  const [highlightedTipo, setHighlightedTipo] = useState(-1);
  mapboxgl.accessToken =
    "pk.eyJ1IjoidmljdG9yZ2FyY2lhcHJ6IiwiYSI6ImNtNXZ3dW0wMjA2aHgyanE1M3ptczQ2azUifQ.ILrTXW_4c9_pbGC3Uj-wdg";
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDoBmSoAPraNNjNS2NQAu-Vs85trnJuJVI",
    libraries: ["places"],
  });
  const { suggestions, getPlacePredictions } = useGooglePlacesAutocomplete(isLoaded);
  const handleOperacion = (event) => {
    const value = parseInt(event.target.id, 10); // Siempre número
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
    const value = parseInt(event.target.id, 10); // Siempre número
    if (event) {
      setOpenTipo(false);
      setHighlightedTipo(-1);
      setSelectedOptionsTipos([value]);
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
      icon: faHouse
    },
    {
      tipo_id: 9,
      tipo_nombre: "Local",
      sector_nombre: "comercial",
      src: "/HomePageContent/casa.svg",
      icon: faStore
    },
    {
      tipo_id: 2,
      tipo_nombre: "Casa en Condominio",
      sector_nombre: "residencial", 
      src: "/HomePageContent/casaencondominio.svg",
      icon: faHouseUser
    },
    {
      tipo_id: 2,
      tipo_nombre: "Oficina",
      sector_nombre: "comercial", 
      src: "/HomePageContent/casaencondominio.svg",
      icon: faBuildingColumns
    },

    {
      tipo_id: 3,
      tipo_nombre: "Departamento",
      sector_nombre: "residencial",
      src: "/HomePageContent/icondepartamento.svg",
      icon: faBuilding
    },

    {
      tipo_id: 5,
      tipo_nombre: "Terreno",
      sector_nombre: "residencial",
      src: "/HomePageContent/terreno-residencial.svg",
      icon: faMapLocation
    },
    {
      tipo_id: 6,
      tipo_nombre: "Desarrollo",
      sector_nombre: "residencial",
      src: "/HomePageContent/desarrollo.svg",
      icon: faBuildingCircleCheck
    },
    {
      tipo_id: 7,
      tipo_nombre: "Nave industrial",
      sector_nombre: "comercial",
      src: "/HomePageContent/bodega-industrial.svg",
      icon: faWarehouse
    },
    {
      tipo_id: 8,
      tipo_nombre: "Edificio",
      sector_nombre: "comercial",
      src: "/HomePageContent/edificio.svg",
      icon: faBuildingColumns
    },
    {
      tipo_id: 10,
      tipo_nombre: "Terreno",
      sector_nombre: "comercial",
      src: "/HomePageContent/terreno-comercial.svg",
      icon: faMapLocation
    },
    {
      tipo_id: 14,
      tipo_nombre: "Finca/Rancho",
      sector_nombre: "comercial",
      src: "/HomePageContent/finca-rancho.svg",
      icon: faTractor
    },
    {
      tipo_id: 19,
      tipo_nombre: "Bodega",
      sector_nombre: "comercial",
      src: "/HomePageContent/bodega-comercial.svg",
      icon: faWarehouse
    },
  ];
  

  const navigate = useNavigate();
  const handleSearch = (e) => {
    // No limpiamos la búsqueda para mantener el estado
    // setBusqueda("");
    setBusquedaHome(e.target.textContent);
    setModalBusqueda(true); 
    // Aumentamos el tiempo de espera para asegurar que el estado se actualice antes de navegar
    setTimeout(() => {
      console.log("Navegando a /propiedades con selectedOptionsTipos:", selectedOptionsTipos);
      navigate("/propiedades" );
    }, 100);
  };
  const autoCompleteModal = (e) => {
    setBusquedaHome(e.target.value);
    if (e.target.value) {
      setModalBusqueda(false);
    } else {
      setModalBusqueda(true);
    }
  };
  useEffect(() => {
    if (isLoaded && busquedaHome) {
      getPlacePredictions(busquedaHome);
    }
  }, [busquedaHome, isLoaded, getPlacePredictions]);

  if (!isLoaded) {
    return <div className="text-center py-8">Cargando Google Maps...</div>;
  }

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
                    selectedItem === parseInt(item.id, 10)
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
                className={`${modalBusqueda && "invisible"} top-12 sm:top-14 lg:top-19 absolute bg-white px-2 flex flex-col py-4 items-start gap-2 rounded shadow-[0_3px_1px] shadow-black/50`}
              >
                {(() => {
                  // Función para resaltar coincidencias
                  function highlightMatch(text, query) {
                    if (!query) return text;
                    const regex = new RegExp(`(${query})`, 'ig');
                    return text.replace(regex, '<b>$1</b>');
                  }
                  // Clasificar sugerencias
                  const colonias = suggestions.filter(s => (s.types || []).some(t => ["neighborhood","sublocality","route"].includes(t)));
                  const ciudades = suggestions.filter(s => (s.types || []).some(t => ["locality","administrative_area_level_3","administrative_area_level_2"].includes(t)));
                  const estados = suggestions.filter(s => (s.types || []).some(t => ["administrative_area_level_1"].includes(t)));
                  // Para evitar duplicados
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
                            onClick={async () => {
                              setBusquedaHome(item.description);
                              setModalBusqueda(true);
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
                                    setTimeout(() => navigate("/propiedades"), 0);
                                  } else {
                                    setSeleccion({ description: item.description });
                                    setTimeout(() => navigate("/propiedades"), 0);
                                  }
                                });
                              } else {
                                setSeleccion({ description: item.description });
                                setTimeout(() => navigate("/propiedades"), 0);
                              }
                              setTimeout(() => setBusquedaHome(''), 100);
                            }}
                            className="flex items-center gap-1 py-1 hover:bg-gray-200 rounded w-full px-1 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faLocationDot} className="text-[#7b7b7b]" />
                            <span className="text-start text-sm sm:text-sm lg:text-base text-[#7b7b7b]" dangerouslySetInnerHTML={{__html: highlightMatch(item.description, busquedaHome)}} />
                          </div>
                        );
                      })}
                    </>;
                  }
                  return <>
                    {renderGroup('Colonias', colonias)}
                    {renderGroup('Ciudades', ciudades)}
                    {renderGroup('Estados', estados)}
                  </>;
                })()}
              </div>
            </div>
            <div
              onClick={handleSearch}
              className="rounded-e-full cursor-pointer w-10 sm:w-14 lg:w-20 h-10 sm:h-12 lg:h-16 bg-[#003DA4] align-middle items-center flex shadow-[0_3px_1px] shadow-black/50"
            >
             
                <button type="button" className="items-center flex mx-auto cursor-pointer">
                  <img
                    loading="lazy"
                    className="mx-auto w-4 sm:w-6 lg:w-9 cursor-pointer"
                    src="/HomePageContent/Search Normal.svg"
                    alt=""
                  />
                </button>
              
            </div>
          </div>
        </form>
        <div
          ref={modalRef}
          tabIndex={0}
          className={`${!openTipo ? "hidden" : ""} w-40 z-50 sm:w-60 lg:w-80 h-auto bg-white mt-1 rounded shadow-[0_3px_1px] flex flex-col justify-center align-middle items-center shadow-black/50`}
        >
          <ol className="font-display text-start py-4 text-sm sm:text-base  lg:text-2xl text-[#414141]">
            {tiposPropiedad &&
              tiposPropiedad
                .filter(item => item.sector_nombre === valor)
                .map((item, idx) => (
                  <li
                    key={item.tipo_id}
                    onClick={(e) => handleTipos(e)}
                    onMouseEnter={() => setHighlightedTipo(idx)}
                    className={`py-2 px-5 w-full flex items-center cursor-pointer gap-1
                      ${(highlightedTipo === idx || selectedOptionsTipos.includes(item.tipo_id)) ? 'bg-gray-200' : ''}`}
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="w-4 sm:w-6 lg:w-8 text-[#414141]"
                    />
                    <p id={item.tipo_id.toString()}>{item.tipo_nombre}</p>
                  </li>
                ))}
          </ol>
        </div>
      </div>
    </>
  );
}
