// src/core/3d/ThreeViewport3D.tsx
// Động cơ 3D WebGL Three.js Chuyên Nghiệp (Hỗ trợ Orbit Camera, First-Person Walkthrough, PBR Materials & Shadows)

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Board, WallItem, DoorWindowItem, GardenFurnitureItem } from '../../types';
import { pxToMeters, distanceBetween } from '../geometry/DimensionMath';
import { getPBRMaterial } from '../catalog/MaterialCatalog';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowLeft, 
  Download, 
  Sun, 
  Footprints, 
  Compass, 
  Sparkles, 
  Eye, 
  Layers, 
  Box,
  FileCode
} from 'lucide-react';
import { downloadAutoCADDXF } from '../../services/dxfExporter';

interface ThreeViewport3DProps {
  board: Board;
  onExit3D: () => void;
  onOpenAIRenderStudio?: () => void;
}

export default function ThreeViewport3D({ board, onExit3D, onOpenAIRenderStudio }: ThreeViewport3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trạng thái điều khiển 3D
  const [cameraMode, setCameraMode] = useState<'orbit' | 'walkthrough'>('orbit');
  const [sunHour, setSunHour] = useState(14); // 14:00 mặc định
  const [renderQuality, setRenderQuality] = useState<'draft' | 'high' | 'realistic'>('high');
  const [showRoof, setShowRoof] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. SCENE, CAMERA & RENDERER SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 22);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: renderQuality !== 'draft', 
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = renderQuality !== 'draft';
    renderer.shadowMap.type = renderQuality === 'realistic' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. HỆ THỐNG ÁNH SÁNG & MÔ PHỎNG NẮNG MẶT TRỜI THEO GIỜ
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.75);
    scene.add(hemiLight);

    const sunNormalized = (sunHour - 6) / 12;
    const sunAzimuth = (sunNormalized - 0.5) * Math.PI * 0.85;
    const sunAltitude = Math.sin(Math.max(0.1, sunNormalized * Math.PI));

    const sunLight = new THREE.DirectionalLight(
      sunHour <= 7 || sunHour >= 17 ? 0xfdba74 : 0xffffff, 
      1.2 * sunAltitude
    );
    sunLight.position.set(Math.sin(sunAzimuth) * 30, Math.max(8, sunAltitude * 35), Math.cos(sunAzimuth) * 30);
    sunLight.castShadow = renderQuality !== 'draft';
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = 25;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // 3. TÍNH TÂM TOÀN BỘ CÔNG TRÌNH ĐỂ CĂN GIỮA TOẠ ĐỘ
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    board.items.forEach(i => {
      minX = Math.min(minX, i.x);
      minY = Math.min(minY, i.y);
      maxX = Math.max(maxX, i.x + i.width);
      maxY = Math.max(maxY, i.y + i.height);
    });

    const centerX = minX !== Infinity ? (minX + maxX) / 2 : 400;
    const centerY = minY !== Infinity ? (minY + maxY) / 2 : 400;

    // Chuyển đổi toạ độ 2D (pixels) sang 3D World Coordinates (meters)
    const to3D = (pxX: number, pxY: number, elevationM = 0): THREE.Vector3 => {
      const xM = pxToMeters(pxX - centerX);
      const zM = pxToMeters(pxY - centerY);
      return new THREE.Vector3(xM, elevationM, zM);
    };

    // 4. SÀN GỖ PARQUET & ĐẾ BÊ TÔNG
    if (minX !== Infinity) {
      const floorWidthM = pxToMeters(maxX - minX + 60);
      const floorDepthM = pxToMeters(maxY - minY + 60);

      // Sàn Gỗ Sồi PBR
      const floorGeo = new THREE.BoxGeometry(floorWidthM, 0.15, floorDepthM);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xe5cbb0,
        roughness: 0.35,
        metalness: 0.05
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(0, -0.075, 0);
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);

      // Lưới mặt đất ngoài trời (Ground Grid)
      const gridHelper = new THREE.GridHelper(60, 60, 0x94a3b8, 0xe2e8f0);
      gridHelper.position.y = -0.16;
      scene.add(gridHelper);
    }

    // 5. DỰNG TƯỜNG CẮT LỚP 3D (3D CUTAWAY WALLS WITH BLACK CAP)
    const wallGroup = new THREE.Group();
    const walls = board.items.filter(i => i.type === 'wall') as WallItem[];

    walls.forEach(w => {
      const p1 = to3D(w.x1 ?? w.x, w.y1 ?? w.y);
      const p2 = to3D(w.x2 ?? (w.x + w.width), w.y2 ?? (w.y + w.height));

      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const lengthM = Math.sqrt(dx * dx + dz * dz) || pxToMeters(w.width);
      const heightM = w.wallHeight || (w.isFence ? 1.4 : 2.8);
      const thicknessM = pxToMeters(w.thickness || 15);
      const angle = Math.atan2(dz, dx);

      if (w.isFence) {
        // Lan can ban công kính cường lực trong suốt
        const glassGeo = new THREE.BoxGeometry(lengthM, heightM * 0.45, 0.04);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xbae6fd,
          transmission: 0.9,
          opacity: 0.4,
          transparent: true,
          roughness: 0.05
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.set((p1.x + p2.x) / 2, (heightM * 0.45) / 2, (p1.z + p2.z) / 2);
        glassMesh.rotation.y = -angle;
        wallGroup.add(glassMesh);
      } else {
        // Tường trắng kem
        const wallGeo = new THREE.BoxGeometry(lengthM, heightM, thicknessM);
        const wallMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.85
        });
        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        wallMesh.position.set((p1.x + p2.x) / 2, heightM / 2, (p1.z + p2.z) / 2);
        wallMesh.rotation.y = -angle;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wallGroup.add(wallMesh);

        // Nẹp đỉnh đen cắt lớp sang trọng (Black Top Cap)
        const capGeo = new THREE.BoxGeometry(lengthM + 0.02, 0.06, thicknessM + 0.02);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.set((p1.x + p2.x) / 2, heightM + 0.03, (p1.z + p2.z) / 2);
        capMesh.rotation.y = -angle;
        wallGroup.add(capMesh);
      }
    });
    scene.add(wallGroup);

    // 6. DỰNG CỬA ĐI & VÁCH KÍNH (DOORS & WINDOWS)
    const doorGroup = new THREE.Group();
    const doors = board.items.filter(i => i.type === 'door_window') as DoorWindowItem[];

    doors.forEach(d => {
      const isWindow = d.subType === 'window';
      const isSliding = d.subType === 'sliding_door';
      const widthM = pxToMeters(d.doorWidth || d.width || 45);
      const heightM = isWindow ? 1.4 : isSliding ? 2.4 : 2.2;
      const baseM = isWindow ? 0.9 : 0;
      const pos = to3D(d.x + (d.width || 45) / 2, d.y + (d.height || 15) / 2);

      const glassGeo = new THREE.BoxGeometry(widthM, heightM, 0.05);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xbae6fd,
        transmission: 0.85,
        opacity: 0.45,
        transparent: true,
        roughness: 0.1
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(pos.x, baseM + heightM / 2, pos.z);
      doorGroup.add(glassMesh);

      // Khung nhôm xingfa đen
      const frameGeo = new THREE.BoxGeometry(widthM + 0.04, heightM + 0.04, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(pos.x, baseM + heightM / 2, pos.z);
      doorGroup.add(frameMesh);
    });
    scene.add(doorGroup);

    // 7. DỰNG NỘI THẤT PBR CHI TIẾT (FURNITURE & SANITARY)
    const furnitureGroup = new THREE.Group();
    const furniture = board.items.filter(i => i.type === 'garden_item') as GardenFurnitureItem[];

    furniture.forEach(f => {
      const sym = f.symbolId;
      const wM = pxToMeters(f.width);
      const dM = pxToMeters(f.height);
      const pos = to3D(f.x + f.width / 2, f.y + f.height / 2);

      // GIƯỜNG NGỦ MASTER KING (Ga xanh / Ga đen + Gối đôi + 2 Tab đèn ngủ)
      if (sym === 'bed_double') {
        const isDark = f.label?.includes('Đen') || f.color === '#1e293b';
        // Thảm dệt
        const rugGeo = new THREE.PlaneGeometry(wM + 0.6, dM + 0.6);
        const rugMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x1e293b : 0x94a3b8, roughness: 0.95 });
        const rugMesh = new THREE.Mesh(rugGeo, rugMat);
        rugMesh.rotation.x = -Math.PI / 2;
        rugMesh.position.set(pos.x, 0.01, pos.z);
        furnitureGroup.add(rugMesh);

        // Khung giường gỗ
        const baseGeo = new THREE.BoxGeometry(wM, 0.35, dM);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.4 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.set(pos.x, 0.175, pos.z);
        baseMesh.castShadow = true;
        furnitureGroup.add(baseMesh);

        // Đệm trắng dày
        const matGeo = new THREE.BoxGeometry(wM - 0.1, 0.3, dM - 0.1);
        const matMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        const matMesh = new THREE.Mesh(matGeo, matMat);
        matMesh.position.set(pos.x, 0.45, pos.z);
        furnitureGroup.add(matMesh);

        // Chăn ga màu Navy hoặc Đen kẻ sọc
        const duvetGeo = new THREE.BoxGeometry(wM - 0.1, 0.1, dM * 0.65);
        const duvetMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x0f172a : 0x1e3a8a, roughness: 0.7 });
        const duvetMesh = new THREE.Mesh(duvetGeo, duvetMat);
        duvetMesh.position.set(pos.x, 0.6, pos.z + dM * 0.15);
        furnitureGroup.add(duvetMesh);

        // 2 Đèn ngủ phát sáng hai bên
        const lampGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const lampMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.6 });
        const lamp1 = new THREE.Mesh(lampGeo, lampMat);
        lamp1.position.set(pos.x - wM / 2 - 0.25, 0.65, pos.z - dM / 2 + 0.2);
        const lamp2 = new THREE.Mesh(lampGeo, lampMat);
        lamp2.position.set(pos.x + wM / 2 + 0.25, 0.65, pos.z - dM / 2 + 0.2);
        furnitureGroup.add(lamp1);
        furnitureGroup.add(lamp2);
      }

      // SOFA GÓC L + BÀN TRÀ GỖ
      else if (sym === 'living_sofa') {
        // Thảm phòng khách
        const rugGeo = new THREE.PlaneGeometry(wM + 0.8, dM + 0.8);
        const rugMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
        const rugMesh = new THREE.Mesh(rugGeo, rugMat);
        rugMesh.rotation.x = -Math.PI / 2;
        rugMesh.position.set(pos.x, 0.01, pos.z);
        furnitureGroup.add(rugMesh);

        // Đệm sofa nỉ xám chữ L
        const sofaGeo = new THREE.BoxGeometry(wM, 0.5, dM);
        const sofaMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 });
        const sofaMesh = new THREE.Mesh(sofaGeo, sofaMat);
        sofaMesh.position.set(pos.x, 0.25, pos.z);
        sofaMesh.castShadow = true;
        furnitureGroup.add(sofaMesh);

        // Bàn trà gỗ tự nhiên
        const tableGeo = new THREE.BoxGeometry(wM * 0.45, 0.38, dM * 0.4);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.3 });
        const tableMesh = new THREE.Mesh(tableGeo, tableMat);
        tableMesh.position.set(pos.x + 0.3, 0.19, pos.z + 0.3);
        tableMesh.castShadow = true;
        furnitureGroup.add(tableMesh);
      }

      // TỦ QUẦN ÁO WALK-IN CLOSET
      else if (sym === 'walk_in_closet') {
        const closetGeo = new THREE.BoxGeometry(wM, 2.2, dM);
        const closetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const closetMesh = new THREE.Mesh(closetGeo, closetMat);
        closetMesh.position.set(pos.x, 1.1, pos.z);
        closetMesh.castShadow = true;
        furnitureGroup.add(closetMesh);
      }

      // PHÒNG TẮM MASTER & BỒN TẮM NẰM
      else if (sym === 'double_vanity' || sym === 'bathroom_set') {
        // Sàn đá Marble trắng
        const tileGeo = new THREE.PlaneGeometry(wM, dM);
        const tileMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1, metalness: 0.1 });
        const tileMesh = new THREE.Mesh(tileGeo, tileMat);
        tileMesh.rotation.x = -Math.PI / 2;
        tileMesh.position.set(pos.x, 0.02, pos.z);
        furnitureGroup.add(tileMesh);

        // Bồn tắm nằm sứ trắng
        const bathGeo = new THREE.CylinderGeometry(0.45, 0.4, 0.65, 32);
        bathGeo.scale(wM * 0.6, 1, dM * 0.5);
        const bathMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
        const bathMesh = new THREE.Mesh(bathGeo, bathMat);
        bathMesh.position.set(pos.x - 0.4, 0.325, pos.z);
        bathMesh.castShadow = true;
        furnitureGroup.add(bathMesh);
      }

      // CẦU THANG GỖ TAY VỊN KÍNH
      else if (sym === 'interior_stairs') {
        const steps = 8;
        const stepH = 2.8 / steps;
        const stepD = dM / steps;
        for (let s = 0; s < steps; s++) {
          const stepGeo = new THREE.BoxGeometry(wM, stepH, stepD);
          const stepMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.35 });
          const stepMesh = new THREE.Mesh(stepGeo, stepMat);
          stepMesh.position.set(pos.x, s * stepH + stepH / 2, pos.z - dM / 2 + s * stepD + stepD / 2);
          stepMesh.castShadow = true;
          furnitureGroup.add(stepMesh);
        }
      }

      // CÁC MÔ-ĐUN NỘI THẤT KHÁC
      else if (!['grass_patch', 'stone_path'].includes(sym)) {
        const hM = f.height3D || 0.85;
        const boxGeo = new THREE.BoxGeometry(wM, hM, dM);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.5 });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        boxMesh.position.set(pos.x, hM / 2, pos.z);
        boxMesh.castShadow = true;
        furnitureGroup.add(boxMesh);
      }
    });
    scene.add(furnitureGroup);

    // 8. ĐIỀU KHIỂN CAMERA (ORBIT / MOUSE INTERACTION)
    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 26, theta: Math.PI / 4, phi: Math.PI / 3.5 };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 1.2, 0);
    };
    updateCameraPos();

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;

      spherical.theta -= dx * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.1, spherical.phi - dy * 0.008));

      updateCameraPos();
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => isMouseDown = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(5, Math.min(60, spherical.radius + e.deltaY * 0.02));
      updateCameraPos();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // 9. ANIMATION RENDER LOOP (60 FPS)
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 10. CLEANUP KHI UNMOUNT
    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [board, sunHour, renderQuality, showRoof]);

  const handleExportAutoCAD = () => {
    downloadAutoCADDXF(board);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-900 font-sans">
      {/* Container WebGL Three.js */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* TOP HEADER CONTROLS (Phong cách Apple Glassmorphism) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
        {/* Nút Về Mặt Bằng 2D */}
        <button
          onClick={onExit3D}
          className="px-4 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg text-slate-800 font-bold text-xs flex items-center gap-2 hover:bg-white active:scale-95 transition pointer-events-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Về Mặt Bằng 2D</span>
        </button>

        {/* Thẻ chế độ Camera */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-white/10 flex items-center gap-2 pointer-events-auto">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Three.js WebGL Engine: <strong className="text-emerald-300">Phối Cảnh Orbit 360°</strong></span>
        </div>

        {/* Nút AI Render Studio & Xuất File */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onOpenAIRenderStudio && (
            <button
              onClick={onOpenAIRenderStudio}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-full shadow-lg shadow-purple-500/30 text-xs font-bold flex items-center gap-2 hover:opacity-95 active:scale-95 transition cursor-pointer border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>AI 3D Render Studio</span>
            </button>
          )}

          <button
            onClick={handleExportAutoCAD}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-full shadow-lg shadow-red-500/25 text-xs font-bold flex items-center gap-2 hover:opacity-95 active:scale-95 transition cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Xuất AutoCAD (.DXF)</span>
          </button>
        </div>
      </div>

      {/* FLOATING SUN LIGHT DOCK (Góc phải trên) */}
      <div className="absolute top-20 right-4 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-3.5 z-30 pointer-events-auto text-xs text-slate-800 w-60 space-y-2.5">
        <div className="flex items-center justify-between font-bold">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Sun className="w-4 h-4" />
            <span>Mô Phỏng Nắng & Bóng Đổ</span>
          </div>
          <span className="font-mono text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            {sunHour < 10 ? `0${sunHour}:00` : `${sunHour}:00`}
          </span>
        </div>

        <input
          type="range"
          min="6"
          max="18"
          step="1"
          value={sunHour}
          onChange={(e) => setSunHour(parseInt(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
          <span>06:00 (Sáng)</span>
          <span>12:00 (Trưa)</span>
          <span>18:00 (Tối)</span>
        </div>

        {/* Chế độ Render Chất Lượng */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Chất lượng:</span>
          <div className="flex items-center gap-1">
            {(['draft', 'high', 'realistic'] as const).map(q => (
              <button
                key={q}
                onClick={() => setRenderQuality(q)}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase transition cursor-pointer ${
                  renderQuality === q ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
