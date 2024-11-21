import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Image } from "expo-image";

const RecommendedRoutes = ({ navigation, route }) => {
  const {
    startMarker,
    waypoints,
    destinationMarker,
    selectedPath,
    selectedGoal,
    inputValue,
    routesData,
    userIdf,
    localIP,
  } = route.params;

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isSavingRoute, setIsSavingRoute] = useState(false);

  useEffect(() => {
    let sortedRoutes = routesData;
    if (selectedPath) {
      sortedRoutes = routesData.sort((a, b) => {
        // 경로 타입에 따라 정렬
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

  // 로드를 통해 중심점 계산
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
      return "#024CAA";
    } else if (roadTypeArray.includes("Alley")) {
      return "brown";
    } else if (roadTypeArray.includes("Tree")) {
      return "#347928";
    } else {
      return "gray"; // Default color
    }
  };

  const handleFollowRoute = async (selectedRoute) => {
    setIsSavingRoute(true); // 로딩 상태 시작
    try {
      const url = `https://accurately-healthy-duckling.ngrok-free.app/api/routes/saveSelectedRouteToUser?userIdf=${userIdf}`;
      console.log("Saving selected route to user:", url);
      console.log("Request body:", JSON.stringify(selectedRoute));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedRoute),
      });

      if (!response.ok) {
        console.log("Failed to save selected route:", response.statusText);
        throw new Error("Failed to save selected route");
      }

      const savedRoute = await response.json();
      console.log("Saved route: 로딩 및 저장 성공", savedRoute);

      // fetch 요청 완료 후에만 네비게이션 실행
      setIsSavingRoute(false);

      navigation.navigate("NavigationScreen", {
        route: savedRoute,
        localIP,
        userIdf,
      });
    } catch (error) {
      console.log("Error saving selected route:", error);
      Alert.alert("오류가 발생했습니다", "다시 시도해주세요.");
      setIsSavingRoute(false); // 로딩 상태 종료
    }
  };

  const renderRouteItem = ({ item }) => {
    const isSelected = selectedRouteId === item.routeIdf;
    const { center, pointsMap } = calculateCenterFromRoads(item.roads);

    // 시작점과 끝점 마커
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
            onPress={() => handleFollowRoute(item)}
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
            style={[styles.legendColorBox, { backgroundColor: "#024CAA" }]}
          />
          <Text style={styles.legendText}>대로</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: "brown" }]} />
          <Text style={styles.legendText}>골목길</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColorBox, { backgroundColor: "#347928" }]}
          />
          <Text style={styles.legendText}>자연친화 길</Text>
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

      {/* Loading Modal */}
      {isSavingRoute && (
        <Modal transparent={true} animationType="fade" visible={isSavingRoute}>
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <Image
                source={require("../../assets/images/walkingAnimation.gif")}
                style={{ width: 100, height: 100 }}
              />
              <Text style={{ marginTop: 10 }}>경로 저장 중...</Text>
            </View>
          </View>
        </Modal>
      )}
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
    paddingTop: 60,
    paddingBottom: 15,
    textAlign: "center",
    fontSize: 23,
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
    paddingBottom: 4,
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
    borderWidth: 2,
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
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000040", // 반투명 배경색
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
