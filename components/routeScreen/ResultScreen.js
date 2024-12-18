// ResultScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { Image } from "expo-image";

const ResultScreen = ({ navigation, route }) => {
  const { passedRoutePoints, deviatedEdges, problemRoutes } = route.params;
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [problemRoutesState, setProblemRoutesState] = useState(problemRoutes);

  const handleCancelInquiry = (index) => {
    Alert.alert(
      "문의 취소",
      "해당 문의를 취소하시겠습니까?",
      [
        {
          text: "아니오",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "네",
          onPress: () => {
            const updatedProblemRoutes = [...problemRoutesState];
            updatedProblemRoutes.splice(index, 1);
            setProblemRoutesState(updatedProblemRoutes);
          },
        },
      ],
      { cancelable: false }
    );
  };

  // 개척한 경로 관련 코드 주석 처리
  // const handleSubmitPioneeredRoutes = async () => {
  //   setShowCompletionModal(true);
  //   // 새로운 경로를 서버에 전송하는 로직을 여기에 추가하세요.
  //   // 이 예제에서는 단순히 2초 후에 로딩 모달을 숨깁니다.
  //   setTimeout(() => {
  //     setShowCompletionModal(false);
  //     Alert.alert("제출 완료", "개척한 경로가 제출되었습니다.");
  //   }, 2000);
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>산책 결과</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: passedRoutePoints[0]?.latitude || 37.504558,
          longitude: passedRoutePoints[0]?.longitude || 126.956951,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {/* 지나간 경로 */}
        {passedRoutePoints.length > 0 && (
          <Polyline
            coordinates={passedRoutePoints}
            strokeColor="#808080"
            strokeWidth={3}
          />
        )}
        {/* 사용자가 실제로 움직인 내용 (보라색 이탈 경로) */}
        {deviatedEdges &&
          deviatedEdges.length > 0 &&
          deviatedEdges.map((edge, index) => (
            <Polyline
              key={`deviatedEdge-${index}`}
              coordinates={edge.coordinates}
              strokeColor="purple"
              strokeWidth={3}
            />
          ))}
        {/* 문의한 경로 */}
        {problemRoutesState &&
          problemRoutesState.length > 0 &&
          problemRoutesState.map((route, index) => (
            <Polyline
              key={`problemRoute-${index}`}
              coordinates={route.coordinates}
              strokeColor={route.color}
              strokeWidth={3}
            />
          ))}
      </MapView>
      <View style={styles.buttonContainer}>
        {/* 개척한 경로 관련 버튼 주석 처리
        {newEdges && newEdges.length > 0 && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitPioneeredRoutes}
          >
            <Text style={styles.buttonText}>개척한 경로 문의하기</Text>
          </TouchableOpacity>
        )}
        */}
        {problemRoutesState &&
          problemRoutesState.length > 0 &&
          problemRoutesState.map((route, index) => (
            <TouchableOpacity
              key={`cancelInquiry-${index}`}
              style={styles.cancelButton}
              onPress={() => handleCancelInquiry(index)}
            >
              <Text style={styles.buttonText}>문의 취소하기</Text>
            </TouchableOpacity>
          ))}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => navigation.navigate("PingSelection")}
        >
          <Text style={styles.buttonText}>메인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>

      {/* 로딩 모달 */}
      {showCompletionModal && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showCompletionModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <Image
                source={require("../../assets/images/walkingAnimation.gif")}
                style={{ width: 100, height: 100 }}
              />
              <Text style={{ marginTop: 10 }}>처리 중...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(254, 254, 254, 1)",
  },
  title: {
    paddingTop: 60,
    paddingBottom: 15,
    textAlign: "center",
    fontSize: 23,
    color: "rgba(23, 29, 27, 1)",
    fontWeight: "bold",
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    padding: 10,
  },
  submitButton: {
    backgroundColor: "rgba(192, 235, 166, 1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(134, 203, 122, 1)",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 109, 1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(1, 1, 1, 1)",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "rgba(74, 143, 62, 1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(52, 121, 40, 1)",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000040",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});
