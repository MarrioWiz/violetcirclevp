import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Notificaciones discretas: título genérico, sin revelar la app ni el tema.
const DISCREET = { title: 'Recordatorio', body: 'Tómate un momento para ti hoy.' };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const res = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: false, allowBadge: false },
  });
  return res.granted;
}

/** Recordatorio semanal de autocuidado (local, nunca push remoto). */
export async function scheduleSelfCareReminder(): Promise<boolean> {
  if (!(await requestNotificationPermission())) return false;
  await cancelAllReminders();
  await Notifications.scheduleNotificationAsync({
    content: { title: DISCREET.title, body: DISCREET.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // domingo
      hour: 18,
      minute: 0,
    },
  });
  return true;
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => undefined);
}
