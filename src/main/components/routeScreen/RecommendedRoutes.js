import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { result } from "./backendTest";

const RecommendedRoutes = ({ navigation, route }) => {
  const { startMarker, waypoints, destinationMarker } = route.params;
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routes, setRoutes] = useState([]);

  //프론트 테스트 코드
  useEffect(() => {
    setRoutes(result);
  }, []);

  /*
  //백엔드 테스트 코드
    useEffect(() => {
      // 추천 경로 API 호출
      const fetchRoutes = async () => {
        try {
          console.log("try문 실행했습니다.");
  
          // 테스트 중인 경로 설정
          const routeRequest = {
            startLat: startMarker.latitude,
            startLng: startMarker.longitude,
            endLat: destinationMarker.latitude,
            endLng: destinationMarker.longitude,
          };
  
          const routeRequest = {
            startLat: 37.504459338426,
            startLng: 126.9570086044993,
            endLat: 37.5048806440909,
            endLng: 126.95534563491,
          };
  
          const response = await fetch(
            "http://192.168.0.77:8082/api/route/generate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(routeRequest),
            }
          );
  
          if (!response.ok) {
            throw new Error("네트워크 응답이 실패했습니다.");
          }
  
          const data = await response.json();
          //console.log("data:", JSON.stringify(data, null, 2));
  
          setRoutes(data);
        } catch (error) {
          console.error("추천 경로 생성 오류:", error);
          Alert.alert("추천 경로를 생성하는 데 실패했습니다.");
        }
      };
  
      fetchRoutes();
      //
    }, []);
  */
  // 나머지 코드 동일
  const calculateCenter = (points) => {
    const totalLat = points.reduce((sum, point) => sum + point.lat, 0);
    const totalLng = points.reduce((sum, point) => sum + point.lng, 0);

    const centerLat = totalLat / points.length;
    const centerLng = totalLng / points.length;

    return { latitude: centerLat, longitude: centerLng };
  };

  const renderRouteItem = ({ item }) => {
    const isSelected = selectedRouteId === item.id;
    const center = calculateCenter(item.points);

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
          c
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
              strokeColor="#FF0000"
              strokeWidth={2}
            />
          ))}
          {startMarker && <Marker coordinate={startMarker} pinColor="green" />}
          {waypoints &&
            waypoints.map((wp, index) => (
              <Marker key={index} coordinate={wp} pinColor="orange" />
            ))}
          {destinationMarker && (
            <Marker coordinate={destinationMarker} pinColor="red" />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setSelectedRouteId(item.id)}
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
      <FlatList
        data={routes}
        renderItem={renderRouteItem}
        keyExtractor={(item) => item.id.toString()}
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
    backgroundColor: "rgba(254, 254, 254, 1)", // 흰색 (white)
  },
  title: {
    paddingTop: 40,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 18,
    color: "rgba(23, 29, 27, 1)", // 어두운 녹색 (aospOnSurface)
    fontWeight: "bold",
  },
  routeItem: {
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "rgba(244, 251, 248, 1)", // 연한 아이보리 (aospSurface)
    borderRadius: 10,
    padding: 10,
    shadowColor: "rgba(0, 0, 0, 1)", // 검정 그림자
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
    borderColor: "rgba(74, 143, 62, 1)", // 진한 초록색 (green5)
  },
  selectButton: {
    backgroundColor: "rgba(74, 143, 62, 1)", // 진한 초록색 (green5)
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "90%",
    borderWidth: 1,
    borderColor: "rgba(52, 121, 40, 1)", // 어두운 초록색 (green6)
  },
  followButton: {
    backgroundColor: "rgba(192, 235, 166, 1)", // 연한 초록색 (green2)
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "90%",
    borderWidth: 1,
    borderColor: "rgba(134, 203, 122, 1)", // 중간 초록색 (green3)
  },
  resetButton: {
    backgroundColor: "rgba(255, 255, 109, 1)", // 선명한 노란색 (yellow2)
    padding: 15,
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: "rgba(1, 1, 1, 1)", // 검정 테두리
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
  },
  selectButtonText: {
    color: "rgba(254, 254, 254, 1)", // 흰색 텍스트
  },
  followButtonText: {
    color: "rgba(1, 1, 1, 1)", // 검정색 텍스트
  },
  resetButtonText: {
    color: "rgba(1, 1, 1, 1)", // 검정색 텍스트
  },
});
