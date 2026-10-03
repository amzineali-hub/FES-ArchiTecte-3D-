import { OpeningType, RoomType, StairType, RoofType, RoofMaterial, FloorFinish } from '../types/architecture';

export interface CatalogItem {
  id: string;
  category: 'doors' | 'windows' | 'stairs' | 'roofs' | 'rooms';
  name: string;
  description: string;
  badge: string;
  previewDimensions: string;
  payload: {
    type: 'opening' | 'stair' | 'roof' | 'room';
    openingData?: {
      type: OpeningType;
      width: number;
      height: number;
      sillHeight: number;
      swingDirection?: 'left' | 'right' | 'inward' | 'outward';
    };
    stairData?: {
      name: string;
      type: StairType;
      width: number;
      length: number;
      height: number;
      stepsCount: number;
      material: 'wood_oak' | 'metal_black' | 'concrete';
    };
    roofData?: {
      type: RoofType;
      pitch: number;
      overhang: number;
      material: RoofMaterial;
      parapetHeight: number;
    };
    roomData?: {
      name: string;
      type: RoomType;
      width: number;
      length: number;
      floorFinish: FloorFinish;
      customColor?: string;
    };
  };
}

export const COMPONENT_CATALOG: CatalogItem[] = [
  // 1. PORTES & BAIES (Doors)
  {
    id: 'door_entry_std',
    category: 'doors',
    name: 'Porte d’Entrée Standard',
    description: 'Porte d’entrée sécurisée isolante 1 vantail battant.',
    badge: 'Entrée',
    previewDimensions: '0.90 × 2.15 m',
    payload: {
      type: 'opening',
      openingData: {
        type: 'entry_door',
        width: 0.90,
        height: 2.15,
        sillHeight: 0.0,
        swingDirection: 'inward',
      },
    },
  },
  {
    id: 'door_entry_large',
    category: 'doors',
    name: 'Porte d’Entrée Grand Passage (PMR)',
    description: 'Porte d’entrée large conforme normes d’accessibilité PMR.',
    badge: 'PMR',
    previewDimensions: '1.00 × 2.25 m',
    payload: {
      type: 'opening',
      openingData: {
        type: 'entry_door',
        width: 1.00,
        height: 2.25,
        sillHeight: 0.0,
        swingDirection: 'inward',
      },
    },
  },
  {
    id: 'door_sliding_bay_2v',
    category: 'doors',
    name: 'Baie Vitrée Coulissante 2 Vantaux',
    description: 'Grande ouverture aluminium à rupture de pont thermique.',
    badge: 'Coulissant',
    previewDimensions: '2.40 × 2.20 m',
    payload: {
      type: 'opening',
      openingData: {
        type: 'sliding_bay',
        width: 2.40,
        height: 2.20,
        sillHeight: 0.0,
      },
    },
  },
  {
    id: 'door_sliding_bay_panoramic',
    category: 'doors',
    name: 'Baie Panoramique 3 Vantaux',
    description: 'Baie vitrée grand format pour liaison directe terrasse.',
    badge: 'Panoramique',
    previewDimensions: '3.60 × 2.40 m',
    payload: {
      type: 'opening',
      openingData: {
        type: 'sliding_bay',
        width: 3.60,
        height: 2.40,
        sillHeight: 0.0,
      },
    },
  },
  {
    id: 'door_interior_std',
    category: 'doors',
    name: 'Bloc-Porte Intérieur Isoplan',
    description: 'Porte de communication standard avec huisserie bois.',
    badge: 'Intérieur',
    previewDimensions: '0.83 × 2.04 m',
    payload: {
      type: 'opening',
      openingData: {
        type: 'interior_door',
        width: 0.83,
        height: 2.04,
        sillHeight: 0.0,
        swingDirection: 'inward',
      },
    },
  },
  {
    id: 'door_garage_motorized',
    category: 'doors',
    name: 'Porte de Garage Sectionnelle',
    description: 'Porte de garage isolée motorisée avec cassettes thermo-laquées.',
    badge: 'Garage',
    previewDimensions: '2.40 × 2.00 m',
    payload: {
      type: 'opening',
      openingData: {
        type: 'garage_door',
        width: 2.40,
        height: 2.00,
        sillHeight: 0.0,
      },
    },
  },

  // 2. FENÊTRES & VERRIÈRES (Windows)
  {
    id: 'win_std_double',
    category: 'windows',
    name: 'Fenêtre Standard 2 Vantaux',
    description: 'Fenêtre oscillo-battante avec double vitrage thermique.',
    badge: 'Chambre/Séjour',
    previewDimensions: '1.40 × 1.35 m (Allège 0.85m)',
    payload: {
      type: 'opening',
      openingData: {
        type: 'window_double',
        width: 1.40,
        height: 1.35,
        sillHeight: 0.85,
      },
    },
  },
  {
    id: 'win_single_std',
    category: 'windows',
    name: 'Fenêtre 1 Vantail',
    description: 'Fenêtre simple battante pour bureau ou chambre d’appoint.',
    badge: 'Standard',
    previewDimensions: '0.80 × 1.25 m (Allège 0.90m)',
    payload: {
      type: 'opening',
      openingData: {
        type: 'window_standard',
        width: 0.80,
        height: 1.25,
        sillHeight: 0.90,
      },
    },
  },
  {
    id: 'win_panoramic_strip',
    category: 'windows',
    name: 'Fenêtre Bandeau Horizontal Cuisine',
    description: 'Châssis panoramique au-dessus du plan de travail de cuisine.',
    badge: 'Bandeau',
    previewDimensions: '2.20 × 0.65 m (Allège 1.30m)',
    payload: {
      type: 'opening',
      openingData: {
        type: 'window_panoramic',
        width: 2.20,
        height: 0.65,
        sillHeight: 1.30,
      },
    },
  },
  {
    id: 'win_sdb_vent',
    category: 'windows',
    name: 'Châssis Salle d’Eau & WC',
    description: 'Fenêtre haute à verre dépoli intime oscillo-battant.',
    badge: 'Eau / WC',
    previewDimensions: '0.60 × 0.80 m (Allège 1.35m)',
    payload: {
      type: 'opening',
      openingData: {
        type: 'window_standard',
        width: 0.60,
        height: 0.80,
        sillHeight: 1.35,
      },
    },
  },

  // 3. ESCALIERS (Stairs)
  {
    id: 'stair_straight_oak',
    category: 'stairs',
    name: 'Escalier Droit en Chêne',
    description: 'Escalier droit traditionnel à limon crémaillère sans contremarches.',
    badge: 'Droit',
    previewDimensions: '0.90 × 3.20 m (15 marches)',
    payload: {
      type: 'stair',
      stairData: {
        name: 'Escalier Droit Chêne',
        type: 'straight',
        width: 0.90,
        length: 3.20,
        height: 2.80,
        stepsCount: 15,
        material: 'wood_oak',
      },
    },
  },
  {
    id: 'stair_quarter_turn',
    category: 'stairs',
    name: 'Escalier 1/4 Tournant Bas',
    description: 'Escalier moderne avec quart tournant pour gain d’espace.',
    badge: '1/4 Tournant',
    previewDimensions: '0.90 × 2.80 m (16 marches)',
    payload: {
      type: 'stair',
      stairData: {
        name: 'Escalier 1/4 Tournant',
        type: 'quarter_turn',
        width: 0.90,
        length: 2.80,
        height: 2.80,
        stepsCount: 16,
        material: 'wood_oak',
      },
    },
  },
  {
    id: 'stair_metal_spiral',
    category: 'stairs',
    name: 'Escalier Hélicoïdal Métal Noir',
    description: 'Escalier en colimaçon contemporain style atelier loft.',
    badge: 'Colimaçon',
    previewDimensions: 'Ø 1.70 m (14 marches)',
    payload: {
      type: 'stair',
      stairData: {
        name: 'Escalier Colimaçon Loft',
        type: 'spiral',
        width: 1.70,
        length: 1.70,
        height: 2.80,
        stepsCount: 14,
        material: 'metal_black',
      },
    },
  },
  {
    id: 'stair_concrete_design',
    category: 'stairs',
    name: 'Escalier Béton Ciré Suspendu',
    description: 'Escalier contemporain monobloc à marches pleines en béton.',
    badge: 'Béton',
    previewDimensions: '1.00 × 3.40 m (16 marches)',
    payload: {
      type: 'stair',
      stairData: {
        name: 'Escalier Béton Design',
        type: 'straight',
        width: 1.00,
        length: 3.40,
        height: 2.80,
        stepsCount: 16,
        material: 'concrete',
      },
    },
  },

  // 4. TOITS (Roofs)
  {
    id: 'roof_terrace_flat',
    category: 'roofs',
    name: 'Toit Terrasse Contemporain',
    description: 'Toiture plate accessible avec acrotère et protection gravillons.',
    badge: 'Toit Plat',
    previewDimensions: 'Pente 3° · Acrotère 0.40m',
    payload: {
      type: 'roof',
      roofData: {
        type: 'flat',
        pitch: 3,
        overhang: 0.20,
        material: 'gravel_terrace',
        parapetHeight: 0.40,
      },
    },
  },
  {
    id: 'roof_gable_terracotta',
    category: 'roofs',
    name: 'Toiture 2 Pentes Tuiles Provençales',
    description: 'Toiture à double versant avec tuiles canal terre cuite.',
    badge: '2 Pentes',
    previewDimensions: 'Pente 35° · Débord 0.45m',
    payload: {
      type: 'roof',
      roofData: {
        type: 'gable',
        pitch: 35,
        overhang: 0.45,
        material: 'tile_terracotta',
        parapetHeight: 0,
      },
    },
  },
  {
    id: 'roof_gable_slate',
    category: 'roofs',
    name: 'Toiture 2 Pentes Ardoise Naturelle',
    description: 'Couverture en ardoises sombres avec égouts et rives soignées.',
    badge: 'Ardoise',
    previewDimensions: 'Pente 40° · Débord 0.40m',
    payload: {
      type: 'roof',
      roofData: {
        type: 'gable',
        pitch: 40,
        overhang: 0.40,
        material: 'slate_graphite',
      parapetHeight: 0,
      },
    },
  },
  {
    id: 'roof_shed_zinc',
    category: 'roofs',
    name: 'Toiture Monopente Zinc Joint Debout',
    description: 'Ligne architecturale épurée monopente en zinc anthracite.',
    badge: 'Monopente',
    previewDimensions: 'Pente 18° · Débord 0.50m',
    payload: {
      type: 'roof',
      roofData: {
        type: 'shed',
        pitch: 18,
        overhang: 0.50,
        material: 'zinc_dark',
        parapetHeight: 0,
      },
    },
  },

  // 5. PIÈCES ARCHITECTURALES PRÉCONFIGURÉES (Rooms)
  {
    id: 'room_suite_master',
    category: 'rooms',
    name: 'Suite Parentale avec Dressing',
    description: 'Chambre spacieuse prête à agencer avec dressing privatif.',
    badge: '18.0 m²',
    previewDimensions: '4.50 × 4.00 m',
    payload: {
      type: 'room',
      roomData: {
        name: 'Suite Parentale',
        type: 'bedroom',
        width: 4.50,
        length: 4.00,
        floorFinish: 'parquet_oak',
        customColor: '#818cf8',
      },
    },
  },
  {
    id: 'room_living_open',
    category: 'rooms',
    name: 'Séjour Traversant Lumineux',
    description: 'Espace de réception principal pour salon et salle à manger.',
    badge: '36.0 m²',
    previewDimensions: '6.00 × 6.00 m',
    payload: {
      type: 'room',
      roomData: {
        name: 'Séjour Traversant',
        type: 'living',
        width: 6.00,
        length: 6.00,
        floorFinish: 'parquet_oak',
        customColor: '#38bdf8',
      },
    },
  },
  {
    id: 'room_kitchen_island',
    category: 'rooms',
    name: 'Cuisine Américaine avec Îlot',
    description: 'Cuisine fonctionnelle avec espace pour îlot central.',
    badge: '14.0 m²',
    previewDimensions: '4.00 × 3.50 m',
    payload: {
      type: 'room',
      roomData: {
        name: 'Cuisine Équipée',
        type: 'kitchen',
        width: 4.00,
        length: 3.50,
        floorFinish: 'tile_marble',
        customColor: '#f59e0b',
      },
    },
  },
  {
    id: 'room_bathroom_luxury',
    category: 'rooms',
    name: 'Salle de Bain Familiale',
    description: 'Pièce d’eau carrelée pour double vasque, douche et baignoire.',
    badge: '8.8 m²',
    previewDimensions: '3.20 × 2.75 m',
    payload: {
      type: 'room',
      roomData: {
        name: 'Salle de Bain',
        type: 'bathroom',
        width: 3.20,
        length: 2.75,
        floorFinish: 'tile_slate',
        customColor: '#06b6d4',
      },
    },
  },
  {
    id: 'room_office_telework',
    category: 'rooms',
    name: 'Bureau / Espace Télétravail',
    description: 'Pièce dédiée au travail au calme avec vue extérieure.',
    badge: '10.5 m²',
    previewDimensions: '3.50 × 3.00 m',
    payload: {
      type: 'room',
      roomData: {
        name: 'Bureau Télétravail',
        type: 'office',
        width: 3.50,
        length: 3.00,
        floorFinish: 'parquet_oak',
        customColor: '#10b981',
      },
    },
  },
];
