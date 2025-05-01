import { useEffect, useState } from "react";
import axios from "axios";
import Residencial from "./pages/Residencial";
import { Route, Routes } from "react-router";

import ResultadosBusqueda from "./pages/Buscador/ResultadosBusqueda";
import PropiedadSeleccion from "./pages/PropiedadSeleccion/PropiedadSeleccion";

import propierties from "/src/APi/propiedades.json";
import Eleccion from "./pages/Eleccion";
import NuestroEquipo from "./pages/NuestroEquipo";
import Poliza from "./pages/Poliza";
import TerminosyCondiciones from "./components/TerminosyCondiciones";
import CodigodeEtica from "./components/CodigodeEtica";
import PoliticadePrivacidad from "./components/PoliticadePrivacidad";
import ScrollToTop from "./components/ScrollTop";
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
  const [valor, setValor] = useState("residencial");

  /*  useEffect(() => {
    fetch("https://us-central1-remax-api.cloudfunctions.net/api/propiedades", {
      method: "GET",
      headers: {
        "Authorization": "Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t",
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(data => {
        setPropiedades(data.data.rows); // O ajusta según estructura de tu API
      })
      .catch(error => console.error("Error:", error));
  }, [busquedaHome]); */

  /*  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          "https://us-central1-remax-api.cloudfunctions.net/api/propiedades"
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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Eleccion setValor={setValor} />} />
        <Route
          path={"/inicio"}
          element={
            <Residencial
              propiedades={propiedades}
              valor={valor}
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
        <Route
          path={"/NuestroEquipo"}
          element={<NuestroEquipo propiedades={propiedades} />}
        />
        <Route path="/Polizas-de-renta" element={<Poliza />} />
        {/* terminos y condiciones */}
        <Route
          path="/terminos-y-condiciones"
          element={<TerminosyCondiciones />}
        />
        {/* codigo de etica */}
        <Route path="/codigo-de-etica" element={<CodigodeEtica />} />
        {/* aviso de privacidad */}
        <Route
          path="/politica-de-privacidad"
          element={<PoliticadePrivacidad />}
        />
      </Routes>
    </>
  );
}
