const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      content = content.replace(/#FBF5EC/g, '#FAF3E3').replace(/#fbf5ec/g, '#FAF3E3');
      content = content.replace(/#E8612D/g, '#F26F28').replace(/#e8612d/g, '#F26F28');
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('./src');
console.log('Colors replaced!');
