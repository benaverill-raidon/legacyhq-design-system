import fs from 'node:fs';
import path from 'node:path';
import tokens from './lib/tokens.cjs';

const [destination] = process.argv.slice(2);
if (!destination) throw new Error('Usage: npm run tokens:export -- <output.tokens.json>');
const { document } = tokens.validateSources(tokens.readSources());
// Revalidate the actual interchange document with every reference in one scope.
tokens.validateSources({ 'export.tokens.json': document });
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Exported validated DTCG document to ${destination} (CSS recipes are separate).`);
