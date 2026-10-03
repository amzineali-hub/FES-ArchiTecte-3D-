import React, { useState, useRef } from 'react';
import {
  BuildingProject,
  RoomData,
  OpeningData,
  StairData,
} from './types/architecture';
import { TEMPLATES } from './utils/templates';
import { CatalogItem } from './utils/componentCatalog';
import { Plan2DCanvas } from './components/Plan2DCanvas';
import { Viewport3D } from './components/Viewport3D';
import { ParametricSidebar } from './components/ParametricSidebar';
import { ComponentLibrary } from './components/ComponentLibrary';
import { CadExportModal } from './components/CadExportModal';
import { RenderModal } from './components/RenderModal';
import { PhotorealisticRenderStudio } from './components/PhotorealisticRenderStudio';
import { MoroccanNormsModal } from './components/MoroccanNormsModal';
import {
  Layout,
  Maximize2,
  Box,
  FileCode,
  Camera,
  FolderOpen,
  Plus,
  Compass,
  Layers,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Sliders,
  Menu,
} from 'lucide-react';

export default function App() {
  // Current active project state
  const [project, setProject] = useState<BuildingProject>(TEMPLATES[0].project);
  const [activeFloorIndex, setActiveFloorIndex] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // View layout mode: 2d, 3d, split, or photorealistic
  const [viewMode, setViewMode] = useState<'split' | '2d' | '3d' | 'photorealistic'>('split');
  const [styleMode2D, setStyleMode2D] = useState<'classic' | 'blueprint' | 'modern'>('modern');

  // 3D Viewport visualization states
  const [cutawayMode, setCutawayMode] = useState(false);
  const [showRoof, setShowRoof] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);

  // Sidebar & Drawers - both open by default to provide full BIM library & parametric inspector
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals
  const [isCadModalOpen, setIsCadModalOpen] = useState(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isMoroccanModalOpen, setIsMoroccanModalOpen] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);

  // Quick project template selector dropdown
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Update project helper
  const handleUpdateProject = (updates: Partial<BuildingProject>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  };

  // Floor management
  const handleAddFloor = () => {
    const newLevel = project.floors.length;
    const newFloor = {
      id: `floor_${newLevel}_${Date.now()}`,
      level: newLevel,
      name: `Étage ${newLevel} (R+${newLevel})`,
      ceilingHeight: 2.7,
      rooms: [
        {
          id: `room_${newLevel}_1`,
          name: `Pièce Principale R+${newLevel}`,
          type: 'living' as const,
          x: 0.5,
          y: 0.5,
          width: 5.0,
          length: 4.5,
          floorFinish: 'parquet_oak' as const,
          customColor: '#818cf8',
        },
      ],
      openings: [
        {
          id: `op_${newLevel}_1`,
          type: 'window_double' as const,
          wall: 'south' as const,
          offset: 1.5,
          width: 1.4,
          height: 1.35,
          sillHeight: 0.85,
        },
      ],
    };

    setProject((prev) => ({
      ...prev,
      floors: [...prev.floors, newFloor],
    }));
    setActiveFloorIndex(newLevel);
  };

  const handleDeleteFloor = (index: number) => {
    if (project.floors.length <= 1) return;
    const updatedFloors = project.floors.filter((_, i) => i !== index);
    setProject((prev) => ({ ...prev, floors: updatedFloors }));
    setActiveFloorIndex(Math.max(0, index - 1));
  };

  // Room management
  const handleAddRoom = () => {
    const currentFloor = project.floors[activeFloorIndex] || project.floors[0];
    const newRoom: RoomData = {
      id: `room_${Date.now()}`,
      name: `Nouvelle Pièce ${currentFloor.rooms.length + 1}`,
      type: 'bedroom',
      x: 1.0,
      y: 1.0,
      width: 4.0,
      length: 3.5,
      floorFinish: 'parquet_oak',
      customColor: '#38bdf8',
    };

    const updatedFloors = [...project.floors];
    updatedFloors[activeFloorIndex] = {
      ...currentFloor,
      rooms: [...currentFloor.rooms, newRoom],
    };

    setProject((prev) => ({ ...prev, floors: updatedFloors }));
    setSelectedRoomId(newRoom.id);
  };

  const handleUpdateRoom = (floorIndex: number, roomId: string, updates: Partial<RoomData>) => {
    setProject((prev) => {
      const floors = [...prev.floors];
      const targetFloor = floors[floorIndex];
      if (!targetFloor) return prev;

      targetFloor.rooms = targetFloor.rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r));
      return { ...prev, floors };
    });
  };

  const handleDeleteRoom = (floorIndex: number, roomId: string) => {
    setProject((prev) => {
      const floors = [...prev.floors];
      const targetFloor = floors[floorIndex];
      if (!targetFloor) return prev;

      targetFloor.rooms = targetFloor.rooms.filter((r) => r.id !== roomId);
      return { ...prev, floors };
    });
    if (selectedRoomId === roomId) {
      setSelectedRoomId(null);
    }
  };

  // Opening management
  const handleAddOpening = () => {
    const currentFloor = project.floors[activeFloorIndex] || project.floors[0];
    const newOpening: OpeningData = {
      id: `op_${Date.now()}`,
      type: 'window_double',
      wall: 'south',
      offset: 2.0,
      width: 1.4,
      height: 1.35,
      sillHeight: 0.85,
    };

    const updatedFloors = [...project.floors];
    updatedFloors[activeFloorIndex] = {
      ...currentFloor,
      openings: [...currentFloor.openings, newOpening],
    };

    setProject((prev) => ({ ...prev, floors: updatedFloors }));
  };

  const handleUpdateOpening = (floorIndex: number, opId: string, updates: Partial<OpeningData>) => {
    setProject((prev) => {
      const floors = [...prev.floors];
      const targetFloor = floors[floorIndex];
      if (!targetFloor) return prev;

      targetFloor.openings = targetFloor.openings.map((op) => (op.id === opId ? { ...op, ...updates } : op));
      return { ...prev, floors };
    });
  };

  const handleDeleteOpening = (floorIndex: number, opId: string) => {
    setProject((prev) => {
      const floors = [...prev.floors];
      const targetFloor = floors[floorIndex];
      if (!targetFloor) return prev;

      targetFloor.openings = targetFloor.openings.filter((op) => op.id !== opId);
      return { ...prev, floors };
    });
  };

  // Drag and drop insertion from catalog
  const handleInsertComponent = (item: CatalogItem, dropX?: number, dropY?: number) => {
    const currentFloor = project.floors[activeFloorIndex] || project.floors[0];
    const updatedFloors = [...project.floors];

    if (item.payload.type === 'opening' && item.payload.openingData) {
      const d = item.payload.openingData;
      const newOpening: OpeningData = {
        id: `op_${Date.now()}`,
        type: d.type,
        wall: dropY && dropY > project.dimensions.width / 2 ? 'south' : 'north',
        offset: dropX ? Math.min(dropX, project.dimensions.length - d.width - 0.5) : 2.0,
        width: d.width,
        height: d.height,
        sillHeight: d.sillHeight,
        swingDirection: d.swingDirection,
      };

      updatedFloors[activeFloorIndex] = {
        ...currentFloor,
        openings: [...currentFloor.openings, newOpening],
      };
      setProject((prev) => ({ ...prev, floors: updatedFloors }));
    } else if (item.payload.type === 'stair' && item.payload.stairData) {
      const s = item.payload.stairData;
      const newStair: StairData = {
        id: `stair_${Date.now()}`,
        name: s.name,
        type: s.type,
        x: dropX ?? 1.5,
        y: dropY ?? 1.5,
        width: s.width,
        length: s.length,
        height: s.height,
        stepsCount: s.stepsCount,
        rotation: 0,
        material: s.material,
      };

      const existingStairs = currentFloor.stairs || [];
      updatedFloors[activeFloorIndex] = {
        ...currentFloor,
        stairs: [...existingStairs, newStair],
      };
      setProject((prev) => ({ ...prev, floors: updatedFloors }));
    } else if (item.payload.type === 'room' && item.payload.roomData) {
      const r = item.payload.roomData;
      const newRoom: RoomData = {
        id: `room_${Date.now()}`,
        name: r.name,
        type: r.type,
        x: dropX ?? 1.0,
        y: dropY ?? 1.0,
        width: r.width,
        length: r.length,
        floorFinish: r.floorFinish,
        customColor: r.customColor,
      };

      updatedFloors[activeFloorIndex] = {
        ...currentFloor,
        rooms: [...currentFloor.rooms, newRoom],
      };
      setProject((prev) => ({ ...prev, floors: updatedFloors }));
      setSelectedRoomId(newRoom.id);
    } else if (item.payload.type === 'roof' && item.payload.roofData) {
      setProject((prev) => ({
        ...prev,
        roof: item.payload.roofData!,
      }));
    }
  };

  const handleSelectTemplate = (templateProject: BuildingProject) => {
    setProject(templateProject);
    setActiveFloorIndex(0);
    setSelectedRoomId(null);
    setIsTemplateMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* 1. TOP BAR: Brand | Nav Items | Actions */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between px-3 sm:px-5 shrink-0 z-30 backdrop-blur-md">
        {/* Zone 1: Brand & Template Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400 shadow-sm shadow-cyan-400 shrink-0" />
            <span className="truncate">FES ArchiTecte 3D</span>
          </span>

          {/* Quick template selector */}
          <div className="relative ml-1 sm:ml-2">
            <button
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="max-w-24 sm:max-w-36 truncate">{project.title}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <span className="text-[10px] font-semibold text-slate-400 px-2.5 py-1 block uppercase tracking-wider">
                  Modèles Architecturaux
                </span>
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.project)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors group block"
                  >
                    <span className="text-xs font-semibold text-white block group-hover:text-cyan-400">
                      {tmpl.name}
                    </span>
                    <span className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                      {tmpl.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Desktop View Navigation Switchers */}
        <nav className="hidden md:flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Vue Double 2D / 3D</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === '2d'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Plan 2D</span>
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === '3d'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Maquette 3D</span>
          </button>
          <button
            onClick={() => setViewMode('photorealistic')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'photorealistic'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 shadow-sm border border-cyan-400/50'
                : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Studio Photoréaliste</span>
          </button>
          <button
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              isLibraryOpen
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Composants BIM</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
              isSidebarOpen
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cotes & BET</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Moroccan Building Codes Audit Button */}
          <button
            onClick={() => setIsMoroccanModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/40 transition-colors shadow-sm"
            title="Conformité Maroc : BAEL 91 (Béton Armé), RPS 2011 (Sismique), RTCM (Thermique) & Loi 12-90"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Normes Maroc</span>
          </button>

          {/* Render 3D Studio Shortcut */}
          <button
            onClick={() => setViewMode('photorealistic')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-cyan-950/60 hover:to-slate-800 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/40 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Rendu Photoréaliste</span>
            <span className="sm:hidden">Rendu</span>
          </button>

          {/* Export CAD */}
          <button
            onClick={() => setIsCadModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-cyan-600/30"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CAD (DXF / OBJ)</span>
            <span className="sm:hidden">Export CAD</span>
          </button>
        </div>
      </header>

      {/* 2. SUB-BAR: Active Floor Level Bar */}
      <div className="h-10 bg-slate-950 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium">Niveau :</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {project.floors.map((fl, idx) => (
              <button
                key={fl.id}
                onClick={() => setActiveFloorIndex(idx)}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                  idx === activeFloorIndex
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {fl.name}
              </button>
            ))}
            <button
              onClick={handleAddFloor}
              title="Ajouter un étage supérieur"
              className="px-2 py-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Étage</span>
            </button>
          </div>
        </div>

        {/* Global Dimensions summary */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
          <span>
            Façade : <strong className="text-white">{project.dimensions.length}m</strong>
          </span>
          <span className="text-slate-700">·</span>
          <span>
            Profondeur : <strong className="text-white">{project.dimensions.width}m</strong>
          </span>
          <span className="text-slate-700">·</span>
          <span>
            Surface Sol :{' '}
            <strong className="text-cyan-400">
              {(project.dimensions.length * project.dimensions.width).toFixed(1)} m²
            </strong>
          </span>
        </div>
      </div>

      {/* 3. WORKSPACE CENTER: Left Sidebars & Viewports */}
      <div className="flex-1 flex overflow-hidden pb-14 md:pb-0 relative">
        {/* Component Library Drawer (Glisser-Déposer / Insérer) */}
        <ComponentLibrary
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onInsertComponent={(item) => handleInsertComponent(item)}
        />

        {/* Parametric Inspector Sidebar */}
        <ParametricSidebar
          project={project}
          activeFloorIndex={activeFloorIndex}
          selectedRoomId={selectedRoomId}
          onUpdateProject={handleUpdateProject}
          onSelectFloor={setActiveFloorIndex}
          onAddFloor={handleAddFloor}
          onDeleteFloor={handleDeleteFloor}
          onSelectRoom={setSelectedRoomId}
          onAddRoom={handleAddRoom}
          onUpdateRoom={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
          onAddOpening={handleAddOpening}
          onUpdateOpening={handleUpdateOpening}
          onDeleteOpening={handleDeleteOpening}
          onOpenMoroccanNorms={() => setIsMoroccanModalOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Viewport Container */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Split Mode: Dual 2D & 3D side by side on desktop, stacked on mobile */}
          {viewMode === 'split' && (
            <div className="w-full h-full flex flex-col md:flex-row">
              {/* 2D Plan Canvas (Top 50% on mobile, Left 50% on desktop) */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-800 relative">
                <Plan2DCanvas
                  project={project}
                  activeFloorIndex={activeFloorIndex}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                  onUpdateRoom={handleUpdateRoom}
                  onDropComponent={(item, x, y) => handleInsertComponent(item, x, y)}
                  styleMode={styleMode2D}
                  onChangeStyleMode={setStyleMode2D}
                />
              </div>

              {/* 3D Three.js Viewport (Bottom 50% on mobile, Right 50% on desktop) */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
                <Viewport3D
                  project={project}
                  activeFloorIndex={activeFloorIndex}
                  cutawayMode={cutawayMode}
                  showRoof={showRoof}
                  showFurniture={showFurniture}
                  onToggleRoof={() => setShowRoof(!showRoof)}
                  onToggleCutaway={() => setCutawayMode(!cutawayMode)}
                  onToggleFurniture={() => setShowFurniture(!showFurniture)}
                  onCaptureSnapshot={(dataUrl) => {
                    setSnapshotDataUrl(dataUrl);
                    setIsRenderModalOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Full 2D Mode */}
          {viewMode === '2d' && (
            <div className="w-full h-full relative">
              <Plan2DCanvas
                project={project}
                activeFloorIndex={activeFloorIndex}
                selectedRoomId={selectedRoomId}
                onSelectRoom={setSelectedRoomId}
                onUpdateRoom={handleUpdateRoom}
                onDropComponent={(item, x, y) => handleInsertComponent(item, x, y)}
                styleMode={styleMode2D}
                onChangeStyleMode={setStyleMode2D}
              />
            </div>
          )}

          {/* Full 3D Mode */}
          {viewMode === '3d' && (
            <div className="w-full h-full relative">
              <Viewport3D
                project={project}
                activeFloorIndex={activeFloorIndex}
                cutawayMode={cutawayMode}
                showRoof={showRoof}
                showFurniture={showFurniture}
                onToggleRoof={() => setShowRoof(!showRoof)}
                onToggleCutaway={() => setCutawayMode(!cutawayMode)}
                onToggleFurniture={() => setShowFurniture(!showFurniture)}
                onCaptureSnapshot={(dataUrl) => {
                  setSnapshotDataUrl(dataUrl);
                  setIsRenderModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Photorealistic Render Studio Mode */}
          {viewMode === 'photorealistic' && (
            <div className="w-full h-full relative">
              <PhotorealisticRenderStudio
                project={project}
                onUpdateProject={handleUpdateProject}
                onClose={() => setViewMode('split')}
              />
            </div>
          )}
        </main>
      </div>

      {/* 4. DEDICATED MOBILE BOTTOM NAVIGATION BAR (Mobile Phones & Small Tablets) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-1 py-1 flex items-center justify-around text-[10px] select-none touch-manipulation">
        <button
          onClick={() => setViewMode('2d')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors min-h-[46px] ${
            viewMode === '2d'
              ? 'text-cyan-400 font-bold bg-cyan-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Maximize2 className="w-4 h-4 mb-0.5" />
          <span>Plan 2D</span>
        </button>

        <button
          onClick={() => setViewMode('3d')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors min-h-[46px] ${
            viewMode === '3d'
              ? 'text-cyan-400 font-bold bg-cyan-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Box className="w-4 h-4 mb-0.5" />
          <span>Maquette</span>
        </button>

        <button
          onClick={() => setViewMode('split')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors min-h-[46px] ${
            viewMode === 'split'
              ? 'text-cyan-400 font-bold bg-cyan-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4 mb-0.5" />
          <span>Double</span>
        </button>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors min-h-[46px] ${
            isSidebarOpen ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>Cotes/BET</span>
        </button>

        <button
          onClick={() => setIsLibraryOpen(!isLibraryOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors min-h-[46px] ${
            isLibraryOpen ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>BIM</span>
        </button>

        <button
          onClick={() => setIsMoroccanModalOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors min-h-[46px]"
        >
          <ShieldCheck className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span className="font-semibold">Normes NM</span>
        </button>
      </nav>

      {/* CAD Export Modal */}
      <CadExportModal
        project={project}
        activeFloorIndex={activeFloorIndex}
        isOpen={isCadModalOpen}
        onClose={() => setIsCadModalOpen(false)}
      />

      {/* 3D Render & AI Visualizer Modal */}
      <RenderModal
        project={project}
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        snapshotDataUrl={snapshotDataUrl}
        onTriggerCapture={() => {
          // If in 3D or split mode, the snapshot will be refreshed
        }}
      />

      {/* Moroccan Building Codes & Norms Compliance Modal */}
      <MoroccanNormsModal
        project={project}
        isOpen={isMoroccanModalOpen}
        onClose={() => setIsMoroccanModalOpen(false)}
        onUpdateProject={handleUpdateProject}
      />
    </div>
  );
}
