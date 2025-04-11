import React, { useEffect, useState } from "react";
import Residencial from "./pages/Residencial";
import { Route, Routes } from "react-router";
import Comercial from "./pages/Comercial";
import ResultadosBusqueda from "./pages/Buscador/ResultadosBusqueda";
import PropiedadSeleccion from "./pages/PropiedadSeleccion/PropiedadSeleccion";
import axios from "axios";

export default function App() {
  const lisimg = [
    {
      direccion: "Calle Juárez #98, Col. Centro, Comalcalco",
      tipoPropiedad: "Casa",
      precio: 1950000,
      tipoTransaccion: "Venta",
      sector: "Residencial",
      lat: 18.2635,
      lng: -93.2236,
      imagenes: [
        "https://images.unsplash.com/photo-1537726235470-8504e3beef77?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      direccion: "Av. Paseo Usumacinta #321, Col. Carrizal, Villahermosa",
      tipoPropiedad: "Departamento",
      precio: 15000,
      tipoTransaccion: "Renta",
      sector: "Comercial",
      lat: 17.9987,
      lng: -92.9504,
      imagenes: [
        "https://images.unsplash.com/photo-1606744888344-493238951221?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      direccion: "Calle Reforma Agraria #12, Col. Deportiva, Cunduacán",
      tipoPropiedad: "Casa",
      precio: 1650000,
      tipoTransaccion: "Venta",
      sector: "Residencial",
      lat: 18.0664,
      lng: -93.1747,
      imagenes: [
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      direccion: "C. Mario Trujillo García 184",
      tipoPropiedad: "Departamento",
      precio: 10000,
      tipoTransaccion: "Renta",
      sector: "Comercial",
      lat: 18.1401,
      lng: -93.0487,
      imagenes: [
        "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      direccion: "Circuito Tabasco 2000 #890, Villahermosa",
      tipoPropiedad: "Casa",
      precio: 2200000,
      tipoTransaccion: "Venta",
      sector: "Residencial",
      lat: 18.0079,
      lng: -92.9265,
      imagenes: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
    },
    {
      direccion: "Calle 20 de Noviembre #254, Col. Gaviotas Sur, Villahermosa",
      tipoPropiedad: "Casa",
      precio: 2900000,
      tipoTransaccion: "Venta",
      sector: "Residencial",
      lat: 17.9875,
      lng: -92.9221,
      imagenes: [
        "https://plus.unsplash.com/premium_photo-1684506396899-ad9963e6a7bb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://plus.unsplash.com/premium_photo-1670360414483-64e6d9ba9038?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      amenidades: ["Alberca", "Jacuzzi", "Cochera para 3 autos"],
      metrosCuadrados: 220,
      descripcion:
        "Casa con espacios amplios, 4 recámaras, estudio, salón de juegos, y una hermosa alberca.",
      tiempoConstruida: "15 años",
      zonas: ["Parque Central", "Escuelas", "Supermercados"],
      facilidades: ["Sistema de riego", "Cerca eléctrica"],
      contactoAgente: {
        nombre: "Laura Torres",
        celular: "+52 993 112 3456",
        redesSociales: {
          facebook: "https://facebook.com/lauratorres",
          instagram: "https://instagram.com/lauratorres",
        },
        imagenAgente: "https://example.com/agente5.jpg",
      },
    },
    {
      direccion: "Calle 27 de Febrero #188, Col. Magisterial, Villahermosa",
      tipoPropiedad: "Casa",
      precio: 1800000,
      tipoTransaccion: "Venta",
      sector: "Residencial",
      lat: 17.9854,
      lng: -92.9492,
      imagenes: [
        "https://images.unsplash.com/photo-1571029747916-6cf9444c8b3c?q=80&w=1240&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1532914819444-3a38e82a2ed7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      amenidades: ["Patio", "Cochera techada", "Alberca compartida"],
      metrosCuadrados: 180,
      descripcion:
        "Hermosa casa con 3 recámaras, 2 baños, amplio patio y excelente ubicación.",
      tiempoConstruida: "12 años",
      zonas: ["Parque de la Mujer", "Tiendas", "Cines"],
      facilidades: ["Ventiladores", "Cisterna"],
      contactoAgente: {
        nombre: "Carlos Medina",
        celular: "+52 993 345 6789",
        redesSociales: {
          facebook: "https://facebook.com/carlosmedina",
          instagram: "https://instagram.com/carlosmedina",
        },
        imagenAgente: "https://example.com/agente6.jpg",
      },
    },
    {
      direccion:
        "Calle 16 de Septiembre #78, Col. Primero de Mayo, Villahermosa",
      tipoPropiedad: "Casa",
      precio: 3500000,
      tipoTransaccion: "Venta",
      sector: "Residencial",
      lat: 17.9756,
      lng: -92.9521,
      imagenes: [
        "https://images.unsplash.com/photo-1576121186435-8f050a9ebf47?q=80&w=1230&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1574083243586-39bb1d178f78?q=80&w=1184&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      amenidades: ["Cochera doble", "Estudio", "Jardín privado"],
      metrosCuadrados: 280,
      descripcion:
        "Casa de lujo con 5 recámaras, amplios espacios y acabados de alta calidad.",
      tiempoConstruida: "20 años",
      zonas: [
        "Plaza Tabasco 2000",
        "Teatro Esperanza Iris",
        "Restaurantes exclusivos",
      ],
      facilidades: ["Sistema de audio", "Iluminación automatizada"],
      contactoAgente: {
        nombre: "Gerardo Díaz",
        celular: "+52 993 678 9101",
        redesSociales: {
          facebook: "https://facebook.com/gerardodiaz",
          instagram: "https://instagram.com/gerardodiaz",
        },
        imagenAgente: "https://example.com/agente7.jpg",
      },
    },
    {
      direccion: "Calle Hidalgo #145, Col. Casa Blanca, Villahermosa",
      tipoPropiedad: "Departamento",
      precio: 10000,
      tipoTransaccion: "Renta",
      sector: "Comercial",
      lat: 17.9653,
      lng: -92.9319,
      imagenes: [
        "https://images.unsplash.com/photo-1561583684-5f9c9ea719ea?q=80&w=1156&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1561883257-01346d28e2cc?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      amenidades: ["Balcón", "Cocina equipada", "Aire acondicionado"],
      metrosCuadrados: 65,
      descripcion:
        "Cómodo departamento con 1 recámara, 1 baño, aire acondicionado y excelente ubicación.",
      tiempoConstruida: "7 años",
      zonas: ["Cines", "Plaza de la Tecnología", "Parques"],
      facilidades: ["Servicio de limpieza", "Vigilancia"],
      contactoAgente: {
        nombre: "Mónica González",
        celular: "+52 993 432 1234",
        redesSociales: {
          facebook: "https://facebook.com/monicagonzalez",
          instagram: "https://instagram.com/monicagonzalez",
        },
        imagenAgente: "https://example.com/agente8.jpg",
      },
    },
    {
      direccion: "Av. Gregorio Méndez 123, Villahermosa, Tabasco",
      tipoPropiedad: "Casa",
      precio: 2500000,
      tipoTransaccion: "Venta",
      sector: "Residencial",
      lat: 17.9949,
      lng: -92.9273,
      imagenes: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1100&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      direccion: "Av. Universidad #300, Col. Tamulté, Villahermosa",
      tipoPropiedad: "Departamento",
      precio: 12000,
      tipoTransaccion: "Renta",
      sector: "Comercial",
      lat: 18.0027,
      lng: -92.9203,
      imagenes: [
        "https://images.unsplash.com/photo-1503174971373-b1f69850bded?q=80&w=1213&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      direccion: "Av. Paseo Usumacinta #321, Col. Carrizal, Villahermosa",
      tipoPropiedad: "Departamento",
      precio: 15000,
      tipoTransaccion: "Renta",
      sector: "Comercial",
      lat: 17.9987,
      lng: -92.9504,
      imagenes: [
        "https://images.unsplash.com/photo-1606744888344-493238951221?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
  ];

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
  useEffect(() => {
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
  }, [busquedaHome]);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Residencial
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
