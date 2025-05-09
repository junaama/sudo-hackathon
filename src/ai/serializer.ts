import { Drawing } from '../utils/drawingUtils';

/**
 * Serializes an array of Drawing objects into a plain object array suitable for storage or transmission.
 * @param drawings Array of Drawing objects (from context)
 * @returns Serialized drawing array
 */
export function serializeDrawings(drawings: Drawing[]): Array<{
  type: string;
  points: { x: number; y: number }[];
  color: string;
}> {
  return drawings.map(d => ({
    type: d.type,
    points: d.points.map(p => ({ x: p.x, y: p.y })),
    color: d.color,
  }));
}

