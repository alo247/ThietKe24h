const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const newStyles = \
/* MS Paint Style Colors Panel in Toolbar */
.toolbar-colors-panel {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px;
}
.primary-colors {
    display: flex;
    gap: 12px;
}
.color-picker-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}
.color-label {
    font-size: 10px;
    color: var(--text-muted);
    font-weight: 500;
}
.color-picker-wrapper input[type="color"] {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    background: none;
    transition: transform 0.2s;
}
.color-picker-wrapper input[type="color"]:hover {
    transform: scale(1.1);
}
.color-picker-wrapper input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
}
.color-picker-wrapper input[type="color"]::-webkit-color-swatch {
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 50%;
}
.color-picker-wrapper input[type="color"]::-moz-color-swatch {
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 50%;
}
/* Responsive Toolbar Scroll for Mobile */
@media (max-width: 768px) {
    #toolbar {
        width: calc(100% - 32px);
        overflow-x: auto;
        justify-content: flex-start;
        -webkit-overflow-scrolling: touch;
        border-radius: 12px;
        scrollbar-width: none; /* Firefox */
    }
    #toolbar::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
    }
}
\;

fs.writeFileSync('styles.css', css + '\n' + newStyles);
