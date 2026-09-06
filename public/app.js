const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwEGoZ83eDemeVFFI1YHby4eNOQ4EJFFgOXtsz00x-ubNlsgqzAupVDoFeZRYqyIrEG/exec',
    ADMIN_USER: 'Samm',
    ADMIN_PASS: '0510',
    GITHUB: {
        owner: 'Skatecrete',
        repo: 'SammsShopRepo'
    }
};

// ============================================
// DETECT PAGE
// ============================================

const isTattooPage = window.location.pathname.includes('tattoo.html');
const isShopPage = window.location.pathname.includes('shop.html');
const isLandingPage = !isTattooPage && !isShopPage;

// ============================================
// LANDING PAGE
// ============================================

if (isLandingPage) {
    loadLandingSlideshows();
}

async function loadLandingSlideshows() {
    try {
        const response = await fetch('/tattoo/portfolio.json');
        if (response.ok) {
            const data = await response.json();
            const images = data.portfolio || [];
            if (images.length > 0) {
                const track = document.getElementById('landing-slideshow-track');
                const allImages = [...images, ...images, ...images];
                track.innerHTML = allImages.map(item => {
                    const imagePath = item.image || item;
                    return `<div class="slide-item"><img src="${imagePath}" alt="Portfolio" loading="lazy"></div>`;
                }).join('');
                track.style.animation = 'scrollSlideshow 30s linear infinite';
            }
        }
    } catch (e) { console.log('No portfolio images'); }

    try {
        const response = await fetch('/shop/jewelry.json');
        if (response.ok) {
            const data = await response.json();
            const images = data.jewelry || [];
            if (images.length > 0) {
                const track = document.getElementById('landing-shop-slideshow-track');
                const allImages = [...images, ...images, ...images];
                track.innerHTML = allImages.map(item => {
                    const imagePath = item.image || item;
                    return `<div class="slide-item"><img src="${imagePath}" alt="Shop" loading="lazy"></div>`;
                }).join('');
                track.style.animation = 'scrollSlideshow 30s linear infinite';
            }
        }
    } catch (e) { console.log('No shop images'); }
}

// ============================================
// TATTOO PAGE
// ============================================

if (isTattooPage) {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Tattoo page ready');
        initTattoo();
    });
    // Also run immediately if DOM already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initTattoo();
    }
}

function initTattoo() {
    // Get all tabs
    const tabs = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
    console.log('Found tattoo tabs:', tabs.length);
    
    // Add click listeners
    tabs.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = this.dataset.tab;
            console.log('Tattoo tab clicked:', tab);
            if (tab) {
                switchTattooTab(tab);
            }
        });
    });
    
    // Set default tab
    switchTattooTab('tattoo-flash');
}

function switchTattooTab(tab) {
    console.log('Switching to:', tab);
    
    // Update active class
    const allTabs = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
    allTabs.forEach(b => b.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.nav-tabs-tattoo .tab-btn[data-tab="${tab}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Hide all content
    const contentSections = document.querySelectorAll('#tattoo-content .tab-content');
    contentSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show selected
    const targetSection = document.getElementById(tab);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        loadTattooGrid(tab);
    }
    
    // Load calendar
    if (tab === 'tattoo-scheduler') {
        loadTattooCalendar();
    }
}

function loadTattooGrid(tab) {
    const category = tab.replace('tattoo-', '');
    const container = document.getElementById(tab + '-grid');
    if (!container) return;
    
    if (!container.querySelector('.loading') && container.children.length > 0) {
        return;
    }
    
    fetch(`/tattoo/${category}.json`)
        .then(res => res.json())
        .then(data => {
            const images = data[category] || [];
            if (images.length === 0) {
                container.innerHTML = '<p class="loading">No images yet.</p>';
                return;
            }
            container.innerHTML = images.map(item => {
                const path = item.image || item;
                return `<div class="image-item" onclick="openTattooFullscreen('${path}')">
                            <img src="${path}" alt="Image" loading="lazy">
                        </div>`;
            }).join('');
        })
        .catch(() => {
            container.innerHTML = '<p class="loading">No images yet.</p>';
        });
}

function loadTattooCalendar() {
    const container = document.getElementById('tattoo-calendar-container');
    if (!container) return;
    
    container.innerHTML = '<p class="loading">Loading calendar...</p>';
    
    fetch(CONFIG.APPS_SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            if (data.error || !data.calendar || data.calendar.length === 0) {
                container.innerHTML = '<p class="loading">No availability data.</p>';
                return;
            }
            renderTattooCalendar(data.calendar);
        })
        .catch(() => {
            container.innerHTML = '<p class="loading">Error loading calendar.</p>';
        });
}

