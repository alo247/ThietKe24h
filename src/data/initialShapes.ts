import { ShapeCategory, ShapeType } from '../types';

export interface ShapeDefinition {
  type: ShapeType;
  name: string;
  vietnameseName: string;
  path: string; // SVG path inside a 100x100 viewBox
  aspectRatio?: number; // width / height
}

export const SHAPES_DATA: Record<ShapeCategory, ShapeDefinition[]> = {
  suggested: [
    { type: 'square', name: 'Square', vietnameseName: 'Hình vuông', path: 'M 0 0 H 100 V 100 H 0 Z' },
    { type: 'line', name: 'Line', vietnameseName: 'Đường thẳng', path: 'M 0 50 L 100 50' },
    { type: 'arrow', name: 'Arrow', vietnameseName: 'Mũi tên', path: 'M 0 50 L 100 50 M 80 30 L 100 50 L 80 70' },
    { type: 'circle', name: 'Circle', vietnameseName: 'Hình tròn', path: 'M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0' },
    { type: 'rectangle', name: 'Rounded Rect', vietnameseName: 'Hình chữ nhật bo góc', path: 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 90 A 10 10 0 0 1 90 100 H 10 A 10 10 0 0 1 0 90 V 10 A 10 10 0 0 1 10 0 Z' },
    { type: 'triangle', name: 'Triangle', vietnameseName: 'Hình tam giác', path: 'M 50 0 L 100 100 H 0 Z' },
    { type: 'pentagon', name: 'Pentagon', vietnameseName: 'Hình ngũ giác', path: 'M 50 0 L 100 38 L 80 100 H 20 L 0 38 Z' },
    { type: 'diamond', name: 'Diamond', vietnameseName: 'Hình thoi', path: 'M 50 0 L 100 50 L 50 100 L 0 50 Z' },
    { type: 'capsule', name: 'Capsule', vietnameseName: 'Hình viên thuốc', path: 'M 30 0 H 70 A 30 50 0 0 1 100 50 A 30 50 0 0 1 70 100 H 30 A 30 50 0 0 1 0 50 A 30 50 0 0 1 30 0 Z' },
    { type: 'parallelogram', name: 'Parallelogram', vietnameseName: 'Hình bình hành', path: 'M 25 0 H 100 L 75 100 H 0 Z' },
    { type: 'right_arrow', name: 'Right Arrow', vietnameseName: 'Mũi tên phải', path: 'M 0 30 H 65 V 0 L 100 50 L 65 100 V 70 H 0 Z' },
  ],
  basic: [
    { type: 'square', name: 'Square', vietnameseName: 'Hình vuông', path: 'M 0 0 H 100 V 100 H 0 Z' },
    { type: 'rectangle', name: 'Rounded Rect', vietnameseName: 'Hình chữ nhật bo góc', path: 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 90 A 10 10 0 0 1 90 100 H 10 A 10 10 0 0 1 0 90 V 10 A 10 10 0 0 1 10 0 Z' },
    { type: 'circle', name: 'Circle', vietnameseName: 'Hình tròn', path: 'M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0' },
    { type: 'line', name: 'Line', vietnameseName: 'Đường thẳng', path: 'M 0 50 L 100 50' },
    { type: 'arrow', name: 'Arrow', vietnameseName: 'Mũi tên', path: 'M 0 50 L 100 50 M 80 30 L 100 50 L 80 70' },
    { type: 'speech_bubble', name: 'Speech Bubble', vietnameseName: 'Bóng nói', path: 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 70 A 10 10 0 0 1 90 80 H 35 L 20 100 L 15 80 H 10 A 10 10 0 0 1 0 70 V 10 A 10 10 0 0 1 10 0 Z' },
  ],
  geometry: [
    { type: 'triangle', name: 'Triangle', vietnameseName: 'Hình tam giác đều', path: 'M 50 0 L 100 100 H 0 Z' },
    { type: 'right_triangle', name: 'Right Triangle', vietnameseName: 'Hình tam giác vuông', path: 'M 0 0 V 100 H 100 Z' },
    { type: 'pentagon', name: 'Pentagon', vietnameseName: 'Hình ngũ giác', path: 'M 50 0 L 100 38 L 80 100 H 20 L 0 38 Z' },
    { type: 'diamond', name: 'Diamond', vietnameseName: 'Hình thoi', path: 'M 50 0 L 100 50 L 50 100 L 0 50 Z' },
    { type: 'parallelogram', name: 'Parallelogram', vietnameseName: 'Hình bình hành', path: 'M 25 0 H 100 L 75 100 H 0 Z' },
    { type: 'star', name: '5-Point Star', vietnameseName: 'Sao 5 cánh', path: 'M 50 0 L 65 36 L 100 36 L 71 60 L 82 100 L 50 76 L 18 100 L 29 60 L 0 36 L 35 36 Z' },
    { type: 'capsule', name: 'Capsule', vietnameseName: 'Hình bao viên', path: 'M 30 0 H 70 A 30 50 0 0 1 100 50 A 30 50 0 0 1 70 100 H 30 A 30 50 0 0 1 0 50 A 30 50 0 0 1 30 0 Z' },
  ],
  objects: [
    { type: 'right_arrow', name: 'Right Arrow', vietnameseName: 'Mũi tên phải', path: 'M 0 30 H 65 V 0 L 100 50 L 65 100 V 70 H 0 Z' },
    { type: 'double_arrow', name: 'Double Arrow', vietnameseName: 'Mũi tên hai đầu', path: 'M 25 100 L 0 50 L 25 0 V 30 H 75 V 0 L 100 50 L 75 100 V 70 H 25 Z' },
    { type: 'speech_bubble', name: 'Speech Bubble', vietnameseName: 'Bóng hội thoại', path: 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 70 A 10 10 0 0 1 90 80 H 35 L 20 100 L 15 80 H 10 A 10 10 0 0 1 0 70 V 10 A 10 10 0 0 1 10 0 Z' },
  ],
};
