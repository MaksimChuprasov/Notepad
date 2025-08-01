import React, { useEffect, useRef, useState } from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';


const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ isLoggedIn }) => {

  return (
    <Tab.Navigator
      initialRouteName={isLoggedIn ? "Home" : "Profile"}
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
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    };
    checkToken();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <NoteProvider>
          <MainTabNavigator isLoggedIn={isLoggedIn} />
        </NoteProvider>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
