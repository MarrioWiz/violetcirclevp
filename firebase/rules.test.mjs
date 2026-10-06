// Pruebas de las reglas de Firestore con el emulador.
// Uso: npm run test:rules   (requiere Java; usa el JDK de Android Studio)
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';

import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-violetcirclevp',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'content/guia'), { title: 'Guía', kind: 'guide' });
    await setDoc(doc(db, 'directory/ok'), { name: '911', verified: true });
    await setDoc(doc(db, 'directory/pendiente'), { name: 'X', verified: false });
    await setDoc(doc(db, 'stats/s1'), { kind: 'otro', platform: 'otra', week: '2026-W41' });
  });
});

const anon = () => env.authenticatedContext('anon-uid', { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const nobody = () => env.unauthenticatedContext().firestore();
const team = () => env.authenticatedContext('team', { email: 'marioimanol02@gmail.com', email_verified: true }).firestore();
const stranger = () => env.authenticatedContext('x', { email: 'otra@example.com', email_verified: true }).firestore();
const valid = { kind: 'ciberacoso', platform: 'instagram', week: '2026-W41' };

describe('contenido y configuración', () => {
  it('sin sesión no se puede leer', () => assertFails(getDoc(doc(nobody(), 'content/guia'))));
  it('con sesión anónima sí se lee', () => assertSucceeds(getDoc(doc(anon(), 'content/guia'))));
  it('nadie puede escribir contenido', () => assertFails(setDoc(doc(anon(), 'content/hack'), { x: 1 })));
});

describe('directorio', () => {
  it('se lee lo verificado', () => assertSucceeds(getDoc(doc(anon(), 'directory/ok'))));
  it('no se lee lo no verificado', () => assertFails(getDoc(doc(anon(), 'directory/pendiente'))));
  it('la consulta debe filtrar verified == true', async () => {
    await assertSucceeds(getDocs(query(collection(anon(), 'directory'), where('verified', '==', true))));
    await assertFails(getDocs(collection(anon(), 'directory')));
  });
});

describe('estadísticas anónimas', () => {
  it('se puede crear con el esquema exacto', () => assertSucceeds(addDoc(collection(anon(), 'stats'), valid)));
  it('sin sesión no se puede crear', () => assertFails(addDoc(collection(nobody(), 'stats'), valid)));
  it('rechaza campos extra (p. ej. uid)', () => assertFails(addDoc(collection(anon(), 'stats'), { ...valid, uid: 'x' })));
  it('rechaza campos faltantes', () => assertFails(addDoc(collection(anon(), 'stats'), { kind: 'otro', platform: 'otra' })));
  it('rechaza tipos o plataformas fuera de catálogo', async () => {
    await assertFails(addDoc(collection(anon(), 'stats'), { ...valid, kind: 'nombre-real' }));
    await assertFails(addDoc(collection(anon(), 'stats'), { ...valid, platform: 'telegram' }));
  });
  it('rechaza fechas exactas en lugar de semana ISO', () =>
    assertFails(addDoc(collection(anon(), 'stats'), { ...valid, week: '2026-10-05' })));
  it('la app no puede leerlas', () => assertFails(getDocs(collection(anon(), 'stats'))));
  it('el equipo autorizado sí puede leerlas (panel)', () => assertSucceeds(getDocs(collection(team(), 'stats'))));
  it('otra cuenta de Google no puede leerlas', () => assertFails(getDocs(collection(stranger(), 'stats'))));
  it('nadie puede editarlas', () => assertFails(setDoc(doc(team(), 'stats/s1'), valid)));
});

describe('todo lo demás', () => {
  it('colecciones no declaradas están denegadas', () => assertFails(setDoc(doc(anon(), 'incidents/x'), { a: 1 })));
});
