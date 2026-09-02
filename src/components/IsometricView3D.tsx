// src/components/IsometricView3D.tsx
// Động cơ chiếu 3D Isometric với Mô Phỏng Ánh Sáng Mặt Trời Theo Giờ (Sunlight & Soft Shadows)

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Board, BoardItem, WallItem, GardenFurnitureItem, DoorWindowItem, IsometricAngle } from '../types';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowLeft, 
  Download, 
  Compass, 
  Layers, 
  Eye, 
  Sun,
  Sunrise,
  Sunset,
  Moon
} from 'lucide-react';
import { motion } from 'motion/react';

interface IsometricView3DProps {
  board: Board;
  onExit3D: () => void;
}

export default function IsometricView3D({ board, onExit3D }: IsometricView3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trạng thái Camera 3D: Góc xoay, Thu phóng và Tọa độ Pan
  const [rotationAngle, setRotationAngle] = useState<IsometricAngle>(0);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Mô phỏng ánh sáng mặt trời theo giờ (từ 6h sáng đến 18h tối)
  const [sunHour, setSunHour] = useState(14); // 14:00 (2h chiều) mặc định
  const [showRoof, setShowRoof] = useState(false); // Chế độ lợp mái ngói 3D
  const [wallHeightScale, setWallHeightScale] = useState(1.0);

  // Quy đổi kích thước thực: 50px trong 2D = 1m = 40px chiều cao trong 3D
  const PIXEL_PER_METER_3D = 40;

  // Tính toán tâm của toàn bộ dự án để căn giữa camera
  const boardCenter = useMemo(() => {
    if (board.items.length === 0) return { x: 400, y: 400 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    board.items.forEach(item => {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + item.width);
      maxY = Math.max(maxY, item.y + item.height);
    });
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    };
  }, [board.items]);

  // Thuật toán chiếu tọa độ 2D + Cao độ Z sang Tọa độ 3D Isometric
  const project3D = (x: number, y: number, z: number, centerX: number, centerY: number, canvasW: number, canvasH: number) => {
    let dx = x - centerX;
    let dy = y - centerY;

    if (rotationAngle === 90) {
      const temp = dx;
      dx = -dy;
      dy = temp;
    } else if (rotationAngle === 180) {
      dx = -dx;
      dy = -dy;
    } else if (rotationAngle === 270) {
      const temp = dx;
      dx = dy;
      dy = -temp;
    }

    const isoX = (dx - dy) * 0.866025 * zoom; // cos(30°) ≈ 0.866
    const isoY = ((dx + dy) * 0.5 - z * wallHeightScale) * zoom; // sin(30°) = 0.5

    return {
      x: canvasW / 2 + isoX + pan.x,
      y: canvasH / 2 + isoY + pan.y
    };
  };

  // Vòng lặp Render 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    // 1. TÍNH TOÁN BẦU TRỜI & ÁNH SÁNG THEO GIỜ TRONG NGÀY
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (sunHour <= 7) {
      // 06:00 - 07:00: Bình minh vàng cam dịu
      bgGradient.addColorStop(0, '#fdba74');
      bgGradient.addColorStop(0.6, '#fed7aa');
      bgGradient.addColorStop(1, '#e2e8f0');
    } else if (sunHour <= 10) {
      // 08:00 - 10:00: Nắng sáng trong trẻo
      bgGradient.addColorStop(0, '#bae6fd');
      bgGradient.addColorStop(0.7, '#e0f2fe');
      bgGradient.addColorStop(1, '#f1f5f9');
    } else if (sunHour <= 14) {
      // 11:00 - 14:00: Nắng chính ngọ rực rỡ
      bgGradient.addColorStop(0, '#7dd3fc');
      bgGradient.addColorStop(0.7, '#bae6fd');
      bgGradient.addColorStop(1, '#e2e8f0');
    } else if (sunHour <= 16) {
      // 15:00 - 16:00: Nắng chiều nhẹ
      bgGradient.addColorStop(0, '#93c5fd');
      bgGradient.addColorStop(0.7, '#fef08a');
      bgGradient.addColorStop(1, '#cbd5e1');
    } else {
      // 17:00 - 18:00: Hoàng hôn rực rỡ
      bgGradient.addColorStop(0, '#f97316');
      bgGradient.addColorStop(0.4, '#fb923c');
      bgGradient.addColorStop(0.8, '#c084fc');
      bgGradient.addColorStop(1, '#334155');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. TÍNH VECTOR ĐỔ BÓNG MẶT TRỜI
    // Góc chiếu bóng phụ thuộc vào giờ trong ngày (Mặt trời mọc ở Đông -> lặn ở Tây)
    const sunNormalized = (sunHour - 6) / 12; // 0.0 -> 1.0
    const sunAzimuth = (sunNormalized - 0.5) * Math.PI * 0.85; // Góc xoay mặt trời
    const sunAltitude = Math.sin(sunNormalized * Math.PI);      // Độ cao mặt trời (cao nhất lúc 12h)
    const shadowFactor = Math.max(0.3, (1 - sunAltitude) * 1.5);
    const shadowOffsetX = Math.sin(sunAzimuth) * shadowFactor * 40;
    const shadowOffsetY = Math.cos(sunAzimuth) * shadowFactor * 25;

    // 3. VẼ LƯỚI MẶT ĐẤT ISOMETRIC
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const gridRange = 12;
    for (let i = -gridRange; i <= gridRange; i++) {
      const p1 = project3D(boardCenter.x + i * gridSize, boardCenter.y - gridRange * gridSize, 0, boardCenter.x, boardCenter.y, width, height);
      const p2 = project3D(boardCenter.x + i * gridSize, boardCenter.y + gridRange * gridSize, 0, boardCenter.x, boardCenter.y, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = project3D(boardCenter.x - gridRange * gridSize, boardCenter.y + i * gridSize, 0, boardCenter.x, boardCenter.y, width, height);
      const p4 = project3D(boardCenter.x + gridRange * gridSize, boardCenter.y + i * gridSize, 0, boardCenter.x, boardCenter.y, width, height);
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // 4. VẼ ĐỔ BÓNG MỀM TRÊN MẶT ĐẤT (SOFT CAST SHADOWS)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    board.items.forEach(item => {
      if (item.type === 'wall') {
        const wall = item as WallItem;
        const heightM = wall.wallHeight || (wall.isFence ? 1.8 : 3.0);
        const p1 = project3D(wall.x, wall.y, 0, boardCenter.x, boardCenter.y, width, height);
        const p2 = project3D(wall.x + wall.width, wall.y + wall.height, 0, boardCenter.x, boardCenter.y, width, height);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p2.x + shadowOffsetX * zoom * (heightM / 3), p2.y + shadowOffsetY * zoom * (heightM / 3));
        ctx.lineTo(p1.x + shadowOffsetX * zoom * (heightM / 3), p1.y + shadowOffsetY * zoom * (heightM / 3));
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'garden_item') {
        const g = item as GardenFurnitureItem;
        if (['tree_large', 'tree_pine', 'gazebo'].includes(g.symbolId)) {
          const centerPt = project3D(g.x + g.width / 2, g.y + g.height / 2, 0, boardCenter.x, boardCenter.y, width, height);
          ctx.beginPath();
          ctx.ellipse(
            centerPt.x + shadowOffsetX * zoom * 0.8,
            centerPt.y + shadowOffsetY * zoom * 0.8,
            (g.width / 2.2) * zoom * (1 + shadowFactor * 0.3),
            (g.height / 3.5) * zoom,
            sunAzimuth,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    });

    // 5. PHÂN LOẠI VÀ SẮP XẾP CHIỀU SÂU (DEPTH SORTING)
    const sortedItems = [...board.items].sort((a, b) => {
      const isGroundA = a.type === 'garden_item' && ['grass_patch', 'stone_path', 'wooden_deck'].includes((a as any).symbolId);
      const isGroundB = b.type === 'garden_item' && ['grass_patch', 'stone_path', 'wooden_deck'].includes((b as any).symbolId);
      if (isGroundA && !isGroundB) return -1;
      if (!isGroundA && isGroundB) return 1;

      let depthA = a.x + a.y;
      let depthB = b.x + b.y;
      if (rotationAngle === 90) {
        depthA = -a.x + a.y;
        depthB = -b.x + b.y;
      } else if (rotationAngle === 180) {
        depthA = -a.x - a.y;
        depthB = -b.x - b.y;
      } else if (rotationAngle === 270) {
        depthA = a.x - a.y;
        depthB = b.x - b.y;
      }
      return depthA - depthB;
    });

    // 6. HÀM VẼ KHỐI HỘP 3D ISOMETRIC
    const drawIsometricBox = (
      x: number, 
      y: number, 
      w: number, 
      h: number, 
      heightZ: number, 
      colorTop: string, 
      colorLeft: string, 
      colorRight: string,
      baseZ = 0
    ) => {
      const p0 = project3D(x, y, baseZ, boardCenter.x, boardCenter.y, width, height);
      const p1 = project3D(x + w, y, baseZ, boardCenter.x, boardCenter.y, width, height);
      const p2 = project3D(x + w, y + h, baseZ, boardCenter.x, boardCenter.y, width, height);
      const p3 = project3D(x, y + h, baseZ, boardCenter.x, boardCenter.y, width, height);

      const p0Top = project3D(x, y, baseZ + heightZ, boardCenter.x, boardCenter.y, width, height);
      const p1Top = project3D(x + w, y, baseZ + heightZ, boardCenter.x, boardCenter.y, width, height);
      const p2Top = project3D(x + w, y + h, baseZ + heightZ, boardCenter.x, boardCenter.y, width, height);
      const p3Top = project3D(x, y + h, baseZ + heightZ, boardCenter.x, boardCenter.y, width, height);

      // Mặt trái (Left Face)
      ctx.fillStyle = colorLeft;
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p3Top.x, p3Top.y);
      ctx.lineTo(p2Top.x, p2Top.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.stroke();

      // Mặt phải (Right Face)
      ctx.fillStyle = colorRight;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2Top.x, p2Top.y);
      ctx.lineTo(p1Top.x, p1Top.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mặt nắp trên (Top Face)
      ctx.fillStyle = colorTop;
      ctx.beginPath();
      ctx.moveTo(p0Top.x, p0Top.y);
      ctx.lineTo(p1Top.x, p1Top.y);
      ctx.lineTo(p2Top.x, p2Top.y);
      ctx.lineTo(p3Top.x, p3Top.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // 7. RENDER CHI TIẾT TỪNG VẬT THỂ VÀO 3D
    sortedItems.forEach((item) => {
      // 7.1. TƯỜNG NHÀ & TƯỜNG RÀO
      if (item.type === 'wall') {
        const wall = item as WallItem;
        const heightM = wall.wallHeight || (wall.isFence ? 1.8 : 3.0);
        const heightZ = heightM * PIXEL_PER_METER_3D;

        if (wall.isFence) {
          drawIsometricBox(
            wall.x, wall.y, wall.width, wall.height, heightZ * 0.6,
            '#e2e8f0', '#cbd5e1', '#94a3b8'
          );
        } else {
          drawIsometricBox(
            wall.x, wall.y, wall.width, wall.height, heightZ,
            '#ffffff', '#e2e8f0', '#cbd5e1'
          );

          // Nếu bật chế độ lợp mái ngói (Roof Mode)
          if (showRoof && wall.width > 50 && wall.height > 50) {
            drawIsometricBox(
              wall.x - 10, wall.y - 10, wall.width + 20, wall.height + 20, 1.2 * PIXEL_PER_METER_3D,
              '#ea580c', '#c2410c', '#9a3412', heightZ
            );
          }
        }
      }

      // 7.2. CỬA ĐI & CỬA SỔ
      else if (item.type === 'door_window') {
        const door = item as DoorWindowItem;
        const isWindow = door.subType === 'window';
        const heightZ = (isWindow ? 1.4 : 2.2) * PIXEL_PER_METER_3D;
        const baseZ = isWindow ? 0.9 * PIXEL_PER_METER_3D : 0;

        drawIsometricBox(
          door.x, door.y, door.width, door.height, heightZ,
          isWindow ? '#38bdf8' : '#d97706',
          isWindow ? '#0284c7' : '#b45309',
          isWindow ? '#0369a1' : '#92400e',
          baseZ
        );
      }

      // 7.3. CẢNH QUAN SÂN VƯỜN & NỘI THẤT
      else if (item.type === 'garden_item') {
        const g = item as GardenFurnitureItem;
        const symbolId = g.symbolId;

        // Cây bóng mát lớn
        if (symbolId === 'tree_large') {
          const trunkH = 1.2 * PIXEL_PER_METER_3D;
          const crownH = 3.8 * PIXEL_PER_METER_3D;
          const cx = g.x + g.width / 2;
          const cy = g.y + g.height / 2;

          drawIsometricBox(cx - 6, cy - 6, 12, 12, trunkH, '#78350f', '#451a03', '#451a03');
          drawIsometricBox(g.x + 10, g.y + 10, g.width - 20, g.height - 20, crownH * 0.6, '#4ade80', '#22c55e', '#16a34a', trunkH);
          drawIsometricBox(g.x + 24, g.y + 24, g.width - 48, g.height - 48, crownH * 0.4, '#86efac', '#4ade80', '#22c55e', trunkH + crownH * 0.6);
        }

        // Cây tùng lá kim
        else if (symbolId === 'tree_pine') {
          const trunkH = 0.8 * PIXEL_PER_METER_3D;
          const crownH = 3.2 * PIXEL_PER_METER_3D;
          const cx = g.x + g.width / 2;
          const cy = g.y + g.height / 2;

          drawIsometricBox(cx - 4, cy - 4, 8, 8, trunkH, '#78350f', '#451a03', '#451a03');
          drawIsometricBox(g.x + 8, g.y + 8, g.width - 16, g.height - 16, crownH * 0.5, '#16a34a', '#15803d', '#166534', trunkH);
          drawIsometricBox(g.x + 18, g.y + 18, g.width - 36, g.height - 36, crownH * 0.5, '#22c55e', '#16a34a', '#15803d', trunkH + crownH * 0.5);
        }

        // Hồ cá Koi
        else if (symbolId === 'koi_pond') {
          drawIsometricBox(g.x, g.y, g.width, g.height, 8, '#0284c7', '#0369a1', '#075985');
          const centerPt = project3D(g.x + g.width / 2, g.y + g.height / 2, 8, boardCenter.x, boardCenter.y, width, height);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(centerPt.x, centerPt.y, (g.width / 4) * zoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hồ bơi ngoài trời
        else if (symbolId === 'swimming_pool') {
          drawIsometricBox(g.x, g.y, g.width, g.height, 12, '#38bdf8', '#0284c7', '#0369a1');
        }

        // Chòi nghỉ sân vườn (Gazebo)
        else if (symbolId === 'gazebo') {
          const postH = 2.6 * PIXEL_PER_METER_3D;
          const roofH = 1.2 * PIXEL_PER_METER_3D;
          drawIsometricBox(g.x + 6, g.y + 6, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawIsometricBox(g.x + g.width - 16, g.y + 6, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawIsometricBox(g.x + 6, g.y + g.height - 16, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawIsometricBox(g.x + g.width - 16, g.y + g.height - 16, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawIsometricBox(g.x, g.y, g.width, g.height, roofH, '#b45309', '#92400e', '#78350f', postH);
        }

        // Thảm cỏ xanh
        else if (symbolId === 'grass_patch') {
          drawIsometricBox(g.x, g.y, g.width, g.height, 2, '#86efac', '#4ade80', '#22c55e');
        }

        // Lối đi đá sỏi
        else if (symbolId === 'stone_path') {
          drawIsometricBox(g.x, g.y, g.width, g.height, 4, '#cbd5e1', '#94a3b8', '#64748b');
        }

        // Sofa phòng khách
        else if (symbolId === 'living_sofa') {
          drawIsometricBox(g.x, g.y, g.width, g.height, 0.85 * PIXEL_PER_METER_3D, '#818cf8', '#6366f1', '#4f46e5');
        }

        // Giường Master King
        else if (symbolId === 'bed_double') {
          drawIsometricBox(g.x, g.y, g.width, g.height, 0.65 * PIXEL_PER_METER_3D, '#f472b6', '#ec4899', '#db2777');
        }

        // Bàn ăn / Tủ bếp
        else if (symbolId === 'dining_table' || symbolId === 'kitchen_counter') {
          drawIsometricBox(g.x, g.y, g.width, g.height, 0.85 * PIXEL_PER_METER_3D, '#fbbf24', '#f59e0b', '#d97706');
        }

        // Mặc định đồ nội thất khác
        else {
          const h3D = (g.height3D || 0.8) * PIXEL_PER_METER_3D;
          drawIsometricBox(g.x, g.y, g.width, g.height, h3D, '#93c5fd', '#60a5fa', '#3b82f6');
        }
      }
    });

  }, [board, rotationAngle, zoom, pan, wallHeightScale, showRoof, boardCenter, sunHour]);

  // Xử lý kéo xoay/pan camera 3D
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleRotateClockwise = () => {
    const nextAngle: Record<IsometricAngle, IsometricAngle> = {
      0: 90,
      90: 180,
      180: 270,
      270: 0
    };
    setRotationAngle(nextAngle[rotationAngle]);
  };

  const handleExport3DImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${board.name}_PhoiCanh3D.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const directionNames: Record<IsometricAngle, string> = {
    0: 'Hướng Đông Nam',
    90: 'Hướng Tây Nam',
    180: 'Hướng Tây Bắc',
    270: 'Hướng Đông Bắc'
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-900 font-sans">
      {/* 1. Canvas 3D Isometric chính */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* 2. Top Header Bar - Phong cách Apple Glassmorphism */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
        {/* Nút quay lại chế độ Mặt Bằng 2D */}
        <button
          onClick={onExit3D}
          className="px-4 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg text-slate-800 font-semibold text-xs flex items-center gap-2 hover:bg-white active:scale-95 transition pointer-events-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Về Mặt Bằng 2D</span>
        </button>

        {/* Thẻ hiển thị hướng nhìn 3D hiện tại */}
        <div className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-white/10 flex items-center gap-2 pointer-events-auto">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Phối Cảnh 3D: <strong className="text-emerald-300">{directionNames[rotationAngle]}</strong></span>
        </div>

        {/* Nút Xuất ảnh 3D PNG */}
        <button
          onClick={handleExport3DImage}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 text-xs font-semibold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition pointer-events-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Lưu Ảnh 3D</span>
        </button>
      </div>

      {/* 3. Floating Sun Light & Time Slider Dock - Bên góc phải trên */}
      <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-3 z-30 pointer-events-auto text-xs text-slate-800 w-56 space-y-2">
        <div className="flex items-center justify-between font-bold">
          <div className="flex items-center gap-1.5 text-amber-600">
            {sunHour <= 7 ? <Sunrise className="w-4 h-4" /> : sunHour >= 17 ? <Sunset className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>Ánh Nắng Mặt Trời</span>
          </div>
          <span className="font-mono text-xs bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
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

        <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
          <span>06:00 (Sáng)</span>
          <span>12:00 (Trưa)</span>
          <span>18:00 (Tối)</span>
        </div>
      </div>

      {/* 4. Floating Control Island - Bộ điều khiển xoay & góc nhìn ở đáy màn hình */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xl p-1.5 rounded-full flex items-center gap-2 z-30 pointer-events-auto text-xs text-slate-700">
        {/* Nút Xoay 4 hướng */}
        <button
          onClick={handleRotateClockwise}
          className="p-2.5 hover:bg-slate-100 rounded-full text-slate-800 transition active:scale-90 flex items-center gap-1.5 font-bold cursor-pointer"
          title="Xoay góc nhìn 90°"
        >
          <RotateCw className="w-4 h-4 text-blue-600" />
          <span className="text-[11px]">Xoay 90°</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-200" />

        {/* Nút bật/tắt Mái Ngói 3D */}
        <button
          onClick={() => setShowRoof(!showRoof)}
          className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
            showRoof ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Bật/tắt mái nhà 3D"
        >
          <span>🏠</span>
          <span>Mái ngói</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-200" />

        {/* Thu phóng Zoom */}
        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="font-mono font-bold text-slate-600 text-[11px] min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200" />

        {/* Nút Căn giữa Camera (Reset) */}
        <button
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1.0);
          }}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition cursor-pointer"
          title="Căn giữa mô hình"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
