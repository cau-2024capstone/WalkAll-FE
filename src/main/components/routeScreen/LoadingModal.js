// LoadingModal.js
import React, { useEffect } from "react";
import { View, Text, Alert, StyleSheet, Modal, Image } from "react-native";
import { result } from "./backendTest"; // Mock 데이터 사용 시 필요

const LoadingModal = ({ navigation, route }) => {
  const {
    startMarker,
    waypoints,
    destinationMarker,
    selectedPath,
    selectedGoal,
    inputValue,
  } = route.params;

  const localIP = "192.168.45.28"; // 자신의 IP로 변경
  const useMockData = false; // true로 설정 시 Mock 데이터 사용

  useEffect(() => {
    if (useMockData) {
      console.log("Mock data 사용 중...");
      const routesData = result;
      const start = {
        latitude: 37.5052899390435,
        longitude: 126.9548345273645,
      };
      const ways = [];
      const end = {
        latitude: 37.506312931566,
        longitude: 126.9568734886127,
      };

      navigation.navigate("RecommendedRoutes", {
        routesData,
        start,
        ways,
        end,
        selectedPath,
        selectedGoal,
        inputValue,
      });
      return;
    }
    const fetchData = async () => {
      try {
        // 칼로리 목표는 아직 구현되지 않음
        if (selectedGoal === "kcal") {
          Alert.alert(
            "죄송합니다",
            "칼로리 목표 설정은 현재 지원되지 않습니다. 다른 목표를 선택해주세요."
          );
          navigation.goBack();
          return;
        }

        // 가장 가까운 점 ID를 가져오는 함수
        const getClosestPointId = async (lat, lng, pointType) => {
          const url = `http://${localIP}:8082/api/points/closest-point?lat=${lat}&lng=${lng}&radius=50`;
          console.log(`Fetching closest point for ${pointType}: ${url}`);

          const response = await fetch(url);
          if (!response.ok) {
            console.log(
              `Failed to fetch closest point for ${pointType}:`,
              response.statusText
            );
            throw new Error(`Failed to fetch closest point for ${pointType}`);
          }
          const data = await response.text(); // 문자열로 응답을 받음
          if (!data) {
            Alert.alert(
              "죄송합니다",
              `${pointType}는 저희가 그린 지도 내에 존재하지 않습니다.`
            );
            navigation.navigate("StartPointSelection");
            throw new Error(`${pointType} not found within radius`);
          }
          console.log(`Closest point ID for ${pointType}:`, data);
          return data.replace(/"/g, ""); // 문자열에서 불필요한 따옴표 제거 (리스트에서 가져와서 따옴표가 포함되어 있음)
        };

        // 출발지의 가장 가까운 점 ID 가져오기
        const startId = await getClosestPointId(
          startMarker.latitude,
          startMarker.longitude,
          "출발지"
        );

        // 도착지의 가장 가까운 점 ID 가져오기
        let endId;
        if (destinationMarker) {
          endId = await getClosestPointId(
            destinationMarker.latitude,
            destinationMarker.longitude,
            "도착지"
          );
        } else {
          endId = startId; // 도착지가 없을 경우 출발지와 동일하게 설정
        }

        // 경유지의 가장 가까운 점 ID 가져오기
        let waypointIds = [];
        if (waypoints && waypoints.length > 0) {
          for (let i = 0; i < waypoints.length; i++) {
            const wp = waypoints[i];
            const wpId = await getClosestPointId(
              wp.latitude,
              wp.longitude,
              `경유지 ${i + 1}`
            );
            waypointIds.push(wpId.replace(/"/g, "")); // 문자열에서 불필요한 따옴표 제거
          }
        }

        // 모든 closest-point 호출이 성공적으로 완료된 후에 경로 생성 API 호출
        let body = {};

        if (selectedGoal !== "none" && inputValue) {
          if (selectedGoal === "time") {
            body.maxTime = Number(inputValue);
          } else if (selectedGoal === "m") {
            body.maxDistance = Number(inputValue);
          }
        }

        if (selectedPath) {
          body.routeType = selectedPath;
        }

        if (waypointIds.length > 0) {
          body.waypointIds = waypointIds;
        }

        let routesData = null;

        if (startId === endId) {
          // 시작점과 도착점이 동일한 경우
          body.startPoint = startId;

          const url = `http://${localIP}:8082/api/routes/findRoutesWithSameStartPoint`;
          console.log("Calling findRoutesWithSameStartPoint API:", url);
          console.log("Request body:", JSON.stringify(body));

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            console.log("Failed to fetch routes:", response.statusText);
            throw new Error("Failed to fetch routes");
          }

          routesData = await response.json();
        } else {
          // 시작점과 도착점이 다른 경우
          body.startId = startId;
          body.endId = endId;

          const url = `http://${localIP}:8082/api/routes/findRoutes`;
          console.log("Calling findRoutes API:", url);
          console.log("Request body:", JSON.stringify(body));

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            console.log("Failed to fetch routes:", response.statusText);
            throw new Error("Failed to fetch routes");
          }

          routesData = await response.json();
        }

        // 경로 데이터가 없을 경우 처리
        if (!routesData || routesData.length === 0) {
          Alert.alert("죄송합니다", "조건에 맞는 경로를 찾을 수 없습니다.");
          navigation.navigate("StartPointSelection");
          return;
        }

        // RecommendedRoutes 화면으로 이동
        navigation.navigate("RecommendedRoutes", {
          routesData,
          startMarker,
          waypoints,
          destinationMarker,
          selectedPath,
          selectedGoal,
          inputValue,
        });
      } catch (error) {
        console.log("Error in fetchData:", error);
        Alert.alert("오류가 발생했습니다", "다시 시도해주세요.");
        navigation.navigate("StartPointSelection");
      }
    };

    fetchData();
  }, []);

  return (
    <Modal transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          {/* 걷는 애니메이션으로 변경 */}
          {/* <Image
            source={require("./assets/walking_animation.gif")} // 애니메이션 파일로 교체 필요
            style={{ width: 100, height: 100 }}
          /> */}
          <Text style={{ marginTop: 10 }}>추천 경로를 생성 중입니다...</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;

const styles = StyleSheet.create({
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
