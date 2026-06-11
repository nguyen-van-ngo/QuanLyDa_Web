import UIUtils from './utils/UIUtils.js';
import ModalManager from './utils/ModalManager.js';
import AuthService from './services/AuthService.js';
import VehicleController from './controllers/VehicleController.js';
import PartnerController from './controllers/PartnerController.js';
import ProductController from './controllers/ProductController.js';
import OrderController from './controllers/OrderController.js';
import DashboardController from './controllers/DashboardController.js';

class AppManager {
    constructor() {
        this.uiUtils = new UIUtils();
        this.modalManager = new ModalManager();
        this.authService = new AuthService(this.uiUtils, this);

        // Bind global for legacy onClick handlers in HTML
        window.app = this;

        // Controllers
        this.vehicleController = new VehicleController(this.authService, this.uiUtils, this.modalManager);
        this.partnerController = new PartnerController(this.authService, this.uiUtils, this.modalManager);
        this.productController = new ProductController(this.authService, this.uiUtils, this.modalManager);
        this.orderController = new OrderController(this.authService, this.uiUtils);
        this.dashboardController = new DashboardController(this.authService);

        this.initDOMReferences();
        this.setupNavigation();
        this.modalManager.setupCloseListeners();

        // Setup save handlers for modals
        this.setupModalSaveHandlers();
    }

    initDOMReferences() {
        this.loginView = document.getElementById('login-view');
        this.dashboardView = document.getElementById('dashboard-view');
        
        // Panels
        this.panels = {
            dashboard: document.getElementById('dashboard-panel'),
            vehicle: document.getElementById('vehicle-list-panel'),
            partner: document.getElementById('partner-list-panel'),
            product: document.getElementById('product-list-panel'),
            orderCreate: document.getElementById('order-create-panel'),
            orderList: document.getElementById('order-list-panel')
        };

        this.breadcrumb = document.getElementById('main-breadcrumb');
        this.pageTitle = document.getElementById('page-title');
    }

    start() {
        this.authService.init();
    }

    showLogin() {
        if (this.loginView) this.loginView.style.display = 'flex';
        if (this.dashboardView) this.dashboardView.style.display = 'none';
    }

    showDashboard() {
        if (this.loginView) this.loginView.style.display = 'none';
        if (this.dashboardView) this.dashboardView.style.display = 'flex';
        
        if (this.authService.user) {
            const userInfoSpan = document.querySelector('.user-info span');
            if (userInfoSpan) {
                userInfoSpan.innerHTML = `Xin chào, <strong>${this.authService.user.username}</strong><br><small>${this.authService.isAdmin ? 'Quản trị viên' : 'Nhân viên'}</small>`;
            }
            document.querySelectorAll('th.action-header').forEach(th => {
                th.style.display = this.authService.isAdmin ? '' : 'none';
            });
        }
        this.showPanel('dashboard');
    }

    hideAllPanels() {
        Object.values(this.panels).forEach(panel => {
            if (panel) panel.style.display = 'none';
        });
    }

    resetMenuState() {
        document.querySelectorAll('.sidebar .menu > li, .sidebar .sub-menu a').forEach(el => {
            el.classList.remove('active', 'open');
        });
    }

