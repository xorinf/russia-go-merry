import fs from 'fs';
import path from 'path';

const dir = './src';
const exts = ['.jsx'];

const replacements = {
  'btn-primary': 'inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 active:bg-sage-800 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed',
  'btn-ghost': 'inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-ink/70 hover:bg-mist hover:text-ink transition-colors duration-150 ease-in-out',
  'input-field': 'w-full px-4 py-2.5 rounded-lg border border-black/12 bg-white text-sm text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition duration-150',
  'badge-answered': 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sage-100 text-sage-800',
  'badge-unanswered': 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-mist text-ink/70',
  'source-badge-faq': 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700',
  'source-badge-community': 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700'
};

function walkDir(d) {
  const files = fs.readdirSync(d);
  files.forEach(file => {
    const p = path.join(d, file);
    if (fs.statSync(p).isDirectory()) {
      walkDir(p);
    } else if (exts.includes(path.extname(p))) {
      let content = fs.readFileSync(p, 'utf-8');
      let modified = false;

      // Replace distinct class names
      for (const [key, val] of Object.entries(replacements)) {
        const regex = new RegExp(`(?<=className=["'\\\`].*?)\\b${key}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, val);
          modified = true;
        }
        
        // Handle ternary matches like 'badge-answered'
        const regexTernary = new RegExp(`'${key}'`, 'g');
        if (regexTernary.test(content)) {
          content = content.replace(regexTernary, `'${val}'`);
          modified = true;
        }
      }

      // Handle card specially because of shadow-card
      // We only want to replace standalone "card"
      const cardRegex1 = /className="card /g;
      if (cardRegex1.test(content)) {
        content = content.replace(cardRegex1, 'className="bg-white rounded-xl border border-black/6 shadow-card ');
        modified = true;
      }
      const cardRegex2 = /className="card"/g;
      if (cardRegex2.test(content)) {
        content = content.replace(cardRegex2, 'className="bg-white rounded-xl border border-black/6 shadow-card"');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(p, content, 'utf-8');
        console.log(`Updated ${p}`);
      }
    }
  });
}

walkDir(dir);
