# Quy tắc phát triển dự án Freeform Plus

- **Tự động đẩy mã nguồn lên GitHub (Bắt buộc)**: Sau mỗi lần thực hiện chỉnh sửa, sửa đổi hoặc nâng cấp các tệp mã nguồn của dự án (như `index.html`, `styles.css`, `canvas.js`, `elements.js`, `app.js`, `utils.js`), Agent bắt buộc phải chạy các lệnh Git sau để tự động cập nhật và đồng bộ lên kho lưu trữ GitHub của người dùng (`https://github.com/alo247/thietke.git`) trước khi kết thúc lượt làm việc:
  1. `git add .`
  2. `git commit -m "Auto-update: [Tóm tắt thay đổi vừa thực hiện]"`
  3. `git push`

- **Ngôn ngữ phản hồi & Bình luận**: Luôn sử dụng tiếng Việt để phản hồi thông tin. Mọi ghi chú (comments) được viết thêm hoặc sửa đổi trong mã nguồn hoặc file tài liệu của dự án đều phải sử dụng tiếng Việt.
