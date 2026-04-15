import fs from 'fs';
import path from 'path';

// Get all files
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'src'));
const iconSet = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match import { A, B } from 'lucide-react'
  const match = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g);
  if (match) {
    match.forEach(m => {
      const inner = m.match(/import\s+{([^}]+)}/)[1];
      inner.split(',').forEach(icon => {
        let cleanIcon = icon.trim();
        // Handle aliases: BarChart as LucideBarChart
        if (cleanIcon.includes(' as ')) {
          cleanIcon = cleanIcon.split(' as ')[0].trim();
        }
        if (cleanIcon) {
          iconSet.add(cleanIcon);
        }
      });
    });
  }
});

const icons = Array.from(iconSet);
console.log('Testing these icons:', icons.join(', '));

// Now try importing them
import('lucide-react').then(lucide => {
  const missing = [];
  icons.forEach(icon => {
    if (lucide[icon] === undefined) {
      missing.push(icon);
    }
  });
  
  if (missing.length > 0) {
    console.log('\n❌ MISSING ICONS FOUND:', missing.join(', '));
  } else {
    console.log('\n✅ All imported icons exist in the current lucide-react version!');
  }
}).catch(console.error);
