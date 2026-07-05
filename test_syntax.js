const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
try {
    new Function(code);
    console.log('Syntax is OK');
} catch (e) {
    console.error(e);
}
