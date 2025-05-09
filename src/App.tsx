import React from 'react';
import SudokuBoard from './components/SudokuBoard';
import { DrawingToolsProvider } from './context/DrawingToolsContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center">
          <p className="text-gray-600">Draw and create Sudoku puzzles</p>
        </header>
        
        <main>
          <DrawingToolsProvider>
            <SudokuBoard />
          </DrawingToolsProvider>
        </main>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Sudoku Canvas. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;