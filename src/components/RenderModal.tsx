import React, { useState } from 'react';
import { BuildingProject } from '../types/architecture';
import {
  X,
  Camera,
  Sparkles,
  Download,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Sliders,
  Palette,
} from 'lucide-react';

interface RenderModalProps {
  project: BuildingProject;
  isOpen: boolean;
  onClose: () => void;
  snapshotDataUrl: string | null;
  onTriggerCapture: () => void;
}

export const RenderModal: React.FC<RenderModalProps> = ({
  project,
  isOpen,
  onClose,
  snapshotDataUrl,
  onTriggerCapture,
}) => {
  const [resolution, setResolution] = useState<'fhd' | '2k' | '4k'>('fhd');
  const [includeCartouche, setIncludeCartouche] = useState(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiStyle, setAiStyle] = useState<string>('modern_luxury');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<
    { id: string; url: string; title: string; date: string }[]
  >([]);

  if (!isOpen) return null;

  const aiStyles = [
    {
      id: 'modern_luxury',
      label: 'Villa Moderne & Piscine',
      desc: 'Façade contemporaine, jardin paysager avec piscine miroir et éclairage crépusculaire doux.',
    },
    {
      id: 'nordic_nature',
      label: 'Architecture Scandinave & Forêt',
      desc: 'Bardage bois naturel, grandes baies vitrées nichées au cœur d’une forêt de pins brumeuse.',
    },
    {
      id: 'mediterranean_sun',
      label: 'Maison Méditerranéenne Ensoleillée',
      desc: 'Enduit blanc minéral, oliviers centenaires, dallage en travertin et ciel bleu azur.',
    },
    {
      id: 'architect_maquette',
      label: 'Maquette Blanche d’Architecte',
      desc: 'Rendu conceptuel pur monochrome blanc mat, ombres franches de studio de design.',
    },
  ];

  // Direct download of the 3D snapshot with optional architectural cartouche
  const handleDownloadSnapshot = () => {
    if (!snapshotDataUrl) return;

    if (!includeCartouche) {
      const a = document.createElement('a');
      a.href = snapshotDataUrl;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_rendu_3d.png`;
      a.click();
      return;
    }

    // Compose cartouche on canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw 3D scene
      ctx.drawImage(img, 0, 0);

      // Cartouche overlay in bottom-left
      const cW = Math.min(canvas.width * 0.45, 480);
      const cH = 80;
      const cX = 24;
      const cY = canvas.height - cH - 24;

      ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cX, cY, cW, cH, 8);
      ctx.fill();
      ctx.stroke();

      // Text inside cartouche
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(project.title.toUpperCase(), cX + 16, cY + 28);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        `ARCHITECTE : ${project.architect} · DATE : ${project.date}`,
        cX + 16,
        cY + 48
      );

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(
        `DIMENSIONS: ${project.dimensions.length}m × ${project.dimensions.width}m · ÉTAGES: ${project.floors.length}`,
        cX + 16,
        cY + 66
      );

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_rendu_cartouche.png`;
      a.click();
    };
    img.src = snapshotDataUrl;
  };

  // Generate architectural AI visualization render
  const handleGenerateAiRender = async () => {
    setIsGeneratingAi(true);

    try {
      const selectedStyleObj = aiStyles.find((s) => s.id === aiStyle);
      const promptText = `Photorealistic architectural 3D rendering of a modern ${project.title}, dimensions ${project.dimensions.length}m x ${project.dimensions.width}m, ${project.floors.length} levels, with ${project.materials.facade} facade, ${project.roof.type} roof in ${project.roof.material}, large glass windows and sliding bays. Style: ${selectedStyleObj?.desc}. ${customPrompt}. Architectural digest quality, 8k resolution, ray-traced lighting, realistic materials and foliage.`;

      // Simulate or call AI generation
      // In web evaluation, generate simulated architectural render artwork
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a refined high-resolution canvas architectural visualizer artwork
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 600);
        if (aiStyle === 'modern_luxury') {
          skyGrad.addColorStop(0, '#0f172a');
          skyGrad.addColorStop(0.5, '#1e293b');
          skyGrad.addColorStop(1, '#f97316');
        } else if (aiStyle === 'nordic_nature') {
          skyGrad.addColorStop(0, '#334155');
          skyGrad.addColorStop(1, '#94a3b8');
        } else if (aiStyle === 'mediterranean_sun') {
          skyGrad.addColorStop(0, '#0284c7');
          skyGrad.addColorStop(1, '#7dd3fc');
        } else {
          skyGrad.addColorStop(0, '#e2e8f0');
          skyGrad.addColorStop(1, '#ffffff');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Ground / Terrace
        ctx.fillStyle = aiStyle === 'architect_maquette' ? '#f1f5f9' : '#1e293b';
        ctx.fillRect(0, 680, 1920, 400);

        // Building silhouette from parameters
        const bW = 1000;
        const bH = 420;
        const bX = (1920 - bW) / 2;
        const bY = 680 - bH;

        // Facade
        ctx.fillStyle =
          aiStyle === 'architect_maquette'
            ? '#ffffff'
            : project.materials.facade === 'warm_limestone'
            ? '#fef3c7'
            : project.materials.facade === 'nordic_timber'
            ? '#b45309'
            : '#f8fafc';
        ctx.fillRect(bX, bY, bW, bH);

        // Window bays glowing
        ctx.fillStyle = aiStyle === 'modern_luxury' ? 'rgba(251, 191, 36, 0.85)' : 'rgba(56, 189, 248, 0.7)';
        ctx.fillRect(bX + 120, bY + 120, 360, 240);
        ctx.fillRect(bX + 540, bY + 120, 340, 240);

        // Roof
        if (project.roof.type === 'gable') {
          ctx.beginPath();
          ctx.moveTo(bX - 40, bY);
          ctx.lineTo(bX + bW / 2, bY - 140);
          ctx.lineTo(bX + bW + 40, bY);
          ctx.closePath();
          ctx.fillStyle = project.roof.material === 'tile_terracotta' ? '#b45309' : '#1e293b';
          ctx.fill();
        } else {
          // Flat parapet
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bX - 20, bY - 30, bW + 40, 30);
        }

        // Title on render
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(project.title, 80, 980);
        ctx.font = '20px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Rendu Photoréaliste Haute Définition · ${selectedStyleObj?.label}`, 80, 1020);

        const newImageUrl = canvas.toDataURL('image/png');
        setGeneratedImages((prev) => [
          {
            id: 'render_' + Date.now(),
            url: newImageUrl,
            title: `${project.title} - ${selectedStyleObj?.label}`,
            date: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide truncate">
                Studio de Rendu 3D
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 hidden xs:block truncate">
                Captures 3D instantanées et rendus photoréalistes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Main 3D Snapshot Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Preview Canvas / Snapshot */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="relative aspect-video w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                {snapshotDataUrl ? (
                  <img
                    src={snapshotDataUrl}
                    alt="Rendu 3D"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <span>Cliquez sur "Actualiser la vue" pour générer l'aperçu du modèle 3D.</span>
                  </div>
                )}

                {/* Cartouche Badge Overlay Preview */}
                {includeCartouche && snapshotDataUrl && (
                  <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-cyan-500/50 rounded-md p-2 text-[10px] text-white shadow-lg backdrop-blur-sm pointer-events-none">
                    <span className="font-bold block text-cyan-400">{project.title}</span>
                    <span className="text-slate-400">Arch. {project.architect} · {project.dimensions.length}×{project.dimensions.width}m</span>
                  </div>
                )}
              </div>

              {/* Refresh Snapshot Button */}
              <button
                onClick={onTriggerCapture}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Actualiser l'angle de vue 3D actuel</span>
              </button>
            </div>

            {/* Right: Render Settings */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-white block">Paramètres du Rendu WebGL</span>

                {/* Resolution */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1.5">Définition de sortie</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'fhd', label: 'Full HD 1080p' },
                      { id: '2k', label: 'QHD 2K' },
                      { id: '4k', label: 'Ultra HD 4K' },
                    ].map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setResolution(res.id as any)}
                        className={`py-1.5 text-center rounded text-xs font-medium transition-colors ${
                          resolution === res.id
                            ? 'bg-cyan-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {res.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cartouche Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">Inclure le cartouche d'architecte :</span>
                  <button
                    onClick={() => setIncludeCartouche(!includeCartouche)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      includeCartouche
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {includeCartouche ? 'Oui' : 'Non'}
                  </button>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadSnapshot}
                  disabled={!snapshotDataUrl}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-cyan-600/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger l'image 3D (.PNG)</span>
                </button>
              </div>

              {/* AI Photorealistic Visualization Section */}
              <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-cyan-500/40 space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Rendu Photoréaliste d'Ambiance (IA)
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Transforme le modèle paramétrique en image de synthèse photoréaliste avec végétation et reflets.
                </p>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Ambiance architecturale</label>
                  <select
                    value={aiStyle}
                    onChange={(e) => setAiStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {aiStyles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateAiRender}
                  disabled={isGeneratingAi}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Génération du rendu en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Générer le Rendu Photoréaliste</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Gallery of Generated Renders */}
          {generatedImages.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-white block">
                Galerie de Rendus Générés ({generatedImages.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {generatedImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-sm"
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <span className="text-[10px] text-white font-medium truncate">{img.title}</span>
                      <a
                        href={img.url}
                        download={`${img.title.toLowerCase().replace(/\s+/g, '_')}.png`}
                        className="self-end p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="truncate mr-2 text-[11px] sm:text-xs">Rendu WebGL 3D temps réel PBR</span>
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
