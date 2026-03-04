const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REQUIRED_LIBS = ['libnspr4.so', 'libnss3.so', 'libnssutil3.so'];

function hasAllLibs(libDir) {
  return REQUIRED_LIBS.every((name) => fs.existsSync(path.join(libDir, name)));
}

function hasSystemLibs() {
  const systemDirs = ['/usr/lib/x86_64-linux-gnu', '/lib/x86_64-linux-gnu'];
  return systemDirs.some((dir) => hasAllLibs(dir));
}

function ensureFallbackLibs(repoRoot) {
  const fallbackLibDir = path.join(repoRoot, '.playwright-libs', 'root', 'usr', 'lib', 'x86_64-linux-gnu');
  if (hasAllLibs(fallbackLibDir)) {
    return;
  }

  const debDir = path.join(repoRoot, '.playwright-libs', 'debs');
  fs.mkdirSync(debDir, { recursive: true });
  fs.mkdirSync(path.dirname(fallbackLibDir), { recursive: true });

  execFileSync('apt', ['download', 'libnspr4', 'libnss3'], {
    cwd: debDir,
    stdio: 'inherit',
  });

  const debFiles = fs.readdirSync(debDir).filter((name) => name.endsWith('.deb'));
  for (const debFile of debFiles) {
    execFileSync('dpkg-deb', ['-x', debFile, '../root'], {
      cwd: debDir,
      stdio: 'inherit',
    });
  }

  if (!hasAllLibs(fallbackLibDir)) {
    throw new Error('Failed to provision fallback Playwright runtime libraries.');
  }
}

module.exports = async () => {
  if (process.platform !== 'linux') {
    return;
  }

  if (hasSystemLibs()) {
    return;
  }

  const repoRoot = path.resolve(__dirname, '../../..');
  ensureFallbackLibs(repoRoot);
};
