import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

const TestScreen = ({ selectedRoute }) => {
  const [isSetUserLocationActive, setIsSetUserLocationActive] = useState(false);
  const [isMoveMapActive, setIsMoveMapActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [deviatedEdges, setDeviatedEdges] = useState([]);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [lastOnRoutePoint, setLastOnRoutePoint] = useState(null);
  const [lastOffRoutePoint, setLastOffRoutePoint] = useState(null);
  const [passedRoutePoints, setPassedRoutePoints] = useState([]);
  const [arrivalButtonEnabled, setArrivalButtonEnabled] = useState(false);
  const [temporaryPin, setTemporaryPin] = useState(null);
  const [lastDestinationPoint, setLastDestinationPoint] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const points = generateRoutePoints(selectedRoute.roads);
    setRoutePoints(points);
    setLastOnRoutePoint(points[0]);
    setLastDestinationPoint(points[points.length - 1]);
    addAndRemoveTemporaryPin();
  }, []);

  const addAndRemoveTemporaryPin = () => {
    // Add a temporary pin outside the map view to force a re-render
    const tempCoordinate = {
      latitude: 30, // Arbitrary location off the map
      longitude: 120,
    };
    setTemporaryPin(tempCoordinate);

    // Remove the temporary pin after 50ms
    setTimeout(() => {
      setTemporaryPin(null);
    }, 50);
  };

  // Updated function to generate route points from roads
  const generateRoutePoints = (roads) => {
    let routePoints = [];
    for (let i = 0; i < roads.length; i++) {
      const road = roads[i];
      const start = { latitude: road.startLat, longitude: road.startLng };
      const end = { latitude: road.endLat, longitude: road.endLng };
      const segmentPoints = interpolatePoints(start, end);
      routePoints = routePoints.concat(segmentPoints);
    }
    return routePoints;
  };

  const interpolatePoints = (start, end, numPoints = 10) => {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const latitude =
        start.latitude + ((end.latitude - start.latitude) * i) / numPoints;
      const longitude =
        start.longitude + ((end.longitude - start.longitude) * i) / numPoints;
      points.push({ latitude, longitude });
    }
    return points;
  };

  const handleSetUserLocation = () => {
    setIsSetUserLocationActive(true);
    setIsMoveMapActive(false);
  };

  const handleMoveMap = () => {
    setIsSetUserLocationActive(false);
    setIsMoveMapActive(true);
  };

  const onMapPress = (e) => {
    if (isSetUserLocationActive) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const newLocation = { latitude, longitude };
      setUserLocation(newLocation);
      checkUserLocation(newLocation);
      addAndRemoveTemporaryPin();
    }
  };

  const checkUserLocation = (location) => {
    const threshold = 0.0002;
    const nearestPointIndex = findNearestRoutePointIndex(location, routePoints);
    const nearestPoint = routePoints[nearestPointIndex];
    const distance = calculateDistance(location, nearestPoint);

    if (distance <= threshold) {
      // User is on the route
      if (isOffRoute) {
        // User has returned to the route
        const newEdge = [lastOffRoutePoint, nearestPoint];
        setDeviatedEdges((prevEdges) => [...prevEdges, newEdge]);
        setIsOffRoute(false);
      }

      // Update passed and remaining route points
      const remainingRoutePoints = routePoints.slice(nearestPointIndex + 1);
      const passedPoints = routePoints.slice(0, nearestPointIndex + 1);
      setPassedRoutePoints((prevPoints) => [...prevPoints, ...passedPoints]);

      setRoutePoints(remainingRoutePoints);
      setLastOnRoutePoint(nearestPoint);

      // Check if arrival button should be enabled
      if (remainingRoutePoints.length === 0 || isNearDestination(location)) {
        setArrivalButtonEnabled(true);
      }
    } else {
      // User is off the route
      if (!isOffRoute) {
        setIsOffRoute(true);
        const newEdge = [lastOnRoutePoint, location];
        setDeviatedEdges((prevEdges) => [...prevEdges, newEdge]);
      } else {
        const updatedEdges = [...deviatedEdges];
        const lastEdge = updatedEdges[updatedEdges.length - 1];
        lastEdge.push(location);
        updatedEdges[updatedEdges.length - 1] = lastEdge;
        setDeviatedEdges(updatedEdges);
      }
      setLastOffRoutePoint(location);
    }
  };

  const findNearestRoutePointIndex = (location, points) => {
    let minDistance = Infinity;
    let nearestIndex = -1;
    points.forEach((point, index) => {
      const distance = calculateDistance(location, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  };

  const calculateDistance = (loc1, loc2) => {
    const deltaLat = loc1.latitude - loc2.latitude;
    const deltaLon = loc1.longitude - loc2.longitude;
    return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
  };

  const isNearDestination = (location) => {
    const destination = lastDestinationPoint;
    if (!destination) return false;
    const distance = calculateDistance(location, destination);
    const arrivalThreshold = 0.0005;
    return distance <= arrivalThreshold;
  };

  const handleArriveButtonPress = () => {
    const newRouteData = {
      deviatedPath: deviatedEdges,
      routeWalked: routePoints,
    };

    // Simulated backend communication (for testing)
    if (deviatedEdges.length > 0) {
      Alert.alert(
        "축하합니다",
        "축하합니다. 새로운 길을 개척하셨습니다! 문의를 넣을까요?"
      );
    } else {
      Alert.alert("축하합니다", "축하합니다! 경로를 완주하셨습니다!");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: routePoints[0]?.latitude || 37.504558,
          longitude: routePoints[0]?.longitude || 126.956951,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onPress={onMapPress}
        scrollEnabled={!isSetUserLocationActive}
      >
        {passedRoutePoints.length > 0 && (
          <Polyline
            coordinates={passedRoutePoints}
            strokeColor="#808080"
            strokeWidth={3}
          />
        )}
        {routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}
        {deviatedEdges.map((edge, index) => (
          <Polyline
            key={`deviatedEdge-${index}`}
            coordinates={edge}
            strokeColor="#0000FF"
            strokeWidth={3}
          />
        ))}
        {userLocation && (
          <Marker coordinate={userLocation} onPress={() => {}} />
        )}
        {temporaryPin && (
          <Marker coordinate={temporaryPin} pinColor="transparent" />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            isSetUserLocationActive && styles.activeButton,
          ]}
          onPress={handleSetUserLocation}
        >
          <Text style={styles.buttonText}>사용자 위치 설정 버튼</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isMoveMapActive && styles.activeButton]}
          onPress={handleMoveMap}
        >
          <Text style={styles.buttonText}>지도 움직이기 버튼</Text>
        </TouchableOpacity>
        {arrivalButtonEnabled && (
          <TouchableOpacity
            style={styles.arriveButton}
            onPress={handleArriveButtonPress}
          >
            <Text style={styles.arriveButtonText}>도착 버튼</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    top: 50,
    left: 10,
  },
  button: {
    backgroundColor: "#FFFFFFaa",
    padding: 10,
    marginBottom: 10,
  },
  activeButton: {
    backgroundColor: "#87CEEBaa",
  },
  buttonText: {
    fontSize: 16,
  },
  arriveButton: {
    backgroundColor: "#FF4500aa",
    padding: 10,
    marginTop: 10,
  },
  arriveButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});
