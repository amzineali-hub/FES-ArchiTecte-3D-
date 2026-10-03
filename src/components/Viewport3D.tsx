import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BuildingProject, FloorData } from '../types/architecture';
import {
  Sun,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Box,
} from 'lucide-react';

interface Viewport3DProps {
  project: BuildingProject;
  activeFloorIndex: number;
  cutawayMode: boolean;
  showRoof: boolean;
  showFurniture: boolean;
  onToggleRoof: () => void;
  onToggleCutaway: () => void;
  onToggleFurniture: () => void;
  onCaptureSnapshot?: (dataUrl: string) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  project,
  activeFloorIndex,
  cutawayMode,
  showRoof,
  showFurniture,
  onToggleRoof,
  onToggleCutaway,
  onToggleFurniture,
  onCaptureSnapshot,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Time of day
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'noon' | 'golden' | 'night'>('noon');
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'south' | 'aerial' | 'top'>('iso');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 26, phi: Math.PI / 3.5, theta: Math.PI / 4 });
  const targetRef = useRef(new THREE.Vector3(0, 2, 0));

  // Update camera position from spherical coords
  const updateCamera = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, phi, theta } = sphericalRef.current;
    const x = targetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = targetRef.current.y + radius * Math.cos(phi);
    const z = targetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(targetRef.current);
  }, []);

  // Set camera presets
  const applyPreset = (preset: 'iso' | 'south' | 'aerial' | 'top') => {
    setCameraPreset(preset);
    const center = new THREE.Vector3(project.dimensions.length / 2, 2.5, project.dimensions.width / 2);
    targetRef.current.copy(center);

    const dist = Math.max(project.dimensions.length, project.dimensions.width) * 2.2;

    if (preset === 'iso') {
      sphericalRef.current = { radius: dist, phi: Math.PI / 3.4, theta: Math.PI / 4 };
    } else if (preset === 'south') {
      sphericalRef.current = { radius: dist * 0.9, phi: Math.PI / 2.3, theta: 0 };
    } else if (preset === 'aerial') {
      sphericalRef.current = { radius: dist * 1.3, phi: Math.PI / 4.5, theta: Math.PI / 3 };
    } else if (preset === 'top') {
      sphericalRef.current = { radius: dist * 1.1, phi: 0.05, theta: 0 };
    }
    updateCamera();
  };

  // Rebuild 3D procedural building geometry
  const buildBuilding = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (buildingGroupRef.current) {
      scene.remove(buildingGroupRef.current);
      buildingGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    const group = new THREE.Group();
    buildingGroupRef.current = group;

    const { length, width } = project.dimensions;
    const tExt = project.exteriorWallThickness;
    const tInt = project.interiorWallThickness;
    const fHeight = project.foundationHeight;

    // Center target on building
    targetRef.current.set(length / 2, (project.floors.length * 2.8) / 2, width / 2);

    // Facade Material
    let facadeColor = 0xf8fafc;
    let facadeRoughness = 0.85;

    if (project.materials.facade === 'warm_limestone') {
      facadeColor = 0xfef3c7;
      facadeRoughness = 0.9;
    } else if (project.materials.facade === 'nordic_timber') {
      facadeColor = 0xb45309;
      facadeRoughness = 0.7;
    } else if (project.materials.facade === 'anthracite_brick') {
      facadeColor = 0x334155;
      facadeRoughness = 0.95;
    } else if (project.materials.facade === 'raw_concrete') {
      facadeColor = 0x94a3b8;
      facadeRoughness = 0.8;
    }

    const wallMat = new THREE.MeshStandardMaterial({
      color: facadeColor,
      roughness: facadeRoughness,
      metalness: 0.05,
    });

    const interiorWallMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
    });

    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
      metalness: 0.1,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.5,
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: project.materials.joineryColor === 'white' ? 0xffffff : 0x1e293b,
      roughness: 0.4,
      metalness: 0.8,
    });

    // 1. Foundation Slab (Concrete plinth)
    const foundationGeo = new THREE.BoxGeometry(length + 0.6, fHeight, width + 0.6);
    const foundationMesh = new THREE.Mesh(foundationGeo, slabMat);
    foundationMesh.position.set(length / 2, fHeight / 2, width / 2);
    foundationMesh.castShadow = true;
    foundationMesh.receiveShadow = true;
    group.add(foundationMesh);

    // 2. Floors & Walls
    let currentY = fHeight;

    project.floors.forEach((floor: FloorData, floorIdx: number) => {
      // If cutaway mode: only render up to active floor level!
      if (cutawayMode && floorIdx > activeFloorIndex) {
        return;
      }

      const H = floor.ceilingHeight;

      // Floor Slab
      const floorSlabGeo = new THREE.BoxGeometry(length, 0.2, width);
      const floorSlabMesh = new THREE.Mesh(floorSlabGeo, slabMat);
      floorSlabMesh.position.set(length / 2, currentY + 0.1, width / 2);
      floorSlabMesh.receiveShadow = true;
      group.add(floorSlabMesh);

      // Floor finish in rooms
      floor.rooms.forEach((room) => {
        let floorFinishColor = 0xca8a04; // oak parquet default
        if (room.floorFinish === 'tile_marble') floorFinishColor = 0xf8fafc;
        if (room.floorFinish === 'tile_slate') floorFinishColor = 0x334155;
        if (room.floorFinish === 'polished_concrete') floorFinishColor = 0x94a3b8;
        if (room.floorFinish === 'terrace_deck') floorFinishColor = 0x78350f;

        const roomSlabGeo = new THREE.BoxGeometry(room.width - 0.05, 0.02, room.length - 0.05);
        const roomSlabMat = new THREE.MeshStandardMaterial({
          color: floorFinishColor,
          roughness: 0.4,
          metalness: 0.1,
        });
        const roomMesh = new THREE.Mesh(roomSlabGeo, roomSlabMat);
        roomMesh.position.set(room.x + room.width / 2, currentY + 0.21, room.y + room.length / 2);
        roomMesh.receiveShadow = true;
        group.add(roomMesh);

        // Minimalist Architect Furniture Proxy
        if (showFurniture) {
          const furnY = currentY + 0.22;
          if (room.type === 'living') {
            // Sofa + Coffee Table
            const sofaGeo = new THREE.BoxGeometry(2.2, 0.7, 0.9);
            const sofaMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
            const sofa = new THREE.Mesh(sofaGeo, sofaMat);
            sofa.position.set(room.x + 1.6, furnY + 0.35, room.y + 1.2);
            sofa.castShadow = true;
            group.add(sofa);

            const tableGeo = new THREE.BoxGeometry(1.2, 0.4, 0.7);
            const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
            const table = new THREE.Mesh(tableGeo, tableMat);
            table.position.set(room.x + 1.6, furnY + 0.2, room.y + 2.2);
            table.castShadow = true;
            group.add(table);
          } else if (room.type === 'bedroom') {
            // Double Bed + Pillows
            const bedGeo = new THREE.BoxGeometry(1.6, 0.5, 2.0);
            const bedMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
            const bed = new THREE.Mesh(bedGeo, bedMat);
            bed.position.set(room.x + room.width / 2, furnY + 0.25, room.y + room.length / 2);
            bed.castShadow = true;
            group.add(bed);
          } else if (room.type === 'kitchen') {
            // Kitchen Counter / Island
            const counterGeo = new THREE.BoxGeometry(room.width * 0.7, 0.9, 0.8);
            const counterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
            const counter = new THREE.Mesh(counterGeo, counterMat);
            counter.position.set(room.x + room.width / 2, furnY + 0.45, room.y + 0.9);
            counter.castShadow = true;
            group.add(counter);
          }
        }
      });

      // Interior partition walls between rooms
      floor.rooms.forEach((room) => {
        // Interior wall segments
        const wallH = H;
        const pGeoX = new THREE.BoxGeometry(room.width, wallH, tInt);
        const pMeshX = new THREE.Mesh(pGeoX, interiorWallMat);
        pMeshX.position.set(room.x + room.width / 2, currentY + wallH / 2 + 0.2, room.y + room.length);
        pMeshX.castShadow = true;
        group.add(pMeshX);

        const pGeoY = new THREE.BoxGeometry(tInt, wallH, room.length);
        const pMeshY = new THREE.Mesh(pGeoY, interiorWallMat);
        pMeshY.position.set(room.x + room.width, currentY + wallH / 2 + 0.2, room.y + room.length / 2);
        pMeshY.castShadow = true;
        group.add(pMeshY);
      });

      // 3D Stairs (Escaliers)
      if (floor.stairs && floor.stairs.length > 0) {
        floor.stairs.forEach((stair) => {
          const numSteps = stair.stepsCount || 15;
          const stepW = stair.width;
          const stepDepth = stair.length / numSteps;
          const stepRise = stair.height / numSteps;

          let stairMatColor = 0xb45309; // oak
          if (stair.material === 'metal_black') stairMatColor = 0x1e293b;
          if (stair.material === 'concrete') stairMatColor = 0x94a3b8;

          const stairMat = new THREE.MeshStandardMaterial({
            color: stairMatColor,
            roughness: 0.5,
            metalness: stair.material === 'metal_black' ? 0.7 : 0.1,
          });

          // Individual 3D Steps
          for (let s = 0; s < numSteps; s++) {
            const stepY = currentY + 0.2 + s * stepRise + stepRise / 2;
            const stepZ = stair.y + s * stepDepth + stepDepth / 2;
            const stepGeo = new THREE.BoxGeometry(stepW, stepRise, stepDepth);
            const stepMesh = new THREE.Mesh(stepGeo, stairMat);
            stepMesh.position.set(stair.x + stepW / 2, stepY, stepZ);
            stepMesh.castShadow = true;
            stepMesh.receiveShadow = true;
            group.add(stepMesh);
          }

          // Modern Handrail / Garde-corps
          const railGeo = new THREE.CylinderGeometry(0.02, 0.02, stair.length * 1.05);
          const railMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
          const rail = new THREE.Mesh(railGeo, railMat);
          rail.rotation.x = Math.atan2(stair.height, stair.length);
          rail.position.set(stair.x + stepW - 0.05, currentY + 0.2 + stair.height / 2 + 0.9, stair.y + stair.length / 2);
          rail.castShadow = true;
          group.add(rail);
        });
      }

      // Exterior Walls with Openings
      // South Wall (Z = 0)
      const southOps = floor.openings.filter((o) => o.wall === 'south').sort((a, b) => a.offset - b.offset);
      let curX = 0;
      southOps.forEach((op) => {
        // Wall piece before opening
        const spanW = op.offset - curX;
        if (spanW > 0.05) {
          const wGeo = new THREE.BoxGeometry(spanW, H, tExt);
          const wMesh = new THREE.Mesh(wGeo, wallMat);
          wMesh.position.set(curX + spanW / 2, currentY + H / 2 + 0.2, tExt / 2);
          wMesh.castShadow = true;
          wMesh.receiveShadow = true;
          group.add(wMesh);
        }

        // Opening lintel (above opening)
        const lintelH = H - (op.sillHeight + op.height);
        if (lintelH > 0.05) {
          const lGeo = new THREE.BoxGeometry(op.width, lintelH, tExt);
          const lMesh = new THREE.Mesh(lGeo, wallMat);
          lMesh.position.set(
            op.offset + op.width / 2,
            currentY + H - lintelH / 2 + 0.2,
            tExt / 2
          );
          lMesh.castShadow = true;
          group.add(lMesh);
        }

        // Sill (under opening if window)
        if (op.sillHeight > 0.05) {
          const sGeo = new THREE.BoxGeometry(op.width, op.sillHeight, tExt);
          const sMesh = new THREE.Mesh(sGeo, wallMat);
          sMesh.position.set(
            op.offset + op.width / 2,
            currentY + op.sillHeight / 2 + 0.2,
            tExt / 2
          );
          sMesh.castShadow = true;
          group.add(sMesh);
        }

        // 3D Glass & Frame
        const glassGeo = new THREE.BoxGeometry(op.width - 0.08, op.height - 0.08, 0.04);
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(
          op.offset + op.width / 2,
          currentY + op.sillHeight + op.height / 2 + 0.2,
          tExt / 2
        );
        group.add(glass);

        // Frame
        const frameGeo = new THREE.BoxGeometry(op.width, op.height, 0.06);
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(
          op.offset + op.width / 2,
          currentY + op.sillHeight + op.height / 2 + 0.2,
          tExt / 2
        );
        frame.castShadow = true;
        group.add(frame);

        curX = op.offset + op.width;
      });

      // Remainder of south wall
      if (curX < length) {
        const spanW = length - curX;
        const wGeo = new THREE.BoxGeometry(spanW, H, tExt);
        const wMesh = new THREE.Mesh(wGeo, wallMat);
        wMesh.position.set(curX + spanW / 2, currentY + H / 2 + 0.2, tExt / 2);
        wMesh.castShadow = true;
        wMesh.receiveShadow = true;
        group.add(wMesh);
      }

      // North Wall (Z = width)
      const northWGeo = new THREE.BoxGeometry(length, H, tExt);
      const northWMesh = new THREE.Mesh(northWGeo, wallMat);
      northWMesh.position.set(length / 2, currentY + H / 2 + 0.2, width - tExt / 2);
      northWMesh.castShadow = true;
      northWMesh.receiveShadow = true;
      group.add(northWMesh);

      // West Wall (X = 0)
      const westWGeo = new THREE.BoxGeometry(tExt, H, width - 2 * tExt);
      const westWMesh = new THREE.Mesh(westWGeo, wallMat);
      westWMesh.position.set(tExt / 2, currentY + H / 2 + 0.2, width / 2);
      westWMesh.castShadow = true;
      westWMesh.receiveShadow = true;
      group.add(westWMesh);

      // East Wall (X = length)
      const eastWGeo = new THREE.BoxGeometry(tExt, H, width - 2 * tExt);
      const eastWMesh = new THREE.Mesh(eastWGeo, wallMat);
      eastWMesh.position.set(length - tExt / 2, currentY + H / 2 + 0.2, width / 2);
      eastWMesh.castShadow = true;
      eastWMesh.receiveShadow = true;
      group.add(eastWMesh);

      currentY += H + 0.2;
    });

    // 3. Roof Geometry
    if (showRoof && (!cutawayMode || activeFloorIndex === project.floors.length - 1)) {
      const roofY = currentY;
      const roofConfig = project.roof;

      let roofMatColor = 0xb45309; // terracotta
      if (roofConfig.material === 'slate_graphite') roofMatColor = 0x1e293b;
      if (roofConfig.material === 'zinc_dark') roofMatColor = 0x334155;
      if (roofConfig.material === 'gravel_terrace') roofMatColor = 0x64748b;

      const roofMat = new THREE.MeshStandardMaterial({
        color: roofMatColor,
        roughness: 0.6,
        metalness: 0.2,
      });

      if (roofConfig.type === 'flat') {
        // Flat Roof Terrace with parapet / acrotère
        const pHeight = roofConfig.parapetHeight;
        const parapetMat = wallMat;

        // Terrace Floor
        const roofSlab = new THREE.Mesh(
          new THREE.BoxGeometry(length + 0.4, 0.2, width + 0.4),
          slabMat
        );
        roofSlab.position.set(length / 2, roofY + 0.1, width / 2);
        roofSlab.receiveShadow = true;
        group.add(roofSlab);

        // Parapet border
        const pSouth = new THREE.Mesh(
          new THREE.BoxGeometry(length + 0.4, pHeight, 0.25),
          parapetMat
        );
        pSouth.position.set(length / 2, roofY + pHeight / 2 + 0.2, 0.125);
        pSouth.castShadow = true;
        group.add(pSouth);

        const pNorth = new THREE.Mesh(
          new THREE.BoxGeometry(length + 0.4, pHeight, 0.25),
          parapetMat
        );
        pNorth.position.set(length / 2, roofY + pHeight / 2 + 0.2, width + 0.4 - 0.125);
        pNorth.castShadow = true;
        group.add(pNorth);

        const pWest = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, pHeight, width + 0.4),
          parapetMat
        );
        pWest.position.set(0.125, roofY + pHeight / 2 + 0.2, width / 2);
        pWest.castShadow = true;
        group.add(pWest);

        const pEast = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, pHeight, width + 0.4),
          parapetMat
        );
        pEast.position.set(length + 0.4 - 0.125, roofY + pHeight / 2 + 0.2, width / 2);
        pEast.castShadow = true;
        group.add(pEast);
      } else if (roofConfig.type === 'gable') {
        // Gable Roof (2 slopes)
        const overhang = roofConfig.overhang;
        const roofPitchRad = (roofConfig.pitch * Math.PI) / 180;
        const halfW = width / 2 + overhang;
        const roofPeakH = halfW * Math.tan(roofPitchRad);
        const slopeLen = halfW / Math.cos(roofPitchRad);

        // Slope 1 (South)
        const slope1Geo = new THREE.BoxGeometry(length + overhang * 2, 0.18, slopeLen);
        const slope1 = new THREE.Mesh(slope1Geo, roofMat);
        slope1.position.set(
          length / 2,
          roofY + roofPeakH / 2,
          width / 2 - halfW / 2
        );
        slope1.rotation.x = roofPitchRad;
        slope1.castShadow = true;
        group.add(slope1);

        // Slope 2 (North)
        const slope2Geo = new THREE.BoxGeometry(length + overhang * 2, 0.18, slopeLen);
        const slope2 = new THREE.Mesh(slope2Geo, roofMat);
        slope2.position.set(
          length / 2,
          roofY + roofPeakH / 2,
          width / 2 + halfW / 2
        );
        slope2.rotation.x = -roofPitchRad;
        slope2.castShadow = true;
        group.add(slope2);

        // Gable triangular walls (East and West)
        const gableShape = new THREE.Shape();
        gableShape.moveTo(0, 0);
        gableShape.lineTo(width, 0);
        gableShape.lineTo(width / 2, roofPeakH);
        gableShape.closePath();

        const extrudeSettings = { depth: tExt, bevelEnabled: false };
        const gableGeo = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);

        const westGable = new THREE.Mesh(gableGeo, wallMat);
        westGable.rotation.y = Math.PI / 2;
        westGable.position.set(tExt, roofY, 0);
        westGable.castShadow = true;
        group.add(westGable);

        const eastGable = new THREE.Mesh(gableGeo, wallMat);
        eastGable.rotation.y = Math.PI / 2;
        eastGable.position.set(length, roofY, 0);
        eastGable.castShadow = true;
        group.add(eastGable);
      } else if (roofConfig.type === 'shed') {
        // Monopente (Shed roof)
        const overhang = roofConfig.overhang;
        const roofPitchRad = (roofConfig.pitch * Math.PI) / 180;
        const shedPeakH = (width + overhang) * Math.tan(roofPitchRad);
        const shedLen = (width + overhang * 2) / Math.cos(roofPitchRad);

        const shedGeo = new THREE.BoxGeometry(length + overhang * 2, 0.18, shedLen);
        const shedMesh = new THREE.Mesh(shedGeo, roofMat);
        shedMesh.position.set(length / 2, roofY + shedPeakH / 2, width / 2);
        shedMesh.rotation.x = roofPitchRad;
        shedMesh.castShadow = true;
        group.add(shedMesh);
      }
    }

    scene.add(group);
  }, [project, activeFloorIndex, cutawayMode, showRoof, showFurniture]);

  // Lighting setup according to timeOfDay
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !sceneRef.current) return;

    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    const scene = sceneRef.current;

    if (timeOfDay === 'dawn') {
      sun.position.set(30, 8, 20);
      sun.color.setHex(0xfda4af); // Rose aube
      sun.intensity = 1.2;
      ambient.color.setHex(0x38bdf8);
      ambient.intensity = 0.5;
      scene.background = new THREE.Color(0x0f172a);
    } else if (timeOfDay === 'noon') {
      sun.position.set(18, 35, 22);
      sun.color.setHex(0xffffff); // Midi plein soleil
      sun.intensity = 2.0;
      ambient.color.setHex(0xe2e8f0);
      ambient.intensity = 0.7;
      scene.background = new THREE.Color(0x0b1120);
    } else if (timeOfDay === 'golden') {
      sun.position.set(32, 10, -18);
      sun.color.setHex(0xfbbf24); // Golden hour
      sun.intensity = 2.4;
      ambient.color.setHex(0xf97316);
      ambient.intensity = 0.6;
      scene.background = new THREE.Color(0x18181b);
    } else if (timeOfDay === 'night') {
      sun.position.set(-15, 20, -15);
      sun.color.setHex(0x38bdf8); // Moonlight
      sun.intensity = 0.4;
      ambient.color.setHex(0x1e293b);
      ambient.intensity = 0.3;
      scene.background = new THREE.Color(0x030712);
    }
  }, [timeOfDay]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    cameraRef.current = camera;
    updateCamera();

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true, // for instant 4K snapshots
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(20, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0005;
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    // Ground Plane (Architectural Terrain & Garden)
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x166534, // Green lawn
      roughness: 0.95,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // Architectural Ground Grid
    const gridHelper = new THREE.GridHelper(80, 80, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Initial building generation
    buildBuilding();
    applyPreset('iso');

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update building whenever project or visualization toggles change
  useEffect(() => {
    buildBuilding();
  }, [buildBuilding]);

  // Orbit controls mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    } else if (e.button === 2 || e.button === 1) {
      isPanningRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      sphericalRef.current.theta -= dx * 0.007;
      sphericalRef.current.phi = Math.max(
        0.08,
        Math.min(Math.PI / 2.05, sphericalRef.current.phi - dy * 0.007)
      );
      updateCamera();
    } else if (isPanningRef.current && cameraRef.current) {
      const panSpeed = 0.03;
      const cam = cameraRef.current;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      cam.getWorldDirection(up);
      right.crossVectors(cam.up, up).normalize();

      targetRef.current.addScaledVector(right, dx * panSpeed);
      targetRef.current.y += dy * panSpeed;
      updateCamera();
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  // Touch gesture support for mobile orbit & pinch zoom
  const touchStartPosRef = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      isPanningRef.current = false;
      const t = e.touches[0];
      prevMouseRef.current = { x: t.clientX, y: t.clientY };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      isPanningRef.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartPosRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
        dist,
      };
      prevMouseRef.current = { x: touchStartPosRef.current.x, y: touchStartPosRef.current.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const t = e.touches[0];
      const dx = t.clientX - prevMouseRef.current.x;
      const dy = t.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: t.clientX, y: t.clientY };

      sphericalRef.current.theta -= dx * 0.009;
      sphericalRef.current.phi = Math.max(
        0.08,
        Math.min(Math.PI / 2.05, sphericalRef.current.phi - dy * 0.009)
      );
      updateCamera();
    } else if (e.touches.length === 2 && touchStartPosRef.current.dist) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = touchStartPosRef.current.dist / newDist;
      touchStartPosRef.current.dist = newDist;

      sphericalRef.current.radius = Math.max(
        6,
        Math.min(120, sphericalRef.current.radius * factor)
      );
      updateCamera();
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    sphericalRef.current.radius = Math.max(
      6,
      Math.min(120, sphericalRef.current.radius * zoomFactor)
    );
    updateCamera();
  };

  // High-Resolution 4K Snapshot Tool
  const handleCaptureSnapshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');

    if (onCaptureSnapshot) {
      onCaptureSnapshot(dataUrl);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_3d_render.png`;
      a.click();
    }
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full select-none overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing touch-none"
    >
      {/* Top Floating 3D Toolbar */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-4 flex flex-wrap items-center gap-1.5 sm:gap-2 z-10 max-w-[calc(100%-110px)] overflow-x-auto no-scrollbar">
        {/* Camera Views Preset */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 backdrop-blur-sm shadow-md shrink-0">
          <button
            onClick={() => applyPreset('iso')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              cameraPreset === 'iso'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iso 3D
          </button>
          <button
            onClick={() => applyPreset('south')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              cameraPreset === 'south'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Façade
          </button>
          <button
            onClick={() => applyPreset('aerial')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              cameraPreset === 'aerial'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aérien
          </button>
          <button
            onClick={() => applyPreset('top')}
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              cameraPreset === 'top'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ciel
          </button>
        </div>

        {/* Visibility Toggles */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 backdrop-blur-sm shadow-md shrink-0">
          <button
            onClick={onToggleRoof}
            title="Afficher / Masquer la toiture"
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${
              showRoof ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Toiture</span>
          </button>
          <button
            onClick={onToggleCutaway}
            title="Vue en coupe / Écorchée par étage"
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${
              cutawayMode ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Coupe</span>
          </button>
          <button
            onClick={onToggleFurniture}
            title="Afficher / Masquer le mobilier d'architecte"
            className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors ${
              showFurniture ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobilier</span>
          </button>
        </div>
      </div>

      {/* Sun / Time-of-Day Lighting Controls (Top Right) */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-4 flex items-center gap-1.5 sm:gap-2 z-10">
        <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 backdrop-blur-sm shadow-md">
          <button
            onClick={() => setTimeOfDay('noon')}
            title="Midi Solaire Plein Ciel"
            className={`px-2 py-1 text-xs rounded transition-colors ${
              timeOfDay === 'noon' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Midi
          </button>
          <button
            onClick={() => setTimeOfDay('golden')}
            title="Golden Hour / Coucher de soleil"
            className={`px-2 py-1 text-xs rounded transition-colors ${
              timeOfDay === 'golden' ? 'bg-orange-500/20 text-orange-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Doré
          </button>
          <button
            onClick={() => setTimeOfDay('night')}
            title="Nuit & Éclairage Intérieur"
            className={`px-2 py-1 text-xs rounded transition-colors ${
              timeOfDay === 'night' ? 'bg-blue-600/30 text-sky-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Nuit
          </button>
        </div>

        {/* Snapshot / Capture Button */}
        <button
          onClick={handleCaptureSnapshot}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-colors shrink-0"
          title="Capturer un rendu 3D haute résolution"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Capture</span>
        </button>
      </div>

      {/* Floating Bottom Help Helper (desktop only) */}
      <div className="absolute bottom-3 left-4 hidden md:flex items-center gap-3 z-10 pointer-events-none text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800 backdrop-blur-sm">
        <span>Glisser 1 doigt / clic : Orbite</span>
        <span className="text-slate-600">·</span>
        <span>Pincer / molette : Zoom</span>
      </div>
    </div>
  );
};
