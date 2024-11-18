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

const UserInput = ({ navigation, route }) => {
  const { startMarker, waypoints, destinationMarker } = route.params;

  const [selectedPath, setSelectedPath] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("none");
  const [inputValue, setInputValue] = useState("");
  const [region, setRegion] = useState(null);

  const pathOptions = [
    { label: "편한 길", value: "Street" },
    { label: "골목길", value: "alley" },
    { label: "다이어트 길", value: "diet" },
  ];

  const goals = [
    { label: "목표 설정 안하기", value: "none" },
    { label: "거리 (m)", value: "m" },
    { label: "칼로리 (kcal)", value: "kcal" },
    { label: "시간 (분)", value: "time" },
  ];

  useEffect(() => {
    const calculateRegion = (points) => {
      const totalLat = points.reduce((sum, point) => sum + point.latitude, 0);
      const totalLng = points.reduce((sum, point) => sum + point.longitude, 0);
      const centerLat = totalLat / points.length;
      const centerLng = totalLng / points.length;

      const latitudes = points.map((point) => point.latitude);
      const longitudes = points.map((point) => point.longitude);

      const maxLat = Math.max(...latitudes);
      const minLat = Math.min(...latitudes);
      const maxLng = Math.max(...longitudes);
      const minLng = Math.min(...longitudes);

      const latitudeDelta = Math.max((maxLat - minLat) * 1.2, 0.005);
      const longitudeDelta = Math.max((maxLng - minLng) * 1.2, 0.005);

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta,
        longitudeDelta,
      };
    };

    const totalPoints = [startMarker, ...waypoints, destinationMarker];
    setRegion(calculateRegion(totalPoints));
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
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>산책 목표를 설정해주세요</Text>
      </View>
      {region && (
        <MapView
          style={styles.routeMap}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          {startMarker && (
            <Marker coordinate={startMarker} pinColor="#008000" />
          )}
          {waypoints &&
            waypoints.map((wp, index) => (
              <Marker key={index} coordinate={wp} pinColor="#FFA500" />
            ))}
          {destinationMarker && (
            <Marker coordinate={destinationMarker} pinColor="#FF0000" />
          )}
        </MapView>
      )}

      {/* 목표 선택 Modal */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedGoal
            ? goals.find((goal) => goal.value === selectedGoal).label
            : "목표를 선택하세요"}
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>목표 선택</Text>
            <FlatList
              data={goals}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedGoal(item.value);
                    setInputValue(""); // 입력 값 초기화
                    setShowModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* 선택된 옵션에 따른 입력 필드와 단위 표시 */}
      {selectedGoal !== "none" && (
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
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
          <Text style={styles.unitText}>
            {selectedGoal === "m" && "m"}
            {selectedGoal === "kcal" && "kcal"}
            {selectedGoal === "time" && "분"}
          </Text>
        </View>
      )}

      {/* 경로 선택 버튼 */}
      <View style={styles.buttonGroup}>
        {pathOptions.map((path) => (
          <TouchableOpacity
            key={path.value}
            style={[
              styles.pathButton,
              selectedPath === path.value && styles.selectedPathButton,
            ]}
            onPress={() => setSelectedPath(path.value)}
          >
            <Text
              style={[
                styles.pathButtonText,
                selectedPath === path.value && styles.selectedPathButtonText,
              ]}
            >
              {path.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={generateRoutes}>
          <Text style={styles.buttonText}>추천 경로 생성</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UserInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFEFE", // 기본 배경색
  },
  titleContainer: {
    backgroundColor: "rgba(223, 247, 202, 1)", // 연한 초록색
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000", // 검정 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  titleText: {
    textAlign: "center",
    fontSize: 24,
    color: "rgba(74, 143, 62, 1)", // 진한 초록색
  },
  routeMap: {
    width: "100%",
    height: 300,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  pathButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#F2F2F2", // 연한 회색
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // 진한 초록색 테두리
  },
  selectedPathButton: {
    backgroundColor: "rgba(74, 143, 62, 1)", // 진한 초록색
  },
  pathButtonText: {
    fontSize: 16,
    color: "#000", // 검정색 글자
  },
  selectedPathButtonText: {
    color: "#FEFEFE", // 흰색 글자
  },
  dropdownButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    backgroundColor: "#F2F2F2", // 연한 회색
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // 진한 초록색 테두리
    alignItems: "center",
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
    width: "90%",
  },
  buttonText: {
    color: "#FEFEFE", // 흰색
    textAlign: "center",
  },
});
