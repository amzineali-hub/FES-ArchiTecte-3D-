import React, { useState, useRef, useEffect } from 'react';
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
  Download,
  Upload,
} from 'lucide-react';

const RailSection: React.FC<{ label: string }> = ({ label }) => (
  <div className="mt-3 mb-1 border-b border-slate-800 pb-1.5 font-serif text-base font-semibold tracking-wider text-cyan-400 first:mt-0">
    {label}
  </div>
);

const RailButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title?: string;
  active?: boolean;
  toggle?: boolean;
  accent?: boolean;
  green?: boolean;
  primary?: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, title, active, toggle, accent, green, primary, onClick }) => {
  // Mouda Palace sidebar look: gold outline buttons, filled gold when active
  let tone = 'text-cyan-400 border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-400/10';
  if (primary) tone = 'bg-cyan-600 text-white border-transparent hover:bg-cyan-500 shadow-lg shadow-cyan-600/30';
  if (active) tone = 'bg-cyan-500 text-slate-950 border-transparent shadow-lg shadow-cyan-500/20';
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all duration-300 ${tone}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{label}</span>
    </button>
  );
};

const STORAGE_KEY = 'fes-architecte-3d:project';

// Minimal structural check so a corrupted/foreign file can't crash the app
function isValidProject(p: any): p is BuildingProject {
  return !!(
    p &&
    typeof p === 'object' &&
    typeof p.title === 'string' &&
    Array.isArray(p.floors) &&
    p.floors.length > 0 &&
    p.floors.every((f: any) => f && Array.isArray(f.rooms) && Array.isArray(f.openings)) &&
    p.dimensions &&
    typeof p.dimensions.length === 'number' &&
    typeof p.dimensions.width === 'number' &&
    p.roof &&
    p.materials
  );
}

function loadSavedProject(): BuildingProject {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidProject(parsed)) return parsed;
    }
  } catch {
    // storage unavailable or corrupted: fall back to the default template
  }
  return structuredClone(TEMPLATES[0].project);
}

