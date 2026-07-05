const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');
let depth = 0;
let output = [];
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let cleanLine = line.replace(/\/\/.*|\/\*.*?\*\/|"(?:\\\\.|[^\\\\"])*"|'(?:\\\\.|[^\\\\'])*'/g, '');
    let localOpen = (cleanLine.match(/\{/g) || []).length;
    let localClose = (cleanLine.match(/\}/g) || []).length;
    
    if (localClose > localOpen && localClose - localOpen >= depth) {
       // Just for simple tracking
    }
    
    output.push(depth + '\t|\t' + (i + 1) + '\t|\t' + line.trim());
    depth += (localOpen - localClose);
}
fs.writeFileSync('app_depth.txt', output.join('\n'));
