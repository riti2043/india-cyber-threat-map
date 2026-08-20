"use client";

import React, { useState, useMemo, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { Map, MapControls, MapGeoJSON, MapPopup } from "@/components/ui/map";

// Hardcoded mock data based on the features in public/india-states.geojson
const threatData: Record<string, number> = {
  "Andaman and Nicobar": 547,
  "Andhra Pradesh": 782,
  "Arunachal Pradesh": 576,
  "Assam": 77,
  "Bihar": 789,
  "Chandigarh": 448,
  "Chhattisgarh": 381,
  "Dadra and Nagar Haveli": 456,
  "Daman and Diu": 604,
  "Delhi": 861,
  "Goa": 240,
  "Gujarat": 30,
  "Haryana": 674,
  "Himachal Pradesh": 390,
  "Jammu and Kashmir": 365,
  "Jharkhand": 859,
  "Karnataka": 863,
  "Kerala": 979,
  "Lakshadweep": 233,
  "Madhya Pradesh": 189,
  "Maharashtra": 631,
  "Manipur": 495,
  "Meghalaya": 523,
  "Mizoram": 915,
  "Nagaland": 40,
  "Orissa": 74,
  "Puducherry": 755,
  "Punjab": 111,
  "Rajasthan": 923,
  "Sikkim": 395,
  "Tamil Nadu": 489,
  "Tripura": 218,
  "Uttar Pradesh": 851,
  "Uttaranchal": 999,
  "West Bengal": 833,
};

// Approximate bounding box centers for MapLibre flyTo
const stateCentroids: Record<string, [number, number]> = {
  "Andaman and Nicobar": [93.242508, 10.845045],
  "Andhra Pradesh": [80.759003, 16.263964],
  "Arunachal Pradesh": [94.479526, 28.059683],
  "Assam": [92.857875, 26.056061],
  "Bihar": [85.803993, 26.068878],
  "Chandigarh": [76.763462, 30.734180],
  "Chhattisgarh": [82.314605, 20.944906],
  "Dadra and Nagar Haveli": [73.075733, 20.206165],
  "Daman and Diu": [71.774498, 20.679419],
  "Delhi": [77.085327, 28.646486],
  "Goa": [74.010479, 15.346594],
  "Gujarat": [71.332584, 22.413294],
  "Haryana": [76.028640, 29.293175],
  "Himachal Pradesh": [77.287727, 31.820115],
  "Jammu and Kashmir": [76.663757, 33.888330],
  "Jharkhand": [85.648453, 23.657491],
  "Karnataka": [76.315887, 15.014800],
  "Kerala": [76.131382, 10.544140],
  "Lakshadweep": [72.901386, 9.986111],
  "Madhya Pradesh": [78.421222, 23.974840],
  "Maharashtra": [76.771427, 18.817799],
  "Manipur": [93.862304, 24.770190],
  "Meghalaya": [91.313041, 25.575280],
  "Mizoram": [92.852050, 23.233539],
  "Nagaland": [94.288330, 26.122500],
  "Orissa": [84.432830, 20.183099],
  "Puducherry": [78.761978, 13.781396],
  "Punjab": [75.401142, 31.061181],
  "Rajasthan": [73.872986, 26.628870],
  "Sikkim": [88.469669, 27.606289],
  "Tamil Nadu": [78.286274, 10.807058],
  "Tripura": [91.745663, 23.739060],
  "Uttar Pradesh": [80.857754, 27.142614],
  "Uttaranchal": [79.291119, 30.093940],
  "West Bengal": [87.851955, 24.380238],
};

function getThreatColor(count: number): string {
  if (count < 200) return "#fee2e2"; // red-100
  if (count < 400) return "#fca5a5"; // red-300
  if (count < 600) return "#ef4444"; // red-500
  if (count < 800) return "#b91c1c"; // red-700
  return "#7f1d1d"; // red-900
}

export default function IndiaThreatMap() {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupInfo, setPopupInfo] = useState<{
    lng: number;
    lat: number;
    stateName: string;
    count: number;
  } | null>(null);
  
  const [hoverInfo, setHoverInfo] = useState<{
    lng: number;
    lat: number;
    stateName: string;
    count: number;
  } | null>(null);

  // States sorted by threat count
  const sortedStates = useMemo(() => {
    return Object.entries(threatData)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, []);

  const filteredStates = useMemo(() => {
    if (!searchQuery) return sortedStates;
    return sortedStates.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sortedStates]);

  // Match expression for MapGeoJSON
  const matchExpression = useMemo(() => {
    const expr: any[] = ["match", ["get", "NAME_1"]];
    Object.entries(threatData).forEach(([state, count]) => {
      expr.push(state, getThreatColor(count));
    });
    expr.push("#cccccc"); // Default fallback
    return expr;
  }, []);

  const handleStateClick = (stateName: string, lng?: number, lat?: number) => {
    const centroid = stateCentroids[stateName];
    if (centroid && mapRef.current) {
      mapRef.current.flyTo({ center: centroid, zoom: 5.5, duration: 800 });
    }
    
    setPopupInfo({
      lng: lng ?? (centroid ? centroid[0] : 0),
      lat: lat ?? (centroid ? centroid[1] : 0),
      stateName,
      count: threatData[stateName] ?? 0,
    });
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-black overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-64 md:w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-900/50 z-10 shrink-0">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <input
            type="text"
            placeholder="Search state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-sm dark:bg-black dark:border-zinc-700"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredStates.map((state) => {
            const isSelected = popupInfo?.stateName === state.name;
            return (
              <div
                key={state.name}
                onClick={() => handleStateClick(state.name)}
                className={`flex justify-between items-center p-3 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors ${
                  isSelected 
                    ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-l-red-500 pl-2" 
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{state.name}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  isSelected ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}>
                  {state.count}
                </span>
              </div>
            );
          })}
          {filteredStates.length === 0 && (
            <div className="p-4 text-sm text-zinc-500 text-center">No states found.</div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative h-full">
        {/* Note: Removed 'blank' prop to show Carto basemap underneath */}
        <Map ref={mapRef} center={[78.9629, 22.5937]} zoom={4}>
          <MapGeoJSON
            data="/india-states.geojson"
            promoteId="NAME_1"
            interactive={true}
            fillPaint={{
              "fill-color": matchExpression as any,
              "fill-opacity": 0.6, // Semi-transparent to let basemap show through
            }}
            fillHoverPaint={{
              "fill-opacity": 0.8,
            }}
            linePaint={{
              "line-color": "#ffffff",
              "line-width": 1,
            }}
            onClick={(e) => {
              // Also log to console as requested for debugging
              console.log("Clicked feature properties:", e.feature.properties);
              
              const stateName = e.feature.properties?.NAME_1 as string;
              handleStateClick(stateName, e.longitude, e.latitude);
            }}
            onHover={(e) => {
              if (e && e.feature.properties) {
                const stateName = e.feature.properties.NAME_1 as string;
                setHoverInfo({
                  lng: e.longitude,
                  lat: e.latitude,
                  stateName,
                  count: threatData[stateName] ?? 0,
                });
              } else {
                setHoverInfo(null);
              }
            }}
          />
          
          <MapControls />

          {/* Hover Tooltip (separate from click popup) */}
          {hoverInfo && hoverInfo.stateName !== popupInfo?.stateName && (
            <MapPopup
              longitude={hoverInfo.lng}
              latitude={hoverInfo.lat}
              closeButton={false}
              closeOnClick={false}
              className="pointer-events-none"
            >
              <div className="text-sm px-1">
                <strong className="block text-zinc-800">{hoverInfo.stateName}</strong>
                <span className="text-zinc-600">Threats: {hoverInfo.count}</span>
              </div>
            </MapPopup>
          )}

          {/* Click Popup using MapPopup (resolves bug where marker popups don't auto-open) */}
          {popupInfo && (
            <MapPopup
              longitude={popupInfo.lng}
              latitude={popupInfo.lat}
              closeButton={true}
              onClose={() => setPopupInfo(null)}
              className="min-w-[150px]"
            >
              <div className="px-1 py-1">
                <h3 className="font-bold text-sm text-zinc-900 mb-1">{popupInfo.stateName}</h3>
                <p className="text-sm text-zinc-700">
                  Threat Count: <strong className="text-red-600">{popupInfo.count}</strong>
                </p>
              </div>
            </MapPopup>
          )}
        </Map>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-black/95 p-3 rounded-md shadow-md border border-zinc-200 dark:border-zinc-800 z-10 select-none">
          <h4 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 mb-2 uppercase tracking-wide">Threat Level</h4>
          <div className="flex flex-col gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-[#fee2e2]"></div> &lt; 200</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-[#fca5a5]"></div> 200 - 399</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-[#ef4444]"></div> 400 - 599</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-[#b91c1c]"></div> 600 - 799</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-[#7f1d1d]"></div> 800+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
