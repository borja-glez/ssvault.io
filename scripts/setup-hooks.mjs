import { chmod, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(rootDir, '..');
const sourceDir = path.join(projectDir, '.githooks');
const targetDir = path.join(projectDir, '.git', 'hooks');
const hookNames = ['pre-commit', 'commit-msg'];

async function installHooks() {
  await mkdir(targetDir, { recursive: true });

  for (const hookName of hookNames) {
    const source = path.join(sourceDir, hookName);
    const target = path.join(targetDir, hookName);

    await copyFile(source, target);
    await chmod(target, 0o755);
  }

  console.log(`Installed git hooks into ${targetDir}`);
}

installHooks().catch((error) => {
  console.error('Failed to install git hooks.', error);
  process.exitCode = 1;
});
