# 🏡 PHẦN MỀM THIẾT KẾ NHÀ 2D & 3D CHUYÊN NGHIỆP (THIẾT KẾ 24H)
> Hệ thống thiết kế kiến trúc và nội thất 2D/3D trực quan, lấy cảm hứng từ HomeByMe / Planner 5D, tối ưu hóa theo triết lý: **NHẸ — NHANH — ĐƠN GIẢN — DỄ DÙNG — ÍT CODE NHẤT**.

---

## 🏛️ 1. CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

```text
ThietKeNha/
├── src/
│   ├── core/                        # Bộ não tính toán & đồ họa cốt lõi
│   │   ├── geometry/                # Hình học giải tích & toán học cục bộ (Deterministic Math)
│   │   │   ├── DimensionMath.ts     # Tính khoảng cách, góc, chu vi, diện tích m² (Shoelace Formula)
│   │   │   └── RoomDetector.ts      # Tự động tìm chu trình khép kín nhận diện phòng & tính diện tích
│   │   ├── 3d/                      # Động cơ đồ họa 3D WebGL Three.js
│   │   │   └── ThreeViewport3D.tsx  # OrbitControls 360°, First-Person Walkthrough, PBR Materials, Sun Shadows
│   │   ├── catalog/                 # Hệ thống danh mục sản phẩm & vật liệu quang học
│   │   │   ├── FurnitureCatalog.ts  # 11 phân khu chức năng (Khách, Ngủ, Bếp, Ăn, Tắm, Thờ, Ban công, Vườn...)
│   │   │   └── MaterialCatalog.ts   # Vật liệu PBR (Gỗ, Đá Marble, Gạch, Sơn, Kính, Kim loại, Vải, Bê tông)
│   │   ├── ai/                      # Trí tuệ nhân tạo kiến trúc sư
│   │   │   └── AIHomePlanner.ts     # Tự động phân tích câu lệnh tiếng Việt đa phòng ("Nhà 8x13m 4PN 1 thờ...")
│   │   └── calculations/            # Thống kê khối lượng & dự toán
│   │       └── QuantityTakeoff.ts   # Bóc tách khối lượng tường, sàn, cửa và dự toán kinh phí BOQ
│   ├── components/                  # Giao diện người dùng chuẩn công nghiệp
│   │   ├── TopNavHeader.tsx         # New | Open | Save | Undo | Redo | 2D | 3D | AI | Render | Export
│   │   ├── LeftSidebarCatalog.tsx   # Thanh công cụ Kiến Trúc, Nội Thất 11 phòng & Vật liệu PBR
│   │   ├── RightPropertiesPanel.tsx # Bảng thuộc tính chi tiết (Dài, Rộng, Cao, Diện tích, Góc, Vật liệu)
│   │   ├── AICommandBar.tsx         # Thanh nhập lệnh tự nhiên AI bằng giọng nói & phím gõ
│   │   ├── BoardCanvas.tsx          # Mặt bằng tương tác 2D kéo thả, snap điểm & hiển thị thước đo
│   │   ├── HouseTemplatesModal.tsx  # Thư viện 50 Mẫu Thiết Kế Nhà Cao Cấp bản quyền
│   │   ├── CostEstimateModal.tsx    # Bảng báo cáo dự toán kinh phí & xuất Excel CSV
│   │   ├── AIRenderStudioModal.tsx  # Studio xuất ảnh phối cảnh 3D siêu thực 4K (Ray-tracing)
│   │   ├── AIVisionModal.tsx        # AI Vision: Quét ảnh 2D/3D trích xuất bản vẽ 1-chạm
│   │   └── AIAccountModal.tsx       # Trung tâm kết nối đa tài khoản AI (OpenAI, Gemini, Claude, DeepSeek...)
│   ├── services/
│   │   ├── aiArchitectEngine.ts     # Xử lý ngôn ngữ tự nhiên NLP tiếng Việt 2 chiều
│   │   ├── dxfExporter.ts           # Xuất file bản vẽ AutoCAD (.DXF) chuẩn thi công 6 layer
│   │   └── aiVisionService.ts       # Xử lý thị giác máy tính và render phối cảnh
│   ├── data/
│   │   ├── houseTemplates.ts        # 50 Mẫu nhà kiến trúc & Mẫu Penthouse chuẩn ảnh thực tế
│   │   └── architecturalSymbols.ts  # Thư viện biểu tượng 2D chuẩn kiến trúc
│   ├── types.ts                     # Schema dữ liệu TypeScript đầy đủ Dài (X) x Rộng (Y) x Cao (Z)
│   ├── App.tsx                      # Master Layout kết nối toàn bộ hệ sinh thái
│   └── main.tsx                     # Entry point React 19 + Tailwind CSS
├── package.json
└── README.md
```

