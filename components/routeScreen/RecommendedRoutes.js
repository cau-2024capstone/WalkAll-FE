import React, { useState, useEffect, useContext } from "react";
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
import { UserContext } from "../../store/context/userContext";
import rootStyles from "../../styles/StyleGuide";

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
  } = route.params;
  const { API_BASE_URL } = useContext(UserContext);

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [isCalculatingCenters, setIsCalculatingCenters] = useState(true);

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

    // 각 route에 대해 center와 pointsMap을 계산
    const routesWithCenters = sortedRoutes.map((route) => {
      const { center, pointsMap } = calculateCenterFromRoads(route.roads);
      return { ...route, center, pointsMap };
    });

    setRoutes(routesWithCenters);

    // 0.5초 후에 각 경로의 region을 다시 계산하여 업데이트
    const timer1 = setTimeout(() => {
      const routesWithUpdatedRegions = routesWithCenters.map((route) => {
        const region = calculateRegionForRoute(route);
        return { ...route, region };
      });
      setRoutes(routesWithUpdatedRegions);

      // 2초 후에 모달을 닫음
      const timer2 = setTimeout(() => {
        setIsCalculatingCenters(false); // 로딩 모달 숨기기
      }, 2000);

      // 컴포넌트 언마운트 시 타이머 정리
      return () => clearTimeout(timer2);
    }, 2000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer1);
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

  // 각 경로의 region을 계산하는 함수
  const calculateRegionForRoute = (route) => {
    const { pointsMap } = route;
    const points = Array.from(pointsMap.values());

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    points.forEach((point) => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    });

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    const deltaLat = maxLat - minLat;
    const deltaLng = maxLng - minLng;

    // 여백 추가
    const paddingFactor = 1.5;
    const latitudeDelta = deltaLat * paddingFactor || 0.005;
    const longitudeDelta = deltaLng * paddingFactor || 0.005;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta,
      longitudeDelta,
    };
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
      const url = `${API_BASE_URL}/api/routes/saveSelectedRouteToUser?userIdf=${userIdf}`;
      console.log("Saving selected route to user:", url);

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

      // fetch 요청 완료 후에만 네비게이션 실행
      setIsSavingRoute(false);

      navigation.navigate("NavigationScreen", {
        route: savedRoute,
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

    // 중심점과 pointsMap은 이미 계산되어 있으므로 바로 사용
    const region = item.region;

    // 시작점과 끝점 마커
    const startPoint = item.pointsMap.get(item.start);
    const endPoint = item.pointsMap.get(item.end);

    return (
      <View style={localStyles.routeItem}>
        <View style={localStyles.routeMapContainer}>
          <MapView
            style={localStyles.routeMap}
            region={region}
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
                coordinate={{
                  latitude: endPoint.lat,
                  longitude: endPoint.lng,
                }}
                pinColor="red"
              />
            )}
          </MapView>
          {/* 지도 우측 하단에 거리와 시간 표시 */}
          <View style={localStyles.infoOverlay}>
            <Text style={localStyles.infoText}>
              거리: {item.totalRoadDistance}m
            </Text>
            <Text style={localStyles.infoText}>시간: {item.totalTime}분</Text>
          </View>
        </View>

        <TouchableOpacity
          style={localStyles.selectButton}
          onPress={() => setSelectedRouteId(item.routeIdf)}
        >
          <Text style={localStyles.buttonText}>
            {isSelected ? "선택됨" : "경로 선택"}
          </Text>
        </TouchableOpacity>

        {isSelected && (
          <TouchableOpacity
            style={localStyles.followButton}
            onPress={() => handleFollowRoute(item)}
          >
            <Text style={localStyles.buttonblackText}>이 경로로 따라가기</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={localStyles.container}>
      <View style={localStyles.titleContainer}>
        <Text style={localStyles.titleText}>추천 경로</Text>
        <View style={localStyles.roadinfoContainer}>
          <Text style={localStyles.roadinfoAsk}>
            잠깐! 도로에 칠해진 색은 무엇을 의미하나요?
          </Text>
          <Text style={localStyles.roadinfoText}>
            도로를 구분하기 위한 색으로, 각 색깔에 따른 의미는 아래와 같습니다.
          </Text>
        </View>
        <View style={localStyles.legendContainer}>
          <View style={localStyles.legendItem}>
            <View
              style={[
                localStyles.legendColorBox,
                { backgroundColor: "orange" },
              ]}
            />
            <Text style={localStyles.legendText}>경삿길</Text>
          </View>
          <View style={localStyles.legendItem}>
            <View
              style={[
                localStyles.legendColorBox,
                { backgroundColor: "#024CAA" },
              ]}
            />
            <Text style={localStyles.legendText}>대로</Text>
          </View>
          <View style={localStyles.legendItem}>
            <View
              style={[localStyles.legendColorBox, { backgroundColor: "brown" }]}
            />
            <Text style={localStyles.legendText}>골목길</Text>
          </View>
          <View style={localStyles.legendItem}>
            <View
              style={[
                localStyles.legendColorBox,
                { backgroundColor: "#347928" },
              ]}
            />
            <Text style={localStyles.legendText}>자연친화 길</Text>
          </View>
        </View>
      </View>
      {/* Legend at the top */}

      <FlatList
        data={routes}
        renderItem={renderRouteItem}
        keyExtractor={(item) => item.routeIdf}
      />
      <TouchableOpacity
        style={localStyles.resetButton}
        onPress={() => navigation.navigate("PingSelection")}
      >
        <Text style={localStyles.resetText}>맵핑 재설정하기</Text>
      </TouchableOpacity>

      {/* Loading Modal for Calculating Routes */}
      {isCalculatingCenters && (
        <Modal transparent={true} animationType="fade" visible={true}>
          <View style={localStyles.modalBackground}>
            <View style={localStyles.activityIndicatorWrapper}>
              <Image
                source={require("../../assets/images/walkingAnimation.gif")}
                style={{ width: 100, height: 100 }}
              />
              <Text style={{ marginTop: 10 }}>지도 렌더링 중...</Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Loading Modal for Saving Route */}
      {isSavingRoute && (
        <Modal transparent={true} animationType="fade" visible={true}>
          <View style={localStyles.modalBackground}>
            <View style={localStyles.activityIndicatorWrapper}>
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

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(254, 254, 254, 1)", // White
  },
  titleContainer: {
    paddingTop: 50,
    paddingBottom: 16,
    marginBottom: 10,
    backgroundColor: "rgba(254, 254, 254, 1)", // White
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: rootStyles.colors.gray2,
  },
  titleText: {
    color: rootStyles.colors.gray6,
    ...rootStyles.fontStyles.subTitle,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  roadinfoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
    marginBottom: 10,
  },
  roadinfoAsk: {
    color: rootStyles.colors.green5,
    padding: 2,
    textAlign: "center",
    ...rootStyles.fontStyles.subTitle,
    fontSize: 15,
    fontWeight: "600",
  },
  roadinfoText: {
    color: rootStyles.colors.gray5,
    padding: 2,
    textAlign: "center",
    ...rootStyles.fontStyles.subTitle,
    fontSize: 13,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 2,
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
  routeMapContainer: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // Dark green
    position: "relative",
  },
  routeMap: {
    width: "100%",
    height: "100%",
  },
  infoOverlay: {
    position: "absolute",
    right: 5,
    bottom: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // 약간 투명한 흰색 배경
    padding: 5,
    borderRadius: 5,
    alignItems: "flex-end",
  },
  infoText: {
    fontSize: 12,
    color: "#000",
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
    backgroundColor: "rgba(255, 255, 255, 1)", // 약간 투명한 흰색 배경
    padding: 10,
    borderRadius: 8,
    margin: 10,
    marginLeft: 10,
    width: "93%",
    borderWidth: 1,
    borderColor: "rgba(52, 121, 40, 1)", // Darker green
    position: "center",
  },
  resetText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "rgba(52, 121, 40, 1)", // Darker green
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#FEFEFE", // 흰색 글자
  },
  buttonblackText: {
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
