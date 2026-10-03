import React, { useState } from 'react';
import { BuildingProject } from '../types/architecture';
import {
  MoroccanCity,
  MoroccanNormsConfig,
} from '../types/moroccanNorms';
import {
  MOROCCAN_CITIES,
  DEFAULT_MOROCCAN_CONFIG,
  auditMoroccanCompliance,
} from '../utils/moroccanNormsEngine';
import {
  ShieldCheck,
  Building2,
  Activity,
  Flame,
  Zap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Coins,
  Download,
  Printer,
  X,
  Thermometer,
  Layers,
  Scale,
  Sparkles,
  Info,
  Wrench,
} from 'lucide-react';

interface MoroccanNormsModalProps {
  project: BuildingProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject?: (updates: Partial<BuildingProject>) => void;
}

export const MoroccanNormsModal: React.FC<MoroccanNormsModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
}) => {
  const [config, setConfig] = useState<MoroccanNormsConfig>(DEFAULT_MOROCCAN_CONFIG);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'audit' | 'parametres' | 'approvisionnement' | 'chiffrage'>('audit');

  if (!isOpen) return null;

  const report = auditMoroccanCompliance(project, config);

  const categories = [
    { id: 'all', label: 'Toutes les Normes (12 points)' },
    { id: 'BAEL 91 / NM EN 206', label: 'BAEL 91 & Béton NM' },
    { id: 'RPS 2011 Sismique', label: 'RPS 2011 Sismique' },
    { id: 'RTCM Thermique', label: 'RTCM & NM ISO 52000' },
    { id: 'NM-ELEC & Réseaux', label: 'NM-ELEC & Plomberie PPR' },
    { id: 'Sécurité Incendie', label: 'Sécurité Incendie' },
    { id: 'Loi 12-90 Urbanisme', label: 'Loi 12-90 & Rokhas' },
  ];

  const filteredChecks = report.checks.filter(
    (c) => activeCategoryFilter === 'all' || c.category === activeCategoryFilter
  );

  const handlePrintReport = () => {
    window.print();
  };

  const handleApplyRecommendedThick = () => {
    if (onUpdateProject) {
      onUpdateProject({ exteriorWallThickness: 0.25 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-800 bg-slate-950/95 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600/30 to-amber-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-bold text-white tracking-wide truncate">
                  Conformité Normes Marocaines
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold">
                  ROKHAS.MA
                </span>
                <span className="hidden md:inline-block text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  BAEL 91 · RPS 2011 · RTCM
                </span>
              </div>
              <p className="hidden xs:block text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                Béton armé (fc28 ≥ 22 MPa, dosage ≥ 300 kg/m³), Parasismique RPS 2011, RTCM Thermique & Loi 12-90.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              title="Imprimer le dossier technique officiel de conformité marocaine"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Imprimer Fiche</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* City and Context Bar */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400 text-xs font-medium">Ville :</span>
              <select
                value={config.city}
                onChange={(e) => setConfig({ ...config, city: e.target.value as MoroccanCity })}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 sm:px-2.5 py-1 text-xs text-white font-semibold focus:border-cyan-500 focus:outline-none"
              >
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.region})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] sm:text-[11px]">
              <span className="px-1.5 sm:px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-amber-300">
                Sismique Z{report.cityData.rps2011SeismicZone} (A={report.cityData.accelerationRatioA}g)
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-cyan-300">
                RTCM Z{report.cityData.rtcmClimateZone}
              </span>
            </div>
          </div>

          {/* Compliance Status Gauge */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <div className="text-left sm:text-right">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase font-medium">Statut Légal</span>
              <span
                className={`text-[11px] sm:text-xs font-bold uppercase ${
                  report.overallStatus === 'conforme'
                    ? 'text-emerald-400'
                    : report.overallStatus === 'a_corriger'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {report.overallStatus === 'conforme'
                  ? 'Conforme Normes NM'
                  : report.overallStatus === 'a_corriger'
                  ? 'Ajustements BET'
                  : 'Non Conforme'}
              </span>
            </div>
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                report.scorePercent >= 85
                  ? 'border-emerald-500 bg-emerald-950/50 text-emerald-400'
                  : report.scorePercent >= 65
                  ? 'border-amber-500 bg-amber-950/50 text-amber-400'
                  : 'border-rose-500 bg-rose-950/50 text-rose-400'
              }`}
            >
              {report.scorePercent}%
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs (Scrollable on Mobile) */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-2 sm:px-6 pt-1 sm:pt-2 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2 px-2.5 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'audit'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Audit (12 Points)</span>
          </button>
          <button
            onClick={() => setActiveTab('parametres')}
            className={`pb-2 px-2.5 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'parametres'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Calculs BET & BAEL</span>
          </button>
          <button
            onClick={() => setActiveTab('approvisionnement')}
            className={`pb-2 px-2.5 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'approvisionnement'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Matériaux & Approvisionnement</span>
          </button>
          <button
            onClick={() => setActiveTab('chiffrage')}
            className={`pb-2 px-2.5 sm:px-4 text-[11px] sm:text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'chiffrage'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Chiffrage Dirhams (DH)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* TAB 1: AUDIT OF CHECKS */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      activeCategoryFilter === cat.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {filteredChecks.map((check, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors hover:border-slate-700"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-semibold">
                          {check.category}
                        </span>
                        {check.referenceCode && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/80">
                            {check.referenceCode}
                          </span>
                        )}
                        <span className="font-semibold text-white text-xs">{check.title}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">
                        <span className="text-slate-500 font-medium">Exigence légale :</span> {check.requirement}
                      </p>

                      <div className="text-[11px] text-slate-300 font-mono">
                        <span className="text-slate-500 font-sans font-medium">Valeur constatée :</span>{' '}
                        {check.actualValue}
                      </div>

                      {check.recommendation && (
                        <div className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 mt-1.5 flex items-start gap-1.5">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong>Recommandation Bureau d'Études :</strong> {check.recommendation}
                            {check.title.includes('Épaisseur') && (
                              <button
                                onClick={handleApplyRecommendedThick}
                                className="block mt-1 underline text-cyan-400 hover:text-cyan-300 font-bold"
                              >
                                Appliquer automatiquement l'épaisseur 25 cm (Double cloison marocaine) →
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center sm:self-start pt-1">
                      {check.status === 'pass' && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>CONFORME</span>
                        </span>
                      )}
                      {check.status === 'warning' && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-500/40 px-3 py-1.5 rounded-lg shadow-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>À AJUSTER</span>
                        </span>
                      )}
                      {check.status === 'fail' && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/70 border border-rose-500/40 px-3 py-1.5 rounded-lg shadow-sm">
                          <XCircle className="w-4 h-4" />
                          <span>NON CONFORME</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL PARAMETERS & BET CALCULATIONS */}
          {activeTab === 'parametres' && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. BAEL 91 & Béton NM EN 206 */}
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>Béton Armé (BAEL 91 & NM EN 206)</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Structure Porteuse
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Résistance fc28 :</span>
                        <span className="text-[10px] text-slate-500">Doit être ≥ 22 MPa selon BAEL 91</span>
                      </div>
                      <select
                        value={config.fc28}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 25;
                          setConfig({
                            ...config,
                            fc28: val,
                            betonClass: val >= 30 ? 'B30' : val >= 25 ? 'B25' : 'B22',
                          });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                      >
                        <option value={20}>20 MPa (B20 - Non conforme structure)</option>
                        <option value={22}>22 MPa (B22 - Minimum légal marocain)</option>
                        <option value={25}>25 MPa (B25 - Standard Recommandé)</option>
                        <option value={30}>30 MPa (B30 - Haute Résistance)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Dosage en ciment :</span>
                        <span className="text-[10px] text-slate-500">Minimum 300 kg/m³, standard 350 kg/m³</span>
                      </div>
                      <select
                        value={config.dosageCiment}
                        onChange={(e) => setConfig({ ...config, dosageCiment: parseInt(e.target.value) || 350 })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                      >
                        <option value={250}>250 kg/m³ (Non conforme BAEL)</option>
                        <option value={300}>300 kg/m³ (Minimum NM EN 206)</option>
                        <option value={350}>350 kg/m³ (Standard Dalles & Poteaux)</option>
                        <option value={400}>400 kg/m³ (Fondations spéciales / Voiles)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Type de Ciment :</span>
                        <span className="text-[10px] text-slate-500">Conforme normes ciments marocains</span>
                      </div>
                      <select
                        value={config.cimentType}
                        onChange={(e) => setConfig({ ...config, cimentType: e.target.value as any })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="CPJ45">CPJ 45 (Recommandé BAEL)</option>
                        <option value="CPJ35">CPJ 35 (Maçonnerie)</option>
                        <option value="CEM_II_AL">CEM II/A-L (Composé)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Enrobage des aciers :</span>
                        <span className="text-[10px] text-slate-500">5cm zone côtière, 3cm standard</span>
                      </div>
                      <select
                        value={config.enrobageCm}
                        onChange={(e) => setConfig({ ...config, enrobageCm: parseFloat(e.target.value) || 3.0 })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                      >
                        <option value={2.0}>2.0 cm (Intérieur sec uniquement)</option>
                        <option value={3.0}>3.0 cm (Extérieur standard)</option>
                        <option value={5.0}>5.0 cm (Côtier / Salin - Agadir/Casablanca/Tanger)</option>
                      </select>
                    </div>

                    {/* Calculated BAEL Results Box */}
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Contrainte admissible ELS (σ_bc) :</span>
                        <span className="text-cyan-400 font-bold">{report.structuralQuantities.sigmaBcAdmissibleMpa} MPa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Résistance traction à 28j (ft28) :</span>
                        <span className="text-white font-bold">{report.structuralQuantities.ft28Mpa} MPa</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Résistance ultime ELU (fbu) :</span>
                        <span className="text-white font-bold">{report.structuralQuantities.fbuMpa} MPa</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Parasismique RPS 2011 */}
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>Règlement Parasismique (RPS 2011)</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                      Zone {report.cityData.rps2011SeismicZone}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Nature du sol (Site) :</span>
                        <span className="text-[10px] text-slate-500">Selon rapport géotechnique LPEE</span>
                      </div>
                      <select
                        value={config.siteSoilCategory}
                        onChange={(e) => setConfig({ ...config, siteSoilCategory: e.target.value as any })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="S1">S1 : Rocher (S = 1.0)</option>
                        <option value="S2">S2 : Sol ferme standard (S = 1.2)</option>
                        <option value="S3">S3 : Sol meuble (S = 1.4)</option>
                        <option value="S4">S4 : Sol très meuble (S = 1.8)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Classe de Priorité Bâtiment :</span>
                        <span className="text-[10px] text-slate-500">Coefficient d'importance I</span>
                      </div>
                      <select
                        value={config.buildingPriorityClass}
                        onChange={(e) => setConfig({ ...config, buildingPriorityClass: e.target.value as any })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="II">Classe II : Habitation courante (I = 1.0 / 1.2)</option>
                        <option value="I">Classe I : Bâtiment vital / Hôpital / Sécurité (I = 1.30)</option>
                        <option value="III">Classe III : Hangars / Agricole (I = 1.00)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Niveau de Ductilité :</span>
                        <span className="text-[10px] text-slate-500">Coefficient de comportement K</span>
                      </div>
                      <select
                        value={config.ductilityLevel}
                        onChange={(e) => setConfig({ ...config, ductilityLevel: e.target.value as any })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="ND1">ND1 : Faible ductilité (K = 1.4)</option>
                        <option value="ND2">ND2 : Moyenne ductilité (K = 2.0)</option>
                        <option value="ND3">ND3 : Haute ductilité (K = 3.5)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Joint Parasismique prévu :</span>
                        <span className="text-[10px] text-slate-500">Requis minimum {report.seismicMetrics.jointRequisMm} mm</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          step="5"
                          min="20"
                          max="150"
                          value={config.jointParasismiqueMm}
                          onChange={(e) => setConfig({ ...config, jointParasismiqueMm: parseInt(e.target.value) || 50 })}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center font-bold"
                        />
                        <span className="text-slate-400">mm</span>
                      </div>
                    </div>

                    {/* Calculated Seismic Output Box */}
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Poids estimé structure (W) :</span>
                        <span className="text-white font-bold">{report.seismicMetrics.totalWeightEstimateTons} tonnes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effort tranchant de base (V) :</span>
                        <span className="text-amber-400 font-bold">
                          {report.seismicMetrics.baseShearForceVKn} kN ({Math.round(report.seismicMetrics.baseShearForceVKn / 9.81)} t)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Thermique RTCM & NM ISO 52000-1 */}
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-emerald-400" />
                      <span>RTCM & Isolation Thermique</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      NM ISO 52000-1
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Type de Paroi Extérieure :</span>
                        <span className="text-[10px] text-slate-500">Rupteur de pont thermique</span>
                      </div>
                      <select
                        value={config.wallInsulationType}
                        onChange={(e) => setConfig({ ...config, wallInsulationType: e.target.value as any })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="double_cloison_laine">Double Cloison + Laine de roche</option>
                        <option value="double_cloison_polystyrene">Double Cloison + Polystyrène PSE</option>
                        <option value="double_cloison_air">Double Cloison + Lame d'air</option>
                        <option value="beton_cellulaire">Béton Cellulaire Monomur</option>
                        <option value="simple_brique_enduit">Simple Brique (Non conforme RTCM)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Épaisseur Isolant Toiture :</span>
                        <span className="text-[10px] text-slate-500">Laine ou panneau polyuréthane</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="20"
                          value={config.roofInsulationThicknessCm}
                          onChange={(e) => setConfig({ ...config, roofInsulationThicknessCm: parseFloat(e.target.value) || 5 })}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center font-bold"
                        />
                        <span className="text-slate-400">cm</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Climatisation Inverter A+ (Label Industrie) :</span>
                      <input
                        type="checkbox"
                        checked={config.climatisationLabelA}
                        onChange={(e) => setConfig({ ...config, climatisationLabelA: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Chauffe-eau Solaire Individuel (CESI) :</span>
                      <input
                        type="checkbox"
                        checked={config.chauffeEauSolaireCertifie}
                        onChange={(e) => setConfig({ ...config, chauffeEauSolaireCertifie: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Électricité NM-ELEC & Plomberie Réseaux */}
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>NM-ELEC & Réseaux Plomberie</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      NM 06.1.100 & PPR
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Résistance prise de terre :</span>
                        <span className="text-[10px] text-slate-500">Boucle fond de fouille ≤ 10 Ω</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="100"
                          value={config.electricEarthResistance}
                          onChange={(e) => setConfig({ ...config, electricEarthResistance: parseFloat(e.target.value) || 10 })}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center font-bold"
                        />
                        <span className="text-slate-400">Ω</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Protection différentielle 30 mA :</span>
                      <input
                        type="checkbox"
                        checked={config.hasDifferential30mA}
                        onChange={(e) => setConfig({ ...config, hasDifferential30mA: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-medium block">Matériau Canalisations Sanitaires :</span>
                        <span className="text-[10px] text-slate-500">Certifié sans calcaire ni corrosion</span>
                      </div>
                      <select
                        value={config.plumbingMaterial}
                        onChange={(e) => setConfig({ ...config, plumbingMaterial: e.target.value as any })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="PPR">PPR Thermosoudable (Recommandé)</option>
                        <option value="multicouche">Multicouche PEX-AL-PEX</option>
                        <option value="PER">PER Réticulé sous gaine</option>
                        <option value="PVC_NM">PVC Pression NM</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Pente minimale collecteurs PVC :</span>
                      <span className="font-mono text-white font-bold">{config.pvcPenteMinPercent}% (≥ 1.5% requis)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Urbanisme & Loi 12-90 */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Procédures Légales, Loi 12-90 & Plateforme Rokhas.ma</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.legalStatusLaw1290.architectInscribedCNOA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          legalStatusLaw1290: {
                            ...config.legalStatusLaw1290,
                            architectInscribedCNOA: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Architecte inscrit CNOA</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.legalStatusLaw1290.betEngineerApproved}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          legalStatusLaw1290: {
                            ...config.legalStatusLaw1290,
                            betEngineerApproved: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Bureau d'Études BET agréé</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.legalStatusLaw1290.bureauControleAgre}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          legalStatusLaw1290: {
                            ...config.legalStatusLaw1290,
                            bureauControleAgre: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Bureau de Contrôle (BCT)</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.legalStatusLaw1290.authorizedBuildingPermitRokhas}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          legalStatusLaw1290: {
                            ...config.legalStatusLaw1290,
                            authorizedBuildingPermitRokhas: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Permis déposé sur Rokhas.ma</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.legalStatusLaw1290.respectSDAUetPA}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          legalStatusLaw1290: {
                            ...config.legalStatusLaw1290,
                            respectSDAUetPA: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Conforme SDAU & Plan d'Aménagement</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATERIALS & SITE PROCUREMENT */}
          {activeTab === 'approvisionnement' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Bordereau Prévisionnel d'Approvisionnement Chantier (Normes NM)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Quantités estimées sur la base d'un dosage à {config.dosageCiment} kg/m³ en ciment {config.cimentType}.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                    Béton Total : {report.structuralQuantities.concreteVolumeM3} m³
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Ciment {config.cimentType}</span>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                      {report.structuralQuantities.cementBagsCount} <span className="text-xs text-slate-400">sacs</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Soit {((report.structuralQuantities.cementBagsCount * 50) / 1000).toFixed(1)} tonnes de ciment
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Aciers Haute Adhérence FeE500</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {(report.structuralQuantities.steelReinforcementKg / 1000).toFixed(2)} <span className="text-xs text-slate-400">tonnes</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Ratio : 90 kg/m³ de béton armé
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Sable concassé 0/4</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {report.structuralQuantities.sandVolumeM3} <span className="text-xs text-slate-400">m³</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Agrégats conformes NM 10.1.008
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">Gravette G1 / G2 (Gravier)</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {report.structuralQuantities.gravelVolumeM3} <span className="text-xs text-slate-400">m³</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Granulats lavés concassés
                    </span>
                  </div>
                </div>

                {/* Additional Spec Table */}
                <div className="mt-4 border-t border-slate-800 pt-3 text-xs">
                  <h4 className="font-semibold text-white mb-2">Spécifications des Matériaux Sanitaires & Électriques au Maroc :</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/80">
                      <strong className="text-cyan-400 block">Canalisations Sanitaires :</strong>
                      Tube PPR Polypropylène Random PN20 pour eau chaude et PN16 pour eau froide, raccords à souder par thermofusion, garantissant l’absence d’entartrage avec l’eau calcaire marocaine.
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/80">
                      <strong className="text-amber-400 block">Tableau Électrique Basse Tension :</strong>
                      Coupure générale tétrapolaire ou bipolaire, interrupteurs différentiels 30 mA type AC et type A, disjoncteurs magnéto-thermiques courbe C conformes NM 06.1.100.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRICING ESTIMATE IN DIRHAMS (MAD) */}
          {activeTab === 'chiffrage' && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Estimation des Coûts de Construction au Maroc (Dirhams MAD)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Barème moyen pondéré pour la région de {report.cityData.name} ({report.cityData.region}).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Prix Moyen au m²</span>
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {report.estimatedCostMAD.pricePerM2SHON.toLocaleString('fr-FR')} DH / m²
                    </span>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-white font-semibold block">1. Lot Gros Œuvre & Structure BAEL 91</span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Terrassement, fondations, béton armé B25, poteaux, poutres, dalles hourdis et double cloison
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white shrink-0">
                      {report.estimatedCostMAD.grosOeuvre.toLocaleString('fr-FR')} DH
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-white font-semibold block">2. Lot Second Œuvre & Réseaux NM-ELEC / PPR</span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Étanchéité toiture terrasse, plomberie sanitaire PPR, électricité conforme NM 06.1.100, plâtre
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white shrink-0">
                      {report.estimatedCostMAD.secondOeuvre.toLocaleString('fr-FR')} DH
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <span className="text-white font-semibold block">3. Lot Finitions & Menuiserie Aluminium</span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Menuiseries double vitrage thermique, carrelage grès cérame, boiserie, peinture satinée
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white shrink-0">
                      {report.estimatedCostMAD.finitions.toLocaleString('fr-FR')} DH
                    </span>
                  </div>

                  {/* Totals */}
                  <div className="p-3 sm:p-4 bg-slate-900 rounded-xl border border-cyan-500/40 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-sans font-semibold text-xs sm:text-sm">Total Travaux HT :</span>
                      <span className="text-base sm:text-lg font-bold text-cyan-400 font-mono">
                        {report.estimatedCostMAD.totalHT.toLocaleString('fr-FR')} DH
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-sans">TVA Marocaine (20%) :</span>
                      <span className="font-mono">
                        {Math.round(report.estimatedCostMAD.totalHT * 0.2).toLocaleString('fr-FR')} DH
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-white text-xs sm:text-sm">
                      <span className="font-sans font-bold">Total TTC Estimatif :</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                        {report.estimatedCostMAD.totalTTC.toLocaleString('fr-FR')} DH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-3 sm:px-6 py-2 border-t border-amber-500/30 bg-amber-950/40 text-[10px] sm:text-xs text-amber-200 shrink-0">
          ⚠ Pré-vérification indicative uniquement. Ces contrôles ne remplacent ni une note de calcul de structure, ni la validation d'un BET ou d'un bureau de contrôle agréé, ni l'instruction du permis de construire.
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400 truncate mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">Pré-vérification indicative — à valider par un BET / bureau de contrôle agréé</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors shrink-0"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
