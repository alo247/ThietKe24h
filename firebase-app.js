/**
 * HỆ THỐNG AUTH & DATABASE (FIREBASE MOCK / LOCALSTORAGE)
 * Hỗ trợ Đăng nhập, Lưu thiết kế, Quản lý Admin.
 */

// Trạng thái hệ thống
let currentUser = null;
let autoSaveInterval = null;

// Lấy tham chiếu các phần tử UI
const authModal = document.getElementById('auth-modal');
const projectsModal = document.getElementById('projects-modal');
const adminModal = document.getElementById('admin-modal');
const btnAccount = document.getElementById('btn-account');
const btnSave = document.getElementById('btn-save');
const btnOpen = document.getElementById('btn-open');

// Khởi tạo
function initBackend() {
    // Hàm đăng ký sự kiện an toàn
    function safeAdd(id, event, callback) {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener(event, callback);
            return elem;
        }
        return null;
    }

    // 1. Kiểm tra trạng thái đăng nhập từ localStorage
    const savedUser = localStorage.getItem('canvas_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        const userEmailDisp = document.getElementById('user-email-display');
        const userNameDisp = document.getElementById('user-name-display');
        const userAvatarChar = document.getElementById('user-avatar-char');
        const userInfoPanel = document.getElementById('user-info-panel');
        
        if (userEmailDisp) userEmailDisp.innerText = currentUser.email;
        if (userNameDisp) userNameDisp.innerText = currentUser.email.split('@')[0];
        if (userAvatarChar) userAvatarChar.innerText = currentUser.email.charAt(0).toUpperCase();
        if (userInfoPanel) userInfoPanel.classList.remove('hidden');
        
        const authFormArea = document.getElementById('auth-form-area');
        if (authFormArea) authFormArea.style.display = 'none';
        
        if (currentUser.isAdmin) {
            // Mở trực tiếp admin panel nếu là admin
            openAdminPanel();
        }
        
        // Kích hoạt auto-save mỗi 1 phút (60,000 ms)
        startAutoSave();
    }
    
    // 2. Gắn sự kiện UI
    if (btnAccount) btnAccount.addEventListener('click', () => authModal.classList.remove('hidden'));
    if (btnSave) btnSave.addEventListener('click', () => saveProjectToCloud(false));
    if (btnOpen) btnOpen.addEventListener('click', openProjectList);
    
    // Đóng authModal khi click ra ngoài overlay
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.add('hidden');
            }
        });
    }
    
    const btnAuthClose = document.getElementById('btn-auth-close');
    if (btnAuthClose) {
        btnAuthClose.addEventListener('click', () => authModal.classList.add('hidden'));
    }
    
    safeAdd('btn-projects-close', 'click', () => projectsModal.classList.add('hidden'));
    safeAdd('btn-admin-close', 'click', () => adminModal.classList.add('hidden'));
    
    // Ghi nhận lượt truy cập
    let views = parseInt(localStorage.getItem('canvas_page_views') || '0');
    localStorage.setItem('canvas_page_views', (views + 1).toString());
    
    // Nút Google Login Fake
    safeAdd('btn-google-login', 'click', () => {
        alert("Đây là Giao diện Mô phỏng (Fake) Đăng nhập Google. Để hoạt động thật, vui lòng kết nối với Firebase Config.");
    });
    
    // Nút Đổi mật khẩu
    safeAdd('btn-change-password', 'click', () => {
        if (!currentUser) return;
        const newPwd = prompt("Nhập mật khẩu mới của bạn:");
        if (newPwd) {
            let users = JSON.parse(localStorage.getItem('canvas_users_db') || '[]');
            let uIndex = users.findIndex(u => u.id === currentUser.id);
            if (uIndex > -1) {
                users[uIndex].pwd = newPwd.trim();
                localStorage.setItem('canvas_users_db', JSON.stringify(users));
                currentUser.pwd = newPwd.trim();
                localStorage.setItem('canvas_user', JSON.stringify(currentUser));
                alert("Đổi mật khẩu thành công!");
            }
        }
    });
    
    // Auth Tabs
    safeAdd('tab-login', 'click', (e) => {
        e.target.classList.add('active');
        const tabReg = document.getElementById('tab-register');
        const authTitle = document.getElementById('auth-title');
        if (tabReg) tabReg.classList.remove('active');
        if (authTitle) authTitle.innerText = 'Đăng nhập Firebase';
    });
    
    safeAdd('tab-register', 'click', (e) => {
        e.target.classList.add('active');
        const tabLog = document.getElementById('tab-login');
        const authTitle = document.getElementById('auth-title');
        if (tabLog) tabLog.classList.remove('active');
        if (authTitle) authTitle.innerText = 'Đăng ký Tài khoản';
    });
    
    // Xử lý Submit (Đăng nhập / Đăng ký Fake bằng LocalStorage)
    safeAdd('btn-auth-submit', 'click', () => {
        const emailEl = document.getElementById('auth-email');
        const pwdEl = document.getElementById('auth-password');
        const tabReg = document.getElementById('tab-register');
        const err = document.getElementById('auth-error');
        
        if (!emailEl || !pwdEl || !err) return;
        
        const email = emailEl.value.trim();
        const pwd = pwdEl.value.trim();
        const isRegister = tabReg ? tabReg.classList.contains('active') : false;
        
        if (!email || !pwd) {
            err.innerText = "Vui lòng nhập Email và Mật khẩu.";
            return;
        }
        
        let users = JSON.parse(localStorage.getItem('canvas_users_db') || '[]');
        
        if (isRegister) {
            if (users.find(u => u.email === email)) {
                err.innerText = "Tài khoản này đã được đăng ký!";
                return;
            }
            const newUser = { 
                id: Date.now().toString(), 
                email, 
                pwd, // Trong thực tế phải mã hoá
                isAdmin: (email === 'admin' && pwd === 'pppp9999')
            };
            users.push(newUser);
            localStorage.setItem('canvas_users_db', JSON.stringify(users));
            loginUser(newUser);
        } else {
            // Trường hợp user đăng nhập là admin/pppp9999 chưa tồn tại thì auto tạo (vì hard code)
            if (email === 'admin' && pwd === 'pppp9999' && !users.find(u => u.email === 'admin')) {
                const adminUser = { id: 'admin_sys', email: 'admin', pwd: 'pppp9999', isAdmin: true };
                users.push(adminUser);
                localStorage.setItem('canvas_users_db', JSON.stringify(users));
                loginUser(adminUser);
                return;
            }
            
            const user = users.find(u => u.email === email && u.pwd === pwd);
            if (!user) {
                err.innerText = "Sai tên đăng nhập hoặc mật khẩu!";
                return;
            }
            loginUser(user);
        }
    });
    
    // Đăng xuất
    safeAdd('btn-logout', 'click', () => {
        currentUser = null;
        localStorage.removeItem('canvas_user');
        stopAutoSave();
        location.reload(); // Tải lại trang để làm sạch canvas
    });
    
    // Mở Admin
    safeAdd('btn-open-admin', 'click', openAdminPanel);
}

