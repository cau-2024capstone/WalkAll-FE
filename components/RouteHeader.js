import React from "react";
import { View, Text, StyleSheet } from "react-native";

// 헤더 컴포넌트
function RouteHeader({ routeStage }) {
  switch (routeStage) {
    case "startingPoint":
      title = "Starting Point";
      break;
    case "destination":
      title = "Destination";
      break;
    case "waypoint":
      title = "Waypoint";
      break;
    default:
      title = "Route";
  }

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "left",
  },
  title: {
    fontSize: 20,
  },
});

export default RouteHeader;
