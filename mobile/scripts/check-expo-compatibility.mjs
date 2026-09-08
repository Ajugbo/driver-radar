import { readFile } from 'node:fs/promises';
import process from 'node:process';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const expoRange = packageJson.dependencies?.expo ?? '';
const sdkMajor = Number(expoRange.match(/\d+/)?.[0]);
const requiredNode = [20, 19, 4];
const nodeVersion = process.versions.node.split('.').map(Number);
const nodeIsSupported = nodeVersion[0] > requiredNode[0]
  || (nodeVersion[0] === requiredNode[0] && nodeVersion[1] > requiredNode[1])
  || (nodeVersion[0] === requiredNode[0] && nodeVersion[1] === requiredNode[1] && nodeVersion[2] >= requiredNode[2]);

if (!Number.isInteger(sdkMajor)) {
  console.error('Unable to determine the Expo SDK from mobile/package.json.');
  process.exit(1);
}

if (!nodeIsSupported) {
  console.error(`Expo SDK ${sdkMajor} requires Node.js >= 20.19.4; found ${process.versions.node}.`);
  process.exit(1);
}

console.log(`Expo SDK ${sdkMajor} detected. Use Expo Go SDK ${sdkMajor} or a matching development build.`);
