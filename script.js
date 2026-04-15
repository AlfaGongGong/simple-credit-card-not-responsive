'use strict';

// ============================================================
// Card network definitions
// ============================================================
const CARD_NETWORKS = [
    {
        name: 'visa',
        pattern: /^4/,
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.7 53.9">
            <path fill="#fff" d="M61.9 53.1l8.9-52.2h14.2l-8.9 52.2zm65.8-50.9c-2.8-1.1-7.2-2.2-12.7-2.2-14.1 0-24 7.1-24 17.2-.1 7.5 7.1 11.7 12.5 14.2 5.5 2.6 7.4 4.2 7.4 6.5 0 3.5-4.4 5.1-8.5 5.1-5.7 0-8.7-.8-13.4-2.7l-2-.9-2 11.7c3.3 1.5 9.5 2.7 15.9 2.8 15 0 24.7-7 24.8-17.8.1-5.9-3.7-10.5-11.9-14.2-5-2.4-8-4-8-6.5 0-2.2 2.6-4.5 8.1-4.5 4.7-.1 8 .9 10.6 2l1.3.6 1.9-11.3M164.2 1h-11c-3.4 0-6 .9-7.5 4.3l-21.1 47.8h14.9s2.4-6.4 3-7.8h18.2c.4 1.8 1.7 7.8 1.7 7.8h13.2l-11.4-52.1m-17.5 33.6c1.2-3 5.7-14.6 5.7-14.6-.1.1 1.2-3 1.9-5l1 4.5s2.7 12.5 3.3 15.1h-11.9zm-96.7-33.7l-14 35.6-1.5-7.2c-2.5-8.3-10.6-17.4-19.6-21.9l12.7 45.7h15.1l22.4-52.2h-15.1"/>
            <path fill="#F7A600" d="M23.1.9h-22.9l-.2 1.1c17.9 4.3 29.7 14.8 34.6 27.3l-5-24c-.9-3.3-3.4-4.3-6.5-4.4"/>
        </svg>`,
        gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 45%, #1565c0 100%)',
    },
    {
        name: 'mastercard',
        pattern: /^5[1-5]|^2[2-7]/,
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 24">
            <circle cx="15" cy="12" r="10" fill="#EB001B"/>
            <circle cx="23" cy="12" r="10" fill="#F79E1B"/>
            <path d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z" fill="#FF5F00"/>
        </svg>`,
        gradient: 'linear-gradient(135deg, #1a1a1a 0%, #37474f 45%, #b71c1c 100%)',
    },
    {
        name: 'amex',
        pattern: /^3[47]/,
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 18">
            <rect width="50" height="18" rx="3" fill="#2557D6"/>
            <text x="25" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="Arial, sans-serif">AMEX</text>
        </svg>`,
        gradient: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 45%, #1976d2 100%)',
    },
    {
        name: 'discover',
        pattern: /^6(?:011|4[4-9]|5)/,
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 18">
            <rect width="62" height="18" rx="3" fill="#231F20"/>
            <text x="31" y="13" text-anchor="middle" fill="#F76F20" font-size="7.5" font-weight="bold" font-family="Arial, sans-serif">DISCOVER</text>
        </svg>`,
        gradient: 'linear-gradient(135deg, #e65100 0%, #ef6c00 45%, #ff8f00 100%)',
    },
];

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1a1a3e 0%, #2d1b69 35%, #11998e 100%)';

// ============================================================
// DOM references
// ============================================================
const cardNumberInput  = document.getElementById('card_number');
const nameInput        = document.getElementById('name_on_card');
const expiryInput      = document.getElementById('expiry');
const cvvInput         = document.getElementById('cvv');
const card3d           = document.getElementById('card-3d');
const cardScene        = document.getElementById('card-scene');
const displayName      = document.getElementById('display-name');
const displayExpiry    = document.getElementById('display-expiry');
const displayCvv       = document.getElementById('display-cvv');
const cardNumberGroups = document.querySelectorAll('#card-number-display .num-group');
const cardTypeLogo     = document.getElementById('card-type-logo');
const cardTypeBadge    = document.getElementById('card-type-badge');
const payBtn           = document.getElementById('pay-btn');
const form             = document.getElementById('payment-form');
const cardFront        = document.querySelector('.card-front');

// ============================================================
// Helpers
// ============================================================
function detectNetwork(rawDigits) {
    return CARD_NETWORKS.find(n => n.pattern.test(rawDigits)) || null;
}

