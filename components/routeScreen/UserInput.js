// UserInput.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Image } from "expo-image";
import rootStyles from "../../styles/StyleGuide";

const UserInput = ({ navigation, route }) => {
  const {
    startMarker,
    waypoints,
    destinationMarker,
    failedRouteType,
    failedGoal,
  } = route.params;

  const [selectedPath, setSelectedPath] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("none");
  const [inputValue, setInputValue] = useState("");
  const [region, setRegion] = useState(null);
  const [isRegionReady, setIsRegionReady] = useState(false);
  const [goalFailed, setGoalFailed] = useState(false);
  const [routeTypeFailed, setRouteTypeFailed] = useState(false);

  const pathOptions = [
    { label: "편한 길", value: "Street" },
    { label: "골목길", value: "Alley" },
    { label: "다이어트 길", value: "Steep" },
    { label: "자연 친화 길", value: "Tree" },
  ];

  const goals = [
    { label: "설정된 목표 없음", value: "none" },
    { label: "최대 거리 (m)", value: "m" },
    { label: "최대 칼로리 (kcal)", value: "kcal" },
    { label: "최대 시간 (분)", value: "time" },
  ];

  useEffect(() => {
    if (route.params?.failedRouteType) {
      setSelectedPath(null);
      setRouteTypeFailed(true);
      setTimeout(() => {
        setRouteTypeFailed(false);
      }, 5000);
    }
    if (route.params?.failedGoal) {
      setSelectedGoal("none");
      setInputValue("");
      setGoalFailed(true);
      setTimeout(() => {
        setGoalFailed(false);
      }, 5000);
    }
  }, [route.params]);

  useEffect(() => {
    if (startMarker && destinationMarker) {
      const calculateRegion = (points) => {
        const totalLat = points.reduce((sum, point) => sum + point.latitude, 0);
        const totalLng = points.reduce(
          (sum, point) => sum + point.longitude,
          0
        );
        const centerLat = totalLat / points.length;
        const centerLng = totalLng / points.length;

        const latitudes = points.map((point) => point.latitude);
        const longitudes = points.map((point) => point.longitude);

        const maxLat = Math.max(...latitudes);
        const minLat = Math.min(...latitudes);
        const maxLng = Math.max(...longitudes);
        const minLng = Math.min(...longitudes);

        const latitudeDelta = Math.max((maxLat - minLat) * 1.2, 0.003);
        const longitudeDelta = Math.max((maxLng - minLng) * 1.2, 0.003);

        return {
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta,
          longitudeDelta,
        };
      };

      const totalPoints = [startMarker, ...waypoints, destinationMarker];
      const calculatedRegion = calculateRegion(totalPoints);
      setRegion(calculatedRegion);
      setIsRegionReady(true);
    }
  }, [startMarker, waypoints, destinationMarker]);

  const generateRoutes = () => {
    if (selectedGoal === "kcal") {
      Alert.alert(
        "죄송합니다",
        "칼로리 목표 설정은 현재 지원되지 않습니다. 다른 목표를 선택해주세요."
      );
      return;
    }

    if (selectedGoal !== "none" && isNaN(Number(inputValue))) {
      Alert.alert("오류", "입력 값이 숫자가 아닙니다. 숫자를 입력해주세요.");
      return;
    }

    navigation.navigate("LoadingModal", {
      startMarker,
      waypoints,
      destinationMarker,
      selectedPath,
      selectedGoal,
      inputValue,
    });
  };

  return (
    <ScrollView style={localStyles.container}>
      <View style={localStyles.titleContainer}>
        <Text style={localStyles.titleText}>산책 목표를 설정해주세요</Text>
      </View>
      {isRegionReady ? (
        <MapView
          style={localStyles.routeMap}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
        >
          {startMarker && (
            <Marker coordinate={startMarker}>
              <Image
                source={require("../../assets/images/startPing.png")}
                style={{ width: 60, height: 60 }}
              />
            </Marker>
          )}
          {waypoints &&
            waypoints.map((wp, index) => (
              <Marker key={index} coordinate={wp}>
                <Image
                  source={require("../../assets/images/wayPointPing.png")}
                  style={{ width: 60, height: 60 }}
                />
              </Marker>
            ))}
          {destinationMarker && (
            <Marker coordinate={destinationMarker}>
              <Image
                source={require("../../assets/images/endPing.png")}
                style={{ width: 60, height: 60 }}
              />
            </Marker>
          )}
        </MapView>
      ) : (
        <View style={localStyles.loadingContainer}>
          <Text style={localStyles.loadingText}>
            지도 데이터를 불러오는 중...
          </Text>
        </View>
      )}

      {/* 경로 선택 버튼 */}
      <View style={localStyles.buttonGroup}>
        {pathOptions.map((path) => (
          <TouchableOpacity
            key={path.value}
            style={[
              localStyles.pathButton,
              selectedPath === path.value && localStyles.selectedPathButton,
              routeTypeFailed && localStyles.failedPathButton,
            ]}
            onPress={() => {
              if (selectedPath === path.value) {
                setSelectedPath(null); // 다시 눌러서 취소 가능하게
              } else {
                setSelectedPath(path.value);
              }
            }}
          >
            <Text
              style={[
                localStyles.pathButtonText,
                selectedPath === path.value &&
                  localStyles.selectedPathButtonText,
              ]}
            >
              {path.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 목표 선택 Modal */}
      <TouchableOpacity
        style={[
          localStyles.dropdownButton,
          goalFailed && localStyles.failedDropdownButton,
        ]}
        onPress={() => setShowModal(true)}
      >
        <Text style={localStyles.dropdownButtonText}>
          {selectedGoal &&
            goals.find((goal) => goal.value === selectedGoal)?.label}
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={localStyles.modalContainer}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>목표 선택</Text>
            <FlatList
              data={goals}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={localStyles.modalItem}
                  onPress={() => {
                    setSelectedGoal(item.value);
                    setInputValue(""); // 입력 값 초기화
                    setShowModal(false);
                  }}
                >
                  <Text style={localStyles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* 선택된 옵션에 따른 입력 필드와 단위 표시 */}
      {selectedGoal !== "none" && (
        <View style={localStyles.inputSection}>
          <TextInput
            style={localStyles.input}
            value={inputValue}
            onChangeText={(text) => {
              // 숫자가 아닌 문자 제거
              const filteredText = text.replace(/[^0-9]/g, "");
              setInputValue(filteredText);
            }}
            placeholder={`${
              goals.find((g) => g.value === selectedGoal).label
            } 입력`}
            keyboardType="default" // 아이폰 오류있어서 숫자인풋 못했음
          />
          <Text style={localStyles.unitText}>
            {selectedGoal === "m" && "m"}
            {selectedGoal === "kcal" && "kcal"}
            {selectedGoal === "time" && "분"}
          </Text>
        </View>
      )}

      <View style={localStyles.buttonContainer}>
        <TouchableOpacity style={localStyles.button} onPress={generateRoutes}>
          <Text style={localStyles.buttonText}>추천 경로 생성</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UserInput;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFEFE", // 기본 배경색
  },
  titleContainer: {
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FEFEFE",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: rootStyles.colors.gray2,
  },
  titleText: {
    color: rootStyles.colors.gray6,
    marginLeft: 5,
    ...rootStyles.fontStyles.subTitle,
    fontSize: 20,
    fontWeight: "500",
  },
  routeMap: {
    width: "100%",
    height: 400,
  },
  buttonGroup: {
    borderTopWidth: 2,
    borderTopColor: rootStyles.colors.gray2,
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 5,
    marginTop: -1,
    marginHorizontal: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  pathButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F2F2F2", // 연한 회색
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // 진한 초록색 테두리
  },
  selectedPathButton: {
    backgroundColor: "rgba(74, 143, 62, 1)", // 진한 초록색
  },
  failedPathButton: {
    borderColor: "red", // 실패 시 빨간색 테두리
  },
  pathButtonText: {
    fontSize: 15,
    color: "#000", // 검정색 글자
  },
  selectedPathButtonText: {
    color: "#FEFEFE", // 흰색 글자
  },
  dropdownButton: {
    marginHorizontal: 24,
    marginVertical: 10,
    paddingVertical: 12,
    backgroundColor: "#F2F2F2", // 연한 회색
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // 진한 초록색 테두리
    alignItems: "center",
  },
  failedDropdownButton: {
    borderColor: "red", // 실패 시 빨간색 테두리
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#000", // 검정색
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // 반투명 검정
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "rgba(74, 143, 62, 1)", // 진한 초록색
  },
  modalItem: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 16,
    color: "#000", // 검정색
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // 진한 초록색 테두리
    borderRadius: 4,
    padding: 12,
  },
  unitText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#000", // 검정색
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 10,
  },
  button: {
    backgroundColor: "rgba(74, 143, 62, 1)", // 진한 초록색
    padding: 15,
    borderRadius: 8,
    width: "93%",
    marginTop: -4,
  },
  buttonText: {
    fontSize: 16,
    color: "#FEFEFE", // 흰색
    textAlign: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 300, // 지도 영역 높이와 동일하게 설정
  },
  loadingText: {
    fontSize: 16,
    color: "#000", // 검정색
  },
});
