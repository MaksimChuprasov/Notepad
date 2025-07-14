import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {

  if (!Device.isDevice) {
    alert('Push-уведомления работают только на физическом устройстве');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Разрешение на уведомления не получено');
    return;
  }

  let token;
  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    token = tokenResponse.data;
  } catch (e) {
    console.error('Ошибка при getExpoPushTokenAsync:', e);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
