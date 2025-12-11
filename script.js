/* -----------------------------------------------------------
   WELCOME BANNER
   ----------------------------------------------------------- */
function dismissWelcome() {
    const banner = document.getElementById('welcomeBanner');
    const mainContainer = document.getElementById('main-container');
    const headerGroup = document.querySelector('.header-group');
    if (banner) {
        banner.classList.add('hidden');
    }
    if (mainContainer) {
        mainContainer.classList.remove('banner-active');
    }
    if (headerGroup) {
        headerGroup.classList.remove('banner-active');
    }
}

// Add blur effect on page load when banner is shown
window.addEventListener('load', () => {
    const mainContainer = document.getElementById('main-container');
    const headerGroup = document.querySelector('.header-group');
    if (mainContainer) {
        mainContainer.classList.add('banner-active');
    }
    if (headerGroup) {
        headerGroup.classList.add('banner-active');
    }
});

/* -----------------------------------------------------------
   SCALING LOGIC
   ----------------------------------------------------------- */
const container = document.getElementById('main-container');
const counterElements = document.querySelectorAll('.counter-scale');

function resizeApp() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const targetWidth = 800; // Our base design width
    const targetHeight = 800; // Our base design height

    // Determine scale to fit within viewport with some padding
    const scaleX = (windowWidth - 20) / targetWidth;
    const scaleY = (windowHeight - 20) / targetHeight;
    const scale = Math.min(scaleX, scaleY); // Fit to smallest dimension

    // set both standard and webkit transform for Safari compatibility
    const scaleStr = `scale(${scale})`;
    container.style.transform = scaleStr;
    container.style.webkitTransform = scaleStr;

    // Apply inverse scale to elements that should remain readable/constant width
    const inv = isFinite(scale) && scale > 0 ? (1 / scale) : 1;
    // NodeList may not support forEach in older Safari; use a simple loop
    for (let i = 0; i < counterElements.length; i++) {
        const el = counterElements[i];
        const t = `translate(-50%, -50%) scale(${inv})`;
        el.style.transform = t;
        el.style.webkitTransform = t;
    }
}

window.addEventListener('resize', resizeApp);
resizeApp(); // Trigger immediately
// ensure inverse scale also applied after initial layout (fonts may change)
window.addEventListener('load', resizeApp);

// Tab switching for additional pages
function showTab(name) {
    const tabs = document.querySelectorAll('[role="tab"]');
    tabs.forEach(btn => {
        const isActive = btn.dataset.tab === name;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });

    const bingoEl = document.getElementById('bingoContent');
    const pubsEl = document.getElementById('pubsContent');

    if (name === 'bingo') {
        if (bingoEl) bingoEl.classList.remove('hidden');
        if (pubsEl) pubsEl.classList.add('hidden');
    } else if (name === 'pubs') {
        if (pubsEl) pubsEl.classList.remove('hidden');
        if (bingoEl) bingoEl.classList.add('hidden');
    }
}

// Attach tab click listeners
document.querySelectorAll('[role="tab"]').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

// Attach reset button listener
const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
    resetBtn.addEventListener('click', resetBingo);
}

/* -----------------------------------------------------------
   BINGO LOGIC
   ----------------------------------------------------------- */

const BINGO_TASKS = [
    "Take a shot with Anne", "Spot a cute Dog", "Drink a PINT of Water!", "Find another person called Anne", "Spill a Drink", "Group Selfie", "Toilet Selfie",
    "Pay with actual cash", "Find a Guy with a Moustache", "Stranger says HBD", "Lose the Group", "Find the Group", "Text an Ex", "Karaoke Moment",
    "Bartender's Choice", "Split the G", "Get a Half Pint", "Complain about a Half Pint", "Say 29 the Schmidt way 29 times", "Buy Anne a Drink", "Compliment Stranger",
    "Wear a Stranger's Item", "Break a Glass", "Cry Happy Tears", "Cry Sad Tears", "Propose a Toast", "High Five Bouncer", "Stranger Draws Your Portrait",
    "Wrong Pub Entered", "Neck another persons drink", "Ask for a shot of Water", "Order Food", "Speak with Accent (5 mins)", "Phone Dies", "Borrow Charger",
    "Do a Dare (Ask Anne)", "Wear a Hat", "Someone Trips", "Find a Ginger", "Jagerbomb!", "Baby Guinness!", "Tequila!",
    "Shout Yeehaw", "Trivia Question (Ask Aaron)", "Hug Anne", "Drink on One Leg", "Photo with Anne", "Order Drink with First Letter of Name", "Survive the Night"
];

