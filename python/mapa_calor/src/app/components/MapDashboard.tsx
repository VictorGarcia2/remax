"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import PropiedadesTabla from "./PropiedadesTabla";
import ControlScrapersModal from "./ControlScrapersModal";
import HistorialScrapersTab from "./HistorialScrapersTab";

// Importación dinámica apagando el SSR para Leaflet
const Heatmap = dynamic(() => import("./Heatmap"), { ssr: false });

export default function MapDashboard({ data, stats, agebStats }: { data: any[], stats: any, agebStats: any }) {
  const [activeTab, setActiveTab] = useState<"mapa" | "tabla" | "historial">("mapa");
  const [heatmapType, setHeatmapType] = useState<"density" | "price">("price");
  const [showScrapersModal, setShowScrapersModal] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans flex flex-col">
      {/* BARRA SUPERIOR DE NAVEGACIÓN Y ACCIONES */}
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center z-30 shadow-lg border-b-4 border-red-600">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-0.5">
            <span>RE/MAX CIN Intelligence</span>
            <span>•</span>
            <span>Panel Geoespacial & Base de Datos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Panel Inmobiliario de Inteligencia de Mercado
          </h1>
        </div>

        {/* CONTROLES PRINCIPALES */}
        <div className="flex flex-wrap items-center gap-4 mt-2 sm:mt-0">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab("mapa")}
              className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all ${
                activeTab === "mapa"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🗺️ Mapa de Calor
            </button>
            <button
              onClick={() => setActiveTab("tabla")}
              className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all ${
                activeTab === "tabla"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📊 Base de Datos Completa
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-all ${
                activeTab === "historial"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📜 Histórico & Precios
            </button>
          </div>

          <button
            onClick={() => setShowScrapersModal(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <span>⚡ Ejecutar Scrapers de Mercado</span>
          </button>
        </div>
      </header>

      {/* VISTA 1: MAPA DE CALOR LEAFLET AGEB */}
      {activeTab === "mapa" && (
        <div className="relative w-full flex-1 overflow-hidden">
          {/* MAPA DE FONDO */}
          <Heatmap data={data} heatmapType={heatmapType} agebStats={agebStats} />

          {/* PANEL LATERAL FLOTANTE */}
          <div className="absolute top-4 left-4 h-auto max-h-[85vh] w-80 bg-white/85 backdrop-blur-md border border-slate-200 p-5 z-20 flex flex-col shadow-2xl rounded-2xl text-slate-800">
            <div className="mb-4">
              <h2 className="font-bold text-slate-900 text-base">Modo de Capa Térmica</h2>
              <p className="text-xs text-slate-500 mt-0.5">Delimitación por AGEBs y Colonias de Veracruz</p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => setHeatmapType("price")}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-left transition-all ${
                  heatmapType === "price"
                    ? "bg-emerald-600 text-white shadow-md border border-emerald-400"
                    : "bg-white/70 hover:bg-white border border-slate-200 text-slate-700"
                }`}
              >
                🔥 Precio Promedio / m² (Calor)
              </button>

              <button
                onClick={() => setHeatmapType("density")}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-left transition-all ${
                  heatmapType === "density"
                    ? "bg-blue-600 text-white shadow-md border border-blue-400"
                    : "bg-white/70 hover:bg-white border border-slate-200 text-slate-700"
                }`}
              >
                📍 Densidad de Oferta por Zona
              </button>
            </div>

            <div className="bg-slate-100/90 rounded-xl p-4 border border-slate-200 space-y-2">
              <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Métricas Geoespaciales</h3>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Total Inmuebles en BD</span>
                <span className="font-mono font-bold text-slate-900">{stats.total_registros || data.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">AGEBs con Propiedades</span>
                <span className="font-mono font-bold text-emerald-600">{Object.keys(agebStats || {}).length} zonas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: TABLA COMPLETA DE BASE DE DATOS */}
      {activeTab === "tabla" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          <PropiedadesTabla data={data} />
        </div>
      )}

      {/* VISTA 3: HISTÓRICO DE SCRAPING Y MOVIMIENTOS DE MERCADO */}
      {activeTab === "historial" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          <HistorialScrapersTab />
        </div>
      )}

      {/* MODAL DE ORQUESTACIÓN DE SCRAPERS */}
      <ControlScrapersModal
        isOpen={showScrapersModal}
        onClose={() => setShowScrapersModal(false)}
      />
    </main>
  );
}
