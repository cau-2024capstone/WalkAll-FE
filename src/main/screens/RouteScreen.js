import React from "react";
import { StyleSheet } from "react-native";
import rootStyles from "../styles/StyleGuide";
import { createStackNavigator } from "@react-navigation/stack";
import StartPointSelection from "../components/routeScreen/StartPointSelection";
import RecommendedRoutes from "../components/routeScreen/RecommendedRoutes";
import NavigationScreen from "../components/routeScreen/NavigationScreen";
import UserInput from "../components/routeScreen/UserInput";
import LoadingModal from "../components/routeScreen/LoadingModal";

const Stack = createStackNavigator();

function RouteStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="StartPointSelection"
        component={StartPointSelection}
      />
      <Stack.Screen name="UserInput" component={UserInput} />
      <Stack.Screen
        name="LoadingModal"
        component={LoadingModal}
        options={{ headerShown: false }} // 헤더를 숨기고 싶을 경우
      />
      <Stack.Screen name="RecommendedRoutes" component={RecommendedRoutes} />
      <Stack.Screen name="NavigationScreen" component={NavigationScreen} />
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
