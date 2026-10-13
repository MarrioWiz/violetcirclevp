import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HAIRLINE, MIN_TOUCH, alpha, palette, radius, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';
import { IconBadge } from './IconBadge';

export interface SheetAction {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  header?: ReactNode;
  actions: SheetAction[];
}

/** Hoja inferior de vidrio con acciones (igual en Android y web). */
export function ActionSheet({ visible, onClose, header, actions }: Props) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Cerrar" accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: bottom + spacing.lg }]} accessibilityViewIsModal>
        <View style={styles.grip} />
        {header ? <View style={{ marginBottom: spacing.md }}>{header}</View> : null}
        {actions.map((a) => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            onPress={() => {
              onClose();
              a.onPress();
            }}
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
          >
            <IconBadge icon={a.icon} size={40} tone={a.destructive ? 'danger' : 'accent'} />
            <AppText variant="bodyStrong" style={{ color: a.destructive ? colors.danger : colors.text }}>
              {a.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: alpha(palette.black, 0.55) },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: palette.bg2,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: HAIRLINE,
    borderColor: palette.strokeStrong,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  grip: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.strokeStrong,
    marginBottom: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: MIN_TOUCH + 8 },
});
