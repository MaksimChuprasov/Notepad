import React from "react";
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
  return (
    <Tab.Navigator initialRouteName="Profile"  tabBar={(props) => <CustomTabBar {...props} />}>
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
