import { BuildingProject } from '../types/architecture';
import {
  MoroccanCity,
  MoroccanCityData,
  MoroccanNormsConfig,
  MoroccanComplianceReport,
} from '../types/moroccanNorms';

export const MOROCCAN_CITIES: MoroccanCityData[] = [
  {
    id: 'fes',
    name: 'Fès',
    region: 'Fès-Meknès',
    rtcmClimateZone: 3,
    rtcmClimateLabel: 'Zone 3 : Continental semi-aride (Hivers froids, étés caniculaires)',
    rps2011SeismicZone: 3,
    accelerationRatioA: 0.16, // A = 0.16g
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.10, // m/s
  },
  {
    id: 'casablanca',
    name: 'Casablanca',
    region: 'Casablanca-Settat',
    rtcmClimateZone: 2,
    rtcmClimateLabel: 'Zone 2 : Littoral Atlantique tempéré',
    rps2011SeismicZone: 1,
    accelerationRatioA: 0.08,
    seismicVelocityZone: 'Zv1',
    velocityRatioV: 0.07,
  },
  {
    id: 'rabat',
    name: 'Rabat',
    region: 'Rabat-Salé-Kénitra',
    rtcmClimateZone: 2,
    rtcmClimateLabel: 'Zone 2 : Littoral Atlantique tempéré',
    rps2011SeismicZone: 1,
    accelerationRatioA: 0.08,
    seismicVelocityZone: 'Zv1',
    velocityRatioV: 0.07,
  },
  {
    id: 'tanger',
    name: 'Tanger',
    region: 'Tanger-Tétouan-Al Hoceïma',
    rtcmClimateZone: 2,
    rtcmClimateLabel: 'Zone 2 : Façade détroit océanique / méditerranéenne',
    rps2011SeismicZone: 3,
    accelerationRatioA: 0.16,
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.13,
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    region: 'Marrakech-Safi',
    rtcmClimateZone: 5,
    rtcmClimateLabel: 'Zone 5 : Intérieur chaud, sec et aride',
    rps2011SeismicZone: 2,
    accelerationRatioA: 0.08,
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.10,
  },
  {
    id: 'agadir',
    name: 'Agadir',
    region: 'Souss-Massa',
    rtcmClimateZone: 1,
    rtcmClimateLabel: 'Zone 1 : Littoral sud tempéré',
    rps2011SeismicZone: 4,
    accelerationRatioA: 0.20, // Forte sismicité historique
    seismicVelocityZone: 'Zv3',
    velocityRatioV: 0.17,
  },
  {
    id: 'al_hoceima',
    name: 'Al Hoceïma',
    region: 'Tanger-Tétouan-Al Hoceïma',
    rtcmClimateZone: 2,
    rtcmClimateLabel: 'Zone 2 : Littoral Rif méditerranéen',
    rps2011SeismicZone: 4,
    accelerationRatioA: 0.22, // Très forte sismicité (faille du Rif)
    seismicVelocityZone: 'Zv3',
    velocityRatioV: 0.17,
  },
  {
    id: 'meknes',
    name: 'Meknès',
    region: 'Fès-Meknès',
    rtcmClimateZone: 3,
    rtcmClimateLabel: 'Zone 3 : Plaine intérieure Saïss',
    rps2011SeismicZone: 2,
    accelerationRatioA: 0.10,
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.10,
  },
  {
    id: 'ifrane',
    name: 'Ifrane',
    region: 'Fès-Meknès',
    rtcmClimateZone: 4,
    rtcmClimateLabel: 'Zone 4 : Montagne Moyen Atlas (Grand froid, neige)',
    rps2011SeismicZone: 2,
    accelerationRatioA: 0.10,
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.10,
  },
  {
    id: 'oujda',
    name: 'Oujda',
    region: 'L’Oriental',
    rtcmClimateZone: 3,
    rtcmClimateLabel: 'Zone 3 : Plaine orientale semi-aride',
    rps2011SeismicZone: 2,
    accelerationRatioA: 0.10,
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.10,
  },
  {
    id: 'tetouan',
    name: 'Tétouan',
    region: 'Tanger-Tétouan-Al Hoceïma',
    rtcmClimateZone: 2,
    rtcmClimateLabel: 'Zone 2 : Nord méditerranéen',
    rps2011SeismicZone: 3,
    accelerationRatioA: 0.16,
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.13,
  },
  {
    id: 'nador',
    name: 'Nador',
    region: 'L’Oriental',
    rtcmClimateZone: 2,
    rtcmClimateLabel: 'Zone 2 : Façade méditerranéenne orientale',
    rps2011SeismicZone: 3,
    accelerationRatioA: 0.16,
    seismicVelocityZone: 'Zv2',
    velocityRatioV: 0.13,
  },
  {
    id: 'ouarzazate',
    name: 'Ouarzazate',
    region: 'Drâa-Tafilalet',
    rtcmClimateZone: 6,
    rtcmClimateLabel: 'Zone 6 : Présaharien désertique / sud Atlas',
    rps2011SeismicZone: 1,
    accelerationRatioA: 0.05,
    seismicVelocityZone: 'Zv1',
    velocityRatioV: 0.05,
  },
  {
    id: 'dakhla_laayoune',
    name: 'Dakhla & Laâyoune',
    region: 'Provinces du Sud',
    rtcmClimateZone: 1,
    rtcmClimateLabel: 'Zone 1/6 : Saharienne atlantique',
    rps2011SeismicZone: 0,
    accelerationRatioA: 0.01,
    seismicVelocityZone: 'Zv1',
    velocityRatioV: 0.05,
  },
];

