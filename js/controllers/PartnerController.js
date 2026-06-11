import api from '../api.js';

export default class PartnerController {
    constructor(authService, uiUtils, modalManager) {
        this.authService = authService;
        this.uiUtils = uiUtils;
        this.modalManager = modalManager;

        // State
        this.currentPartners = [];
        this.currentPage = 0;
        this.pageSize = 10;
        this.totalPages = 0;
        this.totalElements = 0;
        this.currentKeyword = '';
        this.currentType = '';

        // DOM Elements
        this.tableBody = document.getElementById('partner-table-body');
        this.searchInput = document.getElementById('search-input-partner');
        this.searchIcon = document.querySelector('#partner-list-panel .search-box i');
        this.typeRadios = document.querySelectorAll('input[name="partnerType"]');
        
        this.setupListeners();
    }

    setupListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        if (this.searchIcon) {
            this.searchIcon.addEventListener('click', () => this.performSearch());
            this.searchIcon.style.cursor = 'pointer';
        }

        this.typeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentType = e.target.value;
                this.currentPage = 0;
                this.loadData();
            });
        });

        document.getElementById('btn-prev-page-partner')?.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadData();
            }
        });

        document.getElementById('btn-next-page-partner')?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages - 1) {
                this.currentPage++;
                this.loadData();
            }
        });
    }

    performSearch() {
        this.currentKeyword = this.searchInput.value.trim();
        this.currentPage = 0;
        this.loadData();
    }

    async loadData() {
        this.tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getPartners(this.currentPage, this.pageSize, this.currentKeyword, this.currentType);
            this.currentPartners = data.content || [];
            this.totalPages = data.totalPages || 0;
            this.totalElements = data.totalElements || 0;
            
            this.renderTable();
            this.updatePaginationUI();
        } catch (error) {
            if (error.message.includes('UNAUTHORIZED')) {
                this.tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red; font-weight: bold;">LỖI BẢO MẬT BACKEND: ${error.message}</td></tr>`;
            } else {
                this.tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">${error.message}</td></tr>`;
                this.uiUtils.showToast(error.message, 'error');
            }
        }
    }

    renderTable() {
        if (this.currentPartners.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Không có dữ liệu.</td></tr>';
            return;
        }

        const isAdmin = this.authService.isAdmin;

        this.tableBody.innerHTML = this.currentPartners.map((p, index) => {
            const statusBadge = p.isActive 
                ? '<span class="status-badge status-active">Hoạt động</span>' 
                : '<span class="status-badge status-inactive">Ngừng HĐ</span>';
                
            const typeLabel = p.partnerType === 'BUYER' ? 'Người mua' : (p.partnerType === 'SUPPLIER' ? 'Nhà cung cấp' : p.partnerType);
            
            return `
            <tr>
                <td>${(this.currentPage * this.pageSize) + index + 1}</td>
                <td><strong>${p.name || ''}</strong></td>
                <td>${p.address || ''}</td>
                <td>${p.phone || ''}</td>
                <td>${typeLabel}</td>
                <td>${statusBadge}</td>
                <td>${p.note || ''}</td>
                ${isAdmin ? `
                <td>
                    <div class="action-icons">
                        <i class='bx bx-edit icon-edit' onclick="app.partnerController.edit(${p.id})" title="Sửa"></i>
                    </div>
                </td>
                ` : ''}
            </tr>`;
        }).join('');
    }

    updatePaginationUI() {
        const btnPrev = document.getElementById('btn-prev-page-partner');
        const btnNext = document.getElementById('btn-next-page-partner');
        const pageDisplay = document.getElementById('current-page-display-partner');
        const pageInfo = document.getElementById('partner-pagination-info');

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
            const partner = this.currentPartners.find(p => p.id === id) || await api.getPartnerById(id);
            window.app.openModal('edit', partner, 'partner');
        } catch (error) {
            this.uiUtils.showToast(error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác.')) {
            try {
                await api.deletePartner(id);
                this.uiUtils.showToast('Xóa thành công!');
                this.loadData();
            } catch (error) {
                this.uiUtils.showToast(error.message, 'error');
            }
        }
    }
}
