const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  // 1. Run graphify's native hooks
  try {
    execSync('graphify hook install', { stdio: 'inherit' });
  } catch (e) {
    console.log('[graphify] Native hook installation skipped or failed.');
  }

  // 2. Install our custom pre-commit hook
  const gitDir = execSync('git rev-parse --git-dir').toString().trim();
  const hooksDir = path.join(gitDir, 'hooks');
  const srcPreCommit = path.join(__dirname, 'pre-commit');
  const destPreCommit = path.join(hooksDir, 'pre-commit');

  if (fs.existsSync(srcPreCommit)) {
    fs.copyFileSync(srcPreCommit, destPreCommit);
    try {
      fs.chmodSync(destPreCommit, '755');
    } catch (e) {
      // chmod might fail on raw Windows systems but works in Git Bash/WSL
    }
    console.log(`[graphify] Installed custom pre-commit hook to ${destPreCommit}`);
  }
} catch (err) {
  console.log('[graphify] Hook installation failed:', err.message);
}