const STORAGE_KEY = 'anne_bingo_state_v2';

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return new Array(49).fill(false);
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initGrid() {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';

    BINGO_TASKS.forEach((task, index) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        cell.id = `cell-${index}`;

        // Generate Organic Shape
        const r1 = 200 + Math.random() * 55;
        const r2 = 10 + Math.random() * 30;
        const r3 = 200 + Math.random() * 55;
        const r4 = 10 + Math.random() * 30;
        cell.style.borderRadius = `${r1}px ${r2}px ${r3}px ${r4}px / ${r4}px ${r3}px ${r2}px ${r1}px`;

        cell.innerText = task;

        if (index === 24) {
            cell.classList.add('center-cell');
        }

        cell.onclick = () => toggleCell(index);
        gridEl.appendChild(cell);
    });

    updateGridUI();
}

function updateGridUI() {
    const state = loadState();
    BINGO_TASKS.forEach((_, index) => {
        const cell = document.getElementById(`cell-${index}`);
        if (state[index]) {
            cell.classList.add('checked');
        } else {
            cell.classList.remove('checked');
        }
    });
}

function toggleCell(index) {
    const state = loadState();
    state[index] = !state[index];
    saveState(state);
    updateGridUI();
}

function resetBingo() {
    if (confirm("Are you sure you want to clear the board and reset progress?")) {
        // Clear specific key
        localStorage.removeItem(STORAGE_KEY);
        // OR clear all if requested: localStorage.clear();

        updateGridUI(); // Will revert to default false state
    }
}

initGrid();
// Ensure the default tab is visible on load
if (typeof showTab === 'function') showTab('pubs');

/* -----------------------------------------------------------
   OPENSTREETMAP ROUTE INITIALIZATION
   ----------------------------------------------------------- */
