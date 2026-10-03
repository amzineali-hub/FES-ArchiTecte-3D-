import React, { useState } from 'react';
import { CatalogItem, COMPONENT_CATALOG } from '../utils/componentCatalog';
import {
  DoorOpen,
  Maximize2,
  Home,
  Square,
  Search,
  Plus,
  Layers,
  Sparkles,
  Move,
} from 'lucide-react';

interface ComponentLibraryProps {
  onInsertComponent: (item: CatalogItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onInsertComponent,
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Tous', icon: Sparkles },
    { id: 'doors', label: 'Portes & Baies', icon: DoorOpen },
    { id: 'windows', label: 'Fenêtres', icon: Maximize2 },
    { id: 'stairs', label: 'Escaliers', icon: Layers },
    { id: 'roofs', label: 'Toitures', icon: Home },
    { id: 'rooms', label: 'Pièces Types', icon: Square },
  ];

  const filteredItems = COMPONENT_CATALOG.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, item: CatalogItem) => {
    e.dataTransfer.setData('application/archistudio-component', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 animate-in fade-in"
      />
      <aside className="lg:relative fixed inset-y-0 left-0 z-40 w-80 max-w-[85vw] xl:w-88 h-full flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 text-slate-200 select-none shadow-2xl lg:shadow-none animate-in slide-in-from-left duration-200">
        {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Bibliothèque de Composants
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Glissez-déposez ou cliquez pour insérer un composant paramétrique.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800/80 rounded border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher baie, fenêtre, escalier, toit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter Pills (Functional Buttons) */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            className="group relative p-3 bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl transition-all shadow-sm cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-semibold text-white text-xs group-hover:text-cyan-300 transition-colors">
                {item.name}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap">
                {item.badge}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
              <span className="font-mono text-slate-300 font-medium">
                {item.previewDimensions}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 hidden group-hover:inline flex items-center gap-0.5">
                  <Move className="w-3 h-3" /> Glisser
                </span>
                <button
                  onClick={() => onInsertComponent(item)}
                  className="flex items-center gap-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Insérer</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            Aucun composant architectural trouvé pour cette recherche.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 flex items-center justify-between">
        <span>{filteredItems.length} composants disponibles</span>
        <span className="text-cyan-400 font-medium">Modélisation BIM</span>
      </div>
    </aside>
    </>
  );
};
