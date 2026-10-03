import { BuildingProject, FloorData } from '../types/architecture';

/**
 * Generate standard AutoCAD ASCII DXF (Release 12/2000 compatible)
 */
export function exportToDXF(project: BuildingProject, floorIndex: number): string {
  const floor: FloorData = project.floors[floorIndex] || project.floors[0];
  const scale = 1000; // convert meters to millimeters (standard in architectural CAD)
  const W = project.dimensions.length * scale;
  const H = project.dimensions.width * scale;
  const tExt = project.exteriorWallThickness * scale;
  const tInt = project.interiorWallThickness * scale;

  let dxf = '';

  // HEADER
  dxf += '0\nSECTION\n2\nHEADER\n';
  dxf += '9\n$ACADVER\n1\nAC1009\n'; // AutoCAD R12 ASCII DXF
  dxf += '9\n$INSUNITS\n70\n4\n'; // 4 = Millimeters
  dxf += '0\nENDSEC\n';

  // TABLES (Layers)
  dxf += '0\nSECTION\n2\nTABLES\n';
  dxf += '0\nTABLE\n2\nLAYER\n70\n6\n';

  const layers = [
    { name: '0', color: 7 },
    { name: 'MURS_EXTERIEURS', color: 1 }, // Red / thick
    { name: 'CLOISONS_INTERIEURES', color: 2 }, // Yellow
    { name: 'PORTES', color: 4 }, // Cyan
    { name: 'FENETRES', color: 3 }, // Green
    { name: 'COTATIONS', color: 6 }, // Magenta
    { name: 'TEXTES_PIECES', color: 7 }, // White
  ];

  layers.forEach((l) => {
    dxf += `0\nLAYER\n2\n${l.name}\n70\n0\n62\n${l.color}\n6\nCONTINUOUS\n`;
  });
  dxf += '0\nENDTAB\n';
  dxf += '0\nENDSEC\n';

  // ENTITIES
  dxf += '0\nSECTION\n2\nENTITIES\n';

  // Helper for DXF line
  const addLine = (x1: number, y1: number, x2: number, y2: number, layer: string) => {
    return `0\nLINE\n8\n${layer}\n10\n${x1.toFixed(1)}\n20\n${y1.toFixed(1)}\n30\n0.0\n11\n${x2.toFixed(1)}\n21\n${y2.toFixed(1)}\n31\n0.0\n`;
  };

  // Helper for DXF text
  const addText = (text: string, x: number, y: number, height: number, layer: string) => {
    return `0\nTEXT\n8\n${layer}\n10\n${x.toFixed(1)}\n20\n${y.toFixed(1)}\n30\n0.0\n40\n${height.toFixed(1)}\n1\n${text}\n`;
  };

  // Helper for DXF dimension line with ticks
  const addDimension = (x1: number, y1: number, x2: number, y2: number, text: string, layer: string = 'COTATIONS') => {
    let s = addLine(x1, y1, x2, y2, layer);
    // Ticks at ends (45-degree architectural ticks)
    const tickLen = 150; // mm
    s += addLine(x1 - tickLen, y1 - tickLen, x1 + tickLen, y1 + tickLen, layer);
    s += addLine(x2 - tickLen, y2 - tickLen, x2 + tickLen, y2 + tickLen, layer);
    // Dimension text
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 + 180;
    s += addText(text, mx, my, 180, layer);
    return s;
  };

  // 1. Exterior Walls (Outer perimeter & Inner contour)
  // Outer Box
  dxf += addLine(0, 0, W, 0, 'MURS_EXTERIEURS');
  dxf += addLine(W, 0, W, H, 'MURS_EXTERIEURS');
  dxf += addLine(W, H, 0, H, 'MURS_EXTERIEURS');
  dxf += addLine(0, H, 0, 0, 'MURS_EXTERIEURS');

  // Inner Box
  dxf += addLine(tExt, tExt, W - tExt, tExt, 'MURS_EXTERIEURS');
  dxf += addLine(W - tExt, tExt, W - tExt, H - tExt, 'MURS_EXTERIEURS');
  dxf += addLine(W - tExt, H - tExt, tExt, H - tExt, 'MURS_EXTERIEURS');
  dxf += addLine(tExt, H - tExt, tExt, tExt, 'MURS_EXTERIEURS');

  // 2. Rooms (Interior partition walls and labels)
  floor.rooms.forEach((room) => {
    const rx = room.x * scale;
    const ry = room.y * scale;
    const rw = room.width * scale;
    const rl = room.length * scale;

    // Room boundaries
    dxf += addLine(rx, ry, rx + rw, ry, 'CLOISONS_INTERIEURES');
    dxf += addLine(rx + rw, ry, rx + rw, ry + rl, 'CLOISONS_INTERIEURES');
    dxf += addLine(rx + rw, ry + rl, rx, ry + rl, 'CLOISONS_INTERIEURES');
    dxf += addLine(rx, ry + rl, rx, ry, 'CLOISONS_INTERIEURES');

    // Room Label & Area in Center
    const area = (room.width * room.length).toFixed(1);
    dxf += addText(room.name, rx + rw / 2 - 400, ry + rl / 2 + 100, 200, 'TEXTES_PIECES');
    dxf += addText(`${area} m²`, rx + rw / 2 - 250, ry + rl / 2 - 150, 160, 'TEXTES_PIECES');
  });

  // 3. Openings (Doors & Windows)
  floor.openings.forEach((op) => {
    const offset = op.offset * scale;
    const w = op.width * scale;
    const layer = op.type.includes('door') || op.type.includes('bay') ? 'PORTES' : 'FENETRES';

    if (op.wall === 'south') {
      dxf += addLine(offset, 0, offset + w, 0, layer);
      dxf += addLine(offset, tExt, offset + w, tExt, layer);
      dxf += addText(`${op.width.toFixed(2)}x${op.height.toFixed(2)}`, offset + 50, -250, 140, 'COTATIONS');
    } else if (op.wall === 'north') {
      dxf += addLine(offset, H, offset + w, H, layer);
      dxf += addLine(offset, H - tExt, offset + w, H - tExt, layer);
      dxf += addText(`${op.width.toFixed(2)}x${op.height.toFixed(2)}`, offset + 50, H + 100, 140, 'COTATIONS');
    } else if (op.wall === 'west') {
      dxf += addLine(0, offset, 0, offset + w, layer);
      dxf += addLine(tExt, offset, tExt, offset + w, layer);
    } else if (op.wall === 'east') {
      dxf += addLine(W, offset, W, offset + w, layer);
      dxf += addLine(W - tExt, offset, W - tExt, offset + w, layer);
    }
  });

  // 4. Outer Overall Cotations (Dimensions)
  // Bottom dimension (Length)
  dxf += addDimension(0, -600, W, -600, `${project.dimensions.length.toFixed(2)} m`);
  // Left dimension (Width)
  dxf += addDimension(-600, 0, -600, H, `${project.dimensions.width.toFixed(2)} m`);

  // Cartel / Project Title
  dxf += addText(`PROJET : ${project.title.toUpperCase()}`, 0, H + 800, 280, 'TEXTES_PIECES');
  dxf += addText(`NIVEAU : ${floor.name.toUpperCase()} (HSP ${floor.ceilingHeight.toFixed(2)}m)`, 0, H + 500, 200, 'TEXTES_PIECES');
  dxf += addText(`ARCHITECTE : ${project.architect} | DATE : ${project.date}`, 0, H + 250, 160, 'TEXTES_PIECES');

  dxf += '0\nENDSEC\n0\nEOF\n';
  return dxf;
}

