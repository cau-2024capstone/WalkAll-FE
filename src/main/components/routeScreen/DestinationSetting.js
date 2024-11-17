import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";

const DestinationSetting = ({ navigation, route }) => {
  const { startMarker, waypoints } = route.params;
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [temporaryPin, setTemporaryPin] = useState(null);
  const region = {
    latitude: startMarker.latitude,
    longitude: startMarker.longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
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

  const handleMapPress = (e) => {
    setDestinationMarker(e.nativeEvent.coordinate);
    addAndRemoveTemporaryPin();
  };

  const setCurrentLocation = () => {
    // 현재 위치를 시작점과 동일하게 설정
    setDestinationMarker({
      latitude: startMarker.latitude,
      longitude: startMarker.longitude,
    });
  };

  const proceedToUserInput = () => {
    if (destinationMarker) {
      navigation.navigate("UserInput", {
        startMarker,
        waypoints,
        destinationMarker,
      });
    } else {
      Alert.alert("목적지를 선택해주세요.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>목적지를 선택해주세요!</Text>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={false}
      >
        {startMarker && <Marker coordinate={startMarker} pinColor="green" />}
        {waypoints.map((wp, index) => (
          <Marker key={index} coordinate={wp} pinColor="orange" />
        ))}
        {destinationMarker && (
          <Marker coordinate={destinationMarker} pinColor="red" />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={setCurrentLocation}>
          <Text style={styles.buttonText}>현재위치로 설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={proceedToUserInput}>
          <Text style={styles.buttonText}>도착지 설정 완료</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DestinationSetting;

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
    shadowColor: "#000", // 그림자 효과 추가
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // 안드로이드에서도 그림자 효과 적용
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
