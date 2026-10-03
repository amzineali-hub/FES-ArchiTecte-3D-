import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BuildingProject, RoomData, OpeningData } from '../types/architecture';
import { ZoomIn, ZoomOut, Maximize, Compass, Grid, Crosshair } from 'lucide-react';

interface Plan2DCanvasProps {
  project: BuildingProject;
  activeFloorIndex: number;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  onUpdateRoom: (floorIndex: number, roomId: string, updates: Partial<RoomData>) => void;
  onDropComponent?: (itemData: any, dropMeterX: number, dropMeterY: number) => void;
  styleMode: 'classic' | 'blueprint' | 'modern';
  onChangeStyleMode: (mode: 'classic' | 'blueprint' | 'modern') => void;
}

export const Plan2DCanvas: React.FC<Plan2DCanvasProps> = ({
  project,
  activeFloorIndex,
  selectedRoomId,
  onSelectRoom,
  onUpdateRoom,
  onDropComponent,
  styleMode,
  onChangeStyleMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // View transform state: Pan and Zoom
  const [zoom, setZoom] = useState<number>(45); // pixels per meter
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse coords in meters
  const [mouseMeters, setMouseMeters] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging & Resizing Room
  const [dragMode, setDragMode] = useState<'move' | 'resize-br' | 'resize-r' | 'resize-b' | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialRoomState, setInitialRoomState] = useState<RoomData | null>(null);

  const floor = project.floors[activeFloorIndex] || project.floors[0];

  // Helper to convert meters to screen pixels
  const toScreenX = useCallback((m: number) => pan.x + m * zoom, [pan.x, zoom]);
  const toScreenY = useCallback((m: number) => pan.y + m * zoom, [pan.y, zoom]);

  // Helper to convert screen pixels to meters
  const toMeterX = useCallback((px: number) => (px - pan.x) / zoom, [pan.x, zoom]);
  const toMeterY = useCallback((py: number) => (py - pan.y) / zoom, [pan.y, zoom]);

  // Snap to grid
  const snap = useCallback(
    (val: number) => {
      if (!project.snapToGrid) return Math.round(val * 100) / 100;
      const step = project.gridSize || 0.5;
      return Math.round(val / step) * step;
    },
    [project.snapToGrid, project.gridSize]
  );

  // Auto-center canvas on load / resize
  const centerBuilding = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const margin = 120;
    const bW = project.dimensions.length;
    const bH = project.dimensions.width;

    const availableW = rect.width - margin * 2;
    const availableH = rect.height - margin * 2;

    const fitZoom = Math.min(availableW / bW, availableH / bH, 70);
    const newZoom = Math.max(fitZoom, 20);

    const centerX = (rect.width - bW * newZoom) / 2;
    const centerY = (rect.height - bH * newZoom) / 2;

    setZoom(newZoom);
    setPan({ x: centerX, y: centerY });
  }, [project.dimensions.length, project.dimensions.width]);

  useEffect(() => {
    centerBuilding();
  }, [centerBuilding]);

  // Draw 2D architectural blueprint
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Theme color palettes
    const isBlueprint = styleMode === 'blueprint';
    const isClassic = styleMode === 'classic';

    const colors = {
      bg: isBlueprint ? '#091e3a' : isClassic ? '#ffffff' : '#0b0f19',
      gridMajor: isBlueprint ? 'rgba(56, 189, 248, 0.2)' : isClassic ? '#e2e8f0' : 'rgba(51, 65, 85, 0.4)',
      gridMinor: isBlueprint ? 'rgba(56, 189, 248, 0.07)' : isClassic ? '#f1f5f9' : 'rgba(30, 41, 59, 0.3)',
      wallExt: isBlueprint ? '#38bdf8' : isClassic ? '#0f172a' : '#94a3b8',
      wallFill: isBlueprint ? 'rgba(56, 189, 248, 0.15)' : isClassic ? '#e2e8f0' : '#1e293b',
      wallHatch: isBlueprint ? '#0284c7' : isClassic ? '#94a3b8' : '#475569',
      cotes: isBlueprint ? '#7dd3fc' : isClassic ? '#0f172a' : '#38bdf8',
      coteTick: isBlueprint ? '#38bdf8' : isClassic ? '#0f172a' : '#38bdf8',
      textMain: isBlueprint ? '#ffffff' : isClassic ? '#0f172a' : '#f8fafc',
      textMuted: isBlueprint ? '#93c5fd' : isClassic ? '#64748b' : '#94a3b8',
      door: isBlueprint ? '#34d399' : isClassic ? '#0284c7' : '#2dd4bf',
      window: isBlueprint ? '#60a5fa' : isClassic ? '#059669' : '#38bdf8',
    };

    // 1. Clear background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw CAD Grid
    const meterGrid = 1.0; // 1 meter
    const startMetersX = Math.floor(toMeterX(0));
    const endMetersX = Math.ceil(toMeterX(width));
    const startMetersY = Math.floor(toMeterY(0));
    const endMetersY = Math.ceil(toMeterY(height));

    // Minor grid (0.5m)
    if (zoom >= 25) {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = colors.gridMinor;
      ctx.beginPath();
      for (let mx = startMetersX; mx <= endMetersX; mx += 0.5) {
        const sx = toScreenX(mx);
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
      }
      for (let my = startMetersY; my <= endMetersY; my += 0.5) {
        const sy = toScreenY(my);
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
      }
      ctx.stroke();
    }

    // Major grid (1m)
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = colors.gridMajor;
    ctx.beginPath();
    for (let mx = startMetersX; mx <= endMetersX; mx += meterGrid) {
      const sx = toScreenX(mx);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    for (let my = startMetersY; my <= endMetersY; my += meterGrid) {
      const sy = toScreenY(my);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // 3. Draw Building Exterior Footprint
    const bLen = project.dimensions.length;
    const bWid = project.dimensions.width;
    const tExt = project.exteriorWallThickness;

    const bScreenX = toScreenX(0);
    const bScreenY = toScreenY(0);
    const bScreenW = bLen * zoom;
    const bScreenH = bWid * zoom;
    const tExtPx = tExt * zoom;

    // Exterior Wall background band
    ctx.fillStyle = colors.wallFill;
    ctx.fillRect(bScreenX, bScreenY, bScreenW, bScreenH);
    ctx.clearRect(bScreenX + tExtPx, bScreenY + tExtPx, bScreenW - 2 * tExtPx, bScreenH - 2 * tExtPx);

    // Inner clear fill
    ctx.fillStyle = isClassic ? '#ffffff' : colors.bg;
    ctx.fillRect(bScreenX + tExtPx, bScreenY + tExtPx, bScreenW - 2 * tExtPx, bScreenH - 2 * tExtPx);

    // Exterior Wall Borders (Outer & Inner lines)
    ctx.strokeStyle = colors.wallExt;
    ctx.lineWidth = isClassic ? 3 : 2;
    ctx.strokeRect(bScreenX, bScreenY, bScreenW, bScreenH);
    ctx.strokeRect(bScreenX + tExtPx, bScreenY + tExtPx, bScreenW - 2 * tExtPx, bScreenH - 2 * tExtPx);

    // 4. Draw Rooms
    floor.rooms.forEach((room) => {
      const rx = toScreenX(room.x);
      const ry = toScreenY(room.y);
      const rw = room.width * zoom;
      const rl = room.length * zoom;
      const isSelected = room.id === selectedRoomId;

      // Room Area fill
      if (isSelected) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      } else {
        ctx.fillStyle = room.customColor ? `${room.customColor}14` : 'rgba(148, 163, 184, 0.08)';
      }
      ctx.fillRect(rx, ry, rw, rl);

      // Room partition border
      ctx.strokeStyle = isSelected ? '#38bdf8' : isClassic ? '#64748b' : '#475569';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.setLineDash(isSelected ? [4, 2] : []);
      ctx.strokeRect(rx, ry, rw, rl);
      ctx.setLineDash([]);

      // Room Label & Surface Area
      if (rw > 50 && rl > 40) {
        ctx.fillStyle = isSelected ? '#38bdf8' : colors.textMain;
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name, rx + rw / 2, ry + rl / 2 - 8);

        // Surface Area in m² with font-mono
        const area = (room.width * room.length).toFixed(1);
        ctx.fillStyle = colors.textMuted;
        ctx.font = '500 11px "JetBrains Mono", monospace';
        ctx.fillText(`${area} m²`, rx + rw / 2, ry + rl / 2 + 10);

        // Subtle interior dimensions
        if (rw > 90 && rl > 70) {
          ctx.font = '400 9px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.textMuted;
          ctx.fillText(`${room.width.toFixed(2)} × ${room.length.toFixed(2)} m`, rx + rw / 2, ry + rl / 2 + 25);
        }
      }

      // If selected: draw resize handles
      if (isSelected) {
        const handleSize = 8;
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;

        // Bottom-Right handle
        ctx.fillRect(rx + rw - handleSize / 2, ry + rl - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(rx + rw - handleSize / 2, ry + rl - handleSize / 2, handleSize, handleSize);

        // Right-Edge handle
        ctx.fillRect(rx + rw - handleSize / 2, ry + rl / 2 - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(rx + rw - handleSize / 2, ry + rl / 2 - handleSize / 2, handleSize, handleSize);

        // Bottom-Edge handle
        ctx.fillRect(rx + rw / 2 - handleSize / 2, ry + rl - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(rx + rw / 2 - handleSize / 2, ry + rl - handleSize / 2, handleSize, handleSize);
      }
    });

    // 5. Draw Openings (Doors & Windows)
    floor.openings.forEach((op) => {
      const isDoor = op.type.includes('door') || op.type.includes('bay');
      const opW = op.width * zoom;
      const opOffset = op.offset * zoom;

      ctx.save();
      if (op.wall === 'south') {
        const ox = bScreenX + opOffset;
        const oy = bScreenY + bScreenH - tExtPx;

        // Clear wall mask
        ctx.fillStyle = colors.bg;
        ctx.fillRect(ox, oy, opW, tExtPx);

        if (isDoor) {
          // Door leaf line + swing arc
          ctx.strokeStyle = colors.door;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox, oy + tExtPx);
          ctx.lineTo(ox, oy + tExtPx - opW);
          ctx.stroke();

          // Arc
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(ox, oy + tExtPx, opW, -Math.PI / 2, 0, false);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Window: Frame + Glass center line
          ctx.strokeStyle = colors.window;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ox, oy, opW, tExtPx);
          ctx.beginPath();
          ctx.moveTo(ox, oy + tExtPx / 2);
          ctx.lineTo(ox + opW, oy + tExtPx / 2);
          ctx.stroke();
        }
      } else if (op.wall === 'north') {
        const ox = bScreenX + opOffset;
        const oy = bScreenY;

        ctx.fillStyle = colors.bg;
        ctx.fillRect(ox, oy, opW, tExtPx);

        if (isDoor) {
          ctx.strokeStyle = colors.door;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox, oy + opW);
          ctx.stroke();

          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(ox, oy, opW, 0, Math.PI / 2, false);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = colors.window;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ox, oy, opW, tExtPx);
          ctx.beginPath();
          ctx.moveTo(ox, oy + tExtPx / 2);
          ctx.lineTo(ox + opW, oy + tExtPx / 2);
          ctx.stroke();
        }
      } else if (op.wall === 'west') {
        const ox = bScreenX;
        const oy = bScreenY + opOffset;

        ctx.fillStyle = colors.bg;
        ctx.fillRect(ox, oy, tExtPx, opW);

        ctx.strokeStyle = colors.window;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, tExtPx, opW);
        ctx.beginPath();
        ctx.moveTo(ox + tExtPx / 2, oy);
        ctx.lineTo(ox + tExtPx / 2, oy + opW);
        ctx.stroke();
      } else if (op.wall === 'east') {
        const ox = bScreenX + bScreenW - tExtPx;
        const oy = bScreenY + opOffset;

        ctx.fillStyle = colors.bg;
        ctx.fillRect(ox, oy, tExtPx, opW);

        ctx.strokeStyle = colors.window;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, tExtPx, opW);
        ctx.beginPath();
        ctx.moveTo(ox + tExtPx / 2, oy);
        ctx.lineTo(ox + tExtPx / 2, oy + opW);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 5.5 Draw Stairs (Escaliers)
    if (floor.stairs && floor.stairs.length > 0) {
      floor.stairs.forEach((stair) => {
        const sx = toScreenX(stair.x);
        const sy = toScreenY(stair.y);
        const sw = stair.width * zoom;
        const sl = stair.length * zoom;

        ctx.save();
        // Stair border outline
        ctx.strokeStyle = colors.wallExt;
        ctx.lineWidth = 2;
        ctx.fillStyle = isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(241, 245, 249, 0.7)';
        ctx.fillRect(sx, sy, sw, sl);
        ctx.strokeRect(sx, sy, sw, sl);

        // Steps lines
        const numSteps = stair.stepsCount || 15;
        const stepH = sl / numSteps;
        ctx.strokeStyle = isClassic ? '#64748b' : '#38bdf8';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        for (let i = 1; i < numSteps; i++) {
          const stepY = sy + i * stepH;
          ctx.moveTo(sx, stepY);
          ctx.lineTo(sx + sw, stepY);
        }
        ctx.stroke();

        // Direction Arrow (Montée)
        ctx.strokeStyle = '#0284c7';
        ctx.fillStyle = '#0284c7';
        ctx.lineWidth = 1.8;
        const midX = sx + sw / 2;
        const startY = sy + sl - 12;
        const endY = sy + 14;

        ctx.beginPath();
        ctx.moveTo(midX, startY);
        ctx.lineTo(midX, endY);
        // Arrow head
        ctx.lineTo(midX - 5, endY + 8);
        ctx.moveTo(midX, endY);
        ctx.lineTo(midX + 5, endY + 8);
        ctx.stroke();

        // Label
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.textMain;
        ctx.textAlign = 'center';
        ctx.fillText(`${stair.stepsCount}M · MONTÉE`, midX, sy + sl / 2);
        ctx.restore();
      });
    }

    // 6. Draw Architectural Dimension Lines (Cotations extérieures)
    const drawCoteLine = (x1: number, y1: number, x2: number, y2: number, text: string, offsetM: number, isVertical: boolean) => {
      ctx.save();
      ctx.strokeStyle = colors.cotes;
      ctx.fillStyle = colors.cotes;
      ctx.lineWidth = 1.2;

      // Extension lines
      const extLen = 14;
      const tick = 6;

      if (!isVertical) {
        // Horizontal cote line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y1 + offsetM);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2, y2 + offsetM);
        ctx.moveTo(x1, y1 + offsetM - 4);
        ctx.lineTo(x2, y2 + offsetM - 4);
        ctx.stroke();

        // 45 deg architectural ticks
        ctx.beginPath();
        ctx.moveTo(x1 - tick, y1 + offsetM - 4 + tick);
        ctx.lineTo(x1 + tick, y1 + offsetM - 4 - tick);
        ctx.moveTo(x2 - tick, y2 + offsetM - 4 + tick);
        ctx.lineTo(x2 + tick, y2 + offsetM - 4 - tick);
        ctx.stroke();

        // Text
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, (x1 + x2) / 2, y1 + offsetM - 7);
      } else {
        // Vertical cote line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + offsetM, y1);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 + offsetM, y2);
        ctx.moveTo(x1 + offsetM - 4, y1);
        ctx.lineTo(x2 + offsetM - 4, y2);
        ctx.stroke();

        // Ticks
        ctx.beginPath();
        ctx.moveTo(x1 + offsetM - 4 - tick, y1 + tick);
        ctx.lineTo(x1 + offsetM - 4 + tick, y1 - tick);
        ctx.moveTo(x2 + offsetM - 4 - tick, y2 + tick);
        ctx.lineTo(x2 + offsetM - 4 + tick, y2 - tick);
        ctx.stroke();

        // Rotated text
        ctx.save();
        ctx.translate(x1 + offsetM - 12, (y1 + y2) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    };

    // Overall Building Length Cote (Bottom)
    drawCoteLine(
      bScreenX,
      bScreenY + bScreenH,
      bScreenX + bScreenW,
      bScreenY + bScreenH,
      `${bLen.toFixed(2)} m`,
      35,
      false
    );

    // Overall Building Width Cote (Left)
    drawCoteLine(
      bScreenX,
      bScreenY,
      bScreenX,
      bScreenY + bScreenH,
      `${bWid.toFixed(2)} m`,
      -35,
      true
    );

    // 7. Dynamic Architectural Scale Bar (Bottom-Right)
    const scaleBarMeters = 2;
    const scaleBarPx = scaleBarMeters * zoom;
    const sbX = width - scaleBarPx - 30;
    const sbY = height - 25;

    ctx.save();
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sbX, sbY);
    ctx.lineTo(sbX + scaleBarPx, sbY);
    ctx.moveTo(sbX, sbY - 5);
    ctx.lineTo(sbX, sbY + 5);
    ctx.moveTo(sbX + scaleBarPx / 2, sbY - 3);
    ctx.lineTo(sbX + scaleBarPx / 2, sbY + 3);
    ctx.moveTo(sbX + scaleBarPx, sbY - 5);
    ctx.lineTo(sbX + scaleBarPx, sbY + 5);
    ctx.stroke();

    ctx.fillStyle = colors.textMuted;
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', sbX, sbY - 7);
    ctx.fillText('1m', sbX + scaleBarPx / 2, sbY - 7);
    ctx.fillText(`${scaleBarMeters}m`, sbX + scaleBarPx, sbY - 7);
    ctx.fillText('ÉCHELLE 1:100', sbX + scaleBarPx / 2, sbY + 16);
    ctx.restore();

    ctx.restore();
  }, [
    project,
    activeFloorIndex,
    selectedRoomId,
    styleMode,
    zoom,
    pan,
    floor,
    toMeterX,
    toMeterY,
    toScreenX,
    toScreenY,
  ]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const meterXBefore = (mouseX - pan.x) / zoom;
    const meterYBefore = (mouseY - pan.y) / zoom;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 12), 160);

    const newPanX = mouseX - meterXBefore * newZoom;
    const newPanY = mouseY - meterYBefore * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Mouse down: room selection, dragging, or panning
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mX = toMeterX(clickX);
    const mY = toMeterY(clickY);

    // Pan with middle click or space key
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: clickX - pan.x, y: clickY - pan.y });
      return;
    }

    // Check if clicked resize handle on currently selected room
    if (selectedRoomId) {
      const selected = floor.rooms.find((r) => r.id === selectedRoomId);
      if (selected) {
        const handleThreshold = 10 / zoom; // 10px in meters
        const brHandleX = selected.x + selected.width;
        const brHandleY = selected.y + selected.length;

        if (Math.abs(mX - brHandleX) < handleThreshold && Math.abs(mY - brHandleY) < handleThreshold) {
          setDragMode('resize-br');
          setDragStartPos({ x: mX, y: mY });
          setInitialRoomState({ ...selected });
          return;
        }

        if (Math.abs(mX - brHandleX) < handleThreshold && mY >= selected.y && mY <= brHandleY) {
          setDragMode('resize-r');
          setDragStartPos({ x: mX, y: mY });
          setInitialRoomState({ ...selected });
          return;
        }

        if (Math.abs(mY - brHandleY) < handleThreshold && mX >= selected.x && mX <= brHandleX) {
          setDragMode('resize-b');
          setDragStartPos({ x: mX, y: mY });
          setInitialRoomState({ ...selected });
          return;
        }
      }
    }

    // Check room hit test
    const hitRoom = [...floor.rooms].reverse().find((room) => {
      return (
        mX >= room.x &&
        mX <= room.x + room.width &&
        mY >= room.y &&
        mY <= room.y + room.length
      );
    });

    if (hitRoom) {
      onSelectRoom(hitRoom.id);
      setDragMode('move');
      setDragStartPos({ x: mX, y: mY });
      setInitialRoomState({ ...hitRoom });
    } else {
      // Clicked outside any room -> pan or deselect
      onSelectRoom(null);
      setIsPanning(true);
      setPanStart({ x: clickX - pan.x, y: clickY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    const mX = toMeterX(curX);
    const mY = toMeterY(curY);

    setMouseMeters({ x: Math.max(0, snap(mX)), y: Math.max(0, snap(mY)) });

    if (isPanning) {
      setPan({
        x: curX - panStart.x,
        y: curY - panStart.y,
      });
      return;
    }

    if (dragMode && initialRoomState) {
      const deltaX = mX - dragStartPos.x;
      const deltaY = mY - dragStartPos.y;

      if (dragMode === 'move') {
        const newX = Math.max(0.2, snap(initialRoomState.x + deltaX));
        const newY = Math.max(0.2, snap(initialRoomState.y + deltaY));
        onUpdateRoom(activeFloorIndex, initialRoomState.id, { x: newX, y: newY });
      } else if (dragMode === 'resize-br') {
        const newW = Math.max(1.0, snap(initialRoomState.width + deltaX));
        const newL = Math.max(1.0, snap(initialRoomState.length + deltaY));
        onUpdateRoom(activeFloorIndex, initialRoomState.id, { width: newW, length: newL });
      } else if (dragMode === 'resize-r') {
        const newW = Math.max(1.0, snap(initialRoomState.width + deltaX));
        onUpdateRoom(activeFloorIndex, initialRoomState.id, { width: newW });
      } else if (dragMode === 'resize-b') {
        const newL = Math.max(1.0, snap(initialRoomState.length + deltaY));
        onUpdateRoom(activeFloorIndex, initialRoomState.id, { length: newL });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragMode(null);
    setInitialRoomState(null);
  };

  // Touch gesture state for mobile pinch-to-zoom and touch pan
  const touchStartRef = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 1) {
      const t = e.touches[0];
      const clickX = t.clientX - rect.left;
      const clickY = t.clientY - rect.top;
      const mX = toMeterX(clickX);
      const mY = toMeterY(clickY);

      touchStartRef.current = { x: clickX - pan.x, y: clickY - pan.y };

      // Check room hit test
      const hitRoom = [...floor.rooms].reverse().find((room) => {
        return mX >= room.x && mX <= room.x + room.width && mY >= room.y && mY <= room.y + room.length;
      });

      if (hitRoom) {
        onSelectRoom(hitRoom.id);
        setDragMode('move');
        setDragStartPos({ x: mX, y: mY });
        setInitialRoomState({ ...hitRoom });
      } else {
        onSelectRoom(null);
        setIsPanning(true);
        setPanStart({ x: clickX - pan.x, y: clickY - pan.y });
      }
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartRef.current = {
        x: (t1.clientX + t2.clientX) / 2 - rect.left,
        y: (t1.clientY + t2.clientY) / 2 - rect.top,
        dist,
      };
      setIsPanning(true);
      setDragMode(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (e.touches.length === 1 && isPanning) {
      const t = e.touches[0];
      const curX = t.clientX - rect.left;
      const curY = t.clientY - rect.top;
      setPan({
        x: curX - touchStartRef.current.x,
        y: curY - touchStartRef.current.y,
      });
    } else if (e.touches.length === 1 && dragMode && initialRoomState) {
      const t = e.touches[0];
      const curX = t.clientX - rect.left;
      const curY = t.clientY - rect.top;
      const mX = toMeterX(curX);
      const mY = toMeterY(curY);
      const deltaX = mX - dragStartPos.x;
      const deltaY = mY - dragStartPos.y;
      const newX = Math.max(0.2, snap(initialRoomState.x + deltaX));
      const newY = Math.max(0.2, snap(initialRoomState.y + deltaY));
      onUpdateRoom(activeFloorIndex, initialRoomState.id, { x: newX, y: newY });
    } else if (e.touches.length === 2 && touchStartRef.current.dist) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = newDist / touchStartRef.current.dist;
      touchStartRef.current.dist = newDist;

      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
      const meterXBefore = (midX - pan.x) / zoom;
      const meterYBefore = (midY - pan.y) / zoom;

      const newZoom = Math.min(Math.max(zoom * factor, 12), 160);
      const newPanX = midX - meterXBefore * newZoom;
      const newPanY = midY - meterYBefore * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDragMode(null);
    setInitialRoomState(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/archistudio-component');
    if (!dataStr) return;

    try {
      const item = JSON.parse(dataStr);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dropPixelX = e.clientX - rect.left;
      const dropPixelY = e.clientY - rect.top;

      const dropMeterX = Math.max(0.5, snap(toMeterX(dropPixelX)));
      const dropMeterY = Math.max(0.5, snap(toMeterY(dropPixelY)));

      if (onDropComponent) {
        onDropComponent(item, dropMeterX, dropMeterY);
      }
    } catch (err) {
      console.error('Error dropping component:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-full h-full select-none overflow-hidden bg-slate-950 touch-none"
    >
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Top Floating CAD Controls */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-4 flex items-center gap-1.5 sm:gap-2 z-10 max-w-[calc(100%-16px)] overflow-x-auto no-scrollbar">
        {/* Style Preset Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 backdrop-blur-sm shadow-md shrink-0">
          <button
            onClick={() => onChangeStyleMode('modern')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              styleMode === 'modern'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="sm:hidden">Sombre</span>
            <span className="hidden sm:inline">Studio Sombre</span>
          </button>
          <button
            onClick={() => onChangeStyleMode('blueprint')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              styleMode === 'blueprint'
                ? 'bg-blue-600/30 text-sky-300 border border-blue-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="sm:hidden">Cyan</span>
            <span className="hidden sm:inline">Blueprint Cyan</span>
          </button>
          <button
            onClick={() => onChangeStyleMode('classic')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              styleMode === 'classic'
                ? 'bg-white text-slate-900 border border-slate-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="sm:hidden">Blanc</span>
            <span className="hidden sm:inline">Technique Blanc</span>
          </button>
        </div>

        {/* Snap & Grid Info */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-300 backdrop-blur-sm shadow-md shrink-0">
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span>Grille: <strong className="font-mono text-cyan-300">{project.gridSize}m</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-medium">{project.snapToGrid ? 'Magnétisme ON' : 'Libre'}</span>
        </div>
      </div>

      {/* Floating Bottom Live Coordinate Bar & North Indicator */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 hidden xs:flex items-center gap-2 sm:gap-3 z-10 pointer-events-none">
        {/* North Compass Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-900/85 border border-slate-700/70 rounded-md text-[10px] sm:text-xs font-mono text-cyan-400 shadow-sm backdrop-blur-sm">
          <Compass className="w-3 h-3 text-rose-500" />
          <span>NORD</span>
        </div>

        {/* Live Coordinate Display */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-900/85 border border-slate-700/70 rounded-md text-[10px] sm:text-xs font-mono text-slate-300 shadow-sm backdrop-blur-sm">
          <Crosshair className="w-3 h-3 text-cyan-400" />
          <span>X: <strong className="text-white">{mouseMeters.x.toFixed(1)}m</strong></span>
          <span className="text-slate-600">/</span>
          <span>Y: <strong className="text-white">{mouseMeters.y.toFixed(1)}m</strong></span>
        </div>
      </div>

      {/* Floating Zoom and Pan Controls */}
      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-4 flex items-center gap-1 z-10 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 backdrop-blur-sm shadow-md">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.25, 160))}
          title="Zoom avant"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors touch-manipulation"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="px-1 text-[11px] sm:text-xs font-mono text-slate-400 min-w-9 text-center">
          {Math.round((zoom / 45) * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(z * 0.8, 12))}
          title="Zoom arrière"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors touch-manipulation"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={centerBuilding}
          title="Centrer le bâtiment"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors touch-manipulation"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
