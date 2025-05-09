import React from 'react';

const SudokuGrid: React.FC = () => {
  const grid = Array(9).fill(null).map(() => Array(9).fill(''));
  
  return (
    <div className="absolute inset-0 grid grid-cols-9 gap-px bg-gray-300 border-2 border-gray-800">
      {grid.map((row, rowIndex) => 
        row.map((cell, colIndex) => {
          const isThickRight = (colIndex + 1) % 3 === 0 && colIndex < 8;
          const isThickBottom = (rowIndex + 1) % 3 === 0 && rowIndex < 8;
          
          return (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`
                bg-white relative flex items-center justify-center text-2xl font-medium
                ${isThickRight ? 'border-r-2 border-gray-800' : ''}
                ${isThickBottom ? 'border-b-2 border-gray-800' : ''}
                transition-colors duration-100 hover:bg-blue-50
              `}
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
};

export default SudokuGrid;