import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";

const WaypointSetting = ({ navigation, route }) => {
  const { startMarker } = route.params;
  const [waypoints, setWaypoints] = useState([]);
  const [temporaryPin, setTemporaryPin] = useState(null); // 임시 핀 상태
  const proximityThreshold = 0.0001; // 거리 임계값, 지도 확대 수준에 따라 조정 가능

  const handleMapPress = (e) => {
    const coordinate = e.nativeEvent.coordinate;

    // 터치한 위치에서 가장 가까운 핀 찾기
    const nearbyWaypoint = waypoints.find(
      (wp) =>
        Math.abs(wp.latitude - coordinate.latitude) < proximityThreshold &&
        Math.abs(wp.longitude - coordinate.longitude) < proximityThreshold
    );

    if (nearbyWaypoint) {
      // 가까운 핀이 있으면 해당 핀 삭제
      setWaypoints(waypoints.filter((wp) => wp !== nearbyWaypoint));
    } else {
      // 가까운 핀이 없으면 새로운 핀 생성
      if (waypoints.length > 10) {
        Alert.alert("경유지는 최대 10개까지 선택 가능합니다.");
        return;
      }
      setWaypoints([...waypoints, coordinate]);

      // 임시 핀 추가/삭제 함수 호출
      addAndRemoveTemporaryPin();
    }
  };

  const handleWaypointPress = (coordinate) => {
    setWaypoints(waypoints.filter((wp) => wp !== coordinate));
  };

  const proceedToDestination = () => {
    navigation.navigate("DestinationSetting", { startMarker, waypoints });
  };

  const addAndRemoveTemporaryPin = () => {
    // 지도에 보이지 않는 영역에 임시 핀 추가
    const tempCoordinate = {
      latitude: startMarker.latitude + 0.01, // 지도 밖 임의 위치
      longitude: startMarker.longitude + 0.01,
    };
    setTemporaryPin(tempCoordinate);

    // 100ms 후 임시 핀 삭제
    setTimeout(() => {
      setTemporaryPin(null);
    }, 50);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>경유지를 선택해주세요</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: startMarker.latitude,
          longitude: startMarker.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        region={{
          latitude: startMarker.latitude,
          longitude: startMarker.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onPress={handleMapPress}
        showsUserLocation={false}
      >
        {startMarker && <Marker coordinate={startMarker} pinColor="green" />}
        {waypoints.map((wp, index) => (
          <Marker
            key={index}
            coordinate={wp}
            pinColor="orange"
            onPress={() => handleWaypointPress(wp)}
          />
        ))}
        {temporaryPin && (
          <Marker
            coordinate={temporaryPin}
            pinColor="transparent" // 지도에 표시되지 않도록 설정
          />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={proceedToDestination}>
          <Text style={styles.buttonText}>경유지 설정완료</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WaypointSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    paddingTop: 60,
    paddingBottom: 20,
    textAlign: "center",
    fontSize: 24,
    color: "white",
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    padding: 10,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0d6efd",
    padding: 15,
    borderRadius: 8,
    width: "90%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});
