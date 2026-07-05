export type ItemType = 'sticky' | 'text' | 'shape' | 'table' | 'drawing' | 'attachment';

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
  data: TableCell[][]; // rows x cols
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
  blobUrl?: string; // For uploaded files
  fileSize?: string;
  fileType?: string;
  iconName?: string;
}

export type BoardItem =
  | StickyNoteItem
  | TextBoxItem
  | ShapeItem
  | TableItem
  | DrawingItem
  | AttachmentItem;

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
