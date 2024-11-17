import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator, // 로딩 중 표시를 위한 컴포넌트
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

//navigation : 화면 전환을 위한 navigation prop (화면스택을 관리)
const StartPointSelection = ({ navigation }) => {
  const [startMarker, setStartMarker] = useState(null);
  const [region, setRegion] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [temporaryPin, setTemporaryPin] = useState(null); // 임시 핀 상태

  useEffect(() => {
    (async () => {
      // 위치 권한 요청 및 현재 위치 가져오기

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 권한이 필요합니다.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.002, // 줌 레벨 조정
        longitudeDelta: 0.002,
      });
      setIsLocationLoading(false);

      // 테스트용 좌표입니다.
      setRegion({
        latitude: 37.504558,
        longitude: 126.956951,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });
      setIsLocationLoading(false);
    })();
  }, []);

  const handleMapPress = (e) => {
    setStartMarker(e.nativeEvent.coordinate);
    addAndRemoveTemporaryPin();
  };

  const setCurrentLocation = () => {
    if (region) {
      setStartMarker({
        latitude: region.latitude,
        longitude: region.longitude,
      });
    }
  };

  const addAndRemoveTemporaryPin = () => {
    // 지도에 보이지 않는 영역에 임시 핀 추가
    const tempCoordinate = {
      latitude: 30, // 지도 밖 임의 위치
      longitude: 120,
    };
    setTemporaryPin(tempCoordinate);

    // 100ms 후 임시 핀 삭제
    setTimeout(() => {
      setTemporaryPin(null);
    }, 50);
  };

  const proceedToWaypoints = () => {
    if (startMarker) {
      navigation.navigate("WaypointSetting", { startMarker });
    } else {
      Alert.alert("시작 위치를 선택해주세요.");
    }
  };

  //사실 현재위치 불러오는 중임 지도는 이미 불러옴
  if (isLocationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitile}>지도 불러오는 중...</Text>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>산책 시작 위치를 선택해주세요</Text>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={false}
      >
        {startMarker && <Marker coordinate={startMarker} />}
        {/* 현재 위치 마커 표시 */}
        {region && (
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            pinColor="blue"
            title="현재 위치"
          />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={setCurrentLocation}>
          <Text style={styles.buttonText}>현재위치로 설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={proceedToWaypoints}>
          <Text style={styles.buttonText}>시작지점 설정완료</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StartPointSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    shadowColor: "#000", // 그림자 효과 추가
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // 안드로이드에서도 그림자 효과 적용
  },
  loadingTitile: {
    paddingTop: 40,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 18,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  button: {
    backgroundColor: "#0d6efd",
    padding: 15,
    borderRadius: 8,
    width: "45%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});
