import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

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
            <Button
              title="현 위치로 설정"
              onPress={() => {
                /* 위치 설정 기능 추가 */
              }}
            />
            <Button title="확인" onPress={onConfirm} />
          </>
        )}
        {routeStage === "setStopoverPoint" && (
          <Button title="확인" onPress={onConfirm} />
        )}
        {routeStage === "setDestinationPoint" && (
          <>
            <Button
              title="현 위치로 설정"
              onPress={() => {
                /* 위치 설정 기능 추가 */
              }}
            />
            <Button
              title="추천 경로 생성"
              onPress={() => {
                /* 경로 생성 기능 추가 */
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
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
});

export default RouteHeader;
