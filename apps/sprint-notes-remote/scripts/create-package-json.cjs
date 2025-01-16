const {
  createProjectGraphAsync,
  readCachedProjectGraph,
  detectPackageManager,
  writeJsonFile,
} = require('@nx/devkit');
const {
  createLockFile,
  createPackageJson,
  getLockFileName,
} = require('@nx/js');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

async function main() {
  const outputDir = 'dist';
  // Detect the package manager you are using (npm, yarn, pnpm)
  const pm = detectPackageManager();
  let projectGraph = readCachedProjectGraph();
  if (!projectGraph) {
    projectGraph = await createProjectGraphAsync();
  }

  const projectName = process.env.NX_TASK_TARGET_PROJECT;
  const packageJson = createPackageJson(projectName, projectGraph, {
    isProduction: true, // Used to strip any non-prod dependencies
    root: resolve(__dirname, '..'), // The root of the workspace
  });

  const lockFile = createLockFile(
    packageJson,
    projectGraph,
    detectPackageManager()
  );

  const lockFileName = getLockFileName(pm);

  writeJsonFile(`${outputDir}/package.json`, packageJson);
  writeFileSync(`${outputDir}/${lockFileName}`, lockFile, {
    encoding: 'utf8',
  });
}

main();
