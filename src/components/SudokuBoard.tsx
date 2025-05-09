import React from 'react';
import SudokuGrid from './SudokuGrid';
import DrawingTools from './DrawingTools';
import DrawingCanvas from './DrawingCanvas';

const SudokuBoard: React.FC = () => {
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-3/4 relative">
        <div className="bg-white rounded-lg shadow-md p-4 relative overflow-hidden">
          <div className="relative aspect-square">
            <SudokuGrid />
            <DrawingCanvas />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Tip: Select a drawing tool and draw directly on the grid.</p>
        </div>
      </div>
      
      <div className="lg:w-1/4">
        <DrawingTools />
      </div>
    </div>
  );
};

export default SudokuBoard;