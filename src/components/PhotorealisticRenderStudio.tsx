import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BuildingProject, FacadeMaterial, RoofMaterial, JoineryColor } from '../types/architecture';
import {
  Sun,
  Moon,
  Camera,
  Maximize2,
  Sparkles,
  Download,
  Sliders,
  Layers,
  Palette,
  Eye,
  RefreshCw,
  Check,
  Compass,
  Aperture,
  X,
  Share2,
} from 'lucide-react';

interface PhotorealisticRenderStudioProps {
  project: BuildingProject;
  onUpdateProject: (updates: Partial<BuildingProject>) => void;
  onClose?: () => void;
}

export type LightingPreset = 'noon' | 'golden' | 'blue_hour' | 'night' | 'dawn';
export type CameraPreset = 'pedestrian' | 'elevation' | 'drone' | 'three_quarter' | 'isometric' | 'interior';

export const PhotorealisticRenderStudio: React.FC<PhotorealisticRenderStudioProps> = ({
  project,
  onUpdateProject,
  onClose,
}) => {
  // Rendering options state
  const [lighting, setLighting] = useState<LightingPreset>('blue_hour');
  const [cameraAngle, setCameraAngle] = useState<CameraPreset>('pedestrian');
  const [resolution, setResolution] = useState<'fhd' | '2k' | '4k'>('fhd');
  const [focalLength, setFocalLength] = useState<number>(35); // in mm (24mm wide, 35mm normal, 50mm tele)
  const [exposure, setExposure] = useState<number>(1.1);
  const [showCartouche, setShowCartouche] = useState<boolean>(true);
  const [environmentLandscape, setEnvironmentLandscape] = useState<'lawn_pool' | 'paved_plaza' | 'forest_garden'>('lawn_pool');

  // Materials override in studio
  const [currentFacade, setCurrentFacade] = useState<FacadeMaterial>(project.materials.facade);
  const [currentRoofMat, setCurrentRoofMat] = useState<RoofMaterial>(project.roof.material);
  const [currentJoinery, setCurrentJoinery] = useState<JoineryColor>(project.materials.joineryColor);
  const [glassReflection, setGlassReflection] = useState<'clear' | 'mirror' | 'tinted'>('mirror');

  // Renders gallery
  const [isRendering, setIsRendering] = useState(false);
  const [gallery, setGallery] = useState<{ id: string; url: string; title: string; meta: string; date: string }[]>([]);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<string | null>(null);

  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  // Three.js refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const poolRef = useRef<THREE.Mesh | null>(null);

  // Camera animation lerp target
  const camTargetPosRef = useRef(new THREE.Vector3(0, 2, 0));
  const camLookAtRef = useRef(new THREE.Vector3(0, 2, 0));

  // Update Three.js camera from angle preset
  const updateCameraAngle = useCallback((preset: CameraPreset, fovMm: number) => {
    if (!cameraRef.current) return;
    const { length, width } = project.dimensions;
    const center = new THREE.Vector3(length / 2, 2.0, width / 2);
    camLookAtRef.current.copy(center);

    // Convert focal length (35mm sensor format) to vertical FOV degrees
    // fov = 2 * atan(frameHeight / (2 * focalLength))
    const sensorHeight = 24; // mm
    const fov = 2 * Math.atan(sensorHeight / (2 * fovMm)) * (180 / Math.PI);
    cameraRef.current.fov = fov;
    cameraRef.current.updateProjectionMatrix();

    const maxDim = Math.max(length, width);

    if (preset === 'pedestrian') {
      // Eye level (1.70m height, slight tilt up)
      camTargetPosRef.current.set(length * 0.5, 1.7, -maxDim * 1.35);
      camLookAtRef.current.set(length * 0.5, 2.5, width * 0.35);
    } else if (preset === 'elevation') {
      // Orthogonal elevation from South facade
      camTargetPosRef.current.set(length * 0.5, 3.0, -maxDim * 1.6);
      camLookAtRef.current.set(length * 0.5, 3.0, width * 0.5);
    } else if (preset === 'drone') {
      // High 45-degree aerial drone view
      camTargetPosRef.current.set(length * 1.4, maxDim * 1.2, -maxDim * 1.1);
      camLookAtRef.current.set(length * 0.5, 1.5, width * 0.5);
    } else if (preset === 'three_quarter') {
      // Dynamic 3/4 corner angle
      camTargetPosRef.current.set(length * 1.35, 3.2, -maxDim * 0.95);
      camLookAtRef.current.set(length * 0.45, 2.0, width * 0.45);
    } else if (preset === 'isometric') {
      // High isometric vantage point
      camTargetPosRef.current.set(length * 1.6, maxDim * 1.6, -maxDim * 1.6);
      camLookAtRef.current.set(length * 0.5, 2.0, width * 0.5);
    } else if (preset === 'interior') {
      // Through-glass interior/terrace perspective
      camTargetPosRef.current.set(length * 0.4, 1.6, -0.8);
      camLookAtRef.current.set(length * 0.5, 1.8, width * 0.6);
    }

    cameraRef.current.position.copy(camTargetPosRef.current);
    cameraRef.current.lookAt(camLookAtRef.current);
  }, [project.dimensions]);

  // Update lighting & sky dome
  const updateLighting = useCallback((preset: LightingPreset) => {
    const scene = sceneRef.current;
    const lightsGroup = lightsGroupRef.current;
    if (!scene || !lightsGroup) return;

    // Clear old lights
    while (lightsGroup.children.length > 0) {
      const l = lightsGroup.children[0];
      lightsGroup.remove(l);
    }

    if (preset === 'noon') {
      // Bright direct midday sun
      scene.background = new THREE.Color(0x38bdf8);
      scene.fog = new THREE.FogExp2(0x38bdf8, 0.008);

      const sun = new THREE.DirectionalLight(0xffffff, 2.4);
      sun.position.set(25, 45, 15);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 4096;
      sun.shadow.mapSize.height = 4096;
      sun.shadow.bias = -0.0003;
      lightsGroup.add(sun);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x166534, 0.9);
      lightsGroup.add(hemi);
    } else if (preset === 'golden') {
      // Sunset golden hour (rich amber, long shadows)
      scene.background = new THREE.Color(0x1e1b4b);
      scene.fog = new THREE.FogExp2(0x1e1b4b, 0.012);

      const sun = new THREE.DirectionalLight(0xf59e0b, 2.8);
      sun.position.set(40, 9, -25);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 4096;
      sun.shadow.mapSize.height = 4096;
      lightsGroup.add(sun);

      const skyFill = new THREE.DirectionalLight(0xf43f5e, 0.7);
      skyFill.position.set(-20, 15, 20);
      lightsGroup.add(skyFill);

      const hemi = new THREE.HemisphereLight(0xfbbf24, 0x0f172a, 0.6);
      lightsGroup.add(hemi);
    } else if (preset === 'blue_hour') {
      // Twilight "Heure Bleue" with glowing warm interior windows & exterior spot downlights!
      scene.background = new THREE.Color(0x0a1128);
      scene.fog = new THREE.FogExp2(0x0a1128, 0.01);

      // Soft ambient dusk light
      const duskAmbient = new THREE.AmbientLight(0x1e3a8a, 0.6);
      lightsGroup.add(duskAmbient);

      const moon = new THREE.DirectionalLight(0x60a5fa, 0.5);
      moon.position.set(-20, 25, -20);
      moon.castShadow = true;
      lightsGroup.add(moon);

      // Warm interior illumination glowing outwards (2700K warm white)
      project.floors.forEach((floor, idx) => {
        floor.rooms.forEach((room) => {
          const interiorLight = new THREE.PointLight(0xfef08a, 2.5, 9);
          interiorLight.position.set(
            room.x + room.width / 2,
            idx * 2.8 + 1.8,
            room.y + room.length / 2
          );
          lightsGroup.add(interiorLight);
        });
      });

      // Architectural facade uplights / recessed garden spots
      const spot1 = new THREE.SpotLight(0xfef3c7, 3.0, 12, Math.PI / 5, 0.3);
      spot1.position.set(project.dimensions.length * 0.25, 0.1, -1.0);
      spot1.target.position.set(project.dimensions.length * 0.25, 3.5, 0);
      lightsGroup.add(spot1);
      lightsGroup.add(spot1.target);

      const spot2 = new THREE.SpotLight(0xfef3c7, 3.0, 12, Math.PI / 5, 0.3);
      spot2.position.set(project.dimensions.length * 0.75, 0.1, -1.0);
      spot2.target.position.set(project.dimensions.length * 0.75, 3.5, 0);
      lightsGroup.add(spot2);
      lightsGroup.add(spot2.target);
    } else if (preset === 'night') {
      // Night architectural illumination
      scene.background = new THREE.Color(0x020617);
      scene.fog = new THREE.FogExp2(0x020617, 0.015);

      const ambientNight = new THREE.AmbientLight(0x0f172a, 0.3);
      lightsGroup.add(ambientNight);

      // Dramatic pool lights and interior glow
      const poolLight = new THREE.PointLight(0x38bdf8, 3.5, 8);
      poolLight.position.set(project.dimensions.length / 2, 0.1, -5.0);
      lightsGroup.add(poolLight);

      project.floors.forEach((floor, idx) => {
        floor.rooms.forEach((room) => {
          const interiorLight = new THREE.PointLight(0xfbbf24, 2.2, 8);
          interiorLight.position.set(room.x + room.width / 2, idx * 2.8 + 1.6, room.y + room.length / 2);
          lightsGroup.add(interiorLight);
        });
      });
    } else if (preset === 'dawn') {
      // Fresh misty dawn
      scene.background = new THREE.Color(0x475569);
      scene.fog = new THREE.FogExp2(0x475569, 0.018);

      const dawnSun = new THREE.DirectionalLight(0xfecdd3, 1.8);
      dawnSun.position.set(-35, 12, 20);
      dawnSun.castShadow = true;
      lightsGroup.add(dawnSun);

      const skyFill = new THREE.AmbientLight(0xe0e7ff, 0.8);
      lightsGroup.add(skyFill);
    }
  }, [project.dimensions, project.floors]);

  // Build the complete 3D scene with physical materials
  const buildPhotorealisticScene = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (buildingGroupRef.current) {
      scene.remove(buildingGroupRef.current);
      buildingGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
    }

    const group = new THREE.Group();
    buildingGroupRef.current = group;

    const { length, width } = project.dimensions;
    const tExt = project.exteriorWallThickness;
    const tInt = project.interiorWallThickness;
    const fHeight = project.foundationHeight;

    // PBR Facade Material
    let facadeColor = 0xf8fafc;
    let facadeRough = 0.8;
    let facadeMetal = 0.05;

    if (currentFacade === 'warm_limestone') {
      facadeColor = 0xfef3c7; // warm limestone stone
      facadeRough = 0.9;
    } else if (currentFacade === 'nordic_timber') {
      facadeColor = 0x9a3412; // cedar timber
      facadeRough = 0.65;
    } else if (currentFacade === 'anthracite_brick') {
      facadeColor = 0x1e293b;
      facadeRough = 0.95;
    } else if (currentFacade === 'raw_concrete') {
      facadeColor = 0x94a3b8;
      facadeRough = 0.85;
      facadeMetal = 0.1;
    }

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: facadeColor,
      roughness: facadeRough,
      metalness: facadeMetal,
    });

    const interiorWallMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
    });

    // PBR Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: glassReflection === 'mirror' ? 0x93c5fd : glassReflection === 'tinted' ? 0x334155 : 0xe0f2fe,
      metalness: glassReflection === 'mirror' ? 0.3 : 0.05,
      roughness: 0.05,
      transmission: glassReflection === 'mirror' ? 0.6 : 0.85,
      ior: 1.52,
      reflectivity: 0.9,
      transparent: true,
      opacity: 0.55,
    });

    // PBR Joinery (Frames)
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: currentJoinery === 'white' ? 0xffffff : currentJoinery === 'natural_wood' ? 0x78350f : 0x0f172a,
      roughness: 0.35,
      metalness: 0.8,
    });

    // Ground & Landscaping
    const groundSize = 120;
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMat = new THREE.MeshStandardMaterial({
      color: environmentLandscape === 'forest_garden' ? 0x14532d : 0x15803d, // lush grass
      roughness: 0.95,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    group.add(ground);

    // Modern Terrace Paving around house
    const terraceW = length + 8.0;
    const terraceH = width + 8.0;
    const terraceGeo = new THREE.PlaneGeometry(terraceW, terraceH);
    const terraceMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // travertine tiles
      roughness: 0.6,
      metalness: 0.05,
    });
    const terrace = new THREE.Mesh(terraceGeo, terraceMat);
    terrace.rotation.x = -Math.PI / 2;
    terrace.position.set(length / 2, 0.01, width / 2 - 2.0);
    terrace.receiveShadow = true;
    group.add(terrace);

    // Infinity Reflection Pool (if lawn_pool mode)
    if (environmentLandscape === 'lawn_pool') {
      const poolW = length * 0.75;
      const poolL = 5.0;
      const poolGeo = new THREE.BoxGeometry(poolW, 0.4, poolL);
      const poolWaterMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.7,
        reflectivity: 0.95,
        transparent: true,
        opacity: 0.85,
      });
      const pool = new THREE.Mesh(poolGeo, poolWaterMat);
      pool.position.set(length / 2, 0.15, -4.5);
      pool.receiveShadow = true;
      group.add(pool);
      poolRef.current = pool;

      // Pool curb
      const curbGeo = new THREE.BoxGeometry(poolW + 0.6, 0.25, poolL + 0.6);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(length / 2, 0.1, -4.5);
      curb.receiveShadow = true;
      group.add(curb);
    }

    // Concrete Plinth / Foundation
    const foundationGeo = new THREE.BoxGeometry(length + 0.4, fHeight, width + 0.4);
    const foundationMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const foundation = new THREE.Mesh(foundationGeo, foundationMat);
    foundation.position.set(length / 2, fHeight / 2, width / 2);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    group.add(foundation);

    // Floors & Walls
    let currentY = fHeight;
    project.floors.forEach((floor, idx) => {
      const H = floor.ceilingHeight;

      // Floor slab
      const slabGeo = new THREE.BoxGeometry(length, 0.25, width);
      const slabMesh = new THREE.Mesh(slabGeo, foundationMat);
      slabMesh.position.set(length / 2, currentY + 0.125, width / 2);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      group.add(slabMesh);

      // Floor interior finished parquet
      floor.rooms.forEach((room) => {
        const pGeo = new THREE.BoxGeometry(room.width - 0.04, 0.02, room.length - 0.04);
        const pMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.4 });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set(room.x + room.width / 2, currentY + 0.26, room.y + room.length / 2);
        group.add(pMesh);

        // Partition walls
        const wallX = new THREE.Mesh(new THREE.BoxGeometry(room.width, H, tInt), interiorWallMat);
        wallX.position.set(room.x + room.width / 2, currentY + H / 2 + 0.25, room.y + room.length);
        wallX.castShadow = true;
        group.add(wallX);

        const wallY = new THREE.Mesh(new THREE.BoxGeometry(tInt, H, room.length), interiorWallMat);
        wallY.position.set(room.x + room.width, currentY + H / 2 + 0.25, room.y + room.length / 2);
        wallY.castShadow = true;
        group.add(wallY);
      });

      // Exterior Walls with precision opening cuts (South Facade)
      const southOps = floor.openings.filter((o) => o.wall === 'south').sort((a, b) => a.offset - b.offset);
      let curX = 0;
      southOps.forEach((op) => {
        const spanW = op.offset - curX;
        if (spanW > 0.05) {
          const wMesh = new THREE.Mesh(new THREE.BoxGeometry(spanW, H, tExt), wallMaterial);
          wMesh.position.set(curX + spanW / 2, currentY + H / 2 + 0.25, tExt / 2);
          wMesh.castShadow = true;
          wMesh.receiveShadow = true;
          group.add(wMesh);
        }

        // Lintel
        const lintelH = H - (op.sillHeight + op.height);
        if (lintelH > 0.05) {
          const lMesh = new THREE.Mesh(new THREE.BoxGeometry(op.width, lintelH, tExt), wallMaterial);
          lMesh.position.set(op.offset + op.width / 2, currentY + H - lintelH / 2 + 0.25, tExt / 2);
          lMesh.castShadow = true;
          group.add(lMesh);
        }

        // Sill
        if (op.sillHeight > 0.05) {
          const sMesh = new THREE.Mesh(new THREE.BoxGeometry(op.width, op.sillHeight, tExt), wallMaterial);
          sMesh.position.set(op.offset + op.width / 2, currentY + op.sillHeight / 2 + 0.25, tExt / 2);
          sMesh.castShadow = true;
          group.add(sMesh);
        }

        // 3D Glass pane
        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(op.width - 0.06, op.height - 0.06, 0.04),
          glassMaterial
        );
        glass.position.set(op.offset + op.width / 2, currentY + op.sillHeight + op.height / 2 + 0.25, tExt / 2);
        group.add(glass);

        // Frame
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(op.width, op.height, 0.07),
          frameMaterial
        );
        frame.position.set(op.offset + op.width / 2, currentY + op.sillHeight + op.height / 2 + 0.25, tExt / 2);
        frame.castShadow = true;
        group.add(frame);

        curX = op.offset + op.width;
      });

      if (curX < length) {
        const spanW = length - curX;
        const wMesh = new THREE.Mesh(new THREE.BoxGeometry(spanW, H, tExt), wallMaterial);
        wMesh.position.set(curX + spanW / 2, currentY + H / 2 + 0.25, tExt / 2);
        wMesh.castShadow = true;
        wMesh.receiveShadow = true;
        group.add(wMesh);
      }

      // North, West, East Walls
      const northW = new THREE.Mesh(new THREE.BoxGeometry(length, H, tExt), wallMaterial);
      northW.position.set(length / 2, currentY + H / 2 + 0.25, width - tExt / 2);
      northW.castShadow = true;
      group.add(northW);

      const westW = new THREE.Mesh(new THREE.BoxGeometry(tExt, H, width - 2 * tExt), wallMaterial);
      westW.position.set(tExt / 2, currentY + H / 2 + 0.25, width / 2);
      westW.castShadow = true;
      group.add(westW);

      const eastW = new THREE.Mesh(new THREE.BoxGeometry(tExt, H, width - 2 * tExt), wallMaterial);
      eastW.position.set(length - tExt / 2, currentY + H / 2 + 0.25, width / 2);
      eastW.castShadow = true;
      group.add(eastW);

      currentY += H + 0.25;
    });

    // PBR Roof Geometry
    const roofY = currentY;
    let roofColor = 0xb45309;
    if (currentRoofMat === 'slate_graphite') roofColor = 0x1e293b;
    if (currentRoofMat === 'zinc_dark') roofColor = 0x334155;
    if (currentRoofMat === 'gravel_terrace') roofColor = 0x64748b;

    const roofPbrMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.6,
      metalness: currentRoofMat === 'zinc_dark' ? 0.7 : 0.1,
    });

    if (project.roof.type === 'flat') {
      // Flat Roof Terrace with parapet and coping
      const parapetH = project.roof.parapetHeight;
      const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(length + 0.4, 0.25, width + 0.4), foundationMat);
      roofSlab.position.set(length / 2, roofY + 0.125, width / 2);
      roofSlab.receiveShadow = true;
      group.add(roofSlab);

      // Parapets
      const pS = new THREE.Mesh(new THREE.BoxGeometry(length + 0.4, parapetH, 0.25), wallMaterial);
      pS.position.set(length / 2, roofY + parapetH / 2 + 0.25, 0.125);
      pS.castShadow = true;
      group.add(pS);

      const pN = new THREE.Mesh(new THREE.BoxGeometry(length + 0.4, parapetH, 0.25), wallMaterial);
      pN.position.set(length / 2, roofY + parapetH / 2 + 0.25, width + 0.4 - 0.125);
      pN.castShadow = true;
      group.add(pN);

      const pW = new THREE.Mesh(new THREE.BoxGeometry(0.25, parapetH, width + 0.4), wallMaterial);
      pW.position.set(0.125, roofY + parapetH / 2 + 0.25, width / 2);
      pW.castShadow = true;
      group.add(pW);

      const pE = new THREE.Mesh(new THREE.BoxGeometry(0.25, parapetH, width + 0.4), wallMaterial);
      pE.position.set(length + 0.4 - 0.125, roofY + parapetH / 2 + 0.25, width / 2);
      pE.castShadow = true;
      group.add(pE);
    } else if (project.roof.type === 'gable') {
      const pitchRad = (project.roof.pitch * Math.PI) / 180;
      const overhang = project.roof.overhang;
      const halfW = width / 2 + overhang;
      const roofPeakH = halfW * Math.tan(pitchRad);
      const slopeLen = halfW / Math.cos(pitchRad);

      const s1 = new THREE.Mesh(new THREE.BoxGeometry(length + overhang * 2, 0.18, slopeLen), roofPbrMat);
      s1.position.set(length / 2, roofY + roofPeakH / 2, width / 2 - halfW / 2);
      s1.rotation.x = pitchRad;
      s1.castShadow = true;
      group.add(s1);

      const s2 = new THREE.Mesh(new THREE.BoxGeometry(length + overhang * 2, 0.18, slopeLen), roofPbrMat);
      s2.position.set(length / 2, roofY + roofPeakH / 2, width / 2 + halfW / 2);
      s2.rotation.x = -pitchRad;
      s2.castShadow = true;
      group.add(s2);
    } else if (project.roof.type === 'shed') {
      // Monopente (same geometry as the 3D model viewport)
      const overhang = project.roof.overhang;
      const pitchRad = (project.roof.pitch * Math.PI) / 180;
      const shedPeakH = (width + overhang) * Math.tan(pitchRad);
      const shedLen = (width + overhang * 2) / Math.cos(pitchRad);

      const shed = new THREE.Mesh(new THREE.BoxGeometry(length + overhang * 2, 0.18, shedLen), roofPbrMat);
      shed.position.set(length / 2, roofY + shedPeakH / 2, width / 2);
      shed.rotation.x = pitchRad;
      shed.castShadow = true;
      group.add(shed);
    }

    scene.add(group);
  }, [
    project,
    currentFacade,
    currentRoofMat,
    currentJoinery,
    glassReflection,
    environmentLandscape,
  ]);

  // Init WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const lightsGroup = new THREE.Group();
    lightsGroupRef.current = lightsGroup;
    scene.add(lightsGroup);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure;

    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    buildPhotorealisticScene();
    updateLighting(lighting);
    updateCameraAngle(cameraAngle, focalLength);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // Pool water subtle shimmer
        if (poolRef.current) {
          poolRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.005;
        }
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

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
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update scene when properties change
  useEffect(() => {
    buildPhotorealisticScene();
  }, [buildPhotorealisticScene]);

  useEffect(() => {
    updateLighting(lighting);
  }, [updateLighting, lighting]);

  useEffect(() => {
    updateCameraAngle(cameraAngle, focalLength);
  }, [updateCameraAngle, cameraAngle, focalLength]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = exposure;
    }
  }, [exposure]);

  // Execute High-Resolution Rendering & Cartouche Generation
  const handleRenderHighRes = () => {
    setIsRendering(true);

    setTimeout(() => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) {
        setIsRendering(false);
        return;
      }

      // Render crisp frame
      renderer.render(scene, camera);
      const rawDataUrl = renderer.domElement.toDataURL('image/png');

      if (!showCartouche) {
        const renderId = `render_${Date.now()}`;
        setGallery((prev) => [
          {
            id: renderId,
            url: rawDataUrl,
            title: `${project.title} · ${lighting.toUpperCase()} · ${cameraAngle.toUpperCase()}`,
            meta: `${project.dimensions.length}m × ${project.dimensions.width}m · ${resolution.toUpperCase()}`,
            date: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        setSelectedGalleryItem(renderId);
        setIsRendering(false);
        return;
      }

      // Overlay Architectural Cartouche
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        // Cartouche Box (Bottom-Left)
        const cW = Math.min(canvas.width * 0.42, 480);
        const cH = 88;
        const cX = 28;
        const cY = canvas.height - cH - 28;

        ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cX, cY, cW, cH, 10);
        ctx.fill();
        ctx.stroke();

        // Project Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(project.title.toUpperCase(), cX + 18, cY + 30);

        // Architect & Lighting
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(
          `ARCHITECTE : ${project.architect} · AMBIANCE : ${lighting.toUpperCase()}`,
          cX + 18,
          cY + 52
        );

        // Tech specs & Dimensions
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(
          `COTES : ${project.dimensions.length.toFixed(1)}m × ${project.dimensions.width.toFixed(1)}m · CAM : ${cameraAngle.toUpperCase()} ${focalLength}mm`,
          cX + 18,
          cY + 72
        );

        const finalUrl = canvas.toDataURL('image/png');
        const renderId = `render_${Date.now()}`;
        setGallery((prev) => [
          {
            id: renderId,
            url: finalUrl,
            title: `${project.title} · ${lighting.toUpperCase()}`,
            meta: `${project.dimensions.length}m × ${project.dimensions.width}m · ${resolution.toUpperCase()}`,
            date: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
        setSelectedGalleryItem(renderId);
        setIsRendering(false);
      };
      img.src = rawDataUrl;
    }, 600);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Studio Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-3 sm:px-5 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5 sm:gap-2">
              <span>Studio Photoréaliste</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                PBR Ray-Tracing
              </span>
            </h1>
            <p className="hidden md:block text-[11px] text-slate-400">
              Génération d’images d’architecture haute fidélité avec éclairage naturel et physique des matériaux.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Settings Toggle */}
          <button
            onClick={() => setIsMobileSettingsOpen(!isMobileSettingsOpen)}
            className="lg:hidden px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[11px]">Matériaux</span>
          </button>


          {/* Trigger Render Button */}
          <button
            onClick={handleRenderHighRes}
            disabled={isRendering}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden xs:inline">Calcul...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lancer le Rendu Photoréaliste</span>
                <span className="sm:hidden">Rendu</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Interactive 3D Canvas Viewport */}
        <div className="flex-1 relative overflow-hidden bg-slate-950">
          <div ref={mountRef} className="w-full h-full block touch-none" />


          {/* Floating Camera Preset Quick Controls */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center gap-1.5 z-10 max-w-[calc(100%-16px)] overflow-x-auto no-scrollbar">
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 backdrop-blur-md shadow-lg shrink-0">
              <span className="hidden xs:inline text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Angle :</span>
              {[
                { id: 'pedestrian', label: 'Piéton 1.7m', icon: Eye },
                { id: 'elevation', label: 'Façade', icon: Maximize2 },
                { id: 'three_quarter', label: 'Angle 3/4', icon: Aperture },
                { id: 'drone', label: 'Drone', icon: Camera },
                { id: 'interior', label: 'Intérieur', icon: Compass },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCameraAngle(c.id as CameraPreset)}
                  className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    cameraAngle === c.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Lighting Mode Bar (Bottom Center) */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 sm:p-1.5 backdrop-blur-md shadow-2xl z-10 max-w-[calc(100%-16px)] overflow-x-auto no-scrollbar">
            <span className="hidden sm:flex text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 items-center gap-1 shrink-0">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Éclairage :
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'noon', label: 'Jour' },
                { id: 'golden', label: 'Doré' },
                { id: 'blue_hour', label: 'Crépuscule' },
                { id: 'night', label: 'Nuit' },
                { id: 'dawn', label: 'Aube' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLighting(l.id as LightingPreset)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
                    lighting === l.id
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Backdrop for Mobile Settings Drawer */}
        {isMobileSettingsOpen && (
          <div
            onClick={() => setIsMobileSettingsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 animate-in fade-in"
          />
        )}

        {/* Right Studio Inspector & Finishes Customizer */}
        <aside
          className={`${
            isMobileSettingsOpen
              ? 'fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] shadow-2xl animate-in slide-in-from-right duration-200'
              : 'hidden lg:flex'
          } w-84 xl:w-92 h-full flex flex-col bg-slate-900 border-l border-slate-800 shrink-0 text-slate-200 overflow-y-auto p-4 space-y-5 text-xs`}
        >
          {/* Mobile Drawer Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white text-xs">Matériaux & Rendu</span>
            <button
              onClick={() => setIsMobileSettingsOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
            >
              Fermer ✕
            </button>
          </div>
          {/* Section: Matériaux Photoréalistes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Matériaux & Finitions Photoréalistes
              </h2>
            </div>

            {/* Facade Texture */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-[11px] text-slate-400 block font-medium">Finition des Murs & Façades</label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'white_stucco', label: 'Enduit Minéral Blanc Pur', desc: 'Crépi taloché fin, réflectance haute' },
                  { id: 'warm_limestone', label: 'Pierre Calcaire Blonde de Taille', desc: 'Grain naturel, appareillage soigné' },
                  { id: 'nordic_timber', label: 'Bardage Bois Cèdre Rouge', desc: 'Lames horizontales claires et veinées' },
                  { id: 'raw_concrete', label: 'Béton Architectonique Coffré', desc: 'Traces de banches et trous de cônes' },
                  { id: 'anthracite_brick', label: 'Brique Anthracite Flammée', desc: 'Joints creux contemporains' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setCurrentFacade(f.id as FacadeMaterial);
                      onUpdateProject({
                        materials: { ...project.materials, facade: f.id as FacadeMaterial },
                      });
                    }}
                    className={`p-2 rounded-lg text-left transition-colors border ${
                      currentFacade === f.id
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{f.label}</div>
                    <div className="text-[10px] text-slate-500">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Roof Material */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-[11px] text-slate-400 block font-medium">Couverture & Toiture</label>
              <select
                value={currentRoofMat}
                onChange={(e) => {
                  const m = e.target.value as RoofMaterial;
                  setCurrentRoofMat(m);
                  onUpdateProject({ roof: { ...project.roof, material: m } });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="gravel_terrace">Toiture Terrasse Gravillons & Végétalisation</option>
                <option value="slate_graphite">Ardoise Naturelle Sombre d’Anjou</option>
                <option value="zinc_dark">Zinc Titane Joint Debout Noir</option>
                <option value="tile_terracotta">Tuiles Terre Cuite Vieillies du Sud</option>
              </select>
            </div>

            {/* Glass & Windows */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-[11px] text-slate-400 block font-medium">Traitement des Vitrages</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'mirror', label: 'Miroir Ciel' },
                  { id: 'clear', label: 'Clair Pénétrant' },
                  { id: 'tinted', label: 'Fumé Solaire' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGlassReflection(g.id as any)}
                    className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-colors border ${
                      glassReflection === g.id
                        ? 'bg-cyan-600 text-white font-bold border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Landscaping */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-[11px] text-slate-400 block font-medium">Aménagement Extérieur</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setEnvironmentLandscape('lawn_pool')}
                  className={`p-2 rounded-lg text-center text-xs font-medium border transition-colors ${
                    environmentLandscape === 'lawn_pool'
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Piscine & Pelouse
                </button>
                <button
                  onClick={() => setEnvironmentLandscape('paved_plaza')}
                  className={`p-2 rounded-lg text-center text-xs font-medium border transition-colors ${
                    environmentLandscape === 'paved_plaza'
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Dallage Minéral
                </button>
              </div>
            </div>
          </div>

          {/* Section: Caméra & Optique */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Aperture className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Optique & Caméra d’Architecte
              </h2>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Focale de l’Objectif :</span>
                  <span className="font-mono text-cyan-400 font-bold">{focalLength} mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="85"
                  step="5"
                  value={focalLength}
                  onChange={(e) => setFocalLength(parseInt(e.target.value) || 35)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>24mm Grand Angle</span>
                  <span>35mm Standard</span>
                  <span>50mm Télé</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Exposition & Lumière :</span>
                  <span className="font-mono text-white">{exposure.toFixed(2)} EV</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={exposure}
                  onChange={(e) => setExposure(parseFloat(e.target.value) || 1.1)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">Cartouche Officiel :</span>
                <button
                  onClick={() => setShowCartouche(!showCartouche)}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    showCartouche
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {showCartouche ? 'Incrusté' : 'Désactivé'}
                </button>
              </div>
            </div>
          </div>

          {/* Section: Galerie des Rendus de Session */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Galerie de Rendus ({gallery.length})
              </span>
            </div>

            {gallery.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                Aucun rendu capturé. Cliquez sur "Lancer le Rendu" ci-dessus pour générer une image 3D photoréaliste.
              </div>
            ) : (
              <div className="space-y-2.5">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden relative bg-black">
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="truncate max-w-48">
                        <span className="font-semibold text-white block truncate text-[11px]">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.meta}</span>
                      </div>
                      <a
                        href={item.url}
                        download={`${project.title.toLowerCase().replace(/\s+/g, '_')}_rendu.png`}
                        className="flex items-center gap-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-bold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PNG</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
