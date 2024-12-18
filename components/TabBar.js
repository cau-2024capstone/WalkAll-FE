import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import HistoryScreen from "../screens/HistoryScreen";
import RouteScreen from "../screens/RouteScreen";
import MyPageScreen from "../screens/MyPageScreen";
import rootStyles from "../styles/StyleGuide";

const Tab = createBottomTabNavigator(); // 하단 탭 선언

function BottomTabApp() {
  return (
    <Tab.Navigator
      initialRouteName="Route"
      screenOptions={{
        headerShown: false, // 상단 헤더 숨기기
        tabBarActiveTintColor: rootStyles.colors.green3, // 활성화된 탭 색상 설정
        tabBarInactiveTintColor: rootStyles.colors.grey2, // 비활성화된 탭 색상 (기본값)
      }}
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
        component={RouteScreen}
        options={{
          title: "경로생성",
          tabBarIcon: ({ color, size }) => (
            <Icon name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
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

export default BottomTabApp;
