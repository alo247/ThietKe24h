// store.js — Lưu trữ cục bộ (localStorage) + xuất/nhập tệp dự án.
const KEY = 'freeform.web.doc.v1';
const CAM_KEY = 'freeform.web.cam.v1';

export const Store = {
  saveDoc(json) {
    try { localStorage.setItem(KEY, json); } catch (e) { /* bộ nhớ đầy: bỏ qua */ }
  },
  loadDoc() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  },
  saveCamera(cam) {
    try {
      localStorage.setItem(CAM_KEY, JSON.stringify({ x: cam.x, y: cam.y, zoom: cam.zoom }));
    } catch (e) { /* bỏ qua */ }
  },
  loadCamera() {
    try {
      const s = localStorage.getItem(CAM_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  },

  // Tải một chuỗi văn bản xuống dưới dạng tệp
  download(filename, content, mime = 'application/json') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  downloadDataURL(filename, dataURL) {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
