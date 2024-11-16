import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import BottomTabApp from "./src/main/components/TabBar.js";

SplashScreen.preventAutoHideAsync();

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
      <BottomTabApp />
    </NavigationContainer>
  );
};

export default App;
