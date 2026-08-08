const fs = require('fs');

let indexTs = fs.readFileSync('backend/src/index.ts', 'utf8');

// Fix 'data.data' property error
indexTs = indexTs.replace(/const data = await res\.json\(\);\n\s*if \(data && \(Array\.isArray\(data\.data\)/g, "const data = await res.json() as any;\n        if (data && (Array.isArray(data.data)");

// Fix 'data.models' property error for google
indexTs = indexTs.replace(/const data = await res\.json\(\);\n\s*if \(data && Array\.isArray\(data\.models\)\) \{/g, "const data = await res.json() as any;\n        if (data && Array.isArray(data.models)) {");

fs.writeFileSync('backend/src/index.ts', indexTs);
console.log('Fixed TS errors in index.ts');
