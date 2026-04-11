const fs = require('fs');
const path = require('path');

const dirsToMigrate = [
  path.join(__dirname, 'client', 'src', 'pages', 'admin'),
  path.join(__dirname, 'client', 'src', 'pages', 'staff'),
  path.join(__dirname, 'client', 'src', 'pages', 'delivery')
];

function migrateTheme(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.jsx')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Cards
      content = content.replace(/className="card-dark"/g, 'className="card"');
      // Subdued cards or sections with background
      content = content.replace(/background: 'rgba\(255,255,255,0\.0[3-9]\)'/g, "background: 'var(--white)'");
      content = content.replace(/background: 'rgba\(255,255,255,0\.1\)'/g, "background: 'var(--grey-50)'");
      // Borders
      content = content.replace(/border: '1px solid rgba\(255,255,255,0\.[0-9]+\)'/g, "border: '1px solid var(--grey-100)'");
      content = content.replace(/borderBottom: '1px solid rgba\(255,255,255,0\.[0-9]+\)'/g, "borderBottom: '1px solid var(--grey-100)'");
      // Text
      content = content.replace(/color: 'var\(--white\)'/g, "color: 'var(--text-primary)'");
      content = content.replace(/color: 'rgba\(255,255,255,0\.[0-9]+\)'/g, "color: 'var(--text-secondary)'");
      // Inputs
      content = content.replace(/className="dark-input"/g, 'className="form-input"');
      content = content.replace(/className='dark-input'/g, "className='form-input'");
      // Modals
      content = content.replace(/className="modal-dark"/g, 'className="modal"');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Migrated', filePath);
    }
  }
}

dirsToMigrate.forEach(migrateTheme);
console.log('Done migrating portal UI to light theme!');
