import fs from 'fs';
import path from 'path';

const srcDir = 'dist';
const destDir = 'docs';
const buildDir = 'build';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log(`Copying ${srcDir} to ${destDir}...`);
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
copyRecursiveSync(srcDir, destDir);

// Copy README.md to docs
if (fs.existsSync('README.md')) {
  fs.copyFileSync('README.md', path.join(destDir, 'README.md'));
}

console.log(`Copying ${srcDir} to ${buildDir}...`);
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
}
copyRecursiveSync(srcDir, buildDir);

// Copy README.md to build
if (fs.existsSync('README.md')) {
  fs.copyFileSync('README.md', path.join(buildDir, 'README.md'));
}

console.log('Done!');
