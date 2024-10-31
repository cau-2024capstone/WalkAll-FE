import React from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";

// 헤더 컴포넌트
function RouteHeader({ routeStage, onConfirm }) {
  let title = "";

  switch (routeStage) {
    case "setStartingPoint":
      title = "출발지를 입력하세요";
      break;
    case "setStopoverPoint":
      title = "경유지를 입력하세요";
      break;
    case "setDestinationPoint":
      title = "도착지를 입력하세요";
      break;
    default:
      title = "Route";
  }

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.buttonContainer}>
        {routeStage === "setStartingPoint" && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                /* 위치 설정 기능 추가 */
              }}
            >
              <Text style={styles.buttonText}>현 위치로 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onConfirm}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </>
        )}
        {routeStage === "setStopoverPoint" && (
          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
        )}
        {routeStage === "setDestinationPoint" && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                /* 위치 설정 기능 추가 */
              }}
            >
              <Text style={styles.buttonText}>현 위치로 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                /* 경로 생성 기능 추가 */
              }}
            >
              <Text style={styles.buttonText}>추천 경로 생성</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 130,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
});

export default RouteHeader;
