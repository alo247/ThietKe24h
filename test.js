const fs = require('fs');

const utils = fs.readFileSync('utils.js', 'utf8');
const elements = fs.readFileSync('elements.js', 'utf8');
const canvas = fs.readFileSync('canvas.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');

global.window = { innerWidth: 1000, innerHeight: 1000, addEventListener: ()=>{} };
global.document = {
    addEventListener: (event, cb) => {
        if(event === 'DOMContentLoaded') {
            global.window.onload = cb;
        }
    },
    getElementById: (id) => {
        if (id === 'infinite-canvas') {
            return {
                getContext: () => ({
                    setTransform: ()=>{}, save: ()=>{}, restore: ()=>{}, fillStyle: '', fillRect: ()=>{},
                    scale: ()=>{}, translate: ()=>{}, clearRect: ()=>{}, measureText: ()=>({width: 10}),
                    fillText: ()=>{}, strokeRect: ()=>{}, beginPath: ()=>{}, moveTo: ()=>{}, lineTo: ()=>{},
                    stroke: ()=>{}, fill: ()=>{}, arc: ()=>{}, closePath: ()=>{}
                }),
                width: 1000,
                height: 1000,
                addEventListener: ()=>{},
                style: { cursor: '' }
            }
        }
        return { 
            addEventListener: () => {}, 
            classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>{} }, 
            style: {} 
        };
    },
    createElement: () => ({ 
        getContext: () => ({ fillStyle: '', fillRect: ()=>{}, save: ()=>{}, translate: ()=>{}, restore: ()=>{}, toDataURL: ()=>{} }), 
        classList: { add: ()=>{}, remove: ()=>{} },
        style: {}
    }),
    querySelectorAll: () => ([]),
    querySelector: () => ({ classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>{} }, addEventListener: ()=>{} }),
    body: { appendChild: ()=>{}, removeChild: ()=>{} }
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.Image = class {};
global.Blob = class {};
global.URL = { createObjectURL: ()=>{}, revokeObjectURL: ()=>{} };
global.MouseEvent = class {};
global.Math = Math;

try {
    eval(utils);
    eval(elements);
    eval(canvas);
    eval(app);
    if(global.window.onload) global.window.onload();
    console.log("No syntax/reference error detected during initialization.");
} catch(e) {
    console.error("ERROR CAUGHT:", e);
}