/**
 * Generate 3D Wavefront OBJ and MTL CAD format
 */
export function exportToOBJ(project: BuildingProject): { obj: string; mtl: string } {
  let obj = '';
  let mtl = '';

  mtl += '# Material file for ' + project.title + '\n';
  mtl += 'newmtl Mat_Facade\nKd 0.92 0.90 0.88\nKa 0.2 0.2 0.2\nKs 0.1 0.1 0.1\nNs 10\n\n';
  mtl += 'newmtl Mat_Roof\nKd 0.65 0.25 0.15\nKa 0.2 0.2 0.2\nKs 0.1 0.1 0.1\nNs 15\n\n';
  mtl += 'newmtl Mat_Slab\nKd 0.5 0.5 0.5\nKa 0.2 0.2 0.2\nKs 0.1 0.1 0.1\nNs 5\n\n';
  mtl += 'newmtl Mat_Glass\nKd 0.2 0.4 0.6\nKa 0.1 0.1 0.1\nd 0.45\n\n';

  obj += `# Wavefront OBJ generated by FES ArchiTecte 3D\n`;
  obj += `# Project: ${project.title}\n`;
  obj += `# Date: ${new Date().toISOString()}\n`;
  obj += `mtllib ${project.title.toLowerCase().replace(/\s+/g, '_')}.mtl\n\n`;

  let vertexCount = 1;
  const addBox = (
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    material: string
  ) => {
    obj += `o ${name}\n`;
    obj += `usemtl ${material}\n`;

    const x0 = x;
    const x1 = x + w;
    const y0 = y;
    const y1 = y + h;
    const z0 = z;
    const z1 = z + d;

    // 8 vertices
    obj += `v ${x0.toFixed(3)} ${y0.toFixed(3)} ${z0.toFixed(3)}\n`;
    obj += `v ${x1.toFixed(3)} ${y0.toFixed(3)} ${z0.toFixed(3)}\n`;
    obj += `v ${x1.toFixed(3)} ${y1.toFixed(3)} ${z0.toFixed(3)}\n`;
    obj += `v ${x0.toFixed(3)} ${y1.toFixed(3)} ${z0.toFixed(3)}\n`;
    obj += `v ${x0.toFixed(3)} ${y0.toFixed(3)} ${z1.toFixed(3)}\n`;
    obj += `v ${x1.toFixed(3)} ${y0.toFixed(3)} ${z1.toFixed(3)}\n`;
    obj += `v ${x1.toFixed(3)} ${y1.toFixed(3)} ${z1.toFixed(3)}\n`;
    obj += `v ${x0.toFixed(3)} ${y1.toFixed(3)} ${z1.toFixed(3)}\n`;

    const v = vertexCount;
    // 6 faces (quads in OBJ)
    obj += `f ${v} ${v + 1} ${v + 2} ${v + 3}\n`; // Front
    obj += `f ${v + 5} ${v + 4} ${v + 7} ${v + 6}\n`; // Back
    obj += `f ${v + 4} ${v} ${v + 3} ${v + 7}\n`; // Left
    obj += `f ${v + 1} ${v + 5} ${v + 6} ${v + 2}\n`; // Right
    obj += `f ${v + 3} ${v + 2} ${v + 6} ${v + 7}\n`; // Top
    obj += `f ${v + 4} ${v + 5} ${v + 1} ${v}\n`; // Bottom

    vertexCount += 8;
  };

  const { length, width } = project.dimensions;
  const t = project.exteriorWallThickness;

  // Foundation Slab
  addBox('Foundation_Slab', 0, 0, 0, length, project.foundationHeight, width, 'Mat_Slab');

  let currentElevation = project.foundationHeight;

  project.floors.forEach((floor, idx) => {
    const H = floor.ceilingHeight;

    // Exterior walls (4 box perimeters)
    addBox(`Floor_${idx}_Wall_South`, 0, currentElevation, 0, length, H, t, 'Mat_Facade');
    addBox(`Floor_${idx}_Wall_North`, 0, currentElevation, width - t, length, H, t, 'Mat_Facade');
    addBox(`Floor_${idx}_Wall_West`, 0, currentElevation, t, t, H, width - 2 * t, 'Mat_Facade');
    addBox(`Floor_${idx}_Wall_East`, length - t, currentElevation, t, t, H, width - 2 * t, 'Mat_Facade');

    // Inter-floor ceiling / floor slab
    addBox(`Floor_${idx}_Slab`, 0, currentElevation + H, 0, length, 0.25, width, 'Mat_Slab');

    currentElevation += H + 0.25;
  });

  // Roof
  if (project.roof.type === 'flat') {
    // Parapet around roof terrace
    const pHeight = project.roof.parapetHeight;
    addBox('Roof_Parapet_South', 0, currentElevation, 0, length, pHeight, t, 'Mat_Facade');
    addBox('Roof_Parapet_North', 0, currentElevation, width - t, length, pHeight, t, 'Mat_Facade');
    addBox('Roof_Parapet_West', 0, currentElevation, t, t, pHeight, width - 2 * t, 'Mat_Facade');
    addBox('Roof_Parapet_East', length - t, currentElevation, t, t, pHeight, width - 2 * t, 'Mat_Facade');
  } else if (project.roof.type === 'gable') {
    // Gable Roof geometry
    const roofH = (width / 2) * Math.tan((project.roof.pitch * Math.PI) / 180);
    const midZ = width / 2;

    obj += `o Roof_Gable\nusemtl Mat_Roof\n`;
    // Ridge and eaves points
    obj += `v 0 ${currentElevation.toFixed(3)} 0\n`;
    obj += `v ${length.toFixed(3)} ${currentElevation.toFixed(3)} 0\n`;
    obj += `v 0 ${(currentElevation + roofH).toFixed(3)} ${midZ.toFixed(3)}\n`;
    obj += `v ${length.toFixed(3)} ${(currentElevation + roofH).toFixed(3)} ${midZ.toFixed(3)}\n`;
    obj += `v 0 ${currentElevation.toFixed(3)} ${width.toFixed(3)}\n`;
    obj += `v ${length.toFixed(3)} ${currentElevation.toFixed(3)} ${width.toFixed(3)}\n`;

    const rv = vertexCount;
    // Slopes
    obj += `f ${rv} ${rv + 1} ${rv + 3} ${rv + 2}\n`; // South slope
    obj += `f ${rv + 2} ${rv + 3} ${rv + 5} ${rv + 4}\n`; // North slope
    // Gable triangles
    obj += `f ${rv} ${rv + 2} ${rv + 4}\n`; // West gable
    obj += `f ${rv + 1} ${rv + 5} ${rv + 3}\n`; // East gable

    vertexCount += 6;
  }

  return { obj, mtl };
}

