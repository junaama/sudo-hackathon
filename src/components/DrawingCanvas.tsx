import React, { useRef, useEffect, useState } from 'react';
import { useDrawingTools } from '../context/DrawingToolsContext';
import { 
  drawCircle, 
  drawLine, 
  drawArrow, 
  drawCage, 
  drawRegion,
  getCanvasPoint,
  drawDottedLine 
} from '../utils/drawingUtils';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    selectedTool, 
    selectedColor, 
    addDrawing,
    drawings,
    setCanUndo,
    setCanRedo 
  } = useDrawingTools();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Handle canvas resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redrawCanvas();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  useEffect(() => {
    redrawCanvas();
    setCanUndo(drawings.length > 0);
    setCanRedo(false); // Simplified for this example
  }, [drawings]);
  
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    
    // Redraw all drawings
    drawings.forEach(drawing => {
      const { type, points, color } = drawing;
      switch (type) {
        case 'circle':
          drawCircle(ctx, points[0], points[1], color);
          break;
        case 'line':
          drawLine(ctx, points[0], points[1], color);
          break;
        case 'arrow':
          drawArrow(ctx, points[0], points[1], color);
          break;
        case 'cage':
          drawCage(ctx, points, color);
          break;
        case 'region':
          drawRegion(ctx, points, color);
          break;
        case 'dottedLine':
          drawDottedLine(ctx, points[0], points[1], color);
          break;
      }
    });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === 'select' || selectedTool === 'eraser') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const point = getCanvasPoint(e, canvas);
    setStartPoint(point);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const currentPoint = getCanvasPoint(e, canvas);
    
    // Redraw canvas and preview current drawing
    redrawCanvas();
    
    switch (selectedTool) {
      case 'circle':
        drawCircle(ctx, startPoint, currentPoint, selectedColor);
        break;
      case 'line':
        drawLine(ctx, startPoint, currentPoint, selectedColor);
        break;
      case 'arrow':
        drawArrow(ctx, startPoint, currentPoint, selectedColor);
        break;
      case 'cage':
        drawCage(ctx, [startPoint, currentPoint], selectedColor);
        break;
      case 'region':
        drawRegion(ctx, [startPoint, currentPoint], selectedColor);
        break;
      case 'dottedLine':
        drawDottedLine(ctx, startPoint, currentPoint, selectedColor);
        break;
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const endPoint = getCanvasPoint(e, canvas);
    
    // Add new drawing to the context
    addDrawing({
      type: selectedTool,
      points: selectedTool === 'cage' || selectedTool === 'region' 
        ? [startPoint, endPoint]
        : [startPoint, endPoint],
      color: selectedColor
    });
    
    setIsDrawing(false);
    setStartPoint(null);
  };
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDrawing(false)}
    />
  );
};

export default DrawingCanvas;