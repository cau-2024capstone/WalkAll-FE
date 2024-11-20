// NavigationScreen.js

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import CurrentLocationScreen from "./CurrentLocationScreen";
import TestScreen from "./TestScreen";

const NavigationScreen = ({ navigation, route }) => {
  const [mode, setMode] = useState(null);
  const { route: selectedRoute, localIP, userIdf } = route.params;

  const handleCurrentLocationMode = () => {
    setMode("currentLocation");
  };

  const handleTestMode = () => {
    setMode("testMode");
  };

  if (mode === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>모드를 선택해주세요</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCurrentLocationMode}
        >
          <Text style={styles.buttonText}>현재 위치 모드</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTestMode}>
          <Text style={styles.buttonText}>테스트 모드</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (mode === "currentLocation") {
    return <CurrentLocationScreen />;
  } else if (mode === "testMode") {
    return (
      <TestScreen
        selectedRoute={selectedRoute}
        localIP={localIP}
        userIdf={userIdf}
        navigation={navigation}
      />
    );
  }
};

export default NavigationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#1E90FF",
    padding: 15,
    marginBottom: 20,
    width: "80%",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});
