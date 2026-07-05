/* canvas.js - Quản lý Canvas vô cực, lưới nền, Pan/Zoom và Tương tác đồ họa */

class InfiniteCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Trạng thái hệ tọa độ vô cực
        this.panX = 0;       // Độ dời trục X
        this.panY = 0;       // Độ dời trục Y
        this.zoom = 1.0;     // Tỉ lệ phóng to/thu nhỏ
        this.minZoom = 0.05; // Zoom nhỏ tối thiểu 5%
        this.maxZoom = 4.0;  // Zoom lớn tối đa 400%
        
        // Danh sách tất cả vật thể trên canvas
        this.elements = [];
        
        // Hệ thống hít lưới (Grid Snapping) chuyên dụng thiết kế nhà cửa
        this.gridSnapEnabled = true; // Mặc định bật để người dùng dễ xếp thẳng hàng
        this.snapSize = 10;          // Cỡ hít lưới: 10px tương đương 0.25m thực tế
        
        // Hệ thống bút vẽ nổi Apple Freeform
        this.brushType = 'pen';      // 'pen', 'pencil', 'highlighter', 'eraser'
        this.brushOpacity = 1.0;     // Độ mờ bút vẽ (0.1 -> 1.0)
        
        // Trạng thái tương tác chuột
        this.isPanning = false;
        this.isDrawing = false;
        this.isDragging = false;
        this.isResizing = false;
        this.isConnecting = false;
        this.isErasing = false;
        
        this.selectedElement = null; // Vật thể đang được chọn
        this.resizeHandle = null;     // Handle kéo kích thước đang chọn ('tl', 'tr', 'bl', 'br')
        this.currentPath = null;      // Nét vẽ tự do đang thực hiện
        this.currentConnector = null; // Đường kết nối đang vẽ dở
        
        this.startMousePos = { x: 0, y: 0 };    // Vị trí chuột lúc bắt đầu nhấn xuống (tọa độ màn hình)
        this.lastCanvasMousePos = { x: 0, y: 0 };// Vị trí chuột trên canvas ở khung hình trước
        this.draggedElementStartPos = { x: 0, y: 0 }; // Vị trí gốc của vật thể trước khi bị kéo
        this.draggedElementStartSize = { w: 0, h: 0 };// Kích thước gốc của vật thể trước khi bị kéo
        
        // Quản lý công cụ hiện tại: 'select', 'hand', 'draw', 'erase', 'note', 'shape', 'text', 'connector', 'image'
        this.currentTool = 'select'; 
        this.currentShapeType = 'rectangle'; // Loại shape được chọn trong menu
        
        // Cài đặt màu vẽ hiện tại
        this.strokeColor = '#1d1d1f';
        this.strokeWidth = 4; // Mặc định nét vừa
        this.fillColor = '#B3E5FC'; // Màu nền mặc định cho shape mới
        this.noteColor = '#FFF9C4'; // Màu mặc định cho ghi chú dán
        
        // Trình nghe sự kiện thay đổi dữ liệu (Dùng để đồng bộ Undo/Redo và lưu trữ)
        this.onStateChange = () => {};

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.registerEvents();
    }

    // Điều chỉnh kích thước canvas toàn màn hình
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.render();
    }

    // Chuyển đổi tọa độ màn hình (clientX, clientY) thành tọa độ trên Canvas vô cực
    screenToCanvas(screenX, screenY) {
        return {
            x: (screenX - this.panX) / this.zoom,
            y: (screenY - this.panY) / this.zoom
        };
    }

    // Chuyển đổi tọa độ thực tế trên canvas thành tọa độ màn hình hiển thị
    canvasToScreen(canvasX, canvasY) {
        return {
            x: canvasX * this.zoom + this.panX,
            y: canvasY * this.zoom + this.panY
        };
    }

    // [TÍNH NĂNG ĐỒ HỌA MỚI]: Vẽ lưới nền chấm tròn (Dot Grid) giống hệt Apple Freeform
    drawGrid() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Khoảng cách ô lưới gốc là 40px
        const baseGridSize = 40;
        
        // Tính toán khoảng cách ô lưới sau khi nhân tỉ lệ zoom
        let gridSize = baseGridSize * this.zoom;
        
        // Thích ứng lưới: Nếu phóng to hoặc thu nhỏ quá nhiều, nhân/chia lưới để tránh quá dày hoặc quá thưa
        while (gridSize < 15) {
            gridSize *= 2;
        }
        while (gridSize > 80) {
            gridSize /= 2;
        }

        this.ctx.save();
        this.ctx.fillStyle = '#d1d1d6'; // Dấu chấm tròn màu xám mờ tinh tế của Apple
        
        // Tìm tọa độ bắt đầu vẽ lưới trên màn hình
        const startX = this.panX % gridSize;
        const startY = this.panY % gridSize;

        // Vẽ các dấu chấm (dots) tại các nút lưới
        for (let x = startX; x < width; x += gridSize) {
            for (let y = startY; y < height; y += gridSize) {
                this.ctx.beginPath();
                // Bán kính chấm 1px (hoặc 1.2px) vẽ tròn trịa
                this.ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }

    // Vòng lặp Render chính
    render() {
        // Xóa màn hình
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Vẽ lưới nền động
        this.drawGrid();

        // Áp dụng phép dịch chuyển hệ tọa độ vô cực
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        // 1. Vẽ các đường kết nối Connector trước (nằm phía dưới các đối tượng)
        this.elements.forEach(elem => {
            if (elem instanceof ConnectorLine) {
                elem.draw(this.ctx, this.zoom, this.elements);
            }
        });

        // 2. Vẽ tất cả các vật thể khác (shapes, notes, text, drawing, image)
        this.elements.forEach(elem => {
            if (!(elem instanceof ConnectorLine)) {
                elem.draw(this.ctx, this.zoom);
            }
        });

        // Khôi phục lại trạng thái context gốc để vẽ các phần tử UI cố định trên màn hình (nếu có)
        this.ctx.restore();

        // [TÍNH NĂNG MỚI]: Tự động định vị và hiển thị Menu ngữ cảnh nổi (Context Menu) bám theo vật thể được chọn
        const selected = this.selectedElement;
        const menu = document.getElementById('context-menu');
        if (menu) {
            if (selected) {
                // Lấy tọa độ hiển thị của vật thể trên màn hình
                const screenPos = this.canvasToScreen(selected.x, selected.y);
                const screenW = selected.width * this.zoom;
                const screenH = selected.height * this.zoom;
                
                menu.classList.remove('hidden');
                
                // Đặt menu ở chính giữa cạnh dưới của vật thể, cách ra 12px
                const leftPos = screenPos.x + screenW / 2;
                const topPos = screenPos.y + screenH + 12;
                
                menu.style.left = `${leftPos}px`;
                menu.style.top = `${topPos}px`;
                menu.style.transform = `translateX(-50%)`;
                
                // Đồng bộ nhãn nút khóa
                const lockText = document.getElementById('ctx-lock-text');
                if (lockText) {
                    lockText.innerText = selected.locked ? 'Mở khóa' : 'Khóa';
                }
                
                // Ẩn/Hiện tùy chọn Đổi hình dạng (chỉ áp dụng cho ShapeElement)
                const changeShapeMenu = document.getElementById('ctx-change-shape-menu');
                const shapeDivider = document.getElementById('ctx-shape-divider');
                if (changeShapeMenu && shapeDivider) {
                    if (selected instanceof ShapeElement) {
                        changeShapeMenu.style.display = 'block';
                        shapeDivider.style.display = 'block';
                    } else {
                        changeShapeMenu.style.display = 'none';
                        shapeDivider.style.display = 'none';
                    }
                }
                
                // Cập nhật trạng thái nút Aspect Lock
                const aspectBtn = document.getElementById('ctx-aspect');
                if (aspectBtn) {
                    if (selected.aspectLocked) {
                        aspectBtn.classList.add('active');
                    } else {
                        aspectBtn.classList.remove('active');
                    }
                }
            } else {
                menu.classList.add('hidden');
            }
        }
    }

    // Đổi công cụ vẽ hiện tại
    setTool(toolName) {
        this.currentTool = toolName;
        
        // Cập nhật con trỏ chuột trực quan
        if (toolName === 'hand') {
            this.canvas.style.cursor = 'grab';
        } else if (toolName === 'draw') {
            this.canvas.style.cursor = 'crosshair';
        } else if (toolName === 'erase') {
            this.canvas.style.cursor = 'cell';
        } else if (toolName === 'select') {
            this.canvas.style.cursor = 'default';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }

        // Hủy chọn nếu đổi sang công cụ vẽ/tẩy để tránh tương tác nhầm
        if (toolName !== 'select') {
            this.clearSelection();
        }
        this.render();
    }

    // Hủy chọn tất cả các vật thể đang chọn
    clearSelection() {
        this.elements.forEach(el => el.selected = false);
        this.selectedElement = null;
    }

    // Thêm một vật thể mới vào Canvas
    addElement(elem) {
        this.elements.push(elem);
        this.onStateChange();
        this.render();
    }

    // Xóa một vật thể khỏi Canvas
    deleteElement(elem) {
        if (!elem) return;
        
        // 1. Xóa vật thể
        this.elements = this.elements.filter(e => e.id !== elem.id);
        
        // 2. Xóa tất cả Connector liên kết tới vật thể này
        this.elements = this.elements.filter(e => {
            if (e instanceof ConnectorLine) {
                return e.fromId !== elem.id && e.toId !== elem.id;
            }
            return true;
        });

        if (this.selectedElement === elem) {
            this.selectedElement = null;
        }

        this.onStateChange();
        this.render();
    }

    // Xóa sạch toàn bộ canvas
    clearAll() {
        this.elements = [];
        this.selectedElement = null;
        this.onStateChange();
        this.render();
    }

    // Tìm kiếm vật thể tại tọa độ canvas chuột chỉ vào (Ưu tiên các vật thể vẽ đè lên trên cùng trước)
    getElementAt(p) {
        // Quét ngược từ cuối danh sách lên đầu (lớp trên cùng vẽ sau cùng)
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const elem = this.elements[i];
            // Không chọn trực tiếp Connector
            if (elem instanceof ConnectorLine) continue;
            
            if (elem.isPointInside(p)) {
                return elem;
            }
        }
        return null;
    }

    // Đăng ký tất cả các sự kiện tương tác
    registerEvents() {
        // Sự kiện chuột trên Canvas
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

        // Sự kiện cảm ứng chạm (Touch Events) cho điện thoại, máy tính bảng
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Cập nhật lại kích thước Canvas khi thay đổi kích thước cửa sổ trình duyệt
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    handleMouseDown(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const canvasMouse = this.screenToCanvas(mouseX, mouseY);
        this.startMousePos = { x: mouseX, y: mouseY };
        this.lastCanvasMousePos = { ...canvasMouse };

        // Kiểm tra xem chuột phải hoặc phím Space có đang được giữ để kéo màn hình (Pan) hay không
        // e.button === 2 đại diện cho click chuột phải
        if (e.button === 2 || this.currentTool === 'hand' || (e.button === 0 && e.shiftKey)) {
            this.isPanning = true;
            this.canvas.style.cursor = 'grabbing';
            e.preventDefault();
            return;
        }

        if (e.button !== 0) return; // Chỉ xử lý click chuột trái cho các hành động vẽ/chọn

        // A. CHẾ ĐỘ CHỌN & DI CHUYỂN
        if (this.currentTool === 'select') {
            // 1. Kiểm tra xem có click trúng góc thay đổi kích thước (Resize Handle) của vật thể đang chọn không
            // Chỉ cho phép resize nếu vật thể KHÔNG BỊ KHÓA
            if (this.selectedElement && !this.selectedElement.locked) {
                const handle = this.selectedElement.getResizeHandleAt(canvasMouse, this.zoom);
                if (handle) {
                    this.isResizing = true;
                    this.resizeHandle = handle;
                    this.draggedElementStartPos = { x: this.selectedElement.x, y: this.selectedElement.y };
                    this.draggedElementStartSize = { w: this.selectedElement.width, h: this.selectedElement.height };
                    return;
                }
            }

            // 2. Kiểm tra xem click trúng vật thể nào không
            const hitElement = this.getElementAt(canvasMouse);
            if (hitElement) {
                this.clearSelection();
                hitElement.selected = true;
                this.selectedElement = hitElement;
                
                // Chỉ cho phép kéo di chuyển nếu vật thể KHÔNG BỊ KHÓA
                if (!hitElement.locked) {
                    this.isDragging = true;
                    this.draggedElementStartPos = { x: hitElement.x, y: hitElement.y };
                    
                    // Đưa vật thể lên đầu danh sách hiển thị khi kéo thả để nhìn rõ hơn
                    this.elements = this.elements.filter(el => el.id !== hitElement.id);
                    this.elements.push(hitElement);
                }
                
                this.render();
            } else {
                // Click ra khoảng trống
                this.clearSelection();
                this.render();
            }
        }
        
        // B. CHẾ ĐỘ VẼ TỰ DO (DRAW)
        else if (this.currentTool === 'draw') {
            // Nếu đang chọn cục tẩy làm bút chính, chuyển sang chế độ tẩy nét
            if (this.brushType === 'eraser') {
                this.isErasing = true;
                this.eraseAt(canvasMouse);
                return;
            }

            this.isDrawing = true;
            
            // Tính toán độ dày và độ mờ thực tế của nét vẽ dựa vào loại đầu bút
            let activeWidth = this.strokeWidth;
            let activeOpacity = this.brushOpacity;
            
            if (this.brushType === 'pencil') {
                // Bút chì phác thảo: Nét mảnh hơn và mờ hơn
                activeWidth = Math.max(1.5, Math.round(this.strokeWidth / 2));
                activeOpacity = Math.min(activeOpacity, 0.65);
            } else if (this.brushType === 'highlighter') {
                // Bút dạ quang: Nét siêu rộng, đầu vuông/tròn và trong suốt (40% opacity)
                activeWidth = Math.max(18, this.strokeWidth * 4);
                activeOpacity = 0.35; 
            }
            
            this.currentPath = new DrawingPath([canvasMouse], this.strokeColor, activeWidth);
            this.currentPath.opacity = activeOpacity;
            this.currentPath.brushType = this.brushType;
            this.elements.push(this.currentPath);
            this.render();
        }

        // C. CHẾ ĐỘ TẨY NÉT VẼ (ERASE)
        else if (this.currentTool === 'erase') {
            this.isErasing = true;
            this.eraseAt(canvasMouse);
        }

        // D. CHẾ ĐỘ ĐƯỜNG KẾT NỐI (CONNECTOR)
        else if (this.currentTool === 'connector') {
            const startElem = this.getElementAt(canvasMouse);
            if (startElem) {
                this.isConnecting = true;
                this.currentConnector = new ConnectorLine(startElem.id, null);
                this.currentConnector.tempToPoint = canvasMouse;
                this.elements.push(this.currentConnector);
                this.render();
            }
        }
        
        // E. THÊM STICKY NOTE
        else if (this.currentTool === 'note') {
            const newNote = new StickyNote(canvasMouse.x - 80, canvasMouse.y - 80);
            newNote.color = this.noteColor;
            this.addElement(newNote);
            
            // Kích hoạt chế độ gõ chữ ngay lập tức
            setTimeout(() => this.triggerInlineEdit(newNote), 50);
            
            // Tự động chuyển về công cụ chọn sau khi thêm vật thể giống Apple Freeform
            this.setTool('select');
        }

        // F. THÊM SHAPE
        else if (this.currentTool === 'shape') {
            const newShape = new ShapeElement(this.currentShapeType, canvasMouse.x - 60, canvasMouse.y - 60);
            newShape.color = this.fillColor;
            newShape.strokeColor = this.strokeColor;
            this.addElement(newShape);
            
            this.setTool('select');
        }

        // G. THÊM TEXT
        else if (this.currentTool === 'text') {
            const newText = new TextElement(canvasMouse.x, canvasMouse.y);
            this.addElement(newText);
            
            setTimeout(() => this.triggerInlineEdit(newText), 50);
            this.setTool('select');
        }
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const canvasMouse = this.screenToCanvas(mouseX, mouseY);
        
        const dx = (mouseX - this.startMousePos.x) / this.zoom;
        const dy = (mouseY - this.startMousePos.y) / this.zoom;

        // A. DI CHUYỂN MÀN HÌNH (PAN CANVAS)
        if (this.isPanning) {
            this.panX += mouseX - this.startMousePos.x;
            this.panY += mouseY - this.startMousePos.y;
            this.startMousePos = { x: mouseX, y: mouseY };
            this.render();
            return;
        }

        // B. DI CHUYỂN VẬT THỂ
        if (this.isDragging && this.selectedElement) {
            if (this.selectedElement instanceof DrawingPath) {
                // Đối với nét vẽ tự do, di chuyển bằng hàm moveBy
                const cdx = canvasMouse.x - this.lastCanvasMousePos.x;
                const cdy = canvasMouse.y - this.lastCanvasMousePos.y;
                this.selectedElement.moveBy(cdx, cdy);
            } else {
                // Đối với note, shape, text, image thông thường
                let targetX = this.draggedElementStartPos.x + dx;
                let targetY = this.draggedElementStartPos.y + dy;
                
                // Áp dụng Grid Snapping nếu bật
                if (this.gridSnapEnabled) {
                    targetX = Utils.snapValue(targetX, this.snapSize);
                    targetY = Utils.snapValue(targetY, this.snapSize);
                }
                
                this.selectedElement.x = targetX;
                this.selectedElement.y = targetY;
            }
            this.lastCanvasMousePos = { ...canvasMouse };
            this.render();
            return;
        }

        // C. THAY ĐỔI KÍCH THƯỚC VẬT THỂ (RESIZE)
        if (this.isResizing && this.selectedElement) {
            // Tọa độ chuột sau khi hít lưới
            let currentMouseX = canvasMouse.x;
            let currentMouseY = canvasMouse.y;
            
            if (this.gridSnapEnabled) {
                currentMouseX = Utils.snapValue(currentMouseX, this.snapSize);
                currentMouseY = Utils.snapValue(currentMouseY, this.snapSize);
            }

            const cdx = currentMouseX - this.lastCanvasMousePos.x;
            const cdy = currentMouseY - this.lastCanvasMousePos.y;
            
            this.selectedElement.resizeBy(this.resizeHandle, cdx, cdy);
            
            this.lastCanvasMousePos = { x: currentMouseX, y: currentMouseY };
            this.render();
            return;
        }

        // D. ĐANG VẼ TỰ DO
        if (this.isDrawing && this.currentPath) {
            const points = this.currentPath.points;
            const lastPoint = points[points.length - 1];
            // Chỉ thêm điểm mới nếu khoảng cách tới điểm trước đó lớn hơn 3 pixel (lọc nhiễu & tối ưu bộ nhớ)
            if (!lastPoint || Utils.distance(canvasMouse, lastPoint) > 3) {
                points.push(canvasMouse);
                this.render();
            }
            return;
        }

        // E. ĐANG TẨY NÉT VẼ
        if (this.isErasing) {
            this.eraseAt(canvasMouse);
            return;
        }

        // F. ĐANG KÉO CONNECTOR
        if (this.isConnecting && this.currentConnector) {
            this.currentConnector.tempToPoint = canvasMouse;
            this.render();
            return;
        }
    }

    handleMouseUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
            this.setTool(this.currentTool); // Đặt lại con trỏ chuột
            return;
        }

        // KẾT THÚC KÉO THẢ DI CHUYỂN HOẶC RESIZE
        if (this.isDragging || this.isResizing) {
            this.isDragging = false;
            this.isResizing = false;
            this.resizeHandle = null;
            this.onStateChange();
            this.render();
            return;
        }

        // KẾT THÚC VẼ TỰ DO
        if (this.isDrawing && this.currentPath) {
            this.isDrawing = false;
            
            // Nếu đường vẽ quá ngắn (chỉ click chuột), loại bỏ nó
            if (this.currentPath.points.length <= 2) {
                this.elements = this.elements.filter(el => el.id !== this.currentPath.id);
            } else {
                this.currentPath.recalculateBounds();
            }
            
            this.currentPath = null;
            this.onStateChange();
            this.render();
            return;
        }

        // KẾT THÚC TẨY
        if (this.isErasing) {
            this.isErasing = false;
            return;
        }

        // KẾT THÚC KÉO CONNECTOR
        if (this.isConnecting && this.currentConnector) {
            this.isConnecting = false;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const canvasMouse = this.screenToCanvas(mouseX, mouseY);
            
            // Tìm vật thể đích nằm dưới con trỏ chuột
            const endElem = this.getElementAt(canvasMouse);
            
            // Chỉ kết nối nếu tìm thấy vật thể đích và vật thể đích KHÁC vật thể nguồn
            if (endElem && endElem.id !== this.currentConnector.fromId) {
                this.currentConnector.toId = endElem.id;
                this.currentConnector.tempToPoint = null;
            } else {
                // Không nối vào đâu, xóa connector tạm này đi
                this.elements = this.elements.filter(el => el.id !== this.currentConnector.id);
            }
            
            this.currentConnector = null;
            this.onStateChange();
            this.render();
            return;
        }
    }

    // Thực hiện tẩy nét vẽ tự do khi chuột quét qua
    eraseAt(p) {
        let deletedAny = false;
        
        // Quét tìm xem có chạm trúng nét vẽ tự do nào không để xóa
        this.elements = this.elements.filter(elem => {
            if (elem instanceof DrawingPath && elem.isPointInside(p)) {
                deletedAny = true;
                return false; // Loại bỏ khỏi mảng
            }
            return true;
        });

        if (deletedAny) {
            this.onStateChange();
            this.render();
        }
    }

    // Xử lý Phóng to/Thu nhỏ bằng con lăn chuột (Tập trung vào tâm con trỏ - Cursor-centric Zoom)
    handleWheel(e) {
        e.preventDefault(); // Ngăn trình duyệt cuộn trang web mặc định

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Lưu lại tọa độ chuột trên canvas vô cực trước khi zoom
        const mouseBeforeZoom = this.screenToCanvas(mouseX, mouseY);

        // Tính tỉ lệ zoom mới
        const zoomFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
        let newZoom = this.zoom * zoomFactor;

        // Giới hạn tỉ lệ zoom trong phạm vi an toàn
        newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));

        this.zoom = newZoom;

        // Tính toán độ dời panX, panY mới để giữ cho điểm con trỏ chuột đứng yên trên màn hình
        const mouseAfterZoom = this.screenToCanvas(mouseX, mouseY);
        this.panX += (mouseAfterZoom.x - mouseBeforeZoom.x) * this.zoom;
        this.panY += (mouseAfterZoom.y - mouseBeforeZoom.y) * this.zoom;

        // Cập nhật giá trị hiển thị phần trăm zoom trên giao diện
        const zoomValElem = document.getElementById('zoom-value');
        if (zoomValElem) {
            zoomValElem.innerText = Math.round(this.zoom * 100) + '%';
        }

        this.render();
    }

    // [TÍNH NĂNG MỚI]: Xử lý chạm cảm ứng đầu tiên (Touchstart) cho điện thoại, tablet
    handleTouchStart(e) {
        e.preventDefault(); // [QUAN TRỌNG]: Ngăn Chrome di động giả lập mousedown gây lỗi double firing
        
        if (e.touches.length === 1) {
            // Chạm 1 ngón tay -> Giả lập Click chuột trái mousedown
            const touch = e.touches[0];
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
                preventDefault: () => {}
            };
            this.handleMouseDown(mouseEvent);
        } else if (e.touches.length === 2) {
            // Chụm 2 ngón tay -> Bắt đầu zoom pinch & pan di động
            this.isPinching = true;
            this.touchStartDist = this.getTouchDistance(e);
            this.touchStartMid = this.getTouchMidpoint(e);
            
            // Ghi nhận trạng thái ban đầu
            this.touchStartPanX = this.panX;
            this.touchStartPanY = this.panY;
            this.touchStartZoom = this.zoom;
        }
    }

    // [TÍNH NĂNG MỚI]: Xử lý kéo chạm cảm ứng (Touchmove)
    handleTouchMove(e) {
        e.preventDefault(); // [QUAN TRỌNG]: Ngăn Chrome cuộn màn hình và giả lập mousemove
        
        if (e.touches.length === 1 && !this.isPinching) {
            // Vuốt 1 ngón tay -> Giả lập Di chuột mousemove
            const touch = e.touches[0];
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            };
            this.handleMouseMove(mouseEvent);
        } else if (e.touches.length === 2 && this.isPinching) {
            // 1. Tính toán Zoom (Pinch)
            const currentDist = this.getTouchDistance(e);
            if (this.touchStartDist > 0) {
                const scale = currentDist / this.touchStartDist;
                let newZoom = this.touchStartZoom * scale;
                // Giới hạn zoom
                newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));
                
                // 2. Tính toán Pan dịch chuyển trung điểm hai ngón tay
                const currentMid = this.getTouchMidpoint(e);
                const dx = currentMid.x - this.touchStartMid.x;
                const dy = currentMid.y - this.touchStartMid.y;
                
                const rect = this.canvas.getBoundingClientRect();
                const midX = currentMid.x - rect.left;
                const midY = currentMid.y - rect.top;
                
                // Thu phóng xoay quanh trung điểm 2 ngón tay làm tâm zoom
                const canvasX = (midX - this.touchStartPanX) / this.touchStartZoom;
                const canvasY = (midY - this.touchStartPanY) / this.touchStartZoom;
                
                this.zoom = newZoom;
                this.panX = midX - canvasX * this.zoom + dx;
                this.panY = midY - canvasY * this.zoom + dy;
                
                const zoomValElem = document.getElementById('zoom-value');
                if (zoomValElem) {
                    zoomValElem.innerText = Math.round(this.zoom * 100) + '%';
                }
                
                this.render();
            }
        }
    }

    // [TÍNH NĂNG MỚI]: Xử lý nhấc ngón tay cảm ứng (Touchend)
    handleTouchEnd(e) {
        if (this.isPinching) {
            if (e.touches.length < 2) {
                this.isPinching = false;
                if (e.touches.length === 1) {
                    // Cập nhật lại mốc tọa độ chuột cho ngón còn lại
                    const touch = e.touches[0];
                    this.lastCanvasMousePos = this.screenToCanvas(touch.clientX, touch.clientY);
                }
            }
        } else {
            // Thả ngón tay -> Giả lập Nhấc chuột mouseup có tọa độ chạm cuối cùng (changedTouches)
            const touch = e.changedTouches ? e.changedTouches[0] : null;
            const mouseEvent = {
                clientX: touch ? touch.clientX : (this.lastCanvasMousePos.x * this.zoom + this.panX),
                clientY: touch ? touch.clientY : (this.lastCanvasMousePos.y * this.zoom + this.panY),
                preventDefault: () => {}
            };
            this.handleMouseUp(mouseEvent);
        }
    }

    // Tính khoảng cách giữa 2 điểm ngón tay chạm màn hình
    getTouchDistance(e) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        if (!t1 || !t2) return 0;
        return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }

    // Tính trung điểm của hai điểm ngón tay chạm màn hình
    getTouchMidpoint(e) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        if (!t1 || !t2) return { x: 0, y: 0 };
        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
        };
    }

    // Zoom từng bước qua nút bấm (+ hoặc -)
    zoomStep(direction) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Tâm màn hình làm mốc zoom
        const mouseBeforeZoom = this.screenToCanvas(width / 2, height / 2);

        const zoomFactor = direction === 'in' ? 1.25 : 1 / 1.25;
        let newZoom = this.zoom * zoomFactor;
        newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));

        this.zoom = newZoom;

        const mouseAfterZoom = this.screenToCanvas(width / 2, height / 2);
        this.panX += (mouseAfterZoom.x - mouseBeforeZoom.x) * this.zoom;
        this.panY += (mouseAfterZoom.y - mouseBeforeZoom.y) * this.zoom;

        const zoomValElem = document.getElementById('zoom-value');
        if (zoomValElem) {
            zoomValElem.innerText = Math.round(this.zoom * 100) + '%';
        }

        this.render();
    }

    // Đặt lại zoom về tỉ lệ 1:1 và căn giữa màn hình
    zoomReset() {
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        
        const zoomValElem = document.getElementById('zoom-value');
        if (zoomValElem) {
            zoomValElem.innerText = '100%';
        }
        
        this.render();
    }

    // Gõ chữ trực tiếp lên vật thể (Inline Text Editing)
    triggerInlineEdit(elem) {
        if (!elem) return;

        // Xác định vị trí và kích thước trên màn hình hiển thị để đặt ô input đè lên
        const screenPos = this.canvasToScreen(elem.x, elem.y);
        const screenW = elem.width * this.zoom;
        const screenH = elem.height * this.zoom;

        // Tạo phần tử textarea soạn thảo động
        const editor = document.createElement('textarea');
        
        if (elem instanceof StickyNote) {
            editor.className = 'note-inline-editor';
            editor.style.left = `${screenPos.x}px`;
            editor.style.top = `${screenPos.y}px`;
            editor.style.width = `${screenW}px`;
            editor.style.height = `${screenH}px`;
            editor.style.fontSize = `${elem.fontSize * this.zoom}px`;
            editor.style.lineHeight = `${elem.fontSize * 1.3 * this.zoom}px`;
            editor.style.color = elem.textColor;
            // Padding tỉ lệ theo zoom
            const padding = 16 * this.zoom;
            editor.style.padding = `${padding}px`;
            editor.value = elem.text;
        } else if (elem instanceof TextElement) {
            editor.className = 'canvas-inline-editor';
            editor.style.left = `${screenPos.x}px`;
            editor.style.top = `${screenPos.y}px`;
            editor.style.width = `${Math.max(screenW, 120)}px`;
            editor.style.height = `${Math.max(screenH, 40)}px`;
            editor.style.fontSize = `${elem.fontSize * this.zoom}px`;
            editor.style.color = elem.textColor;
            editor.value = elem.text;
        } else if (elem instanceof ShapeElement) {
            editor.className = 'note-inline-editor';
            editor.style.left = `${screenPos.x + screenW*0.1}px`;
            editor.style.top = `${screenPos.y + screenH*0.1}px`;
            editor.style.width = `${screenW*0.8}px`;
            editor.style.height = `${screenH*0.8}px`;
            editor.style.fontSize = `${elem.fontSize * this.zoom}px`;
            editor.style.lineHeight = `${elem.fontSize * 1.3 * this.zoom}px`;
            editor.style.color = elem.textColor;
            editor.value = elem.text;
        }

        document.getElementById('app').appendChild(editor);
        editor.focus();

        // Xử lý sự kiện lưu chữ khi kết thúc gõ (blur hoặc ESC)
        const saveAndClose = () => {
            if (editor.parentNode) {
                const newValue = editor.value.trim();
                
                // Nếu là TextElement mà gõ trống thì xóa luôn vật thể
                if (elem instanceof TextElement && newValue === '') {
                    this.deleteElement(elem);
                } else {
                    elem.text = newValue;
                }
                
                editor.parentNode.removeChild(editor);
                this.onStateChange();
                this.render();
            }
        };

        editor.addEventListener('blur', saveAndClose);
        
        // Sự kiện phím bấm
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                saveAndClose();
            }
            // Đối với TextElement nhấn Enter là lưu, đối với Note nhấn Shift+Enter để xuống dòng
            if (e.key === 'Enter' && (elem instanceof TextElement || !e.shiftKey)) {
                e.preventDefault();
                saveAndClose();
            }
        });
    }
}
