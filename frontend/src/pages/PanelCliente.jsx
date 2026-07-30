import React, { useEffect, useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, DEFAULT_CENTER, DEFAULT_ZOOM } from '../config/googleMaps';
import Header from '../components/SectionHome/Header';
import SectionFooter from '../components/SectionFooter/SectionFooter';
import ControlScrapersModal from '../components/ControlScrapersModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PanelCliente = () => {
  const [activeTab, setActiveTab] = useState('mapa'); // 'mapa' | 'tabla'
  const [showScrapersModal, setShowScrapersModal] = useState(false);
  
  // Estado para Mapa de Calor / Puntos
  const [puntos, setPuntos] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapFilterFuente, setMapFilterFuente] = useState('');
  const [loadingMap, setLoadingMap] = useState(true);
  
  // Estado para Tabla
  const [catalogo, setCatalogo] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [fuenteFiltro, setFuenteFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('precio');
  const [orden, setOrden] = useState('desc');
  const [loadingTabla, setLoadingTabla] = useState(false);

  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  // Cargar Puntos para el Mapa
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/propiedades/heatpoints`)
      .then(res => res.json())
      .then(data => {
        setPuntos(data.puntos || []);
        setLoadingMap(false);
      })
      .catch(err => {
        console.error("Error cargando puntos del mapa:", err);
        setLoadingMap(false);
      });
  }, []);

  // Cargar Tabla Paginada
  const cargarTabla = (p = pagina, b = busqueda, f = fuenteFiltro, o = ordenarPor, ord = orden) => {
    setLoadingTabla(true);
    const params = new URLSearchParams({
      pagina: p.toString(),
      limite: '50',
      busqueda: b,
      fuente: f,
      ordenar_por: o,
      orden: ord
    });

    fetch(`${API_BASE_URL}/api/propiedades/catalogo?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCatalogo(data.propiedades || []);
        setTotalRegistros(data.total_registros || 0);
        setTotalPaginas(data.total_paginas || 1);
        setLoadingTabla(false);
      })
      .catch(err => {
        console.error("Error cargando catálogo:", err);
        setLoadingTabla(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'tabla') {
      cargarTabla(pagina, busqueda, fuenteFiltro, ordenarPor, orden);
    }
  }, [activeTab, pagina, fuenteFiltro, ordenarPor, orden]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setPagina(1);
    cargarTabla(1, busqueda, fuenteFiltro, ordenarPor, orden);
  };

  // Filtrar puntos para el mapa
  const puntosFiltrados = useMemo(() => {
    if (!mapFilterFuente) return puntos.slice(0, 1500); // Límite para rendimiento óptimo
    return puntos.filter(p => p.fuente.toLowerCase().includes(mapFilterFuente.toLowerCase())).slice(0, 1500);
  }, [puntos, mapFilterFuente]);

  // Exportar a CSV local
  const exportarCSV = () => {
    if (!catalogo.length) return;
    const headers = ["ID", "Fuente", "Precio", "m2_Construidos", "Precio_m2", "Recamaras", "Banos", "Colonia", "Municipio", "URL"];
    const rows = catalogo.map(p => [
      `"${p.id_propiedad || ''}"`,
      `"${p.fuente || ''}"`,
      p.precio_valor || 0,
      p.m2_construidos || 0,
      roundVal((p.precio_valor || 0) / (p.m2_construidos || 1)),
      p.recamaras || 0,
      p.banos || 0,
      `"${p.colonia || ''}"`,
      `"${p.municipio || ''}"`,
      `"${p.url_final || p.url_origen || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `propiedades_remax_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const roundVal = (v) => Math.round(v * 100) / 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      {/* ENCABEZADO PANEL DE CLIENTE */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-8 border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-1">
              <span>RE/MAX CIN Intelligence</span>
              <span>•</span>
              <span>Catálogo Multi-Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Panel de Inteligencia Inmobiliaria
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explorador integral de mercado con mapas de densidad y base de datos comparativa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowScrapersModal(true)}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>⚡ Ejecutar Scrapers de Mercado</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-right">
                <p className="text-xs text-slate-400">Total de Registros en BD</p>
                <p className="text-xl font-bold text-blue-400">10,659 Inmuebles</p>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-right">
                <p className="text-xs text-slate-400">Modelados por IA</p>
                <p className="text-xl font-bold text-emerald-400">8,455 Válidos</p>
              </div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div className="max-w-7xl mx-auto mt-6 flex gap-4 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'mapa'
                ? 'border-red-600 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🗺️ Mapa de Calor & Densidad</span>
          </button>

          <button
            onClick={() => setActiveTab('tabla')}
            className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'tabla'
                ? 'border-red-600 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📊 Base de Datos Completa (Tabla)</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* ========================================================================= */}
        {/* PESTAÑA 1: MAPA DE CALOR */}
        {/* ========================================================================= */}
        {activeTab === 'mapa' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Filtrar por Portal:</span>
                <select
                  value={mapFilterFuente}
                  onChange={(e) => setMapFilterFuente(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Todos los Portales (10,659)</option>
                  <option value="Inmuebles24">Inmuebles24</option>
                  <option value="Propiedades">Propiedades.com</option>
                  <option value="Lamudi">Lamudi</option>
                  <option value="Vivanuncios">Vivanuncios</option>
                  <option value="Remax">RE/MAX</option>
                </select>
              </div>

              <div className="text-xs text-slate-500">
                Mostrando <strong className="text-slate-800">{puntosFiltrados.length}</strong> muestras representativas de geolocalización en mapa.
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden h-[600px] relative">
              {!isLoaded || loadingMap ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <p className="text-slate-500 font-medium">Cargando mapa de inteligencia espacial...</p>
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                  }}
                >
                  {puntosFiltrados.map((pt, idx) => (
                    <Marker
                      key={pt.id || idx}
                      position={{ lat: pt.lat, lng: pt.lng }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: pt.precio_m2 > 20000 ? 8 : 5,
                        fillColor: pt.precio_m2 > 22000 ? '#E11B22' : pt.precio_m2 > 15000 ? '#003DA4' : '#10B981',
                        fillOpacity: 0.75,
                        strokeWeight: 1,
                        strokeColor: '#FFFFFF'
                      }}
                      onClick={() => setSelectedPoint(pt)}
                    />
                  ))}

                  {selectedPoint && (
                    <InfoWindow
                      position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
                      onCloseClick={() => setSelectedPoint(null)}
                    >
                      <div className="p-2 max-w-xs text-slate-800">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-800 mb-1">
                          {selectedPoint.fuente}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mb-1">
                          ${selectedPoint.precio.toLocaleString('es-MX')} MXN
                        </h4>
                        <p className="text-xs text-slate-600 mb-1">
                          ${selectedPoint.precio_m2.toLocaleString('es-MX')} / m²
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          📍 {selectedPoint.colonia || selectedPoint.municipio || 'Veracruz'}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 2: BASE DE DATOS COMPLETA (TABLA) */}
        {/* ========================================================================= */}
        {activeTab === 'tabla' && (
          <div className="space-y-4">
            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <form onSubmit={handleBuscar} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1 min-w-[260px] flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar por colonia, municipio, dirección o palabra clave..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                />
                <button type="submit" className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
                  Buscar
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={fuenteFiltro}
                  onChange={(e) => { setFuenteFiltro(e.target.value); setPagina(1); }}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800"
                >
                  <option value="">Todas las Fuentes</option>
                  <option value="Inmuebles24">Inmuebles24</option>
                  <option value="Propiedades">Propiedades.com</option>
                  <option value="Lamudi">Lamudi</option>
                  <option value="Vivanuncios">Vivanuncios</option>
                  <option value="Remax">RE/MAX</option>
                </select>

                <select
                  value={ordenarPor}
                  onChange={(e) => { setOrdenarPor(e.target.value); setPagina(1); }}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800"
                >
                  <option value="precio">Ordenar por Precio</option>
                  <option value="metros">Ordenar por Metros</option>
                  <option value="precio_m2">Ordenar por $/m²</option>
                </select>

                <button
                  type="button"
                  onClick={exportarCSV}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  📥 Exportar CSV
                </button>
              </div>
            </form>

            {/* TABLA DE PROPIEDADES */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Fuente</th>
                    <th className="px-4 py-3">Dirección / Colonia</th>
                    <th className="px-4 py-3 text-right">Precio (MXN)</th>
                    <th className="px-4 py-3 text-right">m² Const.</th>
                    <th className="px-4 py-3 text-right">$/m²</th>
                    <th className="px-4 py-3 text-center">Rec.</th>
                    <th className="px-4 py-3 text-center">Baños</th>
                    <th className="px-4 py-3">Municipio</th>
                    <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loadingTabla ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 text-slate-500">
                        Cargando propiedades de la base de datos...
                      </td>
                    </tr>
                  ) : catalogo.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 text-slate-500">
                        No se encontraron registros con los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    catalogo.map((prop, idx) => {
                      const pm2 = prop.precio_valor && prop.m2_construidos ? Math.round(prop.precio_valor / prop.m2_construidos) : 0;
                      return (
                        <tr key={prop.id_propiedad || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded ${
                              prop.fuente === 'Inmuebles24' ? 'bg-orange-100 text-orange-800' :
                              prop.fuente === 'Propiedades' || prop.fuente === 'Propiedades.com' ? 'bg-blue-100 text-blue-800' :
                              prop.fuente === 'Lamudi' ? 'bg-red-100 text-red-800' :
                              prop.fuente === 'Vivanuncios' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {prop.fuente || 'Desconocido'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate" title={prop.direccion || prop.colonia}>
                            {prop.colonia || prop.direccion || 'Sin colonia'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            ${(prop.precio_valor || 0).toLocaleString('es-MX')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {prop.m2_construidos || '-'} m²
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-700">
                            {pm2 ? `$${pm2.toLocaleString('es-MX')}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">{prop.recamaras || '-'}</td>
                          <td className="px-4 py-3 text-center">{prop.banos || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{prop.municipio || 'Veracruz'}</td>
                          <td className="px-4 py-3 text-center">
                            {prop.url_final ? (
                              <a
                                href={prop.url_final}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded text-xs font-semibold transition-colors"
                              >
                                Ver Portal ↗
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="flex flex-wrap justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-sm text-slate-600">
              <div>
                Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong> (Total: {totalRegistros.toLocaleString()} inmuebles)
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagina <= 1}
                  onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 font-medium"
                >
                  ← Anterior
                </button>
                <button
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas))}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 font-medium"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ControlScrapersModal isOpen={showScrapersModal} onClose={() => setShowScrapersModal(false)} />
      <SectionFooter />
    </div>
  );
};

export default PanelCliente;
