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
    console.log('Tattoo page loaded');
    
    // Get ALL buttons in the tattoo nav (including Home)
    const allTattooBtns = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
    const tattooContentSections = {};
    const tattooGrids = {};

    // Filter out the Home button (it's an <a> tag, not a <button>)
    const tattooTabs = [];
    allTattooBtns.forEach(btn => {
        if (btn.tagName === 'BUTTON') {
            const tabId = btn.dataset.tab;
            if (tabId) {
                tattooTabs.push(btn);
                tattooContentSections[tabId] = document.getElementById(tabId);
                tattooGrids[tabId] = document.getElementById(`${tabId}-grid`);
            }
        }
    });

    const tattooCalendarContainer = document.getElementById('tattoo-calendar-container');
    const tattooFullscreenOverlay = document.getElementById('fullscreen-overlay');
    const tattooFullscreenImage = document.getElementById('fullscreen-image');
    const tattooFullscreenClose = document.getElementById('fullscreen-close');

    // Add click listeners to tattoo tabs
    tattooTabs.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = this.dataset.tab;
            console.log('Tattoo tab clicked:', tab);
            switchTattooTab(tab);
        });
    });

    function switchTattooTab(tab) {
        console.log('Switching to tattoo tab:', tab);
        
        // Update active class on buttons
        tattooTabs.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-tabs-tattoo .tab-btn[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Hide all content sections
        Object.keys(tattooContentSections).forEach(key => {
            if (tattooContentSections[key]) {
                tattooContentSections[key].style.display = 'none';
                tattooContentSections[key].classList.remove('active');
            }
        });

        // Show the selected content
        if (tattooContentSections[tab]) {
            tattooContentSections[tab].style.display = 'block';
            tattooContentSections[tab].classList.add('active');
        }

        const grid = tattooGrids[tab];
        if (grid) {
            // Check if grid has a loading message or is empty
            const hasLoading = grid.querySelector('.loading');
            const isGridEmpty = grid.children.length === 0;
            if (hasLoading || isGridEmpty) {
                loadTattooGrid(tab, grid);
            }
        }

        if (tab === 'tattoo-scheduler') {
            loadTattooCalendar();
        }
    }

    async function loadTattooGrid(tab, container) {
        const category = tab.replace('tattoo-', '');
        try {
            const response = await fetch(`/tattoo/${category}.json`);
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            const images = data[category] || [];
            renderTattooGrid(container, images);
        } catch (error) {
            container.innerHTML = `<p class="loading">No images yet.</p>`;
        }
    }

    function renderTattooGrid(container, images) {
        if (!images || images.length === 0) {
            container.innerHTML = `<p class="loading">No images yet.</p>`;
            return;
        }
        container.innerHTML = images.map(item => {
            const imagePath = item.image || item;
            return `
                <div class="image-item" onclick="openTattooFullscreen('${imagePath}')">
                    <img src="${imagePath}" alt="Image" loading="lazy">
                </div>
            `;
        }).join('');
    }

    async function loadTattooCalendar() {
        tattooCalendarContainer.innerHTML = `<p class="loading">Loading calendar...</p>`;
        try {
            const response = await fetch(CONFIG.APPS_SCRIPT_URL);
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            if (data.error || !data.calendar || data.calendar.length === 0) {
                tattooCalendarContainer.innerHTML = `<p class="loading">No availability data.</p>`;
                return;
            }
            renderTattooCalendar(data.calendar);
        } catch (error) {
            tattooCalendarContainer.innerHTML = `<p class="loading">Error loading calendar.</p>`;
        }
    }

    function renderTattooCalendar(calendar) {
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

        tattooCalendarContainer.innerHTML = html;
    }

    function openTattooFullscreen(imageSrc) {
        tattooFullscreenImage.src = imageSrc;
        tattooFullscreenOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (tattooFullscreenClose) {
        tattooFullscreenClose.addEventListener('click', () => {
            tattooFullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    tattooFullscreenOverlay.addEventListener('click', (e) => {
        if (e.target === tattooFullscreenOverlay) {
            tattooFullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tattooFullscreenOverlay.style.display === 'flex') {
            tattooFullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.openTattooFullscreen = openTattooFullscreen;

    // Activate default tab
    setTimeout(() => {
        switchTattooTab('tattoo-flash');
    }, 100);
}

// ============================================
// SHOP PAGE
// ============================================

if (isShopPage) {
    console.log('Shop page loaded');
    
    // Get ALL buttons in the shop nav (including Home)
    const allShopBtns = document.querySelectorAll('.nav-tabs-shop .tab-btn');
    const shopContentSections = {};
    const shopGrids = {};

    // Filter out the Home button (it's an <a> tag, not a <button>)
    const shopTabs = [];
    allShopBtns.forEach(btn => {
        if (btn.tagName === 'BUTTON') {
            const tabId = btn.dataset.tab;
            if (tabId) {
                shopTabs.push(btn);
                shopContentSections[tabId] = document.getElementById(tabId);
                shopGrids[tabId] = document.getElementById(`${tabId}-grid`);
            }
        }
    });

    const shopFullscreenOverlay = document.getElementById('fullscreen-overlay');
    const shopFullscreenImage = document.getElementById('fullscreen-image');
    const shopFullscreenClose = document.getElementById('fullscreen-close');

    // Add click listeners to shop tabs
    shopTabs.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tab = this.dataset.tab;
            console.log('Shop tab clicked:', tab);
            switchShopTab(tab);
        });
    });

    function switchShopTab(tab) {
        console.log('Switching to shop tab:', tab);
        
        // Update active class on buttons
        shopTabs.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-tabs-shop .tab-btn[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Hide all content sections
        Object.keys(shopContentSections).forEach(key => {
            if (shopContentSections[key]) {
                shopContentSections[key].style.display = 'none';
                shopContentSections[key].classList.remove('active');
            }
        });

        // Show the selected content
        if (shopContentSections[tab]) {
            shopContentSections[tab].style.display = 'block';
            shopContentSections[tab].classList.add('active');
        }

        const grid = shopGrids[tab];
        if (grid) {
            const hasLoading = grid.querySelector('.loading');
            const isGridEmpty = grid.children.length === 0;
            if (hasLoading || isGridEmpty) {
                loadShopGrid(tab, grid);
            }
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
        shopFullscreenImage.src = imageSrc;
        shopFullscreenOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (shopFullscreenClose) {
        shopFullscreenClose.addEventListener('click', () => {
            shopFullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    shopFullscreenOverlay.addEventListener('click', (e) => {
        if (e.target === shopFullscreenOverlay) {
            shopFullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && shopFullscreenOverlay.style.display === 'flex') {
            shopFullscreenOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    window.openShopFullscreen = openShopFullscreen;

    // Activate default tab - Paintings
    setTimeout(() => {
        switchShopTab('shop-paintings');
    }, 100);
}

console.log('App.js loaded. Page:', window.location.pathname);
