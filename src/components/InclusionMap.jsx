import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  INDIA_INCLUSION_DATA,
  STATE_CENTROIDS,
  SCHEMES,
  UI_TRANSLATIONS,
  STATE_NAMES,
  getChoroplethColor,
} from '../india-inclusion-data';

export default function InclusionMap({ lang = 'en', t }) {
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const selectedFeatureIdRef = useRef(null);

  const ui = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stateList = useMemo(() => {
    const list = Object.entries(INDIA_INCLUSION_DATA).map(([name, data]) => {
      const stateTrans = STATE_NAMES[name];
      const displayName = stateTrans ? (stateTrans[lang] || name) : name;
      return {
        id: name,
        displayName,
        englishName: name,
        pct: data.disabilityPercent,
        count: data.disabilityCount,
        color: getChoroplethColor(data.disabilityPercent),
        data,
      };
    });

    if (!searchQuery.trim()) {
      return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q)
    );
  }, [lang, searchQuery]);

  const selectedData = useMemo(() => {
    if (!selectedState) return null;
    const raw = INDIA_INCLUSION_DATA[selectedState];
    if (!raw) return null;
    const stateTrans = STATE_NAMES[selectedState];
    const name = stateTrans ? (stateTrans[lang] || selectedState) : selectedState;
    return { name, ...raw };
  }, [selectedState, lang]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [78.9629, 22.5937],
      zoom: 4.2,
      minZoom: 3,
      maxZoom: 10,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        const res = await fetch('/india-states.geojson');
        const geojson = await res.json();

        map.addSource('india-states', {
          type: 'geojson',
          data: geojson,
          generateId: true,
        });

        const stops = Object.entries(INDIA_INCLUSION_DATA).map(([name, data]) => [
          name,
          getChoroplethColor(data.disabilityPercent),
        ]);

        map.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': [
              'match',
              ['get', 'ST_NM'],
              ...stops.flat(),
              '#e0e7ff',
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.95,
              ['boolean', ['feature-state', 'selected'], false],
              1.0,
              0.8,
            ],
          },
        });

        map.addLayer({
          id: 'states-borders',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#4c1d95',
              '#ffffff',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              3,
              1.2,
            ],
          },
        });

        let hoveredId = null;

        map.on('mousemove', 'states-fill', (e) => {
          if (e.features && e.features.length > 0) {
            map.getCanvas().style.cursor = 'pointer';
            if (hoveredId !== null) {
              map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
            }
            hoveredId = e.features[0].id;
            map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: true });
          }
        });

        map.on('mouseleave', 'states-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
            hoveredId = null;
          }
        });

        map.on('click', 'states-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const stName = e.features[0].properties.ST_NM;
            const fid = e.features[0].id;

            if (selectedFeatureIdRef.current !== null) {
              map.setFeatureState(
                { source: 'india-states', id: selectedFeatureIdRef.current },
                { selected: false }
              );
            }
            selectedFeatureIdRef.current = fid;
            map.setFeatureState({ source: 'india-states', id: fid }, { selected: true });

            setSelectedState(stName);
          }
        });

        // Fit India bounds nicely
        map.fitBounds([[68.0, 6.5], [97.5, 37.5]], { padding: 30, duration: 1000 });
      } catch (err) {
        console.error('Error loading GeoJSON:', err);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
    const coords = STATE_CENTROIDS[stateName];
    if (coords && mapRef.current) {
      mapRef.current.flyTo({
        center: coords,
        zoom: 6,
        duration: 1200,
      });
    }
  };

  return (
    <div className="flex flex-col h-[750px] w-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
      {/* Top Banner */}
      <div className="bg-slate-800/90 border-b border-slate-700/80 px-6 py-4 flex items-center justify-between z-10 backdrop-blur">
        <div>
          <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
            <span>🗺️</span> {ui.title}
          </h2>
          <p className="text-xs text-slate-400">
            {ui.subtitle} • Census of India 2011 (C-20 / C-16) & DEPwD Schemes
          </p>
        </div>
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.fitBounds([[68.0, 6.5], [97.5, 37.5]], { padding: 30, duration: 1000 });
            }
          }}
          className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
        >
          🇮🇳 Reset View
        </button>
      </div>

      {/* Main Map & Directory Grid */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Map Viewport */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[400px]" />

        {/* Floating / Collapsible Sidebar */}
        <div
          className={`transition-all duration-300 flex flex-col bg-slate-900/95 border-l border-slate-800 backdrop-blur z-10 ${
            isSidebarOpen ? 'w-full md:w-96' : 'w-12'
          }`}
        >
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
            {isSidebarOpen && (
              <span className="text-sm font-semibold text-slate-200">
                {ui.searchState}
              </span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-md bg-slate-800 hover:bg-slate-700 text-xs"
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? '▶' : '◀'}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
              {/* Search Bar */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state / राज्य / ರಾಜ್ಯ..."
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              {/* State List Directory */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                {stateList.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleStateClick(st.englishName)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition border text-left ${
                      selectedState === st.englishName
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: st.color }}
                      />
                      <span className="truncate">{st.displayName}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      {st.pct}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected State Detail Modal/Drawer */}
        {selectedData && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[420px] max-h-[80%] bg-slate-900/95 border border-indigo-500/40 rounded-xl p-4 shadow-2xl backdrop-blur z-20 overflow-y-auto text-xs space-y-3 animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-base font-bold text-indigo-300">
                  {selectedData.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {ui.disabilityPop}: <span className="font-semibold text-white">{selectedData.disabilityCount}</span> ({selectedData.disabilityPercent}%)
                </p>
              </div>
              <button
                onClick={() => setSelectedState(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Top Disabilities */}
            <div>
              <span className="font-semibold text-slate-300">{ui.topDisabilities}:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedData.topDisabilities?.map((d, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[10px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <span className="font-semibold text-slate-300">{ui.languages}:</span>
              <p className="text-slate-400 mt-0.5 text-[11px]">
                {selectedData.languages?.join(", ")}
              </p>
            </div>

            {/* Applicable Schemes */}
            <div>
              <span className="font-semibold text-slate-300">{ui.keySchemes}:</span>
              <div className="space-y-1.5 mt-1">
                {selectedData.applicableSchemes?.map((sid) => {
                  const scheme = SCHEMES[sid];
                  if (!scheme) return null;
                  return (
                    <div
                      key={sid}
                      className="p-2 rounded bg-slate-800/80 border border-slate-700/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 text-[11px]">
                          {scheme.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                          {scheme.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {scheme.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