function setCardAppearance(network) {
    cardFront.style.background = network ? network.gradient : DEFAULT_GRADIENT;
    const svg = network ? network.logo : '';
    cardTypeLogo.innerHTML  = svg;
    cardTypeBadge.innerHTML = svg;
}

function formatCardNumber(digits) {
    const network = detectNetwork(digits);
    if (network && network.name === 'amex') {
        return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
            .filter(Boolean).join(' ');
    }
    return (digits.match(/.{1,4}/g) || []).join(' ');
}

function animateGroup(el, newText) {
    if (el.textContent === newText) return;
    el.style.opacity   = '0.3';
    el.style.transform = 'translateY(-5px)';
    setTimeout(() => {
        el.textContent     = newText;
        el.style.opacity   = '';
        el.style.transform = '';
    }, 110);
}

function updateCardNumberDisplay(rawDigits) {
    const chunks = [];
    for (let i = 0; i < 4; i++) chunks.push(rawDigits.slice(i * 4, i * 4 + 4));
    cardNumberGroups.forEach((g, i) => animateGroup(g, chunks[i].padEnd(4, '•')));
}

// ============================================================
// Field config (for validation helpers)
// ============================================================
const FIELDS = {
    name:        { group: 'group-name',        error: 'error-name'   },
    cardNumber:  { group: 'group-card-number', error: 'error-card'   },
    expiry:      { group: 'group-expiry',      error: 'error-expiry' },
    cvv:         { group: 'group-cvv',         error: 'error-cvv'    },
};

function setFieldState(fieldKey, state, message) {
    const cfg   = FIELDS[fieldKey];
    const group = document.getElementById(cfg.group);
    const err   = document.getElementById(cfg.error);
    if (!group) return;

    group.classList.toggle('has-error', state === 'error');
    group.classList.toggle('is-valid',  state === 'valid');

    if (err) {
        err.textContent = message || '';
        err.classList.toggle('visible', state === 'error' && !!message);
    }
}

function clearField(fieldKey) {
    setFieldState(fieldKey, 'none');
}

// ============================================================
// Input handlers
// ============================================================

// --- Card Number ---
cardNumberInput.addEventListener('input', (e) => {
    const raw  = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = formatCardNumber(raw);

    updateCardNumberDisplay(raw);

    const net = detectNetwork(raw);
    setCardAppearance(net);
    validateCardNumber(raw);
});

// --- Cardholder Name ---
nameInput.addEventListener('input', (e) => {
    const val = e.target.value.slice(0, 26);
    displayName.textContent = val.toUpperCase() || 'FULL NAME';
    validateName(val);
});

// --- Expiry ---
expiryInput.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = raw.length > 2 ? raw.slice(0, 2) + ' / ' + raw.slice(2) : raw;

    const mm = raw.slice(0, 2) || 'MM';
    const yy = raw.slice(2, 4) || 'YY';
    displayExpiry.textContent = mm + '/' + yy;

    validateExpiry(raw);
});

expiryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && e.target.value.endsWith(' / ')) {
        e.preventDefault();
        e.target.value = e.target.value.slice(0, 2);
    }
});

// --- CVV + card flip ---
cvvInput.addEventListener('focus', () => {
    card3d.classList.add('is-flipped');
    card3d.style.animation = 'none';
});

cvvInput.addEventListener('blur', () => {
    card3d.classList.remove('is-flipped');
    card3d.style.animation  = '';
    card3d.style.transform  = '';
});

cvvInput.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = val;
    displayCvv.textContent = val || '•••';
    validateCvv(val);
});

// ============================================================
// Validation
// ============================================================
function validateName(val) {
    const v = val.trim();
    if (!v)           { clearField('name');                                       return false; }
    if (v.length < 2) { setFieldState('name', 'error', 'Enter your full name');  return false; }
    setFieldState('name', 'valid');
    return true;
}

function validateCardNumber(raw) {
    if (!raw)           { clearField('cardNumber');                                          return false; }
    if (raw.length < 15) { setFieldState('cardNumber', 'error', 'Card number is too short'); return false; }
    setFieldState('cardNumber', 'valid');
    return true;
}

function validateExpiry(raw) {
    if (!raw)          { clearField('expiry');                                           return false; }
    if (raw.length < 4) { setFieldState('expiry', 'error', 'Enter full expiry date');   return false; }
    const month = parseInt(raw.slice(0, 2), 10);
    const yy    = parseInt(raw.slice(2, 4), 10);
    const now   = new Date();
    // Sliding-window century: yy < (current year - 10) % 100 means next century
    const currentYY = now.getFullYear() % 100;
    const century   = yy < (currentYY - 10) ? Math.floor(now.getFullYear() / 100) + 1 : Math.floor(now.getFullYear() / 100);
    const year      = century * 100 + yy;
    if (month < 1 || month > 12) { setFieldState('expiry', 'error', 'Invalid month'); return false; }
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        setFieldState('expiry', 'error', 'Card has expired');
        return false;
    }
    setFieldState('expiry', 'valid');
    return true;
}

