import React, { useState } from "react";
import Residencial from "./pages/Residencial";
import { Route, Routes } from "react-router";
import Comercial from "./pages/Comercial";
import ResultadosBusqueda from "./pages/Buscador/ResultadosBusqueda";
import PropiedadSeleccion from "./pages/PropiedadSeleccion/PropiedadSeleccion";
export default function App() {
  const lisimg = [
    {
      tipoPropiedad: "Casa",
      precio: 2500000,
      tipoTransaccion: "Venta",
      direccion: "Calle Principal #123, Colonia Centro",
      sector: "Residencial",
      imagenes: [
        "HomePageContent/pexels-fotoaibe-1571460 1.jpg",
        "HomePageContent/pexels-binyaminmellish-186077 1.jpg",
        "HomePageContent/pexels-houzlook-3797991.jpg",
      ],
      amenidades: ["Alberca", "Jardín", "Cochera para 2 autos"],
      metrosCuadrados: 200,
      descripcion:
        "Amplia casa con 3 habitaciones, 2 baños, cocina integral y jardín.",
      tiempoConstruida: "10 años",
      zonas: ["Parque cercano", "Escuelas", "Centro comercial"],
      facilidades: ["Seguridad 24/7", "Área de juegos infantiles"],
      contactoAgente: {
        nombre: "Juan Pérez",
        celular: "+52 55 1234 5678",
        redesSociales: {
          facebook: "https://facebook.com/juanperez",
          instagram: "https://instagram.com/juanperez",
        },
        imagenAgente: "https://example.com/agente.jpg",
      },
    },
    {
      tipoPropiedad: "Departamento",
      precio: 12000,
      tipoTransaccion: "Renta",
      direccion: "Avenida Reforma #456, Colonia Moderna",
      sector: "Comercial",
      imagenes: [
        "HomePageContent/pexels-binyaminmellish-186077 1.jpg",
        "HomePageContent/pexels-houzlook-3797991.jpg",
        "HomePageContent/pexels-fotoaibe-1571460 1.jpg",
      ],
      amenidades: ["Gimnasio", "Terraza", "Estacionamiento subterráneo"],
      metrosCuadrados: 80,
      descripcion:
        "Departamento moderno con 1 habitación, 1 baño, cocina equipada y vista a la ciudad.",
      tiempoConstruida: "5 años",
      zonas: ["Zona financiera", "Restaurantes", "Transporte público"],
      facilidades: ["Concierge", "Salón de eventos"],
      contactoAgente: {
        nombre: "María López",
        celular: "+52 55 8765 4321",
        redesSociales: {
          facebook: "https://facebook.com/marialopez",
          instagram: "https://instagram.com/marialopez",
        },
        imagenAgente: "https://example.com/agente2.jpg",
      },
    },
  ];
  const [propiedades, setPropiedades] = useState(lisimg);

  const [menuClose, setMenuClose] = useState(true);
  return (
    <>
      <Routes>
        <Route path="/" element={<Residencial />} />
        <Route path="/comercial" element={<Comercial />} />
        <Route
          path="/resultado"
          element={
            <ResultadosBusqueda
              menuClose={menuClose}
              setMenuClose={setMenuClose}
              propiedades={propiedades}
              setPropiedades={setPropiedades}
            />
          }
        />
        <Route
          path="/seleccion"
          element={
            <PropiedadSeleccion
              propiedades={propiedades}
              setPropiedades={setPropiedades}
            />
          }
        />
      </Routes>
    </>
  );
}
