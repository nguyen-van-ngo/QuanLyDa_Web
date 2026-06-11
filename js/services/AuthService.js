import api from '../api.js';

export default class AuthService {
    constructor(uiUtils, appManager) {
        this.uiUtils = uiUtils;
        this.appManager = appManager; // Reference to main App to trigger views
        this.isAdmin = false;
        this.user = null;
    }

    init() {
        const token = localStorage.getItem('token');
        if (token) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                this.user = JSON.parse(userStr);
                this.isAdmin = this.user.username && this.user.username.toLowerCase() === 'admin';
            }
            this.appManager.showDashboard();
        } else {
            this.appManager.showLogin();
        }
        this.setupListeners();
    }

    setupListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(loginForm);
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    async handleLogin(form) {
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        
        const btn = form.querySelector('.btn-login');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang đăng nhập...';
        btn.disabled = true;

        try {
            const response = await api.login(usernameInput, passwordInput);
            localStorage.setItem('token', response.accessToken);
            this.user = {
                id: response.user.id,
                username: response.user.username,
                fullName: response.user.fullName || response.user.username
            };
            localStorage.setItem('user', JSON.stringify(this.user));
            this.isAdmin = this.user.username.toLowerCase() === 'admin';
            
            this.uiUtils.showToast('Đăng nhập thành công!');
            this.appManager.showDashboard();
        } catch (error) {
            this.uiUtils.showToast(error.message || 'Đăng nhập thất bại.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.user = null;
        this.isAdmin = false;
        this.appManager.showLogin();
        this.uiUtils.showToast('Đã đăng xuất.');
    }
}
