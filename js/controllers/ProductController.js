import api from '../api.js';

export default class ProductController {
    constructor(authService, uiUtils, modalManager) {
        this.authService = authService;
        this.uiUtils = uiUtils;
        this.modalManager = modalManager;

        // State
        this.currentProducts = [];
        this.currentPage = 0;
        this.pageSize = 10;
        this.totalPages = 0;
        this.totalElements = 0;
        this.currentKeyword = '';

        // DOM Elements
        this.tableBody = document.getElementById('product-table-body');
        this.searchInput = document.getElementById('search-input-product');
        this.searchIcon = document.querySelector('#product-list-panel .search-box i');
        
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

        document.getElementById('btn-prev-page-product')?.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadData();
            }
        });

        document.getElementById('btn-next-page-product')?.addEventListener('click', () => {
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
        if(!this.tableBody) return;
        this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><i class="bx bx-loader-alt bx-spin"></i> Đang tải dữ liệu...</td></tr>';
        try {
            const data = await api.getProducts(this.currentPage, this.pageSize, this.currentKeyword);
            this.currentProducts = data.content || [];
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
        if (this.currentProducts.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không có dữ liệu.</td></tr>';
            return;
        }

        const isAdmin = this.authService.isAdmin;

        this.tableBody.innerHTML = this.currentProducts.map((p, index) => {
            const statusBadge = p.isActive 
                ? '<span class="status-badge status-active">Còn Hàng</span>' 
                : '<span class="status-badge status-inactive">Hết Hàng</span>';
                
            const typeLabel = p.productType === 'DA_XO_BO' ? 'Đá xô bồ' : (p.productType === 'DA_THANH_PHAM' ? 'Đá thành phẩm' : p.productType);
            
            return `
            <tr>
                <td>${(this.currentPage * this.pageSize) + index + 1}</td>
                <td><strong>${p.code || ''}</strong></td>
                <td>${p.name || ''}</td>
                <td>${typeLabel}</td>
                <td>${p.unit || ''}</td>
                <td>${statusBadge}</td>
                ${isAdmin ? `
                <td>
                    <div class="action-icons">
                        <i class='bx bx-edit icon-edit' onclick="app.productController.edit(${p.id})" title="Sửa"></i>
                    </div>
                </td>
                ` : ''}
            </tr>`;
        }).join('');
    }

    updatePaginationUI() {
        const btnPrev = document.getElementById('btn-prev-page-product');
        const btnNext = document.getElementById('btn-next-page-product');
        const pageDisplay = document.getElementById('current-page-display-product');
        const pageInfo = document.getElementById('product-pagination-info');

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
            const product = this.currentProducts.find(p => p.id === id) || await api.getProductById(id);
            window.app.openModal('edit', product, 'product');
        } catch (error) {
            this.uiUtils.showToast(error.message, 'error');
        }
    }

    async delete(id) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.')) {
            try {
                await api.deleteProduct(id);
                this.uiUtils.showToast('Xóa thành công!');
                this.loadData();
            } catch (error) {
                this.uiUtils.showToast(error.message, 'error');
            }
        }
    }
}
