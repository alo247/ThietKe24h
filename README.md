# 🏛️ 3D Architecture CAD Studio - AI Agent & Parametric Building System

Ứng dụng Web CAD 3D kiến trúc thế hệ mới kết hợp Hội đồng Tác tử AI (Paperclip AI Architecture System) hỗ trợ thiết kế nhà phố, đo đạc kích thước CAD, phối màu PBR và điều khiển rảnh tay bằng giọng nói tiếng Việt.

---

## 🌟 Tính Năng Nổi Bật

- **📐 Dựng Hình 3D & 2D Mặt Bằng:** Chuyển đổi linh hoạt giữa góc chiếu kỹ thuật 2D và phối cảnh 3D trực quan.
- **🏢 Hệ Thống Kiến Trúc Đa Tầng:** Hỗ trợ thiết kế nhà phố 3 tầng thực tế (5m x 16m), phân chia công năng 16 không gian (sân trước gara, phòng khách, giếng trời thông tầng, bếp ăn, phòng ngủ master spa, ban công, phòng thờ gia tiên, sân thượng BBQ, sân phơi giặt).
- **🤖 Hội Đồng 4 Chuyên Gia AI (Paperclip AI Squad):**
  - `@principal-architect`: Thiết kế quy hoạch công năng chuẩn TCVN.
  - `@structural-engineer`: Hệ khung dầm cột chịu lực TCVN 2737.
  - `@fengshui-master`: Bát Trạch & Thước Lỗ Ban 52.2cm.
  - `@interior-expert`: Phối màu PBR vật liệu cao cấp.
- **🎙️ Điều Khiển Rảnh Tay (Hands-Free Control):** Tích hợp Web Speech API tiếng Việt và bộ nhận diện ngôn ngữ tự nhiên: chuyển tầng, xoay camera, đổi góc nhìn, phóng to thu nhỏ, chọn vật thể và sơn tường hoàn toàn không cần chạm chuột.
- **🔑 Đăng Nhập & Chọn Model AI:** Hỗ trợ kết nối Google Gemini, OpenAI ChatGPT, Anthropic Claude và Paperclip Local Squad nội bộ.

---

## 🚀 Hướng Dẫn Chạy Cục Bộ (Local)

1. Cài đặt các thư viện cần thiết:
```bash
pip install -r requirements.txt
```

2. Khởi động máy chủ:
```bash
python server.py
```

3. Mở trình duyệt và truy cập:
```
http://localhost:8080/
```

---

## ☁️ Hướng Dẫn Đưa Lên GitHub & Triển Khai Vercel (Deploy)

### Bước 1: Đẩy mã nguồn lên GitHub

1. Truy cập [GitHub](https://github.com/new) và tạo một Repository mới (ví dụ đặt tên: `ai-architect-cad-3d`).
2. Mở terminal tại thư mục này và chạy các lệnh:

```bash
git remote add origin https://github.com/<tai-khoan-cua-ban>/ai-architect-cad-3d.git
git branch -M main
git push -u origin main
```

---

### Bước 2: Triển khai lên Vercel (Chỉ 1 Click)

1. Đăng nhập vào [Vercel](https://vercel.com/) (đăng nhập bằng tài khoản GitHub).
2. Tại trang Tổng quan (Dashboard), bấm nút **Add New...** -> chọn **Project**.
3. Tìm và bấm **Import** tại repository `ai-architect-cad-3d` vừa tạo.
4. Giữ nguyên toàn bộ cấu hình mặc định (Vercel sẽ tự động nhận diện `vercel.json` và runtime Python `api/index.py`).
5. Bấm nút **Deploy**.
6. Chờ khoảng 20-30 giây, Vercel sẽ cấp cho bạn một tên miền miễn phí dạng `https://ai-architect-cad-3d.vercel.app`!
