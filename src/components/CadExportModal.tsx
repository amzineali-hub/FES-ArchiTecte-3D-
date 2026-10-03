import React, { useState } from 'react';
import { BuildingProject } from '../types/architecture';
import { exportToDXF, exportToOBJ, exportToSVG, exportToJSON } from '../utils/cadExport';
import { calculateQuantities } from '../utils/quantityCalculations';
import {
  X,
  Download,
  FileCode,
  Box,
  FileText,
  Printer,
  CheckCircle,
  Copy,
} from 'lucide-react';

interface CadExportModalProps {
  project: BuildingProject;
  activeFloorIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CadExportModal: React.FC<CadExportModalProps> = ({
  project,
  activeFloorIndex,
  isOpen,
  onClose,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const quantities = calculateQuantities(project);

  if (!isOpen) return null;

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportDXF = () => {
    const dxf = exportToDXF(project, activeFloorIndex);
    const fname = `${project.title.toLowerCase().replace(/\s+/g, '_')}_niveau_${activeFloorIndex}.dxf`;
    downloadFile(dxf, fname, 'application/dxf');
  };

  const handleExportOBJ = () => {
    const { obj, mtl } = exportToOBJ(project);
    const baseName = project.title.toLowerCase().replace(/\s+/g, '_');
    downloadFile(obj, `${baseName}.obj`, 'model/obj');
    downloadFile(mtl, `${baseName}.mtl`, 'model/mtl');
  };

  const handleExportSVG = () => {
    const svg = exportToSVG(project, activeFloorIndex);
    const fname = `${project.title.toLowerCase().replace(/\s+/g, '_')}_plan_2d.svg`;
    downloadFile(svg, fname, 'image/svg+xml');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(project);
    const fname = `${project.title.toLowerCase().replace(/\s+/g, '_')}_projet_archi.json`;
    downloadFile(json, fname, 'application/json');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide">
              Exportations CAD Standards & Dossier
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 hidden xs:block">
              Formats interopérables normalisés pour logiciels de DAO/BIM et impression.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Formats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. DXF AutoCAD */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">AutoCAD DXF (2D)</h3>
                    <span className="text-[11px] text-slate-400">Calques normalisés & cotations</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Fichier vectoriel ASCII DXF avec calques séparés (MURS, CLOISONS, PORTES, FENETRES, COTATIONS). Compatible AutoCAD, Revit, LibreCAD, DraftSight.
                </p>
              </div>

              <button
                onClick={handleExportDXF}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Télécharger le fichier .DXF</span>
              </button>
            </div>

            {/* 2. Wavefront OBJ 3D */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Maquette 3D Wavefront (OBJ + MTL)</h3>
                    <span className="text-[11px] text-slate-400">Géométrie 3D avec matériaux</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Mesh 3D complet (murs, dalles, menuiseries, toiture) compatible avec SketchUp, Blender, Rhino, 3ds Max et moteurs de rendu temps réel.
                </p>
              </div>

              <button
                onClick={handleExportOBJ}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Télécharger le modèle 3D (.OBJ + .MTL)</span>
              </button>
            </div>

            {/* 3. Scalable Vector SVG */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Plan Vectoriel SVG (Échelle 1:100)</h3>
                    <span className="text-[11px] text-slate-400">Haute définition vectorielle</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Dessin vectoriel net prêt pour traceurs grand format, impressions papier A3/A4 et rapports de présentation avec cartouche d'architecte.
                </p>
              </div>

              <button
                onClick={handleExportSVG}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Télécharger le plan .SVG</span>
              </button>
            </div>

            {/* 4. Complete Project BIM JSON */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Sauvegarde Projet Paramétrique (JSON)</h3>
                    <span className="text-[11px] text-slate-400">Sauvegarde et partage de projet</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Archive complète contenant l'intégralité des dimensions, cotes, pièces et toiture pour rouvrir et modifier le projet à tout moment.
                </p>
              </div>

              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Sauvegarder le projet .JSON</span>
              </button>
            </div>
          </div>

          {/* Dossier de Permis & Métré Summary Panel */}
          <div className="p-3 sm:p-5 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Dossier de Présentation & Rapport Métré</h3>
                <p className="text-xs text-slate-400">Cartouche officiel, métré des surfaces et volumes du projet.</p>
              </div>
              <button
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer Dossier</span>
              </button>
            </div>

            {/* Printable summary card */}
            <div className="p-3 sm:p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
              <div className="flex flex-col xs:flex-row xs:justify-between gap-1 border-b border-slate-800 pb-2">
                <span className="text-slate-400">Projet : <strong className="text-white">{project.title}</strong></span>
                <span className="text-slate-400">Date : <strong className="text-white">{project.date}</strong></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-slate-500 block">Surface SHOB</span>
                  <span className="text-sm font-bold text-cyan-400">{quantities.totalSHOB} m²</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-slate-500 block">Surface Habitable</span>
                  <span className="text-sm font-bold text-emerald-400">{quantities.totalSHON} m²</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-slate-500 block">Linéaire Façades</span>
                  <span className="text-sm font-bold text-white">{quantities.linearMetersExteriorWalls} m</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-slate-500 block">Volume Béton</span>
                  <span className="text-sm font-bold text-white">{quantities.estimatedConcreteVolume} m³</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block">Budget Maroc (MAD)</span>
                  <span className="text-sm font-bold text-amber-400">{quantities.estimatedBudgetMAD.standard.toLocaleString('fr-FR')} DH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 truncate mr-2">
            FES ArchiTecte 3D · Moteur CAD IFC / DXF / OBJ
          </span>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors shrink-0"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