function validateCvv(val) {
    if (!val)          { clearField('cvv');                                        return false; }
    if (val.length < 3) { setFieldState('cvv', 'error', 'CVV must be 3–4 digits'); return false; }
    setFieldState('cvv', 'valid');
    return true;
}

// ============================================================
// Form submission
// ============================================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameOk   = validateName(nameInput.value);
    const cardOk   = validateCardNumber(cardNumberInput.value.replace(/\s/g, ''));
    const expiryOk = validateExpiry(expiryInput.value.replace(/\D/g, ''));
    const cvvOk    = validateCvv(cvvInput.value);

    if (!nameOk || !cardOk || !expiryOk || !cvvOk) {
        payBtn.classList.add('is-shaking');
        payBtn.addEventListener('animationend', () => payBtn.classList.remove('is-shaking'), { once: true });
        return;
    }

    payBtn.classList.add('is-loading');
    payBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 1800));

    payBtn.classList.remove('is-loading');
    payBtn.classList.add('is-success');
    launchConfetti();
});

// ============================================================
// Confetti on success
// ============================================================
const CONFETTI_COUNT = 48;

function launchConfetti() {
    const COLORS = ['#6c3ce4', '#ff6b9d', '#00d4ff', '#ffd700', '#00e676'];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
        const el = document.createElement('div');
        const size = Math.random() * 8 + 4;
        el.style.cssText = [
            'position:fixed',
            `width:${size}px`,
            `height:${size}px`,
            `background:${COLORS[Math.floor(Math.random() * COLORS.length)]}`,
            `left:${Math.random() * 100}vw`,
            'top:50%',
            `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
            'pointer-events:none',
            'z-index:9999',
        ].join(';');
        document.body.appendChild(el);

        const angle    = Math.random() * Math.PI * 2;
        const speed    = Math.random() * 280 + 100;
        const duration = Math.random() * 900 + 700;

        el.animate([
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            {
                transform: `translate(${Math.cos(angle) * speed}px, ${Math.sin(angle) * speed - 220}px) rotate(${Math.random() * 720}deg)`,
                opacity: 0,
            },
        ], { duration, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' })
            .finished.then(() => el.remove());
    }
}

// ============================================================
// 3-D card tilt on mouse / touch
// ============================================================
const MAX_TILT_X = 22;
const MAX_TILT_Y = 11;

let tiltActive = false;

function applyTilt(xRatio, yRatio) {
    const rx = xRatio * MAX_TILT_X;
    const ry = -yRatio * MAX_TILT_Y;
    card3d.style.transform = `rotateY(${rx}deg) rotateX(${ry}deg) translateZ(12px)`;
}

cardScene.addEventListener('mouseenter', () => {
    if (card3d.classList.contains('is-flipped')) return;
    tiltActive = true;
    card3d.style.animation = 'none';
    card3d.style.transition = 'transform 0.08s linear';
});

cardScene.addEventListener('mousemove', (e) => {
    if (!tiltActive) return;
    const rect = cardScene.getBoundingClientRect();
    applyTilt(
        (e.clientX - rect.left) / rect.width  - 0.5,
        (e.clientY - rect.top)  / rect.height - 0.5
    );
});

cardScene.addEventListener('mouseleave', () => {
    tiltActive = false;
    card3d.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
    card3d.style.transform  = '';
    setTimeout(() => {
        card3d.style.transition = '';
        card3d.style.animation  = '';
    }, 600);
});

cardScene.addEventListener('touchmove', (e) => {
    if (card3d.classList.contains('is-flipped')) return;
    const touch = e.touches[0];
    const rect  = cardScene.getBoundingClientRect();
    card3d.style.animation = 'none';
    applyTilt(
        (touch.clientX - rect.left) / rect.width  - 0.5,
        (touch.clientY - rect.top)  / rect.height - 0.5
    );
}, { passive: true });

cardScene.addEventListener('touchend', () => {
    if (card3d.classList.contains('is-flipped')) return;
    card3d.style.transform = '';
    setTimeout(() => { card3d.style.animation = ''; }, 50);
});

