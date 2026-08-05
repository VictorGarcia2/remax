"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.vectorgrid";

interface PropertyData {
  id_propiedad: string;
  latitud: number;
  longitud: number;
  precio_valor: number;
  precio_m2_construccion: number | null;
  es_valido_para_valuacion: boolean;
  titulo?: string;
  colonia?: string;
  municipio?: string;
  m2_construidos?: number;
  tipo_propiedad?: string;
  url?: string;
}

interface HeatmapProps {
  data: PropertyData[];
  heatmapType: "density" | "price";
  agebStats: any;
}

export default function Heatmap({ data, heatmapType, agebStats }: HeatmapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const legendRef = useRef<L.Control | null>(null);
  const layerControlRef.current = null;
  const layerControlInstanceRef = useRef<L.Control.Layers | null>(null);
  const agebLayerRef = useRef<any>(null);
  const propertyLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Inicializar el mapa solo una vez
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [19.17, -96.13],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(mapRef.current);

      const baseMaps = {
        "Mapa Claro (CartoDB)": L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution: '&copy; CARTO',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(mapRef.current)
      };
      
      layerControlInstanceRef.current = L.control.layers(baseMaps, {}, { position: "topright" }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Helpers de color
    const getDensityColor = (d: number) => {
      return d > 100 ? '#800026' :
             d > 50  ? '#BD0026' :
             d > 20  ? '#E31A1C' :
             d > 10  ? '#FC4E2A' :
             d > 5   ? '#FD8D3C' :
             d > 2   ? '#FEB24C' :
             d > 0   ? '#FED976' :
                       'transparent';
    };

    const getPriceColor = (p: number) => {
      return p > 25000 ? '#005a32' :
             p > 20000 ? '#238443' :
             p > 15000 ? '#41ab5d' :
             p > 12000 ? '#78c679' :
             p > 9000  ? '#addd8e' :
             p > 0     ? '#d9f0a3' :
                         'transparent';
    };

    const getColorForStats = (stat: any, type: string) => {
      if (!stat) return "transparent";
      if (type === "density") {
        return getDensityColor(stat.count);
      } else {
        if (!stat.avg_precio_m2) return "transparent";
        return getPriceColor(stat.avg_precio_m2);
      }
    };

    const styleFunction = (properties: any) => {
      const { CVE_ENT, CVE_MUN, CVE_LOC, CVE_AGEB } = properties;
      const locPart = CVE_LOC || '0000';
      const agebId = `${CVE_ENT}_${CVE_MUN}_${locPart}_${CVE_AGEB}`;
      const stat = agebStats[agebId];
      
      const fillColor = getColorForStats(stat, heatmapType);
      
      return {
        weight: 1,
        color: stat ? '#ffffff' : '#e2e8f0',
        fillColor: fillColor,
        fillOpacity: stat ? 0.75 : 0.1,
        fill: true,
        opacity: stat ? 0.8 : 0.3
      };
    };

    // 1. DIBUJAR PUNTOS DE LAS 9,485 PROPIEDADES
    if (propertyLayerRef.current) {
      map.removeLayer(propertyLayerRef.current);
      layerControlInstanceRef.current?.removeLayer(propertyLayerRef.current);
    }

    const markersGroup = L.layerGroup();
    if (Array.isArray(data)) {
      data.forEach((prop: any) => {
        if (prop.latitud && prop.longitud) {
          const color = heatmapType === 'price' 
            ? getPriceColor(prop.precio_m2_construccion || 0) 
            : '#2563eb';

          const circle = L.circleMarker([prop.latitud, prop.longitud], {
            radius: 5,
            fillColor: color === 'transparent' ? '#3b82f6' : color,
            color: '#ffffff',
            weight: 1,
            opacity: 0.9,
            fillOpacity: 0.8
          });

          const title = prop.titulo || `${prop.tipo_propiedad || 'Propiedad'} en ${prop.colonia || prop.municipio || 'Veracruz'}`;
          const priceFormatted = prop.precio_valor ? `$${Number(prop.precio_valor).toLocaleString()} MXN` : 'N/A';
          const m2Formatted = prop.m2_construidos ? `${prop.m2_construidos} m²` : '';
          const m2PriceFormatted = prop.precio_m2_construccion ? `$${Math.round(prop.precio_m2_construccion).toLocaleString()} /m²` : '';
          
          const popupContent = `
            <div style="min-width: 190px;" class="p-1 font-sans">
              <strong style="display:block; font-size:13px; font-weight:700; color:#0f172a; margin-bottom:3px; line-height:1.2;">${title}</strong>
              <div style="font-size:11px; color:#64748b; margin-bottom:4px;">${prop.colonia ? prop.colonia + ', ' : ''}${prop.municipio || ''}</div>
              <div style="font-size:14px; font-weight:700; color:#1d4ed8; margin-bottom:3px;">${priceFormatted}</div>
              <div style="font-size:11px; color:#334155;">${m2Formatted} ${m2PriceFormatted ? '• ' + m2PriceFormatted : ''}</div>
              ${prop.url ? `<a href="${prop.url}" target="_blank" style="display:inline-block; margin-top:6px; font-size:11px; color:#0284c7; text-decoration:underline;">Ver Ficha ↗</a>` : ''}
            </div>
          `;

          circle.bindPopup(popupContent);
          markersGroup.addLayer(circle);
        }
      });
    }

    markersGroup.addTo(map);
    layerControlInstanceRef.current?.addOverlay(markersGroup, 'Puntos de Inmuebles (9,485)');
    propertyLayerRef.current = markersGroup;

    // 2. CARGAR CAPA AGEB
    if (agebLayerRef.current) {
      map.removeLayer(agebLayerRef.current);
      layerControlInstanceRef.current?.removeLayer(agebLayerRef.current);
    }

    fetch('/geojson/ageb.geojson')
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(geojsonData => {
        const layer = (L as any).vectorGrid.slicer(geojsonData, {
          vectorTileLayerStyles: {
            sliced: styleFunction
          },
          maxZoom: 22,
          zIndex: 2,
          interactive: true,
          getFeatureId: (f: any) => {
            const p = f.properties;
            return `${p.CVE_ENT}_${p.CVE_MUN}_${p.CVE_LOC || '0000'}_${p.CVE_AGEB}`;
          }
        });
        
        layer.on('mouseover', (e: any) => {
          const p = e.layer.properties;
          const agebId = `${p.CVE_ENT}_${p.CVE_MUN}_${p.CVE_LOC || '0000'}_${p.CVE_AGEB}`;
          const stat = agebStats[agebId];
          if (stat) {
            const popupContent = `
              <div class="p-1 font-sans">
                <strong class="block text-slate-800 border-b pb-1 mb-1 font-bold">${stat.colonia_predominante || 'Desconocida'}</strong>
                <span class="block text-slate-400 text-xs mb-1">AGEB: ${p.CVE_AGEB}</span>
                <span class="block text-slate-600">Propiedades: <b>${stat.count}</b></span>
                <span class="block text-slate-600">Precio prom: <b>${stat.avg_precio_m2 ? '$'+Math.round(stat.avg_precio_m2).toLocaleString() : 'N/A'} /m²</b></span>
              </div>
            `;
            L.popup()
              .setLatLng(e.latlng)
              .setContent(popupContent)
              .openOn(map);
          }
        });

        layer.addTo(map);
        layerControlInstanceRef.current?.addOverlay(layer, 'INEGI: AGEB Coropleta');
        agebLayerRef.current = layer;
      })
      .catch(e => console.info("AGEB GeoJSON no disponible, usando marcadores de puntos."));

    // LEYENDA
    if (legendRef.current) {
      map.removeControl(legendRef.current);
    }

    const legend = new L.Control({ position: 'bottomleft' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 text-slate-700 text-sm');
      
      let html = `<h4 class="font-bold mb-2 text-slate-800">${heatmapType === 'density' ? 'Propiedades Disponibles' : 'Precio Promedio /m²'}</h4>`;
      
      if (heatmapType === 'density') {
        const grades = [0, 2, 5, 10, 20, 50, 100];
        for (let i = 0; i < grades.length; i++) {
          html +=
            `<div class="flex items-center my-1"><i style="background:${getDensityColor(grades[i] + 1)}; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border-radius: 4px;"></i> ` +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+') + '</div>';
        }
      } else {
        const grades = [0, 9000, 12000, 15000, 20000, 25000];
        for (let i = 0; i < grades.length; i++) {
          html +=
            `<div class="flex items-center my-1"><i style="background:${getPriceColor(grades[i] + 1)}; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border-radius: 4px;"></i> $` +
            grades[i].toLocaleString() + (grades[i + 1] ? ' &ndash; $' + grades[i + 1].toLocaleString() : '+') + '</div>';
        }
      }
      div.innerHTML = html;
      return div;
    };
    legend.addTo(map);
    legendRef.current = legend;

  }, [data, heatmapType, agebStats]);

  return (
    <div id="map" className="w-full h-full z-0 absolute top-0 left-0" />
  );
}
