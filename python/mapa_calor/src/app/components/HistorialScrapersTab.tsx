"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HistorialScrapersTab() {
  const [corridas, setCorridas] = useState<any[]>([]);
  const [cambiosPrecio, setCambiosPrecio] = useState<any[]>([]);
  const [bajas, setBajas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/scrapers/historial`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/scrapers/cambios-precio`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/scrapers/bajas`).then(r => r.json())
    ])
      .then(([resHist, resCambios, resBajas]) => {
        setCorridas(resHist.corridas || []);
        setCambiosPrecio(resCambios.propiedades || []);
        setBajas(resBajas.propiedades || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando historial de scrapers:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl shadow border border-slate-200 text-center text-slate-500">
        Cargando historial de barridos y movimientos de mercado...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-800">
      
      {/* SECCIÓN 1: BITÁCORA DE BARRIDOS DE MERCADO */}
      <section className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-600">
              <span>Bitácora Auditada</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              📜 Historial de Ejecuciones de Scraping
            </h3>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
            {corridas.length} Corridas Registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">ID Corrida</th>
                <th className="px-4 py-3">Fecha / Hora</th>
                <th className="px-4 py-3">Inmueble / Zona</th>
                <th className="px-4 py-3 text-right">Procesados</th>
                <th className="px-4 py-3 text-right">Nuevos (+)</th>
                <th className="px-4 py-3 text-right">Precios (Δ)</th>
                <th className="px-4 py-3 text-right">Bajas (-)</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {corridas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-500">
                    No hay registros de scraping archivados aún.
                  </td>
                </tr>
              ) : (
                corridas.map((c, idx) => (
                  <tr key={c.run_id || idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{c.run_id}</td>
                    <td className="px-4 py-3 text-slate-600">{c.fecha}</td>
                    <td className="px-4 py-3 font-medium">
                      <span className="uppercase text-xs font-bold text-slate-800">{c.tipo_inmueble}</span> en {c.zona}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{c.total_procesados?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">+{c.nuevas_agregadas}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600">{c.precios_modificados}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">-{c.bajas_detectadas}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                        {c.estado || 'Completado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN 2: AJUSTES Y VARIACIONES DE PRECIO DE MERCADO */}
      <section className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
              <span>Monitoreo de Descuentos</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              🔻 Registro de Propiedades con Ajuste de Precio
            </h3>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
            {cambiosPrecio.length} Variaciones Detectadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Fuente</th>
                <th className="px-4 py-3">Colonia / Ubicación</th>
                <th className="px-4 py-3 text-right">Precio Anterior</th>
                <th className="px-4 py-3 text-right">Precio Nuevo</th>
                <th className="px-4 py-3 text-right">Ajuste ($ / %)</th>
                <th className="px-4 py-3 text-center">Fecha Cambio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cambiosPrecio.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500">
                    No se han detectado variaciones de precio en las últimas corridas.
                  </td>
                </tr>
              ) : (
                cambiosPrecio.map((p, idx) => {
                  const cambio = p.ultimo_cambio_precio || {};
                  const esBajada = (cambio.diferencia || 0) < 0;
                  return (
                    <tr key={p.id_propiedad || idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded">
                          {p.fuente}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.colonia || p.municipio}</td>
                      <td className="px-4 py-3 text-right text-slate-500 line-through">
                        ${(cambio.precio_anterior || 0).toLocaleString('es-MX')}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        ${(cambio.precio_nuevo || p.precio_valor || 0).toLocaleString('es-MX')}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${esBajada ? 'text-emerald-600' : 'text-red-600'}`}>
                        {esBajada ? '🔻' : '🔺'} ${Math.abs(cambio.diferencia || 0).toLocaleString('es-MX')} ({cambio.porcentaje}%)
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">{cambio.fecha}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN 3: PROPIEDADES DADAS DE BAJA / VENDIDAS & DÍAS EN MERCADO */}
      <section className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-600">
              <span>Métrica Days on Market (DOM)</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              🚪 Propiedades Retiradas / Vendidas del Mercado
            </h3>
          </div>
          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
            {bajas.length} Bajas Registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Fuente</th>
                <th className="px-4 py-3">Ubicación / Colonia</th>
                <th className="px-4 py-3 text-right">Último Precio</th>
                <th className="px-4 py-3 text-center">Días en Mercado (DOM)</th>
                <th className="px-4 py-3 text-center">Fecha de Baja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bajas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500">
                    No se han registrado bajas o despublicaciones en el catálogo reciente.
                  </td>
                </tr>
              ) : (
                bajas.map((p, idx) => (
                  <tr key={p.id_propiedad || idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{p.fuente}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.colonia || p.municipio}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      ${(p.precio_valor || 0).toLocaleString('es-MX')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                        ⏱️ {p.dias_en_mercado || 1} días
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-600">{p.fecha_baja || 'Reciente'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