export const DEFAULT_MOROCCAN_CONFIG: MoroccanNormsConfig = {
  city: 'fes',
  betonClass: 'B25',
  fc28: 25, // MPa >= 22 MPa
  dosageCiment: 350, // kg/m³ >= 300 kg/m³
  cimentType: 'CPJ45',
  normeBeton: 'NM EN 206 / BAEL 91',
  exposureClass: 'XC2',
  enrobageCm: 3.0,

  // Parasismique RPS 2011
  siteSoilCategory: 'S2', // Sol ferme / meuble standard
  buildingPriorityClass: 'II', // Bâtiment courant d'habitation
  ductilityLevel: 'ND2', // Moyenne ductilité K=2.0
  jointParasismiqueMm: 50, // 50 mm (5 cm)

  // Thermique RTCM & NM ISO 52000-1 / NM ISO 52003-1
  wallInsulationType: 'double_cloison_laine',
  roofInsulationThicknessCm: 6.0,
  climatisationLabelA: true,
  chauffeEauSolaireCertifie: true,

  // Électricité NM-ELEC & Plomberie Réseaux
  electricEarthResistance: 8.5, // Ohms <= 10 Ohms
  hasDifferential30mA: true,
  hasDisjoncteursDivisionnaires: true,
  plumbingMaterial: 'PPR',
  pvcPenteMinPercent: 2.0, // >= 1.5%

  // Sécurité Incendie
  fireSafetyExitWidthMin: 0.90, // min 0.90m pour 1 UP
  hasExtincteursABC: true,
  hasAlarmeIncendie: true,

  // Urbanisme & Procédures Légales Loi 12-90
  legalStatusLaw1290: {
    architectInscribedCNOA: true,
    betEngineerApproved: true,
    bureauControleAgre: true,
    authorizedBuildingPermitRokhas: true,
    respectSDAUetPA: true,
  },
  currency: 'MAD',
};

