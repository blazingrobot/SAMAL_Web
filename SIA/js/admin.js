// admin.js - Complete Admin Dashboard Functionality with Settings
class AdminDashboard {
    constructor() {
        this.currentAdmin = null;
        this.engineers = JSON.parse(localStorage.getItem('engineers')) || [];
        this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        this.settings = JSON.parse(localStorage.getItem('adminSettings')) || this.getDefaultSettings();
        this.currentTab = 'dashboard';
        this.init();
    }

    getDefaultSettings() {
        return {
            username: 'admin',
            password: 'admin123',
            companyName: 'Samal Land Surveying',
            companyEmail: 'info@samalsurveying.com',
            companyPhone: '+63 912 345 6789',
            companyAddress: 'Samal, Davao del Norte, Philippines',
            workingHours: {
                monday: { start: '09:00', end: '17:00', available: true },
                tuesday: { start: '09:00', end: '17:00', available: true },
                wednesday: { start: '09:00', end: '17:00', available: true },
                thursday: { start: '09:00', end: '17:00', available: true },
                friday: { start: '09:00', end: '17:00', available: true },
                saturday: { start: '09:00', end: '12:00', available: false },
                sunday: { start: '00:00', end: '00:00', available: false }
            },
            blockedDates: [],
            preferences: {
                emailNotifications: true,
                autoConfirm: true,
                maintenanceMode: false,
                sessionTimeout: 480
            },
            lastBackup: null,
            databaseSize: '0 MB'
        };
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        this.loadCurrentDate();
        this.loadDashboardData();
        this.generateSampleData(); // Remove this in production
    }

    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const loginTime = localStorage.getItem('adminLoginTime');
        
