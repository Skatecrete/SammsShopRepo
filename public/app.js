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
// DETECT WHICH PAGE WE'RE ON
// ============================================

const isTattooPage = window.location.pathname.includes('tattoo.html');
const isShopPage = window.location.pathname.includes('shop.html');
const isLandingPage = !isTattooPage && !isShopPage;

// ============================================
// LANDING PAGE SLIDESHOW
// ============================================

if (isLandingPage) {
    loadLandingSlideshows();
}

async function loadLandingSlideshows() {
    // Load portfolio images for tattoo slideshow
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
    } catch (e) { console.log('No portfolio images for slideshow'); }

    // Load shop images for shop slideshow
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
    } catch (e) { console.log('No shop images for slideshow'); }
}

// ============================================
// TATTOO PAGE
// ============================================

if (isTattooPage) {
    const tabs = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
    const contentSections = {};
    const grids = {};

    tabs.forEach(btn => {
        const tabId = btn.dataset.tab;
        contentSections[tabId] = document.getElementById(tabId);
        grids[tabId] = document.getElementById(`${tabId}-grid`);
    });

    const calendarContainer = document.getElementById('tattoo-calendar-container');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const fullscreenClose = document.getElementById('fullscreen-close');

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    function switchTab(tab) {
        tabs.forEach(b => b.classList.remove('active'));
        document.querySelector(`.nav-tabs-tattoo .tab-btn[data-tab="${tab}"]`).classList.add('active');

        Object.keys(contentSections).forEach(key => {
            contentSections[key].style.display = 'none';
            contentSections[key].classList.remove('active');
        });

        contentSections[tab].style.display = 'block';
        contentSections[tab].classList.add('active');

        const grid = grids[tab];
        if (grid && grid.querySelector('.loading')) {
            loadTattooGrid(tab, grid);
        }

        if (tab === 'tattoo-scheduler') {
            loadCalendar();
        }
    }

    async function loadTattooGrid(tab, container) {
        const category = tab.replace('tattoo-', '');
        try {
            const response = await fetch(`/tattoo/${category}.json`);
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            const images = data[category] || [];
            renderGrid(container, images);
        } catch (error) {
            container.innerHTML = `<p class="loading">No images yet.</p>`;
        }
    }

    function renderGrid(container, images) {
        if (!images || images.length === 0) {
            container.innerHTML = `<p class="loading">No images yet.</p>`;
            return;
        }
        container.innerHTML = images.map(item => {
            const imagePath = item.image || item;
            return `
                <div class="image-item" onclick="openFullscreen('${imagePath}')">
                    <img src="${imagePath}" alt="Image" loading="lazy">
                </div>
            `;
        }).join('');
    }

    async function loadCalendar() {
        calendarContainer.innerHTML = `<p class="loading">Loading calendar...</p>`;
        try {
            const response = await fetch(CONFIG.APPS_SCRIPT_URL);
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            if (data.error || !data.calendar || data.calendar.length === 0) {
                calendarContainer.innerHTML = `<p class="loading">No availability data.</p>`;
                return;
            }
            renderCalendar(data.calendar);
        } catch (error) {
            calendarContainer.innerHTML = `<p class="loading">Error loading calendar.</p>`;
        }
    }

    function renderCalendar(calendar) {
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

    function openFullscreen(imageSrc) {
        fullscreenImage.src = imageSrc;
        fullscreenOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (fullscreenClose) {
        fullscreenClose.addEventListener('click', () => {
            fullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    fullscreenOverlay.addEventListener('click', (e) => {
        if (e.target === fullscreenOverlay) {
            fullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenOverlay.style.display === 'flex') {
            fullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.openFullscreen = openFullscreen;

    // Activate default tab
    switchTab('tattoo-flash');
}

// ============================================
// SHOP PAGE
// ============================================

if (isShopPage) {
    const tabs = document.querySelectorAll('.nav-tabs-shop .tab-btn');
    const contentSections = {};
    const grids = {};

    tabs.forEach(btn => {
        const tabId = btn.dataset.tab;
        contentSections[tabId] = document.getElementById(tabId);
        grids[tabId] = document.getElementById(`${tabId}-grid`);
    });

    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const fullscreenClose = document.getElementById('fullscreen-close');

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchShopTab(tab);
        });
    });

    function switchShopTab(tab) {
        tabs.forEach(b => b.classList.remove('active'));
        document.querySelector(`.nav-tabs-shop .tab-btn[data-tab="${tab}"]`).classList.add('active');

        Object.keys(contentSections).forEach(key => {
            contentSections[key].style.display = 'none';
            contentSections[key].classList.remove('active');
        });

        contentSections[tab].style.display = 'block';
        contentSections[tab].classList.add('active');

        const grid = grids[tab];
        if (grid && grid.querySelector('.loading')) {
            loadShopGrid(tab, grid);
        }
    }

    async function loadShopGrid(tab, container) {
        const category = tab.replace('shop-', '');
        try {
            const response = await fetch(`/shop/${category}.json`);
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            const items = data[category] || [];
            renderShopGrid(container, items);
        } catch (error) {
            container.innerHTML = `<p class="loading">No items yet.</p>`;
        }
    }

    function renderShopGrid(container, items) {
        if (!items || items.length === 0) {
            container.innerHTML = `<p class="loading">No items yet.</p>`;
            return;
        }
        container.innerHTML = items.map(item => {
            const imagePath = item.image || item;
            const title = item.title || '';
            const price = item.price || '';
            return `
                <div class="shop-item">
                    <img src="${imagePath}" alt="${title}" class="shop-image" onclick="openShopFullscreen('${imagePath}')">
                    <div class="shop-details">
                        <div class="shop-title">${title}</div>
                        <div class="shop-price">${price}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function openShopFullscreen(imageSrc) {
        fullscreenImage.src = imageSrc;
        fullscreenOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (fullscreenClose) {
        fullscreenClose.addEventListener('click', () => {
            fullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    fullscreenOverlay.addEventListener('click', (e) => {
        if (e.target === fullscreenOverlay) {
            fullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenOverlay.style.display === 'flex') {
            fullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.openShopFullscreen = openShopFullscreen;

    // Activate default tab - Jewelry
    switchShopTab('shop-jewelry');
}
