/* elements.js - Định nghĩa các lớp đối tượng đồ họa trên Canvas */

// Lớp cơ sở cho mọi vật thể trên Canvas
class CanvasElement {
    constructor(type, x, y, width = 100, height = 100) {
        this.id = Utils.generateId();
        this.type = type; // 'note', 'shape', 'text', 'drawing', 'image', 'connector'
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Các thuộc tính phong cách mặc định
        this.color = '#FFF9C4'; // Màu nền pastel mặc định (vàng nhạt)
        this.strokeColor = '#000000';
        this.strokeWidth = 0; // 0 nghĩa là không có viền
        this.textColor = '#1d1d1f';
        this.fontSize = 18;
        this.text = '';
        
        this.selected = false;
        this.locked = false;        // [TÍNH NĂNG MỚI]: Khóa cứng vật thể (không cho di chuyển/resize)
        this.aspectLocked = false;  // [TÍNH NĂNG MỚI]: Khóa tỉ lệ khi resize
    }

    // Vẽ khung bao xung quanh vật thể khi được chọn (Bounding Box & Handles)
    drawSelectionOutline(ctx, zoom) {
        if (!this.selected) return;

        ctx.save();
        
        // Nếu bị khóa, vẽ viền màu xám sẫm để nhận biết và không vẽ các góc resize
        if (this.locked) {
            ctx.strokeStyle = '#8e8e93';
            ctx.lineWidth = 1.5 / zoom;
            ctx.setLineDash([4 / zoom, 4 / zoom]);
            ctx.strokeRect(this.x - 4 / zoom, this.y - 4 / zoom, this.width + 8 / zoom, this.height + 8 / zoom);
            
            // Vẽ biểu tượng ổ khóa 🔒 nhỏ tinh tế ở góc trên bên phải vật thể
            ctx.setLineDash([]);
            const lockSize = 18 / zoom;
            const lockX = this.x + this.width - lockSize / 2;
            const lockY = this.y - lockSize / 2;
            
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#8e8e93';
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.arc(lockX + lockSize/2, lockY + lockSize/2, lockSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Vẽ text ổ khóa emoji
            ctx.font = `${10 / zoom}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', lockX + lockSize/2, lockY + lockSize/2);
            
            ctx.restore();
            return;
        }

        ctx.strokeStyle = '#007aff';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        
        // Vẽ khung bao ngoài
        ctx.strokeRect(this.x - 4 / zoom, this.y - 4 / zoom, this.width + 8 / zoom, this.height + 8 / zoom);
        
        // Vẽ các góc kéo thay đổi kích thước (Resize Handles)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#007aff';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([]);
        
        const handleSize = 8 / zoom;
        
        // 4 góc: Trên-Trái, Trên-Phải, Dưới-Trái, Dưới-Phải
        const corners = [
            { x: this.x, y: this.y },
            { x: this.x + this.width, y: this.y },
            { x: this.x, y: this.y + this.height },
            { x: this.x + this.width, y: this.y + this.height }
        ];

        corners.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, handleSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // [TÍNH NĂNG NÂNG CẤP THIẾT KẾ NHÀ]: Vẽ nhãn HUD hiển thị kích thước thực tế theo mét
        const wMeter = Utils.pxToMeter(this.width);
        const hMeter = Utils.pxToMeter(this.height);
        
        ctx.font = `bold ${11 / zoom}px 'Outfit'`;
        const text = `${wMeter}m × ${hMeter}m`;
        const textWidth = ctx.measureText(text).width;
        
        // Vẽ nền nhãn
        ctx.fillStyle = 'rgba(0, 122, 255, 0.9)'; // Màu xanh Apple đậm
        const labelW = textWidth + 12 / zoom;
        const labelH = 18 / zoom;
        const labelX = this.x + this.width / 2 - labelW / 2;
        const labelY = this.y + this.height + 12 / zoom; // Đặt dưới vật thể
        
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, labelW, labelH, 4 / zoom);
        ctx.fill();
        
        // Vẽ text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, labelX + labelW / 2, labelY + labelH / 2);

        ctx.restore();
    }

    // Kiểm tra xem tọa độ chuột (x, y) có nằm trong vật thể không
    isPointInside(p) {
        return p.x >= this.x && p.x <= this.x + this.width &&
               p.y >= this.y && p.y <= this.y + this.height;
    }

    // Xác định xem chuột có nằm đè lên góc resize nào không
    getResizeHandleAt(p, zoom) {
        if (!this.selected) return null;
        
        const threshold = 12 / zoom; // Khoảng cách nhận diện click
        
        const handles = [
            { name: 'tl', x: this.x, y: this.y },
            { name: 'tr', x: this.x + this.width, y: this.y },
            { name: 'bl', x: this.x, y: this.y + this.height },
            { name: 'br', x: this.x + this.width, y: this.y + this.height }
        ];

        for (let handle of handles) {
            if (Utils.distance(p, handle) <= threshold) {
                return handle.name;
            }
        }
        return null;
    }

    // Lấy tọa độ tâm của vật thể
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // Lấy thông số khung chữ nhật bao quanh vật thể
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // Vẽ văn bản xuống dòng tự động trong khung giới hạn
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, align = 'center') {
        if (!text) return;
        
        ctx.fillStyle = this.textColor;
        ctx.font = `${this.fontSize}px 'Outfit'`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        // Tính toán tọa độ Y bắt đầu vẽ để chữ căn giữa theo chiều dọc
        const totalHeight = lines.length * lineHeight;
        let startY = y - totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }

    // Thay đổi kích thước vật thể (Hỗ trợ Khóa vật thể & Khóa tỉ lệ)
    resizeBy(handle, dx, dy) {
        if (this.locked) return; // Không cho co giãn nếu đang bị khóa

        const oldX = this.x;
        const oldY = this.y;
        const oldW = this.width;
        const oldH = this.height;

        let newX = oldX;
        let newY = oldY;
        let newW = oldW;
        let newH = oldH;

        // Tính toán khung chữ nhật mới dựa vào handle kéo
        if (handle.includes('l')) {
            newX = oldX + dx;
            newW = oldW - dx;
        }
        if (handle.includes('r')) {
            newW = oldW + dx;
        }
        if (handle.includes('t')) {
            newY = oldY + dy;
            newH = oldH - dy;
        }
        if (handle.includes('b')) {
            newH = oldH + dy;
        }

        // Giới hạn kích thước tối thiểu (20px) để không bị co nhỏ mất tích
        if (newW < 20) {
            if (handle.includes('l')) newX = oldX + oldW - 20;
            newW = 20;
        }
        if (newH < 20) {
            if (handle.includes('t')) newY = oldY + oldH - 20;
            newH = 20;
        }

        // Áp dụng Khóa tỉ lệ Aspect Ratio
        if (this.aspectLocked) {
            const ratio = oldW / oldH;
            // Chỉ áp dụng khi kéo các góc chéo
            if (handle === 'tl' || handle === 'tr' || handle === 'bl' || handle === 'br') {
                newH = newW / ratio;
                if (handle.includes('t')) {
                    newY = oldY + (oldH - newH);
                }
            }
        }

        this.x = newX;
        this.y = newY;
        this.width = newW;
        this.height = newH;
    }
}

// 1. Lớp đối tượng Ghi chú dán (Sticky Note)
class StickyNote extends CanvasElement {
    constructor(x, y, text = '') {
        // Kích thước mặc định của note là 160x160 pixel
        super('note', x, y, 160, 160);
        this.text = text;
        this.color = '#FFF9C4'; // Màu vàng pastel đặc trưng của Sticky note
        this.fontSize = 16;
    }

    draw(ctx, zoom) {
        ctx.save();

        // Vẽ bóng đổ (Drop Shadow) mượt mà cho note dán
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 12 / zoom;
        ctx.shadowOffsetY = 4 / zoom;

        // Vẽ thân tờ giấy ghi chú bo góc nhẹ (border-radius = 8px)
        ctx.fillStyle = this.color;
        const radius = 8;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, radius);
        ctx.fill();

        // Tắt bóng đổ để vẽ viền và text
        ctx.shadowColor = 'transparent';

        // Vẽ viền cực mảnh để tạo chiều sâu
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1 / zoom;
        ctx.stroke();

        // Vẽ văn bản bên trong note (căn giữa)
        const padding = 16;
        const maxWidth = this.width - padding * 2;
        const lineHeight = this.fontSize * 1.3;
        
        ctx.restore();

        // Vẽ text
        ctx.save();
        this.drawWrappedText(
            ctx, 
            this.text || 'Ghi chú', 
            this.x + this.width / 2, 
            this.y + this.height / 2, 
            maxWidth, 
            lineHeight
        );
        ctx.restore();

        // Vẽ đường bao chọn lựa
        this.drawSelectionOutline(ctx, zoom);
    }
}

// 2. Lớp đối tượng Hình dạng (Shape Element)
class ShapeElement extends CanvasElement {
    constructor(shapeType, x, y) {
        super('shape', x, y, 120, 120);
        this.shapeType = shapeType; // 'rectangle', 'circle', 'triangle', 'star', 'arrow'
        this.color = '#B3E5FC'; // Màu nền pastel xanh da trời mặc định
        this.strokeColor = '#007aff';
        this.strokeWidth = 2;
        this.fontSize = 16;
    }

    draw(ctx, zoom) {
        ctx.save();
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        ctx.beginPath();
        if (this.shapeType === 'rectangle') {
            ctx.roundRect(x, y, w, h, 8);
        } else if (this.shapeType === 'circle') {
            ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
        } else if (this.shapeType === 'triangle') {
            ctx.moveTo(x + w / 2, y);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.closePath();
        } else if (this.shapeType === 'star') {
            const cx = x + w / 2;
            const cy = y + h / 2;
            const spikes = 5;
            const outerRadius = Math.min(w, h) / 2;
            const innerRadius = outerRadius * 0.4;
            
            let rot = Math.PI / 2 * 3;
            let sx = cx;
            let sy = cy;
            const step = Math.PI / spikes;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                sx = cx + Math.cos(rot) * outerRadius;
                sy = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(sx, sy);
                rot += step;

                sx = cx + Math.cos(rot) * innerRadius;
                sy = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(sx, sy);
                rot += step;
            }
            ctx.closePath();
        } else if (this.shapeType === 'arrow') {
            // Vẽ mũi tên trỏ sang phải mặc định
            ctx.moveTo(x, y + h * 0.35);
            ctx.lineTo(x + w * 0.6, y + h * 0.35);
            ctx.lineTo(x + w * 0.6, y + h * 0.15);
            ctx.lineTo(x + w, y + h * 0.5);
            ctx.lineTo(x + w * 0.6, y + h * 0.85);
            ctx.lineTo(x + w * 0.6, y + h * 0.65);
            ctx.lineTo(x, y + h * 0.65);
            ctx.closePath();
        } else if (this.shapeType === 'line') {
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y + h);
            // Đối với Line, ta chỉ viền, không đổ màu
        } else if (this.shapeType === 'rounded-rect') {
            const r = Math.min(w, h) * 0.2;
            ctx.roundRect(x, y, w, h, r);
        } else if (this.shapeType === 'diamond') {
            ctx.moveTo(x + w / 2, y);
            ctx.lineTo(x + w, y + h / 2);
            ctx.lineTo(x + w / 2, y + h);
            ctx.lineTo(x, y + h / 2);
            ctx.closePath();
        } else if (this.shapeType === 'hexagon') {
            const side = w * 0.25;
            ctx.moveTo(x + w / 2, y);
            ctx.lineTo(x + w, y + h * 0.25);
            ctx.lineTo(x + w, y + h * 0.75);
            ctx.lineTo(x + w / 2, y + h);
            ctx.lineTo(x, y + h * 0.75);
            ctx.lineTo(x, y + h * 0.25);
            ctx.closePath();
        } else if (this.shapeType === 'callout') {
            const r = 12;
            // Vẽ hộp chữ nhật bo tròn có mũi tên chỉ xuống
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h * 0.7 - r);
            ctx.arcTo(x + w, y + h * 0.7, x + w - r, y + h * 0.7, r);
            // Mũi tên gọi thoại (đuôi bong bóng)
            ctx.lineTo(x + w * 0.6, y + h * 0.7);
            ctx.lineTo(x + w * 0.5, y + h);
            ctx.lineTo(x + w * 0.4, y + h * 0.7);
            
            ctx.lineTo(x + r, y + h * 0.7);
            ctx.arcTo(x, y + h * 0.7, x, y + h * 0.7 - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
        } 

        
        // --- THƯ VIỆN KÝ HIỆU THIẾT KẾ NHÀ & NỘI THẤT NÂNG CẤP ---
        else if (this.shapeType === 'wall') {
            // Tường nhà xây dựng
            ctx.roundRect(x, y, w, h, 2);
            this.color = '#5c5c5e'; // Ép màu xám tường đặc trưng
            ctx.fillStyle = this.color;
            ctx.fill();
            if (this.strokeWidth > 0) ctx.stroke();
            ctx.restore();
            // Trả về sớm vì đã tự vẽ viền/nền và tắt context
            if (this.text) {
                ctx.save();
                this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, w - 10, this.fontSize * 1.3);
                ctx.restore();
            }
            this.drawSelectionOutline(ctx, zoom);
            return;
        } else if (this.shapeType === 'door') {
            // Cửa đi góc mở 90 độ
            ctx.lineWidth = Math.max(this.strokeWidth, 2);
            ctx.strokeStyle = this.strokeColor;
            
            // Vẽ khung tường phụ hai bên chân cửa
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + h);
            ctx.lineTo(x + w, y + h);
            ctx.stroke();

            // Vẽ cánh cửa gỗ thẳng đứng biểu thị trạng thái mở 90 độ
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // Vẽ đường vòng cung nét đứt biểu thị bán kính quét cửa
            ctx.save();
            ctx.setLineDash([4 / zoom, 4 / zoom]);
            ctx.beginPath();
            ctx.arc(x, y + h, h, -Math.PI/2, 0);
            ctx.stroke();
            ctx.restore();
            
            ctx.restore();
            if (this.text) {
                ctx.save();
                this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, w - 10, this.fontSize * 1.3);
                ctx.restore();
            }
            this.drawSelectionOutline(ctx, zoom);
            return;
        } else if (this.shapeType === 'window') {
            // Cửa sổ kính
            ctx.roundRect(x, y, w, h, 2);
            this.color = '#e1f5fe'; // Màu kính xanh mờ nhạt
            ctx.fillStyle = this.color;
            ctx.fill();
            if (this.strokeWidth > 0) ctx.stroke();

            // Vẽ song cửa sổ bên trong
            ctx.beginPath();
            ctx.moveTo(x, y + h / 2);
            ctx.lineTo(x + w, y + h / 2);
            ctx.moveTo(x + w / 3, y);
            ctx.lineTo(x + w / 3, y + h);
            ctx.moveTo(x + 2 * w / 3, y);
            ctx.lineTo(x + 2 * w / 3, y + h);
            ctx.stroke();
            
            ctx.restore();
            if (this.text) {
                ctx.save();
                this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, w - 10, this.fontSize * 1.3);
                ctx.restore();
            }
            this.drawSelectionOutline(ctx, zoom);
            return;
        } else if (this.shapeType === 'bed') {
            // Giường ngủ đôi
            ctx.roundRect(x, y, w, h, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            if (this.strokeWidth > 0) ctx.stroke();

            // Vẽ chăn đắp
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x + 2, y + h * 0.35, w - 4, h * 0.62, [0, 0, 4, 4]);
            ctx.fillStyle = '#e0f2f1'; // Màu mint nhạt
            ctx.fill();
            ctx.restore();

            // Vẽ hai cái gối
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#90a4ae';
            const pillowW = w * 0.35;
            const pillowH = h * 0.2;
            const pillowY = y + h * 0.08;
            
            ctx.beginPath();
            ctx.roundRect(x + w * 0.1, pillowY, pillowW, pillowH, 3);
            ctx.roundRect(x + w * 0.55, pillowY, pillowW, pillowH, 3);
            ctx.fillStyle = '#eceff1';
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            
            ctx.restore();
            if (this.text) {
                ctx.save();
                this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, w - 10, this.fontSize * 1.3);
                ctx.restore();
            }
            this.drawSelectionOutline(ctx, zoom);
            return;
        } else if (this.shapeType === 'table') {
            // Bàn ăn kèm ghế xung quanh
            const tableW = w * 0.7;
            const tableH = h * 0.5;
            const tableX = x + (w - tableW) / 2;
            const tableY = y + (h - tableH) / 2;
            
            // Vẽ ghế trước
            ctx.save();
            ctx.fillStyle = '#cfd8dc';
            ctx.strokeStyle = '#b0bec5';
            ctx.lineWidth = 1;
            const chairSize = Math.min(w, h) * 0.12;
            
            const chairs = [
                { x: tableX + tableW * 0.18, y: tableY - chairSize },
                { x: tableX + tableW * 0.58, y: tableY - chairSize },
                { x: tableX + tableW * 0.18, y: tableY + tableH },
                { x: tableX + tableW * 0.58, y: tableY + tableH },
                { x: tableX - chairSize, y: tableY + tableH * 0.3 },
                { x: tableX + tableW, y: tableY + tableH * 0.3 }
            ];

            chairs.forEach(c => {
                ctx.beginPath();
                ctx.roundRect(c.x, c.y, chairSize, chairSize, 2);
                ctx.fill();
                ctx.stroke();
            });
            ctx.restore();

            // Vẽ bàn đè lên
            ctx.beginPath();
            ctx.roundRect(tableX, tableY, tableW, tableH, 4);
            ctx.fillStyle = '#ffe0b2'; // Màu bàn gỗ pastel ấm áp
            ctx.fill();
            if (this.strokeWidth > 0) ctx.stroke();
            
            ctx.restore();
            if (this.text) {
                ctx.save();
                this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, tableW - 10, this.fontSize * 1.3);
                ctx.restore();
            }
            this.drawSelectionOutline(ctx, zoom);
            return;
        } else if (this.shapeType === 'sofa') {
            // Ghế Sofa dài
            ctx.roundRect(x, y, w, h, 8);
            ctx.fillStyle = '#eceff1'; // Màu sofa sáng
            ctx.fill();
            if (this.strokeWidth > 0) ctx.stroke();

            // Đệm lưng
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, w - 4, h * 0.25, 4);
            ctx.fillStyle = '#cfd8dc';
            ctx.fill();
            ctx.stroke();

            // Tay vịn 2 bên
            const armW = w * 0.12;
            ctx.beginPath();
            ctx.roundRect(x + 2, y + h * 0.25, armW, h * 0.7, 4);
            ctx.roundRect(x + w - armW - 2, y + h * 0.25, armW, h * 0.7, 4);
            ctx.fillStyle = '#cfd8dc';
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            
            ctx.restore();
            if (this.text) {
                ctx.save();
                this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, w - 2 * armW, this.fontSize * 1.3);
                ctx.restore();
            }
            this.drawSelectionOutline(ctx, zoom);
            return;
        } else if (this.shapeType === 'plant') {
            // Bụi cây / Thảm cỏ
            const cx = x + w / 2;
            const cy = y + h / 2;
            const radius = Math.min(w, h) / 2;
            
            ctx.beginPath();
            const leaves = 12;
            ctx.moveTo(cx + radius, cy);
            for (let i = 0; i <= leaves; i++) {
                const angle = (i / leaves) * Math.PI * 2;
                const r = radius * (0.85 + Math.sin(angle * 8) * 0.12);
                const lx = cx + Math.cos(angle) * r;
                const ly = cy + Math.sin(angle) * r;
                ctx.lineTo(lx, ly);
            }
            ctx.closePath();
            ctx.fillStyle = '#a5d6a7'; // Lá cây sân vườn xanh mát
            ctx.fill();
            if (this.strokeWidth > 0) ctx.stroke();

            // Vẽ nhân nhụy cây
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#81c784';
            ctx.fill();
            
            ctx.restore();
            if (this.text) {
                ctx.save();
                this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, w - 20, this.fontSize * 1.3);
                ctx.restore();
            }
            this.drawSelectionOutline(ctx, zoom);
            return;
        }

        if (this.color) {
            ctx.fill();
        }
        if (this.strokeWidth > 0) {
            ctx.stroke();
        }

        ctx.restore();

        // Vẽ text ở tâm của Shape
        if (this.text) {
            ctx.save();
            const padding = 12;
            const maxWidth = this.width - padding * 2;
            const lineHeight = this.fontSize * 1.3;
            this.drawWrappedText(ctx, this.text, x + w / 2, y + h / 2, maxWidth, lineHeight);
            ctx.restore();
        }

        // Vẽ đường viền khi chọn
        this.drawSelectionOutline(ctx, zoom);
    }
}

// 3. Lớp đối tượng Văn bản tự do (Text Element)
class TextElement extends CanvasElement {
    constructor(x, y, text = 'Văn bản') {
        super('text', x, y, 100, 30);
        this.text = text;
        this.color = ''; // Không có nền
        this.textColor = '#1d1d1f';
        this.fontSize = 24;
    }

    draw(ctx, zoom) {
        ctx.save();
        ctx.font = `${this.fontSize}px 'Outfit'`;
        
        // Đo đạc kích thước thực tế của text để cập nhật width/height
        const metrics = ctx.measureText(this.text || ' ');
        this.width = Math.max(metrics.width, 20);
        this.height = this.fontSize * 1.2;

        ctx.fillStyle = this.textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();

        this.drawSelectionOutline(ctx, zoom);
    }
}

// 4. Lớp đối tượng Nét vẽ tự do (Drawing Path)
class DrawingPath extends CanvasElement {
    constructor(points = [], strokeColor = '#1d1d1f', strokeWidth = 4) {
        super('drawing', 0, 0, 0, 0);
        this.points = points; // Danh sách điểm [{x, y}]
        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
        this.opacity = 1.0;     // [TÍNH NĂNG MỚI]: Độ trong suốt (đặc biệt cho bút chì, dạ quang)
        this.brushType = 'pen'; // 'pen', 'pencil', 'highlighter'
        
        this.recalculateBounds();
    }

    // Tính toán lại khung chữ nhật bao quanh nét vẽ
    recalculateBounds() {
        if (this.points.length === 0) {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            return;
        }

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        this.points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        });

        this.x = minX;
        this.y = minY;
        this.width = Math.max(maxX - minX, 1);
        this.height = Math.max(maxY - minY, 1);
    }

    // Di chuyển toàn bộ nét vẽ khi người dùng kéo nó
    moveBy(dx, dy) {
        this.points.forEach(p => {
            p.x += dx;
            p.y += dy;
        });
        this.x += dx;
        this.y += dy;
    }

    // Thay đổi kích thước nét vẽ dựa theo tỉ lệ từ các góc kéo
    resizeBy(handle, dx, dy) {
        // Vẽ tự do thay đổi kích thước phức tạp, ta scale tất cả các điểm theo tỉ lệ tương ứng
        const oldX = this.x;
        const oldY = this.y;
        const oldW = this.width;
        const oldH = this.height;

        let newX = oldX;
        let newY = oldY;
        let newW = oldW;
        let newH = oldH;

        // Tính toán khung chữ nhật mới dựa vào handle đang tương tác
        if (handle.includes('l')) {
            newX = oldX + dx;
            newW = oldW - dx;
        }
        if (handle.includes('r')) {
            newW = oldW + dx;
        }
        if (handle.includes('t')) {
            newY = oldY + dy;
            newH = oldH - dy;
        }
        if (handle.includes('b')) {
            newH = oldH + dy;
        }

        // Tránh kích thước âm
        if (newW < 5) { newW = 5; newX = this.x; }
        if (newH < 5) { newH = 5; newY = this.y; }

        const scaleX = newW / oldW;
        const scaleY = newH / oldH;

        // Cập nhật lại từng tọa độ điểm
        this.points.forEach(p => {
            p.x = newX + (p.x - oldX) * scaleX;
            p.y = newY + (p.y - oldY) * scaleY;
        });

        this.x = newX;
        this.y = newY;
        this.width = newW;
        this.height = newH;
    }

    // Vẽ nét vẽ lên canvas bằng thuật toán Bezier để có đường nét mượt mà
    draw(ctx, zoom) {
        if (this.points.length === 0) return;

        ctx.save();
        
        // [TÍNH NĂNG MỚI]: Áp dụng độ mờ opacity cho nét bút
        ctx.globalAlpha = this.opacity || 1.0;
        
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        if (this.points.length === 1) {
            // Vẽ một điểm duy nhất
            ctx.lineTo(this.points[0].x + 0.1, this.points[0].y);
            ctx.stroke();
        } else if (this.points.length === 2) {
            // Nối thẳng nếu chỉ có 2 điểm
            ctx.lineTo(this.points[1].x, this.points[1].y);
            ctx.stroke();
        } else {
            // Vẽ đường cong Bezier bậc 2 mềm mại đi qua trung điểm
            for (let i = 1; i < this.points.length - 2; i++) {
                const xc = (this.points[i].x + this.points[i + 1].x) / 2;
                const yc = (this.points[i].y + this.points[i + 1].y) / 2;
                ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
            }
            // Điểm cuối cùng
            const penultimate = this.points[this.points.length - 2];
            const end = this.points[this.points.length - 1];
            ctx.quadraticCurveTo(penultimate.x, penultimate.y, end.x, end.y);
            ctx.stroke();
        }

        ctx.restore();

        // Vẽ khung bao xung quanh khi chọn
        this.drawSelectionOutline(ctx, zoom);
    }

    // Kiểm tra xem người dùng click gần nét vẽ tự do hay không
    isPointInside(p) {
        // Cho phép click sai lệch tối đa 8 pixel
        return Utils.isPointNearPath(p, this.points, 10);
    }

    // [TÍNH NĂNG NÂNG CẤP]: Làm thẳng nét vẽ tự do thành đường thẳng tắp hoặc đa giác thẳng cạnh
    straighten() {
        const oldPointsCount = this.points.length;
        // Thực hiện làm thẳng nét vẽ
        this.points = Utils.straightenPath(this.points);
        this.recalculateBounds();
        // Trả về true nếu nét vẽ thực sự bị biến đổi làm thẳng
        return this.points.length < oldPointsCount;
    }
}

// 5. Lớp đối tượng Hình ảnh (Image Element)
class ImageElement extends CanvasElement {
    constructor(img, x, y, width = 200, height = 200) {
        super('image', x, y, width, height);
        this.img = img; // Đối tượng ảnh HTMLImageElement đã tải xong
        this.aspectRatio = img.width / img.height;
        this.width = width;
        this.height = width / this.aspectRatio; // Giữ đúng tỉ lệ ảnh
    }

    draw(ctx, zoom) {
        ctx.save();
        try {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } catch (e) {
            // Vẽ hộp chữ nhật placeholder nếu ảnh bị lỗi
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#888888';
            ctx.font = '12px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('Ảnh bị lỗi', this.x + this.width/2, this.y + this.height/2);
        }
        ctx.restore();

        this.drawSelectionOutline(ctx, zoom);
    }

    // Ghi đè hàm resize để giữ nguyên tỉ lệ ảnh
    resizeBy(handle, dx, dy) {
        const oldW = this.width;
        const oldH = this.height;
        
        let newW = oldW;

        if (handle.includes('r')) {
            newW = oldW + dx;
        } else if (handle.includes('l')) {
            newW = oldW - dx;
            this.x += dx;
        }

        if (newW < 20) newW = 20;

        // Tính toán chiều cao tương ứng dựa trên tỉ lệ ảnh gốc
        this.width = newW;
        this.height = newW / this.aspectRatio;

        // Nếu kéo handle phía trên, điều chỉnh Y
        if (handle.includes('t')) {
            const newH = newW / this.aspectRatio;
            this.y += (oldH - newH);
        }
    }
}

// 6. Lớp đối tượng Đường kết nối (Connector Line)
class ConnectorLine extends CanvasElement {
    constructor(fromId, toId) {
        super('connector', 0, 0, 0, 0);
        this.fromId = fromId; // ID vật thể nguồn
        this.toId = toId;     // ID vật thể đích
        
        // Dùng khi đang vẽ dở (kéo chuột chưa thả vào vật thể đích)
        this.tempToPoint = null; 
        
        this.strokeColor = '#86868b'; // Màu xám nhẹ Apple
        this.strokeWidth = 2;
        this.lineStyle = 'dashed'; // 'solid' hoặc 'dashed'
    }

    // Vẽ đường kết nối thông minh giữa hai vật thể
    draw(ctx, zoom, allElements) {
        const fromElem = allElements.find(e => e.id === this.fromId);
        let toElem = allElements.find(e => e.id === this.toId);

        if (!fromElem) return;

        let startPoint, endPoint;

        // Nếu đã nối tới vật thể đích
        if (toElem) {
            // Lấy tọa độ tâm của cả hai vật thể
            const fromCenter = fromElem.getCenter();
            const toCenter = toElem.getCenter();

            // Tính toán giao điểm gần nhất trên biên ngoài của vật thể nguồn
            const fromIntersect = Utils.getClosestPointOnRect(toCenter, fromElem.getBounds());
            // Tính toán giao điểm gần nhất trên biên ngoài của vật thể đích
            const toIntersect = Utils.getClosestPointOnRect(fromCenter, toElem.getBounds());

            startPoint = fromIntersect;
            endPoint = toIntersect;
        } else if (this.tempToPoint) {
            // Đang vẽ dở, lấy tâm vật thể nguồn làm điểm xuất phát và chân chuột làm đích
            const fromCenter = fromElem.getCenter();
            startPoint = Utils.getClosestPointOnRect(this.tempToPoint, fromElem.getBounds());
            endPoint = this.tempToPoint;
        } else {
            return;
        }

        ctx.save();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        
        if (this.lineStyle === 'dashed') {
            ctx.setLineDash([6 / zoom, 4 / zoom]);
        } else {
            ctx.setLineDash([]);
        }

        // Vẽ đường nối chính
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();

        // [TÍNH NĂNG THIẾT KẾ NHÀ]: Tính toán khoảng cách thực tế theo mét và vẽ nhãn ở trung điểm
        const distPx = Utils.distance(startPoint, endPoint);
        const distMeter = Utils.pxToMeter(distPx);
        
        // Chỉ vẽ nhãn nếu khoảng cách đủ dài để không bị rối mắt (> 0.5m)
        if (distMeter > 0.3) {
            const mid = Utils.getLineMiddlePoint(startPoint, endPoint);
            
            ctx.save();
            ctx.setLineDash([]); // Xóa nét đứt khi vẽ nhãn
            
            ctx.font = `bold ${11 / zoom}px 'Outfit'`;
            const labelText = `${distMeter}m`;
            const textW = ctx.measureText(labelText).width;
            
            const boxW = textW + 8 / zoom;
            const boxH = 16 / zoom;
            
            // Vẽ hộp nền nhãn
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.roundRect(mid.x - boxW / 2, mid.y - boxH / 2, boxW, boxH, 3 / zoom);
            ctx.fill();
            ctx.stroke();
            
            // Vẽ chữ
            ctx.fillStyle = '#1d1d1f';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, mid.x, mid.y);
            
            ctx.restore();
        }

        // Vẽ mũi tên ở đầu đích (endPoint)
        ctx.setLineDash([]);
        ctx.fillStyle = this.strokeColor;
        
        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
        const arrowSize = 8 / zoom;

        ctx.beginPath();
        ctx.moveTo(endPoint.x, endPoint.y);
        ctx.lineTo(
            endPoint.x - arrowSize * Math.cos(angle - Math.PI / 6),
            endPoint.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endPoint.x - arrowSize * Math.cos(angle + Math.PI / 6),
            endPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Không cho chọn hoặc click trúng đường kết nối trực tiếp để tránh rối màn hình
    isPointInside(p) {
        return false; 
    }
}