        if (isLoggedIn && loginTime) {
            // Check if session is still valid (8 hours)
            const hoursDiff = (new Date() - new Date(loginTime)) / (1000 * 60 * 60);
            if (hoursDiff < 8) {
                this.showDashboard();
                return;
            }
        }
        
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboardScreen').style.display = 'none';
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
    }

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'flex';
        this.loadCurrentTab();
    }

    setupEventListeners() {
        // Login Form
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(item.dataset.tab);
            });
        });

        // Header Actions
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Engineers Tab
        document.getElementById('addEngineerBtn').addEventListener('click', () => {
            this.showAddEngineerModal();
        });

        document.getElementById('refreshEngineers').addEventListener('click', () => {
            this.loadEngineers();
        });

        // Bookings Tab
        document.getElementById('exportBookings').addEventListener('click', () => {
            this.exportBookings();
        });

        document.getElementById('refreshBookings').addEventListener('click', () => {
            this.loadBookings();
        });

        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterBookings();
        });

        document.getElementById('serviceFilter').addEventListener('change', () => {
            this.filterBookings();
        });

        document.getElementById('dateFilter').addEventListener('change', () => {
            this.filterBookings();
        });

        // Availability Tab
        document.getElementById('saveSchedule').addEventListener('click', () => {
            this.saveWorkingHours();
        });

        document.getElementById('blockDateBtn').addEventListener('click', () => {
            this.addBlockedDate();
        });

        // Settings Tab
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.changePassword();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('backupDataBtn').addEventListener('click', () => {
            this.createBackup();
        });

        // Modals
        this.setupModalEvents();
    }

    setupModalEvents() {
        // Close modals when clicking X
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('show');
            });
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Engineer Form
        document.getElementById('engineerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEngineer();
        });

        document.getElementById('cancelEngineer').addEventListener('click', () => {
            document.getElementById('addEngineerModal').classList.remove('show');
        });

        // Confirm Modal
        document.getElementById('cancelConfirm').addEventListener('click', () => {
            document.getElementById('confirmModal').classList.remove('show');
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === this.settings.username && password === this.settings.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminLoginTime', new Date().toISOString());
            this.showDashboard();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Invalid username or password!', 'error');
        }
    }

    handleLogout() {
        this.showConfirmModal(
            'Are you sure you want to logout?',
            () => {
                this.showLogin();
                this.showNotification('Logged out successfully', 'success');
            }
        );
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Update page title
        this.updatePageTitle(tabName);
        
        // Load tab-specific data
        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    updatePageTitle(tabName) {
        const titles = {
            dashboard: 'Dashboard Overview',
            engineers: 'Engineers Management',
            bookings: 'Bookings Management',
            availability: 'Company Availability',
            statistics: 'Statistics & Reports',
            settings: 'Admin Settings'
        };
        
        document.getElementById('pageTitle').textContent = titles[tabName] || tabName;
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'engineers':
                this.loadEngineers();
                break;
            case 'bookings':
                this.loadBookings();
                break;
            case 'availability':
                this.loadAvailability();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadCurrentTab() {
        this.loadTabData(this.currentTab);
    }

    // Dashboard Functions
    loadDashboardData() {
        this.updateStatsCards();
        this.loadRecentAppointments();
        this.loadTodaySchedule();
    }

    updateStatsCards() {
        const total = this.appointments.length;
        const pending = this.appointments.filter(a => a.status === 'pending').length;
        const confirmed = this.appointments.filter(a => a.status === 'confirmed').length;
        const activeEngineers = this.engineers.filter(e => e.status === 'active').length;

        document.getElementById('totalAppointments').textContent = total;
        document.getElementById('pendingAppointments').textContent = pending;
        document.getElementById('confirmedAppointments').textContent = confirmed;
        document.getElementById('totalEngineers').textContent = activeEngineers;
    }

    loadRecentAppointments() {
        const container = document.getElementById('recentAppointments');
        const recent = this.appointments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<div class="no-data">No recent appointments</div>';
            return;
        }

        container.innerHTML = recent.map(appointment => `
            <div class="activity-item">
                <div class="activity-content">
                    <strong>${appointment.first_name} ${appointment.last_name}</strong>
                    <span> - ${appointment.service}</span>
                    <small>${this.formatDate(appointment.date)} at ${appointment.time}</small>
                </div>
                <span class="status-badge status-${appointment.status}">${appointment.status}</span>
            </div>
        `).join('');
    }

    loadTodaySchedule() {
        const container = document.getElementById('todaySchedule');
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointments.filter(a => a.date === today && a.status === 'confirmed');

        if (todayAppointments.length === 0) {
            container.innerHTML = '<div class="no-data">No appointments scheduled for today</div>';
            return;
        }

        container.innerHTML = todayAppointments.map(appointment => `
            <div class="schedule-item">
                <div class="schedule-time">${appointment.time}</div>
                <div class="schedule-details">
                    <strong>${appointment.service}</strong>
                    <span>${appointment.first_name} ${appointment.last_name}</span>
                </div>
                <div class="schedule-engineer">${appointment.engineer || 'Unassigned'}</div>
            </div>
        `).join('');
    }

    // Engineers Management
    loadEngineers() {
        const container = document.getElementById('engineersGrid');
        
        if (this.engineers.length === 0) {
            container.innerHTML = '<div class="no-data">No engineers added yet</div>';
            return;
        }

        container.innerHTML = this.engineers.map(engineer => `
            <div class="engineer-card">
                <div class="engineer-header">
                    <div class="engineer-avatar">
                        <i class="fas fa-user-cog"></i>
                    </div>
                    <div class="engineer-info">
                        <h4>${engineer.name}</h4>
                        <p>${engineer.specialization}</p>
                    </div>
                </div>
                <div class="engineer-details">
                    <div class="detail-item">
                        <span class="detail-label">Employee ID:</span>
                        <span class="detail-value">${engineer.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${engineer.email}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${engineer.phone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status-badge status-${engineer.status}">${engineer.status}</span>
                    </div>
                </div>
                <div class="engineer-actions">
                    <button class="btn btn-edit" onclick="admin.editEngineer('${engineer.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="admin.deleteEngineer('${engineer.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    showAddEngineerModal() {
        document.getElementById('engineerForm').reset();
        document.getElementById('addEngineerModal').classList.add('show');
    }

    saveEngineer() {
        const formData = {
            id: 'ENG' + Date.now().toString().slice(-6),
            name: document.getElementById('engineerName').value,
            email: document.getElementById('engineerEmail').value,
            phone: document.getElementById('engineerPhone').value,
            specialization: document.getElementById('engineerSpecialization').value,
            address: document.getElementById('engineerAddress').value,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        this.engineers.push(formData);
        localStorage.setItem('engineers', JSON.stringify(this.engineers));
        
        document.getElementById('addEngineerModal').classList.remove('show');
        this.loadEngineers();
        this.showNotification('Engineer added successfully!', 'success');
    }

    editEngineer(engineerId) {
        const engineer = this.engineers.find(e => e.id === engineerId);
        if (engineer) {
            // Populate form with engineer data
            document.getElementById('engineerName').value = engineer.name;
            document.getElementById('engineerEmail').value = engineer.email;
            document.getElementById('engineerPhone').value = engineer.phone;
            document.getElementById('engineerSpecialization').value = engineer.specialization;
            document.getElementById('engineerAddress').value = engineer.address;
            
            // Change form to edit mode
            const form = document.getElementById('engineerForm');
            form.dataset.editId = engineerId;
            document.querySelector('#engineerForm .btn-primary').textContent = 'Update Engineer';
            
            document.getElementById('addEngineerModal').classList.add('show');
        }
    }

    deleteEngineer(engineerId) {
        this.showConfirmModal(
            'Are you sure you want to delete this engineer?',
            () => {
                this.engineers = this.engineers.filter(e => e.id !== engineerId);
                localStorage.setItem('engineers', JSON.stringify(this.engineers));
                this.loadEngineers();
                this.showNotification('Engineer deleted successfully', 'success');
            }
        );
    }

    // Bookings Management
    loadBookings() {
        const container = document.getElementById('bookingsTable');
        this.populateEngineerFilter();

        if (this.appointments.length === 0) {
            container.innerHTML = '<tr><td colspan="8" class="no-data">No bookings found</td></tr>';
            return;
        }

        container.innerHTML = this.appointments.map((appointment, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${appointment.first_name} ${appointment.last_name}</td>
                <td>${appointment.service}</td>
                <td>${this.formatDate(appointment.date)} at ${appointment.time}</td>
                <td>${appointment.engineer || 'Unassigned'}</td>
                <td>
                    <div>${appointment.email}</div>
                    <small>${appointment.phone}</small>
                </td>
                <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                <td>
                    <button class="action-btn btn-view" onclick="admin.viewBookingDetails(${index})">View</button>
                    ${appointment.status === 'pending' ? `
                        <button class="action-btn btn-confirm" onclick="admin.updateBookingStatus(${index}, 'confirmed')">Confirm</button>
                        <button class="action-btn btn-cancel" onclick="admin.updateBookingStatus(${index}, 'cancelled')">Cancel</button>
                    ` : ''}
                    ${appointment.status === 'confirmed' ? `
                        <button class="action-btn btn-cancel" onclick="admin.updateBookingStatus(${index}, 'cancelled')">Cancel</button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    populateEngineerFilter() {
        const filter = document.getElementById('engineerFilter');
        const engineers = this.engineers.filter(e => e.status === 'active');
        
        filter.innerHTML = '<option value="all">All Engineers</option>' +
            engineers.map(engineer => 
                `<option value="${engineer.name}">${engineer.name}</option>`
            ).join('');
    }

    filterBookings() {
        const statusFilter = document.getElementById('statusFilter').value;
        const serviceFilter = document.getElementById('serviceFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const engineerFilter = document.getElementById('engineerFilter').value;

        let filtered = this.appointments;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(a => a.status === statusFilter);
        }

        if (serviceFilter !== 'all') {
            filtered = filtered.filter(a => a.service === serviceFilter);
        }

        if (dateFilter) {
            filtered = filtered.filter(a => a.date === dateFilter);
        }

        if (engineerFilter !== 'all') {
            filtered = filtered.filter(a => a.engineer === engineerFilter);
        }

        this.displayFilteredBookings(filtered);
    }

    displayFilteredBookings(bookings) {
        const container = document.getElementById('bookingsTable');
        
        if (bookings.length === 0) {
            container.innerHTML = '<tr><td colspan="8" class="no-data">No bookings match the filters</td></tr>';
            return;
        }

        container.innerHTML = bookings.map((appointment, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${appointment.first_name} ${appointment.last_name}</td>
                <td>${appointment.service}</td>
                <td>${this.formatDate(appointment.date)} at ${appointment.time}</td>
                <td>${appointment.engineer || 'Unassigned'}</td>
                <td>
                    <div>${appointment.email}</div>
                    <small>${appointment.phone}</small>
                </td>
                <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                <td>
                    <button class="action-btn btn-view" onclick="admin.viewBookingDetails(${this.appointments.indexOf(appointment)})">View</button>
                    ${appointment.status === 'pending' ? `
                        <button class="action-btn btn-confirm" onclick="admin.updateBookingStatus(${this.appointments.indexOf(appointment)}, 'confirmed')">Confirm</button>
                        <button class="action-btn btn-cancel" onclick="admin.updateBookingStatus(${this.appointments.indexOf(appointment)}, 'cancelled')">Cancel</button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    viewBookingDetails(index) {
        const appointment = this.appointments[index];
        const modalContent = document.getElementById('bookingDetailsContent');
        
        modalContent.innerHTML = `
            <div class="booking-details">
                <div class="detail-section">
                    <h4>Client Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${appointment.first_name} ${appointment.last_name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${appointment.email}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">${appointment.phone}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Appointment Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Service:</span>
                            <span class="detail-value">${appointment.service}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${this.formatDate(appointment.date)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${appointment.time}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value status-badge status-${appointment.status}">${appointment.status}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Assigned Engineer</h4>
                    <select id="assignEngineer" class="engineer-select">
                        <option value="">Select Engineer</option>
                        ${this.engineers.filter(e => e.status === 'active').map(engineer => 
                            `<option value="${engineer.name}" ${appointment.engineer === engineer.name ? 'selected' : ''}>${engineer.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="detail-actions">
                    ${appointment.status === 'pending' ? `
                        <button class="btn btn-success" onclick="admin.updateBookingStatus(${index}, 'confirmed')">Confirm Booking</button>
                        <button class="btn btn-danger" onclick="admin.updateBookingStatus(${index}, 'cancelled')">Cancel Booking</button>
                    ` : ''}
                    ${appointment.status === 'confirmed' ? `
                        <button class="btn btn-danger" onclick="admin.updateBookingStatus(${index}, 'cancelled')">Cancel Booking</button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="admin.assignEngineer(${index})">Assign Engineer</button>
                </div>
            </div>
        `;
        
        document.getElementById('bookingDetailsModal').classList.add('show');
    }

    updateBookingStatus(index, status) {
        this.appointments[index].status = status;
        if (status === 'confirmed') {
            this.appointments[index].confirmedAt = new Date().toISOString();
        }
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
        
        this.loadBookings();
        this.loadDashboardData();
        this.showNotification(`Booking ${status} successfully!`, 'success');
        
        // Close modal if open
        document.getElementById('bookingDetailsModal').classList.remove('show');
    }

    assignEngineer(index) {
        const engineerSelect = document.getElementById('assignEngineer');
        const selectedEngineer = engineerSelect.value;
        
        if (selectedEngineer) {
            this.appointments[index].engineer = selectedEngineer;
            localStorage.setItem('appointments', JSON.stringify(this.appointments));
            this.showNotification('Engineer assigned successfully!', 'success');
            document.getElementById('bookingDetailsModal').classList.remove('show');
        } else {
            this.showNotification('Please select an engineer', 'error');
        }
    }

    // Availability Management
    loadAvailability() {
        this.loadWeeklySchedule();
        this.loadBlockedDates();
    }

    loadWeeklySchedule() {
        const container = document.getElementById('weeklySchedule');
        const days = [
            { name: 'Monday', key: 'monday' },
            { name: 'Tuesday', key: 'tuesday' },
            { name: 'Wednesday', key: 'wednesday' },
            { name: 'Thursday', key: 'thursday' },
            { name: 'Friday', key: 'friday' },
            { name: 'Saturday', key: 'saturday' },
            { name: 'Sunday', key: 'sunday' }
        ];

        container.innerHTML = days.map(day => {
            const schedule = this.settings.workingHours[day.key];
            return `
                <div class="schedule-day">
                    <span class="day-name">${day.name}</span>
                    <div class="time-inputs">
                        <input type="time" id="${day.key}Start" value="${schedule.start}">
                        <span>to</span>
                        <input type="time" id="${day.key}End" value="${schedule.end}">
                    </div>
                    <div class="availability-toggle">
                        <input type="checkbox" id="${day.key}Available" ${schedule.available ? 'checked' : ''}>
                        <label for="${day.key}Available">Available</label>
                    </div>
                </div>
            `;
        }).join('');
    }

    saveWorkingHours() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            this.settings.workingHours[day] = {
                start: document.getElementById(`${day}Start`).value,
                end: document.getElementById(`${day}End`).value,
                available: document.getElementById(`${day}Available`).checked
            };
        });

        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.showNotification('Working hours saved successfully!', 'success');
    }

    loadBlockedDates() {
        const container = document.getElementById('blockedDatesList');
        const blockedDates = this.settings.blockedDates;

        if (blockedDates.length === 0) {
            container.innerHTML = '<div class="no-data">No blocked dates</div>';
            return;
        }

        container.innerHTML = blockedDates.map((blocked, index) => `
            <div class="blocked-date-item">
                <div>
                    <strong>${this.formatDate(blocked.date)}</strong>
                    <div>${blocked.reason}</div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="admin.removeBlockedDate(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    addBlockedDate() {
        const dateInput = document.getElementById('newBlockedDate');
        const reasonInput = document.getElementById('blockReason');
        
        const date = dateInput.value;
        const reason = reasonInput.value;

        if (!date || !reason) {
            this.showNotification('Please fill in both date and reason', 'error');
            return;
        }

        this.settings.blockedDates.push({ date, reason });
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        
        dateInput.value = '';
        reasonInput.value = '';
        this.loadBlockedDates();
        this.showNotification('Date blocked successfully!', 'success');
    }

    removeBlockedDate(index) {
        this.settings.blockedDates.splice(index, 1);
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.loadBlockedDates();
        this.showNotification('Blocked date removed', 'success');
    }

    // Statistics
    loadStatistics() {
        this.renderServiceChart();
        this.renderMonthlyChart();
        this.renderStatusChart();
    }

    renderServiceChart() {
        const ctx = document.getElementById('serviceChart').getContext('2d');
        const serviceCounts = this.countServices();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(serviceCounts),
                datasets: [{
                    label: 'Number of Bookings',
                    data: Object.values(serviceCounts),
                    backgroundColor: [
                        '#284602', '#fec700', '#1a3301', '#667eea', 
                        '#764ba2', '#f093fb', '#4facfe'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        const monthlyData = this.getMonthlyData();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Bookings per Month',
                    data: monthlyData.data,
                    borderColor: '#284602',
                    backgroundColor: 'rgba(40, 70, 2, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            }
        });
    }

    renderStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const statusCounts = this.countStatuses();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#fff3cd', '#d1edff', '#f8d7da', '#d4edda'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            }
        });
    }

    countServices() {
        const counts = {};
        this.appointments.forEach(appointment => {
            counts[appointment.service] = (counts[appointment.service] || 0) + 1;
        });
        return counts;
    }

    countStatuses() {
        const counts = {};
        this.appointments.forEach(appointment => {
            counts[appointment.status] = (counts[appointment.status] || 0) + 1;
        });
        return counts;
    }

    getMonthlyData() {
        // Simplified monthly data - in real app, you'd aggregate by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const data = months.map(() => Math.floor(Math.random() * 20) + 5);
        
        return {
            labels: months,
            data: data
        };
    }

    // Settings Management
    loadSettings() {
        // Load company information
        document.getElementById('companyName').value = this.settings.companyName || '';
        document.getElementById('companyEmail').value = this.settings.companyEmail || '';
        document.getElementById('companyPhone').value = this.settings.companyPhone || '';
        document.getElementById('companyAddress').value = this.settings.companyAddress || '';

        // Load preferences
        document.getElementById('emailNotifications').checked = this.settings.preferences.emailNotifications;
        document.getElementById('autoConfirm').checked = this.settings.preferences.autoConfirm;
        document.getElementById('maintenanceMode').checked = this.settings.preferences.maintenanceMode;
        document.getElementById('sessionTimeout').value = this.settings.preferences.sessionTimeout;

        // Load backup information
        document.getElementById('lastBackupDate').textContent = this.settings.lastBackup ? 
            this.formatDate(this.settings.lastBackup) : 'Never';
        document.getElementById('databaseSize').textContent = this.settings.databaseSize;

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    saveSettings() {
        // Save company information
        this.settings.companyName = document.getElementById('companyName').value;
        this.settings.companyEmail = document.getElementById('companyEmail').value;
        this.settings.companyPhone = document.getElementById('companyPhone').value;
        this.settings.companyAddress = document.getElementById('companyAddress').value;

        // Save preferences
        this.settings.preferences.emailNotifications = document.getElementById('emailNotifications').checked;
        this.settings.preferences.autoConfirm = document.getElementById('autoConfirm').checked;
        this.settings.preferences.maintenanceMode = document.getElementById('maintenanceMode').checked;
        this.settings.preferences.sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);

        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Please fill in all password fields', 'error');
            return;
        }

        if (currentPassword !== this.settings.password) {
            this.showNotification('Current password is incorrect', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('New password must be at least 8 characters long', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        this.settings.password = newPassword;
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        this.showNotification('Password changed successfully!', 'success');
    }

    exportAllData() {
        const allData = {
            settings: this.settings,
            engineers: this.engineers,
            appointments: this.appointments,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(allData, null, 2);
        this.downloadJSON(dataStr, 'samal_surveying_backup.json');
        this.showNotification('All data exported successfully!', 'success');
    }

    createBackup() {
        this.settings.lastBackup = new Date().toISOString();
        
        // Calculate approximate database size
        const dataSize = JSON.stringify({
            settings: this.settings,
            engineers: this.engineers,
            appointments: this.appointments
        }).length;
        this.settings.databaseSize = Math.round(dataSize / 1024) + ' KB';

        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.loadSettings();
        this.showNotification('Backup created successfully!', 'success');
    }

    downloadJSON(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Utility Functions
    formatDate(dateString) {
        if (!dateString) return 'Never';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    loadCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString(undefined, options);
        document.getElementById('todayDate').textContent = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    }

    refreshData() {
        this.loadCurrentTab();
        this.showNotification('Data refreshed', 'success');
    }

    exportBookings() {
        // Simple CSV export
        const headers = ['Name', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Status', 'Engineer'];
        const csvData = this.appointments.map(appointment => [
            `${appointment.first_name} ${appointment.last_name}`,
            appointment.email,
            appointment.phone,
            appointment.service,
            appointment.date,
            appointment.time,
            appointment.status,
            appointment.engineer || 'Unassigned'
        ]);
        
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        this.downloadCSV(csvContent, 'bookings_export.csv');
        this.showNotification('Bookings exported successfully!', 'success');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showConfirmModal(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        const modal = document.getElementById('confirmModal');
        
        const confirmHandler = () => {
            onConfirm();
            modal.classList.remove('show');
            document.getElementById('proceedConfirm').removeEventListener('click', confirmHandler);
        };
        
        document.getElementById('proceedConfirm').addEventListener('click', confirmHandler);
        modal.classList.add('show');
    }

    showNotification(message, type = 'info') {
        // Simple notification - you can enhance this with a proper notification system
        alert(`${type.toUpperCase()}: ${message}`);
    }

    // Sample Data Generator (Remove in production)
    generateSampleData() {
        if (this.engineers.length === 0) {
            this.engineers = [
                {
                    id: 'ENG001',
                    name: 'Juan Dela Cruz',
                    email: 'juan.delacruz@samalsurveying.com',
                    phone: '+63 912 345 6789',
                    specialization: 'Topographic Survey',
                    address: 'Samal, Davao del Norte',
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'ENG002',
                    name: 'Maria Santos',
                    email: 'maria.santos@samalsurveying.com',
                    phone: '+63 917 654 3210',
                    specialization: 'Utility Survey',
                    address: 'Babak, Samal',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('engineers', JSON.stringify(this.engineers));
        }

        if (this.appointments.length === 0) {
            const sampleAppointments = [
                {
                    first_name: 'John',
                    last_name: 'Smith',
                    email: 'john.smith@email.com',
                    phone: '+63 918 123 4567',
                    service: 'Topographic Survey',
                    date: new Date().toISOString().split('T')[0],
                    time: '09:30 - 10:30',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                },
                {
                    first_name: 'Sarah',
                    last_name: 'Johnson',
                    email: 'sarah.j@email.com',
                    phone: '+63 919 876 5432',
                    service: 'Utility Survey',
                    date: new Date().toISOString().split('T')[0],
                    time: '14:00 - 15:00',
                    status: 'confirmed',
                    engineer: 'Juan Dela Cruz',
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];
            
            this.appointments = sampleAppointments;
            localStorage.setItem('appointments', JSON.stringify(this.appointments));
        }
    }

    // In AdminDashboard class - add these methods

    // Save availability to localStorage in a format accessible to the frontend
    saveAvailability() {
        const availabilityData = {
            workingHours: this.settings.workingHours,
            blockedDates: this.settings.blockedDates,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('companyAvailability', JSON.stringify(availabilityData));
        this.showNotification('Availability saved successfully!', 'success');
    }

    // Update the saveWorkingHours method to also call saveAvailability
    saveWorkingHours() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        days.forEach(day => {
            this.settings.workingHours[day] = {
                start: document.getElementById(`${day}Start`).value,
                end: document.getElementById(`${day}End`).value,
                available: document.getElementById(`${day}Available`).checked
            };
        });

        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.saveAvailability(); // Save to frontend-accessible storage
        this.showNotification('Working hours saved successfully!', 'success');
    }

    // Update addBlockedDate and removeBlockedDate to also call saveAvailability
    addBlockedDate() {
        const dateInput = document.getElementById('newBlockedDate');
        const reasonInput = document.getElementById('blockReason');
        
        const date = dateInput.value;
        const reason = reasonInput.value;

        if (!date || !reason) {
            this.showNotification('Please fill in both date and reason', 'error');
            return;
        }

        this.settings.blockedDates.push({ date, reason });
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.saveAvailability(); // Save to frontend-accessible storage
        
        dateInput.value = '';
        reasonInput.value = '';
        this.loadBlockedDates();
        this.showNotification('Date blocked successfully!', 'success');
    }

    removeBlockedDate(index) {
        this.settings.blockedDates.splice(index, 1);
        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.saveAvailability(); // Save to frontend-accessible storage
        this.loadBlockedDates();
        this.showNotification('Blocked date removed', 'success');
    }
}

// Initialize Admin Dashboard when page loads
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminDashboard();
});