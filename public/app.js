const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwEGoZ83eDemeVFFI1YHby4eNOQ4EJFFgOXtsz00x-ubNlsgqzAupVDoFeZRYqyIrEG/exec',
    ADMIN_USER: 'Samm',
    ADMIN_PASS: '0510',
    GITHUB: {
        owner: 'Skatecrete',
        repo: 'SammsShopRepo'
    }
};

let currentTab = 'landing';
let slideshowInterval = null;

const tabs = document.querySelectorAll('.tab-btn');
const landing = document.getElementById('landing');
const contentSections = {
    landing: landing,
    flash: document.getElementById('flash'),
    catalog: document.getElementById('catalog'),
    portfolio: document.getElementById('portfolio'),
    scheduler: document.getElementById('scheduler'),
    contact: document.getElementById('contact')
};

const flashGrid = document.getElementById('flash-grid');
const catalogGrid = document.getElementById('catalog-grid');
const portfolioGrid = document.getElementById('portfolio-grid');
const calendarContainer = document.getElementById('calendar-container');
const fullscreenOverlay = document.getElementById('fullscreen-overlay');
const fullscreenImage = document.getElementById('fullscreen-image');
const fullscreenClose = document.getElementById('fullscreen-close');
const fullscreenPrev = document.getElementById('fullscreen-prev');
const fullscreenNext = document.getElementById('fullscreen-next');
const headerTitle = document.getElementById('header-title');
const slideshowTrack = document.getElementById('slideshow-track');

// Fullscreen gallery state
let fullscreenImages = [];
let currentFullscreenIndex = 0;

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
        contentSections[key].style.display = 'none';
        contentSections[key].classList.remove('active');
    });
    
    contentSections[tab].style.display = 'block';
    contentSections[tab].classList.add('active');
    
    if (tab === 'landing') {
        headerTitle.style.display = 'none';
        startSlideshow();
    } else {
        headerTitle.style.display = 'block';
        headerTitle.textContent = 'SkinPrints & Piercings by Samm (@GutterMuttx)';
        stopSlideshow();
    }
    
    currentTab = tab;
    
    if (tab === 'flash' && flashGrid.querySelector('.loading')) loadFlash();
    if (tab === 'catalog' && catalogGrid.querySelector('.loading')) loadCatalog();
    if (tab === 'portfolio' && portfolioGrid.querySelector('.loading')) loadPortfolio();
    if (tab === 'scheduler' && calendarContainer.querySelector('.loading')) loadCalendar();
}

// ============================================
// SLIDESHOW
// ============================================

async function loadSlideshow() {
    try {
        const response = await fetch('/portfolio.json');
        if (!response.ok) throw new Error('Failed to load portfolio for slideshow');
        const data = await response.json();
        const images = data.portfolio || [];
        
        if (images.length === 0) {
            slideshowTrack.innerHTML = '<p style="color:#999; text-align:center;">No portfolio images yet.</p>';
            return;
        }
        
        const allImages = [...images, ...images, ...images];
        
        slideshowTrack.innerHTML = allImages.map(item => {
            const imagePath = item.image || item;
            return `<div class="slide-item"><img src="${imagePath}" alt="Portfolio" loading="lazy"></div>`;
        }).join('');
        
        setTimeout(() => {
            const slideWidth = slideshowTrack.querySelector('.slide-item')?.offsetWidth || 200;
            const totalSlides = images.length;
            const duration = totalSlides * 3;
            
            slideshowTrack.style.animation = `scrollSlideshow ${duration}s linear infinite`;
        }, 100);
        
    } catch (error) {
        console.error('Error loading slideshow:', error);
        slideshowTrack.innerHTML = '<p style="color:#999; text-align:center;">Loading portfolio images...</p>';
    }
}

function startSlideshow() {
    loadSlideshow();
}

function stopSlideshow() {}

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
// LOAD CATALOG
// ============================================

