const fs = require('fs');
const acorn = require('acorn');
const code = fs.readFileSync('app.js', 'utf8');
let depth = 0;
let lastZeroLine = -1;
try {
    for (let token of acorn.tokenizer(code, { ecmaVersion: 2020 })) {
        if (token.type.label === '{') depth++;
        if (token.type.label === '}') {
            depth--;
            if (depth === 0) {
                lastZeroLine = token.loc.start.line;
            }
        }
    }
} catch (e) {
    console.log('Error at', e.loc.line, 'Depth at error:', depth, 'Last zero depth line:', lastZeroLine);
}
