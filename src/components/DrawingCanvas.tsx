'use client';

import React, { useRef, useState, useEffect } from 'react';
import { NoteStroke } from '@/types/note';
import { getStroke } from 'perfect-freehand';
import { Undo2, Redo2, Trash2, Eraser, PenLine } from 'lucide-react';

interface DrawingCanvasProps {
  onStrokesChange: (strokes: NoteStroke[]) => void;
  initialStrokes?: NoteStroke[];
}

const PALETTE = [
  '#292524', // stone-800 charcoal
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f59e0b', // amber
];

const SIZES = [
  { label: 'เล็ก', size: 3 },
  { label: 'กลาง', size: 6 },
  { label: 'ใหญ่', size: 12 },
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onStrokesChange,
  initialStrokes = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<NoteStroke[]>(initialStrokes);
  const [history, setHistory] = useState<NoteStroke[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<NoteStroke | null>(null);
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [size, setSize] = useState<number>(6);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // Render strokes to canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    allStrokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;
      const outlinePoints = getStroke(stroke.points, {
        size: stroke.size,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });

      if (outlinePoints.length === 0) return;

      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);
      for (let i = 1; i < outlinePoints.length; i++) {
        ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
      }
      ctx.closePath();
      ctx.fill();
    });
  };

  useEffect(() => {
    renderCanvas();
    onStrokesChange(strokes);
  }, [strokes, currentStroke]);

  // Pointer event handlers with touch-action: none
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const pressure = e.pressure || 0.5;

    // Save history for undo before new stroke
    setHistory((prev) => [...prev.slice(-15), strokes]);

    setCurrentStroke({
      points: [[x, y, pressure]],
      color: isEraser ? '#f5f0e6' : color, // Erase with background color
      size: isEraser ? size * 2 : size,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentStroke) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const pressure = e.pressure || 0.5;

    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, [x, y, pressure]],
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    if (currentStroke) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setStrokes(prev);
    } else {
      setStrokes((s) => s.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    setHistory((prev) => [...prev, strokes]);
    setStrokes([]);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Canvas container */}
      <div className="relative w-full aspect-square max-w-[320px] bg-[#fdfbf7] rounded-xl overflow-hidden border border-amber-200/60 shadow-inner">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-full h-full cursor-crosshair touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {strokes.length === 0 && !currentStroke && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-stone-400 text-sm">
            แตะหรือลากนิ้วเพื่อเริ่มวาด 🎨
          </div>
        )}
      </div>

      {/* Drawing Toolbar */}
      <div className="w-full mt-3 flex flex-col gap-2.5">
        {/* Colors & Eraser row */}
        <div className="flex items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                className={`w-8 h-8 rounded-full transition-transform active:scale-90 border-2 ${
                  !isEraser && color === c ? 'scale-110 border-stone-800 shadow-sm' : 'border-white'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`สี ${c}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`p-2 rounded-xl flex items-center justify-center transition-colors min-w-[40px] min-h-[40px] ${
              isEraser ? 'bg-amber-500 text-white shadow-sm' : 'bg-stone-200/80 text-stone-700'
            }`}
            title="ยางลบ"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Sizes and Actions row */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Stroke size selector */}
          <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl">
            {SIZES.map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => setSize(s.size)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  size === s.size ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Undo and Clear */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-stone-200/80 text-stone-700 disabled:opacity-40 active:scale-95 transition-all"
              title="ย้อนกลับ"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokes.length === 0}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-stone-200/80 text-rose-600 disabled:opacity-40 active:scale-95 transition-all"
              title="ล้างทั้งหมด"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