export function auditMoroccanCompliance(
  project: BuildingProject,
  config: MoroccanNormsConfig = DEFAULT_MOROCCAN_CONFIG
): MoroccanComplianceReport {
  const cityData = MOROCCAN_CITIES.find((c) => c.id === config.city) || MOROCCAN_CITIES[0];
  const { length, width } = project.dimensions;
  const numFloors = project.floors.length;
  const footprint = length * width;

  // Calculs SHON, Ouvertures et Volumes
  let totalSHON = 0;
  let totalGlazedArea = 0;
  let doorWidthMin = 999;

  project.floors.forEach((fl) => {
    fl.rooms.forEach((r) => {
      totalSHON += r.width * r.length;
    });
    fl.openings.forEach((op) => {
      if (op.type.includes('door')) {
        doorWidthMin = Math.min(doorWidthMin, op.width);
      }
      totalGlazedArea += op.width * op.height;
    });
  });

  const totalBuildingHeight =
    project.foundationHeight + numFloors * 2.8 + (project.roof.type === 'flat' ? 0.45 : 1.8);
  const concreteVolumeEstimate =
    footprint * 0.20 * (numFloors + 1) +
    (length + width) * 2 * project.exteriorWallThickness * project.foundationHeight +
    (length + width) * 2 * 0.22 * (numFloors * 2.8) * 0.4; // poteaux & chaînages

  // 1. Calculs BAEL 91
  const sigmaBcAdmissibleMpa = Math.round(0.6 * config.fc28 * 10) / 10; // contrainte limite compression ELS (0.6 * fc28)
  const ft28Mpa = Math.round((0.6 + 0.06 * config.fc28) * 100) / 100; // résistance caractéristique à la traction
  const fbuMpa = Math.round(((0.85 * config.fc28) / 1.5) * 10) / 10; // résistance de calcul à l'ELU

  // 2. Calculs Parasismiques RPS 2011
  const soilFactors = { S1: 1.0, S2: 1.2, S3: 1.4, S4: 1.8 };
  const S = soilFactors[config.siteSoilCategory] || 1.2;

  const priorityFactors = { I: 1.3, II: 1.2, III: 1.0 };
  const I = priorityFactors[config.buildingPriorityClass] || 1.0;

  const behaviorFactors = { ND1: 1.4, ND2: 2.0, ND3: 3.5 };
  const K = behaviorFactors[config.ductilityLevel] || 2.0;

  // Poids total estimé W (G + 0.2Q) ~ 1.15 t/m² SHON
  const totalWeightEstimateTons = Math.round(Math.max(totalSHON, 50) * 1.15);
  const W_kN = totalWeightEstimateTons * 9.81;

  // Facteur d'amplification dynamique D du RPS 2011 (pour T ~ 0.2 à 0.5s -> D ~ 2.5)
  const D = 2.5;
  const v = cityData.velocityRatioV;
  // Effort tranchant à la base selon RPS 2011 : V = (v * S * D * I / K) * W
  const baseShearForceVKn = Math.round(((v * S * D * I) / K) * W_kN);

  // Joint parasismique minimum requis (mm) : 50mm ou H/200
  const jointRequisMm = Math.max(50, Math.round((totalBuildingHeight / 200) * 1000));

  // 3. Calculs Thermiques RTCM & NM ISO 52000-1
  let uWall = 0.55;
  if (config.wallInsulationType === 'double_cloison_laine') uWall = 0.52;
  else if (config.wallInsulationType === 'double_cloison_polystyrene') uWall = 0.56;
  else if (config.wallInsulationType === 'double_cloison_air') uWall = 0.72;
  else if (config.wallInsulationType === 'beton_cellulaire') uWall = 0.45;
  else if (config.wallInsulationType === 'simple_brique_enduit') uWall = 1.35;

  let uRoof = 0.42;
  if (config.roofInsulationThicknessCm >= 8) uRoof = 0.32;
  else if (config.roofInsulationThicknessCm >= 5) uRoof = 0.42;
  else if (config.roofInsulationThicknessCm >= 3) uRoof = 0.55;
  else uRoof = 0.95;

  // Seuils RTCM selon la zone climatique marocaine
  let uMaxAllowedWall = 0.65;
  let uMaxAllowedRoof = 0.45;
  if (cityData.rtcmClimateZone === 3 || cityData.rtcmClimateZone === 4) {
    // Fès, Meknès, Ifrane (froid hivernal soutenu)
    uMaxAllowedWall = 0.60;
    uMaxAllowedRoof = 0.40;
  } else if (cityData.rtcmClimateZone === 5 || cityData.rtcmClimateZone === 6) {
    // Marrakech, Ouarzazate (forte charge solaire estivale)
    uMaxAllowedWall = 0.65;
    uMaxAllowedRoof = 0.45;
  }

  const isRtcmCompliant = uWall <= uMaxAllowedWall && uRoof <= uMaxAllowedRoof;
  const energyClassLabel = isRtcmCompliant ? (uRoof <= 0.35 ? 'Classe A (Très performant)' : 'Classe B (Conforme RTCM)') : 'Classe D (Non conforme)';

  // 4. Liste détaillée des 12 points de contrôle réglementaires marocains
  const checks: MoroccanComplianceReport['checks'] = [];

  // --- CHECK 1: BAEL 91 / NM EN 206 - fc28 >= 22 MPa ---
  const fc28Pass = config.fc28 >= 22;
  checks.push({
    category: 'BAEL 91 / NM EN 206',
    title: 'Résistance caractéristique du béton à 28 jours (fc28)',
    requirement: 'fc28 ≥ 22 MPa pour béton armé de structure selon BAEL 91 et NM EN 206',
    actualValue: `${config.fc28} MPa (Classe ${config.betonClass}) · σ_bc adm = ${sigmaBcAdmissibleMpa} MPa · ft28 = ${ft28Mpa} MPa`,
    status: fc28Pass ? 'pass' : 'fail',
    recommendation: fc28Pass
      ? undefined
      : 'La loi marocaine et le BAEL 91 interdisent les bétons de structure sous 22 MPa. Adopter du B22 ou B25 au minimum.',
    referenceCode: 'BAEL 91 modif 99 Art A.2.1 & NM EN 206',
  });

  // --- CHECK 2: BAEL 91 / NM EN 206 - Dosage en ciment >= 300 kg/m³ ---
  const dosagePass = config.dosageCiment >= 300;
  checks.push({
    category: 'BAEL 91 / NM EN 206',
    title: 'Dosage minimal en ciment CPJ 45 / CEM II',
    requirement: 'Dosage ≥ 300 kg/m³ obligatoire (350 kg/m³ requis pour dalles et poteaux porteurs)',
    actualValue: `${config.dosageCiment} kg/m³ de ${config.cimentType}`,
    status: dosagePass ? 'pass' : 'fail',
    recommendation: dosagePass
      ? undefined
      : 'Augmenter le dosage en ciment à 300 kg/m³ au minimum (350 kg/m³ conseillé) pour assurer la durabilité et la résistance mécanique.',
    referenceCode: 'NM EN 206 Tableau F.1',
  });

  // --- CHECK 3: BAEL 91 - Enrobage minimal des armatures ---
  const isCoastCity = ['casablanca', 'rabat', 'tanger', 'agadir', 'al_hoceima', 'tetouan', 'nador'].includes(config.city);
  const minEnrobageRequired = isCoastCity ? 5.0 : 3.0;
  const enrobagePass = config.enrobageCm >= minEnrobageRequired;
  checks.push({
    category: 'BAEL 91 / NM EN 206',
    title: 'Enrobage réglementaire des armatures FeE500',
    requirement: isCoastCity
      ? 'Enrobage c ≥ 5.0 cm en milieu marin / côtier agressif (brouillard salin)'
      : 'Enrobage c ≥ 3.0 cm pour parois exposées aux intempéries (2.0 cm en intérieur)',
    actualValue: `c = ${config.enrobageCm.toFixed(1)} cm (Site : ${cityData.name} - Classe ${config.exposureClass})`,
    status: enrobagePass ? 'pass' : 'warning',
    recommendation: enrobagePass
      ? undefined
      : `Prévoir des cales d'enrobage plastique de ${minEnrobageRequired} cm pour protéger les aciers contre la corrosion saline.`,
    referenceCode: 'BAEL 91 Art A.7.1 & NM EN 206',
  });

  // --- CHECK 4: RPS 2011 - Régularité géométrique en plan ---
  const aspectPlanRatio = Math.max(length / width, width / length);
  const rpsAspectPass = aspectPlanRatio <= 3.5;
  checks.push({
    category: 'RPS 2011 Sismique',
    title: 'Régularité géométrique en plan & Risque de torsion',
    requirement: 'Rapport longueur/largeur L/l ≤ 3.5 pour limiter les effets de torsion d’ensemble',
    actualValue: `L/l = ${aspectPlanRatio.toFixed(2)} (Dimensions : ${length}m × ${width}m)`,
    status: rpsAspectPass ? 'pass' : 'warning',
    recommendation: rpsAspectPass
      ? undefined
      : 'Créer un joint parasismique de désolidarisation pour scinder le corps de bâtiment en blocs réguliers L/l ≤ 3.5.',
    referenceCode: 'RPS 2011 Chapitre 4 (Règles de conception)',
  });

  // --- CHECK 5: RPS 2011 - Joint Parasismique et Dimensionnement Sismique ---
  const isHighSeismic = cityData.rps2011SeismicZone >= 3;
  const jointPass = config.jointParasismiqueMm >= jointRequisMm;
  checks.push({
    category: 'RPS 2011 Sismique',
    title: 'Dimensionnement Parasismique & Joint de Séparation',
    requirement: `Zone ${cityData.rps2011SeismicZone} (${cityData.name} - A = ${cityData.accelerationRatioA}g) : Ductilité ${isHighSeismic ? 'ND2 ou ND3' : 'ND1/ND2'} · Joint ≥ ${jointRequisMm} mm`,
    actualValue: `Effort tranchant à la base V = ${baseShearForceVKn} kN (${(baseShearForceVKn / 9.81).toFixed(1)} tonnes) · Joint : ${config.jointParasismiqueMm} mm`,
    status: jointPass ? 'pass' : 'warning',
    recommendation: jointPass
      ? undefined
      : `Porter la largeur du joint parasismique à ${jointRequisMm} mm minimum pour éviter l'entrechoquement en cas de séisme.`,
    referenceCode: 'RPS 2011 Art 5.3 & Décret 2-12-666',
  });

  // --- CHECK 6: RTCM - Épaisseur des parois extérieures (Double Cloison) ---
  const wallThickCm = project.exteriorWallThickness * 100;
  const wallThickPass = wallThickCm >= 25; // standard marocain double cloison
  checks.push({
    category: 'RTCM Thermique',
    title: 'Épaisseur et composition des parois extérieures',
    requirement: 'Épaisseur ≥ 25 cm (Double cloison marocaine : brique 6 trous + isolant + brique 8 trous + enduits)',
    actualValue: `Épaisseur saisie : ${wallThickCm.toFixed(0)} cm (${config.wallInsulationType.replace(/_/g, ' ')})`,
    status: wallThickPass ? 'pass' : 'warning',
    recommendation: wallThickPass
      ? undefined
      : 'Augmenter l’épaisseur des murs extérieurs à 25 cm ou 30 cm avec isolant intermédiaire pour respecter la RTCM.',
    referenceCode: 'RTCM Loi 47-09 & NM ISO 52000-1',
  });

  // --- CHECK 7: RTCM - Coefficients thermiques U_max & NM ISO 52000-1 / 52003-1 ---
  checks.push({
    category: 'RTCM Thermique',
    title: `Conformité RTCM Zone Climatique ${cityData.rtcmClimateZone} (${cityData.name})`,
    requirement: `Seuils maximaux : U_paroi ≤ ${uMaxAllowedWall} W/m²K · U_toiture ≤ ${uMaxAllowedRoof} W/m²K (NM ISO 52000-1 / NM ISO 52003-1)`,
    actualValue: `U_paroi: ${uWall.toFixed(2)} W/m²K · U_toiture: ${uRoof.toFixed(2)} W/m²K (${energyClassLabel})`,
    status: isRtcmCompliant ? 'pass' : 'warning',
    recommendation: isRtcmCompliant
      ? undefined
      : `Renforcer l’isolation de toiture (≥ 6cm laine/polyuréthane) pour respecter le seuil U_toit de ${uMaxAllowedRoof} W/m²K à ${cityData.name}.`,
    referenceCode: 'RTCM Décret 2-13-874 & NM ISO 52003-1',
  });

  // --- CHECK 8: Étiquetage énergétique Ministère de l'Industrie et du Commerce ---
  const equipPass = config.climatisationLabelA && config.chauffeEauSolaireCertifie;
  checks.push({
    category: 'RTCM Thermique',
    title: 'Étiquetage énergétique & Équipements réglementés (Ministère Industrie)',
    requirement: 'Climatiseurs Inverter classe A+ minimum + Chauffe-eau solaire individuel certifié NM (Arrêté ministériel)',
    actualValue: `Climatisation classe A+ : ${config.climatisationLabelA ? 'OUI' : 'NON'} · CESI certifié : ${config.chauffeEauSolaireCertifie ? 'OUI' : 'NON'}`,
    status: equipPass ? 'pass' : 'warning',
    recommendation: equipPass
      ? undefined
      : 'Sélectionner des équipements conformes aux seuils d’étiquetage énergétique fixés par le Ministère de l’Industrie.',
    referenceCode: 'Arrêtés n° 3756-14 & 2657-19 (Ministère de l’Industrie)',
  });

  // --- CHECK 9: NM-ELEC (NM 06.1.100) - Prise de terre & Différentiels 30mA ---
  const earthPass = config.electricEarthResistance <= 10;
  const elecPass = earthPass && config.hasDifferential30mA && config.hasDisjoncteursDivisionnaires;
  checks.push({
    category: 'NM-ELEC & Réseaux',
    title: 'Mise à la terre & Protection par disjoncteurs (NM 06.1.100)',
    requirement: 'Boucle en fond de fouille avec résistance de terre R ≤ 10 Ω + Protection différentielle haute sensibilité 30 mA',
    actualValue: `R_terre = ${config.electricEarthResistance} Ω · Différentiel 30mA: ${config.hasDifferential30mA ? 'OUI' : 'NON'} · Divisionnaires: ${config.hasDisjoncteursDivisionnaires ? 'OUI' : 'NON'}`,
    status: elecPass ? 'pass' : 'fail',
    recommendation: elecPass
      ? undefined
      : 'Relier une tresse de cuivre nu 25 mm² en fond de fouille pour garantir R ≤ 10 Ω et installer des interrupteurs différentiels 30 mA.',
    referenceCode: 'Norme Marocaine NM 06.1.100 (Installations Basse Tension)',
  });

  // --- CHECK 10: Plomberie et réseaux de canalisations agréés ---
  const plumbingPass = (config.plumbingMaterial === 'PPR' || config.plumbingMaterial === 'multicouche') && config.pvcPenteMinPercent >= 1.5;
  checks.push({
    category: 'NM-ELEC & Réseaux',
    title: 'Canalisations sanitaires & Évacuations (Normes PPR, Multicouche, PVC)',
    requirement: 'Réseaux EF/ECS en PPR PN20/25 ou multicouche serti (sans corrosion) · PVC assainissement NM avec pente ≥ 1.5%',
    actualValue: `Matériau sanitaire : ${config.plumbingMaterial} · Pente évacuation PVC : ${config.pvcPenteMinPercent}%`,
    status: plumbingPass ? 'pass' : 'warning',
    recommendation: plumbingPass
      ? undefined
      : 'Privilégier le tube PPR thermosoudable pour l’alimentation sanitaire et respecter 2% de pente pour les collecteurs PVC.',
    referenceCode: 'Normes NM 05.6.xxx & DTU 60.11 Maroc',
  });

  // --- CHECK 11: Sécurité Incendie - Dégagements et issues de secours ---
  const exitPass = (doorWidthMin >= 0.90 || doorWidthMin === 999) && config.hasExtincteursABC;
  checks.push({
    category: 'Sécurité Incendie',
    title: 'Issues de secours & Extincteurs (Code Général de Sécurité)',
    requirement: 'Largeur minimale des issues de secours ≥ 0.90 m (1 UP) + Extincteur 6 kg poudre polyvalente ABC par niveau',
    actualValue: `Issue principale : ${doorWidthMin === 999 ? '1.00' : doorWidthMin.toFixed(2)} m · Extincteurs ABC: ${config.hasExtincteursABC ? 'OUI' : 'NON'} · Alarme: ${config.hasAlarmeIncendie ? 'OUI' : 'NON'}`,
    status: exitPass ? 'pass' : 'fail',
    recommendation: exitPass
      ? undefined
      : 'Élargir la porte d’entrée à 0.90 m minimum (1 unité de passage) et prévoir des extincteurs portatifs certifiés par la Protection Civile.',
    referenceCode: 'Code Général de Sécurité contre les Risques d’Incendie au Maroc',
  });

  // --- CHECK 12: Urbanisme & Procédures légales (Loi 12-90 & Rokhas.ma) ---
  const legalPass =
    config.legalStatusLaw1290.architectInscribedCNOA &&
    config.legalStatusLaw1290.betEngineerApproved &&
    config.legalStatusLaw1290.bureauControleAgre &&
    config.legalStatusLaw1290.authorizedBuildingPermitRokhas &&
    config.legalStatusLaw1290.respectSDAUetPA;

  checks.push({
    category: 'Loi 12-90 Urbanisme',
    title: 'Permis de construire, Respect SDAU/PA & Recours CNOA / BET (Loi 12-90)',
    requirement: 'Permis Rokhas.ma obligatoire + Architecte CNOA + Bureau d’Études BET structure + Bureau de Contrôle + Respect SDAU / Plan d’Aménagement',
    actualValue: legalPass
      ? 'Dossier complet visé Architecte CNOA & BET sur Rokhas.ma'
      : 'Pièces administratives ou visas techniques en attente',
    status: legalPass ? 'pass' : 'warning',
    recommendation: legalPass
      ? undefined
      : 'Conformément à la Loi 12-90, la signature d’un architecte agréé CNOA et d’un bureau d’études BET agréé est obligatoire pour le dépôt du permis sur Rokhas.ma.',
    referenceCode: 'Loi 12-90 relative à l’Urbanisme & Décret 2-18-577',
  });

  // Score global de conformité (0 à 100%)
  const passedCount = checks.filter((c) => c.status === 'pass').length;
  const scorePercent = Math.round((passedCount / checks.length) * 100);

  // Approvisionnement matériaux de chantier au Maroc
  const cementKg = concreteVolumeEstimate * config.dosageCiment;
  const cementBagsCount = Math.ceil(cementKg / 50); // Sacs de 50 kg de CPJ 45
  const sandVolumeM3 = Math.round(concreteVolumeEstimate * 0.45 * 10) / 10;
  const gravelVolumeM3 = Math.round(concreteVolumeEstimate * 0.82 * 10) / 10;
  const steelReinforcementKg = Math.round(concreteVolumeEstimate * 90); // 90 kg aciers haute adhérence FeE500 par m³ de béton

  // Chiffrage Prévisionnel en Dirhams Marocains (MAD / DH)
  // Ratios moyens du bâtiment au Maroc (2024-2026):
  // Gros œuvre (terrassement, fondations, béton armé, maçonnerie) : ~1 450 DH / m²
  // Second œuvre (étanchéité, plomberie PPR, électricité NM-ELEC, plâtre) : ~1 150 DH / m²
  // Finitions (carrelage grès cérame / zellige, menuiserie aluminium, peinture) : ~1 100 DH / m²
  const safeArea = Math.max(totalSHON, 50);
  const grosOeuvre = Math.round(safeArea * 1450);
  const secondOeuvre = Math.round(safeArea * 1150);
  const finitions = Math.round(safeArea * 1100);
  const totalHT = grosOeuvre + secondOeuvre + finitions;
  const totalTTC = Math.round(totalHT * 1.2); // TVA marocaine 20%
  const pricePerM2SHON = Math.round(totalHT / safeArea);

  return {
    cityData,
    scorePercent,
    overallStatus: scorePercent >= 85 ? 'conforme' : scorePercent >= 65 ? 'a_corriger' : 'non_conforme',
    checks,
    structuralQuantities: {
      cementBagsCount,
      sandVolumeM3,
      gravelVolumeM3,
      steelReinforcementKg,
      concreteVolumeM3: Math.round(concreteVolumeEstimate * 10) / 10,
      sigmaBcAdmissibleMpa,
      ft28Mpa,
      fbuMpa,
    },
    seismicMetrics: {
      zoneAcc: cityData.rps2011SeismicZone,
      seismicCoeffA: cityData.accelerationRatioA,
      soilFactorS: S,
      priorityFactorI: I,
      behaviorFactorK: K,
      totalWeightEstimateTons,
      baseShearForceVKn,
      jointRequisMm,
    },
    rtcmThermalMetrics: {
      uWall,
      uRoof,
      uMaxAllowedWall,
      uMaxAllowedRoof,
      isRtcmCompliant,
      energyClassLabel,
      solarGlazingFactorFS: 0.42,
    },
    estimatedCostMAD: {
      grosOeuvre,
      secondOeuvre,
      finitions,
      totalHT,
      totalTTC,
      pricePerM2SHON,
    },
  };
}
