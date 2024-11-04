import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator(); // 하단 탭 선언

// Page 별 함수 생성
function RoutePage() {
    return null;
}

function HistoryPage() {
    return null;
}

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
                component={HistoryPage}
                options={{
                    title: '히스토리',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="history" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Route"
                component={RoutePage}
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
