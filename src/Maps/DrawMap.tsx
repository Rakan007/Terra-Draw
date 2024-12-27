import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import { Feature, LineString, Polygon, Point } from "geojson";

interface DrawMapProps {
  setFeatureCount: (count: { points: number; lines: number; polygons: number }) => void;
}

const DrawMap: React.FC<DrawMapProps> = ({ setFeatureCount }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);

  const lineDistanceSourceId = "line-distance-labels";
  const polygonAreaSourceId = "polygon-area-labels";

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current!,
      style: "https://api.maptiler.com/maps/hybrid/style.json?key=NU4TnQJY51sPc4xBLKl3",
      center: [0, 0],
      zoom: 2,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      styles: [
        // Custom styles for draw tools
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#FF0000", "#000000"],
            "line-width": 4,
            "line-opacity": 0.8,
          },
        },
        {
          id: "gl-draw-point",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["!=", "mode", "static"]],
          paint: {
            "circle-radius": 6,
            "circle-color": ["case", ["boolean", ["feature-state", "hover"], false], "#000000", "#FF0000"],
          },
        },
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": "#008000",
            "fill-opacity": 0.4,
          },
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#008000",
            "line-width": 2,
          },
        },
      ],
    });

    map.addControl(draw);
    mapRef.current = map;
    drawRef.current = draw;

    const updateFeatures = () => {
      const features = draw.getAll().features as Feature[];

      const isPoint = (feature: Feature): feature is Feature<Point> =>
        feature.geometry.type === "Point";

      const isLineString = (feature: Feature): feature is Feature<LineString> =>
        feature.geometry.type === "LineString";

      const isPolygon = (feature: Feature): feature is Feature<Polygon> =>
        feature.geometry.type === "Polygon";

      const points = features.filter(isPoint).length;
      const lines = features.filter(isLineString).length;
      const polygons = features.filter(isPolygon).length;

      setFeatureCount({ points, lines, polygons });

      let distance = 0;
      let area = 0;

      const lineLabelFeatures: Feature<Point>[] = [];
      const polygonLabelFeatures: Feature<Point>[] = [];

      features.filter(isLineString).forEach((line) => {
        const coordinates = line.geometry.coordinates;
        if (coordinates.length >= 2) {
          const lineString = turf.lineString(coordinates);
          const lineDistance = turf.length(lineString, { units: "kilometers" });
          distance += lineDistance;

          coordinates.forEach((coord, index) => {
            if (index > 0) {
              const prevCoord = coordinates[index - 1];
              const segment = turf.lineString([prevCoord, coord]);
              const segmentDistance = turf.length(segment, { units: "kilometers" });
              const midPoint = turf.midpoint(turf.point(prevCoord), turf.point(coord)).geometry.coordinates;

              lineLabelFeatures.push({
                type: "Feature",
                geometry: { type: "Point", coordinates: midPoint },
                properties: {
                  distanceLabel: `${segmentDistance.toFixed(2)} km`,
                },
              });
            }
          });
        }
      });

      features.filter(isPolygon).forEach((polygon) => {
        if (polygon.geometry.coordinates.length > 0) {
          try {
            const polygonArea = turf.area(polygon);
            area += polygonArea;

            const center = turf.centerOfMass(polygon).geometry.coordinates;

            polygonLabelFeatures.push({
              type: "Feature",
              geometry: { type: "Point", coordinates: center },
              properties: {
                areaLabel: `${(polygonArea / 1e6).toFixed(2)} km²`,
              },
            });
          } catch (error) {
            console.error("Invalid polygon data:", error);
          }
        }
      });

      setTotalDistance(distance);
      setTotalArea(area);

      const lineSource = mapRef.current?.getSource(lineDistanceSourceId) as maplibregl.GeoJSONSource;
      const polygonSource = mapRef.current?.getSource(polygonAreaSourceId) as maplibregl.GeoJSONSource;

      if (lineSource) {
        lineSource.setData({
          type: "FeatureCollection",
          features: lineLabelFeatures,
        });
      }

      if (polygonSource) {
        polygonSource.setData({
          type: "FeatureCollection",
          features: polygonLabelFeatures,
        });
      }
    };

    map.on("mousemove", updateFeatures);
    map.on("draw.create", updateFeatures);
    map.on("draw.delete", updateFeatures);
    map.on("draw.update", updateFeatures);

    map.on("load", () => {
      map.addSource(lineDistanceSourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "line-distance-label-layer",
        type: "symbol",
        source: lineDistanceSourceId,
        layout: {
          "text-field": ["get", "distanceLabel"],
          "text-size": 12,
          "text-offset": [0, -1.5],
          "text-anchor": "bottom",
        },
        paint: {
          "text-color": "#000000",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 2,
        },
      });

      map.addSource(polygonAreaSourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "polygon-area-label-layer",
        type: "symbol",
        source: polygonAreaSourceId,
        layout: {
          "text-field": ["get", "areaLabel"],
          "text-size": 12,
          "text-offset": [0, 1.5], 
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#000000",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 2,
        },
      });
    });

    return () => map.remove();
  }, [setFeatureCount]);

  const handleDrawPoint = () => drawRef.current?.changeMode("draw_point");
  const handleDrawLine = () => drawRef.current?.changeMode("draw_line_string");
  const handleDrawPolygon = () => drawRef.current?.changeMode("draw_polygon");
  const handleDelete = () => drawRef.current?.trash();

  return (
    <div className="relative w-full h-full">
      <div
        className="absolute top-4 right-4 z-50 bg-white border border-gray-200 p-6 rounded-lg shadow-lg flex flex-col space-y-4"
        style={{
          maxWidth: "250px",
        }}
      >
        <button
          onClick={handleDrawPoint}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Tambah Titik
        </button>
        <button
          onClick={handleDrawLine}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Tambah Garis
        </button>
        <button
          onClick={handleDrawPolygon}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
        >
          Tambah Poligon
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Hapus
        </button>
        <div className="text-sm text-gray-800">
          <p>
            <strong>Total Jarak:</strong> {totalDistance.toFixed(2)} km
          </p>
          <p>
            <strong>Total Area:</strong> {totalArea.toFixed(2)} km²
          </p>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default DrawMap;
