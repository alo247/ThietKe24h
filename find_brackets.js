const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

let depth = 0;
let inString = false;
let stringChar = '';
let inBlockComment = false;
let inLineComment = false;

for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const nextC = code[i+1];
    
    if (inBlockComment) {
        if (c === '*' && nextC === '/') { inBlockComment = false; i++; }
        continue;
    }
    if (inLineComment) {
        if (c === '\n') inLineComment = false;
        continue;
    }
    if (inString) {
        if (c === '\\') { i++; continue; }
        if (c === stringChar) { inString = false; }
        continue;
    }
    
    if (c === '/' && nextC === '*') { inBlockComment = true; i++; continue; }
    if (c === '/' && nextC === '/') { inLineComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '\') { inString = true; stringChar = c; continue; }
    
    if (c === '{') depth++;
    if (c === '}') {
        depth--;
        if (depth === 0) {
            let line = code.substring(0, i).split('\n').length;
            console.log('Depth zero at line:', line);
        }
    }
}
console.log('Final depth:', depth);
