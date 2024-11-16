// src/main/components/TestScreen.js

import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

const TestScreen = ({ selectedRoute }) => {
  const [isSetUserLocationActive, setIsSetUserLocationActive] = useState(false); // 사용자 위치 설정 버튼 활성화 여부
  const [isMoveMapActive, setIsMoveMapActive] = useState(false); // 지도 움직이기 버튼 활성화 여부
  const [userLocation, setUserLocation] = useState(null); // 사용자 위치
  const [routePoints, setRoutePoints] = useState([]); //추천 경로 점 리스트
  const [deviatedEdges, setDeviatedEdges] = useState([]); // 사용자가 경로에서 벗어난 엣지 리스트
  const [isOffRoute, setIsOffRoute] = useState(false); //사용자가 경로에서 벗어났는지 여부
  const [lastOnRoutePoint, setLastOnRoutePoint] = useState(null); // 마지막으로 경로 상에 있던 점
  const [arrivalButtonEnabled, setArrivalButtonEnabled] = useState(false); // 도착 버튼 활성화 여부
  const mapRef = useRef(null); // 지도 참조

  useEffect(() => {
    //어플 처음 시작하면 루트 포인트화해서 경로를 그릴거임
    const points = generateRoutePoints(selectedRoute.points);
    setRoutePoints(points);
    setLastOnRoutePoint(points[0]);
  }, []);

  //어떻게 그림 그릴거냐?
  const generateRoutePoints = (points) => {
    let routePoints = []; //결과값
    for (let i = 0; i < points.length - 1; i++) {
      const start = { latitude: points[i].lat, longitude: points[i].lng };
      const end = { latitude: points[i + 1].lat, longitude: points[i + 1].lng };
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
    }
  };

  const checkUserLocation = (location) => {
    const threshold = 0.0002; // 20m (사용자가 경로에서 벗어났는지 확인하기 위한 임계값)
    const nearestPointIndex = findNearestRoutePointIndex(location, routePoints);
    const nearestPoint = routePoints[nearestPointIndex];
    const distance = calculateDistance(location, nearestPoint);

    if (distance <= threshold) {
      //유저가 경로에 있을 때
      if (isOffRoute) {
        // User has returned to the route
        // Draw blue edge from last off-route position to current location
        const newEdge = [lastOnRoutePoint, location];
        setDeviatedEdges((prevEdges) => [...prevEdges, newEdge]);
        setIsOffRoute(false);
      }

      // Remove passed route points
      const remainingRoutePoints = routePoints.slice(nearestPointIndex + 1);
      setRoutePoints(remainingRoutePoints);
      setLastOnRoutePoint(location);

      // Check if arrival button should be enabled
      if (remainingRoutePoints.length === 0 || isNearDestination(location)) {
        setArrivalButtonEnabled(true);
      }
    } else {
      // User is off the route
      if (!isOffRoute) {
        // User has just deviated
        setIsOffRoute(true);
        // Draw blue edge from last on-route point to current location
        const newEdge = [lastOnRoutePoint, location];
        setDeviatedEdges((prevEdges) => [...prevEdges, newEdge]);
      } else {
        // Continue deviated path by extending the last edge
        const updatedEdges = [...deviatedEdges];
        const lastEdge = updatedEdges[updatedEdges.length - 1];
        lastEdge.push(location);
        updatedEdges[updatedEdges.length - 1] = lastEdge;
        setDeviatedEdges(updatedEdges);
      }
      setLastOnRoutePoint(location);
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
    const destination = selectedRoute.points[selectedRoute.points.length - 1];
    const distance = calculateDistance(location, {
      latitude: destination.lat,
      longitude: destination.lng,
    });
    const arrivalThreshold = 0.0005; // Increased threshold (approximately 50 meters)
    return distance <= arrivalThreshold;
  };

  const handleArriveButtonPress = () => {
    // Prepare data to send to backend
    const newRouteData = {
      deviatedPath: deviatedEdges,
      routeWalked: routePoints,
    };

    // Backend interaction placeholder (Commented out for testing)
    /*
    // test용
    fetch('https://your-backend-endpoint.com/checkRoute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRouteData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isNewRoute) {
          Alert.alert('축하합니다', '축하합니다. 새로운 길을 개척하셨습니다! 문의를 넣을까요?');
        } else {
          Alert.alert('축하합니다', '축하합니다! 경로를 완주하셨습니다!');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    */

    // Simulated backend response for testing purposes
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
          latitude: 37.504558,
          longitude: 126.956951,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onPress={onMapPress}
        scrollEnabled={!isSetUserLocationActive}
      >
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
    top: 10,
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