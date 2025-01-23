import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CustomTabBar from "../components/CustomTabBar";
import HomeView from "../views/HomeView";
import SocialView from "../views/SocialView";
import LogIn from "../views/LogIn";
import NoteView from "../views/NoteView";
import ProfileView from "../views/ProfileView";
import { NoteProvider } from "./NoteContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
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
        name="LogIn"
        component={LogIn}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer independent>
        <NoteProvider>
          <MainTabNavigator />
        </NoteProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
