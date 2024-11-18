import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import BottomTabApp from "./src/main/components/TabBar.js";

const Stack = createStackNavigator();

const App = () => {
  const [fontsLoaded, error] = useFonts({
    "NotoSansKR-Regular": require("./src/main/assets/fonts/NotoSansKR-Regular.ttf"),
    "NotoSansKR-Medium": require("./src/main/assets/fonts/NotoSansKR-Medium.ttf"),
    "NotoSansKR-Bold": require("./src/main/assets/fonts/NotoSansKR-Bold.ttf"),
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync(); // SplashScreen 초기화

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    } else if (error) {
      console.error("Font loading error: ", error);
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainApp" component={BottomTabApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
