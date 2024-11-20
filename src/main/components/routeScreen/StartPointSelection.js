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
      // setRegion({
      //   latitude: 37.504558,
      //   longitude: 126.956951, // 중앙대
      //   // latitude: 37.498366, 우리집
      //   // longitude: 127.059448,
      //   latitudeDelta: 0.002,
      //   longitudeDelta: 0.002,
      // });
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
      {/* 상단 타이틀 */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>산책 포인트를 설정해주세요</Text>
      </View>
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
          style={[
            styles.modeButton,
            { backgroundColor: "rgba(74, 143, 62, 1)" }, // 버튼 배경색 변경
          ]}
          onPress={setCurrentLocationAs}
        >
          <Text style={[styles.buttonText, { color: "#FEFEFE" }]}>
            현재 위치로 설정
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
      {/* 설정 완료 버튼 */}
      <View style={styles.completeButtonContainer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={proceedToUserInput}
        >
          <Text style={styles.completeButtonText}>설정 완료</Text>
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
  titleContainer: {
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: "#FEFEFE",
    alignItems: "center",
  },
  titleText: {
    fontSize: 23,
    color: "rgba(74, 143, 62, 1)",
    fontWeight: "bold",
  },
  modeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FEFEFE",
  },
  modeButton: {
    paddingVertical: 10, // 버튼의 상하 여백
    paddingHorizontal: 12, // 버튼의 좌우 여백
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center", // 텍스트를 버튼의 중앙에 배치
    alignItems: "center", // 텍스트를 버튼의 중앙에 배치
  },

  activeModeButton: {
    backgroundColor: "rgba(223, 247, 202, 1)",
  },
  buttonText: {
    color: "rgba(74, 143, 62, 1)",
    textAlign: "center",
    fontSize: 12,
  },
  map: {
    flex: 1,
  },
  completeButtonContainer: {
    padding: 10,
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "rgba(74, 143, 62, 1)",
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FEFEFE",
    textAlign: "center",
    fontSize: 16,
  },
});
