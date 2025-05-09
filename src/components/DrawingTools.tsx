import React from 'react';
import { useDrawingTools } from '../context/DrawingToolsContext';
import { Circle, PenLine, ArrowRight, Square, Grid, Mouse, Eraser, Undo2, Redo2 } from 'lucide-react';
import { serializeDrawings } from '../ai/serializer';
import { pointToCell } from '../utils/drawingUtils';

const prompt = `you are an expert in variant sudoku rule inference. given a list of drawn elements and their coordinates on a 9x9 grid (canvas size maps to cell grid), infer the constraints being defined using the constraint definitions. output them in a json format like: {
  "rules": [
    {
      "type": "ArrowSumConstraint",
      "cells": [3,5],
    },
    {
      "type": "ArrowSumConstraint",
      "cells": [21,23]
    },
    {
      "type": "KillerCageConstraint",
      "cells": [[0,0],[0,1],[1,0]],
      "total": null
    }
  ]
}`

const getAiCall = (serializedDrawingMap: any) => {
  fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
      "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "google/gemini-2.0-flash-exp:free",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            },
            {
              "type": "text",
              "text": JSON.stringify(serializedDrawingMap)
            }
          ]
        }
      ]
    })
  })
}
const DrawingTools: React.FC = () => {
  const {
    selectedTool,
    setSelectedTool,
    selectedColor,
    setSelectedColor,
    undoDrawing,
    redoDrawing,
    canUndo,
    canRedo,
    clearCanvas,
    drawings
  } = useDrawingTools();

  const tools = [
    { id: 'select', icon: <Mouse size={20} />, label: 'Select' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'line', icon: <PenLine size={20} />, label: 'Line' },
    { id: 'dottedLine', icon: <PenLine size={20} />, label: 'Dotted Line' },
    { id: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' },
    { id: 'cage', icon: <Square size={20} />, label: 'Cage' },
    { id: 'region', icon: <Grid size={20} />, label: 'Region' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
  ];

  const colors = [
    { id: 'blue', value: '#3B82F6' },
    { id: 'green', value: '#10B981' },
    { id: 'red', value: '#EF4444' },
    { id: 'purple', value: '#8B5CF6' },
    { id: 'yellow', value: '#F59E0B' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Drawing Tools</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg text-xs
                transition-all duration-200
                ${selectedTool === tool.id
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                  : 'hover:bg-gray-100 text-gray-700'}
              `}
              title={tool.label}
            >
              {tool.icon}
              <span className="mt-1">{tool.label}</span>
            </button>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Colors</h3>
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.value)}
                className={`
                  w-8 h-8 rounded-full
                  ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                  transition-all duration-200
                `}
                style={{ backgroundColor: color.value }}
                title={color.id}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Actions</h3>
          <div className="flex space-x-2">
            <button
              onClick={undoDrawing}
              disabled={!canUndo}
              className={`
                p-2 rounded-lg flex items-center justify-center
                ${canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}
              `}
              title="Undo"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={redoDrawing}
              disabled={!canRedo}
              className={`
                p-2 rounded-lg flex items-center justify-center
                ${canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}
              `}
              title="Redo"
            >
              <Redo2 size={20} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"
              title="Clear All"
            >
              Clear All
            </button>

            <button
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (!canvas) {
                  console.error('Canvas not found');
                  return;
                }
                const width = canvas.width;
                const height = canvas.height;
                const serialized = serializeDrawings(drawings);

                const withCells = serialized.map(drawing => ({
                  ...drawing,
                  cellIndices: drawing.points.map(point => pointToCell(point, width, height))
                }));

                console.log('serialized with cells:', withCells);
                getAiCall(withCells);
              }}
              className="p-2 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"
              title="Submit"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingTools;