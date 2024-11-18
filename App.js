import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import LoginScreen from "./src/main/screens/LoginScreen";
import BottomTabApp from "./src/main/components/TabBar";

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
