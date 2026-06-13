const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'AppContext.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all occurrences of 'http://localhost:3000' with `http://${window.location.hostname}:3000`
content = content.replace(/'http:\/\/localhost:3000/g, "`http://${window.location.hostname}:3000");

// Some occurrences were inside template literals like \`http://localhost:3000/api/orders/\${id}\`
// We need to replace those carefully.
content = content.replace(/`http:\/\/localhost:3000/g, "`http://${window.location.hostname}:3000");

// Let's ensure the socket connection is correct
// socketRef.current = io(`http://${window.location.hostname}:3000`);

fs.writeFileSync(filePath, content);
console.log('Hostname patched successfully in AppContext.tsx');
