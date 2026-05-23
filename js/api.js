const hostname = window.location.hostname || 'localhost';
const API_BASE_URL = `http://${hostname}:8081/api`;

const api = {
    // Helper to get headers
    getHeaders: () => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // Auth
    login: async (username, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            }
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Vehicles
    getVehicles: async (page = 0, size = 100, keyword = '') => {
        try {
            let url = `${API_BASE_URL}/vehicles?page=${page}&size=${size}`;
            if (keyword) {
                url += `&keyword=${encodeURIComponent(keyword)}`;
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: api.getHeaders()
            });
            if (!response.ok) {
                if(response.status === 401 || response.status === 403) {
                    throw new Error(`UNAUTHORIZED: ${response.status}`);
                }
                throw new Error('Lỗi khi tải danh sách xe.');
            }
            return await response.json();
        } catch (error) {
            console.error('getVehicles error:', error);
            throw error;
        }
    },

    getVehicleById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
                method: 'GET',
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Không tìm thấy thông tin xe.');
            return await response.json();
        } catch (error) {
            console.error('getVehicleById error:', error);
            throw error;
        }
    },

    createVehicle: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles`, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Lỗi khi thêm xe mới.');
            return await response.json();
        } catch (error) {
            console.error('createVehicle error:', error);
            throw error;
        }
    },

    updateVehicle: async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Lỗi khi cập nhật thông tin xe.');
            return await response.json();
        } catch (error) {
            console.error('updateVehicle error:', error);
            throw error;
        }
    },

    deleteVehicle: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
                method: 'DELETE',
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Lỗi khi xóa xe.');
            return true; // DELETE usually doesn't return body or just "OK"
        } catch (error) {
            console.error('deleteVehicle error:', error);
            throw error;
        }
    },

    // ==========================================
    // PARTNERS API (Khách hàng)
    // ==========================================
    getPartners: async (page = 0, size = 10, keyword = '', partnerType = '') => {
        try {
            let url = `${API_BASE_URL}/partners?page=${page}&size=${size}`;
            if (keyword) {
                url += `&keyword=${encodeURIComponent(keyword)}`;
            }
            if (partnerType) {
                url += `&type=${partnerType}`; 
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: api.getHeaders()
            });
            if (!response.ok) {
                const text = await response.text();
                console.error(`getPartners failed with status ${response.status}: ${text}`);
                if(response.status === 401 || response.status === 403) throw new Error(`UNAUTHORIZED: ${response.status}`);
                throw new Error('Lỗi khi tải danh sách khách hàng.');
            }
            return await response.json();
        } catch (error) {
            console.error('getPartners error:', error);
            throw error;
        }
    },

    getPartnerById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
                method: 'GET',
                headers: api.getHeaders()
            });
            if (!response.ok) {
                if(response.status === 401 || response.status === 403) throw new Error('UNAUTHORIZED');
                throw new Error('Lỗi khi lấy thông tin khách hàng.');
            }
            return await response.json();
        } catch (error) {
            console.error('getPartnerById error:', error);
            throw error;
        }
    },

    createPartner: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/partners`, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Lỗi khi thêm khách hàng mới.');
            return await response.json();
        } catch (error) {
            console.error('createPartner error:', error);
            throw error;
        }
    },

    updatePartner: async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Lỗi khi cập nhật thông tin khách hàng.');
            return await response.json();
        } catch (error) {
            console.error('updatePartner error:', error);
            throw error;
        }
    },

    deletePartner: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
                method: 'DELETE',
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Lỗi khi xóa khách hàng.');
            return true;
        } catch (error) {
            console.error('deletePartner error:', error);
            throw error;
        }
    },

    // --- Product Endpoints ---
    getProducts: async (page = 0, size = 10, keyword = '') => {
        try {
            let url = `${API_BASE_URL}/products?page=${page}&size=${size}`;
            if (keyword) {
                url += `&keyword=${encodeURIComponent(keyword)}`;
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: api.getHeaders()
            });
            if (!response.ok) {
                const text = await response.text();
                console.error(`getProducts failed with status ${response.status}: ${text}`);
                if(response.status === 401 || response.status === 403) throw new Error(`UNAUTHORIZED: ${response.status}`);
                throw new Error('Lỗi khi tải danh sách sản phẩm.');
            }
            return await response.json();
        } catch (error) {
            console.error('getProducts error:', error);
            throw error;
        }
    },

    getProductById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'GET',
                headers: api.getHeaders()
            });
            if (!response.ok) {
                const text = await response.text();
                console.error(`getVehicles failed with status ${response.status}: ${text}`);
                if(response.status === 401 || response.status === 403) throw new Error(`UNAUTHORIZED: ${response.status}`);
                throw new Error('Lỗi khi tải danh sách biển số xe.');
            }
            return await response.json();
        } catch (error) {
            console.error('getProductById error:', error);
            throw error;
        }
    },

    createProduct: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                if(response.status === 401 || response.status === 403) throw new Error('UNAUTHORIZED');
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Lỗi khi thêm sản phẩm.');
            }
            return await response.json();
        } catch (error) {
            console.error('createProduct error:', error);
            throw error;
        }
    },

    updateProduct: async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                if(response.status === 401 || response.status === 403) throw new Error('UNAUTHORIZED');
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Lỗi khi cập nhật sản phẩm.');
            }
            return await response.json();
        } catch (error) {
            console.error('updateProduct error:', error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: api.getHeaders()
            });
            if (!response.ok) {
                if(response.status === 401 || response.status === 403) throw new Error('UNAUTHORIZED');
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Lỗi khi xóa sản phẩm. Có thể sản phẩm này đang được sử dụng ở nơi khác.');
            }
            return true;
        } catch (error) {
            console.error('deleteProduct error:', error);
            throw error;
        }
    },

    // ==========================================
    // ORDERS API (Đơn hàng)
    // ==========================================
    createOrder: async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                if(response.status === 401 || response.status === 403) throw new Error('UNAUTHORIZED');
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Lỗi khi tạo đơn hàng mới.');
            }
            return await response.json(); // Hoặc response.text() nếu API không trả về JSON
        } catch (error) {
            console.error('createOrder error:', error);
            throw error;
        }
    }
};