function loginUser(user) {
    currentUser = user;
    localStorage.setItem('canvas_user', JSON.stringify(user));
    authModal.classList.add('hidden');
    startAutoSave();
    location.reload();
}

function startAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(() => {
        console.log("Auto-saving...");
        saveProjectToCloud(true);
    }, 60000); // Mỗi 1 phút
}

function stopAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
}

// Lưu Project (Fake Cloud)
function saveProjectToCloud(isAuto = false) {
    if (!currentUser) {
        if (!isAuto) alert("Vui lòng đăng nhập để lưu thiết kế!");
        return;
    }
    
    // Lấy dữ liệu Canvas từ instance toàn cục
    if (typeof infiniteCanvas !== 'undefined') {
        const projectData = infiniteCanvas.serializeElements();
        let projects = JSON.parse(localStorage.getItem('canvas_projects_db') || '[]');
        
        let existingProjIndex = projects.findIndex(p => p.userId === currentUser.id);
        
        if (existingProjIndex > -1) {
            projects[existingProjIndex].data = projectData;
            projects[existingProjIndex].updatedAt = new Date().toLocaleString();
        } else {
            projects.push({
                id: 'proj_' + Date.now(),
                userId: currentUser.id,
                userEmail: currentUser.email,
                name: "Bản vẽ tự động",
                data: projectData,
                updatedAt: new Date().toLocaleString()
            });
        }
        
        localStorage.setItem('canvas_projects_db', JSON.stringify(projects));
        if (!isAuto) {
            // Chỉ flash hiệu ứng nhẹ, không alert khó chịu
            const btn = document.getElementById('btn-save');
            btn.style.backgroundColor = '#4CAF50';
            setTimeout(() => btn.style.backgroundColor = '', 500);
        }
    }
}

