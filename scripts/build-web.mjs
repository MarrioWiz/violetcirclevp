// Genera la versión web (PWA) en dist/ y agrega el panel de estadísticas en dist/panel/.
// Uso: npm run build:web     (luego: firebase deploy --only hosting)
import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

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
// PWA instalable (iPhone: Compartir → "Agregar a pantalla de inicio" la abre a pantalla completa).
copyFileSync('assets/images/icon.png', 'dist/icon-1024.png');
writeFileSync(
  'dist/manifest.json',
  JSON.stringify(
    {
      name: 'VioletCircleVP',
      short_name: 'VioletCircle',
      lang: 'es-MX',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#08050F',
      theme_color: '#08050F',
      icons: [{ src: '/icon-1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' }],
    },
    null,
    2,
  ),
);
const pwaHead = [
  '<link rel="manifest" href="/manifest.json"/>',
  '<link rel="apple-touch-icon" href="/icon-1024.png"/>',
  '<meta name="apple-mobile-web-app-capable" content="yes"/>',
  '<meta name="mobile-web-app-capable" content="yes"/>',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black"/>',
  '<meta name="apple-mobile-web-app-title" content="VioletCircle"/>',
].join('');
const indexHtml = readFileSync('dist/index.html', 'utf8')
  // viewport-fit=cover: las zonas seguras (barrita de inicio del iPhone) llegan a la app.
  .replace('shrink-to-fit=no"', 'shrink-to-fit=no, viewport-fit=cover"')
  .replace('content="#6D28D9"', 'content="#08050F"')
  .replace('</head>', `${pwaHead}</head>`);
writeFileSync('dist/index.html', indexHtml);

mkdirSync('dist/panel', { recursive: true });
const html = readFileSync('panel/index.html', 'utf8').replace('__FIREBASE_CONFIG__', JSON.stringify(config));
writeFileSync('dist/panel/index.html', html);
console.log('Panel listo en dist/panel/index.html');
