import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import rootStyles from "../styles/StyleGuide";
import RouteHistoryScreen from "./RouteHistoryScreen";
import InquireHistoryScreen from "./InquireHistoryScreen";

const Tab = createMaterialTopTabNavigator();

function HistoryScreen() {
  const [filters, setFilters] = useState({});
  return (
    <View style={localStyles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "white", // 탭 배경 색
            paddingTop: 30,
          },
          tabBarIndicatorStyle: {
            backgroundColor: rootStyles.colors.green5, // 탭 아래 강조선 색
          },
        }}
      >
        <Tab.Screen name="RouteHistory" options={{ title: "경로 기록" }}>
          {() => <RouteHistoryScreen filters={filters} />}
        </Tab.Screen>
        <Tab.Screen name="InquireHistory" options={{ title: "문의 내역" }}>
          {() => <InquireHistoryScreen filters={filters} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

export default HistoryScreen;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rootStyles.colors.gray1,
  },
  filterButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: rootStyles.colors.green5,
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
  filterButtonText: {
    color: rootStyles.colors.white,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
