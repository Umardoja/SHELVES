const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
let filesModified = 0;
let replacements = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let orig = content;

  // localStorage keys: upstock_ -> shelves_
  content = content.replace(/upstock_token/g, () => { replacements++; return 'shelves_token'; });
  content = content.replace(/upstock_user/g, () => { replacements++; return 'shelves_user'; });
  content = content.replace(/upstock_customer_cart/g, () => { replacements++; return 'shelves_customer_cart'; });

  // UI text / alt / email domain
  content = content.replace(/UpStock Logo/g, () => { replacements++; return 'SHELVES Logo'; });
  content = content.replace(/UPSTOCK/g, () => { replacements++; return 'SHELVES'; });
  content = content.replace(/UpStock/g, () => { replacements++; return 'SHELVES'; });
  content = content.replace(/@upstock\.com/g, () => { replacements++; return '@shelves.com'; });

  if (content !== orig) {
    filesModified++;
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath.replace(__dirname, '')}`);
  }
}

function traverse(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) traverse(full);
    else if (/\.(tsx?|jsx?|css|json)$/.test(full)) processFile(full);
  }
}

traverse(srcDir);
console.log(`\nDone — ${filesModified} files updated, ${replacements} replacements.`);