---

## ⚡ 2. CÔNG NGHỆ ĐÃ CHỌN VÀ LÝ DO (TECH STACK & RATIONALE)

1. **Three.js (WebGL Engine):** Thư viện đồ họa 3D mã nguồn mở chuẩn mực số 1 thế giới, chạy mượt mà 60 FPS trên mọi trình duyệt mà không cần cài đặt plugin.
2. **React 19 + TypeScript:** Đảm bảo tính an toàn kiểu dữ liệu 100% (Type-Safe), tái sử dụng component tối đa, chống crash runtime.
3. **Tailwind CSS v4 + Motion:** Giao diện phong cách Apple Glassmorphism siêu nhẹ, mượt mà, hỗ trợ tự động Dark/Light mode và đa thiết bị.
4. **Toán Học Giải Tích Cục Bộ (Deterministic Math):** 
   - Sử dụng công thức Shoelace (Gauss Area) và thuật toán Half-Edge Minimal Cycle để tính diện tích m² và nhận diện phòng khép kín tự động.
   - **Tuyệt đối không lãng phí token/gọi AI** cho các phép toán hình học hay tính chu vi/diện tích.
5. **AutoCAD DXF Exporter (R12/2000 ASCII):** Xuất trực tiếp bản vẽ thi công mở được trên mọi phiên bản AutoCAD, Revit, SketchUp.

---

## 🚀 3. HƯỚNG DẪN CHẠY & BUILD DỰ ÁN

### Yêu cầu môi trường:
- Node.js >= 18.0.0
- npm >= 9.0.0

### Cách chạy môi trường phát triển (Development):
```bash
# Cài đặt thư viện
npm install

# Khởi chạy server phát triển
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

### Cách build bản phát hành (Production Build):
```bash
# Kiểm tra Type-check TypeScript
npm run lint

# Đóng gói tối ưu hóa cho Production
npm run build
# File đóng gói hoàn chỉnh nằm trong thư mục: dist/
```

### Đóng gói thành Windows Desktop App (Tauri / Electron):
Dự án được thiết kế hoàn toàn tương thích với **Tauri v2** (siêu nhẹ, < 15MB RAM):
```bash
# Thêm Tauri CLI
npm install -D @tauri-apps/cli

# Khởi tạo và đóng gói Windows .exe / .msi
npx tauri init
npx tauri build
```

---

## 🛋️ 4. HƯỚNG DẪN MỞ RỘNG CATALOG LÊN 50.000+ SẢN PHẨM

Hệ thống Catalog được thiết kế theo mô hình **Metadata Lightweight + Lazy Loading**:
1. **Dữ liệu cấu trúc JSON:** File `src/core/catalog/FurnitureCatalog.ts` định nghĩa `CatalogProduct` gọn nhẹ (chỉ lưu kích thước bao Dài x Rộng x Cao, SKU, danh mục, giá).
2. **Load Model 3D Theo Yêu Cầu (On-Demand):** Chỉ khi người dùng kéo thả vật thể vào phòng, Three.js mới tải GLTF/GLB tương ứng qua URL CDN hoặc IndexedDB cache cục bộ.
3. **Phân trang & Ảo hóa (Virtualization):** Danh sách sidebar hỗ trợ tìm kiếm và cuộn ảo hóa (Virtual Scroll), không bao giờ gây lag bộ nhớ dù catalog có 50.000+ món đồ.

---

## 🔐 5. BẢO MẬT & QUY TẮC AN TOÀN
- **Không Hardcode API Key:** Mọi khóa API AI (OpenAI / Gemini / Claude) đều được lưu cục bộ trong `LocalStorage` của trình duyệt người dùng qua Modal Đăng Nhập AI.
- **Hoạt Động Offline 100%:** Các tính năng vẽ 2D, xem 3D, tính diện tích, xuất AutoCAD DXF, dự toán BOQ và 50 mẫu nhà đều chạy offline hoàn toàn trên máy người dùng mà không cần internet.
