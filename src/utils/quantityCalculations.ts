import { BuildingProject, QuantityTakeoff } from '../types/architecture';

export function calculateQuantities(project: BuildingProject): QuantityTakeoff {
  const { length, width } = project.dimensions;
  const extWallThick = project.exteriorWallThickness;
  const numFloors = project.floors.length;

  // SHOB (Surface Hors Oeuvre Brute): Total exterior footprint area across all floors
  const floorFootprint = length * width;
  const totalSHOB = Math.round(floorFootprint * numFloors * 100) / 100;

  // Living area by room & SHON
  const livingAreaByRoom: QuantityTakeoff['livingAreaByRoom'] = [];
  let totalSHON = 0;
  let linearInterior = 0;

  project.floors.forEach((floor) => {
    floor.rooms.forEach((room) => {
      const area = Math.round(room.width * room.length * 100) / 100;
      totalSHON += area;
      livingAreaByRoom.push({
        name: room.name,
        type: room.type,
        area,
        floor: floor.name,
      });

      // Rough linear wall estimation from rooms
      linearInterior += (room.width + room.length) * 0.7; // adjust for shared walls
    });
  });

  // Exterior perimeter
  const perimeter = 2 * (length + width);
  const linearMetersExteriorWalls = Math.round(perimeter * numFloors * 100) / 100;
  const linearMetersInteriorWalls = Math.round(linearInterior * 100) / 100;

  // Wall surface calculation
  let totalWallSurface = 0;
  project.floors.forEach((floor) => {
    totalWallSurface += perimeter * floor.ceilingHeight;
  });
  const totalWallSurfaceArea = Math.round(totalWallSurface * 100) / 100;

  // Openings summary & counts
  const openingsMap = new Map<string, { count: number; totalArea: number }>();
  let totalOpeningsCount = 0;
  let openingsDoorsCount = 0;
  let openingsWindowsCount = 0;
  let openingsBaysCount = 0;
  let totalGlazedArea = 0;

  project.floors.forEach((floor) => {
    floor.openings.forEach((op) => {
      totalOpeningsCount++;
      const area = op.width * op.height;

      if (op.type.includes('bay')) {
        openingsBaysCount++;
        totalGlazedArea += area * 0.88; // 88% glass
      } else if (op.type.includes('door')) {
        openingsDoorsCount++;
        if (op.type === 'french_door') totalGlazedArea += area * 0.80;
      } else {
        openingsWindowsCount++;
        totalGlazedArea += area * 0.82; // 82% glass
      }

      const existing = openingsMap.get(op.type) || { count: 0, totalArea: 0 };
      openingsMap.set(op.type, {
        count: existing.count + 1,
        totalArea: Math.round((existing.totalArea + area) * 100) / 100,
      });
    });
  });

  const openingsSummary = Array.from(openingsMap.entries()).map(([type, data]) => ({
    type: type as any,
    count: data.count,
    totalArea: data.totalArea,
  }));

  // Total Building Height and Gross Volume (m³)
  let totalBuildingHeight = project.foundationHeight;
  project.floors.forEach((fl) => {
    totalBuildingHeight += fl.ceilingHeight + 0.25; // ceiling + slab
  });
  if (project.roof.type === 'gable' || project.roof.type === 'hip') {
    const roofPitchRad = (project.roof.pitch * Math.PI) / 180;
    const peakHeight = (width / 2) * Math.tan(roofPitchRad);
    totalBuildingHeight += peakHeight * 0.5; // average roof volume height
  } else if (project.roof.type === 'flat') {
    totalBuildingHeight += project.roof.parapetHeight;
  }
  const totalBuildingVolume = Math.round(floorFootprint * totalBuildingHeight * 10) / 10;

  // Concrete estimate: foundations + slabs + exterior walls
  const slabVolume = floorFootprint * 0.20 * (numFloors + 1); // 20cm slabs
  const foundationVolume = perimeter * extWallThick * project.foundationHeight;
  const wallVolume = totalWallSurfaceArea * extWallThick * 0.8; // deduct openings roughly
  const estimatedConcreteVolume = Math.round((slabVolume + foundationVolume + wallVolume) * 10) / 10;

  // Estimated roof area
  let estimatedRoofArea = floorFootprint;
  if (project.roof.type === 'gable' || project.roof.type === 'hip') {
    const pitchRad = (project.roof.pitch * Math.PI) / 180;
    estimatedRoofArea = Math.round((floorFootprint / Math.cos(pitchRad)) * 1.15 * 100) / 100;
  } else {
    estimatedRoofArea = Math.round(floorFootprint * 1.05 * 100) / 100;
  }

  // Glazing ratio: glazed surface / SHON (minimum 1/6 = 16.7% for RT2012 / RE2020)
  const safeSHON = totalSHON > 0 ? totalSHON : 1;
  const glazingRatioPercent = Math.round((totalGlazedArea / safeSHON) * 1000) / 10;

  // Budget estimation HT in Euros
  const estimatedBudgetHT = {
    economy: Math.round(totalSHON * 1350),
    standard: Math.round(totalSHON * 1650),
    prestige: Math.round(totalSHON * 2200),
  };

  // Moroccan Dirhams (MAD / DH) based on current construction costs in Morocco
  const estimatedBudgetMAD = {
    economy: Math.round(totalSHON * 2400),
    standard: Math.round(totalSHON * 3200),
    prestige: Math.round(totalSHON * 4500),
  };

  // Moroccan structural quantities (approvisionnement chantier)
  const cementBagsCount = Math.ceil((estimatedConcreteVolume * 350) / 50); // dosage 350 kg/m³, sacs 50kg CPJ 45
  const steelReinforcementKg = Math.round(estimatedConcreteVolume * 90); // 90 kg/m³ armatures FeE500
  const sandVolumeM3 = Math.round(estimatedConcreteVolume * 0.45 * 10) / 10;

  return {
    totalSHOB,
    totalSHON: Math.round(totalSHON * 100) / 100,
    footprintArea: Math.round(floorFootprint * 100) / 100,
    totalBuildingVolume,
    totalOpeningsCount,
    openingsDoorsCount,
    openingsWindowsCount,
    openingsBaysCount,
    totalGlazedArea: Math.round(totalGlazedArea * 100) / 100,
    glazingRatioPercent,
    livingAreaByRoom,
    linearMetersExteriorWalls,
    linearMetersInteriorWalls,
    totalWallSurfaceArea,
    openingsSummary,
    estimatedConcreteVolume,
    estimatedRoofArea,
    estimatedBudgetHT,
    estimatedBudgetMAD,
    cementBagsCount,
    steelReinforcementKg,
    sandVolumeM3,
  };
}
