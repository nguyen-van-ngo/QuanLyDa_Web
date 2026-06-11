import api from '../api.js';

export default class VehicleController {
    constructor(authService, uiUtils, modalManager) {
        this.authService = authService;
        this.uiUtils = uiUtils;
        this.modalManager = modalManager;

        // State
        this.currentVehicles = [];
        this.currentPage = 0;
        this.pageSize = 10;
        this.totalPages = 0;
        this.totalElements = 0;
        this.currentKeyword = '';

        // DOM Elements
        this.tableBody = document.getElementById('vehicle-table-body');
        this.searchInput = document.getElementById('search-input');
        this.searchIcon = document.querySelector('#vehicle-list-panel .search-box i');
        
        this.setupListeners();
    }

    setupListeners() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        if (this.searchIcon) {
            this.searchIcon.addEventListener('click', () => this.performSearch());
            this.searchIcon.style.cursor = 'pointer';
        }

        // Pagination
        document.getElementById('btn-prev-page-vehicle')?.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadData();
            }
        });

        document.getElementById('btn-next-page-vehicle')?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages - 1) {
                this.currentPage++;
                this.loadData();
            }
        });
        
        // Add button is handled in main.js or modalManager, but let's bind it here if possible.
        // Or we can let ModalManager handle opening modals.
    }

    performSearch() {
        this.currentKeyword = this.searchInput.value.trim();
        this.currentPage = 0; 
        this.loadData();
    }

    async loadData() {
        this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getVehicles(this.currentPage, this.pageSize, this.currentKeyword);
            this.currentVehicles = data.content || [];
            this.totalPages = data.totalPages || 0;
            this.totalElements = data.totalElements || 0;
            
            this.renderTable();
            this.updatePaginationUI();
        } catch (error) {
            if (error.message.includes('UNAUTHORIZED')) {
                this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red; font-weight: bold;">LỖI BẢO MẬT BACKEND: ${error.message}</td></tr>`;
            } else {
                this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">${error.message}</td></tr>`;
                this.uiUtils.showToast(error.message, 'error');
            }
        }
    }

    renderTable() {
        if (this.currentVehicles.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không có dữ liệu.</td></tr>';
            return;
        }

        const isAdmin = this.authService.isAdmin;

        this.tableBody.innerHTML = this.currentVehicles.map((v, index) => `
            <tr>
                <td>${(this.currentPage * this.pageSize) + index + 1}</td>
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
                        <i class='bx bx-edit icon-edit' onclick="app.vehicleController.edit(${v.id})" title="Sửa"></i>
                        <i class='bx bx-trash icon-delete' onclick="app.vehicleController.delete(${v.id})" title="Xóa"></i>
                    </div>
                </td>
                ` : ''}
            </tr>
        `).join('');
    }

    updatePaginationUI() {
        const btnPrev = document.getElementById('btn-prev-page-vehicle');
        const btnNext = document.getElementById('btn-next-page-vehicle');
        const pageDisplay = document.getElementById('current-page-display-vehicle');
        const pageInfo = document.getElementById('vehicle-pagination-info');

        if (btnPrev && btnNext && pageDisplay && pageInfo) {
            btnPrev.disabled = this.currentPage === 0;
            btnNext.disabled = this.currentPage >= this.totalPages - 1 || this.totalPages === 0;
            pageDisplay.textContent = this.currentPage + 1;

            const startIdx = this.totalElements === 0 ? 0 : (this.currentPage * this.pageSize) + 1;
            const endIdx = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
            pageInfo.textContent = `Hiển thị ${startIdx}-${endIdx} trên ${this.totalElements}`;
        }
    }

    async edit(id) {
        try {
            const vehicle = this.currentVehicles.find(v => v.id === id) || await api.getVehicleById(id);
            // This relies on a global `openModal` or `app.openModal` function
            window.app.openModal('edit', vehicle, 'vehicle');
        } catch (error) {
            this.uiUtils.showToast(error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('Bạn có chắc chắn muốn xóa biển số xe này không? Hành động này không thể hoàn tác.')) {
            try {
                await api.deleteVehicle(id);
                this.uiUtils.showToast('Xóa thành công!');
                this.loadData();
            } catch (error) {
                this.uiUtils.showToast(error.message, 'error');
            }
        }
    }
}
