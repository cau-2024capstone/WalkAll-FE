// LoadingModal.js

import React, { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet, Modal } from "react-native";
import { Image } from "expo-image";
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

  const localIP = "192.168.45.211"; // 자신의 IP로 변경
  const useMockData = false; // true로 설정 시 Mock 데이터 사용
  const userIdf = "U0"; // 사용자 ID, 필요에 따라 변경

  const [progressMessages, setProgressMessages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(true);

  useEffect(() => {
    if (useMockData) {
      // Mock 데이터 사용
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
      setIsModalVisible(false); // 모달 닫기
      navigation.navigate("RecommendedRoutes", {
        routesData,
        start,
        ways,
        end,
        selectedPath,
        selectedGoal,
        inputValue,
        userIdf,
        localIP,
      });
      return;
    }

    const fetchData = async () => {
      try {
        setProgressMessages(["사용자가 정한 위치 검증 중..."]);

        // 가장 가까운 점 ID를 가져오는 함수
        const getClosestPointId = async (lat, lng, pointType) => {
          const url = `https://accurately-healthy-duckling.ngrok-free.app/api/points/closest-point?lat=${lat}&lng=${lng}&radius=50`;
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
          if (!data || data === "null") {
            console.log(`${pointType}는 데이터베이스 내에 존재하지 않습니다.`);
            return null;
          }
          console.log(`Closest point ID for ${pointType}:`, data);
          return data.replace(/"/g, ""); // 문자열에서 불필요한 따옴표 제거
        };

        // 출발지의 가장 가까운 점 ID 가져오기
        const startPromise = getClosestPointId(
          startMarker.latitude,
          startMarker.longitude,
          "출발지"
        );

        // 도착지의 가장 가까운 점 ID 가져오기
        const endPromise = getClosestPointId(
          destinationMarker.latitude,
          destinationMarker.longitude,
          "도착지"
        );

        // 경유지의 가장 가까운 점 ID 가져오기
        let waypointPromises = [];
        if (waypoints && waypoints.length > 0) {
          waypointPromises = waypoints.map((wp, index) =>
            getClosestPointId(wp.latitude, wp.longitude, `경유지 ${index + 1}`)
          );
        }

        // 모든 closest-point 호출 완료 후
        const startId = await startPromise;
        const endId = await endPromise;
        const waypointIds = await Promise.all(waypointPromises);

        // 검증 완료 메시지로 업데이트
        setProgressMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = "사용자가 정한 위치 검증 완료";
          return newMessages;
        });

        // 추천 경로 생성 중 메시지 추가
        setProgressMessages((prev) => [...prev, "추천 경로 생성 중..."]);

        if (!startId || !endId) {
          Alert.alert(
            "죄송합니다",
            "출발지나 도착지가 데이터베이스 내에 존재하지 않습니다."
          );
          setIsModalVisible(false); // 모달 닫기
          navigation.navigate("StartPointSelection");
          return;
        }

        // 경유지 중 존재하지 않는 곳이 있는지 확인
        if (waypointIds.includes(null)) {
          Alert.alert(
            "죄송합니다",
            "경유지 중 일부가 데이터베이스 내에 존재하지 않습니다."
          );
          setIsModalVisible(false); // 모달 닫기
          navigation.navigate("StartPointSelection");
          return;
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

        const fetchRoutes = async (bodyParams) => {
          let routesData = null;
          if (startId === endId) {
            // 시작점과 도착점이 동일한 경우
            bodyParams.startPoint = startId;

            const url = `https://accurately-healthy-duckling.ngrok-free.app/api/routes/findRoutesWithSameStartPoint`;
            console.log("Calling findRoutesWithSameStartPoint API:", url);
            console.log("Request body:", JSON.stringify(bodyParams));

            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(bodyParams),
            });

            if (!response.ok) {
              console.log("Failed to fetch routes:", response.statusText);
              throw new Error("Failed to fetch routes");
            }

            routesData = await response.json();

            // Filter out duplicate routes (same route in different directions)
            const uniqueRoutes = [];
            const routeSet = new Set();
            routesData.forEach((route) => {
              const routeKey = route.roads
                .map((road) => road.idf)
                .sort()
                .join(",");
              if (!routeSet.has(routeKey)) {
                routeSet.add(routeKey);
                uniqueRoutes.push(route);
              }
            });
            routesData = uniqueRoutes;
          } else {
            // 시작점과 도착점이 다른 경우
            bodyParams.startId = startId;
            bodyParams.endId = endId;

            const url = `https://accurately-healthy-duckling.ngrok-free.app/api/routes/findRoutes`;
            console.log("Calling findRoutes API:", url);
            console.log("Request body:", JSON.stringify(bodyParams));

            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(bodyParams),
            });

            if (!response.ok) {
              console.log("Failed to fetch routes:", response.statusText);
              throw new Error("Failed to fetch routes");
            }

            routesData = await response.json();
          }
          return routesData;
        };

        let routesData = await fetchRoutes({ ...body });

        if (routesData && routesData.length > 0) {
          // 경로를 성공적으로 찾았을 경우
          setIsModalVisible(false); // 모달 닫기
          navigation.navigate("RecommendedRoutes", {
            routesData,
            startMarker,
            waypoints,
            destinationMarker,
            selectedPath,
            selectedGoal,
            inputValue,
            userIdf,
            localIP,
          });
          return;
        }

        // routeType 제거하고 다시 시도
        const failedRouteType = body.routeType;
        delete body.routeType;
        routesData = await fetchRoutes({ ...body });

        if (routesData && routesData.length > 0) {
          Alert.alert(
            "알림",
            `${failedRouteType} 경로를 찾지 못했습니다. 경로 타입을 변경해주세요.`
          );
          setIsModalVisible(false); // 모달 닫기
          navigation.navigate("UserInput", {
            startMarker,
            waypoints,
            destinationMarker,
            failedRouteType: true,
          });
          return;
        }

        // max~ 파라미터 제거하고 다시 시도
        const failedGoal = selectedGoal;
        const failedInputValue = inputValue;
        delete body.maxTime;
        delete body.maxDistance;
        routesData = await fetchRoutes({ ...body });

        if (routesData && routesData.length > 0) {
          Alert.alert(
            "알림",
            `${failedInputValue}${
              selectedGoal === "time" ? "분" : "m"
            } 이내의 경로를 찾을 수 없습니다. 목표를 수정하시거나 목표 설정을 삭제해주세요.`
          );
          setIsModalVisible(false); // 모달 닫기
          navigation.navigate("UserInput", {
            startMarker,
            waypoints,
            destinationMarker,
            failedGoal: true,
          });
          return;
        }

        // 조건에 맞는 경로를 찾을 수 없음
        Alert.alert("죄송합니다", "조건에 맞는 경로를 찾을 수 없습니다.");
        setIsModalVisible(false); // 모달 닫기
        navigation.navigate("StartPointSelection");
      } catch (error) {
        console.log("Error in fetchData:", error);
        Alert.alert("오류가 발생했습니다", "다시 시도해주세요.");
        setIsModalVisible(false); // 모달 닫기
        navigation.navigate("StartPointSelection");
      }
    };

    fetchData();
  }, []);

  return (
    <Modal transparent={true} animationType="fade" visible={isModalVisible}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <Image
            source={require("../../assets/images/walkingAnimation.gif")}
            style={{ width: 100, height: 100 }}
          />
          {progressMessages.map((message, index) => (
            <Text key={index} style={{ marginTop: 10 }}>
              {message}
            </Text>
          ))}
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
