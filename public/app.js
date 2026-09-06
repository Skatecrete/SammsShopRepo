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
            
            const tabs = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
            console.log('  - Found', tabs.length, 'tattoo tabs');
            
            if (tabs.length === 0) {
                console.error('❌ No tattoo tabs found! Check HTML structure.');
                return;
            }
            
            tabs.forEach((btn, i) => {
                console.log(`  - Tab ${i}:`, btn.dataset.tab, btn.className);
            });
            
            tabs.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const tab = this.dataset.tab;
                    console.log('🖱️ Tattoo tab clicked:', tab);
                    
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
        
        const allTabs = document.querySelectorAll('.nav-tabs-tattoo .tab-btn');
        allTabs.forEach(b => b.classList.remove('active'));
        
        const activeBtn = document.querySelector(`.nav-tabs-tattoo .tab-btn[data-tab="${tab}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log('  - Active button set:', tab);
        } else {
            console.warn('  - No button found for tab:', tab);
        }
        
        const contentSections = document.querySelectorAll('#tattoo-content .tab-content');
        console.log('  - Hiding', contentSections.length, 'content sections');
        contentSections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
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
            console.log('  - Loading calendar...
