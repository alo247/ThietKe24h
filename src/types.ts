export type ItemType = 'sticky' | 'text' | 'shape' | 'table' | 'drawing' | 'attachment' | 'wall' | 'door_window' | 'garden_item' | 'dimension';

export interface Point {
  x: number;
  y: number;
}

export interface BaseItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  isLocked?: boolean;
  zIndex: number;
}

export type StickyColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple' | 'gray';

export interface StickyNoteItem extends BaseItem {
  type: 'sticky';
  text: string;
  color: StickyColor;
}

export interface TextBoxItem extends BaseItem {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color: string;
  align?: 'left' | 'center' | 'right';
}

export type ShapeCategory = 'suggested' | 'basic' | 'geometry' | 'objects';

export type ShapeType =
  | 'square'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'right_triangle'
  | 'pentagon'
  | 'diamond'
  | 'capsule'
  | 'parallelogram'
  | 'star'
  | 'right_arrow'
  | 'double_arrow'
  | 'speech_bubble'
  | 'line'
  | 'arrow'
  | 'bezier';

export interface ShapeItem extends BaseItem {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  text?: string;
  textFontSize?: number;
  textColor?: string;
  keepRatio?: boolean;
}

export interface TableCell {
  text: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableItem extends BaseItem {
  type: 'table';
  rows: number;
  cols: number;
  data: TableCell[][]; // Ma trận ô rows x cols
  colWidths?: number[];
  rowHeights?: number[];
}

export type DrawingTool = 'pencil' | 'pen' | 'highlighter' | 'eraser' | 'brush' | 'spray' | 'bucket' | 'picker' | 'magnifier';

export interface DrawingItem extends BaseItem {
  type: 'drawing';
  tool: 'pencil' | 'pen' | 'highlighter' | 'brush' | 'spray';
  points: Point[];
  color: string;
  strokeWidth: number;
  opacity: number;
  brushStyle?: 'watercolor' | 'marker' | 'calligraphy' | 'crayon' | 'normal';
}

export type AttachmentType = 'image' | 'video' | 'link' | 'file';

export interface AttachmentItem extends BaseItem {
  type: 'attachment';
  attachmentType: AttachmentType;
  title: string;
  url?: string;
  blobUrl?: string; // Dành cho file tải lên từ máy
  fileSize?: string;
  fileType?: string;
  iconName?: string;
}

// === CÁC KIỂU DỮ LIỆU CHUYÊN BIỆT THIẾT KẾ NHÀ & SÂN VƯỜN ===

// Kiểu tường (Tường chính 200mm, tường ngăn 100mm, tường rào sân vườn)
export interface WallItem extends BaseItem {
  type: 'wall';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number; // Độ dày tường (pixel, quy ước 10px = 100mm, 20px = 200mm)
  wallHeight: number; // Chiều cao tường 3D (m, ví dụ 3.0m)
  wallColor: string;
  isFence?: boolean; // Tường rào ngoài trời hay tường nhà
}

// Cửa đi & Cửa sổ
export type DoorWindowType = 'single_door' | 'double_door' | 'sliding_door' | 'window';

export interface DoorWindowItem extends BaseItem {
  type: 'door_window';
  subType: DoorWindowType;
  wallId?: string; // Gắn với tường nào (tùy chọn)
  wallAngle?: number; // Góc xoay theo tường
  doorWidth: number; // Chiều rộng cửa
  openDirection?: 'left' | 'right' | 'inward' | 'outward'; // Hướng mở cửa
}

// Danh mục cảnh quan sân vườn & nội thất
export type LandscapeCategory = 'plants' | 'water' | 'paving' | 'outdoor_furniture' | 'interior';

export interface GardenFurnitureItem extends BaseItem {
  type: 'garden_item';
  category: LandscapeCategory;
  symbolId: string; // Mã định danh biểu tượng (tree_large, pool, koi_pond, grass_patch, v.v.)
  label?: string; // Nhãn tên phòng hoặc vật thể (VD: "Phòng Khách", "Cây Bàng Đài Loan")
  color?: string;
  height3D?: number; // Chiều cao thực tế mô phỏng trong 3D
}

// Thước đo kích thước
export interface DimensionItem extends BaseItem {
  type: 'dimension';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  unit: 'm' | 'cm' | 'mm';
}

export type BoardItem =
  | StickyNoteItem
  | TextBoxItem
  | ShapeItem
  | TableItem
  | DrawingItem
  | AttachmentItem
  | WallItem
  | DoorWindowItem
  | GardenFurnitureItem
  | DimensionItem;

// Chế độ góc nhìn 2D Mặt Bằng hoặc 3D Isometric
export type ViewMode = '2d' | '3d';

// Hướng xoay 3D Isometric (4 góc nhìn: Đông Nam, Tây Nam, Tây Bắc, Đông Bắc)
export type IsometricAngle = 0 | 90 | 180 | 270;

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  items: BoardItem[];
  showGrid: boolean;
  gridStyle?: 'dots' | 'lines' | 'none';
  snapToGrid: boolean;
  zoom: number;
  panX: number;
  panY: number;
  backgroundColor?: string;
}

export interface PenSettings {
  tool: DrawingTool;
  pencil: { color: string; width: number; opacity: number };
  pen: { color: string; width: number; opacity: number };
  highlighter: { color: string; width: number; opacity: number };
  brush: { color: string; width: number; opacity: number; style: 'watercolor' | 'marker' | 'calligraphy' | 'crayon' | 'normal' };
  spray: { color: string; radius: number; density: number };
  eraser: { mode: 'pixel' | 'object'; size: number };
  bucket: { color: string };
}