async function loadCatalog() {
    try {
        const response = await fetch('/catalog.json');
        if (!response.ok) throw new Error('Failed to load catalog');
        const data = await response.json();
        renderGrid(catalogGrid, data.catalog || [], 'catalog');
    } catch (error) {
        console.error('Error loading catalog:', error);
        catalogGrid.innerHTML = `<p class="loading">Error loading catalog. Please refresh.</p>`;
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
    calendarContainer.innerHTML = `<p class="loading">Loading calendar...</p>`;
    
    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.error) {
            calendarContainer.innerHTML = `<p class="loading">Error: ${data.error}</p>`;
            return;
        }
        
        if (!data.calendar || data.calendar.length === 0) {
            calendarContainer.innerHTML = `<p class="loading">No availability data found.</p>`;
            return;
        }
        
        renderCalendar(data.calendar);
    } catch (error) {
        console.error('Error loading calendar:', error);
        calendarContainer.innerHTML = `
            <p class="loading">Error loading calendar.</p>
            <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
                Details: ${error.message}
            </p>
        `;
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
    
    const months = {};
    calendar.forEach(day => {
        const date = new Date(day.date + 'T00:00:00');
        const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (!months[monthKey]) months[monthKey] = [];
        months[monthKey].push(day);
    });
    
    let html = '';
    const sortedMonths = Object.keys(months).sort();
    
    sortedMonths.forEach(monthKey => {
        const days = months[monthKey];
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' });
        
        html += `<h3 style="margin: 20px 0 10px 0; color: #a64d79;">${monthName} ${year}</h3>`;
        html += `<table class="calendar-table"><thead><tr><th>Date</th><th>Day</th><th>12pm Slot</th><th>4pm Slot</th></tr></thead><tbody>`;
        
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
// FULLSCREEN WITH ARROWS
// ============================================

function openFullscreen(imageSrc) {
    // Get all images from the current grid
    const activeGrid = document.querySelector('.tab-content.active .image-grid');
    if (activeGrid) {
        const items = activeGrid.querySelectorAll('.image-item');
        fullscreenImages = [];
        items.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                fullscreenImages.push(img.src);
            }
        });
        const clickedIndex = fullscreenImages.indexOf(imageSrc);
        currentFullscreenIndex = clickedIndex !== -1 ? clickedIndex : 0;
    } else {
        fullscreenImages = [imageSrc];
        currentFullscreenIndex = 0;
    }

    showFullscreenImage();
    fullscreenOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showFullscreenImage() {
    if (!fullscreenImages.length || currentFullscreenIndex >= fullscreenImages.length) {
        return;
    }
    fullscreenImage.src = fullscreenImages[currentFullscreenIndex];
    // Update counter
    const counter = document.getElementById('fullscreen-counter');
    if (counter) {
        counter.textContent = `${currentFullscreenIndex + 1} / ${fullscreenImages.length}`;
    }
    // Show/hide arrows based on number of images
    if (fullscreenPrev && fullscreenNext) {
        if (fullscreenImages.length <= 1) {
            fullscreenPrev.style.display = 'none';
            fullscreenNext.style.display = 'none';
        } else {
            fullscreenPrev.style.display = 'flex';
            fullscreenNext.style.display = 'flex';
        }
    }
}

function navigateFullscreen(direction) {
    if (!fullscreenImages.length) return;
    currentFullscreenIndex = (currentFullscreenIndex + direction + fullscreenImages.length) % fullscreenImages.length;
    showFullscreenImage();
}

function closeFullscreen() {
    fullscreenOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// --- Fullscreen Event Listeners ---

if (fullscreenPrev) {
    fullscreenPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateFullscreen(-1);
    });
}

if (fullscreenNext) {
    fullscreenNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateFullscreen(1);
    });
}

// Keyboard arrow keys
document.addEventListener('keydown', (e) => {
    if (fullscreenOverlay.style.display !== 'flex') return;
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateFullscreen(-1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateFullscreen(1);
    } else if (e.key === 'Escape') {
        closeFullscreen();
    }
});

// Click background to close
fullscreenOverlay.addEventListener('click', (e) => {
    if (e.target === fullscreenOverlay) {
        closeFullscreen();
    }
});

// Close button
if (fullscreenClose) {
    fullscreenClose.addEventListener('click', closeFullscreen);
}

// ============================================
// ADMIN LINK
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        adminLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/admin.html';
        });
    }
});

// ============================================
// INIT
// ============================================

switchTab('landing');

window.openFullscreen = openFullscreen;