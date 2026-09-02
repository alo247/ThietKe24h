// src/components/IsometricView3D.tsx
// Động Cơ Chiếu 3D Cắt Lớp Cao Cấp (Photorealistic 3D Cutaway Floor Plan) & Xuất AutoCAD DXF

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Board, BoardItem, WallItem, GardenFurnitureItem, DoorWindowItem, IsometricAngle } from '../types';
import { downloadAutoCADDXF } from '../services/dxfExporter';
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
  FileCode,
  Sparkles
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

  // Vòng lặp Render 3D Canvas với chất lượng Photorealistic Cutaway
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
      // 11:00 - 14:00: Nắng chính ngọ rực rỡ studio
      bgGradient.addColorStop(0, '#f1f5f9');
      bgGradient.addColorStop(0.5, '#e2e8f0');
      bgGradient.addColorStop(1, '#cbd5e1');
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
    const sunNormalized = (sunHour - 6) / 12; // 0.0 -> 1.0
    const sunAzimuth = (sunNormalized - 0.5) * Math.PI * 0.85;
    const sunAltitude = Math.sin(sunNormalized * Math.PI);
    const shadowFactor = Math.max(0.3, (1 - sunAltitude) * 1.5);
    const shadowOffsetX = Math.sin(sunAzimuth) * shadowFactor * 45;
    const shadowOffsetY = Math.cos(sunAzimuth) * shadowFactor * 28;

    // 3. VẼ NỀN SÀN TỔNG THỂ (SÀN GỖ SỒI & GẠCH BAN CÔNG CHÂN THỰC)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    board.items.forEach(i => {
      minX = Math.min(minX, i.x);
      minY = Math.min(minY, i.y);
      maxX = Math.max(maxX, i.x + i.width);
      maxY = Math.max(maxY, i.y + i.height);
    });

    if (minX !== Infinity) {
      // Sàn Gỗ Sồi Ấm Áp Toàn Diện (Oak Hardwood Flooring)
      const pF0 = project3D(minX - 20, minY - 20, 0, boardCenter.x, boardCenter.y, width, height);
      const pF1 = project3D(maxX + 20, minY - 20, 0, boardCenter.x, boardCenter.y, width, height);
      const pF2 = project3D(maxX + 20, maxY + 20, 0, boardCenter.x, boardCenter.y, width, height);
      const pF3 = project3D(minX - 20, maxY + 20, 0, boardCenter.x, boardCenter.y, width, height);

      ctx.fillStyle = '#e8d5b5'; // Màu gỗ sồi sáng tự nhiên
      ctx.beginPath();
      ctx.moveTo(pF0.x, pF0.y);
      ctx.lineTo(pF1.x, pF1.y);
      ctx.lineTo(pF2.x, pF2.y);
      ctx.lineTo(pF3.x, pF3.y);
      ctx.closePath();
      ctx.fill();

      // Kẻ các đường vân nan gỗ sồi so le
      ctx.strokeStyle = 'rgba(168, 120, 60, 0.18)';
      ctx.lineWidth = 1;
      for (let gx = minX; gx <= maxX; gx += 25) {
        const pt1 = project3D(gx, minY - 20, 0, boardCenter.x, boardCenter.y, width, height);
        const pt2 = project3D(gx, maxY + 20, 0, boardCenter.x, boardCenter.y, width, height);
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }
    }

    // 4. VẼ ĐỔ BÓNG MỀM TRÊN MẶT ĐẤT (SOFT AMBIENT CAST SHADOWS)
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
        if (['tree_large', 'tree_pine', 'gazebo', 'patio_umbrella'].includes(g.symbolId)) {
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
      const isGroundA = a.type === 'garden_item' && ['grass_patch', 'stone_path', 'wooden_deck', 'rug'].includes((a as any).symbolId);
      const isGroundB = b.type === 'garden_item' && ['grass_patch', 'stone_path', 'wooden_deck', 'rug'].includes((b as any).symbolId);
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

    // 6. HÀM VẼ KHỐI 3D CẮT LỚP CAO CẤP (CUTAWAY 3D PRISM VỚI NẸP ĐỈNH ĐEN)
    const drawPhotorealisticBox = (
      x: number, 
      y: number, 
      w: number, 
      h: number, 
      heightZ: number, 
      colorTop: string, 
      colorLeft: string, 
      colorRight: string,
      baseZ = 0,
      isCutawayWall = false
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
      ctx.strokeStyle = isCutawayWall ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
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

      // Mặt nắp trên (Top Face) - Với tường cắt lớp, vẽ nẹp đen/xám sang trọng (Black Top Cap)
      ctx.fillStyle = isCutawayWall ? '#1e293b' : colorTop;
      ctx.beginPath();
      ctx.moveTo(p0Top.x, p0Top.y);
      ctx.lineTo(p1Top.x, p1Top.y);
      ctx.lineTo(p2Top.x, p2Top.y);
      ctx.lineTo(p3Top.x, p3Top.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isCutawayWall ? '#0f172a' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = isCutawayWall ? 1.5 : 1;
      ctx.stroke();
    };

    // 7. RENDER CHI TIẾT TỪNG VẬT THỂ VÀO PHỐI CẢNH 3D
    sortedItems.forEach((item) => {
      // 7.1. TƯỜNG NHÀ CẮT LỚP 3D (3D CUTAWAY WALLS)
      if (item.type === 'wall') {
        const wall = item as WallItem;
        const heightM = wall.wallHeight || (wall.isFence ? 1.8 : 2.8);
        const heightZ = heightM * PIXEL_PER_METER_3D;

        if (wall.isFence) {
          // Lan can kính hoặc tường rào
          drawPhotorealisticBox(
            wall.x, wall.y, wall.width, wall.height, heightZ * 0.5,
            'rgba(186, 230, 253, 0.6)', 'rgba(203, 213, 225, 0.8)', 'rgba(148, 163, 184, 0.8)'
          );
        } else {
          // Tường nhà chuẩn kiến trúc cắt lớp: Mặt trắng kem + Đỉnh đen
          drawPhotorealisticBox(
            wall.x, wall.y, wall.width, wall.height, heightZ,
            '#1e293b', '#f8fafc', '#e2e8f0', 0, true
          );

          // Nếu bật chế độ lợp mái ngói
          if (showRoof && wall.width > 50 && wall.height > 50) {
            drawPhotorealisticBox(
              wall.x - 10, wall.y - 10, wall.width + 20, wall.height + 20, 1.2 * PIXEL_PER_METER_3D,
              '#ea580c', '#c2410c', '#9a3412', heightZ
            );
          }
        }
      }

      // 7.2. CỬA ĐI, CỬA SỔ & VÁCH KÍNH BAN CÔNG LỚN (GLASS CURTAIN WALLS)
      else if (item.type === 'door_window') {
        const door = item as DoorWindowItem;
        const isWindow = door.subType === 'window';
        const isSliding = door.subType === 'sliding_door';
        const heightZ = (isWindow ? 1.4 : isSliding ? 2.4 : 2.2) * PIXEL_PER_METER_3D;
        const baseZ = isWindow ? 0.9 * PIXEL_PER_METER_3D : 0;

        if (isSliding || isWindow) {
          // Vách kính trượt trong suốt với khung nhôm xingfa đen
          drawPhotorealisticBox(
            door.x, door.y, door.width, door.height, heightZ,
            'rgba(186, 230, 253, 0.45)', 'rgba(14, 165, 233, 0.35)', 'rgba(2, 132, 199, 0.45)',
            baseZ
          );
        } else {
          // Cửa gỗ sồi tự nhiên
          drawPhotorealisticBox(
            door.x, door.y, door.width, door.height, heightZ,
            '#b45309', '#92400e', '#78350f', baseZ
          );
        }
      }

      // 7.3. CẢNH QUAN SÂN VƯỜN & NỘI THẤT 3D TINH XẢO
      else if (item.type === 'garden_item') {
        const g = item as GardenFurnitureItem;
        const symbolId = g.symbolId;

        // Sofa phòng khách chữ L + Thảm trải sàn + Bàn trà gỗ
        if (symbolId === 'living_sofa') {
          // 1. Thảm trải sàn dệt sợi xám/kem
          drawPhotorealisticBox(g.x - 15, g.y - 15, g.width + 30, g.height + 30, 2, '#e2e8f0', '#cbd5e1', '#94a3b8');
          // 2. Thân sofa chữ L bọc nỉ cao cấp
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.75 * PIXEL_PER_METER_3D, '#cbd5e1', '#94a3b8', '#64748b');
          // 3. Đệm tựa lưng & gối ôm nhấn màu cam/vàng
          drawPhotorealisticBox(g.x + 5, g.y + 5, g.width - 20, 15, 0.95 * PIXEL_PER_METER_3D, '#f59e0b', '#d97706', '#b45309');
          // 4. Bàn trà gỗ tự nhiên
          drawPhotorealisticBox(g.x + g.width * 0.3, g.y + g.height * 0.4, 40, 30, 0.4 * PIXEL_PER_METER_3D, '#d4a373', '#b08968', '#7f5539');
        }

        // Giường ngủ Master King Suite + Ga gối cao cấp + 2 Tủ đầu giường
        else if (symbolId === 'bed_double') {
          // 1. Thảm nỉ trải phòng ngủ
          drawPhotorealisticBox(g.x - 12, g.y - 12, g.width + 24, g.height + 24, 2, '#e2e8f0', '#cbd5e1', '#94a3b8');
          // 2. Khung giường gỗ & đệm trắng
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.55 * PIXEL_PER_METER_3D, '#ffffff', '#f1f5f9', '#e2e8f0');
          // 3. Chăn ga xanh Navy / Xám đậm gập đôi
          drawPhotorealisticBox(g.x, g.y + g.height * 0.3, g.width, g.height * 0.7, 0.6 * PIXEL_PER_METER_3D, '#1e3a8a', '#172554', '#1e293b');
          // 4. Cặp gối ngủ phồng
          drawPhotorealisticBox(g.x + 8, g.y + 6, 25, 18, 0.7 * PIXEL_PER_METER_3D, '#ffffff', '#e2e8f0', '#cbd5e1');
          drawPhotorealisticBox(g.x + g.width - 33, g.y + 6, 25, 18, 0.7 * PIXEL_PER_METER_3D, '#ffffff', '#e2e8f0', '#cbd5e1');
          // 5. Hai tủ đầu giường (Tab đầu giường)
          drawPhotorealisticBox(g.x - 18, g.y, 14, 18, 0.45 * PIXEL_PER_METER_3D, '#334155', '#1e293b', '#0f172a');
          drawPhotorealisticBox(g.x + g.width + 4, g.y, 14, 18, 0.45 * PIXEL_PER_METER_3D, '#334155', '#1e293b', '#0f172a');
        }

        // Bàn ăn gia đình 6 ghế
        else if (symbolId === 'dining_table') {
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.8 * PIXEL_PER_METER_3D, '#d4a373', '#b08968', '#7f5539');
        }

        // Tủ bếp hiện đại & Bồn rửa (Modern Kitchen)
        else if (symbolId === 'kitchen_counter') {
          // Tủ bếp dưới gỗ sồi/đen
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.88 * PIXEL_PER_METER_3D, '#7c2d12', '#451a03', '#451a03');
          // Mặt đá bếp Marble trắng
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.9 * PIXEL_PER_METER_3D, '#ffffff', '#e2e8f0', '#cbd5e1', 0.88 * PIXEL_PER_METER_3D);
        }

        // Thiết bị vệ sinh & Bồn tắm nằm (Bathroom Luxury)
        else if (symbolId === 'bathroom_set') {
          // Sàn đá Marble trắng vân mây
          drawPhotorealisticBox(g.x - 5, g.y - 5, g.width + 10, g.height + 10, 2, '#ffffff', '#f1f5f9', '#e2e8f0');
          // Bồn tắm nằm sứ trắng
          drawPhotorealisticBox(g.x + 5, g.y + 5, g.width * 0.6, g.height * 0.5, 0.65 * PIXEL_PER_METER_3D, '#f8fafc', '#e2e8f0', '#cbd5e1');
        }

        // Cây xanh nhiệt đới / Cây bàng / Cây cọ chậu gốm
        else if (symbolId === 'tree_large' || symbolId === 'tree_pine') {
          const trunkH = 1.2 * PIXEL_PER_METER_3D;
          const crownH = 3.6 * PIXEL_PER_METER_3D;
          const cx = g.x + g.width / 2;
          const cy = g.y + g.height / 2;

          // Chậu gốm nung / bồn cây vuông
          drawPhotorealisticBox(cx - 12, cy - 12, 24, 24, 0.5 * PIXEL_PER_METER_3D, '#78350f', '#451a03', '#451a03');
          // Thân cây gỗ
          drawPhotorealisticBox(cx - 5, cy - 5, 10, 10, trunkH, '#451a03', '#291002', '#291002', 0.5 * PIXEL_PER_METER_3D);
          // Tán lá xanh tươi phân tầng
          drawPhotorealisticBox(g.x + 10, g.y + 10, g.width - 20, g.height - 20, crownH * 0.6, '#4ade80', '#22c55e', '#16a34a', trunkH);
          drawPhotorealisticBox(g.x + 22, g.y + 22, g.width - 44, g.height - 44, crownH * 0.4, '#86efac', '#4ade80', '#22c55e', trunkH + crownH * 0.6);
        }

        // Hồ cá Koi nghệ thuật
        else if (symbolId === 'koi_pond') {
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 10, '#0284c7', '#0369a1', '#075985');
          const centerPt = project3D(g.x + g.width / 2, g.y + g.height / 2, 10, boardCenter.x, boardCenter.y, width, height);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(centerPt.x, centerPt.y, (g.width / 4) * zoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hồ bơi ngoài trời
        else if (symbolId === 'swimming_pool') {
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 14, '#38bdf8', '#0284c7', '#0369a1');
        }

        // Chòi nghỉ sân vườn (Gazebo)
        else if (symbolId === 'gazebo') {
          const postH = 2.6 * PIXEL_PER_METER_3D;
          const roofH = 1.2 * PIXEL_PER_METER_3D;
          drawPhotorealisticBox(g.x + 6, g.y + 6, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawPhotorealisticBox(g.x + g.width - 16, g.y + 6, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawPhotorealisticBox(g.x + 6, g.y + g.height - 16, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawPhotorealisticBox(g.x + g.width - 16, g.y + g.height - 16, 10, 10, postH, '#78350f', '#451a03', '#451a03');
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, roofH, '#b45309', '#92400e', '#78350f', postH);
        }

        // Bàn cafe sân vườn + Dù che nắng kẻ sọc (Patio Umbrella)
        else if (symbolId === 'coffee_table_outdoor' || symbolId === 'patio_table') {
          const cx = g.x + g.width / 2;
          const cy = g.y + g.height / 2;
          // Bàn gỗ
          drawPhotorealisticBox(cx - 15, cy - 15, 30, 30, 0.75 * PIXEL_PER_METER_3D, '#d4a373', '#b08968', '#7f5539');
          // Cán dù kim loại
          drawPhotorealisticBox(cx - 3, cy - 3, 6, 6, 2.8 * PIXEL_PER_METER_3D, '#334155', '#1e293b', '#0f172a');
          // Tán dù kẻ sọc xanh trắng xòe rộng
          drawPhotorealisticBox(g.x - 10, g.y - 10, g.width + 20, g.height + 20, 0.6 * PIXEL_PER_METER_3D, '#0284c7', '#0369a1', '#075985', 2.8 * PIXEL_PER_METER_3D);
        }

        // Tủ quần áo âm tường & Phòng thay đồ (Walk-in Closet)
        else if (symbolId === 'walk_in_closet') {
          // Thân tủ gỗ óc chó / đen
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 2.2 * PIXEL_PER_METER_3D, '#1e293b', '#0f172a', '#020617');
          // Giá treo quần áo trắng/xám bên trong
          drawPhotorealisticBox(g.x + 8, g.y + 4, g.width - 16, g.height - 8, 1.4 * PIXEL_PER_METER_3D, '#f1f5f9', '#cbd5e1', '#94a3b8', 0.6 * PIXEL_PER_METER_3D);
        }

        // Kệ TV & Tủ sách trang trí (TV Wall Unit)
        else if (symbolId === 'tv_unit') {
          // Kệ gỗ sồi treo tường
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.45 * PIXEL_PER_METER_3D, '#78350f', '#451a03', '#451a03');
          // Màn hình Tivi siêu mỏng đen bóng
          drawPhotorealisticBox(g.x + g.width * 0.2, g.y + 2, g.width * 0.6, 6, 1.1 * PIXEL_PER_METER_3D, '#09090b', '#000000', '#000000', 0.55 * PIXEL_PER_METER_3D);
        }

        // Bàn làm việc & Bàn trang điểm (Work Desk)
        else if (symbolId === 'work_desk') {
          // Mặt bàn gỗ sồi
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.75 * PIXEL_PER_METER_3D, '#d4a373', '#b08968', '#7f5539');
          // Ghế làm việc tựa lưng
          drawPhotorealisticBox(g.x + g.width * 0.3, g.y + g.height + 4, 25, 25, 0.85 * PIXEL_PER_METER_3D, '#334155', '#1e293b', '#0f172a');
        }

        // Cầu thang gỗ nội thất tay vịn kính (Interior Stairs)
        else if (symbolId === 'interior_stairs') {
          const stepCount = 6;
          const stepH = (2.6 * PIXEL_PER_METER_3D) / stepCount;
          const stepDepth = g.height / stepCount;
          for (let s = 0; s < stepCount; s++) {
            drawPhotorealisticBox(
              g.x, g.y + s * stepDepth, g.width, stepDepth, stepH,
              '#d4a373', '#b08968', '#7f5539', s * stepH
            );
          }
          // Lan can kính dọc cầu thang
          drawPhotorealisticBox(
            g.x + g.width - 4, g.y, 4, g.height, 0.9 * PIXEL_PER_METER_3D,
            'rgba(186, 230, 253, 0.5)', 'rgba(14, 165, 233, 0.4)', 'rgba(2, 132, 199, 0.5)',
            1.2 * PIXEL_PER_METER_3D
          );
        }

        // Bàn Lavabo đôi Marble (Double Vanity)
        else if (symbolId === 'double_vanity') {
          // Bàn đá Marble trắng
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.85 * PIXEL_PER_METER_3D, '#f8fafc', '#e2e8f0', '#cbd5e1');
          // 2 Chậu rửa âm bàn sứ trắng
          drawPhotorealisticBox(g.x + 8, g.y + 6, 26, 20, 0.1 * PIXEL_PER_METER_3D, '#0284c7', '#0369a1', '#075985', 0.85 * PIXEL_PER_METER_3D);
          drawPhotorealisticBox(g.x + g.width - 34, g.y + 6, 26, 20, 0.1 * PIXEL_PER_METER_3D, '#0284c7', '#0369a1', '#075985', 0.85 * PIXEL_PER_METER_3D);
        }

        // Cabin tắm đứng vách kính (Glass Shower)
        else if (symbolId === 'glass_shower') {
          // Vách kính tắm đứng trong suốt
          drawPhotorealisticBox(
            g.x, g.y, g.width, g.height, 2.2 * PIXEL_PER_METER_3D,
            'rgba(186, 230, 253, 0.4)', 'rgba(14, 165, 233, 0.3)', 'rgba(2, 132, 199, 0.4)'
          );
          // Cây sen tắm đứng chrome
          drawPhotorealisticBox(g.x + g.width / 2 - 3, g.y + 4, 6, 6, 2.1 * PIXEL_PER_METER_3D, '#94a3b8', '#64748b', '#475569');
        }

        // Ghế nằm tắm nắng ban công (Lounge Sunbed)
        else if (symbolId === 'lounge_sunbed') {
          // Khung gỗ Teak
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 0.3 * PIXEL_PER_METER_3D, '#78350f', '#451a03', '#451a03');
          // Đệm nằm trắng kem + Gối đầu
          drawPhotorealisticBox(g.x + 2, g.y + 2, g.width - 4, g.height - 4, 0.2 * PIXEL_PER_METER_3D, '#f8fafc', '#e2e8f0', '#cbd5e1', 0.3 * PIXEL_PER_METER_3D);
          drawPhotorealisticBox(g.x + 4, g.y + 4, g.width - 8, 20, 0.15 * PIXEL_PER_METER_3D, '#38bdf8', '#0284c7', '#0369a1', 0.5 * PIXEL_PER_METER_3D);
        }

        // Giàn Pergola che nắng sân thượng (Terrace Pergola)
        else if (symbolId === 'terrace_pergola') {
          const postH = 2.6 * PIXEL_PER_METER_3D;
          // 4 Cột gỗ chịu lực
          drawPhotorealisticBox(g.x + 4, g.y + 4, 8, 8, postH, '#451a03', '#291002', '#291002');
          drawPhotorealisticBox(g.x + g.width - 12, g.y + 4, 8, 8, postH, '#451a03', '#291002', '#291002');
          drawPhotorealisticBox(g.x + 4, g.y + g.height - 12, 8, 8, postH, '#451a03', '#291002', '#291002');
          drawPhotorealisticBox(g.x + g.width - 12, g.y + g.height - 12, 8, 8, postH, '#451a03', '#291002', '#291002');
          // Các thanh nan gỗ che nắng phía trên
          for (let lx = g.x; lx <= g.x + g.width; lx += 20) {
            drawPhotorealisticBox(lx, g.y, 6, g.height, 6, '#78350f', '#451a03', '#451a03', postH);
          }
        }

        // Chậu cây cọ / Cây bàng nội thất (Indoor Potted Palm)
        else if (symbolId === 'indoor_potted_palm') {
          const cx = g.x + g.width / 2;
          const cy = g.y + g.height / 2;
          // Chậu sứ trắng / gốm
          drawPhotorealisticBox(cx - 10, cy - 10, 20, 20, 0.6 * PIXEL_PER_METER_3D, '#ffffff', '#e2e8f0', '#cbd5e1');
          // Tán lá cọ xanh tươi vươn rộng
          drawPhotorealisticBox(cx - 16, cy - 16, 32, 32, 1.4 * PIXEL_PER_METER_3D, '#22c55e', '#16a34a', '#15803d', 0.6 * PIXEL_PER_METER_3D);
        }

        // Thảm nỉ trải sàn dệt sợi (Living Rug)
        else if (symbolId === 'living_rug') {
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, 2, '#cbd5e1', '#94a3b8', '#64748b');
        }

        // Mặc định các đồ nội thất khác
        else {
          const h3D = (g.height3D || 0.8) * PIXEL_PER_METER_3D;
          drawPhotorealisticBox(g.x, g.y, g.width, g.height, h3D, '#93c5fd', '#60a5fa', '#3b82f6');
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
    link.download = `${board.name}_PhoiCanh3D_Cutaway.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleExportAutoCAD = () => {
    downloadAutoCADDXF(board);
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
        <div className="bg-slate-900/85 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-white/10 flex items-center gap-2 pointer-events-auto">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Phối Cảnh 3D Cắt Lớp: <strong className="text-emerald-300">{directionNames[rotationAngle]}</strong></span>
        </div>

        {/* Cụm Nút Xuất File: AutoCAD .DXF & Lưu Ảnh 3D */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Nút Xuất File AutoCAD DXF */}
          <button
            onClick={handleExportAutoCAD}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-full shadow-lg shadow-red-500/25 text-xs font-bold flex items-center gap-2 hover:opacity-95 active:scale-95 transition cursor-pointer"
            title="Xuất file bản vẽ AutoCAD (.DXF) chuẩn thi công"
          >
            <FileCode className="w-4 h-4" />
            <span>Xuất AutoCAD (.DXF)</span>
          </button>

          {/* Nút Xuất ảnh 3D PNG */}
          <button
            onClick={handleExport3DImage}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 text-xs font-semibold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Lưu Ảnh 3D</span>
          </button>
        </div>
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
