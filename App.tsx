import 'react-native-reanimated'; 
import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Linking from "expo-linking";
import Gallery from './src/screens/gallery';
import Viewer from './src/screens/viewer';
import SettingsScreen from './src/screens/settings';
import { ThemeProvider, useTheme } from './src/utils/ThemeProvider';
import { Provider } from 'react-redux';
import store from './src/store';
import Favorites from './src/screens/favorites';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator >
      <Drawer.Screen name="Gallery" component={Gallery} />
      <Drawer.Screen name='Favorites' component={Favorites}/>
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const prefix = Linking.createURL("/");
const linking = {
  prefixes: [prefix, "myapp://"],
  config: {
    screens: {
      Main: {
        screens: {
          Home: {
            screens: {
              Gallery: "event/:eventId",
              Profile: "profile",
            },
          },
          Settings: "settings",
        },
      },
      Viewer: "event/:eventId/image/:id",
    },
  },
};

function AppContainer() {
  const { isDark, isConnected } = useTheme();

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme} linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen name="Viewer" component={Viewer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
    <ThemeProvider>
      <AppContainer />
    </ThemeProvider>
    </Provider>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'red',
    padding: 8,
  },
  offlineText: {
    color: 'white',
    textAlign: 'center',
  },
});
