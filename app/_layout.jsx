import React, { useEffect, useRef, useState } from "react";
import { Platform } from 'react-native';
import * as Notifications from "expo-notifications";
import { registerForPushNotifications } from "../hooks/registerForPushNotifications";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "../components/CustomTabBar";
import HomeView from "../views/HomeView";
import SocialView from "../views/SocialView";
import NoteView from "../views/NoteView";
import ProfileView from "../views/ProfileView";
import { NoteProvider } from "./NoteContext";
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }, []);

  useEffect(() => {
    // Get push-token
    registerForPushNotifications().then(token => {
      setExpoPushToken(token ?? null);
      if (token) {
        sendPushNotification(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      await Notifications.presentNotificationAsync({
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        sound: 'default',
        android: {
          channelId: 'default',
        },
        trigger: null
      });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  function sendPushNotification(token) {
    if (!token) {
      console.warn('No push token, push not sent');
      return;
    }

    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: 'Hello!',
        body: 'Test',
        priority: 'high',
        channelId: 'default',
        data: { someData: 'goes here' },
      }),
    })
      .then(res => res.json())
      .catch(err => console.error('Error sending push:', err));
  }

  return (
    <Tab.Navigator
      initialRouteName="Profile"
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        options={{ headerShown: false }}
        name="Home"
        component={HomeView}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name="Social"
        component={SocialView}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name="Note"
        component={NoteView}
      />
      <Tab.Screen
        options={{ headerShown: false }}
        name="Profile"
        component={ProfileView}
      />
    </Tab.Navigator>
  );
};

export default function RootLayout() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <NoteProvider>
          <MainTabNavigator />
        </NoteProvider>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
