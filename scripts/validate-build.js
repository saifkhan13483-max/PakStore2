import fs from 'fs';
import path from 'path';

/**
 * Basic build validation script to run after 'npm run build'
 */

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const REQUIRED_FILES = ['index.html', 'assets'];

console.log('--- Starting Build Validation ---');

if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Build directory "dist" not found!');
  process.exit(1);
}

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    process.exit(1);
  }
});

// Check if any JS/CSS files exist in assets
const assetsDir = path.join(DIST_DIR, 'assets');
const assets = fs.readdirSync(assetsDir);
if (assets.length > 0) {
  console.log(`✅ Assets folder populated (${assets.length} files)`);
} else {
  console.error('❌ Assets folder is empty!');
  process.exit(1);
}

console.log('--- Build Validation Successful ---');
