// Updated TestScreen.js

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { Image } from "expo-image";

const TestScreen = ({ selectedRoute, localIP, userIdf, navigation }) => {
  const [isSetUserLocationActive, setIsSetUserLocationActive] = useState(false); // 사용자 위치 설정 활성화 여부
  const [isMoveMapActive, setIsMoveMapActive] = useState(false); // 지도 이동 활성화 여부
  const [userLocation, setUserLocation] = useState(null); // 사용자 위치
  const [routePoints, setRoutePoints] = useState([]); // 경로 포인트
  const [isOffRoute, setIsOffRoute] = useState(false); // 이전 사용자 위치가 경로를 이탈했는 지 여부
  const [lastOnRoutePoint, setLastOnRoutePoint] = useState(null); // 마지막으로 경로 위에 있던 포인트
  const [lastOffRoutePoint, setLastOffRoutePoint] = useState(null); // 마지막 이탈 포인트
  const [passedRoutePoints, setPassedRoutePoints] = useState([]); // 지나온 경로 포인트
  const [arrivalButtonEnabled, setArrivalButtonEnabled] = useState(false); // 도착 버튼 활성화 여부
  const [temporaryPin, setTemporaryPin] = useState(null); // 임시 핀
  const [lastDestinationPoint, setLastDestinationPoint] = useState(null); // 마지막 목적지 포인트
  const [showCompletionModal, setShowCompletionModal] = useState(false); // 로딩 모달
  const [showReportButtons, setShowReportButtons] = useState(false); // 문제 경로 설정 버튼
  const [problemStartPoint, setProblemStartPoint] = useState(null); // 문제 경로 시작 지점
  const [problemEndPoint, setProblemEndPoint] = useState(null); // 문제 경로 도착 지점
  const [showEndNavigationConfirm, setShowEndNavigationConfirm] =
    useState(false); // 네비게이션 종료 확인
  const [problemRouteSetting, setProblemRouteSetting] = useState(null); // "start" or "end"
  const [userDeviatedPoints, setUserDeviatedPoints] = useState([]);
  const [newPoints, setNewPoints] = useState([]); // 추가된 새로운 포인트들
  const [newEdges, setNewEdges] = useState([]); // 추가된 새로운 엣지들
  const [problemRoutes, setProblemRoutes] = useState([]); // 문제 경로를 저장할 배열
  const mapRef = useRef(null); // 지도 참조

  useEffect(() => {
    // 경로 처리 로직
    const processRoads = (roads, startId) => {
      let currentPointId = startId;
      const processedRoads = [];

      roads.forEach((road) => {
        const [fromId, toId] = road.idf.split("_");
        if (fromId === currentPointId) {
          // 도로가 올바른 방향
          processedRoads.push(road);
          currentPointId = toId;
        } else if (toId === currentPointId) {
          // 도로가 반대 방향이므로 반전
          const reversedRoad = {
            ...road,
            idf: `${toId}_${fromId}`,
            startLat: road.endLat,
            startLng: road.endLng,
            endLat: road.startLat,
            endLng: road.startLng,
          };
          processedRoads.push(reversedRoad);
          currentPointId = fromId;
        } else {
          console.log(
            "도로가 현재 포인트와 연결되지 않습니다.",
            road,
            currentPointId
          );
        }
      });
      return processedRoads;
    };

    const { start, roads } = selectedRoute;
    const processedRoads = processRoads(roads, start);
    const points = generateRoutePoints(processedRoads);
    setRoutePoints(points);
    setLastOnRoutePoint(points[0]); // 사용자 경로 이탈 전 마지막 세분화된 포인트
    setLastDestinationPoint(points[points.length - 1]); // 마지막 목적지 포인트
    addAndRemoveTemporaryPin(); // 임시 핀 추가 및 제거 (맵 리렌더링)
  }, []);

  // 맵을 리렌더링하기 위해 임시 핀을 추가하고 삭제
  const addAndRemoveTemporaryPin = () => {
    const tempCoordinate = {
      latitude: 30, // 임의의 위치
      longitude: 120,
    };
    setTemporaryPin(tempCoordinate);

    // 50ms 후에 임시 핀 제거
    setTimeout(() => {
      setTemporaryPin(null);
    }, 50);
  };

  // 경로 포인트 생성 함수
  const generateRoutePoints = (roads) => {
    let routePoints = [];
    for (let i = 0; i < roads.length; i++) {
      const road = roads[i];
      const start = { latitude: road.startLat, longitude: road.startLng };
      const end = { latitude: road.endLat, longitude: road.endLng };
      const segmentPoints = interpolatePoints(start, end);
      routePoints = routePoints.concat(segmentPoints);
    }
    return routePoints;
  };

  // 두 지점 사이를 세분화하여 반환 (10개의 점)
  const interpolatePoints = (start, end, numPoints = 10) => {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const latitude =
        start.latitude + ((end.latitude - start.latitude) * i) / numPoints;
      const longitude =
        start.longitude + ((end.longitude - start.longitude) * i) / numPoints;
      points.push({ latitude, longitude });
    }
    return points;
  };

  // 사용자 위치 설정 버튼 클릭 시 호출
  const handleSetUserLocation = () => {
    setIsSetUserLocationActive(true);
    setIsMoveMapActive(false);
    setProblemRouteSetting(null);
  };

  // 지도 이동 버튼 클릭 시 호출
  const handleMoveMap = () => {
    setIsSetUserLocationActive(false);
    setIsMoveMapActive(true);
    setProblemRouteSetting(null);
  };

  // 문제 경로 설정 버튼 클릭 시 호출
  const handleReportProblemRoute = () => {
    setShowReportButtons(true);
    setIsSetUserLocationActive(false);
    setIsMoveMapActive(false);
  };

  // 문제 경로 시작 지점 설정
  const handleSetProblemStartPoint = () => {
    setProblemRouteSetting("start");
    setShowReportButtons(false);
    setIsSetUserLocationActive(false);
    setIsMoveMapActive(false);
  };

  // 문제 경로 도착 지점 설정
  const handleSetProblemEndPoint = () => {
    setProblemRouteSetting("end");
    setShowReportButtons(false);
    setIsSetUserLocationActive(false);
    setIsMoveMapActive(false);
  };

  // 문제 경로 확인 버튼 클릭 시 호출
  const handleConfirmProblemRoute = async () => {
    if (!problemStartPoint || !problemEndPoint) {
      Alert.alert("오류", "문제 지점 두 포인트를 설정해주세요.");
      return;
    }

    // 로딩 표시
    setShowCompletionModal(true);

    // 두 포인트의 가장 가까운 세분화된 점 찾기
    try {
      console.log(
        `문제 시작 지점에 대한 closest-point API 호출 (휘수형 부분): lat=${problemStartPoint.latitude}, lng=${problemStartPoint.longitude}`
      );
      const startPointResponse = await fetch(
        `https://accurately-healthy-duckling.ngrok-free.app/api/points/closest-point?lat=${problemStartPoint.latitude}&lng=${problemStartPoint.longitude}&radius=20`
      );
      const endPointResponse = await fetch(
        `https://accurately-healthy-duckling.ngrok-free.app/api/points/closest-point?lat=${problemEndPoint.latitude}&lng=${problemEndPoint.longitude}&radius=20`
      );

      const startPointData = await startPointResponse.text(); // 응답이 JSON이 아니라 text로 받아옴
      const endPointData = await endPointResponse.text();

      if (
        !startPointData ||
        startPointData === "null" ||
        !endPointData ||
        endPointData === "null"
      ) {
        Alert.alert("문의 실패", "잘못된 문의 위치입니다.");
      } else {
        // 가장 가까운 점의 ID
        const startId = startPointData.replace(/"/g, "");
        const endId = endPointData.replace(/"/g, "");

        console.log(
          `문의한 시작 핀 ID: ${startId}, 문의한 도착 핀 ID: ${endId}`
        );

        // 세분화된 포인트 중 가장 가까운 두 점 찾기
        const nearestStartPoint = findNearestPoint(
          problemStartPoint,
          routePoints.concat(passedRoutePoints)
        );
        const nearestEndPoint = findNearestPoint(
          problemEndPoint,
          routePoints.concat(passedRoutePoints)
        );

        // 검은색 선으로 연결
        setProblemRoutes((prevRoutes) => [
          ...prevRoutes,
          {
            coordinates: [nearestStartPoint, nearestEndPoint],
            color: "black",
          },
        ]);

        // 문의 핀 제거 및 임시 핀 추가
        setProblemStartPoint(null);
        setProblemEndPoint(null);
        addAndRemoveTemporaryPin();

        Alert.alert("문의 완료", "문의가 성공적으로 접수되었습니다.");
      }
    } catch (error) {
      console.log("Error fetching closest points:", error);
      Alert.alert("문의 실패", "API 호출 실패");
    } finally {
      setShowCompletionModal(false);
      setProblemRouteSetting(null);
      setShowReportButtons(false);
      // 산책 종료 여부 확인
      Alert.alert(
        "산책 종료",
        "산책을 종료하시겠습니까?",
        [
          {
            text: "아니오",
            onPress: () => {},
            style: "cancel",
          },
          {
            text: "네",
            onPress: () => {
              navigation.navigate("StartPointSelection");
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  // 사용자 위치 설정 취소
  const handleCancelProblemRoute = () => {
    setShowReportButtons(false);
    setProblemRouteSetting(null);
    setProblemStartPoint(null);
    setProblemEndPoint(null);
    setIsSetUserLocationActive(false);
    setIsMoveMapActive(false);
  };

  // 네비게이션 종료 확인
  const handleEndNavigation = () => {
    setShowEndNavigationConfirm(true);
  };

  // 네비게이션 종료 확인 모달에서 확인 버튼 클릭 시 호출
  const confirmEndNavigation = () => {
    setShowEndNavigationConfirm(false);
    setShowCompletionModal(true);

    // 사용자 이탈 경로 처리
    processUserDeviations();

    setTimeout(() => {
      setShowCompletionModal(false);
      Alert.alert("산책 종료", "산책이 종료되었습니다.");
      navigation.navigate("StartPointSelection");
    }, 2000);
  };

  // 네비게이션 종료 확인 모달에서 취소 버튼 클릭 시 호출
  const cancelEndNavigation = () => {
    setShowEndNavigationConfirm(false);
  };

  const onMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    // 문제 경로 시작 지점 설정
    if (problemRouteSetting === "start") {
      setProblemStartPoint({ latitude, longitude });
      addAndRemoveTemporaryPin();
      Alert.alert("알림", "문제 경로 시작 지점이 설정되었습니다.");
    } else if (problemRouteSetting === "end") {
      setProblemEndPoint({ latitude, longitude });
      addAndRemoveTemporaryPin();
      Alert.alert("알림", "문제 경로 도착 지점이 설정되었습니다.");
    } else if (isSetUserLocationActive) {
      const newLocation = { latitude, longitude };
      setUserLocation(newLocation);
      checkUserLocation(newLocation);
      addAndRemoveTemporaryPin();
    }
  };

  // 사용자가 경로 위에 있는지 확인하는 함수
  const isUserOnRoute = (location, points, threshold) => {
    for (let point of points) {
      const distance = calculateDistance(location, point);
      if (distance <= threshold) {
        return true;
      }
    }
    return false;
  };

  // 사용자 위치 확인 및 경로 이탈 여부 체크
  const checkUserLocation = (location) => {
    const threshold = 0.0002;

    // 사용자가 경로 안에 있는 지 확인 (지나간 경로 포함)
    const isOnRoute =
      isUserOnRoute(location, routePoints, threshold) ||
      isUserOnRoute(location, passedRoutePoints, threshold);

    if (isOnRoute) {
      if (isOffRoute) {
        setIsOffRoute(false);
        setUserDeviatedPoints((prevPoints) => [...prevPoints, location]);
        setLastOnRoutePoint(location);

        console.log("사용자가 경로로 복귀했습니다.");
      }

      const nearestPointIndex = findNearestRoutePointIndex(
        location,
        routePoints
      );

      if (nearestPointIndex !== -1) {
        const passedPoints = routePoints.slice(0, nearestPointIndex + 1);
        setPassedRoutePoints((prevPoints) => [...prevPoints, ...passedPoints]);

        const remainingRoutePoints = routePoints.slice(nearestPointIndex + 1);
        setRoutePoints(remainingRoutePoints);
      }

      // 도착 버튼 활성화 여부 확인
      if (routePoints.length === 0 || isNearDestination(location)) {
        setArrivalButtonEnabled(true);
      }
    } else {
      if (!isOffRoute) {
        setIsOffRoute(true);
        setUserDeviatedPoints((prevPoints) => [...prevPoints, location]);
        setLastOffRoutePoint(location);

        // 새로운 포인트 생성 및 저장
        const newPointId = `new_${userDeviatedPoints.length}`;
        setNewPoints((prevPoints) => [
          ...prevPoints,
          {
            id: newPointId,
            lat: location.latitude,
            lng: location.longitude,
          },
        ]);

        console.log(
          "사용자가 경로를 이탈했습니다. 새로운 포인트를 생성합니다."
        );
      } else {
        setUserDeviatedPoints((prevPoints) => [...prevPoints, location]);
        setLastOffRoutePoint(location);
      }
    }
  };

  // 두 지점 중 가장 가까운 지점의 인덱스를 찾아 반환
  const findNearestRoutePointIndex = (location, points) => {
    let minDistance = Infinity;
    let nearestIndex = -1;
    points.forEach((point, index) => {
      const distance = calculateDistance(location, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  };

  // 두 지점 중 가장 가까운 지점을 찾아 반환
  const findNearestPoint = (location, points) => {
    let minDistance = Infinity;
    let nearestPoint = null;
    points.forEach((point) => {
      const distance = calculateDistance(location, point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });
    return nearestPoint;
  };

  // 거리 계산
  const calculateDistance = (loc1, loc2) => {
    const deltaLat = loc1.latitude - loc2.latitude;
    const deltaLon = loc1.longitude - loc2.longitude;
    return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
  };

  // 목적지 근처에 있는지 확인
  const isNearDestination = (location) => {
    const destination = lastDestinationPoint;
    if (!destination) return false;
    const distance = calculateDistance(location, destination);
    const arrivalThreshold = 0.0005;
    return distance <= arrivalThreshold;
  };

  // 도착 버튼 클릭 시 호출
  const handleArriveButtonPress = () => {
    setShowCompletionModal(true);

    // 사용자 이탈 경로 처리
    processUserDeviations();

    // 2초 후에 도착 모달 표시
    setTimeout(() => {
      setShowCompletionModal(false);
      Alert.alert("축하합니다", "축하합니다! 경로를 완주하셨습니다!");
      navigation.navigate("StartPointSelection");
    }, 2000);
  };

  // 경로 이탈 처리 함수
  const processUserDeviations = async () => {
    if (userDeviatedPoints.length === 0) return;

    // 로딩 모달 표시
    setShowCompletionModal(true);

    const pointIds = [];
    const closestPointsLatLng = [];
    console.log("Processing user deviations...");

    for (let i = 0; i < userDeviatedPoints.length; i++) {
      const point = userDeviatedPoints[i];
      console.log(
        `Calling closest-point API for point ${i}: lat=${point.latitude}, lng=${point.longitude}`
      );
      const response = await fetch(
        `https://accurately-healthy-duckling.ngrok-free.app/api/points/closest-point?lat=${point.latitude}&lng=${point.longitude}&radius=5`
      );
      const data = await response.text();
      if (data && data !== "null") {
        const pointId = data.replace(/"/g, "");
        pointIds.push(pointId);
        closestPointsLatLng.push({ lat: point.latitude, lng: point.longitude });
      } else {
        pointIds.push(null);
        closestPointsLatLng.push({ lat: point.latitude, lng: point.longitude });
      }
    }

    console.log("Point IDs:", pointIds);

    // 두 개 이상의 null이 있는지 확인
    const nullCount = pointIds.filter((id) => id === null).length;
    if (nullCount >= 2) {
      Alert.alert("축하합니다!", "경로를 개척하였습니다!");
    }

    // 새로운 포인트와 엣지 생성
    const newPointsArray = [];
    const newEdgesArray = [];
    let lastPointId = null;
    let lastPointLatLng = null;

    for (let i = 0; i < pointIds.length; i++) {
      const pointId = pointIds[i];
      const pointLatLng = closestPointsLatLng[i];

      let currentPointId = null;
      if (pointId === null) {
        // 새로운 포인트 생성
        currentPointId = `new_${i}`;
        newPointsArray.push({
          id: currentPointId,
          lat: pointLatLng.lat,
          lng: pointLatLng.lng,
        });
      } else {
        currentPointId = pointId;
      }

      if (lastPointId !== null) {
        // 이전 포인트와 현재 포인트를 연결하는 엣지 생성
        newEdgesArray.push({
          from: lastPointId,
          to: currentPointId,
          fromLat: lastPointLatLng.lat,
          fromLng: lastPointLatLng.lng,
          toLat: pointLatLng.lat,
          toLng: pointLatLng.lng,
        });
      } else {
        // 이탈 전 마지막 세분화된 포인트와 첫 번째 이탈 위치를 연결
        const lastPassedPoint = passedRoutePoints[passedRoutePoints.length - 1];
        if (lastPassedPoint) {
          newEdgesArray.push({
            from: `route_point_${passedRoutePoints.length - 1}`,
            to: currentPointId,
            fromLat: lastPassedPoint.latitude,
            fromLng: lastPassedPoint.longitude,
            toLat: pointLatLng.lat,
            toLng: pointLatLng.lng,
          });
        }
      }

      lastPointId = currentPointId;
      lastPointLatLng = pointLatLng;
    }

    console.log("New Points:", JSON.stringify(newPointsArray));
    console.log("New Edges:", JSON.stringify(newEdgesArray));

    // 새로운 포인트와 엣지 저장
    setNewPoints(newPointsArray);
    setNewEdges(newEdgesArray);

    // 로딩 모달 숨김
    setShowCompletionModal(false);
  };

  return (
    <View style={styles.container}>
      {problemRouteSetting && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            {problemRouteSetting === "start"
              ? "문제 시작 위치를 선택하세요"
              : "문제 종료 위치를 선택하세요"}
          </Text>
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: routePoints[0]?.latitude || 37.504558,
          longitude: routePoints[0]?.longitude || 126.956951,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onPress={onMapPress}
        scrollEnabled={true} // 문의할 때 지도 움직일 수 있게 수정
      >
        {passedRoutePoints.length > 0 && (
          <Polyline
            coordinates={passedRoutePoints}
            strokeColor="#808080"
            strokeWidth={3}
          />
        )}
        {routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}
        {problemRoutes.map((route, index) => (
          <Polyline
            key={`problemRoute-${index}`}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={3}
            zIndex={2}
          />
        ))}
        {userLocation && (
          <Marker coordinate={userLocation} onPress={() => {}} />
        )}
        {temporaryPin && (
          <Marker coordinate={temporaryPin} pinColor="transparent" />
        )}
        {problemStartPoint && (
          <Marker
            coordinate={problemStartPoint}
            pinColor="green"
            title="문제 시작 위치"
          />
        )}
        {problemEndPoint && (
          <Marker
            coordinate={problemEndPoint}
            pinColor="red"
            title="문제 종료 위치"
          />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        {!problemRouteSetting && (
          <>
            <TouchableOpacity
              style={[
                styles.button,
                isSetUserLocationActive && styles.activeButton,
              ]}
              onPress={handleSetUserLocation}
            >
              <Text style={styles.buttonText}>사용자 위치 설정 버튼</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, isMoveMapActive && styles.activeButton]}
              onPress={handleMoveMap}
            >
              <Text style={styles.buttonText}>지도 움직이기 버튼</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleReportProblemRoute}
            >
              <Text style={styles.buttonText}>문제경로 문의하기</Text>
            </TouchableOpacity>
          </>
        )}
        {showReportButtons && (
          <View style={styles.reportButtonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSetProblemStartPoint}
            >
              <Text style={styles.buttonText}>문제경로 시작 지점 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSetProblemEndPoint}
            >
              <Text style={styles.buttonText}>문제경로 도착 지점 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleConfirmProblemRoute}
            >
              <Text style={styles.buttonText}>설정 완료</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCancelProblemRoute}
            >
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={handleEndNavigation}>
          <Text style={styles.buttonText}>네비게이션 종료하기</Text>
        </TouchableOpacity>
        {arrivalButtonEnabled && (
          <TouchableOpacity
            style={styles.arriveButton}
            onPress={handleArriveButtonPress}
          >
            <Text style={styles.arriveButtonText}>도착 버튼</Text>
          </TouchableOpacity>
        )}
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

      {/* 네비게이션 종료 확인 */}
      {showEndNavigationConfirm &&
        Alert.alert(
          "종료 확인",
          "산책을 종료하시겠습니까?",
          [
            { text: "아니오", onPress: cancelEndNavigation },
            { text: "네", onPress: confirmEndNavigation },
          ],
          { cancelable: false }
        )}
    </View>
  );
};

export default TestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  titleContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#FFFFFF", // 배경색 추가
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)", // 테두리 추가
  },
  titleText: {
    fontSize: 16,
    color: "rgba(74, 143, 62, 1)",
    fontWeight: "bold", // 글자 두껍게
  },
  buttonContainer: {
    position: "absolute",
    top: 50,
    left: 10,
  },
  button: {
    backgroundColor: "#FFFFFFaa",
    padding: 10,
    marginBottom: 10,
  },
  activeButton: {
    backgroundColor: "#87CEEBaa",
  },
  buttonText: {
    fontSize: 16,
  },
  arriveButton: {
    backgroundColor: "#FF4500aa",
    padding: 10,
    marginTop: 10,
  },
  arriveButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  reportButtonsContainer: {
    marginTop: 10,
  },
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
