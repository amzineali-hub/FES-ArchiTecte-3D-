export type MoroccanCity =
  | 'fes'
  | 'casablanca'
  | 'rabat'
  | 'tanger'
  | 'marrakech'
  | 'agadir'
  | 'oujda'
  | 'tetouan'
  | 'meknes'
  | 'nador'
  | 'al_hoceima'
  | 'ifrane'
  | 'ouarzazate'
  | 'dakhla_laayoune';

export interface MoroccanCityData {
  id: MoroccanCity;
  name: string;
  region: string;
  rtcmClimateZone: 1 | 2 | 3 | 4 | 5 | 6; // RTCM Zones climatiques (Z1 à Z6)
  rtcmClimateLabel: string;
  rps2011SeismicZone: 0 | 1 | 2 | 3 | 4; // RPS 2011 zone (accélération sismique A/g)
  accelerationRatioA: number; // ex: 0.16g pour Fès / Tanger
  seismicVelocityZone: 'Zv1' | 'Zv2' | 'Zv3';
  velocityRatioV: number; // m/s
}

export type ConcreteExposureClass = 'XC1' | 'XC2' | 'XC3' | 'XC4' | 'XS1' | 'XS2' | 'XF1';

export interface MoroccanNormsConfig {
  city: MoroccanCity;
  betonClass: 'B22' | 'B25' | 'B30';
  fc28: number; // in MPa (généralement >= 22 MPa pour BAEL 91 / NM EN 206)
  dosageCiment: number; // in kg/m³ (minimum légal 300 kg/m³, standard 350 kg/m³)
  cimentType: 'CPJ45' | 'CPJ35' | 'CEM_II_AL';
  normeBeton: 'NM EN 206 / BAEL 91';
  exposureClass: ConcreteExposureClass; // Enrobage minimal (2, 3 ou 5 cm)
  enrobageCm: number; // enrobage armatures en cm

  // Parasismique RPS 2011
  siteSoilCategory: 'S1' | 'S2' | 'S3' | 'S4'; // S1 rocheux (1.0), S2 ferme (1.2), S3 meuble (1.4), S4 très meuble (1.8)
  buildingPriorityClass: 'I' | 'II' | 'III'; // I: vital (I=1.30), II: public/grande fréquentation (I=1.20), III: habitations courantes (I=1.00)
  ductilityLevel: 'ND1' | 'ND2' | 'ND3'; // ND1 (faible, K=1.4), ND2 (moyenne, K=2.0), ND3 (haute ductilité, K=3.5)
  jointParasismiqueMm: number; // Joint de séparation (min 50 mm)

  // Thermique RTCM & NM ISO 52000-1 / NM ISO 52003-1
  wallInsulationType:
    | 'double_cloison_laine'
    | 'double_cloison_polystyrene'
    | 'double_cloison_air'
    | 'simple_brique_enduit'
    | 'beton_cellulaire';
  roofInsulationThicknessCm: number; // cm de laine de roche ou polyuréthane
  climatisationLabelA: boolean; // Étiquetage énergétique Ministère de l'Industrie (classe A+ ou Inverter)
  chauffeEauSolaireCertifie: boolean; // Chauffe-eau solaire individuel agréé NM

  // Électricité NM-ELEC (NM 06.1.100) & Plomberie Réseaux
  electricEarthResistance: number; // Ohms (doit être <= 10 Ohms boucle fond de fouille ou <= 100 Ohms)
  hasDifferential30mA: boolean; // Disjoncteur différentiel 30 mA obligatoire
  hasDisjoncteursDivisionnaires: boolean; // Protection divisionnaire normalisée
  plumbingMaterial: 'PPR' | 'multicouche' | 'PER' | 'PVC_NM';
  pvcPenteMinPercent: number; // Pente minimale évacuation PVC (>= 1.5%)

  // Sécurité Incendie (Code Général de Sécurité)
  fireSafetyExitWidthMin: number; // in meters (min 0.90m pour 1 UP, 1.40m pour 2 UP)
  hasExtincteursABC: boolean; // 1 extincteur 6kg / 200m² ou par niveau
  hasAlarmeIncendie: boolean;

  // Procédures Légales & Urbanisme (Loi 12-90)
  legalStatusLaw1290: {
    architectInscribedCNOA: boolean; // Architecte inscrit à l'Ordre National des Architectes
    betEngineerApproved: boolean; // Bureau d'Études / Ingénieur agréé en structure
    bureauControleAgre: boolean; // Bureau de Contrôle Technique (BCT)
    authorizedBuildingPermitRokhas: boolean; // Permis de construire Rokhas.ma
    respectSDAUetPA: boolean; // Respect du SDAU et Plan d'Aménagement (hauteur, retraits, COS)
  };
  currency: 'MAD' | 'EUR';
}

export interface MoroccanComplianceReport {
  cityData: MoroccanCityData;
  scorePercent: number; // 0 to 100%
  overallStatus: 'conforme' | 'a_corriger' | 'non_conforme';
  checks: {
    category:
      | 'BAEL 91 / NM EN 206'
      | 'RPS 2011 Sismique'
      | 'RTCM Thermique'
      | 'NM-ELEC & Réseaux'
      | 'Sécurité Incendie'
      | 'Loi 12-90 Urbanisme';
    title: string;
    requirement: string;
    actualValue: string;
    status: 'pass' | 'warning' | 'fail';
    recommendation?: string;
    referenceCode?: string;
  }[];
  structuralQuantities: {
    cementBagsCount: number; // sacs de ciment 50kg CPJ 45
    sandVolumeM3: number; // m³ sable
    gravelVolumeM3: number; // m³ gravette
    steelReinforcementKg: number; // armatures haute adhérence FeE500
    concreteVolumeM3: number;
    sigmaBcAdmissibleMpa: number; // contrainte limite compression ELS (0.6 * fc28)
    ft28Mpa: number; // résistance traction (0.6 + 0.06 * fc28)
    fbuMpa: number; // résistance calcul ELU
  };
  seismicMetrics: {
    zoneAcc: number;
    seismicCoeffA: number;
    soilFactorS: number;
    priorityFactorI: number;
    behaviorFactorK: number;
    totalWeightEstimateTons: number;
    baseShearForceVKn: number; // Effort tranchant à la base V (kN)
    jointRequisMm: number;
  };
  rtcmThermalMetrics: {
    uWall: number; // W/m²K
    uRoof: number; // W/m²K
    uMaxAllowedWall: number;
    uMaxAllowedRoof: number;
    isRtcmCompliant: boolean;
    energyClassLabel: string;
    solarGlazingFactorFS: number;
  };
  estimatedCostMAD: {
    grosOeuvre: number; // Fondations, poteaux, poutres, dalles béton armé
    secondOeuvre: number; // Maçonnerie double cloison, élec NM, plomberie PPR
    finitions: number; // Revêtements, carrelage, menuiserie aluminium, peinture
    totalHT: number;
    totalTTC: number; // TVA marocaine 20%
    pricePerM2SHON: number; // DH / m²
  };
}
