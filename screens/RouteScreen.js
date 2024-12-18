import React from "react";
import { StyleSheet } from "react-native";
import rootStyles from "../styles/StyleGuide";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PingSelection from "../components/routeScreen/PingSelection";
import RecommendedRoutes from "../components/routeScreen/RecommendedRoutes";
import NavigationScreen from "../components/navigationScreen/NavigationScreen";
import UserInput from "../components/routeScreen/UserInput";
import LoadingModal from "../components/routeScreen/LoadingModal";
import ResultScreen from "../components/routeScreen/ResultScreen";

const Stack = createNativeStackNavigator();

function RouteStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="PingSelection"
    >
      <Stack.Screen name="PingSelection" component={PingSelection} />
      <Stack.Screen name="UserInput" component={UserInput} />
      <Stack.Screen
        name="LoadingModal"
        component={LoadingModal}
        options={{ headerShown: false }} // 헤더를 숨기고 싶을 경우
      />
      <Stack.Screen name="RecommendedRoutes" component={RecommendedRoutes} />
      <Stack.Screen name="NavigationScreen" component={NavigationScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
    </Stack.Navigator>
  );
}

function RouteScreen() {
  return <RouteStack />;
}

export default RouteScreen;

const localStyles = StyleSheet.create({
  container: {
    height: 730,
    top: 36,
    width: 382,
    position: "relative",
    flexShrink: 0,
    backgroundColor: rootStyles.colors.white,
    flexDirection: "column",
    alignItems: "flex-start",
  },
});
