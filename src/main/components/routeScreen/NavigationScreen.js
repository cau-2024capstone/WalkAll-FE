import React from "react";
import { Text, StyleSheet, ScrollView } from "react-native";

const NavigationScreen = ({ route }) => {
  const { route: selectedRoute } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>선택한 경로 정보</Text>
      <Text>Route ID: {selectedRoute.id}</Text>
      <Text>총 거리: {selectedRoute.totalRouteDistance.toFixed(2)} meters</Text>
      <Text style={styles.subtitle}>Points:</Text>
      {selectedRoute.points.map((point) => (
        <Text key={point.id}>
          Point {point.id}: ({point.lat}, {point.lng})
        </Text>
      ))}
      <Text style={styles.subtitle}>Roads:</Text>
      {selectedRoute.roads.map((road) => (
        <Text key={road.id}>
          Road {road.id}: Start ({road.startLat}, {road.startLng}) - End (
          {road.endLat}, {road.endLng})
        </Text>
      ))}
    </ScrollView>
  );
};

export default NavigationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
  },
  subtitle: {
    marginTop: 10,
    fontWeight: "bold",
  },
});