export default function App() {
  // Current active project state (restored from the last autosave when available)
  const [project, setProject] = useState<BuildingProject>(loadSavedProject);
  const [activeFloorIndex, setActiveFloorIndex] = useState<number>(0);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Autosave (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      } catch {
        // quota exceeded / private mode: ignore
      }
    }, 400);
    return () => clearTimeout(t);
  }, [project]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // View layout mode: 2d, 3d, split, or photorealistic
  const [viewMode, setViewMode] = useState<'split' | '2d' | '3d' | 'photorealistic'>('split');
  const [styleMode2D, setStyleMode2D] = useState<'classic' | 'blueprint' | 'modern'>('modern');

  // 3D Viewport visualization states
  const [cutawayMode, setCutawayMode] = useState(false);
  const [showRoof, setShowRoof] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);

  // Sidebar & Drawers - both open by default to provide full BIM library & parametric inspector
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Only one side panel at a time, to keep the central viewport large
  const toggleLibrary = () => {
    setIsLibraryOpen((open) => !open);
    setIsSidebarOpen(false);
  };
  const toggleInspector = () => {
    setIsSidebarOpen((open) => !open);
    setIsLibraryOpen(false);
  };

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
      const targetFloor = prev.floors[floorIndex];
      if (!targetFloor) return prev;

      const floors = [...prev.floors];
      floors[floorIndex] = {
        ...targetFloor,
        rooms: targetFloor.rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r)),
      };
      return { ...prev, floors };
    });
  };

  const handleDeleteRoom = (floorIndex: number, roomId: string) => {
    setProject((prev) => {
      const targetFloor = prev.floors[floorIndex];
      if (!targetFloor) return prev;

      const floors = [...prev.floors];
      floors[floorIndex] = { ...targetFloor, rooms: targetFloor.rooms.filter((r) => r.id !== roomId) };
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
      const targetFloor = prev.floors[floorIndex];
      if (!targetFloor) return prev;

      const floors = [...prev.floors];
      floors[floorIndex] = {
        ...targetFloor,
        openings: targetFloor.openings.map((op) => (op.id === opId ? { ...op, ...updates } : op)),
      };
      return { ...prev, floors };
    });
  };

  const handleDeleteOpening = (floorIndex: number, opId: string) => {
    setProject((prev) => {
      const targetFloor = prev.floors[floorIndex];
      if (!targetFloor) return prev;

      const floors = [...prev.floors];
      floors[floorIndex] = { ...targetFloor, openings: targetFloor.openings.filter((op) => op.id !== opId) };
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

  const handleExportProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project.title || 'projet').replace(/[^\w\-]+/g, '_')}.fes3d.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsTemplateMenuOpen(false);
  };

  const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidProject(parsed)) throw new Error('invalid');
      setProject(parsed);
      setActiveFloorIndex(0);
      setSelectedRoomId(null);
      setIsTemplateMenuOpen(false);
    } catch {
      alert("Fichier invalide : ce n'est pas un projet FES ArchiTecte 3D.");
    }
  };

  const handleSelectTemplate = (templateProject: BuildingProject) => {
    if (!window.confirm('Charger ce modèle remplacera le projet en cours. Continuer ?')) return;
    setProject(structuredClone(templateProject));
    setActiveFloorIndex(0);
    setSelectedRoomId(null);
    setIsTemplateMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* 1. TOP BAR: Brand | Nav Items | Actions */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between px-3 sm:px-5 shrink-0 z-[45] backdrop-blur-md">
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
                <div className="border-t border-slate-800 mt-1.5 pt-1.5">
                  <button
                    onClick={handleExportProject}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-xs font-semibold text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    Exporter le projet (.json)
                  </button>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-xs font-semibold text-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    Ouvrir un projet (.json)
                  </button>
                  <span className="text-[10px] text-slate-500 px-2 block">Sauvegarde automatique dans ce navigateur</span>
                </div>
              </div>
            )}
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportProject}
            />
          </div>
        </div>

        {/* Zone 3: Primary Actions (mobile only — on desktop they live in the left rail) */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
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
        {/* Left navigation rail (desktop): views, tools, analysis & export */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col gap-2 overflow-y-auto border-r border-slate-800 bg-slate-900 p-4 text-slate-100 z-20">
          <div className="mb-2 text-center">
            <h1 className="font-serif text-lg font-normal uppercase tracking-[0.15em] text-cyan-400">FES ArchiTecte</h1>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-300">Conception & BIM 3D</p>
          </div>
          <RailSection label="Vues" />
          <RailButton
            icon={Layout}
            label="Vue double 2D / 3D"
            title="Vue double 2D / 3D"
            active={viewMode === 'split'}
            onClick={() => setViewMode('split')}
          />
          <RailButton
            icon={Maximize2}
            label="Plan 2D"
            active={viewMode === '2d'}
            onClick={() => setViewMode('2d')}
          />
          <RailButton
            icon={Box}
            label="Maquette 3D"
            active={viewMode === '3d'}
            onClick={() => setViewMode('3d')}
          />
          <RailButton
            icon={Sparkles}
            label="Studio photoréaliste"
            title="Studio photoréaliste / rendu"
            active={viewMode === 'photorealistic'}
            accent
            onClick={() => setViewMode('photorealistic')}
          />

          <RailSection label="Outils" />
          <RailButton
            icon={Layers}
            label="Composants BIM"
            active={isLibraryOpen}
            toggle
            onClick={toggleLibrary}
          />
          <RailButton
            icon={Sliders}
            label="Cotes & BET"
            active={isSidebarOpen}
            toggle
            onClick={toggleInspector}
          />

          <RailSection label="Sortie" />
          <RailButton
            icon={ShieldCheck}
            label="Normes Maroc"
            title="Conformité Maroc : BAEL 91, RPS 2011, RTCM & Loi 12-90"
            green
            onClick={() => setIsMoroccanModalOpen(true)}
          />
          <RailButton
            icon={FileCode}
            label="Export CAD (DXF / OBJ)"
            title="Export CAD (DXF / OBJ)"
            primary
            onClick={() => setIsCadModalOpen(true)}
          />
        </aside>

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
          onClick={toggleInspector}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors min-h-[46px] ${
            isSidebarOpen ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span>Cotes/BET</span>
        </button>

        <button
          onClick={toggleLibrary}
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
