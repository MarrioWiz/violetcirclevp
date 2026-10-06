import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MIN_TOUCH, spacing, useTheme } from '@/theme';

import { AppText } from './AppText';
import { QuickExitButton } from './QuickExitButton';

interface Props {
  title?: string;
  subtitle?: string;
  /** 'back' = flecha, 'close' = X (modales), false = sin botón. */
  nav?: 'back' | 'close' | false;
  quickExit?: boolean;
  scroll?: boolean;
  footer?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  edges?: Edge[];
  largeTitle?: boolean;
}

export function Screen({
  title,
  subtitle,
  nav = false,
  quickExit = true,
  scroll = true,
  footer,
  headerRight,
  children,
  edges = ['top'],
  largeTitle = true,
}: Props) {
  const { colors } = useTheme();
  const NavIcon = nav === 'close' ? X : ChevronLeft;

  const header = (
    <View style={styles.topBar}>
      {nav ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={nav === 'close' ? 'Cerrar' : 'Regresar'}
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.7 : 1 }]}
        >
          <NavIcon size={22} color={colors.text} strokeWidth={2} />
        </Pressable>
      ) : (
        <View />
      )}
      <View style={styles.right}>
        {headerRight}
        {quickExit && <QuickExitButton />}
      </View>
    </View>
  );

  const titleBlock = title ? (
    <View style={styles.titleBlock}>
      <AppText variant={largeTitle ? 'title' : 'heading'} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText tone="textMuted" style={{ marginTop: spacing.xs }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  ) : null;

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {titleBlock}
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.contentStatic]}>
            {titleBlock}
            {children}
          </View>
        )}
        {footer ? (
          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>{footer}</View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    minHeight: MIN_TOUCH + 8,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navBtn: {
    width: MIN_TOUCH - 4,
    height: MIN_TOUCH - 4,
    borderRadius: (MIN_TOUCH - 4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { marginBottom: spacing.xl },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxxl * 1.5 },
  contentStatic: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
});
