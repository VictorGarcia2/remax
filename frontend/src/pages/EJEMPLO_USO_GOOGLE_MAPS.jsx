// Ejemplo de cómo usar GoogleMapaPropiedades en Residencial.jsx o Comercial.jsx
// Este es un archivo de ejemplo - NO reemplazar archivos existentes sin revisión

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import HomeSearch from "../components/SectionHome/HomeSearch";
import GoogleMapaPropiedades from "../components/GoogleMapaPropiedades";
// import MapboxConCards from "../components/Mapbox"; // COMENTAR O ELIMINAR
import { useSearchContext } from "../context/SearchContext";
import axios from "axios";

export default function EjemploResidencial() {
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadesFiltradas, setPropiedadesFiltradas] = useState([]);
  const [propiedadesVisibles, setPropiedadesVisibles] = useState([]);
  const { valor } = useSearchContext(); // "residencial" o "comercial"

  // Obtener propiedades de la API
  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const response = await axios.get('https://remaxcin.com/api/propiedades');
        const data = response.data.data.rows;
        
        // Filtrar por sector
        const filtradas = data.filter(prop => prop.sector === valor);
        setPropiedades(filtradas);
        setPropiedadesFiltradas(filtradas);
      } catch (error) {
        console.error('Error al obtener propiedades:', error);
      }
    };

    fetchPropiedades();
  }, [valor]);

  return (
    <main className="min-h-screen bg-white w-full">
      <Helmet>
        <title>Propiedades Residenciales en Venta Veracruz | RE/MAX CIN</title>
        <meta name="description" content="..." />
        <link rel="canonical" href="https://remaxcin.com/residencial" />
      </Helmet>

      {/* Hero con buscador */}
      <section className="relative">
        <HomeSearch valor={valor} />
      </section>

      {/* Sección del mapa */}
      <section className="py-10 px-4 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Explora propiedades en el mapa
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mapa - 2/3 del espacio en desktop */}
            <div className="lg:col-span-2">
              <div className="w-full h-[400px] lg:h-[700px] rounded-xl overflow-hidden shadow-lg">
                <GoogleMapaPropiedades
                  propiedades={propiedadesFiltradas}
                  setPropiedadesVisibles={setPropiedadesVisibles}
                  valor={valor}
                />
              </div>
            </div>

            {/* Lista de propiedades visibles - 1/3 del espacio */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-4 max-h-[700px] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">
                  Propiedades visibles ({propiedadesVisibles.length})
                </h3>
                
                <div className="space-y-4">
                  {propiedadesVisibles.map(prop => (
                    <div key={prop.propiedad_id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <img
                        src={`https://cdn.remax.com.mx/properties/${prop.propiedad_id}/${prop.imagenes?.split(',')[0]}`}
                        alt={prop.titulo}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <h4 className="font-bold text-lg">
                        ${(prop.mxn_corriente / 1000000).toFixed(1)}M MXN
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {prop.calle}
                      </p>
                      <a
                        href={`/propiedades/seleccion/${prop.propiedad_id}`}
                        className="mt-2 block w-full text-center py-2 bg-blueRemax text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Ver detalles
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resto de secciones... */}
    </main>
  );
}