// Mở Project List
function openProjectList() {
    if (!currentUser) {
        alert("Vui lòng đăng nhập để xem thiết kế đã lưu.");
        return;
    }
    
    const list = document.getElementById('user-project-list');
    list.innerHTML = '';
    
    let projects = JSON.parse(localStorage.getItem('canvas_projects_db') || '[]');
    let userProjects = projects.filter(p => p.userId === currentUser.id);
    
    if (userProjects.length === 0) {
        list.innerHTML = '<p>Bạn chưa có thiết kế nào.</p>';
    } else {
        userProjects.forEach(p => {
            let li = document.createElement('li');
            li.style.padding = "10px";
            li.style.borderBottom = "1px solid #eee";
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            
            li.innerHTML = `
                <div>
                    <b>${p.name}</b><br>
                    <small>Cập nhật: ${p.updatedAt}</small>
                </div>
                <button class="primary-btn" style="padding: 4px 12px; height: 32px;" onclick="loadProjectData('${p.id}')">Mở</button>
            `;
            list.appendChild(li);
        });
    }
    projectsModal.classList.remove('hidden');
}

// Global loadProject
window.loadProjectData = function(projectId) {
    let projects = JSON.parse(localStorage.getItem('canvas_projects_db') || '[]');
    let p = projects.find(x => x.id === projectId);
    if (p && typeof infiniteCanvas !== 'undefined') {
        infiniteCanvas.deserializeElements(p.data);
        projectsModal.classList.add('hidden');
    }
};

// Admin Panel
function openAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) return;
    
    let users = JSON.parse(localStorage.getItem('canvas_users_db') || '[]');
    let projects = JSON.parse(localStorage.getItem('canvas_projects_db') || '[]');
    let views = localStorage.getItem('canvas_page_views') || '0';
    
    document.getElementById('admin-users-count').innerText = users.length;
    document.getElementById('admin-projects-count').innerText = projects.length;
    
    // Thêm số lượt truy cập (nếu chưa có HTML)
    let statsDiv = document.querySelector('.admin-stats');
    if (statsDiv && !document.getElementById('admin-views-count')) {
        let viewDiv = document.createElement('div');
        viewDiv.className = 'stat-box';
        viewDiv.innerHTML = `Lượt xem: <span id="admin-views-count" style="font-weight:bold;">${views}</span>`;
        statsDiv.appendChild(viewDiv);
    } else if (document.getElementById('admin-views-count')) {
        document.getElementById('admin-views-count').innerText = views;
    }
    
    const list = document.getElementById('admin-project-list');
    list.innerHTML = '';
    
    projects.forEach(p => {
        let li = document.createElement('li');
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        
        li.innerHTML = `
            <div>
                <b>${p.name}</b> (Bởi: ${p.userEmail})<br>
                <small>Cập nhật: ${p.updatedAt}</small>
            </div>
            <button class="danger-btn" style="padding: 4px 12px; height: 32px;" onclick="deleteProjectAdmin('${p.id}')">Xóa</button>
        `;
        list.appendChild(li);
    });
    
    authModal.classList.add('hidden');
    adminModal.classList.remove('hidden');
}

window.deleteProjectAdmin = function(projectId) {
    if (confirm("Bạn có chắc chắn muốn xoá bản vẽ này không?")) {
        let projects = JSON.parse(localStorage.getItem('canvas_projects_db') || '[]');
        projects = projects.filter(x => x.id !== projectId);
        localStorage.setItem('canvas_projects_db', JSON.stringify(projects));
        openAdminPanel(); // Refresh
    }
}

// Khởi chạy khi DOM load xong
window.addEventListener('DOMContentLoaded', initBackend);
