"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PropiedadesTabla({ data }: { data: any[] }) {
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [fuenteFiltro, setFuenteFiltro] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("precio");
  const [orden, setOrden] = useState("desc");
  const [loading, setLoading] = useState(false);

  const cargarTabla = (p = pagina, b = busqueda, f = fuenteFiltro, o = ordenarPor, ord = orden) => {
    setLoading(true);
    const params = new URLSearchParams({
      pagina: p.toString(),
      limite: "50",
      busqueda: b,
      fuente: f,
      ordenar_por: o,
      orden: ord
    });

    fetch(`${API_BASE_URL}/api/propiedades/catalogo?${params.toString()}`)
      .then(res => res.json())
      .then(resData => {
        setCatalogo(resData.propiedades || []);
        setTotalRegistros(resData.total_registros || 0);
        setTotalPaginas(resData.total_paginas || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando catálogo:", err);
        // Fallback local sobre los props iniciales
        let localData = [...data];
        if (f) localData = localData.filter(item => (item.fuente || "").toLowerCase().includes(f.toLowerCase()));
        if (b) localData = localData.filter(item => (item.colonia || "").toLowerCase().includes(b.toLowerCase()) || (item.municipio || "").toLowerCase().includes(b.toLowerCase()));
        setCatalogo(localData.slice((p-1)*50, p*50));
        setTotalRegistros(localData.length);
        setTotalPaginas(Math.ceil(localData.length / 50) || 1);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarTabla(pagina, busqueda, fuenteFiltro, ordenarPor, orden);
  }, [pagina, fuenteFiltro, ordenarPor, orden]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    cargarTabla(1, busqueda, fuenteFiltro, ordenarPor, orden);
  };

  const exportarCSV = () => {
    if (!catalogo.length) return;
    const headers = ["ID", "Fuente", "Precio", "m2_Construidos", "Precio_m2", "Recamaras", "Banos", "Colonia", "Municipio", "URL"];
    const rows = catalogo.map(p => [
      `"${p.id_propiedad || ''}"`,
      `"${p.fuente || ''}"`,
      p.precio_valor || 0,
      p.m2_construidos || 0,
      Math.round((p.precio_valor || 0) / (p.m2_construidos || 1)),
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
    link.setAttribute("download", `catalogo_propiedades_remax_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500">
                  Cargando catálogo completo de la base de datos...
                </td>
              </tr>
            ) : catalogo.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500">
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
                      {(prop.url_final || prop.url_origen) ? (
                        <a
                          href={prop.url_final || prop.url_origen}
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
  );
}
