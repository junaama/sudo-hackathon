export interface Point {
  x: number;
  y: number;
}

export interface Drawing {
  type: string;
  points: Point[];
  color: string;
}

/**
 * Converts a canvas point to a cell index (0-80) in a 9x9 Sudoku grid.
 * @param point The {x, y} point on the canvas
 * @param canvasWidth The width of the canvas
 * @param canvasHeight The height of the canvas
 * @returns The cell index (0-80) or null if out of bounds
 */
export function pointToCell(point: Point, canvasWidth: number, canvasHeight: number): number | null {
  const cellWidth = canvasWidth / 9;
  const cellHeight = canvasHeight / 9;
  const col = Math.floor(point.x / cellWidth);
  const row = Math.floor(point.y / cellHeight);
  if (col < 0 || col > 8 || row < 0 || row > 8) return null;
  return row * 9 + col;
}


export const getCanvasPoint = (e: React.MouseEvent, canvas: HTMLCanvasElement): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D, 
  start: Point, 
  end: Point, 
  color: string
) => {
  const radius = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  
  ctx.beginPath();
  ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D, 
  start: Point, 
  end: Point, 
  color: string
) => {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawDottedLine = (
  ctx: CanvasRenderingContext2D, 
  start: Point, 
  end: Point, 
  color: string
) => {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D, 
  start: Point, 
  end: Point, 
  color: string
) => {
  const headLength = 15;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  
  // Draw the main line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw the arrowhead
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

export const drawCage = (
  ctx: CanvasRenderingContext2D, 
  points: Point[], 
  color: string
) => {
  if (points.length < 2) return;
  
  const [start, end] = points;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawRegion = (
  ctx: CanvasRenderingContext2D, 
  points: Point[], 
  color: string
) => {
  if (points.length < 2) return;
  
  const [start, end] = points;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Add a semi-transparent fill
  ctx.fillStyle = `${color}33`; // Add 33 for 20% opacity
  ctx.fill();
};