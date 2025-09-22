import React, { useEffect, useContext, useRef, useState } from "react";
import i18n, { initI18n } from '../src/i18n';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "../components/CustomTabBar";
import HomeView from "../views/HomeView";
import SocialView from "../views/SocialView";
import NoteView from "../views/NoteView";
import ProfileView from "../views/ProfileView";
import NoteContext, { NoteProvider } from "./NoteContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from './navigationRef'; 
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigationContainerRef,
} from "@react-navigation/native";

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://00f2d18e1c2e1b722328d8cf9f6f4e6c@o4510046247321600.ingest.de.sentry.io/4510046479450192',
  tracesSampleRate: 1.0,
});

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeView} options={{ headerShown: false }} />
      <Tab.Screen name="Social" component={SocialView} options={{ headerShown: false }} />
      <Tab.Screen name="Note" component={NoteView} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileView} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const AppWithAuth = ({ navigationRef }) => {
  const { isLoggedIn } = useContext(NoteContext);

  useEffect(() => {
    if (isLoggedIn === true) {
      navigationRef.current?.navigate("Home");
    } else if (isLoggedIn === false) {
      navigationRef.current?.navigate("Profile");
    }
  }, [isLoggedIn]);

  if (isLoggedIn === null) return null;

  return <MainTabNavigator />;
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await initI18n();
      setIsReady(true);
    }
    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NoteProvider>
        <NavigationIndependentTree>
          <NavigationContainer ref={navigationRef}>
            <AppWithAuth navigationRef={navigationRef} />
          </NavigationContainer>
        </NavigationIndependentTree>
      </NoteProvider>
    </GestureHandlerRootView>
  );
}