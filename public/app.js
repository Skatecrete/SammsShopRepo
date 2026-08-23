// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwEGoZ83eDemeVFFI1YHby4eNOQ4EJFFgOXtsz00x-ubNlsgqzAupVDoFeZRYqyIrEG/exec',
    ADMIN_USER: 'wife',
    ADMIN_PASS: 'tattoo2026',
    GITHUB: {
        owner: 'your-username',
        repo: 'tattoo-shop'
    }
};

// ============================================
// STATE
// ============================================

let currentTab = 'flash';

// ============================================
// DOM REFS
// ============================================

const tabs = document.querySelectorAll('.tab-btn');
const contentSections = {
    flash: document.getElementById('flash'),
    portfolio: document.getElementById('portfolio'),
    scheduler: document.getElementById('scheduler'),
    contact: document.getElementById('contact')
};

const flashGrid = document.getElementById('flash-grid');
const portfolioGrid = document.getElementById('portfolio-grid');
const calendarContainer = document.getElementById('calendar-container');
const adminLink = document.getElementById('admin-link');
const adminModal = document.getElementById('admin-modal');
const closeModal = document.getElementById('close-modal');
const adminForm = document.getElementById('admin-login-form');
const fullscreenOverlay = document.getElementById('fullscreen-overlay');
const fullscreenImage = document.getElementById('fullscreen-image');
const fullscreenClose = document.getElementById('fullscreen-close');

// ============================================
// NAVIGATION
// ============================================

tabs.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
    });
});

function switchTab(tab) {
    tabs.forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    
    Object.keys(contentSections).forEach(key => {
        contentSections[key].classList.remove('active');
    });
    contentSections[tab].classList.add('active');
    
    currentTab = tab;
    
    if (tab === 'flash' && flashGrid.querySelector('.loading')) {
        loadFlash();
    }
    if (tab === 'portfolio' && portfolioGrid.querySelector('.loading')) {
        loadPortfolio();
    }
    if (tab === 'scheduler' && calendarContainer.querySelector('.loading')) {
        loadCalendar();
    }
}

// ============================================
// LOAD FLASH
// ============================================

async function loadFlash() {
    try {
        const response = await fetch('/flash.json');
        if (!response.ok) throw new Error('Failed to load flash data');
        const data = await response.json();
        renderGrid(flashGrid, data.flash || [], 'flash');
    } catch (error) {
        console.error('Error loading flash:', error);
        flashGrid.innerHTML = `<p class="loading">Error loading designs. Please refresh.</p>`;
    }
}

// ============================================
// LOAD PORTFOLIO
// ============================================

async function loadPortfolio() {
    try {
        const response = await fetch('/portfolio.json');
        if (!response.ok) throw new Error('Failed to load portfolio');
        const data = await response.json();
        renderGrid(portfolioGrid, data.portfolio || [], 'portfolio');
    } catch (error) {
        console.error('Error loading portfolio:', error);
        portfolioGrid.innerHTML = `<p class="loading">Error loading portfolio. Please refresh.</p>`;
    }
}

// ============================================
// RENDER IMAGE GRID
// ============================================

function renderGrid(container, images, category) {
    if (!images || images.length === 0) {
        container.innerHTML = `<p class="loading">No images yet.</p>`;
        return;
    }
    
    container.innerHTML = images.map(item => {
        const imagePath = item.image || item;
        const filename = imagePath.split('/').pop();
        const name = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        
        return `
            <div class="image-item" onclick="openFullscreen('${imagePath}')">
                <img src="${imagePath}" alt="${name}" loading="lazy">
                <div class="image-name">${name}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// LOAD CALENDAR
// ============================================

async function loadCalendar() {
    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL);
        if (!response.ok) throw new Error('Failed to load calendar');
        const data = await response.json();
        
        if (data.error) {
            calendarContainer.innerHTML = `<p class="loading">Error: ${data.error}</p>`;
            return;
        }
        
        renderCalendar(data.calendar || []);
    } catch (error) {
        console.error('Error loading calendar:', error);
        calendarContainer.innerHTML = `<p class="loading">Error loading calendar. Please refresh.</p>`;
    }
}

// ============================================
// RENDER CALENDAR
// ============================================

function renderCalendar(calendar) {
    if (!calendar || calendar.length === 0) {
        calendarContainer.innerHTML = `<p class="loading">No availability data.</p>`;
        return;
    }
    
    // Group by month
    const months = {};
    calendar.forEach(day => {
        const date = new Date(day.date + 'T00:00:00');
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (!months[monthKey]) {
            months[monthKey] = [];
        }
        months[monthKey].push(day);
    });
    
    let html = '';
    
    // Sort month keys
    const sortedMonths = Object.keys(months).sort();
    
    sortedMonths.forEach(monthKey => {
        const days = months[monthKey];
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' });
        
        html += `<h3 style="margin: 20px 0 10px 0; color: #a64d79;">${monthName} ${year}</h3>`;
        html += `<table class="calendar-table">`;
        html += `<thead><tr><th>Date</th><th>Day</th><th>12pm Slot</th><th>4pm Slot</th></tr></thead><tbody>`;
        
        days.forEach(day => {
            const date = new Date(day.date + 'T00:00:00');
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const slot12Class = day.slot12 === 'Unavailable' ? 'unavailable' : 'available';
            const slot4Class = day.slot4 === 'Unavailable' ? 'unavailable' : 'available';
            
            html += `<tr>
                <td class="date-cell">${dateStr}</td>
                <td>${dayName}</td>
                <td class="${slot12Class}">${day.slot12}</td>
                <td class="${slot4Class}">${day.slot4}</td>
            </tr>`;
        });
        
        html += `</tbody></table>`;
    });
    
    calendarContainer.innerHTML = html;
}

// ============================================
// FULLSCREEN IMAGE
// ============================================

function openFullscreen(imageSrc) {
    fullscreenImage.src = imageSrc;
    fullscreenOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

fullscreenClose.addEventListener('click', closeFullscreen);
fullscreenOverlay.addEventListener('click', (e) => {
    if (e.target === fullscreenOverlay) closeFullscreen();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFullscreen();
});

function closeFullscreen() {
    fullscreenOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// ADMIN LOGIN
// ============================================

adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    adminModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    adminModal.style.display = 'none';
});

adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.style.display = 'none';
    }
});

adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === CONFIG.ADMIN_USER && password === CONFIG.ADMIN_PASS) {
        adminModal.style.display = 'none';
        localStorage.setItem('admin', 'true');
        window.location.href = '/admin.html';
    } else {
        alert('Invalid username or password.');
    }
});

// ============================================
// INIT - Load default tab
// ============================================

switchTab('flash');

// ============================================
// Expose functions globally
// ============================================

window.openFullscreen = openFullscreen;