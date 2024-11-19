import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Image } from "expo-image";

const StartPointSelection = ({ navigation }) => {
  const [mode, setMode] = useState("start"); // 'start', 'destination', 'waypoint'
  const [startMarker, setStartMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
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
        latitudeDelta: 0.002,
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
    const coordinate = e.nativeEvent.coordinate;

    if (mode === "start") {
      setStartMarker(coordinate);
      addAndRemoveTemporaryPin();
    } else if (mode === "destination") {
      setDestinationMarker(coordinate);
      addAndRemoveTemporaryPin();
    } else if (mode === "waypoint") {
      const proximityThreshold = 0.0001; // 0.0001도 이내로 선택하면 같은 핑 누른거니까 삭제

      // 근처에 있는 경유지 제거 또는 추가
      const nearbyWaypoint = waypoints.find(
        (wp) =>
          Math.abs(wp.latitude - coordinate.latitude) < proximityThreshold &&
          Math.abs(wp.longitude - coordinate.longitude) < proximityThreshold
      );

      if (nearbyWaypoint) {
        setWaypoints(waypoints.filter((wp) => wp !== nearbyWaypoint));
      } else {
        if (waypoints.length >= 10) {
          Alert.alert("경유지는 최대 10개까지 선택 가능합니다.");
          return;
        }
        setWaypoints([...waypoints, coordinate]);
        addAndRemoveTemporaryPin();
      }
    }
  };

  const setCurrentLocationAs = () => {
    if (region) {
      const coordinate = {
        latitude: region.latitude,
        longitude: region.longitude,
      };
      if (mode === "start") {
        setStartMarker(coordinate);
      } else if (mode === "destination") {
        setDestinationMarker(coordinate);
      }
    }
  };

  const addAndRemoveTemporaryPin = () => {
    // 지도에 보이지 않는 영역에 임시 핀 추가 (expo 52업뎃 후 버그 해결용)
    const tempCoordinate = {
      latitude: 30,
      longitude: 120,
    };
    setTemporaryPin(tempCoordinate);

    // 50ms 후 임시 핀 삭제
    setTimeout(() => {
      setTemporaryPin(null);
    }, 50);
  };

  const proceedToUserInput = () => {
    if (!startMarker) {
      Alert.alert("출발지를 설정해주세요.");
      return;
    } else if (!destinationMarker) {
      Alert.alert("도착지를 설정해주세요.");
      return;
    } else {
      navigation.navigate("UserInput", {
        startMarker,
        destinationMarker,
        waypoints,
      });
    }
  };

  if (isLocationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>지도 불러오는 중...</Text>
        <ActivityIndicator size="large" color="rgba(74, 143, 62, 1)" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 모드 선택 버튼 */}
      <View style={styles.modeButtonContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "start" ? styles.activeModeButton : null,
          ]}
          onPress={() => setMode("start")}
        >
          <Text style={styles.buttonText}>출발지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "waypoint" ? styles.activeModeButton : null,
          ]}
          onPress={() => setMode("waypoint")}
        >
          <Text style={styles.buttonText}>경유지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === "destination" ? styles.activeModeButton : null,
          ]}
          onPress={() => setMode("destination")}
        >
          <Text style={styles.buttonText}>도착지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, styles.completeButton]}
          onPress={proceedToUserInput}
        >
          <Text style={[styles.buttonText, styles.completeButtonText]}>
            설정 완료
          </Text>
        </TouchableOpacity>
      </View>
      {/* 지도 */}
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onPress={handleMapPress}
        showsUserLocation={false}
      >
        <Marker coordinate={region}>
          <Image
            source={require("../../assets/images/userPing.png")}
            style={{ width: 40, height: 40 }}
          />
        </Marker>
        {startMarker && (
          <Marker coordinate={startMarker}>
            <Image
              source={require("../../assets/images/startPing.png")}
              style={{ width: 60, height: 60 }}
            />
          </Marker>
        )}
        {destinationMarker && (
          <Marker coordinate={destinationMarker}>
            <Image
              source={require("../../assets/images/endPing.png")}
              style={{ width: 60, height: 60 }}
            />
          </Marker>
        )}
        {waypoints.map((wp, index) => (
          <Marker
            key={index}
            coordinate={wp}
            onPress={() => {
              if (mode === "waypoint") {
                setWaypoints(waypoints.filter((w) => w !== wp));
              }
            }}
          >
            <Image
              source={require("../../assets/images/wayPointPing.png")}
              style={{ width: 60, height: 60 }}
            />
          </Marker>
        ))}
        {temporaryPin && (
          <Marker coordinate={temporaryPin} pinColor="transparent" />
        )}
      </MapView>
      {/* 현재 위치로 설정 버튼 */}
      <View style={styles.currentLocationButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={setCurrentLocationAs}>
          <Text style={styles.currentLocationButtonText}>현재위치로 설정</Text>
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
  loadingTitle: {
    paddingTop: 40,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 18,
  },
  modeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: "#FEFEFE",
  },
  modeButton: {
    padding: 10,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeModeButton: {
    backgroundColor: "rgba(223, 247, 202, 1)",
  },
  completeButton: {
    backgroundColor: "rgba(74, 143, 62, 1)",
  },
  buttonText: {
    color: "rgba(74, 143, 62, 1)",
    textAlign: "center",
  },
  completeButtonText: {
    color: "#FEFEFE",
  },
  map: {
    flex: 1,
  },
  currentLocationButtonContainer: {
    padding: 10,
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgba(74, 143, 62, 1)",
    padding: 15,
    borderRadius: 8,
    width: "90%",
  },
  currentLocationButtonText: {
    color: "#fEFEFE",
    textAlign: "center",
  },
});
