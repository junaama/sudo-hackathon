import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Drawing } from '../utils/drawingUtils';

interface DrawingToolsContextType {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  drawings: Drawing[];
  addDrawing: (drawing: Drawing) => void;
  undoDrawing: () => void;
  redoDrawing: () => void;
  clearCanvas: () => void;
  canUndo: boolean;
  canRedo: boolean;
  setCanUndo: (can: boolean) => void;
  setCanRedo: (can: boolean) => void;
}

const DrawingToolsContext = createContext<DrawingToolsContextType | undefined>(undefined);

export const DrawingToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTool, setSelectedTool] = useState('circle');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [undoStack, setUndoStack] = useState<Drawing[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  const addDrawing = (drawing: Drawing) => {
    setDrawings([...drawings, drawing]);
    setUndoStack([]); 
    setCanUndo(true);
    setCanRedo(false);
  };
  
  const undoDrawing = () => {
    if (drawings.length === 0) return;
    
    const lastDrawing = drawings[drawings.length - 1];
    const newDrawings = drawings.slice(0, -1);
    
    setDrawings(newDrawings);
    setUndoStack([...undoStack, lastDrawing]);
    setCanUndo(newDrawings.length > 0);
    setCanRedo(true);
  };
  
  const redoDrawing = () => {
    if (undoStack.length === 0) return;
    
    const lastUndo = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    setDrawings([...drawings, lastUndo]);
    setUndoStack(newUndoStack);
    setCanUndo(true);
    setCanRedo(newUndoStack.length > 0);
  };
  
  const clearCanvas = () => {
    setDrawings([]);
    setUndoStack([]);
    setCanUndo(false);
    setCanRedo(false);
  };
  
  return (
    <DrawingToolsContext.Provider
      value={{
        selectedTool,
        setSelectedTool,
        selectedColor,
        setSelectedColor,
        drawings,
        addDrawing,
        undoDrawing,
        redoDrawing,
        clearCanvas,
        canUndo,
        canRedo,
        setCanUndo,
        setCanRedo
      }}
    >
      {children}
    </DrawingToolsContext.Provider>
  );
};

export const useDrawingTools = () => {
  const context = useContext(DrawingToolsContext);
  if (context === undefined) {
    throw new Error('useDrawingTools must be used within a DrawingToolsProvider');
  }
  return context;
};