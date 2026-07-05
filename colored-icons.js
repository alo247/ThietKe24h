/**
 * COLOR ICONS INJECTOR
 * Thay thế các SVG đơn sắc trên Toolbar bằng SVG đa sắc (sống động).
 */

const coloredIcons = {
    'btn-select': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#4CAF50" d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4-4.4 4.5z"/>
        <path fill="#FF5722" d="M14.5 13.7l3.3 7.3-2.2 1-3.2-7.4z"/>
    </svg>`,
    'btn-hand': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#FFCA28" d="M21 10.5V17c0 4.5-3.5 8-8 8s-8-3.5-8-8v-3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v3h1V8.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v2h1V6.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v4h1V8.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5z"/>
        <path fill="#FFE082" d="M21 10.5V17c0 4.5-3.5 8-8 8s-8-3.5-8-8v-3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v3h1V8.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v2h1V6.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v4h1V8.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5z"/>
    </svg>`,
    'btn-draw': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#795548" d="M19.1 4.9C18.2 4 15.3 5 12 8.3c-3.3 3.3-4.3 6.2-3.4 7.1.9.9 3.8-.1 7.1-3.4 3.3-3.3 4.3-6.2 3.4-7.1z"/>
        <path fill="#FFC107" d="M8.6 15.4c-2 2-3.1 4.9-5.3 7.1 2.2-2.2 5.1-3.3 7.1-5.3-.6-.6-1.2-1.2-1.8-1.8z"/>
        <path fill="#E91E63" d="M20.5 2.1c-.8-.8-2.1-.8-2.8 0l-4.2 4.2c2.5-.5 5 0 6.4 1.4.3.3.6.7.8 1.1l1.3-4c.7-2-.1-4-1.5-2.7z"/>
    </svg>`,
    'btn-erase': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#F48FB1" d="M15 4l5 5-7 7-5-5 7-7m0-2l-2 2-5 5-2 2 5 5 2-2 7-7 2-2-5-5-2-2z"/>
        <path fill="#4FC3F7" d="M8 11l5-5-2-2-5 5 2 2z"/>
        <path fill="#E0E0E0" d="M3 20h18v2H3z"/>
    </svg>`,
    'btn-bucket': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#9E9E9E" d="M6 10l.5 10h11l.5-10H6z"/>
        <path fill="#4CAF50" d="M6.5 14h11L18 10H6l.5 4z"/>
        <path fill="#607D8B" d="M9 10V6c0-1.7 1.3-3 3-3s3 1.3 3 3v4h-2V6c0-.6-.4-1-1-1s-1 .4-1 1v4H9z"/>
        <circle cx="12" cy="18" r="2" fill="#212121"/>
    </svg>`,
    'btn-color-picker': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#00BCD4" d="M7 14.5l-4 4-1 3 3-1 4-4-2-2zm12.5-9.5c.8-.8.8-2 0-2.8s-2-.8-2.8 0L9 10l2.8 2.8 7.7-7.8z"/>
        <path fill="#FFC107" d="M8.5 12.5L10 14l-4 4-1.5-1.5z"/>
    </svg>`,
    'btn-shape': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <rect x="2" y="12" width="9" height="9" fill="#2196F3" rx="2"/>
        <circle cx="17" cy="17" r="5" fill="#FFC107"/>
        <path fill="#4CAF50" d="M11 9.5l-4-7-4 7h8z"/>
    </svg>`,
    'btn-text': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#673AB7" d="M9 4v3h5v12h3V7h5V4H9z"/>
    </svg>`,
    'btn-note': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#FFEB3B" d="M3 3h18v18H3z"/>
        <path fill="#FBC02D" d="M3 3h18v5H3z"/>
        <circle cx="12" cy="5.5" r="1.5" fill="#EF5350"/>
    </svg>`,
    'btn-connector': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#9C27B0" d="M17 7h-4V5h4c2.8 0 5 2.2 5 5s-2.2 5-5 5h-4v-2h4c1.7 0 3-1.3 3-3s-1.3-3-3-3z"/>
        <path fill="#E91E63" d="M7 17h4v2H7c-2.8 0-5-2.2-5-5s2.2-5 5-5h4v2H7c-1.7 0-3 1.3-3 3s1.3 3 3 3z"/>
        <path fill="#607D8B" d="M8 11h8v2H8z"/>
    </svg>`,
    'btn-image': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#8BC34A" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z"/>
        <path fill="#03A9F4" d="M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        <circle cx="17" cy="8" r="2" fill="#FFEB3B"/>
    </svg>`,
    'btn-undo': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#FF5252" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
    </svg>`,
    'btn-redo': `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <path fill="#4CAF50" d="M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62c-1.39-1.16-3.16-1.88-5.12-1.88-3.54 0-6.55 2.31-7.6 5.5l-2.37-.78C2.92 11.03 6.85 8 11.5 8z"/>
    </svg>`
};

document.addEventListener('DOMContentLoaded', () => {
    Object.keys(coloredIcons).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.innerHTML = coloredIcons[id];
        }
    });
});
