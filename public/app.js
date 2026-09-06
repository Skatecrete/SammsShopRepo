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
    // Get all button tabs (skip Home which is <a>)
    const tabs = document.querySelectorAll('.nav-tabs-tattoo button.tab-btn');
    const contentMap = {};
    const gridMap = {};

    tabs.forEach(btn => {
        const id = btn.dataset.tab;
        contentMap[id] = document.getElementById(id);
        gridMap[id] = document.getElementById(id + '-grid');
    });

    const calendarContainer = document.getElementById('tattoo-calendar-container');
    const overlay = document.getElementById('fullscreen-overlay');
    const overlayImg = document.getElementById('fullscreen-image');
    const closeBtn = document.getElementById('fullscreen-close');

    // Add click listeners
    tabs.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    function switchTab(tab) {
        // Update buttons
        tabs.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-tabs-tattoo button[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Hide all content
        Object.keys(contentMap).forEach(key => {
            if (contentMap[key]) {
                contentMap[key].style.display = 'none';
                contentMap[key].classList.remove('active');
            }
        });

        // Show selected
        if (contentMap[tab]) {
            contentMap[tab].style.display = 'block';
            contentMap[tab].classList.add('active');
        }

        // Load grid
        const grid = gridMap[tab];
        if (grid) {
            loadGrid(tab, grid);
        }

        // Load calendar
        if (tab === 'tattoo-scheduler') {
            loadCalendar();
        }
    }

    async function loadGrid(tab, container) {
        const category = tab.replace('tattoo-', '');
        try {
            const res = await fetch(`/tattoo/${category}.json`);
            if (!res.ok) throw new Error('No data');
            const data = await res.json();
            const images = data[category] || [];
            if (images.length === 0) {
                container.innerHTML = '<p class="loading">No images yet.</p>';
                return;
            }
            container.innerHTML = images.map(item => {
                const path = item.image || item;
                return `<div class="image-item" onclick="openFullscreen('${path}')">
                            <img src="${path}" alt="Image" loading="lazy">
                        </div>`;
            }).join('');
        } catch (e) {
            container.innerHTML = '<p class="loading">No images yet.</p>';
        }
    }

    async function loadCalendar() {
        calendarContainer.innerHTML = '<p class="loading">Loading calendar...</p>';
        try {
            const res = await fetch(CONFIG.APPS_SCRIPT_URL);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            if (data.error || !data.calendar || data.calendar.length === 0) {
                calendarContainer.innerHTML = '<p class="loading">No availability data.</p>';
                return;
            }
            renderCalendar(data.calendar);
        } catch (e) {
            calendarContainer.innerHTML = '<p class="loading">Error loading calendar.</p>';
        }
    }

    function renderCalendar(calendar) {
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
        calendarContainer.innerHTML = html;
    }

    function openFullscreen(src) {
        overlayImg.src = src;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.openFullscreen = openFullscreen;

    // Default tab
    switchTab('tattoo-flash');
}

// ============================================
// SHOP PAGE
// ============================================

if (isShopPage) {
    const tabs = document.querySelectorAll('.nav-tabs-shop button.tab-btn');
    const contentMap = {};
    const gridMap = {};

    tabs.forEach(btn => {
        const id = btn.dataset.tab;
        contentMap[id] = document.getElementById(id);
        gridMap[id] = document.getElementById(id + '-grid');
    });

    const overlay = document.getElementById('fullscreen-overlay');
    const overlayImg = document.getElementById('fullscreen-image');
    const closeBtn = document.getElementById('fullscreen-close');

    tabs.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    function switchTab(tab) {
        tabs.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-tabs-shop button[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        Object.keys(contentMap).forEach(key => {
            if (contentMap[key]) {
                contentMap[key].style.display = 'none';
                contentMap[key].classList.remove('active');
            }
        });

        if (contentMap[tab]) {
            contentMap[tab].style.display = 'block';
            contentMap[tab].classList.add('active');
        }

        const grid = gridMap[tab];
        if (grid) {
            loadGrid(tab, grid);
        }
    }

    async function loadGrid(tab, container) {
        const category = tab.replace('shop-', '');
        try {
            const res = await fetch(`/shop/${category}.json`);
            if (!res.ok) throw new Error('No data');
            const data = await res.json();
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
                            <img src="${path}" alt="${title}" class="shop-image" onclick="openFullscreen('${path}')">
                            <div class="shop-details">
                                <div class="shop-title">${title}</div>
                                <div class="shop-price">${price}</div>
                            </div>
                        </div>`;
            }).join('');
        } catch (e) {
            container.innerHTML = '<p class="loading">No items yet.</p>';
        }
    }

    function openFullscreen(src) {
        overlayImg.src = src;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
            overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.openFullscreen = openFullscreen;

    // Default tab - Paintings
    switchTab('shop-paintings');
}
