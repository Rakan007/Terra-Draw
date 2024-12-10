import React from "react";

interface SidebarProps {
  featureCount: { points: number; lines: number; polygons: number };
}

const Sidebar: React.FC<SidebarProps> = ({ featureCount }) => {
  return (
    <div className="flex flex-col w-72 h-full bg-gray-50 text-gray-800 border-l border-gray-200 shadow-lg p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Info</h3>
      <ul className="space-y-3">
        <li className="flex justify-between border-t pt-3">
          <span className="text-sm text-gray-500">Total Features</span>
          <span className="text-sm font-medium text-gray-800">
            {featureCount.points + featureCount.lines + featureCount.polygons}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-sm text-gray-500">Points</span>
          <span className="text-sm font-medium text-gray-800">
            {featureCount.points}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-sm text-gray-500">Lines</span>
          <span className="text-sm font-medium text-gray-800">
            {featureCount.lines}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-sm text-gray-500">Polygons</span>
          <span className="text-sm font-medium text-gray-800">
            {featureCount.polygons}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
