const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const authModal = \
    <!-- Auth Modal (Tài khoản) -->
    <div id="auth-modal" class="modal-overlay hidden">
        <div class="glass-panel modal-content">
            <h2 id="auth-title">Đăng nhập</h2>
            <div class="auth-tabs">
                <button id="tab-login" class="active">Đăng nhập</button>
                <button id="tab-register">Đăng ký</button>
            </div>
            <input type="email" id="auth-email" placeholder="Email của bạn">
            <input type="password" id="auth-password" placeholder="Mật khẩu">
            <button id="btn-auth-submit" class="primary-btn">Xác nhận</button>
            <button id="btn-auth-close" class="secondary-btn">Đóng</button>
            <p id="auth-error" class="error-msg"></p>
        </div>
    </div>
    
    <!-- Admin Modal -->
    <div id="admin-modal" class="modal-overlay hidden">
        <div class="glass-panel modal-content admin-content">
            <h2>Quản lý Hệ thống (Admin)</h2>
            <div class="admin-stats">
                <div class="stat-box">Thành viên: <span id="admin-users-count">0</span></div>
                <div class="stat-box">Dự án: <span id="admin-projects-count">0</span></div>
            </div>
            <h3>Danh sách dự án</h3>
            <ul id="admin-project-list" class="project-list"></ul>
            <div class="modal-actions">
                <button id="btn-admin-close" class="secondary-btn">Đóng</button>
            </div>
        </div>
    </div>
    
    <!-- Projects Modal -->
    <div id="projects-modal" class="modal-overlay hidden">
        <div class="glass-panel modal-content">
            <h2>Thiết kế của tôi</h2>
            <ul id="user-project-list" class="project-list"></ul>
            <div class="modal-actions">
                <button id="btn-projects-close" class="secondary-btn">Đóng</button>
            </div>
        </div>
    </div>
\;

// Tìm thẻ đóng </body> và chèn nội dung vào trước nó
html = html.replace('</body>', authModal + '\n</body>');
fs.writeFileSync('index.html', html);
