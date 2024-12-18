// App.js

import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect } from "react";
// import * as SplashScreen from "expo-splash-screen";
//import { useFonts } from "expo-font";
import LoginScreen from "./screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserContextProvider from "./store/context/userContext";
import BottomTabApp from "./components/TabBar";
import SignupScreen from "./screens/SignupScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  // const [fontsLoaded, error] = useFonts({
  //   "NotoSansKR-Regular": require("./assets/fonts/NotoSansKR-Regular.ttf"),
  //   "NotoSansKR-Medium": require("./assets/fonts/NotoSansKR-Medium.ttf"),
  //   "NotoSansKR-Bold": require("./assets/fonts/NotoSansKR-Bold.ttf"),
  // });

  // useEffect(() => {
  //   // 컴포넌트 마운트 시 SplashScreen.preventAutoHideAsync 호출
  //   async function prepare() {
  //     await SplashScreen.preventAutoHideAsync();
  //   }
  //   prepare();
  // }, []);

  // useEffect(() => {
  //   if (error) {
  //     console.error("폰트 로딩 에러:", error);
  //   }
  //   if (fontsLoaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded, error]);

  return (
    <UserContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LoginScreen"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
          <Stack.Screen name="BottomTabApp" component={BottomTabApp} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
};

export default App;
