import React, { useState } from "react";
import SectionFooter from "../../components/SectionFooter/SectionFooter";
import HeaderResultadoBusqueda from "../../components/HeaderResultadoBusqueda";
import SearchResultadosBusqueda from "../../components/SearchResultadosBusqueda";
import CantidadPropiedades from "../../components/CantidadPropiedades";
import CardResultado from "../../components/CardResultado";
import MenuFilter from "../../components/MenuFilter";

export default function ResultadosBusqueda() {

  const lisimg = [
    {
      id: 1,
      gallery: [
          "HomePageContent/pexels-fotoaibe-1571460 1.jpg",
          "HomePageContent/pexels-binyaminmellish-186077 1.jpg",
          "HomePageContent/pexels-houzlook-3797991.jpg",
        ],
        precio: "1,300,000.00 MXN",
        ubicacion: "Salvador Diaz, Venacruz",
        tipoPropiedad: "Local comercial",
        tipoOperacion: "Venta", // Puede ser "Venta" o "Renta"
        metrosCuadrados: "23 m²",
      },
      {
        id: 2,
        gallery: [
          "HomePageContent/pexels-binyaminmellish-186077 1.jpg",
          "HomePageContent/pexels-fotoaibe-1571460 1.jpg",
          "HomePageContent/pexels-houzlook-3797991.jpg",
        ],
        precio: "2,500,000.00 MXN",
        ubicacion: "Ciudad de México, CDMX",
        tipoPropiedad: "Departamento",
        tipoOperacion: "Renta",
        metrosCuadrados: "85 m²",
      },  
      {
        id: 2,
        gallery: [
          "HomePageContent/pexels-binyaminmellish-186077 1.jpg",
          "HomePageContent/pexels-fotoaibe-1571460 1.jpg",
          "HomePageContent/pexels-houzlook-3797991.jpg",
        ],
        precio: "2,500,000.00 MXN",
        ubicacion: "Ciudad de México, CDMX",
        tipoPropiedad: "Departamento",
        tipoOperacion: "Renta",
        metrosCuadrados: "85 m²",
      },  
    ];
    const [propiedades, setPropiedades] = useState(lisimg)
  const [menuClose, setMenuClose] = useState(true);

  

  return (
    <>
      <MenuFilter menuClose={menuClose} setMenuClose={setMenuClose} />
      <HeaderResultadoBusqueda />
      <SearchResultadosBusqueda  menuClose={menuClose} setMenuClose={setMenuClose} />
      <CantidadPropiedades propiedades={propiedades} />
      <CardResultado  propiedades={propiedades}/>
      <SectionFooter />
    </>
  );
}
