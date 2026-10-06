// Sube el contenido de assets/content/ a Firestore con el Admin SDK.
//
// Uso (desde la raíz del proyecto):
//   1. Consola de Firebase → ⚙️ Configuración → Cuentas de servicio → Generar nueva clave privada.
//      Guarda el archivo como firebase/seed/service-account.json (está en .gitignore; NUNCA lo subas a git).
//   2. npm install --no-save firebase-admin
//   3. node firebase/seed/seed.mjs            (sube guías, artículos, directorio y config)
//      node firebase/seed/seed.mjs --dry-run  (solo muestra lo que subiría)
//
// Reglas de seguridad del contenido:
//   - El directorio se sube tal cual, incluidos los "verified: false": las reglas de Firestore
//     y la app impiden que se lean. Al verificar una entrada, cámbiala en el JSON y vuelve a correr.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const dryRun = process.argv.includes('--dry-run');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const guides = read('assets/content/guides.json').guides;
const articles = read('assets/content/articles.json').articles;
const directory = read('assets/content/directory.json').entries;

const writes = [
  ...guides.map((g) => ['content', g.slug, { ...g, kind: 'guide', updatedAt: new Date().toISOString(), version: 1 }]),
  ...articles.map((a) => ['content', a.slug, { ...a, kind: 'article', updatedAt: new Date().toISOString(), version: 1 }]),
  ...directory.map((d) => ['directory', d.id, d]),
  ['config', 'app', { minVersion: '1.0.0', disclaimerVersion: 1, emergencyNumber: '911' }],
];

if (dryRun) {
  for (const [col, id, data] of writes) console.log(`${col}/${id}`, data.verified === false ? '(no verificado: oculto)' : '');
  console.log(`\n${writes.length} documentos (simulación, no se escribió nada).`);
  process.exit(0);
}

const { initializeApp, cert } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
initializeApp({ credential: cert(read('firebase/seed/service-account.json')) });
const db = getFirestore();
const batch = db.batch();
for (const [col, id, data] of writes) batch.set(db.collection(col).doc(id), data);
await batch.commit();
console.log(`Listo: ${writes.length} documentos escritos.`);
