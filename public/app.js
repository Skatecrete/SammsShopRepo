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

const path = window.location.pathname;
const isTattooPage = path.includes('tattoo') || path.includes('tattoo.html');
const isShopPage = path.includes('shop') || path.includes('shop.html');
const isLandingPage = path === '/' || path === '/index.html' || path === '';

console.log('🔍 Page detected:', path);
console.log('  - isTattooPage:', isTattooPage);
console.log('  - isShopPage:', isShopPage);
console.log('  - isLandingPage:', isLandingPage);

// ============================================
// LANDING PAGE
// ============================================

if (isLandingPage) {
    console.log('📄 Landing page - loading slideshows');
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
                if (track) {
                    const allImages = [...images, ...images, ...images];
                    track.innerHTML = allImages.map(item => {
                        const imagePath = item.image || item;
                        return `<div class="slide-item"><img src="${imagePath}" alt="Portfolio" loading="lazy"></div>`;
                    }).join('');
                    track.style.animation = 'scrollSlideshow 30s linear infinite';
                    console.log('✅ Tattoo slideshow loaded with', images.length, 'images');
                }
            }
        }
    } catch (e) { 
        console.warn('⚠️ No portfolio images for slideshow:', e.message);
    }

    try {
        const response = await fetch('/shop/jewelry.json');
        if (response.ok) {
            const data = await response.json();
            const images = data.jewelry || [];
            if (images.length > 0) {
                const track = document.getElementById('landing-shop-slideshow-track');
                if (track) {
                    const allImages = [...images, ...images, ...images];
                    track.innerHTML = allImages.map(item => {
                        const imagePath = item.image || item;
                        return `<div class="slide-item"><img src="${imagePath}" alt="Shop" loading="lazy"></div>`;
                    }).join('');
                    track.style.animation = 'scrollSlideshow 30s linear infinite';
                    console.log('✅ Shop slideshow loaded with', images.length, 'images');
                }
            }
        }
    } catch (e) { 
        console.warn('⚠️ No shop images for slideshow:', e.message);
    }
}

// ============================================
// TATTOO PAGE
// ============================================

if (isTattooPage) {
    console.log('📄 Tattoo page - initializing...');
    
    function initTattoo() {
        try {
            console.log('🔄 initTattoo() called');
            
            // Get ALL tabs including Home
            const tabs = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
            console.log('  - Found', tabs.length, 'tattoo tabs');
            
            if (tabs.length === 0) {
                console.error('❌ No tattoo tabs found! Check HTML structure.');
                return;
            }
            
            tabs.forEach((btn, i) => {
                console.log(`  - Tab ${i}:`, btn.dataset.tab, btn.className);
            });
            
            // Add click listeners to ALL tabs
            tabs.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const tab = this.dataset.tab;
                    console.log('🖱️ Tattoo tab clicked:', tab);
                    
                    // If it's the Home button (no data-tab), let it navigate
                    if (!tab) {
                        console.log('  - Home button clicked, navigating to /');
                        window.location.href = '/';
                        return;
                    }
                    
                    e.preventDefault();
                    e.stopPropagation();
                    switchTattooTab(tab);
                });
            });
            
            const contentSections = document.querySelectorAll('#tattoo-content .tab-content');
            console.log('  - Found', contentSections.length, 'content sections');
            
            // Set default tab
            console.log('🔄 Setting default tab: tattoo-flash');
            switchTattooTab('tattoo-flash');
            
        } catch (error) {
            console.error('❌ initTattoo() error:', error);
        }
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('⏱️ DOM already ready, initializing immediately');
        initTattoo();
    } else {
        console.log('⏱️ Waiting for DOM to load...');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('⏱️ DOMContentLoaded fired');
            initTattoo();
        });
    }
}

