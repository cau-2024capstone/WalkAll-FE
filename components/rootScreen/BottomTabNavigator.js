// BottomTabNavigator.js

import React from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import StartPointSelection from "./StartPointSelection";
import WaypointSetting from "./WaypointSetting";

import DestinationSetting from "./DestinationSetting";
import RecommendedRoutes from "./RecommendedRoutes";
import NavigationScreen from "./NavigationScreen";
import { Icon } from "react-native-elements";

// 기타 탭의 컴포넌트 (예시)
function HistoryScreen() {
  return null;
}

function MyPage() {
  return null;
}

const Tab = createBottomTabNavigator();
const RouteStack = createStackNavigator();

// 경로 생성 스택 네비게이터
function RouteStackScreen() {
  return (
    <RouteStack.Navigator screenOptions={{ headerShown: false }}>
      <RouteStack.Screen
        name="StartPointSelection"
        component={StartPointSelection}
      />
      <RouteStack.Screen name="WaypointSetting" component={WaypointSetting} />
      <RouteStack.Screen
        name="DestinationSetting"
        component={DestinationSetting}
      />
      <RouteStack.Screen
        name="RecommendedRoutes"
        component={RecommendedRoutes}
      />
      <RouteStack.Screen name="NavigationScreen" component={NavigationScreen} />
    </RouteStack.Navigator>
  );
}

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Route"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "히스토리",
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Route"
        component={RouteStackScreen} // 변경된 부분
        options={{
          title: "경로생성",
          tabBarIcon: ({ color, size }) => (
            <Icon name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="My"
        component={MyPage}
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
