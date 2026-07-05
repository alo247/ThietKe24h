const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

// Xóa tất cả string literals và comments để tránh đếm sai
let cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/"(?:\\\\.|[^\\\\"])*"/g, '')
    .replace(/'(?:\\\\.|[^\\\\'])*'/g, '')
    .replace(/\(?:\\\\.|[^\\\\\])*\/g, '');

let depth = 0;
let lines = cleanCode.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') depth++;
        if (line[j] === '}') depth--;
    }
}
console.log('Final depth:', depth);
