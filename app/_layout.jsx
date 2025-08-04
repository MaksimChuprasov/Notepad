import i18n, { initI18n } from '../src/i18n';
import React, { useEffect, useContext, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "../components/CustomTabBar";
import HomeView from "../views/HomeView";
import SocialView from "../views/SocialView";
import NoteView from "../views/NoteView";
import ProfileView from "../views/ProfileView";
import NoteContext, { NoteProvider } from "./NoteContext";
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigationContainerRef,
} from "@react-navigation/native";

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
  const navigationRef = useNavigationContainerRef();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await initI18n(); // инициализация
      setIsReady(true);
    }
    prepare();
  }, []);

  return (
    <NoteProvider>
      <NavigationIndependentTree>
        <NavigationContainer ref={navigationRef}>
          <AppWithAuth navigationRef={navigationRef} />
        </NavigationContainer>
      </NavigationIndependentTree>
    </NoteProvider>
  );
}