function renderTattooCalendar(calendar) {
    const container = document.getElementById('tattoo-calendar-container');
    if (!container) return;
    
    const months = {};
    calendar.forEach(day => {
        const date = new Date(day.date + 'T00:00:00');
        const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (!months[key]) months[key] = [];
        months[key].push(day);
    });

    let html = '';
    Object.keys(months).sort().forEach(key => {
        const [year, month] = key.split('-');
        const name = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' });
        html += `<h3 style="margin:20px 0 10px; color:#a64d79;">${name} ${year}</h3>`;
        html += `<table class="calendar-table"><thead><tr><th>Date</th><th>Day</th><th>12pm</th><th>4pm</th></tr></thead><tbody>`;
        months[key].forEach(day => {
            const date = new Date(day.date + 'T00:00:00');
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const c12 = day.slot12 === 'Unavailable' ? 'unavailable' : 'available';
            const c4 = day.slot4 === 'Unavailable' ? 'unavailable' : 'available';
            html += `<tr>
                <td class="date-cell">${dateStr}</td>
                <td>${dayName}</td>
                <td class="${c12}">${day.slot12}</td>
                <td class="${c4}">${day.slot4}</td>
            </tr>`;
        });
        html += `</tbody></table>`;
    });
    container.innerHTML = html;
}

function openTattooFullscreen(src) {
    const overlay = document.getElementById('fullscreen-overlay');
    const img = document.getElementById('fullscreen-image');
    if (!overlay || !img) return;
    img.src = src;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ============================================
// SHOP PAGE
// ============================================

if (isShopPage) {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Shop page ready');
        initShop();
    });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initShop();
    }
}

function initShop() {
    const tabs = document.querySelectorAll('.nav-tabs-shop .tab-btn');
    console.log('Found shop tabs:', tabs.length);
    
    tabs.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = this.dataset.tab;
            console.log('Shop tab clicked:', tab);
            if (tab) {
                switchShopTab(tab);
            }
        });
    });
    
    switchShopTab('shop-paintings');
}

function switchShopTab(tab) {
    console.log('Switching to shop tab:', tab);
    
    const allTabs = document.querySelectorAll('.nav-tabs-shop .tab-btn');
    allTabs.forEach(b => b.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.nav-tabs-shop .tab-btn[data-tab="${tab}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    const contentSections = document.querySelectorAll('#shop-content .tab-content');
    contentSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(tab);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        loadShopGrid(tab);
    }
}

function loadShopGrid(tab) {
    const category = tab.replace('shop-', '');
    const container = document.getElementById(tab + '-grid');
    if (!container) return;
    
    if (!container.querySelector('.loading') && container.children.length > 0) {
        return;
    }
    
    fetch(`/shop/${category}.json`)
        .then(res => res.json())
        .then(data => {
            const items = data[category] || [];
            if (items.length === 0) {
                container.innerHTML = '<p class="loading">No items yet.</p>';
                return;
            }
            container.innerHTML = items.map(item => {
                const path = item.image || item;
                const title = item.title || '';
                const price = item.price || '';
                return `<div class="shop-item">
                            <img src="${path}" alt="${title}" class="shop-image" onclick="openShopFullscreen('${path}')">
                            <div class="shop-details">
                                <div class="shop-title">${title}</div>
                                <div class="shop-price">${price}</div>
                            </div>
                        </div>`;
            }).join('');
        })
        .catch(() => {
            container.innerHTML = '<p class="loading">No items yet.</p>';
        });
}

function openShopFullscreen(src) {
    const overlay = document.getElementById('fullscreen-overlay');
    const img = document.getElementById('fullscreen-image');
    if (!overlay || !img) return;
    img.src = src;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ============================================
// SHARED FULLSCREEN CLOSE
// ============================================

(function setupFullscreen() {
    const overlay = document.getElementById('fullscreen-overlay');
    const closeBtn = document.getElementById('fullscreen-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (overlay) {
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
})();

console.log('App.js loaded. Page:', window.location.pathname);
