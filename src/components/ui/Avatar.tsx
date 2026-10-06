import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from '@/components/AppText';
import { accents, fonts, palette } from '@/theme';

const LIST = Object.values(accents);

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Círculo con gradiente estable derivado del nombre (entre los acentos) e iniciales. */
export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const h = hash(name);
  const a = LIST[h % LIST.length];
  const b = LIST[(h >> 3) % LIST.length] === a ? palette.violetDeep : LIST[(h >> 3) % LIST.length];
  return (
    <LinearGradient
      colors={[a, b]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AppText variant="subheading" style={{ color: palette.bg0, fontFamily: fonts.bold }}>
        {initials(name)}
      </AppText>
    </LinearGradient>
  );
}