    showPanel(panelName, options = {}) {
        this.hideAllPanels();
        this.resetMenuState();
        
        if (this.panels[panelName]) {
            this.panels[panelName].style.display = 'block';
        }

        switch(panelName) {
            case 'dashboard':
                document.getElementById('menu-group-dashboard')?.classList.add('active');
                if(this.breadcrumb) this.breadcrumb.innerHTML = 'Home <span class="separator">&bull;</span> <span class="current">Tổng quan</span>';
                if(this.pageTitle) this.pageTitle.innerText = 'Tổng quan';
                this.dashboardController.loadStats();
                this.dashboardController.loadLatestOrders();
                break;
            case 'vehicle':
                document.getElementById('menu-group-vehicle')?.classList.add('active');
                document.getElementById('menu-vehicle-list')?.classList.add('active');
                if(this.breadcrumb) this.breadcrumb.innerHTML = 'Trang chủ / Quản lý xe / <span class="current">Danh sách biển số</span>';
                this.vehicleController.loadData();
                break;
            case 'partner':
                document.getElementById('menu-group-partner')?.classList.add('active', 'open');
                document.getElementById('menu-partner-list')?.classList.add('active');
                if(this.breadcrumb) this.breadcrumb.innerHTML = 'Trang chủ / Khách hàng / <span class="current">Danh sách khách hàng</span>';
                this.partnerController.loadData();
                break;
            case 'product':
                document.getElementById('menu-group-product')?.classList.add('active', 'open');
                document.getElementById('menu-product-list')?.classList.add('active');
                if(this.breadcrumb) this.breadcrumb.innerHTML = 'Trang chủ / Sản phẩm / <span class="current">Danh sách sản phẩm</span>';
                this.productController.loadData();
                break;
            case 'orderCreate':
                document.getElementById('menu-group-order')?.classList.add('active', 'open');
                document.getElementById('menu-order-create')?.classList.add('active');
                if(this.breadcrumb) this.breadcrumb.innerHTML = 'Home <span class="separator">&bull;</span> Quản lý Đơn hàng <span class="separator">&bull;</span> Tạo đơn hàng';
                if(this.pageTitle) this.pageTitle.innerText = 'Tạo đơn hàng';
                document.getElementById('order-create-form')?.reset();
                if(document.getElementById('orderCustomerId')) document.getElementById('orderCustomerId').value = '';
                if(document.getElementById('orderProductId')) document.getElementById('orderProductId').value = '';
                if(document.getElementById('orderVehicleId')) document.getElementById('orderVehicleId').value = '';
                if(document.getElementById('orderDate')) document.getElementById('orderDate').value = new Date().toLocaleDateString('vi-VN');
                break;
            case 'orderList':
                document.getElementById('menu-group-order-list')?.classList.add('active', 'open');
                if (options.type === 'NHAP_HANG') {
                    document.getElementById('menu-order-list-nhap')?.classList.add('active');
                } else {
                    document.getElementById('menu-order-list-xuat')?.classList.add('active');
                }
                const typeText = options.type === 'NHAP_HANG' ? 'nhập' : 'xuất';
                if(this.breadcrumb) this.breadcrumb.innerHTML = `Trang chủ / Đơn hàng / <span class="current">Danh sách đơn hàng ${typeText}</span>`;
                if(this.pageTitle) this.pageTitle.innerText = `Danh sách đơn hàng ${typeText}`;
                
                document.querySelectorAll('.custom-dropdown .dropdown-options input[type="checkbox"]').forEach(cb => cb.checked = false);
                if(document.getElementById('filter-created-by')) document.getElementById('filter-created-by').value = '';
                
                this.orderController.currentOrderFilters = {
                    customerNames: [],
                    createdByNames: [],
                    productNames: [],
                    statuses: [],
                    plateNumbers: [],
                    ordersType: options.type
                };
                this.orderController.currentOrderPage = 0;
                this.orderController.loadOrders();
                break;
        }
    }

    showOrderListPanel(type) {
        this.showPanel('orderList', { type });
    }

