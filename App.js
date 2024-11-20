import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import BottomTabApp from "./src/main/components/TabBar.js";
import LoginScreen from "./src/main/screens/LoginScreen.js";
import SignupScreen from "./src/main/screens/SignupScreen.js";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

const App = () => {
  const [fontsLoaded, error] = useFonts({
    "NotoSansKR-Regular": require("./src/main/assets/fonts/NotoSansKR-Regular.ttf"),
    "NotoSansKR-Medium": require("./src/main/assets/fonts/NotoSansKR-Medium.ttf"),
    "NotoSansKR-Bold": require("./src/main/assets/fonts/NotoSansKR-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="BottomTabApp" component={BottomTabApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
