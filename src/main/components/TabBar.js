import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HistoryScreen from '../screens/HistoryScreen';
import RouteScreen from './TMapView'
import styles from "../styles/StyleGuide";

const Tab = createBottomTabNavigator(); // 하단 탭 선언

// Page 별 함수 생성

function MyPage() {
    return null;
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
                component={RouteScreen}
                options={{
                    title: '경로생성',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="map" color={color} size={size} />
                    ),
                    headerShown: false, // 상단 제목 숨기기
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
