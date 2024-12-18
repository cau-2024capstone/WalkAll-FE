import React, { useState, useEffect, useContext } from "react";
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
import { fixMapRenderErr } from "./fixMapRenderErr";
import { UserContext } from "../../store/context/userContext";
import rootStyles from "../../styles/StyleGuide";

const PingSelection = ({ navigation }) => {
  const [mode, setMode] = useState("start"); // 'start', 'destination', 'waypoint'
  const [startMarker, setStartMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [region, setRegion] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [temporaryPin, setTemporaryPin] = useState(null); // 임시 핀 상태
  const { defaultRegion } = useContext(UserContext);

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

      // defaultRegion 확인 후 설정
      if (defaultRegion && Object.keys(defaultRegion).length > 0) {
        console.log("default");
        setRegion({
          latitude: defaultRegion.latitude,
          longitude: defaultRegion.longitude,
          latitudeDelta: defaultRegion.latitudeDelta || 0.002,
          longitudeDelta: defaultRegion.longitudeDelta || 0.002,
        });
      }
    })();
  }, []);

  const handleMapPress = (e) => {
    const coordinate = e.nativeEvent.coordinate;

    if (mode === "start") {
      setStartMarker(coordinate);
      fixMapRenderErr(setTemporaryPin); // 함수 호출
    } else if (mode === "destination") {
      setDestinationMarker(coordinate);
      fixMapRenderErr(setTemporaryPin); // 함수 호출
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
        fixMapRenderErr(setTemporaryPin); // 함수 호출
      }
    } else if (mode === "sameStartEnd") {
      const destinationCoordinate = { ...coordinate };
      destinationCoordinate.longitude += 0.00003;
      setStartMarker(coordinate);
      setDestinationMarker(destinationCoordinate);
      fixMapRenderErr(setTemporaryPin);
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
      <View style={localStyles.loadingContainer}>
        <Text style={localStyles.loadingTitle}>지도 불러오는 중...</Text>
        <ActivityIndicator size="large" color="rgba(74, 143, 62, 1)" />
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* 상단 타이틀 */}
      <View style={localStyles.titleContainer}>
        <Text style={localStyles.titleText}>
          Walk-ALL과 함께 경로를 생성해봐요!
        </Text>
      </View>
      {/* 모드 선택 버튼 */}
      <View style={localStyles.modeButtonContainer}>
        <TouchableOpacity
          style={[
            localStyles.modeButton,
            mode === "start" ? localStyles.activeModeButton : null,
          ]}
          onPress={() => setMode("start")}
        >
          <Text style={localStyles.buttonText}>출발지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.modeButton,
            mode === "waypoint" ? localStyles.activeModeButton : null,
          ]}
          onPress={() => setMode("waypoint")}
        >
          <Text style={localStyles.buttonText}>경유지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.modeButton,
            mode === "destination" ? localStyles.activeModeButton : null,
          ]}
          onPress={() => setMode("destination")}
        >
          <Text style={localStyles.buttonText}>도착지</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.modeButton,
            mode === "sameStartEnd" ? localStyles.activeModeButton : null,
          ]}
          onPress={() => setMode("sameStartEnd")}
        >
          <Text style={[localStyles.buttonText]}>산책지점{"\n"}설정</Text>
        </TouchableOpacity>
      </View>
      {/* 지도 */}
      <MapView
        //provider={PROVIDER_GOOGLE}
        style={localStyles.map}
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
      <View style={localStyles.completeButtonContainer}>
        <View style={localStyles.infoContainer}>
          <Text style={localStyles.infoText}>
            상단에서 위치의 종류를 선택하고, 지도에서 원하는 위치를 터치하세요.
          </Text>
        </View>
        <TouchableOpacity
          style={localStyles.completeButton}
          onPress={proceedToUserInput}
        >
          <Text style={localStyles.completeButtonText}>경로 생성</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PingSelection;

const localStyles = StyleSheet.create({
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
    color: rootStyles.colors.gray6,
    marginLeft: 5,
    ...rootStyles.fontStyles.subTitle,
    fontSize: 20,
    fontWeight: "700",
  },
  map: {
    flex: 1,
  },
  modeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(254, 254, 254, 1)",
    backgroundOpacity: 0.1,
    borderBottomWidth: 2,
    borderBottomColor: rootStyles.colors.gray2,
  },
  modeButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: rootStyles.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
    marginHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(254, 254, 254, 1)",
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 2,
    borderTopColor: rootStyles.colors.gray2,
  },
  completeButton: {
    backgroundColor: "rgba(74, 143, 62, 1)",
    padding: 12,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
    marginRight: 4,
  },
  infoContainer: {
    marginLeft: 12,
    width: "65%",
    alignItems: "flex-start",
  },
  infoText: {
    color: rootStyles.colors.gray5,
    padding: 2,
    textAlign: "center",
    ...rootStyles.fontStyles.subTitle,
    fontSize: 14,
  },
  completeButtonText: {
    color: "#FEFEFE",
    textAlign: "center",
    ...rootStyles.fontStyles.subTitle,
    fontSize: 14,
  },
});
