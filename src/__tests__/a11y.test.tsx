import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/components/Button';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { CheckRow, ToggleRow } from '@/components/Rows';
import { S } from '@/lib/strings.es';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

describe('accesibilidad de componentes', () => {
  it('Button expone rol, etiqueta y estado deshabilitado', async () => {
    const onPress = jest.fn();
    await render(<Button label="Guardar" onPress={onPress} disabled />);
    const btn = screen.getByRole('button', { name: 'Guardar' });
    expect(btn).toBeDisabled();
    await fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('CheckRow es un checkbox con estado', async () => {
    const onToggle = jest.fn();
    await render(<CheckRow label="Guardar capturas" checked onToggle={onToggle} />);
    const box = screen.getByRole('checkbox', { name: 'Guardar capturas' });
    expect(box).toBeChecked();
    await fireEvent.press(box);
    expect(onToggle).toHaveBeenCalled();
  });

  it('ToggleRow tiene un switch etiquetado', async () => {
    await render(<ToggleRow title="Ocultar vista previa" value onChange={() => undefined} />);
    expect(screen.getByRole('switch', { name: 'Ocultar vista previa' })).toBeTruthy();
  });

  it('la franja de emergencia es un botón con el texto del 911', async () => {
    await render(<EmergencyBanner />);
    expect(screen.getByRole('button', { name: S.emergency.banner })).toBeTruthy();
  });
});
