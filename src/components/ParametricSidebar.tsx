import React, { useState } from 'react';
import {
  BuildingProject,
  FloorData,
  RoomData,
  OpeningData,
  RoomType,
  FloorFinish,
  OpeningType,
  WallSide,
  RoofType,
  RoofMaterial,
  FacadeMaterial,
  JoineryColor,
} from '../types/architecture';
import { calculateQuantities } from '../utils/quantityCalculations';
import {
  Sliders,
  Layers,
  Square,
  DoorOpen,
  Home,
  FileSpreadsheet,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Calculator,
  Box,
  Coins,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface ParametricSidebarProps {
  project: BuildingProject;
  activeFloorIndex: number;
  selectedRoomId: string | null;
  onUpdateProject: (updates: Partial<BuildingProject>) => void;
  onSelectFloor: (index: number) => void;
  onAddFloor: () => void;
  onDeleteFloor: (index: number) => void;
  onSelectRoom: (roomId: string | null) => void;
  onAddRoom: () => void;
  onUpdateRoom: (floorIndex: number, roomId: string, updates: Partial<RoomData>) => void;
  onDeleteRoom: (floorIndex: number, roomId: string) => void;
  onAddOpening: () => void;
  onUpdateOpening: (floorIndex: number, openingId: string, updates: Partial<OpeningData>) => void;
  onDeleteOpening: (floorIndex: number, openingId: string) => void;
  onOpenMoroccanNorms?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

type TabType = 'dimensions' | 'floors' | 'rooms' | 'openings' | 'materials' | 'takeoff';

export const ParametricSidebar: React.FC<ParametricSidebarProps> = ({
  project,
  activeFloorIndex,
  selectedRoomId,
  onUpdateProject,
  onSelectFloor,
  onAddFloor,
  onDeleteFloor,
  onSelectRoom,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddOpening,
  onUpdateOpening,
  onDeleteOpening,
  onOpenMoroccanNorms,
  isOpen = true,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dimensions');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [chiffrageTier, setChiffrageTier] = useState<'standard' | 'economy' | 'prestige'>('standard');
  const [currency, setCurrency] = useState<'MAD' | 'EUR'>('MAD');

  if (!isOpen) return null;

  const floor = project.floors[activeFloorIndex] || project.floors[0];
  const selectedRoom = floor.rooms.find((r) => r.id === selectedRoomId);
  const quantities = calculateQuantities(project);

  const tabs = [
    { id: 'dimensions', label: 'Cotes', icon: Sliders },
    { id: 'floors', label: 'Niveaux', icon: Layers },
    { id: 'rooms', label: 'Pièces', icon: Square },
    { id: 'openings', label: 'Menuiseries', icon: DoorOpen },
    { id: 'materials', label: 'Façades & Toit', icon: Home },
    { id: 'takeoff', label: 'Métrés', icon: FileSpreadsheet },
  ];

  return (
    <>
      {onClose && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 animate-in fade-in"
        />
      )}
      <div
        className={`w-84 max-w-[88vw] xl:w-92 h-full flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 text-slate-200 select-none z-30 ${
          onClose
            ? 'lg:relative fixed inset-y-0 left-0 shadow-2xl lg:shadow-none animate-in slide-in-from-left duration-200'
            : ''
        }`}
      >
        {/* Mobile Header with Close Button */}
        {onClose && (
          <div className="lg:hidden px-4 py-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paramètres & Cotes</span>
            </span>
            <button
              onClick={onClose}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
            >
              Fermer ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950/60 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              title={tab.label}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-md text-[10px] font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* 1. GENERAL DIMENSIONS & COTES TAB */}
        {activeTab === 'dimensions' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Cotes & Emprise Globale</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dimensions extérieures et épaisseurs de parois du bâtiment.
              </p>
            </div>

            {/* Length & Width */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Longueur (X en m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="50.0"
                  value={project.dimensions.length}
                  onChange={(e) =>
                    onUpdateProject({
                      dimensions: {
                        ...project.dimensions,
                        length: Math.max(4.0, parseFloat(e.target.value) || 10),
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono font-medium focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Largeur (Y en m)</label>
                <input
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="40.0"
                  value={project.dimensions.width}
                  onChange={(e) =>
                    onUpdateProject({
                      dimensions: {
                        ...project.dimensions,
                        width: Math.max(3.0, parseFloat(e.target.value) || 8),
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono font-medium focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Emprise au sol (par niveau) :</span>
                <span className="font-mono font-bold text-cyan-400">
                  {(project.dimensions.length * project.dimensions.width).toFixed(1)} m²
                </span>
              </div>
            </div>

            {/* Wall Thicknesses */}
            <div className="space-y-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <span className="font-medium text-slate-300 block text-[11px]">Épaisseurs de parois</span>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Murs extérieurs :</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    min="0.15"
                    max="0.60"
                    value={project.exteriorWallThickness}
                    onChange={(e) =>
                      onUpdateProject({
                        exteriorWallThickness: parseFloat(e.target.value) || 0.3,
                      })
                    }
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-slate-500">m</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cloisons intérieures :</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0.07"
                    max="0.25"
                    value={project.interiorWallThickness}
                    onChange={(e) =>
                      onUpdateProject({
                        interiorWallThickness: parseFloat(e.target.value) || 0.15,
                      })
                    }
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-slate-500">m</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hauteur soubassement :</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    min="0.10"
                    max="1.50"
                    value={project.foundationHeight}
                    onChange={(e) =>
                      onUpdateProject({
                        foundationHeight: parseFloat(e.target.value) || 0.35,
                      })
                    }
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-slate-500">m</span>
                </div>
              </div>
            </div>

            {/* Grid & Drafting Precision */}
            <div className="space-y-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <span className="font-medium text-slate-300 block text-[11px]">Grille & Magnétisme</span>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Magnétisme sur grille :</span>
                <button
                  onClick={() => onUpdateProject({ snapToGrid: !project.snapToGrid })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    project.snapToGrid
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {project.snapToGrid ? 'Activé (ON)' : 'Désactivé'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pas de grille :</span>
                <div className="flex items-center gap-1">
                  {[0.25, 0.5, 1.0].map((step) => (
                    <button
                      key={step}
                      onClick={() => onUpdateProject({ gridSize: step })}
                      className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                        project.gridSize === step
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {step}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FLOORS & LEVELS TAB */}
        {activeTab === 'floors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Gestion des Niveaux</h2>
                <p className="text-[11px] text-slate-400">Étages et hauteurs sous plafond.</p>
              </div>
              <button
                onClick={onAddFloor}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* List of Floors */}
            <div className="space-y-2">
              {project.floors.map((fl, idx) => {
                const isActive = idx === activeFloorIndex;
                const roomCount = fl.rooms.length;
                const floorArea = fl.rooms.reduce((acc, r) => acc + r.width * r.length, 0);

                return (
                  <div
                    key={fl.id}
                    onClick={() => onSelectFloor(idx)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-cyan-950/30 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs ${
                            isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          R+{fl.level}
                        </span>
                        <div>
                          <span className="font-semibold text-white block">{fl.name}</span>
                          <span className="text-[11px] text-slate-400">
                            {roomCount} pièces · {floorArea.toFixed(1)} m² hab.
                          </span>
                        </div>
                      </div>

                      {project.floors.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFloor(idx);
                          }}
                          title="Supprimer ce niveau"
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Active floor height input */}
                    {isActive && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Hauteur sous plafond :</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.05"
                            min="2.2"
                            max="5.0"
                            value={fl.ceilingHeight}
                            onChange={(e) => {
                              const newHeight = parseFloat(e.target.value) || 2.7;
                              const updatedFloors = [...project.floors];
                              updatedFloors[idx] = { ...fl, ceilingHeight: newHeight };
                              onUpdateProject({ floors: updatedFloors });
                            }}
                            className="w-18 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right text-white font-mono focus:border-cyan-500 focus:outline-none"
                          />
                          <span className="text-slate-500">m</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ROOMS & SPACES TAB */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Pièces & Espaces</h2>
                <p className="text-[11px] text-slate-400">
                  {floor.name} ({floor.rooms.length} pièces)
                </p>
              </div>
              <button
                onClick={onAddRoom}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* Selected Room Detailed Parametric Editor */}
            {selectedRoom ? (
              <div className="bg-slate-950/70 p-3.5 rounded-lg border border-cyan-500/50 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                    Édition : {selectedRoom.name}
                  </span>
                  <button
                    onClick={() => onDeleteRoom(activeFloorIndex, selectedRoom.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Supprimer la pièce"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Désignation</label>
                  <input
                    type="text"
                    value={selectedRoom.name}
                    onChange={(e) =>
                      onUpdateRoom(activeFloorIndex, selectedRoom.id, { name: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-medium focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Room Type */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Type d’espace</label>
                  <select
                    value={selectedRoom.type}
                    onChange={(e) =>
                      onUpdateRoom(activeFloorIndex, selectedRoom.id, {
                        type: e.target.value as RoomType,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="living">Séjour / Salon</option>
                    <option value="kitchen">Cuisine</option>
                    <option value="dining">Salle à Manger</option>
                    <option value="bedroom">Chambre</option>
                    <option value="bathroom">Salle de Bain / Eau</option>
                    <option value="office">Bureau</option>
                    <option value="hallway">Entrée / Dégagement</option>
                    <option value="terrace">Terrasse / Balcon</option>
                    <option value="garage">Garage / Cellier</option>
                    <option value="storage">Rangement / Dressing</option>
                  </select>
                </div>

                {/* Dimensions L x l */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Longueur X (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="20.0"
                      value={selectedRoom.width}
                      onChange={(e) =>
                        onUpdateRoom(activeFloorIndex, selectedRoom.id, {
                          width: Math.max(1.0, parseFloat(e.target.value) || 2.0),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Largeur Y (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="20.0"
                      value={selectedRoom.length}
                      onChange={(e) =>
                        onUpdateRoom(activeFloorIndex, selectedRoom.id, {
                          length: Math.max(1.0, parseFloat(e.target.value) || 2.0),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Position X, Y */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Position X (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.0"
                      value={selectedRoom.x}
                      onChange={(e) =>
                        onUpdateRoom(activeFloorIndex, selectedRoom.id, {
                          x: Math.max(0.0, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Position Y (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.0"
                      value={selectedRoom.y}
                      onChange={(e) =>
                        onUpdateRoom(activeFloorIndex, selectedRoom.id, {
                          y: Math.max(0.0, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Floor Finish */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Revêtement de sol</label>
                  <select
                    value={selectedRoom.floorFinish}
                    onChange={(e) =>
                      onUpdateRoom(activeFloorIndex, selectedRoom.id, {
                        floorFinish: e.target.value as FloorFinish,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="parquet_oak">Parquet Chêne Massif</option>
                    <option value="tile_marble">Carrelage Marbre Blanc</option>
                    <option value="tile_slate">Carrelage Ardoise Gris Foncé</option>
                    <option value="polished_concrete">Béton Ciré Contemporain</option>
                    <option value="terrace_deck">Lames de Terrasse Bois</option>
                  </select>
                </div>

                {/* Calculated Surface */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Surface calculée :</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {(selectedRoom.width * selectedRoom.length).toFixed(2)} m²
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-400 text-center">
                Cliquez sur une pièce dans le plan 2D ou la liste ci-dessous pour régler ses cotes.
              </div>
            )}

            {/* Room List in active floor */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Liste des pièces
              </span>
              {floor.rooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                const area = (room.width * room.length).toFixed(1);

                return (
                  <div
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-950/30 text-slate-300 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: room.customColor || '#38bdf8' }}
                      />
                      <span className="font-medium truncate max-w-40">{room.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                      <span>{area} m²</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. OPENINGS & JOINERY TAB */}
        {activeTab === 'openings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Menuiseries & Ouvertures</h2>
                <p className="text-[11px] text-slate-400">Portes, baies vitrées et fenêtres.</p>
              </div>
              <button
                onClick={onAddOpening}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-3">
              {floor.openings.map((op, idx) => (
                <div
                  key={op.id}
                  className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">
                      #{idx + 1} · {op.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <button
                      onClick={() => onDeleteOpening(activeFloorIndex, op.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Wall Placement */}
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Façade</label>
                      <select
                        value={op.wall}
                        onChange={(e) =>
                          onUpdateOpening(activeFloorIndex, op.id, {
                            wall: e.target.value as WallSide,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="south">Sud (Avant)</option>
                        <option value="north">Nord (Arrière)</option>
                        <option value="west">Ouest (Gauche)</option>
                        <option value="east">Est (Droite)</option>
                      </select>
                    </div>

                    {/* Opening Type */}
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Type</label>
                      <select
                        value={op.type}
                        onChange={(e) =>
                          onUpdateOpening(activeFloorIndex, op.id, {
                            type: e.target.value as OpeningType,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="sliding_bay">Baie Coulissante</option>
                        <option value="entry_door">Porte d’Entrée</option>
                        <option value="window_standard">Fenêtre 1 Vantail</option>
                        <option value="window_double">Fenêtre 2 Vantaux</option>
                        <option value="window_panoramic">Fenêtre Panoramique</option>
                        <option value="garage_door">Porte de Garage</option>
                      </select>
                    </div>
                  </div>

                  {/* Dimensions & Cotes */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Offset X (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={op.offset}
                        onChange={(e) =>
                          onUpdateOpening(activeFloorIndex, op.id, {
                            offset: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white font-mono text-center focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Largeur (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={op.width}
                        onChange={(e) =>
                          onUpdateOpening(activeFloorIndex, op.id, {
                            width: parseFloat(e.target.value) || 1.0,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white font-mono text-center focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Allège (m)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={op.sillHeight}
                        onChange={(e) =>
                          onUpdateOpening(activeFloorIndex, op.id, {
                            sillHeight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white font-mono text-center focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MATERIALS & ROOF TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Toiture & Finitions Façade</h2>
              <p className="text-[11px] text-slate-400">Typologie architecturale et matériaux 3D.</p>
            </div>

            {/* Roof Config */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
              <span className="font-semibold text-slate-300 block text-[11px]">Type de Toiture</span>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'flat', label: 'Toit Plat' },
                  { id: 'gable', label: '2 Pentes' },
                  { id: 'shed', label: 'Monopente' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() =>
                      onUpdateProject({
                        roof: { ...project.roof, type: r.id as RoofType },
                      })
                    }
                    className={`py-2 px-1 text-center rounded font-medium text-xs transition-colors ${
                      project.roof.type === r.id
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {project.roof.type !== 'flat' && (
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Pente de toit :</span>
                    <span className="font-mono text-white">{project.roof.pitch}°</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="1"
                    value={project.roof.pitch}
                    onChange={(e) =>
                      onUpdateProject({
                        roof: { ...project.roof, pitch: parseInt(e.target.value) || 30 },
                      })
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Matériau de toiture</label>
                <select
                  value={project.roof.material}
                  onChange={(e) =>
                    onUpdateProject({
                      roof: { ...project.roof, material: e.target.value as RoofMaterial },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="tile_terracotta">Tuiles Terre Cuite Provençales</option>
                  <option value="slate_graphite">Ardoise Naturelle Graphite</option>
                  <option value="zinc_dark">Zinc Joint Debout Noir</option>
                  <option value="gravel_terrace">Gravillons / Toit Terrasse</option>
                </select>
              </div>
            </div>

            {/* Facade Materials */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-3">
              <span className="font-semibold text-slate-300 block text-[11px]">Habillage des Façades</span>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Finition murs</label>
                <select
                  value={project.materials.facade}
                  onChange={(e) =>
                    onUpdateProject({
                      materials: { ...project.materials, facade: e.target.value as FacadeMaterial },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="white_stucco">Enduit Minéral Blanc Pur</option>
                  <option value="warm_limestone">Pierre Calcaire Blonde de Taille</option>
                  <option value="nordic_timber">Bardage Bois Scandinave Naturel</option>
                  <option value="anthracite_brick">Brique de Parement Anthracite</option>
                  <option value="raw_concrete">Béton Architectonique Brut</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Teinte Menuiseries</label>
                <select
                  value={project.materials.joineryColor}
                  onChange={(e) =>
                    onUpdateProject({
                      materials: { ...project.materials, joineryColor: e.target.value as JoineryColor },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="black">Noir Mat Contemporain (RAL 9005)</option>
                  <option value="anthracite">Gris Anthracite (RAL 7016)</option>
                  <option value="white">Blanc Pur (RAL 9016)</option>
                  <option value="natural_wood">Chêne Clair Naturel</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 6. QUANTITY TAKEOFF & METRES TAB */}
        {activeTab === 'takeoff' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Métrés & Quantitatifs CAD</h2>
              <p className="text-[11px] text-slate-400">Surfaces normalisées et estimations d'ouvrage.</p>
            </div>

            {/* Surfaces Summary */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="p-2 bg-slate-900/60 rounded">
                <span className="text-[10px] text-slate-400 block">Surface Brute (SHOB)</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {quantities.totalSHOB} m²
                </span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded">
                <span className="text-[10px] text-slate-400 block">Surface Habitable (SHON)</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {quantities.totalSHON} m²
                </span>
              </div>
            </div>

            {/* Breakdown by room */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">Surfaces par pièce</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {quantities.livingAreaByRoom.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] border-b border-slate-800/60 pb-1">
                    <span className="text-slate-300 truncate max-w-36">
                      {item.name} <span className="text-slate-500">({item.floor})</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-semibold">{item.area} m²</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linear walls and volumes */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
              <span className="text-[11px] font-semibold text-slate-300 block">Linéaires & Volumes</span>

              <div className="flex justify-between">
                <span className="text-slate-400">Volume bâti total brut :</span>
                <span className="font-mono text-cyan-400 font-bold">{quantities.totalBuildingVolume} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Béton armé estimé :</span>
                <span className="font-mono text-white font-medium">{quantities.estimatedConcreteVolume} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Murs extérieurs :</span>
                <span className="font-mono text-white font-medium">{quantities.linearMetersExteriorWalls} m.l.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cloisons intérieures :</span>
                <span className="font-mono text-white font-medium">{quantities.linearMetersInteriorWalls} m.l.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Surface de parois façades :</span>
                <span className="font-mono text-white font-medium">{quantities.totalWallSurfaceArea} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Surface de toiture estimée :</span>
                <span className="font-mono text-white font-medium">{quantities.estimatedRoofArea} m²</span>
              </div>
            </div>

            {/* Openings detail */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
              <span className="text-[11px] font-semibold text-slate-300 block">Nomenclature des Ouvertures</span>
              <div className="flex justify-between">
                <span className="text-slate-400">Total ouvertures :</span>
                <span className="font-mono text-white font-bold">{quantities.totalOpeningsCount}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pl-2">
                <span>· Baies vitrées coulissantes :</span>
                <span className="font-mono text-cyan-300 font-semibold">{quantities.openingsBaysCount}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pl-2">
                <span>· Portes (entrée & intérieures) :</span>
                <span className="font-mono text-cyan-300 font-semibold">{quantities.openingsDoorsCount}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pl-2">
                <span>· Fenêtres & châssis :</span>
                <span className="font-mono text-cyan-300 font-semibold">{quantities.openingsWindowsCount}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-1.5 mt-1">
                <span className="text-slate-400">Surface totale vitrée :</span>
                <span className="font-mono text-white font-semibold">{quantities.totalGlazedArea} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ratio surface vitrée / habitable :</span>
                <span className={`font-mono font-bold ${quantities.glazingRatioPercent >= 16.7 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {quantities.glazingRatioPercent}% {quantities.glazingRatioPercent >= 16.7 ? '(≥ 1/6 RE2020 ✓)' : '(< 1/6)'}
                </span>
              </div>
            </div>

            {/* Approvisionnement Chantier & Normes Maroc */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Matériaux Gros Œuvre (Normes NM)</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">B25 / CPJ 45</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                  <span className="text-slate-400 block text-[9px]">Ciment CPJ 45 (50kg)</span>
                  <span className="text-cyan-400 font-bold text-xs">{quantities.cementBagsCount} sacs</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800/80">
                  <span className="text-slate-400 block text-[9px]">Aciers FeE500</span>
                  <span className="text-white font-bold text-xs">{(quantities.steelReinforcementKg / 1000).toFixed(2)} t</span>
                </div>
              </div>

              {onOpenMoroccanNorms && (
                <button
                  onClick={onOpenMoroccanNorms}
                  className="w-full mt-1 py-1.5 px-2 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 rounded border border-emerald-500/40 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auditer Conformité Normes Maroc (BAEL & RPS) →</span>
                </button>
              )}
            </div>

            {/* Estimation Chiffrage Travaux */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estimation Chiffrage Travaux (HT)</span>
                </span>
                {/* Currency Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 font-mono text-[9px]">
                  <button
                    onClick={() => setCurrency('MAD')}
                    className={`px-1.5 py-0.5 rounded ${
                      currency === 'MAD' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    MAD (DH)
                  </button>
                  <button
                    onClick={() => setCurrency('EUR')}
                    className={`px-1.5 py-0.5 rounded ${
                      currency === 'EUR' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    EUR (€)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setChiffrageTier('economy')}
                  className={`py-1 px-1.5 rounded text-center text-[10px] transition-colors border ${
                    chiffrageTier === 'economy'
                      ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>Éco</div>
                  <div className="font-mono text-[9px] text-slate-500">
                    {currency === 'MAD' ? '2 400 DH/m²' : '1 350 €/m²'}
                  </div>
                </button>
                <button
                  onClick={() => setChiffrageTier('standard')}
                  className={`py-1 px-1.5 rounded text-center text-[10px] transition-colors border ${
                    chiffrageTier === 'standard'
                      ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>Standard</div>
                  <div className="font-mono text-[9px] text-slate-500">
                    {currency === 'MAD' ? '3 200 DH/m²' : '1 650 €/m²'}
                  </div>
                </button>
                <button
                  onClick={() => setChiffrageTier('prestige')}
                  className={`py-1 px-1.5 rounded text-center text-[10px] transition-colors border ${
                    chiffrageTier === 'prestige'
                      ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>Prestige</div>
                  <div className="font-mono text-[9px] text-slate-500">
                    {currency === 'MAD' ? '4 500 DH/m²' : '2 200 €/m²'}
                  </div>
                </button>
              </div>

              <div className="p-2.5 bg-slate-900/90 rounded border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Budget Travaux Estimatif</span>
                  <span className="text-[9px] text-slate-500">Ordre de grandeur au m² habitable — pas un métré détaillé</span>
                </div>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {currency === 'MAD'
                    ? `${quantities.estimatedBudgetMAD[chiffrageTier].toLocaleString('fr-FR')} DH`
                    : `${quantities.estimatedBudgetHT[chiffrageTier].toLocaleString('fr-FR')} €`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. PINNED REAL-TIME SUMMARY PANEL (Always visible in Sidebar for Architect Quick Costing) */}
      <div className="border-t border-slate-800 bg-slate-950 shrink-0">
        {/* Header toggle bar */}
        <div
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          className="px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  Récapitulatif & Chiffrage
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  TEMPS RÉEL
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                {quantities.totalSHON} m² hab. · {quantities.totalOpeningsCount} ouv. · {quantities.totalBuildingVolume} m³
              </span>
            </div>
          </div>

          <button className="text-slate-400 hover:text-white p-1">
            {isSummaryExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Real-time Panel Body */}
        {isSummaryExpanded && (
          <div className="px-3 pb-3 pt-1 space-y-2 text-xs animate-in fade-in duration-150">
            {/* 3 Core Metric Blocks */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* Metric 1: Surfaces */}
              <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Surfaces</span>
                <div className="font-mono text-sm font-bold text-cyan-400 leading-tight">
                  {quantities.totalSHON} <span className="text-[10px] font-normal text-slate-400">m²</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">
                  SHOB: {quantities.totalSHOB} m²
                </div>
              </div>

              {/* Metric 2: Openings */}
              <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Ouvertures</span>
                <div className="font-mono text-sm font-bold text-white leading-tight">
                  {quantities.totalOpeningsCount} <span className="text-[10px] font-normal text-slate-400">unités</span>
                </div>
                <div className="text-[9px] text-cyan-300 font-mono mt-0.5 truncate">
                  {quantities.totalGlazedArea} m² vitré
                </div>
              </div>

              {/* Metric 3: Volume */}
              <div className="p-1.5 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-medium text-slate-400 block">Volume Bâti</span>
                <div className="font-mono text-sm font-bold text-white leading-tight">
                  {quantities.totalBuildingVolume} <span className="text-[10px] font-normal text-slate-400">m³</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                  Béton: {quantities.estimatedConcreteVolume} m³
                </div>
              </div>
            </div>

            {/* Quick Chiffrage Budget Bar with Currency Toggle */}
            <div className="p-2 bg-slate-900/90 rounded-lg border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-300 block font-medium">Chiffrage ({chiffrageTier}) :</span>
                  <div className="flex items-center gap-0.5 text-[8px] font-mono">
                    <button
                      onClick={() => setCurrency('MAD')}
                      className={`px-1 py-0.2 rounded ${currency === 'MAD' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-500'}`}
                    >
                      MAD
                    </button>
                    <button
                      onClick={() => setCurrency('EUR')}
                      className={`px-1 py-0.2 rounded ${currency === 'EUR' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-500'}`}
                    >
                      EUR
                    </button>
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">
                  {currency === 'MAD'
                    ? `${chiffrageTier === 'standard' ? '3 200' : chiffrageTier === 'economy' ? '2 400' : '4 500'} DH/m²`
                    : `${chiffrageTier === 'standard' ? '1 650' : chiffrageTier === 'economy' ? '1 350' : '2 200'} €/m²`}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-cyan-400">
                  {currency === 'MAD'
                    ? `${quantities.estimatedBudgetMAD[chiffrageTier].toLocaleString('fr-FR')} DH`
                    : `${quantities.estimatedBudgetHT[chiffrageTier].toLocaleString('fr-FR')} €`}
                </span>
              </div>
            </div>

            {/* Moroccan Norms Quick Pill */}
            {onOpenMoroccanNorms && (
              <button
                onClick={onOpenMoroccanNorms}
                className="w-full py-1 px-2 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-between text-[10px] text-emerald-300 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Normes Maroc (BAEL / RPS / RTCM)</span>
                </div>
                <span className="font-mono text-[9px] text-emerald-400 font-bold">Vérifier →</span>
              </button>
            )}

            {/* Quick Button to Switch to Full Takeoff Tab */}
            {activeTab !== 'takeoff' && (
              <button
                onClick={() => setActiveTab('takeoff')}
                className="w-full py-0.5 text-center text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline font-medium transition-colors"
              >
                Détail complet du métré & matériaux →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
