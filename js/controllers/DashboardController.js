import api from '../api.js';

export default class DashboardController {
    constructor(authService) {
        this.authService = authService;
        this.volumeChartInstance = null;

        // DOM Elements
        this.dashChartDaysSelect = document.getElementById('dash-chart-days');
        this.dashViewAllOrders = document.getElementById('dash-view-all-orders');
        
        this.setupListeners();
    }

    setupListeners() {
        if (this.dashChartDaysSelect) {
            this.dashChartDaysSelect.addEventListener('change', () => {
                this.loadStats(parseInt(this.dashChartDaysSelect.value));
            });
        }

        if (this.dashViewAllOrders) {
            this.dashViewAllOrders.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.app && window.app.showOrderListPanel) {
                    window.app.showOrderListPanel('NHAP_HANG');
                }
            });
        }
    }

    async loadStats(days = 3) {
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

                this.renderVolumeChart(data.chartData);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    renderVolumeChart(chartData) {
        const ctxEl = document.getElementById('volumeChart');
        if (!ctxEl) return;

        if (this.volumeChartInstance) {
            this.volumeChartInstance.destroy();
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

        const labels = chartData.map(d => {
            const dateObj = new Date(d.date);
            return dateObj.toLocaleDateString('vi-VN');
        });

        const productsSet = new Set();
        chartData.forEach(d => {
            d.imports.forEach(p => productsSet.add(p.productName));
            d.exports.forEach(p => productsSet.add(p.productName));
        });
        const products = Array.from(productsSet);

        const colors = [
            '#1a63f4', '#05cd99', '#ffce20', '#ee5d50', 
            '#8e44ad', '#e67e22', '#2c3e50', '#16a085', '#d35400'
        ];

        const datasets = [];

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

        this.volumeChartInstance = new Chart(ctxEl.getContext('2d'), {
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

    async loadLatestOrders() {
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
}
