import React, { useEffect, useState } from "react";
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
      direccion: "Calle 27 de Febrero #456, Col. Centro, Villahermosa",
      sector: "Residencial",
      imagenes: [
        "HomePageContent/nathan-fertig-FBXuXp57eM0-unsplash.webp",
        "HomePageContent/diapo1.webp",
        "HomePageContent/diapo2.webp",
      ],
      amenidades: ["Alberca", "Jardín", "Cochera para 2 autos"],
      metrosCuadrados: 200,
      descripcion:
        "Amplia casa con 3 habitaciones, 2 baños, cocina integral y jardín.",
      tiempoConstruida: "10 años",
      zonas: ["Parque Tomás Garrido", "Escuelas", "Plaza Altabrisa"],
      facilidades: ["Seguridad 24/7", "Área de juegos infantiles"],
      contactoAgente: {
        nombre: "Juan Pérez",
        celular: "+52 993 123 4567",
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
      direccion: "Av. Universidad #300, Col. Tamulté, Villahermosa",
      sector: "Comercial",
      imagenes: [
        "HomePageContent/nathan-fertig-FBXuXp57eM0-unsplash.webp",
        "HomePageContent/diapo1.webp",
        "HomePageContent/diapo2.webp",
      ],
      amenidades: ["Gimnasio", "Terraza", "Estacionamiento subterráneo"],
      metrosCuadrados: 80,
      descripcion:
        "Departamento moderno con 1 habitación, 1 baño, cocina equipada y vista a la ciudad.",
      tiempoConstruida: "5 años",
      zonas: ["UJAT", "Restaurantes", "Transporte público"],
      facilidades: ["Concierge", "Salón de eventos"],
      contactoAgente: {
        nombre: "María López",
        celular: "+52 993 876 5432",
        redesSociales: {
          facebook: "https://facebook.com/marialopez",
          instagram: "https://instagram.com/marialopez",
        },
        imagenAgente: "https://example.com/agente2.jpg",
      },
    },
    {
      tipoPropiedad: "Casa",
      precio: 1950000,
      tipoTransaccion: "Venta",
      direccion: "Calle Juárez #98, Col. Centro, Comalcalco",
      sector: "Residencial",
      imagenes: [
        "HomePageContent/diapo1.webp",
        "HomePageContent/diapo2.webp",
      ],
      amenidades: ["Patio amplio", "Cochera techada", "Cisterna"],
      metrosCuadrados: 150,
      descripcion:
        "Casa familiar con acabados rústicos, 3 recámaras, cocina integral y patio con árboles frutales.",
      tiempoConstruida: "8 años",
      zonas: ["Zona arqueológica", "Mercado", "Escuelas primarias"],
      facilidades: ["Acceso pavimentado", "Servicios básicos"],
      contactoAgente: {
        nombre: "Pedro Ramírez",
        celular: "+52 933 789 1011",
        redesSociales: {
          facebook: "https://facebook.com/pedroramirez",
          instagram: "https://instagram.com/pedroramirez",
        },
        imagenAgente: "https://example.com/agente3.jpg",
      },
    },
    {
      tipoPropiedad: "Departamento",
      precio: 15000,
      tipoTransaccion: "Renta",
      direccion: "Av. Paseo Usumacinta #321, Col. Carrizal, Villahermosa",
      sector: "Comercial",
      imagenes: [
        "HomePageContent/diapo2.webp",
        "HomePageContent/diapo1.webp",
      ],
      amenidades: ["Elevador", "Roof Garden", "CCTV"],
      metrosCuadrados: 90,
      descripcion:
        "Penthouse de lujo con acabados modernos, cocina equipada y gran iluminación natural.",
      tiempoConstruida: "3 años",
      zonas: ["Zona hotelera", "Plaza Las Américas", "Hospital Ángeles"],
      facilidades: ["Acceso controlado", "Estacionamiento techado"],
      contactoAgente: {
        nombre: "Claudia Gómez",
        celular: "+52 993 555 6677",
        redesSociales: {
          facebook: "https://facebook.com/claudiagomez",
          instagram: "https://instagram.com/claudiagomez",
        },
        imagenAgente: "https://example.com/agente4.jpg",
      },
    },
    {
      tipoPropiedad: "Casa",
      precio: 1650000,
      tipoTransaccion: "Venta",
      direccion: "Calle Reforma Agraria #12, Col. Deportiva, Cunduacán",
      sector: "Residencial",
      imagenes: [
        "HomePageContent/diapo1.webp",
        "HomePageContent/diapo2.webp",
      ],
      amenidades: ["Terraza", "Patio trasero", "Área de lavado"],
      metrosCuadrados: 130,
      descripcion:
        "Casa acogedora ideal para familia pequeña, con 2 habitaciones y excelente ubicación.",
      tiempoConstruida: "6 años",
      zonas: ["Campo deportivo", "Escuelas", "Zona tranquila"],
      facilidades: ["Acceso pavimentado", "Agua potable"],
      contactoAgente: {
        nombre: "Héctor Castillo",
        celular: "+52 933 555 2233",
        redesSociales: {
          facebook: "https://facebook.com/hectorcastillo",
          instagram: "https://instagram.com/hectorcastillo",
        },
        imagenAgente: "https://example.com/agente5.jpg",
      },
    },
    {
      tipoPropiedad: "Departamento",
      precio: 10000,
      tipoTransaccion: "Renta",
      direccion: "Calle Miguel Hidalgo #45, Centro, Paraíso",
      sector: "Comercial",
      imagenes: [
        "HomePageContent/diapo1.webp",
        "HomePageContent/diapo2.webp",
      ],
      amenidades: ["Balcón", "Internet incluido", "Estacionamiento privado"],
      metrosCuadrados: 70,
      descripcion:
        "Departamento cómodo para profesionistas, ubicado cerca del corredor energético.",
      tiempoConstruida: "2 años",
      zonas: ["Zona portuaria", "Tiendas", "Transporte"],
      facilidades: ["Acceso controlado", "Aire acondicionado"],
      contactoAgente: {
        nombre: "Karina Ríos",
        celular: "+52 933 444 8899",
        redesSociales: {
          facebook: "https://facebook.com/karinarios",
          instagram: "https://instagram.com/karinarios",
        },
        imagenAgente: "https://example.com/agente6.jpg",
      },
    },
    {
      tipoPropiedad: "Casa",
      precio: 2200000,
      tipoTransaccion: "Venta",
      direccion: "Circuito Tabasco 2000 #890, Villahermosa",
      sector: "Residencial",
      imagenes: [
        "HomePageContent/diapo1.webp",
        "HomePageContent/diapo2.webp",
      ],
      amenidades: ["Sala de TV", "Closets de madera", "Bodega"],
      metrosCuadrados: 180,
      descripcion:
        "Casa moderna en fraccionamiento privado, con detalles de lujo y acabados en mármol.",
      tiempoConstruida: "4 años",
      zonas: ["City Center", "Hospital del Niño", "Cines"],
      facilidades: ["Vigilancia 24/7", "Áreas verdes comunes"],
      contactoAgente: {
        nombre: "Luis Méndez",
        celular: "+52 993 101 2020",
        redesSociales: {
          facebook: "https://facebook.com/luismendez",
          instagram: "https://instagram.com/luismendez",
        },
        imagenAgente: "https://example.com/agente7.jpg",
      },
    }
    // Puedes agregar 3 más en la misma línea si quieres 10 exactos.
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