function switchTattooTab(tab) {
    try {
        console.log('🔄 switchTattooTab() called with:', tab);
        
        // Get ALL tabs including Home
        const allTabs = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
        
        // Remove active from all tabs
        allTabs.forEach(b => b.classList.remove('active'));
        
        // Activate the clicked tab
        const activeBtn = document.querySelector(`.nav-tabs-tattoo .tab-btn[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('  - Active button set:', tab);
        } else {
            console.warn('  - No button found for tab:', tab);
        }
        
        // Hide all content
        const contentSections = document.querySelectorAll('#tattoo-content .tab-content');
        console.log('  - Hiding', contentSections.length, 'content sections');
        contentSections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
        // Show selected
        const targetSection = document.getElementById(tab);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
            console.log('  - Showing content for:', tab);
            loadTattooGrid(tab);
        } else {
            console.error('❌ No content section found for tab:', tab);
        }
        
        if (tab === 'tattoo-scheduler') {
            console.log('  - Loading calendar...');
            loadTattooCalendar();
        }
        
    } catch (error) {
        console.error('❌ switchTattooTab() error:', error);
    }
}

function loadTattooGrid(tab) {
    try {
        const category = tab.replace('tattoo-', '');
        const container = document.getElementById(tab + '-grid');
        if (!container) {
            console.warn('  - No grid container found for:', tab);
            return;
        }
        
        console.log('  - Loading grid for:', category);
        
        if (container.children.length > 0 && !container.querySelector('.loading')) {
            console.log('  - Grid already has content, skipping load');
            return;
        }
        
        fetch(`/tattoo/${category}.json`)
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(data => {
                const images = data[category] || [];
                console.log(`  - Found ${images.length} images for ${category}`);
                if (images.length === 0) {
                    container.innerHTML = '<p class="loading">No images yet.</p>';
                    return;
                }
                container.innerHTML = images.map(item => {
                    const path = item.image || item;
                    return `<div class="image-item" onclick="window.openTattooFullscreen('${path}')">
                                <img src="${path}" alt="Image" loading="lazy">
                            </div>`;
                }).join('');
            })
            .catch(err => {
                console.warn(`  - Error loading ${category}:`, err.message);
                container.innerHTML = '<p class="loading">No images yet.</p>';
            });
    } catch (error) {
        console.error('❌ loadTattooGrid() error:', error);
    }
}

function loadTattooCalendar() {
    try {
        const container = document.getElementById('tattoo-calendar-container');
        if (!container) {
            console.warn('  - No calendar container found');
            return;
        }
        
        console.log('  - Fetching calendar data...');
        container.innerHTML = '<p class="loading">Loading calendar...</p>';
        
        fetch(CONFIG.APPS_SCRIPT_URL)
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(data => {
                if (data.error || !data.calendar || data.calendar.length === 0) {
                    console.warn('  - No calendar data');
                    container.innerHTML = '<p class="loading">No availability data.</p>';
                    return;
                }
                console.log(`  - Calendar loaded with ${data.calendar.length} days`);
                renderTattooCalendar(data.calendar);
            })
            .catch(err => {
                console.warn('  - Error loading calendar:', err.message);
                container.innerHTML = '<p class="loading">Error loading calendar.</p>';
            });
    } catch (error) {
        console.error('❌ loadTattooCalendar() error:', error);
    }
}

function renderTattooCalendar(calendar) {
    try {
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
        console.log('  - Calendar rendered');
    } catch (error) {
        console.error('❌ renderTattooCalendar() error:', error);
    }
}

window.openTattooFullscreen = function(src) {
    try {
        const overlay = document.getElementById('fullscreen-overlay');
        const img = document.getElementById('fullscreen-image');
        if (!overlay || !img) {
            console.error('❌ Fullscreen elements not found');
            return;
        }
        img.src = src;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('🖼️ Fullscreen opened:', src);
    } catch (error) {
        console.error('❌ openTattooFullscreen() error:', error);
    }
};

// ============================================
// SHOP PAGE
// ============================================

if (isShopPage) {
    console.log('📄 Shop page - initializing...');
    
    function initShop() {
        try {
            console.log('🔄 initShop() called');
            
            const tabs = document.querySelectorAll('.nav-tabs-shop .tab-btn');
            console.log('  - Found', tabs.length, 'shop tabs');
            
            if (tabs.length === 0) {
                console.error('❌ No shop tabs found! Check HTML structure.');
                return;
            }
            
            tabs.forEach((btn, i) => {
                console.log(`  - Tab ${i}:`, btn.dataset.tab, btn.className);
            });
            
            tabs.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const tab = this.dataset.tab;
                    console.log('🖱️ Shop tab clicked:', tab);
                    
                    if (!tab) {
                        console.log('  - Home button clicked, navigating to /');
                        window.location.href = '/';
                        return;
                    }
                    
                    e.preventDefault();
                    e.stopPropagation();
                    switchShopTab(tab);
                });
            });
            
            const contentSections = document.querySelectorAll('#shop-content .tab-content');
            console.log('  - Found', contentSections.length, 'content sections');
            
            console.log('🔄 Setting default tab: shop-paintings');
            switchShopTab('shop-paintings');
            
        } catch (error) {
            console.error('❌ initShop() error:', error);
        }
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('⏱️ DOM already ready, initializing immediately');
        initShop();
    } else {
        console.log('⏱️ Waiting for DOM to load...');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('⏱️ DOMContentLoaded fired');
            initShop();
        });
    }
}

function switchShopTab(tab) {
    try {
        console.log('🔄 switchShopTab() called with:', tab);
        
        const allTabs = document.querySelectorAll('.nav-tabs-shop .tab-btn');
        allTabs.forEach(b => b.classList.remove('active'));
        
        const activeBtn = document.querySelector(`.nav-tabs-shop .tab-btn[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('  - Active button set:', tab);
        } else {
            console.warn('  - No button found for tab:', tab);
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
            console.log('  - Showing content for:', tab);
            loadShopGrid(tab);
        } else {
            console.error('❌ No content section found for tab:', tab);
        }
        
    } catch (error) {
        console.error('❌ switchShopTab() error:', error);
    }
}

function loadShopGrid(tab) {
    try {
        const category = tab.replace('shop-', '');
        const container = document.getElementById(tab + '-grid');
        if (!container) {
            console.warn('  - No grid container found for:', tab);
            return;
        }
        
        console.log('  - Loading grid for:', category);
        
        if (container.children.length > 0 && !container.querySelector('.loading')) {
            console.log('  - Grid already has content, skipping load');
            return;
        }
        
        fetch(`/shop/${category}.json`)
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(data => {
                const items = data[category] || [];
                console.log(`  - Found ${items.length} items for ${category}`);
                if (items.length === 0) {
                    container.innerHTML = '<p class="loading">No items yet.</p>';
                    return;
                }
                container.innerHTML = items.map(item => {
                    const path = item.image || item;
                    const title = item.title || '';
                    const price = item.price || '';
                    return `<div class="shop-item">
                                <img src="${path}" alt="${title}" class="shop-image" onclick="window.openShopFullscreen('${path}')">
                                <div class="shop-details">
                                    <div class="shop-title">${title}</div>
                                    <div class="shop-price">${price}</div>
                                </div>
                            </div>`;
                }).join('');
            })
            .catch(err => {
                console.warn(`  - Error loading ${category}:`, err.message);
                container.innerHTML = '<p class="loading">No items yet.</p>';
            });
    } catch (error) {
        console.error('❌ loadShopGrid() error:', error);
    }
}

window.openShopFullscreen = function(src) {
    try {
        const overlay = document.getElementById('fullscreen-overlay');
        const img = document.getElementById('fullscreen-image');
        if (!overlay || !img) {
            console.error('❌ Fullscreen elements not found');
            return;
        }
        img.src = src;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('🖼️ Shop fullscreen opened:', src);
    } catch (error) {
        console.error('❌ openShopFullscreen() error:', error);
    }
};

// ============================================
// SHARED FULLSCREEN CLOSE
// ============================================

(function setupFullscreen() {
    try {
        const overlay = document.getElementById('fullscreen-overlay');
        const closeBtn = document.getElementById('fullscreen-close');
        console.log('🔧 Setting up fullscreen close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                if (overlay) {
                    overlay.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    console.log('🖼️ Fullscreen closed (button)');
                }
            });
        } else {
            console.warn('⚠️ fullscreen-close button not found');
        }
        
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    console.log('🖼️ Fullscreen closed (click)');
                }
            });
        } else {
            console.warn('⚠️ fullscreen-overlay not found');
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
                console.log('🖼️ Fullscreen closed (escape)');
            }
        });
        
        console.log('✅ Fullscreen setup complete');
    } catch (error) {
        console.error('❌ setupFullscreen() error:', error);
    }
})();

console.log('✅ App.js loaded. Page:', window.location.pathname);
