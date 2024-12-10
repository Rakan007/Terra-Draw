import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import { Feature } from "geojson";

interface DrawMapProps {
  setFeatureCount: (count: { points: number; lines: number; polygons: number }) => void;
}

const DrawMap: React.FC<DrawMapProps> = ({ setFeatureCount }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [totalDistance, setTotalDistance] = useState<number>(0);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: "https://api.maptiler.com/maps/satellite/style.json?key=NU4TnQJY51sPc4xBLKl3",
      center: [0, 0],
      zoom: 2,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
    });

    map.addControl(draw);

    mapRef.current = map;
    drawRef.current = draw;

    function updateFeatures() {
      const features = draw.getAll().features || [];
      const points = features.filter((f: Feature) => f.geometry.type === "Point").length;
      const lines = features.filter((f: Feature) => f.geometry.type === "LineString").length;
      const polygons = features.filter((f: Feature) => f.geometry.type === "Polygon").length;

      setFeatureCount({ points, lines, polygons });

      const lineFeatures = features.filter(
        (f: Feature) => f.geometry.type === "LineString"
      ) as Feature[];
      let distance = 0;
      lineFeatures.forEach((line) => {
        const lineString = turf.lineString(line.geometry.coordinates as any);
        distance += turf.length(lineString, { units: "kilometers" });
      });

      setTotalDistance(distance);
    }

    map.on("draw.create", updateFeatures);
    map.on("draw.delete", updateFeatures);
    map.on("draw.update", updateFeatures);

    return () => map.remove();
  }, [setFeatureCount]);

  const handleDrawPoint = () => {
    drawRef.current?.changeMode("draw_point");
  };

  const handleDrawLine = () => {
    drawRef.current?.changeMode("draw_line_string");
  };

  const handleDrawPolygon = () => {
    drawRef.current?.changeMode("draw_polygon");
  };

  const handleDelete = () => {
    drawRef.current?.trash();
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-50 bg-white border border-gray-300 p-4 rounded-lg shadow-md flex flex-col space-y-3">
        <button
          onClick={handleDrawPoint}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          Tambah Titik
        </button>
        <button
          onClick={handleDrawLine}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          Tambah Garis
        </button>
        <button
          onClick={handleDrawPolygon}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          Tambah Poligon
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded hover:bg-red-200"
        >
          Hapus
        </button>
        <div className="px-4 py-2 text-sm text-gray-700">
          Total Jarak: {totalDistance.toFixed(2)} km
        </div>
      </div>

      <div
        ref={mapContainer}
        className="w-full h-full border-t border-gray-300"
        style={{ backgroundColor: "black" }}
      />
    </div>
  );
};

export default DrawMap;
