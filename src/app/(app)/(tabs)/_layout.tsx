import { Tabs } from 'expo-router';

import { Dock } from '@/components/dock/Dock';
import { TAB_META } from '@/components/dock/tabs';
import { palette } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <Dock {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: palette.bg0 } }}
    >
      {TAB_META.map((t) => (
        <Tabs.Screen key={t.route} name={t.route} options={{ title: t.label, tabBarAccessibilityLabel: t.a11y }} />
      ))}
    </Tabs>
  );
}