function initRouteMap() {
    const map = L.map('routeMap').setView([51.5565, -0.1100], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    const pubs = [
            { lat: 51.556958, lng: -0.124811, name: '67A Tabley Road', url: 'https://www.google.com/maps/search/?api=1&query=67A%20Tabley%20Road' },
            { lat: 51.555436, lng: -0.121737, name: 'The Prince Edward', url: 'https://www.google.com/maps/search/?api=1&query=The%20Prince%20Edward%2038%20Parkhurst%20Rd%20London%20N7%200SF' },
            { lat: 51.561944, lng: -0.124748, name: 'The Crown', url: 'https://www.google.com/maps/search/?api=1&query=The%20Crown%20622%20Holloway%20Rd%20Archway%20London%20N19%203PA' },
            { lat: 51.562872, lng: -0.122741, name: 'The Landseer Arms', url: 'https://www.google.com/maps/search/?api=1&query=The%20Landseer%20Arms%2037%20Landseer%20Rd%20London%20N19%204JU' },
            { lat: 51.559570, lng: -0.119548, name: 'The Swimmer at the Grafton Arms', url: 'https://www.google.com/maps/search/?api=1&query=The%20Swimmer%20at%20the%20Grafton%20Arms%2013%20Eburne%20Rd%20London%20N7%206AR' },
            { lat: 51.562110, lng: -0.080529, name: 'The Red Lion', url: 'https://www.google.com/maps/search/?api=1&query=The%20Red%20Lion%20132%20Stoke%20Newington%20Church%20St%20London%20N16%200JX' },
            { lat: 51.562054, lng: -0.079456, name: 'The Auld Shillelagh', url: 'https://www.google.com/maps/search/?api=1&query=The%20Auld%20Shillelagh%20105%20Stoke%20Newington%20Church%20St%20London%20N16%200UD' },
            { lat: 51.562084, lng: -0.073878, name: 'Three Crowns', url: 'https://www.google.com/maps/search/?api=1&query=Three%20Crowns%20175%20Stoke%20Newington%20High%20St%20London%20N16%200LH' },
            { lat: 51.561725, lng: -0.073503, name: 'The Coach & Horses', url: 'https://www.google.com/maps/search/?api=1&query=The%20Coach%20%26%20Horses%20178%20Stoke%20Newington%20High%20St%20London%20N16%207JL' },
            { lat: 51.560972, lng: -0.073986, name: 'The Rochester Castle', url: 'https://www.google.com/maps/search/?api=1&query=The%20Rochester%20Castle%20143-145%20Stoke%20Newington%20High%20St%20London%20N16%200NY' },
            { lat: 51.559141, lng: -0.074473, name: 'The White Hart', url: 'https://www.google.com/maps/search/?api=1&query=The%20White%20Hart%2069%20Stoke%20Newington%20High%20St%20London%20N16%208EL' },
            { lat: 51.555904, lng: -0.074865, name: 'Yucatan Bar', url: 'https://www.google.com/maps/search/?api=1&query=Yucatan%20Bar%20121%20Stoke%20Newington%20Rd%20London%20N16%208BT' }
        ];

    // Add markers for each pub
    pubs.forEach((pub, index) => {
        let color;
        if (index === 0) {
            color = '#22c55e'; // Green for start
        } else if (index === pubs.length - 1) {
            color = '#ef4444'; // Red for finish
        } else {
            color = '#2b5bbd'; // Blue for others
        }
        L.circleMarker([pub.lat, pub.lng], {
            radius: 6,
            fillColor: color,
            color: '#123275',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<strong><a href="${pub.url}" target="_blank" rel="noopener noreferrer">Pub ${index + 1}: ${pub.name}</a></strong>`).addTo(map);
    });

    // Draw polyline connecting all pubs
    const latlngs = pubs.map(pub => [pub.lat, pub.lng]);
    L.polyline(latlngs, {
        color: '#1a45a0',
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 5'
    }).addTo(map);

    // Fit map to route bounds
    const group = new L.featureGroup(pubs.map(pub => L.latLng(pub.lat, pub.lng)));
    map.fitBounds(group.getBounds(), { padding: [40, 40] });
}

// Initialize map after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initRouteMap();
} else {
    document.addEventListener('DOMContentLoaded', initRouteMap);
}

/* -----------------------------------------------------------
   PUBS CHECKBOXES + PERSISTENCE
   ----------------------------------------------------------- */
const PUBS_STORAGE_KEY = 'anne_pubs_state_v1';

function loadPubsState(count) {
    const saved = localStorage.getItem(PUBS_STORAGE_KEY);
    if (saved) {
        try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; } catch (e) { }
    }
    return new Array(count).fill(false);
}

function savePubsState(state) {
    localStorage.setItem(PUBS_STORAGE_KEY, JSON.stringify(state));
}

function initPubsCheckboxes() {
    const ol = document.getElementById('pubsList');
    if (!ol) return;
    const items = Array.from(ol.querySelectorAll('li'));
    const state = loadPubsState(items.length);

    items.forEach((li, idx) => {
        // wrap content in flex row and append checkbox
        const text = document.createElement('div');
        text.className = 'pub-label';
        // keep the existing innerHTML as label
        text.innerHTML = li.innerHTML;

        const checkbox = document.createElement('button');
        checkbox.type = 'button';
        checkbox.className = 'pub-checkbox';
        checkbox.setAttribute('aria-pressed', state[idx] ? 'true' : 'false');
        checkbox.dataset.index = idx;

        if (state[idx]) checkbox.classList.add('checked');

        checkbox.onclick = () => {
            const s = loadPubsState(items.length);
            s[idx] = !s[idx];
            savePubsState(s);
            checkbox.classList.toggle('checked', s[idx]);
            checkbox.setAttribute('aria-pressed', s[idx] ? 'true' : 'false');
        };

        // replace li content with structured row
        li.innerHTML = '';
        li.classList.add('pub-row');
        li.appendChild(text);
        li.appendChild(checkbox);
    });
}

// Initialize pubs checkboxes once DOM is ready
document.addEventListener('DOMContentLoaded', initPubsCheckboxes);
// In case script runs after DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initPubsCheckboxes();
}

/* -----------------------------------------------------------
   BACKGROUND PATTERN GENERATOR
   ----------------------------------------------------------- */

const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d');

// Configuration
const CONFIG = {
    color: '#1a45a0',
    detailColor: '#123275',
    flowerColor: '#2b5bbd',
    lineWidth: 0.6,
    // Align sheet to the app base resolution so the canvas visuals scale exactly with the container
    sheetSize: 1000,
    squareSize: 600,
    sway: 60,
    layoutSeed: 111,
    skippedElements: []
};

let _seed = CONFIG.layoutSeed;
function layoutRandom() {
    _seed = (_seed * 9301 + 49297) % 233280;
    return _seed / 233280;
}

function variationRandom() {
    return Math.random();
}

let width, height;
let placedElements = [];

function initSheet() {
    // High DPI Support
    // Cap DPR at 2 to avoid creating excessively large canvases on super-high-res devices
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Logical Dimensions (match app base so CSS transform scales everything uniformly)
    width = CONFIG.sheetSize;
    height = CONFIG.sheetSize;

    // Set physical size (pixels)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size (css) to the logical sheet size (matches #main-container base)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Reset any previous transform to avoid cumulative scaling, then scale for DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    _seed = CONFIG.layoutSeed;
    drawPattern();
}

function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function isOverlapping(x, y, radius) {
    for (const element of placedElements) {
        const dist = getDistance(x, y, element.x, element.y);
        if (dist < element.radius + radius + 15) {
            return true;
        }
    }
    return false;
}

// --- Drawing Primitives (Preserved from optimized version) ---

function drawLeaf(x, y, angle, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    ctx.fillStyle = CONFIG.color;

    ctx.beginPath();
    ctx.moveTo(0, 0);

    const j1 = (variationRandom() - 0.5) * 2;
    const j2 = (variationRandom() - 0.5) * 2;

    ctx.bezierCurveTo(5 + j1, -4 + j2, 10 - j1, -6 - j2, 15 + j1, -3 + j2);
    ctx.bezierCurveTo(18 - j1, -5 - j2, 22 + j1, -4 + j2, 25, 0);
    ctx.bezierCurveTo(22 - j1, 4 - j2, 18 + j1, 5 + j2, 15 - j1, 3 - j2);
    ctx.bezierCurveTo(10 + j1, 6 + j2, 5 - j1, 4 - j2, 0, 0);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();

    ctx.restore();
}

function drawBud(x, y, angle, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const ctrlX = 5 + (variationRandom() - 0.5) * 4;
    const ctrlY = -2 + (variationRandom() - 0.5) * 4;

    ctx.beginPath();
    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = 0.5;
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(ctrlX, ctrlY, 10, 0);
    ctx.stroke();

    const budTip = 15 + (variationRandom() - 0.5) * 2;
    const budWidth = 3 + (variationRandom() - 0.5) * 1.5;

    ctx.fillStyle = CONFIG.flowerColor;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.bezierCurveTo(12, -budWidth, 14, -budWidth, budTip, 0);
    ctx.bezierCurveTo(14, budWidth, 12, budWidth, 10, 0);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(11, 0); ctx.lineTo(budTip - 1, 0);
    ctx.stroke();

    const numLeaves = 1 + Math.floor(variationRandom() * 2);
    for (let i = 0; i < numLeaves; i++) {
        const t = 0.3 + variationRandom() * 0.4;
        const mt = 1 - t;
        const lx = mt * mt * 0 + 2 * mt * t * ctrlX + t * t * 10;
        const ly = mt * mt * 0 + 2 * mt * t * ctrlY + t * t * 0;
        drawLeaf(lx, ly, angle + (variationRandom() > 0.5 ? 0.8 : -0.8), 0.3);
    }

    ctx.restore();
}

function drawRosette(x, y, angle, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const stemLength = 15;
    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = CONFIG.lineWidth;

    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(stemLength / 2, (layoutRandom() - 0.5) * 4, stemLength, 0);
    ctx.stroke();

    ctx.translate(stemLength, 0);

    const cx = (variationRandom() - 0.5) * 1.5;
    const cy = (variationRandom() - 0.5) * 1.5;

    for (let j = -1; j <= 1; j++) {
        const fanAngle = j * 0.6;
        const startDist = 16;
        const bx = cx + Math.cos(fanAngle) * startDist;
        const by = cy + Math.sin(fanAngle) * startDist;

        ctx.beginPath();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = CONFIG.color;
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(
            cx + Math.cos(fanAngle) * (startDist / 2),
            cy + Math.sin(fanAngle) * (startDist / 2) + (j === 0 ? 0 : (j * 2)),
            bx, by
        );
        ctx.stroke();
        drawBud(bx, by, fanAngle, 0.6);
    }

    ctx.fillStyle = CONFIG.detailColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3.5 + (variationRandom() - 0.5), 3.5 + (variationRandom() - 0.5), variationRandom(), 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = CONFIG.flowerColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const ringRadius = 6;
    for (let i = 0; i <= 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const r = ringRadius + (variationRandom() - 0.5) * 1.2;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // OPTIMIZATION: Calculate all petal properties first to preserve seed order
    const petalCount = 8;
    const petalOffset = Math.PI / 8;
    const petals = [];

    for (let i = 0; i < petalCount; i++) {
        const theta = (i / petalCount) * Math.PI * 2 + petalOffset + (variationRandom() - 0.5) * 0.1;
        const pLen = 7 + (variationRandom() - 0.5) * 2;
        const pWidth = 3.5 + (variationRandom() - 0.5) * 1.5;
        const pRot = (variationRandom() - 0.5) * 0.2;
        const s1 = (variationRandom() - 0.5);
        const s2 = (variationRandom() - 0.5);
        petals.push({ theta, pLen, pWidth, pRot, s1, s2 });
    }

    // OPTIMIZATION: Batch draw all petal fills
    ctx.fillStyle = CONFIG.flowerColor;
    ctx.beginPath();
    petals.forEach(p => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(p.theta);
        ctx.moveTo(11 + p.pLen, 0); // approx move to avoids lines between petals
        ctx.ellipse(11, 0, p.pLen, p.pWidth, p.pRot, 0, Math.PI * 2);
        ctx.restore();
    });
    ctx.fill();

    // OPTIMIZATION: Batch draw all petal details
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    petals.forEach(p => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(p.theta);
        ctx.moveTo(5 + p.s1, 0 + p.s2); ctx.lineTo(13 - p.s1, 0 - p.s2);
        ctx.moveTo(6 + p.s2, 1.2 + p.s1); ctx.lineTo(11 - p.s2, 1.8 - p.s1);
        ctx.moveTo(6 - p.s1, -1.2 - p.s2); ctx.lineTo(11 + p.s1, -1.8 + p.s2);
        ctx.restore();
    });
    ctx.stroke();

    ctx.restore();
}

function drawPalmette(x, y, angle, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const stemLength = 10;

    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(stemLength / 2, (layoutRandom() - 0.5) * 2, stemLength + 1, 0);
    ctx.stroke();

    ctx.translate(stemLength, 0);

    // Base
    ctx.fillStyle = CONFIG.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.5 + (variationRandom() - 0.5), 3.5 + (variationRandom() - 0.5), variationRandom(), 0, Math.PI * 2);
    ctx.fill();

    // OPTIMIZATION: Pre-calculate fan petals
    const fanParts = [];
    for (let i = -2; i <= 2; i++) {
        const theta = i * 0.45 + (variationRandom() - 0.5) * 0.2;
        const jx = (variationRandom() - 0.5) * 3;
        const jy = (variationRandom() - 0.5) * 3;
        fanParts.push({ theta, jx, jy });
    }

    // Batch Fills
    ctx.fillStyle = CONFIG.flowerColor;
    ctx.beginPath();
    fanParts.forEach(p => {
        ctx.save();
        ctx.rotate(p.theta);
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(6 + p.jx, -4 + p.jy, 16 - p.jx, -3 - p.jy);
        ctx.quadraticCurveTo(18 + p.jx, 0 + p.jy, 16 - p.jx, 3 + p.jy);
        ctx.quadraticCurveTo(6 + p.jx, 4 - p.jy, 0, 0);
        ctx.restore();
    });
    ctx.fill();

    // Batch Strokes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    fanParts.forEach(p => {
        ctx.save();
        ctx.rotate(p.theta);
        ctx.moveTo(4, 0); ctx.lineTo(14 + p.jx, 0);
        ctx.restore();
    });
    ctx.stroke();

    ctx.restore();
}

function drawBranch(x, y, length, angle, depth) {
    if (depth <= 0) {
        if (layoutRandom() > 0.5) drawRosette(x, y, angle, 0.7);
        else drawPalmette(x, y, angle - Math.PI / 2, 0.7);
        return;
    }

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    ctx.beginPath();
    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = Math.max(0.3, CONFIG.lineWidth * (depth / 1.5));

    const ctrlX = (x + endX) / 2 + (layoutRandom() - 0.5) * 20;
    const ctrlY = (y + endY) / 2 + (layoutRandom() - 0.5) * 20;

    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.stroke();

    drawBranch(endX, endY, length * 0.7, angle + (layoutRandom() - 0.5) * 1.0, depth - 1);
}

function drawDecoratedSide(x1, y1, x2, y2, curvatureDirection, sideIndex) {
    ctx.beginPath();
    ctx.strokeStyle = CONFIG.color;
    ctx.lineWidth = CONFIG.lineWidth;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const midX = (x1 + x2) / 2;
    // fixed: midY should be average of y1 and y2
    const midY = (y1 + y2) / 2;

    let perpX = -dy / dist;
    let perpY = dx / dist;

    perpX *= curvatureDirection;
    perpY *= curvatureDirection;

    const swayAmount = CONFIG.sway;
    const cp1x = midX + perpX * swayAmount;
    const cp1y = midY + perpY * swayAmount;

    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);
    ctx.stroke();

    const numElements = 8;

    for (let i = 0; i < numElements; i++) {
        const segmentSize = 1.0 / numElements;
        const t = (i * segmentSize) + (layoutRandom() * segmentSize * 0.8) + (segmentSize * 0.1);

        const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cp1x + t * t * x2;
        const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cp1y + t * t * y2;

        const tx = 2 * (1 - t) * (cp1x - x1) + 2 * t * (x2 - cp1x);
        const ty = 2 * (1 - t) * (cp1y - y1) + 2 * t * (y2 - cp1y);
        const tangentAngle = Math.atan2(ty, tx);

        const type = layoutRandom();

        if (type > 0.55) {
            const scale = 0.9 + layoutRandom() * 0.3;
            const radius = 25 * scale;
            const flip = layoutRandom() > 0.5 ? 1 : -1;

            if (!isOverlapping(bx, by, radius)) {
                placedElements.push({ x: bx, y: by, radius: radius });
                drawRosette(bx, by, tangentAngle + (Math.PI / 2 * flip), scale);
            }
        } else if (type > 0.25) {
            const scale = 0.8 + layoutRandom() * 0.2;
            const radius = 18 * scale;
            const flip = layoutRandom() > 0.5 ? 1 : -1;

            if (!isOverlapping(bx, by, radius)) {
                placedElements.push({ x: bx, y: by, radius: radius });
                drawPalmette(bx, by, tangentAngle - (Math.PI / 2 * flip), scale);
            }
        } else {
            drawBranch(bx, by, 30, tangentAngle + (layoutRandom() > 0.5 ? 1.2 : -1.2), 1);
        }
    }
}

function drawPattern() {
    placedElements = [];

    // Note: Canvas clears automatically when redrawn or initialized usually,
    // but explicit clear is good practice if resizing/redrawing often
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#f8f9fa';
    ctx.lineWidth = 1.2;
    for (let x = 0; x < width; x += 14) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }

    // Draw Pattern centered in the massive sheet
    const cx = width / 2;
    const cy = height / 2;
    const size = CONFIG.squareSize;

    const corners = [
        { x: cx - size / 2, y: cy - size / 2 }, // Top Left
        { x: cx + size / 2, y: cy - size / 2 }, // Top Right
        { x: cx + size / 2, y: cy + size / 2 }, // Bottom Right
        { x: cx - size / 2, y: cy + size / 2 }  // Bottom Left
    ];

    corners.forEach((corner, index) => {
        const cornerAngle = (index * Math.PI / 2) - 3 * Math.PI / 4;
        const scale = 0.9;
        placedElements.push({ x: corner.x, y: corner.y, radius: 28 * scale });
        drawRosette(corner.x, corner.y, cornerAngle, scale);
    });

    drawDecoratedSide(corners[0].x, corners[0].y, corners[1].x, corners[1].y, -1);
    drawDecoratedSide(corners[1].x, corners[1].y, corners[2].x, corners[2].y, -1);
    drawDecoratedSide(corners[2].x, corners[2].y, corners[3].x, corners[3].y, -1);
    drawDecoratedSide(corners[3].x, corners[3].y, corners[0].x, corners[0].y, -1);
}

// Start
requestAnimationFrame(initSheet);

// Polyfill for ctx.ellipse in older Safari
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.ellipse) {
    CanvasRenderingContext2D.prototype.ellipse = function (cx, cy, rx, ry, rotation, startAngle, endAngle, anticlockwise) {
        // save/translate/scale approach
        this.save();
        this.translate(cx, cy);
        this.rotate(rotation || 0);
        this.scale(rx, ry);
        this.beginPath();
        // draw unit circle arc then restore
        this.arc(0, 0, 1, startAngle, endAngle, anticlockwise || false);
        this.restore();
    };
}
