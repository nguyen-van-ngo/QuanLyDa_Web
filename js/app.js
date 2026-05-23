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
    const mainBreadcrumb = document.getElementById('main-breadcrumb');

    // Panels
    const vehicleListPanel = document.getElementById('vehicle-list-panel');
    const partnerListPanel = document.getElementById('partner-list-panel');
    const productListPanel = document.getElementById('product-list-panel');
    const orderCreatePanel = document.getElementById('order-create-panel');

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
        showVehiclePanel(); // Default to vehicle panel
    }

    function showVehiclePanel() {
        vehicleListPanel.style.display = 'block';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        
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
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'block';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        
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
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'block';
        if (orderCreatePanel) orderCreatePanel.style.display = 'none';
        
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
        vehicleListPanel.style.display = 'none';
        partnerListPanel.style.display = 'none';
        if (productListPanel) productListPanel.style.display = 'none';
        if (orderCreatePanel) orderCreatePanel.style.display = 'block';
        
        if (menuGroupOrder) menuGroupOrder.classList.add('active', 'open');
        menuGroupVehicle.classList.remove('active');
        menuGroupPartner.classList.remove('active');
        if (menuGroupProduct) menuGroupProduct.classList.remove('active');
        
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

    // Sidebar Menu Events
    // Toggle submenus
    document.querySelectorAll('.has-submenu').forEach(item => {
        item.addEventListener('click', () => {
            const parentLi = item.parentElement;
            parentLi.classList.toggle('open');
        });
    });

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
                localStorage.setItem('user', JSON.stringify({username: usernameInput}));
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
        
        inputEl.addEventListener('input', (e) => {
            const keyword = e.target.value.trim();
            hiddenEl.value = ''; // Reset ID if user types manually
            if (keyword.length < 1) {
                dropdownEl.style.display = 'none';
                return;
            }
            
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                try {
                    const items = await fetchFunction(keyword);
                    if (items.length === 0) {
                        dropdownEl.innerHTML = '<div class="autocomplete-error">Không tìm thấy dữ liệu phù hợp (Hoặc dữ liệu đã ngừng hoạt động/hết hàng)</div>';
                        dropdownEl.style.display = 'block';
                    } else {
                        dropdownEl.innerHTML = items.map(item => `
                            <div class="autocomplete-item" data-item='${JSON.stringify(item)}'>
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
                    dropdownEl.innerHTML = '<div class="autocomplete-error">Lỗi khi tìm kiếm!</div>';
                    dropdownEl.style.display = 'block';
                }
            }, 300);
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
                const data = await api.getPartners(0, 10, keyword, '');
                return (data.content || []).filter(p => p.isActive === true); // Chỉ lấy Hoạt động
            },
            (item) => `<strong>${item.name}</strong> - ${item.phone || 'Chưa có SĐT'}`,
            (item, inputEl, hiddenEl) => {
                inputEl.value = item.name;
                hiddenEl.value = item.id;
            }
        );

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
                showToast('Vui lòng chọn Khách hàng hợp lệ từ danh sách gợi ý!', 'error');
                document.getElementById('orderCustomerSearch').focus();
                return;
            }
            if (!productId) {
                showToast('Vui lòng chọn Sản phẩm hợp lệ từ danh sách gợi ý!', 'error');
                document.getElementById('orderProductSearch').focus();
                return;
            }
            if (!vehicleId) {
                showToast('Vui lòng chọn Biển số xe hợp lệ từ danh sách gợi ý!', 'error');
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
                const orderData = {
                    ordersType: type,
                    customerId: parseInt(customerId),
                    productId: parseInt(productId),
                    plateNumber: document.getElementById('orderVehicleSearch').value,
                    driverName: document.getElementById('orderDriverName').value,
                    orderedWeight: parseFloat(weight),
                    note: note
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

    // Start App
    init();
});
