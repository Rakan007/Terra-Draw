import React from "react";

interface SidebarProps {
  featureCount: { points: number; lines: number; polygons: number };
  selectedItems: { points: boolean; lines: boolean; polygons: boolean };
  setSelectedItems: (selected: { points: boolean; lines: boolean; polygons: boolean }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ featureCount, selectedItems, setSelectedItems }) => {
  const toggleSelection = (type: "points" | "lines" | "polygons") => {
    setSelectedItems({ ...selectedItems, [type]: !selectedItems[type] });
  };

  return (
    <div className="flex flex-col w-64 h-full bg-white text-gray-800 border-l border-gray-200 shadow-md p-4">
      <h3 className="text-md font-semibold text-gray-700 mb-4">Info Geometri</h3>
      <ul className="space-y-2">
        <li className="flex justify-between border-t pt-2">
          <span className="text-xs text-gray-500">Total Fitur</span>
          <span className="text-sm font-semibold text-gray-800">
            {featureCount.points + featureCount.lines + featureCount.polygons}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-xs text-gray-500">Titik</span>
          <span className="text-sm font-semibold text-gray-800">{featureCount.points}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-xs text-gray-500">Garis</span>
          <span className="text-sm font-semibold text-gray-800">{featureCount.lines}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-xs text-gray-500">Poligon</span>
          <span className="text-sm font-semibold text-gray-800">{featureCount.polygons}</span>
        </li>
      </ul>
      <h3 className="text-md font-semibold text-gray-700 mt-6">Fitur Sembunyikan</h3>
      <div className="space-y-2 mt-4">
        <li className="flex justify-between">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${selectedItems.points ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            onClick={() => toggleSelection("points")}
          >
            Titik
          </button>
        </li>

        <li className="flex justify-between">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${selectedItems.lines ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            onClick={() => toggleSelection("lines")}
          >
            Garis
          </button>
        </li>

        <li className="flex justify-between">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${selectedItems.polygons ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
            onClick={() => toggleSelection("polygons")}
          >
            Poligon
          </button>
        </li>
      </div>
    </div>
  );
};

export default Sidebar;
