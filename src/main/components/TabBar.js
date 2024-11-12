import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HistoryScreen from '../screens/HistoryScreen';
import { createStackNavigator } from "@react-navigation/stack";
import StartPointSelection from "../components/routeScreen/StartPointSelection";
import WaypointSetting from "../components/routeScreen/WaypointSetting";

import DestinationSetting from "../components/routeScreen/DestinationSetting";
import RecommendedRoutes from "../components/routeScreen/RecommendedRoutes";
import NavigationScreen from "../components/routeScreen/NavigationScreen";
import rootStyles from "../styles/StyleGuide";

const Tab = createBottomTabNavigator(); // 하단 탭 선언

// Page 별 함수 생성

function MyPage() {
    return null;
}

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

// 하단 탭 네비게이터 컴포넌트 (순서 : 히스토리 -> 경로생성 -> 마이페이지)
function BottomTabApp() {
    return (
        <Tab.Navigator initialRouteName="Route"
            screenOptions={{ headerShown: false }} // 상단 헤더 숨기기
        >

            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    title: '히스토리',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="history" color={color} size={size} />
                    ),
                    headerShown: false, // 상단 제목 숨기기
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
                    title: '마이페이지',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="person" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}


export default BottomTabApp;
