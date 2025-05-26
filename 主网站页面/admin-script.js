// 校园跑腿后台管理系统脚本
const { createApp } = Vue;

createApp({
    data() {
        return {
            // 登录相关
            isLoggedIn: false,
            isLoading: false,
            username: '',
            password: '',
            loginError: '',
            adminName: '管理员',
            adminToken: '',
            
            // 界面相关
            currentView: 'dashboard',
            pageTitle: '数据概览',
            sidebarActive: false,
            
            // 数据相关
            stats: {
                totalOrders: 0,
                completedOrders: 0,
                totalUsers: 0,
                totalRunners: 0
            },
            recentOrders: [],
            orders: [],
            users: [],
            runners: [],
            
            // 筛选与分页
            orderFilter: {
                status: ''
            },
            currentPage: 1,
            pageSize: 10,
            
            // API配置
            apiBase: '/api' // 生产环境中应该指向实际的云函数API地址
        }
    },
    
    computed: {
        filteredOrders() {
            if (!this.orderFilter.status) {
                return this.orders;
            }
            return this.orders.filter(order => order.status === this.orderFilter.status);
        },
        
        totalPages() {
            return Math.ceil(this.filteredOrders.length / this.pageSize);
        },
        
        paginatedOrders() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.filteredOrders.slice(start, end);
        }
    },
    
    watch: {
        currentView(newView) {
            // 更新页面标题
            switch(newView) {
                case 'dashboard':
                    this.pageTitle = '数据概览';
                    break;
                case 'orders':
                    this.pageTitle = '订单管理';
                    break;
                case 'users':
                    this.pageTitle = '用户管理';
                    break;
                case 'runners':
                    this.pageTitle = '跑男管理';
                    break;
                case 'settings':
                    this.pageTitle = '系统设置';
                    break;
            }
        }
    },
    
    created() {
        // 检查是否已登录
        this.checkLogin();
    },
    
    methods: {
        // 登录相关方法
        async login() {
            if (!this.username || !this.password) {
                this.loginError = '请输入用户名和密码';
                return;
            }
            
            this.isLoading = true;
            this.loginError = '';
            
            try {
                // 调用登录验证云函数
                const isValid = await this.validateAdmin(this.username, this.password);
                
                if (isValid) {
                    // 保存登录状态
                    localStorage.setItem('adminUsername', this.username);
                    localStorage.setItem('adminToken', this.adminToken);
                    
                    this.adminName = this.username;
                    this.isLoggedIn = true;
                    
                    // 加载数据
                    this.loadDashboardData();
                } else {
                    this.loginError = '用户名或密码错误';
                }
            } catch (err) {
                console.error('登录失败:', err);
                this.loginError = '登录失败，请稍后重试';
            } finally {
                this.isLoading = false;
            }
        },
        
        async validateAdmin(username, password) {
            try {
                // 实际环境中应调用云函数进行验证
                // 这里先使用模拟数据
                
                // 模拟API调用
                const response = await this.mockApiCall('admin-auth', {
                    username,
                    password
                });
                
                if (response.success) {
                    this.adminToken = response.data.token;
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                console.error('验证失败:', error);
                return false;
            }
        },
        
        checkLogin() {
            const username = localStorage.getItem('adminUsername');
            const token = localStorage.getItem('adminToken');
            
            if (username && token) {
                this.username = username;
                this.adminName = username;
                this.adminToken = token;
                this.isLoggedIn = true;
                
                // 加载数据
                this.loadDashboardData();
            }
        },
        
        logout() {
            localStorage.removeItem('adminUsername');
            localStorage.removeItem('adminToken');
            this.isLoggedIn = false;
            this.adminToken = '';
        },
        
        // 数据加载方法
        async loadDashboardData() {
            try {
                await Promise.all([
                    this.loadStats(),
                    this.loadRecentOrders()
                ]);
            } catch (err) {
                console.error('加载数据失败:', err);
                // 处理错误情况
            }
        },
        
        async loadStats() {
            try {
                // 实际环境中应调用云函数获取数据
                // 这里先使用模拟数据
                const response = await this.mockApiCall('admin-get-data', {
                    token: this.adminToken,
                    type: 'stats'
                });
                
                if (response.success) {
                    this.stats = response.data;
                }
            } catch (error) {
                console.error('加载统计数据失败:', error);
            }
        },
        
        async loadRecentOrders() {
            try {
                // 实际环境中应调用云函数获取数据
                // 这里先使用模拟数据
                const response = await this.mockApiCall('admin-get-data', {
                    token: this.adminToken,
                    type: 'orders',
                    page: 1,
                    pageSize: 5
                });
                
                if (response.success) {
                    this.recentOrders = response.data.orders;
                    this.loadAllOrders();
                }
            } catch (error) {
                console.error('加载最近订单失败:', error);
            }
        },
        
        async loadAllOrders() {
            try {
                // 实际环境中应调用云函数获取数据
                // 这里先使用模拟数据
                const response = await this.mockApiCall('admin-get-data', {
                    token: this.adminToken,
                    type: 'orders',
                    page: 1,
                    pageSize: 50,
                    filter: this.orderFilter
                });
                
                if (response.success) {
                    this.orders = response.data.orders;
                }
            } catch (error) {
                console.error('加载订单数据失败:', error);
            }
        },
        
        async loadUsers() {
            if (this.users.length > 0) return;
            
            try {
                // 实际环境中应调用云函数获取数据
                // 这里先使用模拟数据
                const response = await this.mockApiCall('admin-get-data', {
                    token: this.adminToken,
                    type: 'users',
                    page: 1,
                    pageSize: 30
                });
                
                if (response.success) {
                    this.users = response.data.users;
                }
            } catch (error) {
                console.error('加载用户数据失败:', error);
            }
        },
        
        async loadRunners() {
            if (this.runners.length > 0) return;
            
            try {
                // 实际环境中应调用云函数获取数据
                // 这里先使用模拟数据
                const response = await this.mockApiCall('admin-get-data', {
                    token: this.adminToken,
                    type: 'runners',
                    page: 1,
                    pageSize: 15
                });
                
                if (response.success) {
                    this.runners = response.data.runners;
                }
            } catch (error) {
                console.error('加载跑男数据失败:', error);
            }
        },
        
        // UI相关方法
        setCurrentView(view) {
            this.currentView = view;
            
            // 根据视图加载对应数据
            switch(view) {
                case 'users':
                    this.loadUsers();
                    break;
                case 'runners':
                    this.loadRunners();
                    break;
                case 'orders':
                    this.loadAllOrders();
                    break;
            }
        },
        
        toggleSidebar() {
            this.sidebarActive = !this.sidebarActive;
        },
        
        // 分页方法
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        
        goToPage(page) {
            this.currentPage = page;
        },
        
        // 数据处理方法
        formatDate(date) {
            if (!date) return '';
            
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hour = String(d.getHours()).padStart(2, '0');
            const minute = String(d.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day} ${hour}:${minute}`;
        },
        
        getStatusText(status) {
            switch(status) {
                case 'pending': return '待接单';
                case 'accepted': return '已接单';
                case 'delivering': return '配送中';
                case 'completed': return '已完成';
                case 'cancelled': return '已取消';
                default: return '未知状态';
            }
        },
        
        getStatusClass(status) {
            switch(status) {
                case 'pending': return 'status-pending';
                case 'accepted': return 'status-accepted';
                case 'delivering': return 'status-delivering';
                case 'completed': return 'status-completed';
                case 'cancelled': return 'status-cancelled';
                default: return '';
            }
        },
        
        // 详情查看方法
        viewOrderDetails(order) {
            alert(`订单详情 - ${order.orderNo}\n当前状态: ${this.getStatusText(order.status)}`);
            // TODO: 实现详情展示
        },
        
        viewUserDetails(user) {
            alert(`用户详情 - ${user.username}`);
            // TODO: 实现详情展示
        },
        
        viewRunnerDetails(runner) {
            alert(`跑男详情 - ${runner.name}`);
            // TODO: 实现详情展示
        },
        
        // API调用模拟方法 (实际开发中应替换为真实API调用)
        async mockApiCall(functionName, data) {
            console.log(`调用云函数: ${functionName}`, data);
            
            return new Promise((resolve) => {
                setTimeout(() => {
                    // 根据不同的函数名返回不同的模拟数据
                    switch (functionName) {
                        case 'admin-auth':
                            if (data.username === 'admin' && data.password === 'admin123') {
                                resolve({
                                    success: true,
                                    message: '登录成功',
                                    code: 200,
                                    data: {
                                        token: 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2),
                                        username: data.username,
                                        name: '系统管理员',
                                        loginTime: new Date().toISOString()
                                    }
                                });
                            } else {
                                resolve({
                                    success: false,
                                    message: '账号或密码错误',
                                    code: 401
                                });
                            }
                            break;
                            
                        case 'admin-get-data':
                            const mockDataResponses = {
                                stats: {
                                    success: true,
                                    message: '获取统计数据成功',
                                    code: 200,
                                    data: {
                                        totalOrders: 256,
                                        completedOrders: 187,
                                        totalUsers: 158,
                                        totalRunners: 12,
                                        totalRevenue: 12680.5
                                    }
                                },
                                
                                orders: this.getMockOrders(data),
                                users: this.getMockUsers(data),
                                runners: this.getMockRunners(data)
                            };
                            
                            resolve(mockDataResponses[data.type] || {
                                success: false,
                                message: '无效的数据请求',
                                code: 400
                            });
                            break;
                            
                        default:
                            resolve({
                                success: false,
                                message: '未知的函数调用',
                                code: 404
                            });
                    }
                }, 300);
            });
        },
        
        // 模拟数据生成方法
        getMockOrders(params) {
            const { page = 1, pageSize = 10, filter = {} } = params;
            
            // 生成模拟订单数据
            const mockOrders = [];
            const statusOptions = ['pending', 'accepted', 'delivering', 'completed', 'cancelled'];
            
            for (let i = 1; i <= 50; i++) {
                const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
                const randomHour = Math.floor(Math.random() * 24);
                const randomMinute = Math.floor(Math.random() * 60);
                
                mockOrders.push({
                    id: i,
                    orderNo: `SJD202306${String(i).padStart(5, '0')}`,
                    createTime: new Date(2023, 9, 10, randomHour, randomMinute),
                    userName: `用户${Math.floor(Math.random() * 20) + 1}`,
                    runnerName: randomStatus !== 'pending' ? `跑男${Math.floor(Math.random() * 12) + 1}` : null,
                    totalAmount: Math.round(Math.random() * 90 + 10),
                    status: randomStatus,
                    pickupAddress: '大学食堂',
                    deliveryAddress: '6号宿舍楼',
                    remark: Math.random() > 0.5 ? '请尽快送达' : ''
                });
            }
            
            // 应用筛选条件
            let filteredOrders = [...mockOrders];
            if (filter.status) {
                filteredOrders = filteredOrders.filter(order => order.status === filter.status);
            }
            
            // 计算总数
            const total = filteredOrders.length;
            
            // 分页
            const skip = (page - 1) * pageSize;
            const orders = filteredOrders.slice(skip, skip + pageSize);
            
            return {
                success: true,
                message: '获取订单数据成功',
                code: 200,
                data: {
                    orders,
                    pagination: {
                        total,
                        page,
                        pageSize,
                        pages: Math.ceil(total / pageSize)
                    }
                }
            };
        },
        
        getMockUsers(params) {
            const { page = 1, pageSize = 10 } = params;
            
            // 生成模拟用户数据
            const mockUsers = [];
            
            for (let i = 1; i <= 30; i++) {
                mockUsers.push({
                    id: i,
                    username: `用户${i}`,
                    registerTime: new Date(2023, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1),
                    phone: `1${Math.floor(Math.random() * 9) + 1}${Math.random().toString().substr(2, 9)}`,
                    orderCount: Math.floor(Math.random() * 20),
                    avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`
                });
            }
            
            // 计算总数
            const total = mockUsers.length;
            
            // 分页
            const skip = (page - 1) * pageSize;
            const users = mockUsers.slice(skip, skip + pageSize);
            
            return {
                success: true,
                message: '获取用户数据成功',
                code: 200,
                data: {
                    users,
                    pagination: {
                        total,
                        page,
                        pageSize,
                        pages: Math.ceil(total / pageSize)
                    }
                }
            };
        },
        
        getMockRunners(params) {
            const { page = 1, pageSize = 10, filter = {} } = params;
            
            // 生成模拟跑男数据
            const mockRunners = [];
            
            for (let i = 1; i <= 15; i++) {
                const completedOrders = Math.floor(Math.random() * 100) + 20;
                mockRunners.push({
                    id: i,
                    name: `跑男${i}`,
                    joinTime: new Date(2023, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1),
                    phone: `1${Math.floor(Math.random() * 9) + 1}${Math.random().toString().substr(2, 9)}`,
                    completedOrders,
                    rating: (Math.random() * 1 + 4).toFixed(1),
                    avatar: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 50) + 1}.jpg`,
                    status: Math.random() > 0.2 ? 'active' : 'inactive'
                });
            }
            
            // 应用筛选条件
            let filteredRunners = [...mockRunners];
            if (filter.status) {
                filteredRunners = filteredRunners.filter(runner => runner.status === filter.status);
            }
            
            // 计算总数
            const total = filteredRunners.length;
            
            // 分页
            const skip = (page - 1) * pageSize;
            const runners = filteredRunners.slice(skip, skip + pageSize);
            
            return {
                success: true,
                message: '获取跑男数据成功',
                code: 200,
                data: {
                    runners,
                    pagination: {
                        total,
                        page,
                        pageSize,
                        pages: Math.ceil(total / pageSize)
                    }
                }
            };
        }
    }
}).mount('#app'); 