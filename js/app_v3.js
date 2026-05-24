document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Menu Elements
    const menuVehicleList = document.getElementById('menu-vehicle-list');
    const menuPartnerList = document.getElementById('menu-partner-list');
    const menuGroupVehicle = document.getElementById('menu-group-vehicle');
    const menuGroupPartner = document.getElementById('menu-group-partner');
    const menuGroupProduct = document.getElementById('menu-group-product');
    const menuProductList = document.getElementById('menu-product-list');
    const menuGroupOrder = document.getElementById('menu-group-order');
    const menuOrderCreate = document.getElementById('menu-order-create');
    const menuGroupOrderList = document.getElementById('menu-group-order-list');
    const menuOrderListNhap = document.getElementById('menu-order-list-nhap');
    const menuOrderListXuat = document.getElementById('menu-order-list-xuat');
    const mainBreadcrumb = document.getElementById('main-breadcrumb');

    // Panels
    const vehicleListPanel = document.getElementById('vehicle-list-panel');
    const partnerListPanel = document.getElementById('partner-list-panel');
    const productListPanel = document.getElementById('product-list-panel');
    const orderCreatePanel = document.getElementById('order-create-panel');
    const orderListPanel = document.getElementById('order-list-panel');
    const dashboardPanel = document.getElementById('dashboard-panel');
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuGroupDashboard = document.getElementById('menu-group-dashboard');

    // Vehicles DOM
    const vehicleTableBody = document.getElementById('vehicle-table-body');
    const btnAddVehicle = document.getElementById('btn-add-vehicle');
    const searchInputVehicle = document.getElementById('search-input');
    const searchIconVehicle = document.querySelector('#vehicle-list-panel .search-box i');
    
    // Partners DOM
    const partnerTableBody = document.getElementById('partner-table-body');
    const btnAddPartner = document.getElementById('btn-add-partner');
    const searchInputPartner = document.getElementById('search-input-partner');
    const searchIconPartner = document.querySelector('#partner-list-panel .search-box i');
    const partnerTypeRadios = document.querySelectorAll('input[name="partnerType"]');

    // Products DOM
    const productTableBody = document.getElementById('product-table-body');
    const btnAddProduct = document.getElementById('btn-add-product');
    const searchInputProduct = document.getElementById('search-input-product');
    const searchIconProduct = document.querySelector('#product-list-panel .search-box i');

    // Orders List DOM
    const orderTableBody = document.getElementById('order-table-body');
    const searchInputOrder = document.getElementById('search-input-order');
    const searchIconOrder = document.querySelector('#order-list-panel .search-box i');
    const btnPrevPageOrder = document.getElementById('btn-prev-page-order');
    const btnNextPageOrder = document.getElementById('btn-next-page-order');
    const currentPageDisplayOrder = document.getElementById('current-page-display-order');
    const orderPaginationInfo = document.getElementById('order-pagination-info');
    let currentOrderPage = 0;
    let currentOrderSearchKeyword = '';

    // Modal DOM (Vehicle)
    const vehicleModal = document.getElementById('vehicle-modal');
    const vehicleForm = document.getElementById('vehicle-form');
    const btnSaveVehicle = document.getElementById('btn-save-vehicle');
    const modalTitle = document.getElementById('modal-title');
    
    // Modal DOM (Partner)
    const partnerModal = document.getElementById('partner-modal');
    const partnerForm = document.getElementById('partner-form');
    const btnSavePartner = document.getElementById('btn-save-partner');
    
    // Modal DOM (Product)
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const btnSaveProduct = document.getElementById('btn-save-product');
    
    // Toast Container (Create dynamically)
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    // === State ===
    // Vehicle State
    let currentVehicles = [];
    let currentPage = 0;
    const pageSize = 10;
    let totalPages = 0;
    let totalElements = 0;
    let currentKeyword = '';

    // Partner State
    let currentPartners = [];
    let currentPartnerPage = 0;
    let totalPartnerPages = 0;
    let totalPartnerElements = 0;
    let currentPartnerKeyword = '';
    let currentPartnerType = '';

    // Product State
    let currentProducts = [];
    let currentProductPage = 0;
    let totalProductPages = 0;
    let totalProductElements = 0;
    let currentProductKeyword = '';

    // Auth State
    let isAdmin = false;

    // === Initialization ===
    function init() {
        const token = localStorage.getItem('token');
        if (token) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    // === View Management ===
    function showLogin() {
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
    }

    function showDashboard() {
        loginView.style.display = 'none';
        dashboardView.style.display = 'flex';
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.username) {
            isAdmin = user.username.toLowerCase() === 'admin';
            document.querySelector('.user-info span').innerHTML = `Xin chào, <strong>${user.username}</strong><br><small>${isAdmin ? 'Quản trị viên' : 'Nhân viên'}</small>`;
            
            document.querySelectorAll('th.action-header').forEach(th => {
                th.style.display = isAdmin ? '' : 'none';
            });
        }
        showDashboardPanel(); // Default to dashboard panel
    }

    function showVehiclePanel() {
        dashboardPanel.style.display = 'none';
        vehicleListPanel.style.display = 'block';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        if (orderListPanel) orderListPanel.style.display = 'none';
        
        if (menuGroupDashboard) menuGroupDashboard.classList.remove('active');
        menuGroupVehicle.classList.add('active');
        menuGroupPartner.classList.remove('active');
        if (menuGroupProduct) menuGroupProduct.classList.remove('active');
        menuVehicleList.classList.add('active');
        menuPartnerList.classList.remove('active');
        if (menuProductList) menuProductList.classList.remove('active');
        
        mainBreadcrumb.innerHTML = 'Trang chủ / Quản lý xe / <span class="current">Danh sách biển số</span>';
        
        loadVehicles();
    }

    function showPartnerPanel() {
        dashboardPanel.style.display = 'none';
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'block';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        if (orderListPanel) orderListPanel.style.display = 'none';
        
        if (menuGroupDashboard) menuGroupDashboard.classList.remove('active');
        menuGroupPartner.classList.add('active', 'open');
        menuGroupVehicle.classList.remove('active');
        if (menuGroupProduct) menuGroupProduct.classList.remove('active');
        menuPartnerList.classList.add('active');
        menuVehicleList.classList.remove('active');
        if (menuProductList) menuProductList.classList.remove('active');
        
        mainBreadcrumb.innerHTML = 'Trang chủ / Khách hàng / <span class="current">Danh sách khách hàng</span>';
        
        loadPartners();
    }

    function showProductPanel() {
        dashboardPanel.style.display = 'none';
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'block';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        if (orderListPanel) orderListPanel.style.display = 'none';
        
        if (menuGroupDashboard) menuGroupDashboard.classList.remove('active');
        if (menuGroupProduct) menuGroupProduct.classList.add('active', 'open');
        menuGroupVehicle.classList.remove('active');
        menuGroupPartner.classList.remove('active');
        if (menuProductList) menuProductList.classList.add('active');
        menuVehicleList.classList.remove('active');
        menuPartnerList.classList.remove('active');
        
        mainBreadcrumb.innerHTML = 'Trang chủ / Sản phẩm / <span class="current">Danh sách sản phẩm</span>';
        
        loadProducts();
    }

    function showOrderCreatePanel() {
        dashboardPanel.style.display = 'none';
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderListPanel) orderListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'block';
        
        if (menuGroupDashboard) menuGroupDashboard.classList.remove('active');
        if (menuGroupOrder) menuGroupOrder.classList.add('active', 'open');
        menuGroupVehicle.classList.remove('active');
        menuGroupPartner.classList.remove('active');
        if (menuGroupProduct) menuGroupProduct.classList.remove('active');
        if (menuGroupOrderList) menuGroupOrderList.classList.remove('active');
        
        mainBreadcrumb.innerHTML = 'Home <span class="separator">&bull;</span> Quản lý Đơn hàng <span class="separator">&bull;</span> Tạo đơn hàng';
        document.getElementById('page-title').innerText = 'Tạo đơn hàng';
        
        // Reset form và ngày tạo
        document.getElementById('order-create-form').reset();
        document.getElementById('orderCustomerId').value = '';
        document.getElementById('orderProductId').value = '';
        document.getElementById('orderVehicleId').value = '';
        
        const today = new Date();
        document.getElementById('orderDate').value = today.toLocaleDateString('vi-VN');
    }

    function showOrderListPanel(type = 'NHAP_HANG') {
        dashboardPanel.style.display = 'none';
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        if (orderListPanel) orderListPanel.style.display = 'block';
        
        if (menuGroupDashboard) menuGroupDashboard.classList.remove('active');
        if (menuGroupOrderList) menuGroupOrderList.classList.add('active', 'open');
        menuGroupVehicle.classList.remove('active');
        menuGroupPartner.classList.remove('active');
        if (menuGroupProduct) menuGroupProduct.classList.remove('active');
        if (menuGroupOrder) menuGroupOrder.classList.remove('active');
        
        const typeText = type === 'NHAP_HANG' ? 'nhập' : 'xuất';
        mainBreadcrumb.innerHTML = `Trang chủ / Đơn hàng / <span class="current">Danh sách đơn hàng ${typeText}</span>`;
        document.getElementById('page-title').innerText = `Danh sách đơn hàng ${typeText}`;
        
        // Reset filters
        document.querySelectorAll('.custom-dropdown .dropdown-options input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('filter-created-by').value = '';
        currentOrderFilters = {
            customerNames: [],
            createdByNames: [],
            productNames: [],
            statuses: [],
            plateNumbers: [],
            ordersType: type
        };
        currentOrderPage = 0;
        loadOrders();
    }

    // Sidebar Menu Events
    // Toggle submenus
    document.querySelectorAll('.has-submenu').forEach(item => {
        item.addEventListener('click', () => {
            const parentLi = item.parentElement;
            parentLi.classList.toggle('open');
        });
    });

    if (menuDashboard) {
        menuDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            showDashboardPanel();
        });
    }

    if (menuVehicleList) {
        menuVehicleList.addEventListener('click', (e) => {
            e.preventDefault();
            showVehiclePanel();
        });
    }

    if (menuPartnerList) {
        menuPartnerList.addEventListener('click', (e) => {
            e.preventDefault();
            showPartnerPanel();
        });
    }

    if (menuProductList) {
        menuProductList.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sub-menu a').forEach(a => a.classList.remove('active'));
            menuProductList.classList.add('active');
            showProductPanel();
        });
    }

    if (menuOrderCreate) {
        menuOrderCreate.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sub-menu a').forEach(a => a.classList.remove('active'));
            menuOrderCreate.classList.add('active');
            showOrderCreatePanel();
        });
    }

    if (menuOrderListNhap) {
        menuOrderListNhap.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sub-menu a').forEach(a => a.classList.remove('active'));
            menuOrderListNhap.classList.add('active');
            showOrderListPanel('NHAP_HANG');
        });
    }

    if (menuOrderListXuat) {
        menuOrderListXuat.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sub-menu a').forEach(a => a.classList.remove('active'));
            menuOrderListXuat.classList.add('active');
            showOrderListPanel('XUAT_HANG');
        });
    }

    // === Notifications ===
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);
        
        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // === Login Logic ===
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            
            const btn = loginForm.querySelector('.btn-login');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang đăng nhập...';
            btn.disabled = true;

            try {
                const response = await api.login(usernameInput, passwordInput);
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('user', JSON.stringify({
                    id: response.user.id,
                    username: response.user.username,
                    fullName: response.user.fullName || response.user.username
                }));
                showToast('Đăng nhập thành công!');
                showDashboard();
            } catch (error) {
                showToast(error.message || 'Đăng nhập thất bại.', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // === Logout Logic ===
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showLogin();
            showToast('Đã đăng xuất.');
        });
    }

    // === Vehicle Management ===
    async function loadVehicles() {
        vehicleTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getVehicles(currentPage, pageSize, currentKeyword);
            currentVehicles = data.content || [];
            totalPages = data.totalPages || 0;
            totalElements = data.totalElements || 0;
            
            renderVehicles(currentVehicles);
            updatePaginationUI();
        } catch (error) {
            if (error.message.includes('UNAUTHORIZED')) {
                // Temporarily disable auto-logout for debugging
                // localStorage.removeItem('token');
                // showLogin();
                // showToast('Phiên đăng nhập hết hạn.', 'error');
                vehicleTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red; font-weight: bold;">LỖI BẢO MẬT BACKEND: ${error.message} (Hãy kiểm tra lại @PreAuthorize trên Controller)</td></tr>`;
            } else {
                vehicleTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">${error.message}</td></tr>`;
                showToast(error.message, 'error');
            }
        }
    }

    function updatePaginationUI() {
        const btnPrev = document.getElementById('btn-prev-page-vehicle');
        const btnNext = document.getElementById('btn-next-page-vehicle');
        const pageDisplay = document.getElementById('current-page-display-vehicle');
        const pageInfo = document.getElementById('vehicle-pagination-info');

        if (btnPrev && btnNext && pageDisplay && pageInfo) {
            btnPrev.disabled = currentPage === 0;
            btnNext.disabled = currentPage >= totalPages - 1 || totalPages === 0;
            pageDisplay.textContent = currentPage + 1;

            const startIdx = totalElements === 0 ? 0 : (currentPage * pageSize) + 1;
            const endIdx = Math.min((currentPage + 1) * pageSize, totalElements);
            pageInfo.textContent = `Hiển thị ${startIdx}-${endIdx} trên ${totalElements}`;
        }
    }

    document.getElementById('btn-prev-page-vehicle')?.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            loadVehicles();
        }
    });

    document.getElementById('btn-next-page-vehicle')?.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            loadVehicles();
        }
    });

    function performSearch() {
        currentKeyword = searchInputVehicle.value.trim();
        currentPage = 0; 
        loadVehicles();
    }

    if (searchInputVehicle) {
        searchInputVehicle.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchIconVehicle) {
        searchIconVehicle.addEventListener('click', () => {
            performSearch();
        });
        searchIconVehicle.style.cursor = 'pointer';
    }

    function renderVehicles(vehicles) {
        if (vehicles.length === 0) {
            vehicleTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không có dữ liệu.</td></tr>';
            return;
        }

        vehicleTableBody.innerHTML = vehicles.map((v, index) => `
            <tr>
                <td>${(currentPage * pageSize) + index + 1}</td>
                <td><strong>${v.plateNumber || ''}</strong></td>
                <td>${v.driverName || ''}</td>
                <td>${v.phone || ''}</td>
                <td>
                    <span class="status-badge ${v.isActive ? 'status-active' : 'status-inactive'}">
                        ${v.isActive ? 'Đang hoạt động' : 'Dừng'}
                    </span>
                </td>
                <td>${v.note || ''}</td>
                ${isAdmin ? `
                <td>
                    <div class="action-icons">
                        <i class='bx bx-edit icon-edit' onclick="window.editVehicle(${v.id})" title="Sửa"></i>
                        <i class='bx bx-trash icon-delete' onclick="window.deleteVehicle(${v.id})" title="Xóa"></i>
                    </div>
                </td>
                ` : ''}
            </tr>
        `).join('');
    }

    window.editVehicle = async (id) => {
        try {
            const vehicle = currentVehicles.find(v => v.id === id) || await api.getVehicleById(id);
            openModal('edit', vehicle, 'vehicle');
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.deleteVehicle = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa biển số xe này không? Hành động này không thể hoàn tác.')) {
            try {
                await api.deleteVehicle(id);
                showToast('Xóa thành công!');
                loadVehicles();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    // === Partner Management (Khách hàng) ===
    async function loadPartners() {
        partnerTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getPartners(currentPartnerPage, pageSize, currentPartnerKeyword, currentPartnerType);
            currentPartners = data.content || [];
            totalPartnerPages = data.totalPages || 0;
            totalPartnerElements = data.totalElements || 0;
            
            renderPartners(currentPartners);
            updatePartnerPaginationUI();
        } catch (error) {
            if (error.message.includes('UNAUTHORIZED')) {
                // Temporarily disable auto-logout for debugging
                // localStorage.removeItem('token');
                // showLogin();
                // showToast('Phiên đăng nhập hết hạn.', 'error');
                vehicleTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red; font-weight: bold;">LỖI BẢO MẬT BACKEND: ${error.message} (Hãy kiểm tra lại @PreAuthorize trên Controller)</td></tr>`;
            } else {
                partnerTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">${error.message}</td></tr>`;
                showToast(error.message, 'error');
            }
        }
    }

    function updatePartnerPaginationUI() {
        const btnPrev = document.getElementById('btn-prev-page-partner');
        const btnNext = document.getElementById('btn-next-page-partner');
        const pageDisplay = document.getElementById('current-page-display-partner');
        const pageInfo = document.getElementById('partner-pagination-info');

        if (btnPrev && btnNext && pageDisplay && pageInfo) {
            btnPrev.disabled = currentPartnerPage === 0;
            btnNext.disabled = currentPartnerPage >= totalPartnerPages - 1 || totalPartnerPages === 0;
            pageDisplay.textContent = currentPartnerPage + 1;

            const startIdx = totalPartnerElements === 0 ? 0 : (currentPartnerPage * pageSize) + 1;
            const endIdx = Math.min((currentPartnerPage + 1) * pageSize, totalPartnerElements);
            pageInfo.textContent = `Hiển thị ${startIdx}-${endIdx} trên ${totalPartnerElements}`;
        }
    }

    document.getElementById('btn-prev-page-partner')?.addEventListener('click', () => {
        if (currentPartnerPage > 0) {
            currentPartnerPage--;
            loadPartners();
        }
    });

    document.getElementById('btn-next-page-partner')?.addEventListener('click', () => {
        if (currentPartnerPage < totalPartnerPages - 1) {
            currentPartnerPage++;
            loadPartners();
        }
    });

    function performPartnerSearch() {
        currentPartnerKeyword = searchInputPartner.value.trim();
        currentPartnerPage = 0;
        loadPartners();
    }

    if (searchInputPartner) {
        searchInputPartner.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') performPartnerSearch();
        });
    }

    if (searchIconPartner) {
        searchIconPartner.addEventListener('click', () => performPartnerSearch());
        searchIconPartner.style.cursor = 'pointer';
    }

    partnerTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentPartnerType = e.target.value;
            currentPartnerPage = 0;
            loadPartners();
        });
    });

    function renderPartners(partners) {
        if (partners.length === 0) {
            partnerTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Không có dữ liệu.</td></tr>';
            return;
        }

        partnerTableBody.innerHTML = partners.map((p, index) => {
            const statusBadge = p.isActive 
                ? '<span class="status-badge status-active">Hoạt động</span>' 
                : '<span class="status-badge status-inactive">Ngừng HĐ</span>';
                
            const typeLabel = p.partnerType === 'BUYER' ? 'Người mua' : (p.partnerType === 'SUPPLIER' ? 'Nhà cung cấp' : p.partnerType);
            
            return `
            <tr>
                <td>${(currentPartnerPage * pageSize) + index + 1}</td>
                <td><strong>${p.name || ''}</strong></td>
                <td>${p.address || ''}</td>
                <td>${p.phone || ''}</td>
                <td>${typeLabel}</td>
                <td>${statusBadge}</td>
                <td>${p.note || ''}</td>
                ${isAdmin ? `
                <td>
                    <div class="action-icons">
                        <i class='bx bx-edit icon-edit' onclick="window.editPartner(${p.id})" title="Sửa"></i>
                    </div>
                </td>
                ` : ''}
            </tr>`;
        }).join('');
    }

    window.editPartner = async (id) => {
        try {
            const partner = currentPartners.find(p => p.id === id) || await api.getPartnerById(id);
            openModal('edit', partner, 'partner');
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.deletePartner = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác.')) {
            try {
                await api.deletePartner(id);
                showToast('Xóa thành công!');
                loadPartners();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    // === Product Management (Sản phẩm) ===
    async function loadProducts() {
        if(!productTableBody) return;
        productTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getProducts(currentProductPage, pageSize, currentProductKeyword);
            currentProducts = data.content || [];
            totalProductPages = data.totalPages || 0;
            totalProductElements = data.totalElements || 0;
            
            renderProducts(currentProducts);
            updateProductPaginationUI();
        } catch (error) {
            if (error.message === 'UNAUTHORIZED') {
                localStorage.removeItem('token');
                showLogin();
                showToast('Phiên đăng nhập hết hạn.', 'error');
            } else {
                productTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">${error.message}</td></tr>`;
                showToast(error.message, 'error');
            }
        }
    }

    function updateProductPaginationUI() {
        const btnPrev = document.getElementById('btn-prev-page-product');
        const btnNext = document.getElementById('btn-next-page-product');
        const pageDisplay = document.getElementById('current-page-display-product');
        const pageInfo = document.getElementById('product-pagination-info');

        if (btnPrev && btnNext && pageDisplay && pageInfo) {
            btnPrev.disabled = currentProductPage === 0;
            btnNext.disabled = currentProductPage >= totalProductPages - 1 || totalProductPages === 0;
            pageDisplay.textContent = currentProductPage + 1;

            const startIdx = totalProductElements === 0 ? 0 : (currentProductPage * pageSize) + 1;
            const endIdx = Math.min((currentProductPage + 1) * pageSize, totalProductElements);
            pageInfo.textContent = `Hiển thị ${startIdx}-${endIdx} trên ${totalProductElements}`;
        }
    }

    document.getElementById('btn-prev-page-product')?.addEventListener('click', () => {
        if (currentProductPage > 0) {
            currentProductPage--;
            loadProducts();
        }
    });

    document.getElementById('btn-next-page-product')?.addEventListener('click', () => {
        if (currentProductPage < totalProductPages - 1) {
            currentProductPage++;
            loadProducts();
        }
    });

    function performProductSearch() {
        currentProductKeyword = searchInputProduct.value.trim();
        currentProductPage = 0;
        loadProducts();
    }

    if (searchInputProduct) {
        searchInputProduct.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') performProductSearch();
        });
    }

    if (searchIconProduct) {
        searchIconProduct.addEventListener('click', () => performProductSearch());
        searchIconProduct.style.cursor = 'pointer';
    }

    function renderProducts(products) {
        if (products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không có dữ liệu.</td></tr>';
            return;
        }

        productTableBody.innerHTML = products.map((p, index) => {
            const statusBadge = p.isActive 
                ? '<span class="status-badge status-active">Còn Hàng</span>' 
                : '<span class="status-badge status-inactive">Hết Hàng</span>';
                
            const typeLabel = p.productType === 'DA_XO_BO' ? 'Đá xô bồ' : (p.productType === 'DA_THANH_PHAM' ? 'Đá thành phẩm' : p.productType);
            
            return `
            <tr>
                <td>${(currentProductPage * pageSize) + index + 1}</td>
                <td><strong>${p.code || ''}</strong></td>
                <td>${p.name || ''}</td>
                <td>${typeLabel}</td>
                <td>${p.unit || ''}</td>
                <td>${statusBadge}</td>
                ${isAdmin ? `
                <td>
                    <div class="action-icons">
                        <i class='bx bx-edit icon-edit' onclick="window.editProduct(${p.id})" title="Sửa"></i>
                    </div>
                </td>
                ` : ''}
            </tr>`;
        }).join('');
    }

    window.editProduct = async (id) => {
        try {
            const product = currentProducts.find(p => p.id === id) || await api.getProductById(id);
            openModal('edit', product, 'product');
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.deleteProduct = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.')) {
            try {
                await api.deleteProduct(id);
                showToast('Xóa thành công!');
                loadProducts();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    // === Modal Management ===
    function openModal(mode = 'add', data = null, type = 'vehicle') {
        if (type === 'vehicle') {
            document.getElementById('modal-title').textContent = mode === 'add' ? 'Thêm biển số xe mới' : 'Cập nhật thông tin xe';
            document.getElementById('vehicle-id').value = data ? data.id : '';
            document.getElementById('plateNumber').value = data ? (data.plateNumber || '') : '';
            document.getElementById('driverName').value = data ? (data.driverName || '') : '';
            document.getElementById('phone').value = data ? (data.phone || '') : '';
            document.getElementById('isActive').value = data ? (data.isActive ? "true" : "false") : "true";
            document.getElementById('note').value = data ? (data.note || '') : '';
            
            vehicleModal.classList.add('show');
        } else if (type === 'partner') {
            document.getElementById('partner-modal-title').textContent = mode === 'add' ? 'Thêm khách hàng mới' : 'Cập nhật khách hàng';
            document.getElementById('partner-id').value = data ? data.id : '';
            document.getElementById('partnerName').value = data ? (data.name || '') : '';
            document.getElementById('partnerPhone').value = data ? (data.phone || '') : '';
            document.getElementById('partnerAddress').value = data ? (data.address || '') : '';
            document.getElementById('partnerTypeSelect').value = data ? (data.partnerType || 'BUYER') : 'BUYER';
            document.getElementById('partnerIsActive').value = data ? (data.isActive ? "true" : "false") : "true";
            document.getElementById('partnerNote').value = data ? (data.note || '') : '';
            
            partnerModal.classList.add('show');
        } else if (type === 'product') {
            document.getElementById('product-modal-title').textContent = mode === 'add' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm';
            document.getElementById('product-id').value = data ? data.id : '';
            document.getElementById('productCode').value = data ? (data.code || '') : '';
            document.getElementById('productName').value = data ? (data.name || '') : '';
            document.getElementById('productTypeSelect').value = data ? (data.productType || 'DA_XO_BO') : 'DA_XO_BO';
            document.getElementById('productUnit').value = data ? (data.unit || '') : '';
            document.getElementById('productIsActive').value = data ? (data.isActive ? "true" : "false") : "true";
            
            productModal.classList.add('show');
        }
    }

    function closeModal(type = 'vehicle') {
        if (type === 'vehicle') {
            vehicleModal.classList.remove('show');
            vehicleForm.reset();
        } else if (type === 'partner') {
            partnerModal.classList.remove('show');
            partnerForm.reset();
        } else if (type === 'product') {
            productModal.classList.remove('show');
            productForm.reset();
        }
    }

    // Modal Event Listeners
    if (btnAddVehicle) btnAddVehicle.addEventListener('click', () => openModal('add', null, 'vehicle'));
    if (btnAddPartner) btnAddPartner.addEventListener('click', () => openModal('add', null, 'partner'));
    if (btnAddProduct) btnAddProduct.addEventListener('click', () => openModal('add', null, 'product'));

    document.querySelectorAll('.close-modal-btn, .close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('vehicle');
        });
    });

    document.querySelectorAll('.close-modal-partner-btn, .close-modal-partner').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('partner');
        });
    });

    document.querySelectorAll('.close-modal-product-btn, .close-modal-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('product');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === vehicleModal) closeModal('vehicle');
        if (e.target === partnerModal) closeModal('partner');
        if (e.target === productModal) closeModal('product');
    });

    // Save Form Submissions
    if (btnSaveVehicle) {
        btnSaveVehicle.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!vehicleForm.checkValidity()) {
                vehicleForm.reportValidity();
                return;
            }

            const id = document.getElementById('vehicle-id').value;
            const data = {
                plateNumber: document.getElementById('plateNumber').value.trim(),
                driverName: document.getElementById('driverName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                isActive: document.getElementById('isActive').value === 'true',
                note: document.getElementById('note').value.trim()
            };

            const btnSave = document.getElementById('btn-save-vehicle');
            const originalText = btnSave.innerHTML;
            btnSave.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang lưu...';
            btnSave.disabled = true;

            try {
                if (id) {
                    await api.updateVehicle(id, data);
                    showToast('Cập nhật thành công!');
                } else {
                    await api.createVehicle(data);
                    showToast('Thêm mới thành công!');
                }
                closeModal('vehicle');
                if (!id) currentPage = 0; 
                loadVehicles();
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSave.innerHTML = originalText;
                btnSave.disabled = false;
            }
        });
    }

    if (btnSavePartner) {
        btnSavePartner.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!partnerForm.checkValidity()) {
                partnerForm.reportValidity();
                return;
            }

            const id = document.getElementById('partner-id').value;
            const data = {
                name: document.getElementById('partnerName').value.trim(),
                phone: document.getElementById('partnerPhone').value.trim(),
                address: document.getElementById('partnerAddress').value.trim(),
                partnerType: document.getElementById('partnerTypeSelect').value,
                isActive: document.getElementById('partnerIsActive').value === 'true',
                note: document.getElementById('partnerNote').value.trim()
            };

            const btnSave = document.getElementById('btn-save-partner');
            const originalText = btnSave.innerHTML;
            btnSave.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang lưu...';
            btnSave.disabled = true;

            try {
                if (id) {
                    await api.updatePartner(id, data);
                    showToast('Cập nhật thành công!');
                } else {
                    await api.createPartner(data);
                    showToast('Thêm mới thành công!');
                }
                closeModal('partner');
                if (!id) currentPartnerPage = 0; 
                loadPartners();
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSave.innerHTML = originalText;
                btnSave.disabled = false;
            }
        });
    }

    if (btnSaveProduct) {
        btnSaveProduct.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!productForm.checkValidity()) {
                productForm.reportValidity();
                return;
            }

            const id = document.getElementById('product-id').value;
            const data = {
                code: document.getElementById('productCode').value.trim(),
                name: document.getElementById('productName').value.trim(),
                productType: document.getElementById('productTypeSelect').value,
                unit: document.getElementById('productUnit').value.trim(),
                isActive: document.getElementById('productIsActive').value === 'true'
            };

            const btnSave = document.getElementById('btn-save-product');
            const originalText = btnSave.innerHTML;
            btnSave.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang lưu...';
            btnSave.disabled = true;

            try {
                if (id) {
                    await api.updateProduct(id, data);
                    showToast('Cập nhật thành công!');
                } else {
                    await api.createProduct(data);
                    showToast('Thêm mới thành công!');
                }
                closeModal('product');
                if (!id) currentProductPage = 0; 
                loadProducts();
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSave.innerHTML = originalText;
                btnSave.disabled = false;
            }
        });
    }

    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('bx-hide');
            this.classList.toggle('bx-show');
        });
    }

    // ==========================================
    // ORDER CREATION LOGIC (Autocomplete & Submit)
    // ==========================================
    
    // Helper function for Autocomplete
    function setupAutocomplete(inputEl, hiddenEl, dropdownEl, fetchFunction, renderItem, onSelect) {
        let timeout = null;
        
        const triggerSearch = (keyword) => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                try {
                    const items = await fetchFunction(keyword);
                    if (items.length === 0) {
                        dropdownEl.innerHTML = '<div class="autocomplete-error">Không tìm thấy dữ liệu phù hợp (Hoặc dữ liệu đã ngừng hoạt động/hết hàng)</div>';
                        dropdownEl.style.display = 'block';
                    } else {
                        dropdownEl.innerHTML = items.map(item => `
                            <div class="autocomplete-item" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
                                ${renderItem(item)}
                            </div>
                        `).join('');
                        dropdownEl.style.display = 'block';
                        
                        // Add click listeners to items
                        dropdownEl.querySelectorAll('.autocomplete-item').forEach(div => {
                            div.addEventListener('click', () => {
                                const item = JSON.parse(div.getAttribute('data-item'));
                                onSelect(item, inputEl, hiddenEl);
                                dropdownEl.style.display = 'none';
                            });
                        });
                    }
                } catch (error) {
                    const msg = error.message && error.message.includes('Khách hàng') ? error.message : 'Lỗi khi tìm kiếm!';
                    dropdownEl.innerHTML = `<div class="autocomplete-error" style="color:red; font-weight:bold;">${msg}</div>`;
                    dropdownEl.style.display = 'block';
                }
            }, 300);
        };

        inputEl.addEventListener('input', (e) => {
            hiddenEl.value = ''; // Reset ID if user types manually
            triggerSearch(e.target.value.trim());
        });

        inputEl.addEventListener('focus', (e) => {
            triggerSearch(e.target.value.trim());
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
                dropdownEl.style.display = 'none';
            }
        });
    }

    if (document.getElementById('order-create-form')) {
        // 1. Autocomplete Customer (Partner)
        setupAutocomplete(
            document.getElementById('orderCustomerSearch'),
            document.getElementById('orderCustomerId'),
            document.getElementById('orderCustomerDropdown'),
            async (keyword) => {
                const orderType = document.getElementById('orderType').value;
                const partnerType = orderType === 'NHAP_HANG' ? 'SUPPLIER' : 'BUYER';
                
                // Fetch filtered by type (works if backend is updated)
                const data = await api.getPartners(0, 10, keyword, partnerType);
                let items = (data.content || []).filter(p => p.isActive === true);
                
                // Frontend fallback filter (in case backend is not restarted and ignores type)
                items = items.filter(p => p.partnerType === partnerType);
                
                // If nothing found but user typed something, check if it exists under wrong type
                if (items.length === 0 && keyword.trim() !== '') {
                    const allData = await api.getPartners(0, 10, keyword, '');
                    const allItems = (allData.content || []).filter(p => p.isActive === true);
                    const wrongItems = allItems.filter(p => p.partnerType !== partnerType);
                    
                    if (wrongItems.length > 0) {
                        const wrongTypeNames = wrongItems.map(p => p.name).join(', ');
                        const expectedStr = orderType === 'NHAP_HANG' ? 'Nhập hàng' : 'Xuất hàng';
                        const actualStr = orderType === 'NHAP_HANG' ? 'Người mua (BUYER)' : 'Nhà cung cấp (SUPPLIER)';
                        throw new Error(`Khách hàng "${wrongTypeNames}" là ${actualStr}, chưa được đăng ký cho loại đơn ${expectedStr}!`);
                    }
                }
                return items;
            },
            (item) => `<strong>${item.name}</strong> - ${item.phone || 'Chưa có SĐT'}`,
            (item, inputEl, hiddenEl) => {
                inputEl.value = item.name;
                hiddenEl.value = item.id;
            }
        );

        // Reset selected customer when order type changes
        document.getElementById('orderType').addEventListener('change', () => {
            document.getElementById('orderCustomerSearch').value = '';
            document.getElementById('orderCustomerId').value = '';
            document.getElementById('orderCustomerDropdown').style.display = 'none';
        });

        // 2. Autocomplete Product
        setupAutocomplete(
            document.getElementById('orderProductSearch'),
            document.getElementById('orderProductId'),
            document.getElementById('orderProductDropdown'),
            async (keyword) => {
                const data = await api.getProducts(0, 10, keyword);
                return (data.content || []).filter(p => p.isActive === true); // Chỉ lấy Còn hàng
            },
            (item) => `<strong>${item.name}</strong> (${item.code})`,
            (item, inputEl, hiddenEl) => {
                inputEl.value = item.name;
                hiddenEl.value = item.id;
            }
        );

        // 3. Autocomplete Vehicle
        setupAutocomplete(
            document.getElementById('orderVehicleSearch'),
            document.getElementById('orderVehicleId'),
            document.getElementById('orderVehicleDropdown'),
            async (keyword) => {
                const data = await api.getVehicles(0, 10, keyword);
                return (data.content || []).filter(v => v.isActive === true); // Chỉ lấy Đang hoạt động
            },
            (item) => `<strong>${item.plateNumber}</strong> - TX: ${item.driverName}`,
            (item, inputEl, hiddenEl) => {
                inputEl.value = item.plateNumber;
                hiddenEl.value = item.id;
                // Auto-fill driver name
                document.getElementById('orderDriverName').value = item.driverName;
            }
        );

        // Submit form
        document.getElementById('order-create-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const type = document.getElementById('orderType').value;
            const customerId = document.getElementById('orderCustomerId').value;
            const productId = document.getElementById('orderProductId').value;
            const vehicleId = document.getElementById('orderVehicleId').value;
            const weight = document.getElementById('orderWeight').value;
            const note = document.getElementById('orderNote').value;
            
            // Validation
            if (!customerId) {
                showToast('Khách hàng chưa được đăng ký hãy đi tạo khách hàng', 'error');
                document.getElementById('orderCustomerSearch').focus();
                return;
            }
            if (!productId) {
                showToast('Sản phẩm chưa được đăng ký hãy đi tạo sản phẩm', 'error');
                document.getElementById('orderProductSearch').focus();
                return;
            }
            if (!vehicleId) {
                showToast('Biển số xe chưa được đăng ký hãy đi tạo biển số xe', 'error');
                document.getElementById('orderVehicleSearch').focus();
                return;
            }
            if (!document.getElementById('orderDriverName').value) {
                showToast('Tài xế chưa hợp lệ!', 'error');
                return;
            }

            const btnSubmit = document.getElementById('btn-submit-order');
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang tạo...';
            btnSubmit.disabled = true;

            try {
                // Prepare JSON according to user requirements
                const userObj = JSON.parse(localStorage.getItem('user')) || {};
                const orderData = {
                    orderCode: "ORD-" + Date.now(),
                    ordersType: type,
                    customerId: parseInt(customerId),
                    productId: parseInt(productId),
                    plateNumber: document.getElementById('orderVehicleSearch').value,
                    driverName: document.getElementById('orderDriverName').value,
                    orderedWeight: parseFloat(weight),
                    note: note,
                    orderDate: new Date().toISOString().split('T')[0],
                    createdById: userObj.id || 1,
                    weighedById: userObj.id || null
                };
                
                await api.createOrder(orderData);
                showToast('Tạo đơn hàng thành công!');
                
                // Reset form (giữ nguyên ngày)
                document.getElementById('order-create-form').reset();
                document.getElementById('orderCustomerId').value = '';
                document.getElementById('orderProductId').value = '';
                document.getElementById('orderVehicleId').value = '';
                document.getElementById('orderDate').value = new Date().toLocaleDateString('vi-VN');
                
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }
    // === Orders List Logic ===
    let currentOrderFilters = {
        customerNames: [],
        createdByNames: [],
        productNames: [],
        statuses: [],
        plateNumbers: []
    };

    async function loadOrders() {
        orderTableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getOrders(currentOrderPage, 10, currentOrderFilters);
            const orders = data.content || [];
            const totalPages = data.totalPages || 0;
            const totalElements = data.totalElements || 0;
            
            renderOrders(orders);
            updateOrderPaginationUI(totalPages, totalElements);
        } catch (error) {
            if (error.message.includes('UNAUTHORIZED')) {
                orderTableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: red; font-weight: bold;">LỖI BẢO MẬT BACKEND: ${error.message} (Hãy kiểm tra lại @PreAuthorize trên Controller)</td></tr>`;
            } else {
                orderTableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: red;">${error.message}</td></tr>`;
                showToast(error.message, 'error');
            }
        }
    }

    function renderOrders(orders) {
        orderTableBody.innerHTML = '';
        if (orders.length === 0) {
            orderTableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">Không có dữ liệu đơn hàng</td></tr>';
            return;
        }

        orders.forEach((order, index) => {
            const tr = document.createElement('tr');
            
            const stt = (currentOrderPage * 10) + index + 1;
            
            // Format status with color
            let statusHtml = `<span>${order.status || ''}</span>`;
            if (order.status === 'CHO_XAC_NHAN') {
                statusHtml = `<span style="color: #ff9800; font-weight: bold; background: #fff3e0; padding: 3px 8px; border-radius: 4px;">Chờ xác nhận</span>`;
            } else if (order.status === 'DA_XAC_NHAN') {
                statusHtml = `<span style="color: #2196F3; font-weight: bold; background: #e3f2fd; padding: 3px 8px; border-radius: 4px;">Đã xác nhận</span>`;
            } else if (order.status === 'DANG_GIAO') {
                statusHtml = `<span style="color: #9c27b0; font-weight: bold; background: #f3e5f5; padding: 3px 8px; border-radius: 4px;">Đang giao</span>`;
            } else if (order.status === 'HOAN_THANH') {
                statusHtml = `<span style="color: #4CAF50; font-weight: bold; background: #e8f5e9; padding: 3px 8px; border-radius: 4px;">Hoàn thành</span>`;
            } else if (order.status === 'HUY') {
                statusHtml = `<span style="color: #f44336; font-weight: bold; background: #ffebee; padding: 3px 8px; border-radius: 4px;">Hủy</span>`;
            }

            const w1 = order.weight1 ? order.weight1 : '-';
            const w2 = order.weight2 ? order.weight2 : '-';
            const nw = order.netWeight ? order.netWeight : '-';
            
            tr.innerHTML = `
                <td>${stt}</td>
                <td>${order.customerName || '-'}</td>
                <td>${order.createdByName || '-'}</td>
                <td>${order.orderedWeight || '-'}</td>
                <td>${order.orderDate || '-'}</td>
                <td>${order.productName || '-'}</td>
                <td>${statusHtml}</td>
                <td>${order.plateNumber || '-'}</td>
                <td>${w1}</td>
                <td>${w2}</td>
                <td>${nw}</td>
            `;
            orderTableBody.appendChild(tr);
        });
    }

    function updateOrderPaginationUI(totalPages, totalElements) {
        if (btnPrevPageOrder && btnNextPageOrder && currentPageDisplayOrder && orderPaginationInfo) {
            btnPrevPageOrder.disabled = currentOrderPage === 0;
            btnNextPageOrder.disabled = currentOrderPage >= totalPages - 1 || totalPages === 0;
            currentPageDisplayOrder.textContent = currentOrderPage + 1;

            const startIdx = totalElements === 0 ? 0 : (currentOrderPage * 10) + 1;
            const endIdx = Math.min((currentOrderPage + 1) * 10, totalElements);
            orderPaginationInfo.textContent = `Hiển thị ${startIdx}-${endIdx} trên ${totalElements}`;
        }
    }

    if (btnPrevPageOrder) {
        btnPrevPageOrder.addEventListener('click', () => {
            if (currentOrderPage > 0) {
                currentOrderPage--;
                loadOrders();
            }
        });
    }

    if (btnNextPageOrder) {
        btnNextPageOrder.addEventListener('click', () => {
            currentOrderPage++;
            loadOrders();
        });
    }

    // Setup Filter Dropdowns
    function initCustomDropdown(dropdownId, isDynamic, fetchApi, onApply) {
        const dropdown = document.getElementById(dropdownId);
        if(!dropdown) return;
        const header = dropdown.querySelector('.dropdown-header');
        const search = dropdown.querySelector('.dropdown-search');
        const optionsContainer = dropdown.querySelector('.dropdown-options');

        header.addEventListener('click', async (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-dropdown').forEach(d => {
                if(d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
            
            if(dropdown.classList.contains('open') && isDynamic && optionsContainer.children.length === 0) {
                // Fetch dynamic options
                optionsContainer.innerHTML = '<div style="padding:10px;text-align:center"><i class="bx bx-loader-alt bx-spin"></i></div>';
                try {
                    const data = await fetchApi('');
                    renderOptions(data);
                } catch(err) {
                    optionsContainer.innerHTML = `<div style="padding:10px;color:red">Lỗi tải dữ liệu</div>`;
                }
            }
        });

        search.addEventListener('click', e => e.stopPropagation());
        
        // Cần setTimeout để typing không bị request liên tục
        let searchTimeout;
        search.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            if(isDynamic) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(async () => {
                    try {
                        const data = await fetchApi(keyword);
                        renderOptions(data);
                    } catch(err) {}
                }, 300);
            } else {
                // Lọc trên giao diện
                Array.from(optionsContainer.children).forEach(label => {
                    const text = label.textContent.toLowerCase();
                    label.style.display = text.includes(keyword) ? 'block' : 'none';
                });
            }
        });

        optionsContainer.addEventListener('click', e => e.stopPropagation());

        function renderOptions(items) {
            optionsContainer.innerHTML = '';
            items.forEach(item => {
                const label = document.createElement('label');
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.value = item.value;
                cb.dataset.name = item.name;
                label.appendChild(cb);
                label.appendChild(document.createTextNode(' ' + item.name));
                optionsContainer.appendChild(label);
            });
        }
    }

    // Initialize all filters
    initCustomDropdown('dropdown-filter-customer', true, async (keyword) => {
        const res = await api.getPartners(0, 50, keyword, '');
        return (res.content || []).map(p => ({value: p.name, name: p.name}));
    });

    initCustomDropdown('dropdown-filter-product', true, async (keyword) => {
        const res = await api.getProducts(0, 50, keyword);
        return (res.content || []).map(p => ({value: p.name, name: p.name}));
    });

    initCustomDropdown('dropdown-filter-plate', true, async (keyword) => {
        const res = await api.getVehicles(0, 50, keyword);
        return (res.content || []).map(v => ({value: v.plateNumber, name: v.plateNumber}));
    });

    initCustomDropdown('dropdown-filter-status', false); // Status is static

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
    });

    const btnApplyFilters = document.getElementById('btn-apply-order-filters');
    if (btnApplyFilters) {
        btnApplyFilters.addEventListener('click', () => {
            currentOrderFilters.customerNames = Array.from(document.querySelectorAll('#dropdown-filter-customer .dropdown-options input:checked')).map(cb => cb.value);
            currentOrderFilters.productNames = Array.from(document.querySelectorAll('#dropdown-filter-product .dropdown-options input:checked')).map(cb => cb.value);
            currentOrderFilters.plateNumbers = Array.from(document.querySelectorAll('#dropdown-filter-plate .dropdown-options input:checked')).map(cb => cb.value);
            currentOrderFilters.statuses = Array.from(document.querySelectorAll('#dropdown-filter-status .dropdown-options input:checked')).map(cb => cb.value);
            
            const createdByFilter = document.getElementById('filter-created-by').value.trim();
            currentOrderFilters.createdByNames = createdByFilter ? [createdByFilter] : [];

            currentOrderPage = 0;
            loadOrders();
        });
    }

    // ==================== DASHBOARD LOGIC ====================
    let volumeChartInstance = null;

    function showDashboardPanel() {
        if (!dashboardPanel) return;
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        if (orderListPanel) orderListPanel.style.display = 'none';
        dashboardPanel.style.display = 'block';

        if (menuGroupDashboard) menuGroupDashboard.classList.add('active');
        menuGroupVehicle.classList.remove('active');
        menuGroupPartner.classList.remove('active');
        if (menuGroupProduct) menuGroupProduct.classList.remove('active');
        if (menuGroupOrder) menuGroupOrder.classList.remove('active', 'open');
        if (menuGroupOrderList) menuGroupOrderList.classList.remove('active', 'open');

        mainBreadcrumb.innerHTML = 'Home <span class="separator">&bull;</span> <span class="current">Tổng quan</span>';
        document.getElementById('page-title').innerText = 'Tổng quan';

        loadDashboardStats();
        loadDashboardLatestOrders();
    }

    const dashChartDaysSelect = document.getElementById('dash-chart-days');
    if (dashChartDaysSelect) {
        dashChartDaysSelect.addEventListener('change', () => {
            loadDashboardStats(parseInt(dashChartDaysSelect.value));
        });
    }

    const dashViewAllOrders = document.getElementById('dash-view-all-orders');
    if (dashViewAllOrders) {
        dashViewAllOrders.addEventListener('click', (e) => {
            e.preventDefault();
            showOrderListPanel('NHAP_HANG');
        });
    }

    async function loadDashboardStats(days = 3) {
        try {
            const response = await api.get('/dashboard/statistics?days=' + days);
            if (response.success) {
                const data = response.data;
                // Nhap hang stats
                document.getElementById('dash-nhap-total').innerText = data.importStats.totalOrders;
                document.getElementById('dash-nhap-processing').innerText = data.importStats.processingOrders;
                document.getElementById('dash-nhap-completed').innerText = data.importStats.completedOrders;
                document.getElementById('dash-nhap-weight').innerText = data.importStats.totalWeight;

                // Xuat hang stats
                document.getElementById('dash-xuat-total').innerText = data.exportStats.totalOrders;
                document.getElementById('dash-xuat-processing').innerText = data.exportStats.processingOrders;
                document.getElementById('dash-xuat-completed').innerText = data.exportStats.completedOrders;
                document.getElementById('dash-xuat-weight').innerText = data.exportStats.totalWeight;

                renderVolumeChart(data.chartData);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    function renderVolumeChart(chartData) {
        const ctx = document.getElementById('volumeChart');
        if (!ctx) return;

        if (volumeChartInstance) {
            volumeChartInstance.destroy();
        }

        // Register custom interaction mode for stack
        if (Chart.Interaction && Chart.Interaction.modes) {
            Chart.Interaction.modes.myStack = function(chart, e, options, useFinalPosition) {
                const items = Chart.Interaction.modes.index(chart, e, options, useFinalPosition);
                if (!items.length) return items;
                const intersected = Chart.Interaction.modes.point(chart, e, options, useFinalPosition);
                if (!intersected.length) return []; 
                const activeStack = chart.data.datasets[intersected[0].datasetIndex].stack;
                return items.filter(item => chart.data.datasets[item.datasetIndex].stack === activeStack && item.element.$context.raw > 0);
            };
        }

        const topTotalsPlugin = {
            id: 'topTotals',
            afterDatasetsDraw: (chart) => {
                const ctx = chart.ctx;
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                const metaData = chart.data.datasets.map((_, i) => chart.getDatasetMeta(i));
                const numPoints = chart.data.labels.length;
                for (let i = 0; i < numPoints; i++) {
                    let nhapTotal = 0, xuatTotal = 0;
                    let nhapTopY = chart.scales.y.bottom, xuatTopY = chart.scales.y.bottom;
                    let nhapX = 0, xuatX = 0;

                    metaData.forEach((meta, dsIdx) => {
                        if (meta.hidden) return;
                        const val = chart.data.datasets[dsIdx].data[i];
                        if (val > 0) {
                            const stack = chart.data.datasets[dsIdx].stack;
                            const element = meta.data[i];
                            if (stack === 'Nhập Hàng') {
                                nhapTotal += val;
                                nhapTopY = Math.min(nhapTopY, element.y);
                                nhapX = element.x;
                            } else if (stack === 'Xuất Hàng') {
                                xuatTotal += val;
                                xuatTopY = Math.min(xuatTopY, element.y);
                                xuatX = element.x;
                            }
                        }
                    });

                    if (nhapTotal > 0) ctx.fillText(nhapTotal, nhapX, nhapTopY - 5);
                    if (xuatTotal > 0) ctx.fillText(xuatTotal, xuatX, xuatTopY - 5);
                }
            }
        };


        // Labels (dates)
        const labels = chartData.map(d => {
            const dateObj = new Date(d.date);
            return dateObj.toLocaleDateString('vi-VN');
        });

        // Collect all distinct product names
        const productsSet = new Set();
        chartData.forEach(d => {
            d.imports.forEach(p => productsSet.add(p.productName));
            d.exports.forEach(p => productsSet.add(p.productName));
        });
        const products = Array.from(productsSet);

        // Define a color palette
        const colors = [
            '#1a63f4', '#05cd99', '#ffce20', '#ee5d50', 
            '#8e44ad', '#e67e22', '#2c3e50', '#16a085', '#d35400'
        ];

        const datasets = [];

        // Build dataset for IMPORTS
        products.forEach((prodName, idx) => {
            const data = chartData.map(d => {
                const p = d.imports.find(item => item.productName === prodName);
                return p ? p.totalWeight : 0;
            });
            datasets.push({
                label: prodName,
                data: data,
                backgroundColor: colors[idx % colors.length],
                stack: 'Nhập Hàng',
            });
        });

        // Build dataset for EXPORTS
        products.forEach((prodName, idx) => {
            const data = chartData.map(d => {
                const p = d.exports.find(item => item.productName === prodName);
                return p ? p.totalWeight : 0;
            });
            datasets.push({
                label: prodName,
                data: data,
                backgroundColor: colors[idx % colors.length],
                stack: 'Xuất Hàng',
            });
        });

        volumeChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            plugins: [topTotalsPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        title: { display: true, text: 'Ngày / Cột: Nhập (Trái) - Xuất (Phải)' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: { display: true, text: 'Tấn' }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: Chart.Interaction && Chart.Interaction.modes ? 'myStack' : 'nearest',
                        intersect: true,
                        callbacks: {
                            title: function(tooltipItems) {
                                if (!tooltipItems.length) return '';
                                return tooltipItems[0].label + ' (' + tooltipItems[0].dataset.stack + ')';
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { 
                            boxWidth: 12,
                            filter: function(item, chart) {
                                return item.datasetIndex < products.length;
                            }
                        }
                    }
                }
            }
        });
    }

    async function loadDashboardLatestOrders() {
        const tbody = document.getElementById('dash-latest-table-body');
        if (!tbody) return;
        try {
            const url = `/orders/filter?page=0&size=10&sort=createdAt,desc`;
            const response = await api.post(url, {});
            
            if (response && response.content) {
                tbody.innerHTML = '';
                const orders = response.content;
                if (orders.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có đơn hàng nào</td></tr>';
                    return;
                }
                
                orders.forEach(order => {
                    const statusClass = order.status === 'HOAN_THANH' ? 'badge-success' : 
                                      (order.status === 'CHO_XAC_NHAN' ? 'badge-warning' : 'badge-primary');
                    const statusText = order.status === 'HOAN_THANH' ? 'Hoàn thành' : 
                                     (order.status === 'CHO_XAC_NHAN' ? 'Chờ xác nhận' : 
                                     (order.status === 'HUY' ? 'Đã hủy' : 'Đang xử lý'));
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${order.orderCode}</td>
                        <td>${order.customerName}</td>
                        <td>${order.orderedWeight} tấn</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Error load latest orders', error);
        }
    }

    // Start App
    init();
    // Default to Dashboard Panel instead of Vehicle
    showDashboardPanel();
});