    setupNavigation() {
        document.querySelectorAll('.has-submenu').forEach(item => {
            item.addEventListener('click', () => {
                const parentLi = item.parentElement;
                parentLi.classList.toggle('open');
            });
        });

        document.getElementById('menu-dashboard')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPanel('dashboard');
        });

        document.getElementById('menu-vehicle-list')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPanel('vehicle');
        });

        document.getElementById('menu-partner-list')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPanel('partner');
        });

        document.getElementById('menu-product-list')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPanel('product');
        });

        document.getElementById('menu-order-create')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPanel('orderCreate');
        });

        document.getElementById('menu-order-list-nhap')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPanel('orderList', { type: 'NHAP_HANG' });
        });

        document.getElementById('menu-order-list-xuat')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPanel('orderList', { type: 'XUAT_HANG' });
        });

        // "Thêm" Buttons
        document.getElementById('btn-add-vehicle')?.addEventListener('click', () => {
            this.openModal('add', null, 'vehicle');
        });

        document.getElementById('btn-add-partner')?.addEventListener('click', () => {
            this.openModal('add', null, 'partner');
        });

        document.getElementById('btn-add-product')?.addEventListener('click', () => {
            this.openModal('add', null, 'product');
        });
    }

    openModal(mode, data, type) {
        const modalId = `${type}-modal`;
        const formId = `${type}-form`;
        const titleId = 'modal-title'; // For vehicle
        
        let titleText = '';
        if (type === 'vehicle') titleText = mode === 'add' ? 'Thêm Xe Mới' : 'Sửa Thông Tin Xe';
        else if (type === 'partner') titleText = mode === 'add' ? 'Thêm Khách Hàng' : 'Sửa Khách Hàng';
        else if (type === 'product') titleText = mode === 'add' ? 'Thêm Sản Phẩm' : 'Sửa Sản Phẩm';

        const titleEl = document.querySelector(`#${modalId} .modal-header h2`);
        if (titleEl) titleEl.innerText = titleText;

        this.modalManager.openModal(modalId, null, null);

        const form = document.getElementById(formId);
        if (!form) return;
        form.reset();

        const idField = document.getElementById(`${type}Id`);
        if (idField) idField.value = '';

        if (mode === 'edit' && data) {
            if (idField) idField.value = data.id;
            
            if (type === 'vehicle') {
                document.getElementById('plateNumber').value = data.plateNumber || '';
                document.getElementById('driverName').value = data.driverName || '';
                document.getElementById('phone').value = data.phone || '';
                document.getElementById('isActive').value = data.isActive ? 'true' : 'false';
                document.getElementById('note').value = data.note || '';
            } else if (type === 'partner') {
                document.getElementById('partnerName').value = data.name || '';
                document.getElementById('partnerAddress').value = data.address || '';
                document.getElementById('partnerPhone').value = data.phone || '';
                document.getElementById('partnerType').value = data.partnerType || 'BUYER';
                document.getElementById('partnerIsActive').value = data.isActive ? 'true' : 'false';
                document.getElementById('partnerNote').value = data.note || '';
            } else if (type === 'product') {
                document.getElementById('productCode').value = data.code || '';
                document.getElementById('productName').value = data.name || '';
                document.getElementById('productType').value = data.productType || 'DA_XO_BO';
                document.getElementById('productUnit').value = data.unit || '';
                document.getElementById('productIsActive').value = data.isActive ? 'true' : 'false';
            }
        }
    }

    setupModalSaveHandlers() {
        import('../api.js').then(module => {
            const api = module.default;

            document.getElementById('vehicle-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('btn-save-vehicle');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang lưu...';
                btn.disabled = true;

                const id = document.getElementById('vehicleId').value;
                const data = {
                    plateNumber: document.getElementById('plateNumber').value.trim(),
                    driverName: document.getElementById('driverName').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    isActive: document.getElementById('isActive').value === 'true',
                    note: document.getElementById('note').value.trim()
                };

                try {
                    if (id) {
                        await api.updateVehicle(id, data);
                        this.uiUtils.showToast('Cập nhật thành công!');
                    } else {
                        await api.createVehicle(data);
                        this.uiUtils.showToast('Thêm mới thành công!');
                    }
                    this.modalManager.closeModal('vehicle-modal', 'vehicle-form');
                    this.vehicleController.loadData();
                } catch (error) {
                    this.uiUtils.showToast(error.message, 'error');
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });

            document.getElementById('partner-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('btn-save-partner');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang lưu...';
                btn.disabled = true;

                const id = document.getElementById('partnerId').value;
                const data = {
                    name: document.getElementById('partnerName').value.trim(),
                    address: document.getElementById('partnerAddress').value.trim(),
                    phone: document.getElementById('partnerPhone').value.trim(),
                    partnerType: document.getElementById('partnerType').value,
                    isActive: document.getElementById('partnerIsActive').value === 'true',
                    note: document.getElementById('partnerNote').value.trim()
                };

                try {
                    if (id) {
                        await api.updatePartner(id, data);
                        this.uiUtils.showToast('Cập nhật thành công!');
                    } else {
                        await api.createPartner(data);
                        this.uiUtils.showToast('Thêm mới thành công!');
                    }
                    this.modalManager.closeModal('partner-modal', 'partner-form');
                    this.partnerController.loadData();
                } catch (error) {
                    this.uiUtils.showToast(error.message, 'error');
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });

            document.getElementById('product-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('btn-save-product');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang lưu...';
                btn.disabled = true;

                const id = document.getElementById('productId').value;
                const data = {
                    code: document.getElementById('productCode').value.trim(),
                    name: document.getElementById('productName').value.trim(),
                    productType: document.getElementById('productType').value,
                    unit: document.getElementById('productUnit').value.trim(),
                    isActive: document.getElementById('productIsActive').value === 'true'
                };

                try {
                    if (id) {
                        await api.updateProduct(id, data);
                        this.uiUtils.showToast('Cập nhật thành công!');
                    } else {
                        await api.createProduct(data);
                        this.uiUtils.showToast('Thêm mới thành công!');
                    }
                    this.modalManager.closeModal('product-modal', 'product-form');
                    this.productController.loadData();
                } catch (error) {
                    this.uiUtils.showToast(error.message, 'error');
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new AppManager();
    app.start();
});
