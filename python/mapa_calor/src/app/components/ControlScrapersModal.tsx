"use client";

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ControlScrapersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tipoInmueble, setTipoInmueble] = useState<'casas' | 'departamentos' | 'todos'>('casas');
  const [zona, setZona] = useState('veracruz');
  const [modo, setModo] = useState('rapido');
  const [limitePaginas, setLimitePaginas] = useState(10);
  const [portales, setPortales] = useState<string[]>([
    'lamudi',
    'propiedades_com',
    'vivanuncios',
    'remax_scraper',
    'playwright_inmuebles24'
  ]);

  const [status, setStatus] = useState<any>(null);
  const [loadingLaunch, setLoadingLaunch] = useState(false);

  useEffect(() => {
    let interval: any = null;
    const fetchStatus = () => {
      fetch(`${API_BASE_URL}/api/scrapers/status`)
        .then(res => res.json())
        .then(data => setStatus(data))
        .catch(err => console.error("Error consultando status scrapers:", err));
    };

    if (isOpen) {
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePortal = (portalId: string) => {
    if (portales.includes(portalId)) {
      setPortales(portales.filter(p => p !== portalId));
    } else {
      setPortales([...portales, portalId]);
    }
  };

  const handleIniciarScraping = () => {
    setLoadingLaunch(true);
    fetch(`${API_BASE_URL}/api/scrapers/ejecutar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_inmueble: tipoInmueble,
        zona: zona,
        modo: modo,
        limite_paginas: Number(limitePaginas),
        portales: portales
      })
    })
      .then(res => res.json())
      .then(data => {
        setLoadingLaunch(false);
        if (data.ok) {
          setStatus((prev: any) => ({
            ...prev,
            en_ejecucion: true,
            progreso: 5,
            portal_actual: 'Iniciando...',
            log: data.mensaje
          }));
        } else {
          alert(data.mensaje || "Error iniciando scraping");
        }
      })
      .catch(err => {
        setLoadingLaunch(false);
        alert("Error de conexión al backend VPS: " + err.message);
      });
  };

  const enEjecucion = status?.en_ejecucion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-slate-800 relative space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
              <span>⚡ Orquestador Multi-Portal</span>
              <span>•</span>
              <span>VPS Ubuntu Ready</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              Ejecución de Scrapers de Mercado
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* SI ESTÁ EN EJECUCIÓN */}
        {enEjecucion ? (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-blue-700 flex items-center gap-2">
                <span className="animate-spin text-base">🔄</span>
                <span>Procesando: <strong>{status?.portal_actual}</strong></span>
              </span>
              <span className="text-slate-600 font-mono">{status?.progreso || 0}%</span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${status?.progreso || 5}%` }}
              />
            </div>

            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
              &gt; {status?.log}
            </div>

            <p className="text-xs text-slate-500 text-center">
              Los scrapers se están ejecutando en modo Headless en el servidor VPS Ubuntu. La base de datos y la IA se re-entrenarán automáticamente al finalizar.
            </p>
          </div>
        ) : (
          /* FORMULARIO DE CONFIGURACIÓN */
          <div className="space-y-4 text-sm">
            {/* TIPO DE INMUEBLE */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">
                1. Selección de Tipo de Inmueble:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'casas', label: '🏠 Casas' },
                  { id: 'departamentos', label: '🏢 Departamentos' },
                  { id: 'todos', label: '🌐 Ambos / Todos' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTipoInmueble(item.id as any)}
                    className={`py-2.5 px-3 rounded-lg border font-semibold text-xs transition-all ${
                      tipoInmueble === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ZONA & MODO */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Zona Inmobiliaria:
                </label>
                <select
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                >
                  <option value="veracruz">Veracruz - Boca del Río</option>
                  <option value="tabasco">Tabasco / Villahermosa</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Modo de Scraping:
                </label>
                <select
                  value={modo}
                  onChange={(e) => setModo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                >
                  <option value="rapido">Rápido (Solo Nuevas)</option>
                  <option value="completo">Completo (Historial)</option>
                </select>
              </div>
            </div>

            {/* LÍMITE DE PÁGINAS */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                4. Límite de Páginas por Portal:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={limitePaginas}
                onChange={(e) => setLimitePaginas(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
              />
            </div>

            {/* PORTALES */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">
                5. Portales a Extraer:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'playwright_inmuebles24', label: 'Inmuebles24 (Playwright)' },
                  { id: 'propiedades_com', label: 'Propiedades.com' },
                  { id: 'lamudi', label: 'Lamudi México' },
                  { id: 'vivanuncios', label: 'Vivanuncios' },
                  { id: 'remax_scraper', label: 'RE/MAX Catálogo' }
                ].map(p => (
                  <label key={p.id} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portales.includes(p.id)}
                      onChange={() => togglePortal(p.id)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-700">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-sm"
          >
            Cerrar
          </button>

          {!enEjecucion && (
            <button
              type="button"
              disabled={loadingLaunch || portales.length === 0}
              onClick={handleIniciarScraping}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loadingLaunch ? 'Iniciando...' : '⚡ Iniciar Scraping de Mercado'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