/**
 * Generate scalable high-res SVG architectural blueprint
 */
export function exportToSVG(project: BuildingProject, floorIndex: number): string {
  const floor = project.floors[floorIndex] || project.floors[0];
  const { length, width } = project.dimensions;
  const padding = 1.5;
  const svgWidth = (length + padding * 2) * 80;
  const svgHeight = (width + padding * 2) * 80;
  const scale = 80; // pixels per meter

  const toPx = (m: number) => m * scale;
  const ox = toPx(padding);
  const oy = toPx(padding);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">\n`;
  svg += `<defs>
    <pattern id="grid" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse">
      <path d="M ${scale} 0 L 0 0 0 ${scale}" fill="none" stroke="#e2e8f0" stroke-width="0.7"/>
    </pattern>
    <pattern id="wall_hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#64748b" stroke-width="1.5" />
    </pattern>
  </defs>\n`;

  // Background
  svg += `<rect width="100%" height="100%" fill="#ffffff" />\n`;
  svg += `<rect width="100%" height="100%" fill="url(#grid)" />\n`;

  // Exterior wall footprint
  const bW = toPx(length);
  const bH = toPx(width);
  const tExt = toPx(project.exteriorWallThickness);

  svg += `<!-- Exterior Walls -->\n`;
  svg += `<rect x="${ox}" y="${oy}" width="${bW}" height="${bH}" fill="none" stroke="#0f172a" stroke-width="4" />\n`;
  svg += `<rect x="${ox + tExt}" y="${oy + tExt}" width="${bW - 2 * tExt}" height="${bH - 2 * tExt}" fill="none" stroke="#0f172a" stroke-width="2" />\n`;

  // Rooms
  svg += `<!-- Rooms -->\n`;
  floor.rooms.forEach((room) => {
    const rx = ox + toPx(room.x);
    const ry = oy + toPx(room.y);
    const rw = toPx(room.width);
    const rl = toPx(room.length);

    svg += `<g class="room-group">
      <rect x="${rx}" y="${ry}" width="${rw}" height="${rl}" fill="${room.customColor || '#f8fafc'}15" stroke="#334155" stroke-width="2" />
      <text x="${rx + rw / 2}" y="${ry + rl / 2 - 6}" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#0f172a" text-anchor="middle">${room.name}</text>
      <text x="${rx + rw / 2}" y="${ry + rl / 2 + 12}" font-family="system-ui, sans-serif" font-size="11" fill="#475569" text-anchor="middle">${(room.width * room.length).toFixed(1)} m²</text>
    </g>\n`;
  });

  // Openings
  svg += `<!-- Openings -->\n`;
  floor.openings.forEach((op) => {
    const isDoor = op.type.includes('door') || op.type.includes('bay');
    const color = isDoor ? '#0284c7' : '#059669';
    const opOffset = toPx(op.offset);
    const opWidth = toPx(op.width);

    if (op.wall === 'south') {
      svg += `<rect x="${ox + opOffset}" y="${oy + bH - tExt}" width="${opWidth}" height="${tExt}" fill="#ffffff" stroke="${color}" stroke-width="2" />\n`;
      if (isDoor) {
        // Door swing arc
        svg += `<path d="M ${ox + opOffset} ${oy + bH} A ${opWidth} ${opWidth} 0 0 1 ${ox + opOffset + opWidth} ${oy + bH - opWidth}" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="3,3" />\n`;
      }
    } else if (op.wall === 'north') {
      svg += `<rect x="${ox + opOffset}" y="${oy}" width="${opWidth}" height="${tExt}" fill="#ffffff" stroke="${color}" stroke-width="2" />\n`;
    }
  });

  // Dimension lines
  svg += `<!-- Cotations -->\n`;
  const dimY = oy + bH + 35;
  svg += `<line x1="${ox}" y1="${dimY}" x2="${ox + bW}" y2="${dimY}" stroke="#0f172a" stroke-width="1.5" />\n`;
  svg += `<line x1="${ox}" y1="${dimY - 6}" x2="${ox}" y2="${dimY + 6}" stroke="#0f172a" stroke-width="2" />\n`;
  svg += `<line x1="${ox + bW}" y1="${dimY - 6}" x2="${ox + bW}" y2="${dimY + 6}" stroke="#0f172a" stroke-width="2" />\n`;
  svg += `<text x="${ox + bW / 2}" y="${dimY - 8}" font-family="monospace" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">${length.toFixed(2)} m</text>\n`;

  // Title Cartouche
  svg += `<g transform="translate(20, ${svgHeight - 75})">
    <rect width="320" height="60" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
    <text x="12" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">${project.title}</text>
    <text x="12" y="36" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">${floor.name} · Échelle 1:100</text>
    <text x="12" y="50" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Arch. ${project.architect} · ${project.date}</text>
  </g>\n`;

  svg += `</svg>`;
  return svg;
}

export function exportToJSON(project: BuildingProject): string {
  return JSON.stringify(project, null, 2);
}

export function importFromJSON(jsonStr: string): BuildingProject {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.id || !parsed.dimensions || !parsed.floors) {
    throw new Error('Fichier de projet invalide. Structure manquante.');
  }
  return parsed as BuildingProject;
}
