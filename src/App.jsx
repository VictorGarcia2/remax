import React, { useEffect, useState } from "react";
import Residencial from "./pages/Residencial";
import { Route, Routes } from "react-router";
import Comercial from "./pages/Comercial";
import ResultadosBusqueda from "./pages/Buscador/ResultadosBusqueda";
import PropiedadSeleccion from "./pages/PropiedadSeleccion/PropiedadSeleccion";
import axios from "axios";

import propierties from "/src/APi/propiedades.json";
export default function App() {
  const [propiedades, setPropiedades] = useState([]);
  const [menuClose, setMenuClose] = useState(true);
  const [busquedaHome, setBusquedaHome] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [manejoBusqueda, setManejoBusqueda] = useState(false);
  const [propiedadesVisibles, setPropiedadesVisibles] = useState([]);
  const [autoCompleteHome, setAutoCompleteHome] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOptionsTipos, setSelectedOptionsTipos] = useState([]);
  const [selectedOptionsOperacion, setSelectedOptionsOperacion] = useState([]);
  const [nuevas, setNuevas] = useState([]);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(Infinity);
  const [aplicarFiltros, setAplicarFiltros] = useState(Date.now());
  const [seleccion, setSeleccion] = useState();
  /* useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          "https://localhost:3000/api/propiedades"
        );
        const data = response.data.data.rows;
        setPropiedades(data);
        } catch (error) {
          console.error("Algo salió mal al consumir la API", error);
          }
          };
          getData();
          }, [busquedaHome]); */

          useEffect(() => {
            const data = propierties.data.rows; // o como venga en tu JSON
            setPropiedades(data);
          }, [busquedaHome]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Residencial
              setSelectedOptionsOperacion={setSelectedOptionsOperacion}
              setSelectedOptionsTipos={setSelectedOptionsTipos}
              setSelectedOptions={setSelectedOptions}
              selectedOptions={selectedOptions}
              busquedaHome={busquedaHome}
              setBusquedaHome={setBusquedaHome}
              autoCompleteHome={autoCompleteHome}
              setAutoCompleteHome={setAutoCompleteHome}
              setBusqueda={setBusqueda}
            />
          }
        />
        <Route path="/comercial" element={<Comercial />} />
        <Route
          path="/propiedades"
          element={
            <ResultadosBusqueda
              selectedOptionsOperacion={selectedOptionsOperacion}
              setSelectedOptionsOperacion={setSelectedOptionsOperacion}
              selectedOptionsTipos={selectedOptionsTipos}
              setSelectedOptionsTipos={setSelectedOptionsTipos}
              aplicarFiltros={aplicarFiltros}
              setAplicarFiltros={setAplicarFiltros}
              precioMaximo={precioMaximo}
              setPrecioMaximo={setPrecioMaximo}
              precioMinimo={precioMinimo}
              setPrecioMinimo={setPrecioMinimo}
              setSelectedOptions={setSelectedOptions}
              selectedOptions={selectedOptions}
              menuClose={menuClose}
              setMenuClose={setMenuClose}
              propiedades={propiedades}
              setPropiedades={setPropiedades}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              manejoBusqueda={manejoBusqueda}
              setManejoBusqueda={setManejoBusqueda}
              propiedadesVisibles={propiedadesVisibles}
              setPropiedadesVisibles={setPropiedadesVisibles}
              setAutoCompleteHome={setAutoCompleteHome}
              busquedaHome={busquedaHome}
              nuevas={nuevas}
              setNuevas={setNuevas}
              seleccion={seleccion}
              setSeleccion={setSeleccion}
            />
          }
        />
        <Route
          path="/propiedades/seleccion/:id"
          element={
            <PropiedadSeleccion
              seleccion={seleccion}
              propiedades={propiedades}
              setPropiedades={setPropiedades}
            />
          }
        />
      </Routes>
    </>
  );
}
