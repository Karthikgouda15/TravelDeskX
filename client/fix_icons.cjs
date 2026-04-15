const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
  'CalendarDays': 'Calendar',
  'UserRound': 'User',
  'ShieldCheck': 'Shield',
  'BarChart3': 'BarChart2',
};

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

const files = walk(srcDir);

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [oldIcon, newIcon] of Object.entries(replacements)) {
    // Basic regex to match the component tags
    const tagMatch = new RegExp(`<${oldIcon}(.*?)/?>`, 'g');
    content = content.replace(tagMatch, `<${newIcon}$1/>`);
    
    // closing tags if any
    const closeMatch = new RegExp(`</${oldIcon}>`, 'g');
    content = content.replace(closeMatch, `</${newIcon}>`);

    // Match imports in lucide-react block
    const importRegex = new RegExp(`\\b${oldIcon}\\b`, 'g');
    content = content.replace(importRegex, newIcon);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated icons in ${file}`);
  }
});

console.log(`Replaced icons in ${changedFiles} files.`);
