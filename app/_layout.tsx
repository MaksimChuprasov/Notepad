import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeView from "../views/HomeView.jsx";
import NoteView from "../views/NoteView.jsx";

const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <NavigationContainer independent>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeView}
          options={{
            title: 'NotePad',
            headerTitleStyle: {
              color: '#696969', // Цвет заголовка
              fontSize: 24, // Размер шрифта
              fontWeight: 'bold', // Жирный шрифт
            },
            headerStyle: {
              backgroundColor: '#FFFFFF', // Цвет фона заголовка
            },
            headerShown: false, // Скрыть заголовок
          }}
        />
        <Stack.Screen
          name="Note"
          component={NoteView}
          options={{
            title: 'New Note',
            headerTitleStyle: {
              color: '#696969', // Цвет заголовка
              fontSize: 24, // Размер шрифта
              fontWeight: 'bold', // Жирный шрифт
            },
            headerStyle: {
              backgroundColor: '#FFFFFF', // Цвет фона заголовка
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
