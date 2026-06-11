import api from '../api.js';

export default class OrderController {
    constructor(authService, uiUtils) {
        this.authService = authService;
        this.uiUtils = uiUtils;

        // State for List
        this.currentOrderPage = 0;
        this.currentOrderFilters = {
            customerNames: [],
            createdByNames: [],
            productNames: [],
            statuses: [],
            plateNumbers: [],
            ordersType: 'NHAP_HANG'
        };

        // DOM Elements
        this.tableBody = document.getElementById('order-table-body');
        
        this.setupCreateOrderListeners();
        this.setupOrderListListeners();
    }

    // ==========================================
    // ORDER CREATION LOGIC
    // ==========================================
    setupCreateOrderListeners() {
        if (document.getElementById('order-create-form')) {
            // Autocomplete Setup Function
            const setupAutocomplete = (inputEl, hiddenEl, dropdownEl, fetchFunction, renderItem, onSelect) => {
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
                    hiddenEl.value = ''; 
                    triggerSearch(e.target.value.trim());
                });

                inputEl.addEventListener('focus', (e) => triggerSearch(e.target.value.trim()));

                document.addEventListener('click', (e) => {
                    if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
                        dropdownEl.style.display = 'none';
                    }
                });
            };

            // 1. Customer
            setupAutocomplete(
                document.getElementById('orderCustomerSearch'),
                document.getElementById('orderCustomerId'),
                document.getElementById('orderCustomerDropdown'),
                async (keyword) => {
                    const orderType = document.getElementById('orderType').value;
                    const partnerType = orderType === 'NHAP_HANG' ? 'SUPPLIER' : 'BUYER';
                    
                    const data = await api.getPartners(0, 10, keyword, partnerType);
                    let items = (data.content || []).filter(p => p.isActive === true);
                    items = items.filter(p => p.partnerType === partnerType);
                    
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

            document.getElementById('orderType').addEventListener('change', () => {
                document.getElementById('orderCustomerSearch').value = '';
                document.getElementById('orderCustomerId').value = '';
                document.getElementById('orderCustomerDropdown').style.display = 'none';
            });

            // 2. Product
            setupAutocomplete(
                document.getElementById('orderProductSearch'),
                document.getElementById('orderProductId'),
                document.getElementById('orderProductDropdown'),
                async (keyword) => {
                    const data = await api.getProducts(0, 10, keyword);
                    return (data.content || []).filter(p => p.isActive === true); 
                },
                (item) => `<strong>${item.name}</strong> (${item.code})`,
                (item, inputEl, hiddenEl) => {
                    inputEl.value = item.name;
                    hiddenEl.value = item.id;
                }
            );

            // 3. Vehicle
            setupAutocomplete(
                document.getElementById('orderVehicleSearch'),
                document.getElementById('orderVehicleId'),
                document.getElementById('orderVehicleDropdown'),
                async (keyword) => {
                    const data = await api.getVehicles(0, 10, keyword);
                    return (data.content || []).filter(v => v.isActive === true); 
                },
                (item) => `<strong>${item.plateNumber}</strong> - TX: ${item.driverName}`,
                (item, inputEl, hiddenEl) => {
                    inputEl.value = item.plateNumber;
                    hiddenEl.value = item.id;
                    document.getElementById('orderDriverName').value = item.driverName;
                }
            );

            // Form Submit
            document.getElementById('order-create-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const type = document.getElementById('orderType').value;
                const customerId = document.getElementById('orderCustomerId').value;
                const productId = document.getElementById('orderProductId').value;
                const vehicleId = document.getElementById('orderVehicleId').value;
                const weight = document.getElementById('orderWeight').value;
                const note = document.getElementById('orderNote').value;
                
                if (!customerId) return this.uiUtils.showToast('Khách hàng chưa hợp lệ!', 'error');
                if (!productId) return this.uiUtils.showToast('Sản phẩm chưa hợp lệ!', 'error');
                if (!vehicleId) return this.uiUtils.showToast('Biển số xe chưa hợp lệ!', 'error');
                if (!document.getElementById('orderDriverName').value) return this.uiUtils.showToast('Tài xế chưa hợp lệ!', 'error');

                const btnSubmit = document.getElementById('btn-submit-order');
                const originalText = btnSubmit.innerHTML;
                btnSubmit.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang tạo...';
                btnSubmit.disabled = true;

                try {
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
                        weighedById: null
                    };
                    
                    await api.createOrder(orderData);
                    this.uiUtils.showToast('Tạo đơn hàng thành công!');
                    
                    document.getElementById('order-create-form').reset();
                    document.getElementById('orderCustomerId').value = '';
                    document.getElementById('orderProductId').value = '';
                    document.getElementById('orderVehicleId').value = '';
                    document.getElementById('orderDate').value = new Date().toLocaleDateString('vi-VN');
                    
                } catch (error) {
                    this.uiUtils.showToast(error.message, 'error');
                } finally {
                    btnSubmit.innerHTML = originalText;
                    btnSubmit.disabled = false;
                }
            });
        }
    }

    // ==========================================
    // ORDER LIST LOGIC
    // ==========================================
    setupOrderListListeners() {
        document.getElementById('btn-prev-page-order')?.addEventListener('click', () => {
            if (this.currentOrderPage > 0) {
                this.currentOrderPage--;
                this.loadOrders();
            }
        });

        document.getElementById('btn-next-page-order')?.addEventListener('click', () => {
            this.currentOrderPage++;
            this.loadOrders();
        });

        this.initCustomDropdown('dropdown-filter-customer', true, async (keyword) => {
            const res = await api.getPartners(0, 50, keyword, '');
            return (res.content || []).map(p => ({value: p.name, name: p.name}));
        });

        this.initCustomDropdown('dropdown-filter-product', true, async (keyword) => {
            const res = await api.getProducts(0, 50, keyword);
            return (res.content || []).map(p => ({value: p.name, name: p.name}));
        });

        this.initCustomDropdown('dropdown-filter-plate', true, async (keyword) => {
            const res = await api.getVehicles(0, 50, keyword);
            return (res.content || []).map(v => ({value: v.plateNumber, name: v.plateNumber}));
        });

        this.initCustomDropdown('dropdown-filter-status', false);

        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
        });

        const btnApplyFilters = document.getElementById('btn-apply-order-filters');
        if (btnApplyFilters) {
            btnApplyFilters.addEventListener('click', () => {
                this.currentOrderFilters.customerNames = Array.from(document.querySelectorAll('#dropdown-filter-customer .dropdown-options input:checked')).map(cb => cb.value);
                this.currentOrderFilters.productNames = Array.from(document.querySelectorAll('#dropdown-filter-product .dropdown-options input:checked')).map(cb => cb.value);
                this.currentOrderFilters.plateNumbers = Array.from(document.querySelectorAll('#dropdown-filter-plate .dropdown-options input:checked')).map(cb => cb.value);
                this.currentOrderFilters.statuses = Array.from(document.querySelectorAll('#dropdown-filter-status .dropdown-options input:checked')).map(cb => cb.value);
                
                const createdByFilter = document.getElementById('filter-created-by').value.trim();
                this.currentOrderFilters.createdByNames = createdByFilter ? [createdByFilter] : [];

                this.currentOrderPage = 0;
                this.loadOrders();
            });
        }
    }

    initCustomDropdown(dropdownId, isDynamic, fetchApi) {
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

    async loadOrders() {
        if(!this.tableBody) return;
        this.tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getOrders(this.currentOrderPage, 10, this.currentOrderFilters);
            const orders = data.content || [];
            const totalPages = data.totalPages || 0;
            const totalElements = data.totalElements || 0;
            
            this.renderOrders(orders);
            this.updatePaginationUI(totalPages, totalElements);
        } catch (error) {
            if (error.message.includes('UNAUTHORIZED')) {
                this.tableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: red; font-weight: bold;">LỖI BẢO MẬT BACKEND: ${error.message}</td></tr>`;
            } else {
                this.tableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: red;">${error.message}</td></tr>`;
                this.uiUtils.showToast(error.message, 'error');
            }
        }
    }

    renderOrders(orders) {
        this.tableBody.innerHTML = '';
        if (orders.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">Không có dữ liệu đơn hàng</td></tr>';
            return;
        }

        orders.forEach((order, index) => {
            const tr = document.createElement('tr');
            const stt = (this.currentOrderPage * 10) + index + 1;
            
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
            this.tableBody.appendChild(tr);
        });
    }

    updatePaginationUI(totalPages, totalElements) {
        const btnPrevPageOrder = document.getElementById('btn-prev-page-order');
        const btnNextPageOrder = document.getElementById('btn-next-page-order');
        const currentPageDisplayOrder = document.getElementById('current-page-display-order');
        const orderPaginationInfo = document.getElementById('order-pagination-info');

        if (btnPrevPageOrder && btnNextPageOrder && currentPageDisplayOrder && orderPaginationInfo) {
            btnPrevPageOrder.disabled = this.currentOrderPage === 0;
            btnNextPageOrder.disabled = this.currentOrderPage >= totalPages - 1 || totalPages === 0;
            currentPageDisplayOrder.textContent = this.currentOrderPage + 1;

            const startIdx = totalElements === 0 ? 0 : (this.currentOrderPage * 10) + 1;
            const endIdx = Math.min((this.currentOrderPage + 1) * 10, totalElements);
            orderPaginationInfo.textContent = `Hiển thị ${startIdx}-${endIdx} trên ${totalElements}`;
        }
    }
}
