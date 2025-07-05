import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  console.log('👉 Запущен registerForPushNotifications');

  if (!Device.isDevice) {
    console.log('⛔ Это не физическое устройство');
    alert('Push-уведомления работают только на физическом устройстве');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('🔍 Текущее разрешение:', existingStatus);

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log('📋 Запрошено разрешение, результат:', finalStatus);
  }

  if (finalStatus !== 'granted') {
    console.log('⛔ Разрешение НЕ выдано');
    alert('Разрешение на уведомления не получено');
    return;
  }

  let token;
  try {
    console.log('Попытка получить push-токен...');
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    console.log('Ответ getExpoPushTokenAsync:', tokenResponse);
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
