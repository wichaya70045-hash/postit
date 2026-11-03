import React from 'react';
import { NoteStroke } from '@/types/note';
import { getStroke } from 'perfect-freehand';

interface SvgStrokesProps {
  strokes: NoteStroke[];
  className?: string;
  width?: number;
  height?: number;
}

// Convert stroke points to SVG path data
function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

export const SvgStrokes: React.FC<SvgStrokesProps> = ({
  strokes,
  className = '',
  width = 300,
  height = 300,
}) => {
  if (!strokes || strokes.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-stone-400">ไม่มีภาพวาด</div>;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-full pointer-events-none select-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {strokes.map((stroke, index) => {
        if (!stroke.points || stroke.points.length === 0) return null;
        const outlinePoints = getStroke(stroke.points, {
          size: stroke.size || 4,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const pathData = getSvgPathFromStroke(outlinePoints);
        return <path key={index} d={pathData} fill={stroke.color || '#292524'} />;
      })}
    </svg>
  );
};

