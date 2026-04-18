/**
 * Builds the React frontend (1.MYCHATBOT FrontEnd) and copies its dist/ into
 * this backend's public/ folder so https://www.mychatbot.website serves the React app.
 * Run from backend folder: node scripts/copy-frontend.js
 * Or: npm run copy-frontend
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const backendDir = path.resolve(__dirname, '..');
const frontendDir = path.resolve(backendDir, '..', '1.MYCHATBOT FrontEnd');
const publicDir = path.join(backendDir, 'public');
const distDir = path.join(frontendDir, 'dist');

if (!fs.existsSync(frontendDir)) {
  console.error('Frontend folder not found:', frontendDir);
  process.exit(1);
}

console.log('Building frontend...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

if (!fs.existsSync(distDir)) {
  console.error('Frontend build output not found:', distDir);
  process.exit(1);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clear existing public content (keep dir)
for (const name of fs.readdirSync(publicDir)) {
  const p = path.join(publicDir, name);
  if (fs.statSync(p).isDirectory()) {
    fs.rmSync(p, { recursive: true });
  } else {
    fs.unlinkSync(p);
  }
}

console.log('Copying dist to public...');
for (const name of fs.readdirSync(distDir)) {
  copyRecursive(path.join(distDir, name), path.join(publicDir, name));
}

console.log('Done. Restart the backend (node index.js) if it is running.');
