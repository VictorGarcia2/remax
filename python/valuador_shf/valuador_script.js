// Valuador Experto AI v2 - Precio por M2 Zonal + KNN Local + SHF + DENUE
// -----------------------------------------------------------------------
// Mejoras principales vs v1:
//   1. Prioriza testigos de la MISMA ZONA antes de buscar en todo el dataset
//   2. Usa precio/m2 de la zona como ancla principal (no IDW crudo)
//   3. Reduce amenidades de sumas fijas a porcentajes del precio base
//   4. Filtra outliers (propiedades con precio/m2 extremo)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('valuation-form');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const resultsContent = document.getElementById('results-content');

    let dataset = [];
    let shfData = {};
    const INEGI_TOKEN = "c88a6044-6526-44b4-bcc3-471732ce3c6f";
    const DENUE_RADIO = 1000;

    // Haversine
    function getDistanceInKm(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2)**2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    const formatCurrency = (val) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

    // DENUE
    async function buscarDenue(keyword, lat, lng) {
        try {
            const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/${encodeURIComponent(keyword)}/${lat},${lng}/${DENUE_RADIO}/${INEGI_TOKEN}`;
            const res = await fetch(url);
            if (!res.ok) return 0;
            const data = await res.json();
            return Array.isArray(data) ? data.length : 0;
        } catch { return 0; }
    }

    // SHF lookup
    function obtenerSHF(ubicacion) {
        if (!shfData || Object.keys(shfData).length === 0) return null;
        const ubi = ubicacion.toLowerCase();
        const cityMap = {
            'villahermosa': 'centro', 'centro': 'centro',
            'boca del río': 'boca del río', 'boca del rio': 'boca del río',
            'veracruz': 'veracruz', 'alvarado': 'alvarado',
            'nacajuca': 'nacajuca', 'medellín': 'medellín', 'medellin': 'medellín'
        };
        for (const [city, key] of Object.entries(cityMap)) {
            if (ubi.includes(city) && shfData[key]) return shfData[key];
        }
        const words = ubi.match(/\w+/g) || [];
        for (const w of words) {
            if (shfData[w]) return shfData[w];
        }
        for (const [k, v] of Object.entries(shfData)) {
            if (ubi.includes(k) || k.includes(ubi)) return v;
        }
        return null;
    }

    // Helper: calcular percentil para filtrar outliers
    function percentile(arr, p) {
        const sorted = [...arr].sort((a, b) => a - b);
        const idx = Math.ceil(p / 100 * sorted.length) - 1;
        return sorted[Math.max(0, idx)];
    }

    // ----------------------------------------------------------------
    // Cargar datos
    // ----------------------------------------------------------------
    Promise.all([
        fetch('inmuebles24_veracruz_casas.json').then(r => r.json()).catch(() => ({ listings: {} })),
        fetch('inmuebles24_tabasco_casas.json').then(r => r.json()).catch(() => ({ listings: {} })),
        fetch('shf_multiplicadores.json').then(r => r.json()).catch(() => ({}))
    ]).then(([dataVer, dataTab, shfRaw]) => {
        shfData = shfRaw;
        const allListings = { ...(dataVer.listings || {}), ...(dataTab.listings || {}) };

        const zonasStats = {};
        let totalPrice = 0, totalM2 = 0;

        for (let url in allListings) {
            const item = allListings[url].data;
            if (!item || !item.precio_valor || !item.m2_totales) continue;

            const m2c = item.m2_construidos || item.m2_totales || 1;
            const precioM2 = item.precio_valor / m2c;

            const entry = {
                url,
                precio: item.precio_valor,
                m2_totales: item.m2_totales || 0,
                m2_construidos: m2c,
                recamaras: item.recamaras || 0,
                banos: item.banos || 0,
                estacionamientos: item.estacionamientos || 0,
                direccion: item.direccion || '',
                ubicacion: item.ubicacion || '',
                antiguedad: item.antiguedad || '',
                lat: item.lat || null,
                lng: item.lng || null,
                precioM2: precioM2
            };
            dataset.push(entry);

            const z = entry.ubicacion || 'Desconocida';
            if (!zonasStats[z]) zonasStats[z] = {
                sumPrice: 0, sumM2: 0, count: 0,
                sumLat: 0, sumLng: 0, coordCount: 0,
                preciosM2: []
            };
            zonasStats[z].sumPrice += entry.precio;
            zonasStats[z].sumM2 += m2c;
            zonasStats[z].count++;
            zonasStats[z].preciosM2.push(precioM2);
            if (entry.lat && entry.lng) {
                zonasStats[z].sumLat += entry.lat;
                zonasStats[z].sumLng += entry.lng;
                zonasStats[z].coordCount++;
            }
            totalPrice += entry.precio;
            totalM2 += m2c;
        }

        window.globalAvgM2Price = totalPrice / totalM2;
        window.zonasData = {};

        const select = document.getElementById('ubicacion');
        select.innerHTML = '';

        Object.keys(zonasStats).sort().forEach(z => {
            const stats = zonasStats[z];

            // Calcular precio/m2 mediano de la zona (más robusto que promedio)
            const sortedPM2 = [...stats.preciosM2].sort((a, b) => a - b);
            const medianPM2 = sortedPM2[Math.floor(sortedPM2.length / 2)];

            const avgLat = stats.coordCount > 0 ? stats.sumLat / stats.coordCount : null;
            const avgLng = stats.coordCount > 0 ? stats.sumLng / stats.coordCount : null;

            window.zonasData[z] = {
                medianPrecioM2: medianPM2,
                avgPrecioM2: stats.sumPrice / stats.sumM2,
                count: stats.count,
                lat: avgLat,
                lng: avgLng
            };

            const option = document.createElement('option');
            option.value = z;
            option.text = `${z} (${stats.count} prop. · $${Math.round(medianPM2).toLocaleString('es-MX')}/m²)`;
            select.appendChild(option);
        });

        console.log(`Dataset: ${dataset.length} propiedades, ${Object.keys(zonasStats).length} zonas`);
    }).catch(err => {
        console.error('Error:', err);
        alert('Usa: python -m http.server 8080');
    });

    // ----------------------------------------------------------------
    // Submit
    // ----------------------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (dataset.length === 0) { alert('Dataset no cargado.'); return; }

        emptyState.classList.add('hidden');
        resultsContent.classList.add('hidden');
        loadingState.classList.remove('hidden');

        const target = {
            m2_totales: parseFloat(document.getElementById('m2_totales').value),
            m2_construidos: parseFloat(document.getElementById('m2_construidos').value),
            recamaras: parseFloat(document.getElementById('recamaras').value),
            banos: parseFloat(document.getElementById('banos').value),
            estacionamientos: parseFloat(document.getElementById('estacionamientos').value),
            antiguedad: document.getElementById('antiguedad').value,
            zona: document.getElementById('ubicacion').value,
            amenities: {
                alberca: document.getElementById('am_alberca').checked,
                seguridad: document.getElementById('am_seguridad').checked,
                casa_club: document.getElementById('am_casa_club').checked,
                frente_mar: document.getElementById('am_frente_mar').checked
            }
        };

        setTimeout(async () => {
            const resultado = ejecutarValuacion(target);
            loadingState.classList.add('hidden');
            resultsContent.classList.remove('hidden');

            actualizarSHF(target.zona, resultado.precioOptimo);

            const zonaData = window.zonasData[target.zona];
            if (zonaData && zonaData.lat && zonaData.lng) {
                document.getElementById('denue-score').textContent = '...';
                document.getElementById('denue-detail').textContent = 'Consultando INEGI DENUE...';
                const [cafes, gyms, plazas] = await Promise.all([
                    buscarDenue('cafeteria', zonaData.lat, zonaData.lng),
                    buscarDenue('gimnasio', zonaData.lat, zonaData.lng),
                    buscarDenue('comercial', zonaData.lat, zonaData.lng)
                ]);
                const total = cafes + gyms + plazas;
                const prima = Math.min(0.15, total * 0.004);
                const nivel = total >= 20 ? '🔴 Alta Gentrificación' : total >= 8 ? '🟡 Media' : '🟢 Zona Accesible';
                document.getElementById('denue-score').textContent = `${total} negocios ancla`;
                document.getElementById('denue-detail').textContent =
                    `☕ ${cafes} cafeterías · 🏋️ ${gyms} gimnasios · 🛍️ ${plazas} comerciales — ${nivel} (+${(prima*100).toFixed(1)}%)`;
            } else {
                document.getElementById('denue-score').textContent = 'Sin coordenadas';
                document.getElementById('denue-detail').textContent = 'Ejecuta main.py para obtener coords.';
            }
        }, 1200);
    });

    // ----------------------------------------------------------------
    // SHF UI
    // ----------------------------------------------------------------
    function actualizarSHF(zona, precioOptimo) {
        const shf = obtenerSHF(zona);
        if (shf) {
            const pct = (shf.cagr_anual * 100).toFixed(2);
            const valor1 = precioOptimo * (1 + shf.cagr_anual);
            document.getElementById('shf-cagr').textContent = `+${pct}% anual`;
            document.getElementById('shf-zona').textContent = `Índice SHF · ${shf.nombre} (${shf.periodo || ''})`;
            document.getElementById('valor-1-anio').textContent = formatCurrency(valor1);
            document.getElementById('ganancia-1-anio').textContent = `Ganancia: +${formatCurrency(valor1 - precioOptimo)}`;
        } else {
            document.getElementById('shf-cagr').textContent = '~5.0%';
            document.getElementById('shf-zona').textContent = 'Promedio nacional';
            document.getElementById('valor-1-anio').textContent = formatCurrency(precioOptimo * 1.05);
            document.getElementById('ganancia-1-anio').textContent = `Ganancia: +${formatCurrency(precioOptimo * 0.05)}`;
        }
    }

    // ----------------------------------------------------------------
    // MOTOR DE VALUACIÓN v2
    // ----------------------------------------------------------------
    function ejecutarValuacion(target) {
        const zonaData = window.zonasData[target.zona];
        const breakdown = [];

        // ============================================================
        // PASO 1: Precio base usando precio/m2 MEDIANO de la zona
        // ============================================================
        let precioM2Zona = zonaData ? zonaData.medianPrecioM2 : window.globalAvgM2Price;
        let precioBaseZonal = precioM2Zona * target.m2_construidos;
        breakdown.push({
            label: `Base Zonal: $${Math.round(precioM2Zona).toLocaleString('es-MX')}/m² × ${target.m2_construidos} m²`,
            val: formatCurrency(precioBaseZonal),
            type: 'neutral'
        });

        // ============================================================
        // PASO 2: KNN LOCAL - buscar testigos primero en la misma zona
        // ============================================================
        let candidatos = dataset.filter(d =>
            d.ubicacion === target.zona &&
            d.m2_construidos > 0 &&
            d.precio > 0
        );

        // Filtrar outliers: quitar propiedades con precio/m2 fuera del rango P10-P90
        if (candidatos.length >= 5) {
            const pm2s = candidatos.map(c => c.precioM2);
            const p10 = percentile(pm2s, 10);
            const p90 = percentile(pm2s, 90);
            candidatos = candidatos.filter(c => c.precioM2 >= p10 && c.precioM2 <= p90);
        }

        // Si no hay suficientes en la zona, expandir a zonas cercanas
        if (candidatos.length < 3) {
            candidatos = dataset.filter(d => d.m2_construidos > 0 && d.precio > 0);
        }

        // Distancia KNN normalizada (solo dentro de candidatos filtrados)
        const maxM2T = Math.max(...candidatos.map(d => d.m2_totales)) || 1;
        const maxM2C = Math.max(...candidatos.map(d => d.m2_construidos)) || 1;
        const maxRec = Math.max(...candidatos.map(d => d.recamaras)) || 1;
        const maxBan = Math.max(...candidatos.map(d => d.banos)) || 1;

        let distancias = candidatos.map(item => {
            let penaltyZona = 0;
            let kmDist = null;

            if (item.ubicacion !== target.zona) {
                const itemZD = window.zonasData[item.ubicacion];
                if (zonaData?.lat && item.lat) {
                    kmDist = getDistanceInKm(zonaData.lat, zonaData.lng, item.lat, item.lng);
                    penaltyZona = (kmDist || 50) * 0.3;
                } else {
                    penaltyZona = 5.0;
                }
            }

            const dist = Math.sqrt(
                ((item.m2_totales - target.m2_totales) / maxM2T) ** 2 +
                ((item.m2_construidos - target.m2_construidos) / maxM2C) ** 2 +
                ((item.recamaras - target.recamaras) / maxRec) ** 2 +
                ((item.banos - target.banos) / maxBan) ** 2
            ) + penaltyZona;

            return { ...item, distancia: dist, similitud: Math.max(0, 100 - (dist * 50)), kmDist };
        });

        distancias.sort((a, b) => a.distancia - b.distancia);
        const testigos = distancias.slice(0, 5); // Top 5 testigos

        // ============================================================
        // PASO 3: Precio por testigos (promedio ponderado por similitud)
        // ============================================================
        let sumW = 0, sumP = 0;
        testigos.forEach(t => {
            const w = 1 / (t.distancia + 0.01);
            // Ajustar precio del testigo proporcionalmente a la diferencia de m2
            const ratio = target.m2_construidos / (t.m2_construidos || 1);
            // Usar precio/m2 del testigo × nuestros m2 (mucho más preciso que escalar el precio bruto)
            const precioAjustado = t.precioM2 * target.m2_construidos;
            sumP += precioAjustado * w;
            sumW += w;
        });

        let precioTestigos = sumW > 0 ? sumP / sumW : precioBaseZonal;

        // ============================================================
        // PASO 4: Combinar Precio Zonal + Precio Testigos (70/30)
        // ============================================================
        // Si hay testigos de la misma zona, darles más peso
        const testigosMismaZona = testigos.filter(t => t.ubicacion === target.zona).length;
        const pesoTestigos = testigosMismaZona >= 3 ? 0.7 : testigosMismaZona >= 1 ? 0.5 : 0.3;

        let precioBase = (precioTestigos * pesoTestigos) + (precioBaseZonal * (1 - pesoTestigos));
        breakdown.push({
            label: `Ajuste por ${testigos.length} Testigos (peso ${Math.round(pesoTestigos*100)}%)`,
            val: formatCurrency(precioTestigos),
            type: 'neutral'
        });

        // ============================================================
        // PASO 5: Multiplicadores
        // ============================================================
        let multiplicador = 1.0;

        // Antigüedad
        const antMap = {
            a_estrenar: { m: 1.03, text: 'A Estrenar (+3%)' },
            '1_a_5':    { m: 0.98, text: '1-5 años (-2%)' },
            '5_a_10':   { m: 0.92, text: '5-10 años (-8%)' },
            mas_10:     { m: 0.82, text: '+10 años (-18%)' }
        };
        const ant = antMap[target.antiguedad] || { m: 1.0, text: '' };
        multiplicador *= ant.m;
        breakdown.push({ label: ant.text, val: `×${ant.m}`, type: ant.m >= 1 ? 'positive' : 'negative' });

        // Amenidades como PORCENTAJE del precio base (no sumas fijas)
        if (target.amenities.alberca)    { multiplicador *= 1.05; breakdown.push({ label: 'Alberca Privada', val: '+5%', type: 'positive' }); }
        if (target.amenities.seguridad)  { multiplicador *= 1.02; breakdown.push({ label: 'Seguridad 24/7', val: '+2%', type: 'positive' }); }
        if (target.amenities.casa_club)  { multiplicador *= 1.03; breakdown.push({ label: 'Casa Club', val: '+3%', type: 'positive' }); }
        if (target.amenities.frente_mar) { multiplicador *= 1.25; breakdown.push({ label: 'Frente al Mar (Premium)', val: '+25%', type: 'positive' }); }

        let precioOptimo = Math.round((precioBase * multiplicador) / 10000) * 10000;
        let precioRapida = Math.round((precioOptimo * 0.93) / 10000) * 10000;
        let precioPorM2 = Math.round(precioOptimo / (target.m2_construidos || 1));

        // ============================================================
        // Renderizar
        // ============================================================
        document.getElementById('precio-optimo').innerText = formatCurrency(precioOptimo);
        document.getElementById('precio-rapida').innerText = formatCurrency(precioRapida);
        document.getElementById('precio-m2').innerText = formatCurrency(precioPorM2) + ' /m²';

        const blist = document.getElementById('breakdown-list');
        blist.innerHTML = '';
        breakdown.forEach(b => {
            blist.innerHTML += `<li class="${b.type}"><span>${b.label}</span><span>${b.val}</span></li>`;
        });

        // Testigos
        const tcont = document.getElementById('testigos-container');
        tcont.innerHTML = '';
        testigos.slice(0, 3).forEach(t => {
            const perc = Math.min(99, Math.max(5, t.similitud)).toFixed(1);
            let name = t.direccion || t.ubicacion || 'Propiedad';
            if (name.length > 32) name = name.substring(0, 32) + '…';

            let badges = '';
            if (t.ubicacion === target.zona) {
                badges += `<span class="badge" style="background:rgba(16,185,129,0.2);color:#10b981;font-size:0.7rem;padding:2px 6px;">Misma Zona</span>`;
            } else if (t.kmDist && t.kmDist > 0.1) {
                badges += `<span class="badge" style="background:#4b5563;font-size:0.7rem;padding:2px 6px;">A ${t.kmDist.toFixed(1)} km</span>`;
            }

            tcont.innerHTML += `
                <div class="testigo-card">
                    <div class="testigo-header">
                        <span class="testigo-title">${name} ${badges}</span>
                        <span class="testigo-price">${formatCurrency(t.precio)}</span>
                    </div>
                    <div class="testigo-meta">
                        <span><i class="fa-solid fa-ruler-combined"></i> ${t.m2_construidos} m²</span>
                        <span><i class="fa-solid fa-bed"></i> ${t.recamaras}</span>
                        <span><i class="fa-solid fa-bath"></i> ${t.banos}</span>
                        <span style="color:var(--primary)">$${Math.round(t.precioM2).toLocaleString('es-MX')}/m²</span>
                    </div>
                    <div class="similitud-bar"><div class="similitud-fill" style="width: ${perc}%"></div></div>
                    <small style="color: var(--primary); text-align: right; margin-top: -3px;">Similitud: ${perc}%</small>
                </div>`;
        });

        return { precioOptimo };
    }
});
