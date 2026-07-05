/* app.js - Trình điều khiển chính (Controller) của ứng dụng Freeform Plus */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Khởi tạo canvas vô cực
    const infiniteCanvas = new InfiniteCanvas('infinite-canvas');

    // Hàm đăng ký sự kiện an toàn chống lỗi null element
    function safeAddListener(id, event, callback) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener(event, callback);
            return elem;
        }
        return null;
    }

    // [TÍNH NĂNG MỚI]: Bật/Tắt Dropdown Actions Menu của dự án ở góc trái trên (Dùng pointerdown cho nhạy bén)
    const btnActionsMenu = document.getElementById('btn-actions-menu');
    const actionsMenuDropdown = document.querySelector('.actions-menu');
    
    if (btnActionsMenu && actionsMenuDropdown) {
        btnActionsMenu.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            actionsMenuDropdown.classList.toggle('show');
        });
        
        // Nhấp chuột ra ngoài khoảng trống để đóng Actions Menu
        window.addEventListener('pointerdown', (e) => {
            if (actionsMenuDropdown.classList.contains('show') && !btnActionsMenu.contains(e.target) && !actionsMenuDropdown.contains(e.target)) {
                actionsMenuDropdown.classList.remove('show');
            }
        });
    }
    
    // Hệ thống quản lý Undo/Redo
    const undoStack = [];
    const redoStack = [];
    const maxStackSize = 50; // Giới hạn lưu tối đa 50 bước lịch sử

    // 2. Hàm lưu trạng thái hiện tại vào lịch sử Undo (Deep Copy qua JSON serialization)
    function saveState() {
        // Chuyển đổi danh sách vật thể thành mảng dữ liệu thuần JSON
        const serialized = serializeElements(infiniteCanvas.elements);
        
        // Tránh lưu trùng lặp trạng thái giống hệt nhau liên tiếp
        if (undoStack.length > 0 && undoStack[undoStack.length - 1] === serialized) {
            return;
        }

        undoStack.push(serialized);
        if (undoStack.length > maxStackSize) {
            undoStack.shift(); // Loại bỏ bước cũ nhất nếu vượt quá giới hạn
        }
        
        // Xóa sạch stack Redo mỗi khi có hành động mới phát sinh
        redoStack.length = 0;
        updateUndoRedoButtons();
        
        // Tự động lưu vào LocalStorage để tránh mất dữ liệu khi F5
        localStorage.setItem('freeform_plus_project', serialized);
    }

    // Khôi phục trạng thái từ một chuỗi dữ liệu JSON
    function loadState(serializedState) {
        try {
            infiniteCanvas.elements = deserializeElements(serializedState);
            infiniteCanvas.clearSelection();
            infiniteCanvas.render();
            updateUndoRedoButtons();
        } catch (e) {
            console.error('Lỗi khi khôi phục trạng thái canvas:', e);
        }
    }

    // Quay lại thao tác trước (Undo)
    function undo() {
        if (undoStack.length <= 1) return; // Trạng thái đầu tiên là rỗng hoặc gốc
        
        const current = undoStack.pop();
        redoStack.push(current);
        
        const previous = undoStack[undoStack.length - 1];
        loadState(previous);
        
        // Cập nhật lại LocalStorage
        localStorage.setItem('freeform_plus_project', previous);
    }

    // Làm lại thao tác vừa Undo (Redo)
    function redo() {
        if (redoStack.length === 0) return;
        
        const next = redoStack.pop();
        undoStack.push(next);
        
        loadState(next);
        
        localStorage.setItem('freeform_plus_project', next);
    }

    // Cập nhật trạng thái hiển thị các nút Undo / Redo trên thanh công cụ
    function updateUndoRedoButtons() {
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');
        
        if (btnUndo) {
            btnUndo.disabled = undoStack.length <= 1;
            btnUndo.style.opacity = undoStack.length <= 1 ? '0.4' : '1';
        }
        if (btnRedo) {
            btnRedo.disabled = redoStack.length === 0;
            btnRedo.style.opacity = redoStack.length === 0 ? '0.4' : '1';
        }
    }

    // Lắng nghe thay đổi trên canvas để lưu lịch sử tự động
    infiniteCanvas.onStateChange = () => {
        saveState();
    };

    // 3. Quản lý tương tác các nút bấm trên Thanh công cụ (Toolbar)
    const toolButtons = {
        'select': document.getElementById('btn-select'),
        'hand': document.getElementById('btn-hand'),
        'draw': document.getElementById('btn-draw'),
        'erase': document.getElementById('btn-erase'),
        'note': document.getElementById('btn-note'),
        'shape': document.getElementById('btn-shape'),
        'text': document.getElementById('btn-text'),
        'connector': document.getElementById('btn-connector'),
        'image': document.getElementById('btn-image'),
        'bucket': document.getElementById('btn-bucket'),
        'color-picker': document.getElementById('btn-color-picker')
    };

    // Chuyển đổi nút active trực quan trên giao diện
    function setActiveToolButton(toolName) {
        Object.keys(toolButtons).forEach(key => {
            if (toolButtons[key]) {
                toolButtons[key].classList.remove('active');
            }
        });
        
        if (toolButtons[toolName]) {
            toolButtons[toolName].classList.add('active');
        }
        
        // [TÍNH NĂNG NÂNG CẤP]: Tự động hiển thị/ẩn thanh bút nổi Apple dưới đáy
        const palette = document.getElementById('bottom-brush-palette');
        const popover = document.getElementById('brush-options-popover');
        if (palette) {
            if (toolName === 'draw') {
                palette.classList.remove('hidden');
            } else {
                palette.classList.add('hidden');
                if (popover) popover.classList.add('hidden');
            }
        }
    }

    // Đăng ký sự kiện pointerdown/click cho các nút công cụ vẽ (bấm nhạy bén trên cả PC/Mobile)
    Object.keys(toolButtons).forEach(toolName => {
        const btn = toolButtons[toolName];
        if (btn) {
            // Đối với nút tải ảnh, sử dụng sự kiện click thông thường để không bị Chrome chặn hộp thoại chọn file
            if (toolName === 'image') {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const loader = document.getElementById('image-loader');
                    if (loader) loader.click();
                });
                return;
            }

            // Dùng 'click' thay vì 'pointerdown' để nút bấm ổn định hơn trên di động,
            // ngăn hiện tượng dropdown tự bật tự tắt vì double fire event.
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Đóng các dropdown menu khác nếu đang mở
                const shapesMenu = document.querySelector('.shapes-menu');
                if (toolName !== 'shape' && shapesMenu) {
                    shapesMenu.classList.remove('show');
                }
                if (actionsMenuDropdown) {
                    actionsMenuDropdown.classList.remove('show');
                }

                if (toolName === 'shape') {
                    if (shapesMenu) {
                        shapesMenu.classList.toggle('show');
                    }
                } else {
                    infiniteCanvas.setTool(toolName);
                    setActiveToolButton(toolName);
                }
            });
        }
    });

    // Lập trình chọn hình dạng trong dropdown menu Shapes (được coi là các công cụ chờ chọn dùng)
    const shapesMenu = document.querySelector('.shapes-menu');
    if (shapesMenu) {
        const shapeOptions = shapesMenu.querySelectorAll('.shape-option');
        shapeOptions.forEach(opt => {
            opt.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                // [FIX MOBILE]: Không dùng preventDefault ở đây để tránh dội ngược event, 
                // chỉ lấy thông tin công cụ rồi đóng menu
                const selectedShape = opt.getAttribute('data-shape');
                infiniteCanvas.currentShapeType = selectedShape;
                infiniteCanvas.setTool('shape');
                setActiveToolButton('shape');
                shapesMenu.classList.remove('show');
            });
        });
    }

    // Đăng ký sự kiện Fullscreen
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Lỗi toàn màn hình: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }

    // Đăng ký sự kiện đổi màu từ Toolbar (Paint Colors)
    const color1 = document.getElementById('toolbar-color-1');
    const color2 = document.getElementById('toolbar-color-2');
    if (color1) {
        color1.addEventListener('input', (e) => {
            const newColor = e.target.value;
            infiniteCanvas.strokeColor = newColor;
            // Đồng bộ màu cho brush (Color 1)
            const brushInput = document.getElementById('brush-color-input');
            const brushSwatch = document.getElementById('brush-color-swatch-circle');
            if (brushInput) brushInput.value = newColor;
            if (brushSwatch) brushSwatch.style.backgroundColor = newColor;
            // Nếu có vật thể đang chọn, đổi viền nó luôn
            if (infiniteCanvas.selectedElement) {
                infiniteCanvas.selectedElement.strokeColor = newColor;
            }
            infiniteCanvas.render();
        });
    }
    if (color2) {
        color2.addEventListener('input', (e) => {
            const newColor = e.target.value;
            infiniteCanvas.fillColor = newColor;
            // Nếu có vật thể đang chọn, đổi nền nó luôn
            if (infiniteCanvas.selectedElement && !(infiniteCanvas.selectedElement instanceof ConnectorLine)) {
                infiniteCanvas.selectedElement.color = newColor;
            }
            infiniteCanvas.render();
        });
    }


    // Nhấp chuột ra ngoài khoảng trống canvas để đóng menu Shapes
    window.addEventListener('pointerdown', (e) => {
        if (shapesMenu && shapesMenu.classList.contains('show') && !toolButtons['shape'].contains(e.target) && !shapesMenu.contains(e.target)) {
            shapesMenu.classList.remove('show');
        }
    });

    // Xuất dự án ra file JSON để người dùng lưu trữ cục bộ
    document.getElementById('btn-export-json').addEventListener('click', () => {
        const rawJson = serializeElements(infiniteCanvas.elements);
        const blob = new Blob([rawJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ThietKeNha_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    });

    // [TÍNH NĂNG MỚI]: Xuất bản vẽ CAD kỹ thuật định dạng DXF mở bằng AutoCAD
    document.getElementById('btn-export-dxf').addEventListener('click', () => {
        const dxfContent = exportToDXF(infiniteCanvas.elements);
        const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `BanVeNha_${Date.now()}.dxf`;
        a.click();
        
        URL.revokeObjectURL(url);
    });

    // Thuật toán kết xuất toàn bộ vật thể thành mã văn bản DXF (AutoCAD DXF)
    function exportToDXF(elements) {
        let dxf = [];

        // --- 1. PHẦN HEADER SECTION ---
        dxf.push("  0");
        dxf.push("SECTION");
        dxf.push("  2");
        dxf.push("HEADER");
        dxf.push("  0");
        dxf.push("ENDSEC");

        // --- 2. PHẦN TABLES SECTION (Định nghĩa Layer) ---
        dxf.push("  0");
        dxf.push("SECTION");
        dxf.push("  2");
        dxf.push("TABLES");
        dxf.push("  0");
        dxf.push("TABLE");
        dxf.push("  2");
        dxf.push("LTYPE"); // Kiểu nét vẽ liên tục
        dxf.push(" 70");
        dxf.push("1");
        dxf.push("  0");
        dxf.push("LTYPE");
        dxf.push("  2");
        dxf.push("CONTINUOUS");
        dxf.push(" 70");
        dxf.push("0");
        dxf.push("  3");
        dxf.push("Solid line");
        dxf.push(" 72");
        dxf.push("65");
        dxf.push(" 73");
        dxf.push("0");
        dxf.push(" 40");
        dxf.push("0.0");
        dxf.push("  0");
        dxf.push("ENDTAB");

        // Bảng định nghĩa các Layer màu sắc giống Freeform
        dxf.push("  0");
        dxf.push("TABLE");
        dxf.push("  2");
        dxf.push("LAYER");
        dxf.push(" 70");
        dxf.push("6");

        function addLayer(name, colorCode) {
            dxf.push("  0");
            dxf.push("LAYER");
            dxf.push("  2");
            dxf.push(name);
            dxf.push(" 70");
            dxf.push("0");
            dxf.push(" 62");
            dxf.push(colorCode.toString()); // Mã màu AutoCAD (7 = Trắng, 1 = Đỏ, 3 = Xanh lá, 4 = Cyan, 5 = Blue, 2 = Vàng)
            dxf.push("  6");
            dxf.push("CONTINUOUS");
        }

        addLayer("WALL", 7);      // Tường bao & Cửa sổ - Màu Trắng/Đen
        addLayer("DOOR", 1);      // Cánh cửa & Cung Arc - Màu Đỏ
        addLayer("FURNITURE", 3); // Giường, Sofa, Bàn ghế - Màu Xanh lá
        addLayer("MEASURE", 4);   // Đường đo đạc Connector - Màu Xanh ngọc
        addLayer("TEXT", 2);      // Văn bản ghi chú - Màu Vàng
        addLayer("DRAWING", 5);   // Nét bút vẽ tự do - Màu Xanh lam

        dxf.push("  0");
        dxf.push("ENDTAB");
        dxf.push("  0");
        dxf.push("ENDSEC");

        // --- 3. PHẦN ENTITIES SECTION (Chứa hình vẽ học) ---
        dxf.push("  0");
        dxf.push("SECTION");
        dxf.push("  2");
        dxf.push("ENTITIES");

        // Các hàm helper ghi lệnh DXF
        function drawDXFLine(x1, y1, x2, y2, layer) {
            dxf.push("  0");
            dxf.push("LINE");
            dxf.push("  8");
            dxf.push(layer);
            dxf.push(" 10");
            dxf.push(x1.toFixed(3));
            dxf.push(" 20");
            dxf.push(y1.toFixed(3));
            dxf.push(" 30");
            dxf.push("0.0");
            dxf.push(" 11");
            dxf.push(x2.toFixed(3));
            dxf.push(" 21");
            dxf.push(y2.toFixed(3));
            dxf.push(" 31");
            dxf.push("0.0");
        }

        function drawDXFCircle(cx, cy, r, layer) {
            dxf.push("  0");
            dxf.push("CIRCLE");
            dxf.push("  8");
            dxf.push(layer);
            dxf.push(" 10");
            dxf.push(cx.toFixed(3));
            dxf.push(" 20");
            dxf.push(cy.toFixed(3));
            dxf.push(" 30");
            dxf.push("0.0");
            dxf.push(" 40");
            dxf.push(r.toFixed(3));
        }

        function drawDXFArc(cx, cy, r, startAngle, endAngle, layer) {
            dxf.push("  0");
            dxf.push("ARC");
            dxf.push("  8");
            dxf.push(layer);
            dxf.push(" 10");
            dxf.push(cx.toFixed(3));
            dxf.push(" 20");
            dxf.push(cy.toFixed(3));
            dxf.push(" 30");
            dxf.push("0.0");
            dxf.push(" 40");
            dxf.push(r.toFixed(3));
            dxf.push(" 50");
            dxf.push(startAngle.toFixed(1));
            dxf.push(" 51");
            dxf.push(endAngle.toFixed(1));
        }

        function drawDXFPolyline(points, layer, closed = false) {
            dxf.push("  0");
            dxf.push("LWPOLYLINE");
            dxf.push("  8");
            dxf.push(layer);
            dxf.push(" 90");
            dxf.push(points.length.toString());
            dxf.push(" 70");
            dxf.push(closed ? "1" : "0");
            
            points.forEach(p => {
                dxf.push(" 10");
                dxf.push(p.x.toFixed(3));
                dxf.push(" 20");
                dxf.push(p.y.toFixed(3));
            });
        }

        function drawDXFText(textStr, x, y, height, layer, align = 0) {
            // Lọc các ký tự lạ tránh lỗi mở file DXF
            const cleanText = textStr.replace(/[^\w\s\.\,\-\:\(\)\/\u00C0-\u1EF9]/g, '');
            dxf.push("  0");
            dxf.push("TEXT");
            dxf.push("  8");
            dxf.push(layer);
            dxf.push(" 10");
            dxf.push(x.toFixed(3));
            dxf.push(" 20");
            dxf.push(y.toFixed(3));
            dxf.push(" 30");
            dxf.push("0.0");
            dxf.push(" 40");
            dxf.push(height.toFixed(3));
            dxf.push("  1");
            dxf.push(cleanText);
            if (align !== 0) {
                dxf.push(" 72");
                dxf.push(align.toString());
                dxf.push(" 11");
                dxf.push(x.toFixed(3));
                dxf.push(" 21");
                dxf.push(y.toFixed(3));
                dxf.push(" 31");
                dxf.push("0.0");
            }
        }

        elements.forEach(elem => {
            // Tỷ lệ quy đổi: 40px = 1m thực tế. Lật trục dọc Y
            const toCadX = px => px / 40;
            const toCadY = py => -py / 40;

            const cx1 = toCadX(elem.x);
            const cy1 = toCadY(elem.y);
            const cw = toCadX(elem.width);
            const ch = toCadY(elem.height); // âm do lật trục
            const cy2 = cy1 + ch;
            const cx2 = cx1 + cw;

            // 1. Thẻ Sticky Note
            if (elem.type === 'note') {
                const pts = [
                    { x: cx1, y: cy1 },
                    { x: cx2, y: cy1 },
                    { x: cx2, y: cy2 },
                    { x: cx1, y: cy2 }
                ];
                drawDXFPolyline(pts, "TEXT", true);
                if (elem.text) {
                    drawDXFText(elem.text.substring(0, 40), cx1 + cw/2, cy1 + ch/2, 0.35, "TEXT", 1);
                }
            }
            
            // 2. Chữ tự do
            else if (elem.type === 'text') {
                if (elem.text) {
                    drawDXFText(elem.text, cx1, cy1, 0.4, "TEXT");
                }
            }

            // 3. Hình dạng / Nội thất
            else if (elem.type === 'shape') {
                const shape = elem.shapeType;
                
                if (shape === 'wall') {
                    const pts = [
                        { x: cx1, y: cy1 },
                        { x: cx2, y: cy1 },
                        { x: cx2, y: cy2 },
                        { x: cx1, y: cy2 }
                    ];
                    drawDXFPolyline(pts, "WALL", true);
                }
                
                else if (shape === 'window') {
                    const pts = [
                        { x: cx1, y: cy1 },
                        { x: cx2, y: cy1 },
                        { x: cx2, y: cy2 },
                        { x: cx1, y: cy2 }
                    ];
                    drawDXFPolyline(pts, "WALL", true);
                    const midY = (cy1 + cy2) / 2;
                    drawDXFLine(cx1, midY, cx2, midY, "WALL");
                }

                else if (shape === 'door') {
                    const rx = cx1;
                    const ry = cy2;
                    const rRadius = Math.abs(ch);
                    
                    // Cánh cửa và bậu cửa
                    drawDXFLine(rx, ry, rx, ry + rRadius, "DOOR");
                    drawDXFLine(rx, ry, rx + rRadius, ry, "DOOR");
                    
                    // Cung quét cánh cửa 90 độ
                    drawDXFArc(rx, ry, rRadius, 0, 90, "DOOR");
                }

                else if (shape === 'bed') {
                    const pts = [
                        { x: cx1, y: cy1 },
                        { x: cx2, y: cy1 },
                        { x: cx2, y: cy2 },
                        { x: cx1, y: cy2 }
                    ];
                    drawDXFPolyline(pts, "FURNITURE", true);
                    
                    const pillowW = cw * 0.35;
                    const pillowH = ch * 0.15; // ch âm
                    
                    const p1 = [
                        { x: cx1 + cw * 0.1, y: cy1 + pillowH },
                        { x: cx1 + cw * 0.1 + pillowW, y: cy1 + pillowH },
                        { x: cx1 + cw * 0.1 + pillowW, y: cy1 },
                        { x: cx1 + cw * 0.1, y: cy1 }
                    ];
                    drawDXFPolyline(p1, "FURNITURE", true);

                    const p2 = [
                        { x: cx2 - cw * 0.1 - pillowW, y: cy1 + pillowH },
                        { x: cx2 - cw * 0.1, y: cy1 + pillowH },
                        { x: cx2 - cw * 0.1, y: cy1 },
                        { x: cx2 - cw * 0.1 - pillowW, y: cy1 }
                    ];
                    drawDXFPolyline(p2, "FURNITURE", true);
                    drawDXFLine(cx1, cy1 + ch * 0.4, cx2, cy1 + ch * 0.4, "FURNITURE");
                }

                else if (shape === 'sofa') {
                    const pts = [
                        { x: cx1, y: cy1 },
                        { x: cx2, y: cy1 },
                        { x: cx2, y: cy2 },
                        { x: cx1, y: cy2 }
                    ];
                    drawDXFPolyline(pts, "FURNITURE", true);
                    drawDXFLine(cx1, cy1 + ch * 0.2, cx2, cy1 + ch * 0.2, "FURNITURE");
                    drawDXFLine(cx1 + cw * 0.15, cy1, cx1 + cw * 0.15, cy2, "FURNITURE");
                    drawDXFLine(cx2 - cw * 0.15, cy1, cx2 - cw * 0.15, cy2, "FURNITURE");
                }

                else if (shape === 'table') {
                    const pts = [
                        { x: cx1 + cw*0.15, y: cy1 + ch*0.15 },
                        { x: cx2 - cw*0.15, y: cy1 + ch*0.15 },
                        { x: cx2 - cw*0.15, y: cy2 - ch*0.15 },
                        { x: cx1 + cw*0.15, y: cy2 - ch*0.15 }
                    ];
                    drawDXFPolyline(pts, "FURNITURE", true);
                    
                    const radius = Math.abs(ch) * 0.08;
                    drawDXFCircle(cx1 + cw*0.3, cy1 + ch*0.06, radius, "FURNITURE");
                    drawDXFCircle(cx1 + cw*0.7, cy1 + ch*0.06, radius, "FURNITURE");
                    drawDXFCircle(cx1 + cw*0.3, cy2 - ch*0.06, radius, "FURNITURE");
                    drawDXFCircle(cx1 + cw*0.7, cy2 - ch*0.06, radius, "FURNITURE");
                }

                else if (shape === 'plant') {
                    const cx = (cx1 + cx2) / 2;
                    const cy = (cy1 + cy2) / 2;
                    const r = Math.min(cw, Math.abs(ch)) / 2;
                    drawDXFCircle(cx, cy, r, "FURNITURE");
                    drawDXFCircle(cx, cy, r * 0.7, "FURNITURE");
                    drawDXFCircle(cx, cy, r * 0.4, "FURNITURE");
                }

                else if (shape === 'rectangle') {
                    const pts = [
                        { x: cx1, y: cy1 },
                        { x: cx2, y: cy1 },
                        { x: cx2, y: cy2 },
                        { x: cx1, y: cy2 }
                    ];
                    drawDXFPolyline(pts, "FURNITURE", true);
                }

                else if (shape === 'circle') {
                    const cx = (cx1 + cx2) / 2;
                    const cy = (cy1 + cy2) / 2;
                    const r = Math.min(cw, Math.abs(ch)) / 2;
                    drawDXFCircle(cx, cy, r, "FURNITURE");
                }

                else if (shape === 'triangle') {
                    const pts = [
                        { x: (cx1 + cx2) / 2, y: cy1 },
                        { x: cx2, y: cy2 },
                        { x: cx1, y: cy2 }
                    ];
                    drawDXFPolyline(pts, "FURNITURE", true);
                }
                
                if (elem.text) {
                    drawDXFText(elem.text, cx1 + cw/2, cy1 + ch/2, 0.3, "TEXT", 1);
                }
            }

            // 4. Đo đạc kích thước
            else if (elem instanceof ConnectorLine) {
                const fromEl = elements.find(el => el.id === elem.fromId);
                const toEl = elements.find(el => el.id === elem.toId);
                
                let p1 = elem.tempToPoint ? elem.tempToPoint : { x: elem.x, y: elem.y };
                let p2 = elem.tempToPoint ? elem.tempToPoint : { x: elem.x, y: elem.y };

                if (fromEl) p1 = fromEl.getCenter();
                if (toEl) p2 = toEl.getCenter();

                const dxfX1 = toCadX(p1.x);
                const dxfY1 = toCadY(p1.y);
                const dxfX2 = toCadX(p2.x);
                const dxfY2 = toCadY(p2.y);

                drawDXFLine(dxfX1, dxfY1, dxfX2, dxfY2, "MEASURE");

                const distMeter = (Utils.distance(p1, p2) / 40).toFixed(2) + "m";
                const midX = (dxfX1 + dxfX2) / 2;
                const midY = (dxfY1 + dxfY2) / 2;
                drawDXFText(distMeter, midX, midY + 0.15, 0.3, "MEASURE", 1);
            }

            // 5. Nét vẽ tự do
            else if (elem instanceof DrawingPath) {
                if (elem.points.length >= 2) {
                    const dxfPts = elem.points.map(p => ({
                        x: toCadX(p.x),
                        y: toCadY(p.y)
                    }));
                    drawDXFPolyline(dxfPts, "DRAWING", false);
                }
            }
        });

        // --- 4. KẾT THÚC FILE ---
        dxf.push("  0");
        dxf.push("ENDSEC");
        dxf.push("  0");
        dxf.push("EOF");

        return dxf.join("\n");
    }

    // 3. Xử lý các tương tác trên Canvas: Nhấp đúp để thêm chữ
    const canvasEl = document.getElementById('infinite-canvas');
    if (canvasEl) {
        canvasEl.addEventListener('dblclick', (e) => {
            const rect = canvasEl.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const canvasMouse = infiniteCanvas.screenToCanvas(screenX, screenY);
            
            // A. Nhấp đúp vào vật thể có sẵn: Chỉnh sửa chữ bên trong trực tiếp
            let clickedElem = null;
            for (let i = infiniteCanvas.elements.length - 1; i >= 0; i--) {
                const el = infiniteCanvas.elements[i];
                if (el.contains(canvasMouse.x, canvasMouse.y)) {
                    clickedElem = el;
                    break;
                }
            }

            if (clickedElem) {
                // Nhấp đúp vào bản vẽ tay (DrawingPath) -> nắn thẳng nét
                if (clickedElem instanceof DrawingPath && !clickedElem.locked) {
                    clickedElem.straighten();
                    saveState();
                    infiniteCanvas.render();
                }
                // Nhấp đúp vào Note, Shape, Text -> Chỉnh sửa văn bản
                else if (clickedElem instanceof StickyNote || clickedElem instanceof ShapeElement || clickedElem instanceof TextElement) {
                    infiniteCanvas.triggerInlineEdit(clickedElem);
                }
            } 
            // B. Nhấn đúp ra ngoài khoảng trống canvas: Tự động tạo Sticky Note nhanh tại vị trí đó
            else if (infiniteCanvas.currentTool === 'select') {
                const newNote = new StickyNote(canvasMouse.x - 80, canvasMouse.y - 80);
                newNote.color = infiniteCanvas.noteColor || '#FFF9C4';
                infiniteCanvas.addElement(newNote);
                
                setTimeout(() => infiniteCanvas.triggerInlineEdit(newNote), 50);
            }
        });
    }

    // 5. Quản lý Bảng thuộc tính (Property Inspector Panel)
    const inspectorPanel = document.getElementById('inspector-panel');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const strokeColorInput = document.getElementById('prop-stroke-color');
    const strokeWidthSelect = document.getElementById('prop-stroke-width');
    const fontSizeSelect = document.getElementById('prop-font-size');
    const textColorInput = document.getElementById('prop-text-color');
    
    // Các phần tử chỉnh kích thước theo mét
    const propDimWidth = document.getElementById('prop-dim-width');
    const propDimHeight = document.getElementById('prop-dim-height');
    const propDimensionGroup = document.getElementById('prop-dimension-group');
    
    // Tự động đóng/mở và cập nhật dữ liệu bảng thuộc tính khi chọn vật thể
    const originalRender = infiniteCanvas.render;
    infiniteCanvas.render = function() {
        // Chạy hàm render gốc
        originalRender.call(infiniteCanvas);
        
        // Cập nhật hiển thị Inspector Panel
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            inspectorPanel.classList.remove('hidden');
            
            // Ẩn/Hiện các nhóm thuộc tính tương thích với loại vật thể
            const colorGroup = document.getElementById('prop-color-group');
            const strokeGroup = document.getElementById('prop-stroke-group');
            const textGroup = document.getElementById('prop-text-group');

            // Đồng bộ kích thước lên ô input (nếu vật thể hỗ trợ co giãn)
            if (selected instanceof StickyNote || selected instanceof ShapeElement || selected instanceof ImageElement) {
                propDimensionGroup.style.display = 'block';
                // Chỉ điền giá trị nếu người dùng không đang gõ trực tiếp (tránh trôi con trỏ chuột)
                if (document.activeElement !== propDimWidth) {
                    propDimWidth.value = Utils.pxToMeter(selected.width);
                }
                if (document.activeElement !== propDimHeight) {
                    propDimHeight.value = Utils.pxToMeter(selected.height);
                }
            } else {
                propDimensionGroup.style.display = 'none';
            }

            if (selected instanceof StickyNote) {
                colorGroup.style.display = 'block';
                strokeGroup.style.display = 'none'; // Note không có viền chỉnh được
                textGroup.style.display = 'block';
                
                // Đồng bộ giá trị lên UI
                fontSizeSelect.value = selected.fontSize;
                textColorInput.value = selected.textColor;
                updateActiveColorSwatch(selected.color);
            } else if (selected instanceof ShapeElement) {
                colorGroup.style.display = 'block';
                strokeGroup.style.display = 'block';
                textGroup.style.display = 'block';
                
                fontSizeSelect.value = selected.fontSize;
                textColorInput.value = selected.textColor;
                strokeColorInput.value = selected.strokeColor;
                strokeWidthSelect.value = selected.strokeWidth;
                updateActiveColorSwatch(selected.color);
            } else if (selected instanceof TextElement) {
                colorGroup.style.display = 'none';
                strokeGroup.style.display = 'none';
                textGroup.style.display = 'block';
                
                fontSizeSelect.value = selected.fontSize;
                textColorInput.value = selected.textColor;
            } else if (selected instanceof DrawingPath) {
                colorGroup.style.display = 'none';
                strokeGroup.style.display = 'block'; // Xem màu vẽ nét ở mục viền
                textGroup.style.display = 'none';
                
                strokeColorInput.value = selected.strokeColor;
                strokeWidthSelect.value = selected.strokeWidth;
            } else if (selected instanceof ImageElement) {
                colorGroup.style.display = 'none';
                strokeGroup.style.display = 'none';
                textGroup.style.display = 'none';
            }
        } else {
            inspectorPanel.classList.add('hidden');
        }
    };

    // Đánh dấu swatch màu đang được chọn
    function updateActiveColorSwatch(hexColor) {
        colorSwatches.forEach(sw => {
            const swColor = sw.getAttribute('data-color');
            if (swColor.toLowerCase() === (hexColor || '').toLowerCase()) {
                sw.classList.add('active');
            } else {
                sw.classList.remove('active');
            }
        });
    }

    // Sự kiện thay đổi màu nền (Color Swatches)
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.getAttribute('data-color');
            const selected = infiniteCanvas.selectedElement;
            if (selected && (selected instanceof StickyNote || selected instanceof ShapeElement)) {
                selected.color = color;
                
                // Đồng thời ghi nhớ làm màu mặc định cho vật thể tạo mới sau này
                if (selected instanceof StickyNote) {
                    infiniteCanvas.noteColor = color;
                } else {
                    infiniteCanvas.fillColor = color;
                }
                
                saveState();
                infiniteCanvas.render();
            }
        });
    });

    // Sự kiện thay đổi màu viền
    strokeColorInput.addEventListener('change', () => {
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            selected.strokeColor = strokeColorInput.value;
            if (selected instanceof DrawingPath) {
                infiniteCanvas.strokeColor = strokeColorInput.value;
            }
            saveState();
            infiniteCanvas.render();
        }
    });

    // Sự kiện thay đổi độ dày viền
    strokeWidthSelect.addEventListener('change', () => {
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            selected.strokeWidth = parseInt(strokeWidthSelect.value);
            if (selected instanceof DrawingPath) {
                infiniteCanvas.strokeWidth = parseInt(strokeWidthSelect.value);
            }
            saveState();
            infiniteCanvas.render();
        }
    });

    // Sự kiện thay đổi cỡ chữ
    fontSizeSelect.addEventListener('change', () => {
        const selected = infiniteCanvas.selectedElement;
        if (selected && (selected instanceof StickyNote || selected instanceof ShapeElement || selected instanceof TextElement)) {
            selected.fontSize = parseInt(fontSizeSelect.value);
            saveState();
            infiniteCanvas.render();
        }
    });

    // Sự kiện thay đổi màu chữ
    textColorInput.addEventListener('change', () => {
        const selected = infiniteCanvas.selectedElement;
        if (selected && (selected instanceof StickyNote || selected instanceof ShapeElement || selected instanceof TextElement)) {
            selected.textColor = textColorInput.value;
            saveState();
            infiniteCanvas.render();
        }
    });

    // [TÍNH NĂNG THIẾT KẾ NHÀ]: Sự kiện gõ thay đổi kích thước mét trực tiếp
    propDimWidth.addEventListener('input', () => {
        const selected = infiniteCanvas.selectedElement;
        if (selected && propDimWidth.value > 0) {
            const newW = Utils.meterToPx(parseFloat(propDimWidth.value));
            
            if (selected instanceof ImageElement) {
                selected.width = newW;
                selected.height = newW / selected.aspectRatio;
                propDimHeight.value = Utils.pxToMeter(selected.height);
            } else {
                selected.width = newW;
            }
            saveState();
            infiniteCanvas.render();
        }
    });

    propDimHeight.addEventListener('input', () => {
        const selected = infiniteCanvas.selectedElement;
        if (selected && propDimHeight.value > 0) {
            const newH = Utils.meterToPx(parseFloat(propDimHeight.value));
            
            if (selected instanceof ImageElement) {
                selected.height = newH;
                selected.width = newH * selected.aspectRatio;
                propDimWidth.value = Utils.pxToMeter(selected.width);
            } else {
                selected.height = newH;
            }
            saveState();
            infiniteCanvas.render();
        }
    });

    // Quản lý nút Bật/Tắt Hít lưới Nam châm (Grid Snapping)
    const btnSnapToggle = safeAddListener('btn-snap-toggle', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        infiniteCanvas.gridSnapEnabled = !infiniteCanvas.gridSnapEnabled;
        const btn = document.getElementById('btn-snap-toggle');
        if (btn) {
            if (infiniteCanvas.gridSnapEnabled) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    // Đưa vật thể lên trên cùng hoặc ra sau cùng
    safeAddListener('btn-bring-front', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            infiniteCanvas.elements = infiniteCanvas.elements.filter(el => el.id !== selected.id);
            infiniteCanvas.elements.push(selected);
            saveState();
            infiniteCanvas.render();
        }
    });

    safeAddListener('btn-send-back', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            infiniteCanvas.elements = infiniteCanvas.elements.filter(el => el.id !== selected.id);
            infiniteCanvas.elements.unshift(selected); // Thêm vào đầu mảng (vẽ dưới cùng)
            saveState();
            infiniteCanvas.render();
        }
    });

    // Xóa vật thể qua nút thùng rác
    safeAddListener('btn-delete-element', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (infiniteCanvas.selectedElement) {
            infiniteCanvas.deleteElement(infiniteCanvas.selectedElement);
        }
    });

    // 6. Xử lý tải ảnh lên (Image Loader)
    const imageLoader = document.getElementById('image-loader');
    if (imageLoader) {
        imageLoader.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const centerCanvas = infiniteCanvas.screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
                    const newImgElem = new ImageElement(img, centerCanvas.x - 100, centerCanvas.y - 100, 200);
                    infiniteCanvas.addElement(newImgElem);
                    infiniteCanvas.setTool('select');
                    setActiveToolButton('select');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
            imageLoader.value = '';
        });
    }

    // 7. Quản lý Dự án & Bộ nút góc trái (JSON/PNG Export & Import)
    
    // Nút Xóa hết canvas (Tạo dự án mới)
    safeAddListener('btn-clear-canvas', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ bản vẽ trên canvas không? Thao tác này có thể hoàn tác.')) {
            infiniteCanvas.clearAll();
            if (actionsMenuDropdown) {
                actionsMenuDropdown.classList.remove('show');
            }
        }
    });

    // Nút Lưu dự án (Export JSON)
    safeAddListener('btn-export-json', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const serialized = serializeElements(infiniteCanvas.elements);
        const blob = new Blob([serialized], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `freeform_project_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (actionsMenuDropdown) {
            actionsMenuDropdown.classList.remove('show');
        }
    });

    // Nút Mở dự án (Import JSON)
    const jsonLoader = document.getElementById('json-loader');
    safeAddListener('btn-import-json-trigger', 'click', (e) => {
        e.stopPropagation();
        if (jsonLoader) {
            jsonLoader.click();
        }
    });

    if (jsonLoader) {
        jsonLoader.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                loadState(content);
                saveState();
                if (actionsMenuDropdown) {
                    actionsMenuDropdown.classList.remove('show');
                }
            };
            reader.readAsText(file);
            jsonLoader.value = '';
        });
    }

    // Nút Xuất hình ảnh PNG (Smart Crop PNG Export)
    safeAddListener('btn-export-png', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        triggerPNGExport();
        if (actionsMenuDropdown) {
            actionsMenuDropdown.classList.remove('show');
        }
    });

    function triggerPNGExport() {
        if (infiniteCanvas.elements.length === 0) {
            alert('Canvas đang trống, không có gì để xuất ảnh!');
            return;
        }

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        infiniteCanvas.elements.forEach(elem => {
            if (elem instanceof ConnectorLine) return;
            const bounds = elem.getBounds();
            if (bounds.x < minX) minX = bounds.x;
            if (bounds.y < minY) minY = bounds.y;
            if (bounds.x + bounds.width > maxX) maxX = bounds.x + bounds.width;
            if (bounds.y + bounds.height > maxY) maxY = bounds.y + bounds.height;
        });

        if (minX === Infinity) {
            minX = -100; minY = -100; maxX = 100; maxY = 100;
        }

        const padding = 40;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const exportW = maxX - minX;
        const exportH = maxY - minY;

        const offCanvas = document.createElement('canvas');
        offCanvas.width = exportW;
        offCanvas.height = exportH;
        const offCtx = offCanvas.getContext('2d');

        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, exportW, exportH);

        offCtx.save();
        offCtx.translate(-minX, -minY);

        infiniteCanvas.elements.forEach(elem => {
            if (elem instanceof ConnectorLine) {
                elem.draw(offCtx, 1.0, infiniteCanvas.elements);
            }
        });

        // Vẽ các vật thể còn lại
        infiniteCanvas.elements.forEach(elem => {
            if (!(elem instanceof ConnectorLine)) {
                // Tạm thời bỏ qua viền chọn khi xuất ảnh
                const wasSelected = elem.selected;
                elem.selected = false;
                elem.draw(offCtx, 1.0);
                elem.selected = wasSelected;
            }
        });

        offCtx.restore();

        // 3. Tải xuống ảnh
        const imgUrl = offCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = `freeform_board_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // 8. Quản lý Bộ thu phóng (Zoom Control)
    safeAddListener('btn-zoom-in', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        infiniteCanvas.zoomStep('in');
    });
    
    safeAddListener('btn-zoom-out', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        infiniteCanvas.zoomStep('out');
    });
    
    safeAddListener('btn-zoom-reset', 'pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        infiniteCanvas.zoomReset();
    });

    // --- QUẢN LÝ THANH BÚT VẼ NỔI APPLE ---
    const bottomBrushPalette = document.getElementById('bottom-brush-palette');
    const brushPopover = document.getElementById('brush-options-popover');
    
    const brushItems = {
        'pen': document.getElementById('brush-pen'),
        'pencil': document.getElementById('brush-pencil'),
        'highlighter': document.getElementById('brush-highlighter'),
        'eraser': document.getElementById('brush-eraser')
    };

    const brushColorInput = document.getElementById('brush-color-input');
    const brushColorCircle = document.getElementById('brush-color-swatch-circle');
    const brushOpacityInput = document.getElementById('brush-opacity-input');
    const brushOpacityValue = document.getElementById('brush-opacity-value');
    const sizeOptBtns = document.querySelectorAll('.size-opt-btn');

    // Chuyển đổi trạng thái active của các cây bút
    function setActiveBrush(brushType) {
        Object.keys(brushItems).forEach(key => {
            if (brushItems[key]) {
                brushItems[key].classList.remove('active');
            }
        });
        
        if (brushItems[brushType]) {
            brushItems[brushType].classList.add('active');
        }
        infiniteCanvas.brushType = brushType;

        // Đồng bộ màu sắc bút và con trỏ
        if (brushType === 'eraser') {
            infiniteCanvas.canvas.style.cursor = 'cell';
        } else {
            infiniteCanvas.canvas.style.cursor = 'crosshair';
        }
    }

    // Gắn sự kiện pointerdown cho các cây bút vẽ đáy (chạm nhạy bén tức thì)
    Object.keys(brushItems).forEach(brushType => {
        const btn = brushItems[brushType];
        if (btn) {
            btn.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                e.preventDefault(); // Ngăn hành vi chạm trễ mặc định
                
                // Nếu bấm vào cây bút ĐÃ ĐANG CHỌN -> Hiển thị popover chỉnh thuộc tính ngay trên đầu nó!
                if (infiniteCanvas.brushType === brushType && brushType !== 'eraser') {
                    const isHidden = brushPopover.classList.contains('hidden');
                    if (isHidden) {
                        // Tính toán tọa độ popover để căn giữa ngay trên đầu cây bút được click
                        const btnRect = btn.getBoundingClientRect();
                        const leftPos = btnRect.left + btnRect.width / 2;
                        
                        brushPopover.style.left = `${leftPos}px`;
                        brushPopover.style.transform = `translateX(-50%)`;
                        brushPopover.classList.remove('hidden');
                        
                        // Đồng bộ giá trị hiện tại lên Popover
                        syncBrushPopoverValues();
                    } else {
                        brushPopover.classList.add('hidden');
                    }
                } else {
                    // Chọn bút mới
                    setActiveBrush(brushType);
                    brushPopover.classList.add('hidden');
                }
            });
        }
    });

    // Đồng bộ thuộc tính lên popover
    function syncBrushPopoverValues() {
        // Độ mờ
        brushOpacityInput.value = Math.round(infiniteCanvas.brushOpacity * 100);
        brushOpacityValue.innerText = brushOpacityInput.value + '%';
        
        // Độ dày (chọn nút tương ứng)
        sizeOptBtns.forEach(btn => {
            const size = parseInt(btn.getAttribute('data-size'));
            if (size === infiniteCanvas.strokeWidth) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Chọn size bút vẽ trong Popover
    sizeOptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeOptBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const size = parseInt(btn.getAttribute('data-size'));
            infiniteCanvas.strokeWidth = size;
        });
    });

    // Kéo thanh trượt Opacity trong Popover
    brushOpacityInput.addEventListener('input', () => {
        const val = brushOpacityInput.value;
        brushOpacityValue.innerText = val + '%';
        infiniteCanvas.brushOpacity = val / 100;
    });

    // Chọn màu sắc của đầu bút
    brushColorInput.addEventListener('input', () => {
        const color = brushColorInput.value;
        infiniteCanvas.strokeColor = color;
        brushColorCircle.style.backgroundColor = color;
    });

    // Nhấp ra khoảng trống ngoài canvas hoặc popover để tự động đóng popover
    window.addEventListener('mousedown', (e) => {
        if (brushPopover && !brushPopover.contains(e.target) && !bottomBrushPalette.contains(e.target)) {
            brushPopover.classList.add('hidden');
        }
    });

    // Nhấp ra khoảng trống ngoài canvas hoặc popover để tự động đóng popover
    window.addEventListener('mousedown', (e) => {
        if (brushPopover && !brushPopover.contains(e.target) && !bottomBrushPalette.contains(e.target)) {
            brushPopover.classList.add('hidden');
        }
    });

    // --- QUẢN LÝ CLIPBOARD VÀ MENU NGỮ CẢNH NỔI (CONTEXT MENU) ---
    let clipboardElementData = null; // Lưu trữ dữ liệu vật thể được copy

    // Hàm sao chép thuộc tính vật thể
    function copyElement(elem) {
        if (!elem || elem instanceof ConnectorLine) return;
        
        const data = {
            type: elem.type,
            width: elem.width,
            height: elem.height,
            color: elem.color,
            strokeColor: elem.strokeColor,
            strokeWidth: elem.strokeWidth,
            textColor: elem.textColor,
            fontSize: elem.fontSize,
            text: elem.text,
            aspectLocked: elem.aspectLocked
        };
        
        if (elem instanceof ShapeElement) {
            data.shapeType = elem.shapeType;
        } else if (elem instanceof DrawingPath) {
            data.points = elem.points.map(p => ({ x: p.x, y: p.y }));
            data.opacity = elem.opacity;
            data.brushType = elem.brushType;
        } else if (elem instanceof ImageElement) {
            data.imgSrc = elem.img.src;
        }
        
        clipboardElementData = data;
    }

    // Hàm dán vật thể tại tọa độ màn hình chỉ định
    function pasteElement(screenX, screenY) {
        if (!clipboardElementData) return;
        
        const data = clipboardElementData;
        let newElem = null;
        
        // Tọa độ dán mặc định là giữa màn hình
        const sx = screenX !== undefined ? screenX : (window.innerWidth / 2 - 50);
        const sy = screenY !== undefined ? screenY : (window.innerHeight / 2 - 50);
        const canvasPos = infiniteCanvas.screenToCanvas(sx, sy);

        if (data.type === 'note') {
            newElem = new StickyNote(canvasPos.x, canvasPos.y, data.text);
            newElem.width = data.width;
            newElem.height = data.height;
            newElem.color = data.color;
            newElem.textColor = data.textColor;
            newElem.fontSize = data.fontSize;
        } else if (data.type === 'shape') {
            newElem = new ShapeElement(data.shapeType, canvasPos.x, canvasPos.y);
            newElem.width = data.width;
            newElem.height = data.height;
            newElem.color = data.color;
            newElem.strokeColor = data.strokeColor;
            newElem.strokeWidth = data.strokeWidth;
            newElem.textColor = data.textColor;
            newElem.fontSize = data.fontSize;
            newElem.text = data.text;
        } else if (data.type === 'text') {
            newElem = new TextElement(canvasPos.x, canvasPos.y, data.text);
            newElem.textColor = data.textColor;
            newElem.fontSize = data.fontSize;
        } else if (data.type === 'drawing') {
            let minX = Infinity, minY = Infinity;
            data.points.forEach(p => {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
            });
            const dx = canvasPos.x - minX;
            const dy = canvasPos.y - minY;
            const newPoints = data.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
            
            newElem = new DrawingPath(newPoints, data.strokeColor, data.strokeWidth);
            newElem.opacity = data.opacity;
            newElem.brushType = data.brushType;
        } else if (data.type === 'image') {
            const img = new Image();
            img.src = data.imgSrc;
            newElem = new ImageElement(img, canvasPos.x, canvasPos.y, data.width, data.height);
            img.onload = () => infiniteCanvas.render();
        }

        if (newElem) {
            newElem.aspectLocked = data.aspectLocked;
            infiniteCanvas.clearSelection();
            newElem.selected = true;
            infiniteCanvas.selectedElement = newElem;
            infiniteCanvas.addElement(newElem);
        }
    }

    // Đăng ký các sự kiện trên Menu Ngữ cảnh Nổi
    document.getElementById('ctx-send-back').addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            infiniteCanvas.elements = infiniteCanvas.elements.filter(el => el.id !== selected.id);
            infiniteCanvas.elements.unshift(selected);
            saveState();
            infiniteCanvas.render();
        }
    });

    document.getElementById('ctx-bring-front').addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            infiniteCanvas.elements = infiniteCanvas.elements.filter(el => el.id !== selected.id);
            infiniteCanvas.elements.push(selected);
            saveState();
            infiniteCanvas.render();
        }
    });

    document.getElementById('ctx-cut').addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            copyElement(selected);
            infiniteCanvas.deleteElement(selected);
        }
    });

    document.getElementById('ctx-copy').addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            copyElement(selected);
        }
    });

    document.getElementById('ctx-duplicate').addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            copyElement(selected);
            // Dán lệch đi 24px so với vật thể cũ
            const screenPos = infiniteCanvas.canvasToScreen(selected.x, selected.y);
            pasteElement(screenPos.x + 24, screenPos.y + 24);
            saveState();
        }
    });

    document.getElementById('ctx-lock').addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            selected.locked = !selected.locked; // Đảo trạng thái khóa
            saveState();
            infiniteCanvas.render();
        }
    });

    document.getElementById('ctx-aspect').addEventListener('click', (e) => {
        e.stopPropagation();
        const selected = infiniteCanvas.selectedElement;
        if (selected) {
            selected.aspectLocked = !selected.aspectLocked; // Đảo trạng thái khóa tỉ lệ
            saveState();
            infiniteCanvas.render();
        }
    });

    // Thay đổi nhanh hình dạng Shape trong Submenu
    document.querySelectorAll('.ctx-submenu-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const selected = infiniteCanvas.selectedElement;
            if (selected && selected instanceof ShapeElement) {
                const newShape = btn.getAttribute('data-shape');
                selected.shapeType = newShape;
                
                // Tối ưu hóa kích thước & màu mặc định nếu đổi sang các đối tượng kiến trúc
                if (newShape === 'wall') {
                    selected.width = 160;
                    selected.height = 15;
                    selected.color = '#5c5c5e';
                } else if (newShape === 'door' || newShape === 'window') {
                    selected.width = 60;
                    selected.height = 60;
                    selected.color = '#e1f5fe';
                } else if (newShape === 'bed') {
                    selected.width = 80;
                    selected.height = 100;
                } else if (newShape === 'sofa') {
                    selected.width = 120;
                    selected.height = 50;
                }
                
                saveState();
                infiniteCanvas.render();
            }
        });
    });

    // Theo dõi tọa độ chuột màn hình hiện tại phục vụ dán (Paste) đúng vị trí chuột
    let currentGlobalMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.addEventListener('mousemove', (e) => {
        currentGlobalMousePos.x = e.clientX;
        currentGlobalMousePos.y = e.clientY;
    });

    // 9. Xử lý các Phím tắt hệ thống (Keyboard Shortcuts)
    window.addEventListener('keydown', (e) => {
        // Bỏ qua nếu đang gõ chữ trong ô input/textarea soạn thảo
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        const key = e.key.toLowerCase();
        
        // Ctrl + Z: Undo
        if ((e.ctrlKey || e.metaKey) && key === 'z') {
            e.preventDefault();
            undo();
        }
        
        // Ctrl + Y: Redo
        if ((e.ctrlKey || e.metaKey) && key === 'y') {
            e.preventDefault();
            redo();
        }

        // Ctrl + C: Sao chép
        if ((e.ctrlKey || e.metaKey) && key === 'c') {
            if (infiniteCanvas.selectedElement) {
                e.preventDefault();
                copyElement(infiniteCanvas.selectedElement);
            }
        }

        // Ctrl + X: Cắt
        if ((e.ctrlKey || e.metaKey) && key === 'x') {
            if (infiniteCanvas.selectedElement) {
                e.preventDefault();
                copyElement(infiniteCanvas.selectedElement);
                infiniteCanvas.deleteElement(infiniteCanvas.selectedElement);
            }
        }

        // Ctrl + V: Dán
        if ((e.ctrlKey || e.metaKey) && key === 'v') {
            e.preventDefault();
            pasteElement(currentGlobalMousePos.x, currentGlobalMousePos.y);
            saveState();
        }

        // Ctrl + D: Nhân bản
        if ((e.ctrlKey || e.metaKey) && key === 'd') {
            if (infiniteCanvas.selectedElement) {
                e.preventDefault();
                copyElement(infiniteCanvas.selectedElement);
                const screenPos = infiniteCanvas.canvasToScreen(infiniteCanvas.selectedElement.x, infiniteCanvas.selectedElement.y);
                pasteElement(screenPos.x + 24, screenPos.y + 24);
                saveState();
            }
        }

        // Delete hoặc Backspace: Xóa vật thể
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (infiniteCanvas.selectedElement) {
                // Không cho xóa nếu vật thể đang bị khóa
                if (!infiniteCanvas.selectedElement.locked) {
                    infiniteCanvas.deleteElement(infiniteCanvas.selectedElement);
                }
            }
        }

        // Phím tắt đổi công cụ vẽ giống Apple Freeform
        if (key === 'v') {
            infiniteCanvas.setTool('select');
            setActiveToolButton('select');
        } else if (key === 'g') {
            if (btnSnapToggle) btnSnapToggle.click();
        } else if (key === 'h') {
            infiniteCanvas.setTool('hand');
            setActiveToolButton('hand');
        } else if (key === 'p') {
            infiniteCanvas.setTool('draw');
            setActiveToolButton('draw');
        } else if (key === 'e') {
            infiniteCanvas.setTool('erase');
            setActiveToolButton('erase');
        } else if (key === 'n') {
            infiniteCanvas.setTool('note');
            setActiveToolButton('note');
        } else if (key === 's') {
            infiniteCanvas.setTool('shape');
            setActiveToolButton('shape');
        } else if (key === 't') {
            infiniteCanvas.setTool('text');
            setActiveToolButton('text');
        } else if (key === 'c') {
            infiniteCanvas.setTool('connector');
            setActiveToolButton('connector');
        } else if (key === 'i') {
            document.getElementById('image-loader').click();
        }

        // Nhấn Space để chuyển nhanh sang công cụ Hand tạm thời (Pan)
        if (e.key === ' ' && !infiniteCanvas.isPanning) {
            infiniteCanvas.canvas.style.cursor = 'grab';
        }
    });

    // Ngăn hiển thị Menu chuột phải mặc định của trình duyệt để dùng làm Pan màn hình
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 10. Các hàm tuần tự hóa dữ liệu (Serialization)
    function serializeElements(elements) {
        const rawData = elements.map(el => {
            const data = {
                type: el.type,
                id: el.id,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                color: el.color,
                strokeColor: el.strokeColor,
                strokeWidth: el.strokeWidth,
                textColor: el.textColor,
                fontSize: el.fontSize,
                text: el.text
            };

            // Lưu thuộc tính bổ sung theo từng loại
            if (el instanceof ShapeElement) {
                data.shapeType = el.shapeType;
            } else if (el instanceof DrawingPath) {
                data.points = el.points;
                data.opacity = el.opacity;      // Ghi nhận độ mờ
                data.brushType = el.brushType;  // Ghi nhận loại ngòi bút
            } else if (el instanceof ImageElement) {
                data.imgSrc = el.img.src;
            } else if (el instanceof ConnectorLine) {
                data.fromId = el.fromId;
                data.toId = el.toId;
                data.lineStyle = el.lineStyle;
            }
            return data;
        });

        return JSON.stringify(rawData);
    }

    // Khôi phục mảng các đối tượng từ chuỗi JSON (Có kiểm tra bảo vệ try-catch chống hỏng LocalStorage)
    function deserializeElements(jsonString) {
        if (!jsonString) return [];
        
        let rawData;
        try {
            rawData = JSON.parse(jsonString);
            if (!Array.isArray(rawData)) return [];
        } catch (e) {
            console.error('Lỗi phân tích cú pháp chuỗi JSON dự án:', e);
            return [];
        }

        const loadedElements = [];
        const pendingConnectors = [];

        rawData.forEach(data => {
            try {
                if (!data || !data.type) return;

                if (data.type === 'note') {
                    const note = new StickyNote(data.x || 0, data.y || 0, data.text || '');
                    note.id = data.id || note.id;
                    note.width = data.width !== undefined ? data.width : note.width;
                    note.height = data.height !== undefined ? data.height : note.height;
                    note.color = data.color || note.color;
                    note.textColor = data.textColor || note.textColor;
                    note.fontSize = data.fontSize !== undefined ? data.fontSize : note.fontSize;
                    note.locked = data.locked || false;
                    note.aspectLocked = data.aspectLocked || false;
                    loadedElements.push(note);
                } else if (data.type === 'shape') {
                    const shape = new ShapeElement(data.shapeType || 'rectangle', data.x || 0, data.y || 0);
                    shape.id = data.id || shape.id;
                    shape.width = data.width !== undefined ? data.width : shape.width;
                    shape.height = data.height !== undefined ? data.height : shape.height;
                    shape.color = data.color || shape.color;
                    shape.strokeColor = data.strokeColor || shape.strokeColor;
                    shape.strokeWidth = data.strokeWidth !== undefined ? data.strokeWidth : shape.strokeWidth;
                    shape.textColor = data.textColor || shape.textColor;
                    shape.fontSize = data.fontSize !== undefined ? data.fontSize : shape.fontSize;
                    shape.text = data.text || '';
                    shape.locked = data.locked || false;
                    shape.aspectLocked = data.aspectLocked || false;
                    loadedElements.push(shape);
                } else if (data.type === 'text') {
                    const text = new TextElement(data.x || 0, data.y || 0, data.text || '');
                    text.id = data.id || text.id;
                    text.textColor = data.textColor || text.textColor;
                    text.fontSize = data.fontSize !== undefined ? data.fontSize : text.fontSize;
                    text.locked = data.locked || false;
                    text.aspectLocked = data.aspectLocked || false;
                    loadedElements.push(text);
                } else if (data.type === 'drawing') {
                    const pts = Array.isArray(data.points) ? data.points : [];
                    const draw = new DrawingPath(pts, data.strokeColor || '#1d1d1f', data.strokeWidth || 4);
                    draw.id = data.id || draw.id;
                    draw.x = data.x !== undefined ? data.x : draw.x;
                    draw.y = data.y !== undefined ? data.y : draw.y;
                    draw.width = data.width !== undefined ? data.width : draw.width;
                    draw.height = data.height !== undefined ? data.height : draw.height;
                    draw.opacity = data.opacity !== undefined ? data.opacity : 1.0;
                    draw.brushType = data.brushType || 'pen';
                    draw.locked = data.locked || false;
                    draw.aspectLocked = data.aspectLocked || false;
                    loadedElements.push(draw);
                } else if (data.type === 'image') {
                    const img = new Image();
                    img.src = data.imgSrc || '';
                    const imgElem = new ImageElement(img, data.x || 0, data.y || 0, data.width || 200, data.height || 200);
                    imgElem.id = data.id || imgElem.id;
                    imgElem.locked = data.locked || false;
                    imgElem.aspectLocked = data.aspectLocked || false;
                    
                    img.onload = () => {
                        infiniteCanvas.render();
                    };
                    loadedElements.push(imgElem);
                } else if (data.type === 'connector') {
                    pendingConnectors.push(data);
                }
            } catch (elemErr) {
                console.error("Lỗi khi phục hồi một đối tượng đồ họa hỏng:", elemErr, data);
            }
        });

        // Tạo các ConnectorLine và nạp vào danh sách
        pendingConnectors.forEach(data => {
            try {
                if (!data.fromId || !data.toId) return;
                const conn = new ConnectorLine(data.fromId, data.toId);
                conn.id = data.id || conn.id;
                conn.strokeColor = data.strokeColor || conn.strokeColor;
                conn.strokeWidth = data.strokeWidth !== undefined ? data.strokeWidth : conn.strokeWidth;
                conn.lineStyle = data.lineStyle || conn.lineStyle;
                loadedElements.push(conn);
            } catch (connErr) {
                console.error("Lỗi khi phục hồi connector hỏng:", connErr, data);
            }
        });

        return loadedElements;
    }

    // 11. Khởi động: Tải dự án cũ từ LocalStorage (nếu có)
    const savedProject = localStorage.getItem('freeform_plus_project');
    if (savedProject) {
        loadState(savedProject);
    } else {
        // Tạo sẵn một Sticky Note chào mừng cho người dùng dễ làm quen
        const centerCanvas = infiniteCanvas.screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
        
        const welcomeNote = new StickyNote(centerCanvas.x - 80, centerCanvas.y - 80, 
            "Chào mừng bạn đến với Freeform Plus! \n\nDouble click vào Note hoặc Shape để gõ chữ. \n\nNhấn P để vẽ tự do, sau đó nhấn đúp vào nét vẽ để làm thẳng."
        );
        infiniteCanvas.addElement(welcomeNote);
    }
    
    // Lưu trạng thái ban đầu vào stack lịch sử
    saveState();
});
