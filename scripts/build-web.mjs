// Genera la versión web (PWA) en dist/ y agrega el panel de estadísticas en dist/panel/.
// Uso: npm run build:web     (luego: firebase deploy --only hosting)
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.startsWith('EXPO_PUBLIC_FIREBASE_'))
    .map((l) => l.split('=').map((s) => s.trim())),
);
const config = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
if (!config.apiKey) throw new Error('Falta .env con la configuración de Firebase.');

execSync('npx expo export -p web', { stdio: 'inherit' });
mkdirSync('dist/panel', { recursive: true });
const html = readFileSync('panel/index.html', 'utf8').replace('__FIREBASE_CONFIG__', JSON.stringify(config));
writeFileSync('dist/panel/index.html', html);
console.log('Panel listo en dist/panel/index.html');
