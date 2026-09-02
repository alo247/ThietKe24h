// src/services/dxfExporter.ts
// Động Cơ Xuất Bản Vẽ Kỹ Thuật AutoCAD (.DXF) Chuẩn Công Nghiệp Cho Thi Công Công Trình

import { Board, WallItem, DoorWindowItem, GardenFurnitureItem, DimensionItem } from '../types';

/**
 * Xuất bản vẽ hiện tại thành file AutoCAD DXF (AutoCAD R12/2000 ASCII Format)
 * Tương thích 100% với Autodesk AutoCAD, SketchUp, Revit, ArchiCAD, LibreCAD
 */
export function generateAutoCADDXF(board: Board): string {
  const lines: string[] = [];

  // 1. DXF HEADER SECTION
  lines.push('0', 'SECTION');
  lines.push('2', 'HEADER');
  lines.push('9', '$ACADVER');
  lines.push('1', 'AC1009'); // AutoCAD R12 DXF format - tương thích mọi phần mềm CAD
  lines.push('9', '$INSUNITS');
  lines.push('70', '6');     // Đơn vị: Mét (Meters)
  lines.push('0', 'ENDSEC');

  // 2. DXF TABLES SECTION (Định nghĩa Layer & Màu sắc chuẩn kỹ thuật xây dựng)
  lines.push('0', 'SECTION');
  lines.push('2', 'TABLES');
  lines.push('0', 'TABLE');
  lines.push('2', 'LAYER');
  lines.push('70', '6');

  // Định nghĩa các Layer CAD thi công
  const layers = [
    { name: '0_TUONG_XAY', color: 7, desc: 'Tường gạch và bê tông chịu lực' }, // Màu 7: Trắng/Đen (Nét đậm)
    { name: '0_CUA_DI_CUA_SO', color: 4, desc: 'Cửa đi và cửa sổ kính' },       // Màu 4: Cyan
    { name: '0_NOI_THAT', color: 1, desc: 'Bố trí nội thất phòng' },           // Màu 1: Đỏ
    { name: '0_CANH_QUAN', color: 3, desc: 'Cảnh quan sân vườn & hồ nước' },    // Màu 3: Xanh lá
    { name: '0_KICH_THUOC', color: 2, desc: 'Đường gióng kích thước Dims' },   // Màu 2: Vàng
    { name: '0_GHI_CHU', color: 7, desc: 'Tên phòng và diện tích m2' }          // Màu 7: Trắng
  ];

  layers.forEach(ly => {
    lines.push('0', 'LAYER');
    lines.push('2', ly.name);
    lines.push('70', '0');
    lines.push('62', ly.color.toString()); // Mã màu ACI (AutoCAD Color Index)
    lines.push('6', 'CONTINUOUS');
  });

  lines.push('0', 'ENDTAB');
  lines.push('0', 'ENDSEC');

  // 3. DXF ENTITIES SECTION (Chuyển đổi toàn bộ đối tượng Canvas thành CAD Lines & Text)
  lines.push('0', 'SECTION');
  lines.push('2', 'ENTITIES');

  // Tỷ lệ quy đổi: 50px trên Canvas = 1.0 Mét (1000mm) trong bản vẽ CAD
  // Trục Y trong CAD hướng lên trên, nên toạ độ Y_cad = -y_canvas
  const SCALE = 1.0 / 50.0; // 50px = 1m

  board.items.forEach(item => {
    // 3.1. XUẤT TƯỜNG XÂY (WALLS)
    if (item.type === 'wall') {
      const wall = item as WallItem;
      const x1 = wall.x * SCALE;
      const y1 = -wall.y * SCALE;
      const x2 = (wall.x + wall.width) * SCALE;
      const y2 = -(wall.y + wall.height) * SCALE;

      // Đường viền tường
      lines.push('0', 'LINE');
      lines.push('8', '0_TUONG_XAY');
      lines.push('10', x1.toFixed(4));
      lines.push('20', y1.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', x2.toFixed(4));
      lines.push('21', y1.toFixed(4));
      lines.push('31', '0.0');

      lines.push('0', 'LINE');
      lines.push('8', '0_TUONG_XAY');
      lines.push('10', x2.toFixed(4));
      lines.push('20', y1.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', x2.toFixed(4));
      lines.push('21', y2.toFixed(4));
      lines.push('31', '0.0');

      lines.push('0', 'LINE');
      lines.push('8', '0_TUONG_XAY');
      lines.push('10', x2.toFixed(4));
      lines.push('20', y2.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', x1.toFixed(4));
      lines.push('21', y2.toFixed(4));
      lines.push('31', '0.0');

      lines.push('0', 'LINE');
      lines.push('8', '0_TUONG_XAY');
      lines.push('10', x1.toFixed(4));
      lines.push('20', y2.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', x1.toFixed(4));
      lines.push('21', y1.toFixed(4));
      lines.push('31', '0.0');
    }

    // 3.2. XUẤT CỬA ĐI & CỬA SỔ (DOORS & WINDOWS)
    else if (item.type === 'door_window') {
      const dw = item as DoorWindowItem;
      const x = dw.x * SCALE;
      const y = -dw.y * SCALE;
      const w = dw.width * SCALE;
      const h = dw.height * SCALE;

      // Vẽ khung cửa
      lines.push('0', 'LINE');
      lines.push('8', '0_CUA_DI_CUA_SO');
      lines.push('10', x.toFixed(4));
      lines.push('20', y.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', (x + w).toFixed(4));
      lines.push('21', y.toFixed(4));
      lines.push('31', '0.0');

      // Nếu là cửa đi, vẽ cánh cửa mở 90 độ và cung tròn quỹ đạo
      if (dw.subType === 'single_door' || dw.subType === 'double_door') {
        lines.push('0', 'LINE');
        lines.push('8', '0_CUA_DI_CUA_SO');
        lines.push('10', x.toFixed(4));
        lines.push('20', y.toFixed(4));
        lines.push('30', '0.0');
        lines.push('11', x.toFixed(4));
        lines.push('21', (y + w).toFixed(4));
        lines.push('31', '0.0');

        // Cung tròn quỹ đạo mở cửa (ARC)
        lines.push('0', 'ARC');
        lines.push('8', '0_CUA_DI_CUA_SO');
        lines.push('10', x.toFixed(4));
        lines.push('20', y.toFixed(4));
        lines.push('30', '0.0');
        lines.push('40', w.toFixed(4)); // Bán kính R
        lines.push('50', '0.0');        // Góc bắt đầu 0 độ
        lines.push('51', '90.0');       // Góc kết thúc 90 độ
      }
    }

    // 3.3. XUẤT CẢNH QUAN SÂN VƯỜN & NỘI THẤT
    else if (item.type === 'garden_item') {
      const g = item as GardenFurnitureItem;
      const x = g.x * SCALE;
      const y = -g.y * SCALE;
      const w = g.width * SCALE;
      const h = g.height * SCALE;
      const layer = g.category === 'interior' ? '0_NOI_THAT' : '0_CANH_QUAN';

      // Vẽ hình chữ nhật bao quanh đồ vật
      lines.push('0', 'LINE');
      lines.push('8', layer);
      lines.push('10', x.toFixed(4));
      lines.push('20', y.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', (x + w).toFixed(4));
      lines.push('21', y.toFixed(4));
      lines.push('31', '0.0');

      lines.push('0', 'LINE');
      lines.push('8', layer);
      lines.push('10', (x + w).toFixed(4));
      lines.push('20', y.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', (x + w).toFixed(4));
      lines.push('21', (y - h).toFixed(4));
      lines.push('31', '0.0');

      lines.push('0', 'LINE');
      lines.push('8', layer);
      lines.push('10', (x + w).toFixed(4));
      lines.push('20', (y - h).toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', x.toFixed(4));
      lines.push('21', (y - h).toFixed(4));
      lines.push('31', '0.0');

      lines.push('0', 'LINE');
      lines.push('8', layer);
      lines.push('10', x.toFixed(4));
      lines.push('20', (y - h).toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', x.toFixed(4));
      lines.push('21', y.toFixed(4));
      lines.push('31', '0.0');

      // Ghi nhãn tên vật thể / tên phòng trong CAD
      if (g.label) {
        lines.push('0', 'TEXT');
        lines.push('8', '0_GHI_CHU');
        lines.push('10', (x + w / 2).toFixed(4));
        lines.push('20', (y - h / 2).toFixed(4));
        lines.push('30', '0.0');
        lines.push('40', '0.25'); // Chiều cao chữ (0.25m = 250mm)
        lines.push('1', g.label);
      }
    }

    // 3.4. XUẤT ĐƯỜNG THƯỚC ĐO KÍCH THƯỚC (DIMENSIONS)
    else if (item.type === 'dimension') {
      const dim = item as DimensionItem;
      const x1 = dim.x * SCALE;
      const y1 = -dim.y * SCALE;
      const x2 = (dim.x + dim.width) * SCALE;
      const lengthM = (dim.width * SCALE).toFixed(2);

      // Đường gióng kích thước
      lines.push('0', 'LINE');
      lines.push('8', '0_KICH_THUOC');
      lines.push('10', x1.toFixed(4));
      lines.push('20', y1.toFixed(4));
      lines.push('30', '0.0');
      lines.push('11', x2.toFixed(4));
      lines.push('21', y1.toFixed(4));
      lines.push('31', '0.0');

      // Ghi số kích thước
      lines.push('0', 'TEXT');
      lines.push('8', '0_KICH_THUOC');
      lines.push('10', ((x1 + x2) / 2).toFixed(4));
      lines.push('20', (y1 + 0.15).toFixed(4));
      lines.push('30', '0.0');
      lines.push('40', '0.2');
      lines.push('1', `${lengthM}m`);
    }
  });

  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');

  return lines.join('\n');
}

/**
 * Tải file AutoCAD .DXF trực tiếp về máy tính của người dùng
 */
export function downloadAutoCADDXF(board: Board) {
  const dxfContent = generateAutoCADDXF(board);
  const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BanVeThiCong_${board.name.replace(/\s+/g, '_')}.dxf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
