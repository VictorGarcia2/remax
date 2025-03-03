import React from "react";
import Residencial from "./pages/Residencial";
import { Route, Routes } from "react-router";
import Comercial from "./pages/Comercial";
import ResultadosBusqueda from "./pages/Buscador/ResultadosBusqueda";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Residencial />} />
        <Route path="/comercial" element={<Comercial />} />
        <Route path="/resultado" element={<ResultadosBusqueda />} />
      </Routes>
    </>
  );
}
