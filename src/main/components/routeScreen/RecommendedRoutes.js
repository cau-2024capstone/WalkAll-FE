import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { result } from "./backendTest"; // Make sure this points to your new data format

const RecommendedRoutes = ({ navigation, route }) => {
  const {
    startMarker,
    waypoints,
    destinationMarker,
    selectedPath,
    selectedGoal,
    inputValue,
  } = route.params;
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);

  // Adjusted useEffect to prioritize routes based on selectedPath
  useEffect(() => {
    let sortedRoutes = result;
    if (selectedPath) {
      sortedRoutes = result.sort((a, b) => {
        if (a.routeType === selectedPath && b.routeType !== selectedPath) {
          return -1;
        } else if (
          a.routeType !== selectedPath &&
          b.routeType === selectedPath
        ) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    setRoutes(sortedRoutes);
  }, [selectedPath]);

  // Function to calculate center from roads
  const calculateCenterFromRoads = (roads) => {
    const pointsMap = new Map();

    roads.forEach((road) => {
      const [startId, endId] = road.idf.split("_");

      if (!pointsMap.has(startId)) {
        pointsMap.set(startId, {
          id: startId,
          lat: road.startLat,
          lng: road.startLng,
        });
      }
      if (!pointsMap.has(endId)) {
        pointsMap.set(endId, {
          id: endId,
          lat: road.endLat,
          lng: road.endLng,
        });
      }
    });

    const points = Array.from(pointsMap.values());
    const totalLat = points.reduce((sum, point) => sum + point.lat, 0);
    const totalLng = points.reduce((sum, point) => sum + point.lng, 0);

    const centerLat = totalLat / points.length;
    const centerLng = totalLng / points.length;

    return { center: { latitude: centerLat, longitude: centerLng }, pointsMap };
  };

  // Function to get color based on roadType
  const getColorFromRoadType = (roadTypeArray) => {
    if (roadTypeArray.includes("Steep")) {
      return "orange";
    } else if (roadTypeArray.includes("Street")) {
      return "rgb(226, 226, 40)";
    } else if (roadTypeArray.includes("Alley")) {
      return "brown";
    } else {
      return "gray"; // Default color
    }
  };

  const renderRouteItem = ({ item }) => {
    const isSelected = selectedRouteId === item.routeIdf;
    const { center, pointsMap } = calculateCenterFromRoads(item.roads);

    // Get start and end points from pointsMap
    const startPoint = pointsMap.get(item.start);
    const endPoint = pointsMap.get(item.end);

    return (
      <View style={styles.routeItem}>
        <MapView
          style={styles.routeMap}
          initialRegion={{
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pointerEvents="none"
        >
          {item.roads.map((road, index) => (
            <Polyline
              key={index}
              coordinates={[
                { latitude: road.startLat, longitude: road.startLng },
                { latitude: road.endLat, longitude: road.endLng },
              ]}
              strokeColor={getColorFromRoadType(road.roadType)}
              strokeWidth={3}
            />
          ))}
          {startPoint && (
            <Marker
              coordinate={{
                latitude: startPoint.lat,
                longitude: startPoint.lng,
              }}
              pinColor="green"
            />
          )}
          {endPoint && (
            <Marker
              coordinate={{ latitude: endPoint.lat, longitude: endPoint.lng }}
              pinColor="red"
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setSelectedRouteId(item.routeIdf)}
        >
          <Text style={styles.buttonText}>
            {isSelected ? "선택됨" : "경로 선택"}
          </Text>
        </TouchableOpacity>

        {isSelected && (
          <TouchableOpacity
            style={styles.followButton}
            onPress={() =>
              navigation.navigate("NavigationScreen", { route: item })
            }
          >
            <Text style={styles.buttonText}>이 경로로 따라가기</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>추천 경로</Text>

      {/* Legend at the top */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColorBox, { backgroundColor: "orange" }]}
          />
          <Text style={styles.legendText}>경삿길</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColorBox,
              { backgroundColor: "rgb(226, 226, 40)" },
            ]}
          />
          <Text style={styles.legendText}>대로</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: "brown" }]} />
          <Text style={styles.legendText}>골목길</Text>
        </View>
      </View>

      <FlatList
        data={routes}
        renderItem={renderRouteItem}
        keyExtractor={(item) => item.routeIdf}
      />
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => navigation.navigate("StartPointSelection")}
      >
        <Text style={styles.buttonText}>맵핑 재설정하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecommendedRoutes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(254, 254, 254, 1)", // White
  },
  title: {
    paddingTop: 40,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 18,
    color: "rgba(23, 29, 27, 1)", // Dark green
    fontWeight: "bold",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
  },
  routeItem: {
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "rgba(244, 251, 248, 1)", // Light ivory
    borderRadius: 10,
    padding: 10,
    shadowColor: "rgba(0, 0, 0, 1)", // Black shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  routeMap: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // Dark green
  },
  selectButton: {
    backgroundColor: "rgba(74, 143, 62, 1)", // Dark green
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "90%",
    borderWidth: 1,
    borderColor: "rgba(52, 121, 40, 1)", // Darker green
  },
  followButton: {
    backgroundColor: "rgba(192, 235, 166, 1)", // Light green
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "90%",
    borderWidth: 1,
    borderColor: "rgba(134, 203, 122, 1)", // Medium green
  },
  resetButton: {
    backgroundColor: "rgba(255, 255, 109, 1)", // Bright yellow
    padding: 15,
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: "rgba(1, 1, 1, 1)", // Black border
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
  },
});
