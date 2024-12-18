// TestScreen.js
// 이 스크린은 사용자가 지도를 탭하여 위치를 이동하는 테스트용 스크린이다.
// 실제 GPS 대신 터치한 위치를 사용자 위치로 간주한다.
// 주요 기능:
// 1) 네비게이션 시작 전 5초 동안 로딩 모달 표시 + 그 동안에도 위치 추적 시작 (단, 여기서는 watchPositionAsync 필요 없음. 터치 좌표를 위치로 사용)
// 2) 네비게이션 시작 후 사용자 위치 Circle로 표시(방향 없음), 도착 버튼 활성화 로직 동일
// 3) 로딩 5초간 유지 후 종료
// 4) 문제 경로 신고 기능 동일
// 5) 경로 이탈, 재탐색 로직 동일
// 6) 사용자 위치를 탭한 좌표로 업데이트할 때 processUserLocation 호출 및 화살표 통과 시 제거 로직(handlePassArrows) 적용

import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import MapView, { Polyline, Marker, Circle } from "react-native-maps";
import { Image } from "expo-image";
import * as Location from "expo-location"; // 여기서도 위치 권한 요청 및 추적, 혹시나 필요할 수 있음

import { preprocessRoute } from "./preprocessingRoute.js";
import { processUserLocation } from "./updateRoute.js";
import { processInquiry } from "./inquiryProcessing.js";
import { UserContext } from "../../store/context/userContext";
import { fixMapRenderErr } from "./fixMapRenderErr.js";

export default function TestScreen({ selectedRoute, userIdf, navigation }) {
  // -------------------------- 상태 변수 --------------------------
  const [userLocation, setUserLocation] = useState(null); // 사용자 위치(터치로 결정)
  const [previousUserLocation, setPreviousUserLocation] = useState(null); // 이전 사용자 위치
  const [navigationStartTime, setNavigationStartTime] = useState(null); // 네비게이션 시작 시간

  const [routePoints, setRoutePoints] = useState([]); // 경로 포인트들
  const [passedRoutePoints, setPassedRoutePoints] = useState([]); // 지나온 경로 포인트들
  const [isOffRoute, setIsOffRoute] = useState(false); // 경로 이탈 여부
  const [arrivalButtonEnabled, setArrivalButtonEnabled] = useState(false); // 도착 버튼 활성화 여부
  const [temporaryPin, setTemporaryPin] = useState(null); // 맵 렌더링 버그 수정용 임시 핀
  const [lastDestinationPoint, setLastDestinationPoint] = useState(null); // 마지막 도착 지점
  const [showCompletionModal, setShowCompletionModal] = useState(false); // 처리 중(로딩) 모달 표시 여부
  const [problemStartPoint, setProblemStartPoint] = useState(null); // 문제 경로 시작 지점
  const [problemEndPoint, setProblemEndPoint] = useState(null); // 문제 경로 종료 지점
  const [problemRouteSetting, setProblemRouteSetting] = useState(null); // 문제 경로 설정 상태
  const [userDeviatedPoints, setUserDeviatedPoints] = useState([]); // 이탈 포인트들
  const [problemRoutes, setProblemRoutes] = useState([]); // 문제 경로들
  const [deviationLines, setDeviationLines] = useState([]); // 이탈 경로 라인들
  const [rerouteData, setRerouteData] = useState(null); // 재탐색 데이터
  const [newRouteStartPoint, setNewRouteStartPoint] = useState(null);
  const [newRouteWaypoint, setNewRouteWaypoint] = useState(null);
  const [newRouteEndPoint, setNewRouteEndPoint] = useState(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false); // 처리 모달
  const [hasUserJoinedRoute, setHasUserJoinedRoute] = useState(false); // 경로 합류 여부
  const [initialPassedPoints, setInitialPassedPoints] = useState([]); // 초기 지나온 포인트들
  const [totalRouteDistance, setTotalRouteDistance] = useState(0); // 전체 경로 거리

  const [segmentArrows, setSegmentArrows] = useState([]); // 화살표
  const [startArrow, setStartArrow] = useState(null); // 시작 화살표

  const mapRef = useRef(null);
  const { API_BASE_URL, userInfo } = useContext(UserContext);
  const waypoints = selectedRoute.waypoints || [];
  let userEmail = userInfo.userEmail;

  // -------------------------- 초기 로딩 중 위치 권한 요청 (테스트 스크린에서도 동일하게) --------------------------
  useEffect(() => {
    const init = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 권한 거부", "위치 정보를 사용할 수 없습니다.");
        return;
      }

      // 여기서는 watchPositionAsync 불필요하지만, 필요하다면 할 수 있음
      // 사용자 터치 기반으로 위치를 변경하므로 실제 위치 추적은 Optional
      // 혹시 필요하다면 아래 주석 해제
      // Location.watchPositionAsync({ accuracy: Location.Accuracy.High }, (loc) => {
      //   // 실제 GPS를 사용하지 않지만 필요하다면 여기서 userLocation 업데이트 가능
      // });

      // 5초 동안 로딩 모달 표시 후 네비게이션 시작 시간 설정
      setShowCompletionModal(true);
      setTimeout(() => {
        setShowCompletionModal(false);
        setNavigationStartTime(Date.now());
      }, 5000);
    };
    init();
  }, []);

  // -------------------------- 경로 전처리 및 화살표 생성 --------------------------
  useEffect(() => {
    const {
      routePoints: points,
      lastDestinationPoint: dest,
      totalRouteDistance: totalDist,
    } = preprocessRoute(selectedRoute);
    setRoutePoints(points);
    setLastDestinationPoint(dest);
    setTotalRouteDistance(totalDist);

    fixMapRenderErr(setTemporaryPin);
    createArrows(points);
  }, [selectedRoute]);

  const startCoord = routePoints[0];
  const endCoord = lastDestinationPoint;
  let adjustedEndCoord = endCoord;
  if (
    startCoord &&
    endCoord &&
    startCoord.latitude === endCoord.latitude &&
    startCoord.longitude === endCoord.longitude
  ) {
    adjustedEndCoord = { ...endCoord, longitude: endCoord.longitude + 0.00001 };
  }

  function createArrows(points) {
    if (!points || points.length < 2) {
      setSegmentArrows([]);
      setStartArrow(null);
      return;
    }

    const initialBearing = calculateBearing(points[0], points[1]);
    setStartArrow({ coordinate: points[0], bearing: initialBearing });

    const interval = 20;
    const arr = [];
    for (let i = interval; i < points.length; i += interval) {
      if (i + 1 < points.length) {
        const brng = calculateBearing(points[i], points[i + 1]);
        arr.push({
          coordinate: points[i],
          bearing: brng,
          key: `arrow-${i}`,
        });
      }
    }
    setSegmentArrows(arr);
  }

  // -------------------------- 문제 경로 문의 로직 --------------------------
  const handleReportProblemRoute = () => {
    setProblemRouteSetting("start");
    setProblemStartPoint(null);
    setProblemEndPoint(null);
  };

  const handleSetProblemPointConfirm = () => {
    if (problemRouteSetting === "start") {
      if (!problemStartPoint) {
        Alert.alert("오류", "문제 경로의 시작 지점을 선택해주세요.");
        return;
      }
      setProblemRouteSetting("end");
    } else if (problemRouteSetting === "end") {
      if (!problemEndPoint) {
        Alert.alert("오류", "문제 경로의 종료 지점을 선택해주세요.");
        return;
      }
      console.log("여기");
      handleConfirmProblemRoute();
      setProblemRouteSetting(null);
    }
  };

  const handleConfirmProblemRoute = () => {
    processInquiry({
      problemStartPoint,
      problemEndPoint,
      routePoints,
      passedRoutePoints,
      setShowCompletionModal,
      setProblemRoutes,
      addAndRemoveTemporaryPin: () => fixMapRenderErr(setTemporaryPin),
      setProblemStartPoint,
      setProblemEndPoint,
      navigation,
      API_BASE_URL,
      userEmail,
    });
  };

  // -------------------------- 네비게이션 종료 --------------------------
  const handleEndNavigation = () => {
    confirmEndNavigation();
  };

  const confirmEndNavigation = () => {
    setShowCompletionModal(true);
    processUserDeviations();
    setTimeout(() => {
      setShowCompletionModal(false);
      Alert.alert("산책 종료", "산책이 종료되었습니다.");
      navigation.navigate("PingSelection");
    }, 2000);
  };

  // -------------------------- 사용자 위치 업데이트 (지도 탭) --------------------------
  const onMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    console.log(`User tapped at: lat=${latitude}, lng=${longitude}`);

    if (problemRouteSetting === "start") {
      // 문제 경로 시작 지점 설정
      setProblemStartPoint({ latitude, longitude });
      fixMapRenderErr(setTemporaryPin);
    } else if (problemRouteSetting === "end") {
      // 문제 경로 종료 지점 설정
      setProblemEndPoint({ latitude, longitude });
      fixMapRenderErr(setTemporaryPin);
    } else {
      // 사용자 위치 업데이트 로직
      if (userLocation) {
        setPreviousUserLocation(userLocation);
      }

      const newLocation = { latitude, longitude };
      setUserLocation(newLocation);

      if (navigationStartTime) {
        // 도착 버튼 활성화 로직
        const oneMinutePassed = Date.now() - navigationStartTime >= 60000; // 1분 경과 여부
        const nearDestination = isNearDestination(
          newLocation,
          adjustedEndCoord
        ); // 도착지 근처 여부

        if (oneMinutePassed && nearDestination) {
          setArrivalButtonEnabled(true);
        } else {
          setArrivalButtonEnabled(false);
        }

        // 경로 정보 업데이트
        processUserLocation({
          location: newLocation,
          previousLocation: userLocation,
          routePoints,
          passedRoutePoints,
          isOffRoute,
          userDeviatedPoints,
          setRoutePoints,
          setPassedRoutePoints,
          setIsOffRoute,
          setUserDeviatedPoints,
          lastDestinationPoint: adjustedEndCoord,
          deviationLines,
          setDeviationLines,
          hasUserJoinedRoute,
          setHasUserJoinedRoute,
          initialPassedPoints,
          setInitialPassedPoints,
          handleOffRouteScenario,
        });
        fixMapRenderErr(setTemporaryPin);

        // 화살표 제거 로직
        handlePassArrows();
      }
    }
  };

  // -------------------------- 도착 버튼 --------------------------
  const handleArriveButtonPress = () => {
    setShowCompletionModal(true);
    processUserDeviations();
    setTimeout(() => {
      setShowCompletionModal(false);
      Alert.alert("축하합니다", "경로를 완주하셨습니다!");
      navigation.navigate("PingSelection");
    }, 2000);
  };

  // 사용자 이탈 경로 처리
  const processUserDeviations = async () => {
    if (userDeviatedPoints.length === 0) return;
    setShowCompletionModal(true);
    console.log("사용자 이탈 경로 처리:", userDeviatedPoints);
    setShowCompletionModal(false);
  };

  // 경로 이탈 시나리오 처리
  const handleOffRouteScenario = async (lastOnRoutePoint, offRouteLocation) => {
    Alert.alert(
      "경로 이탈",
      "경로를 이탈하였습니다. 새 경로를 불러오시겠습니까?",
      [
        {
          text: "아니요",
          onPress: () => {
            Alert.alert("알림", "새 경로를 작성합니다.");
          },
        },
        {
          text: "예",
          onPress: async () => {
            setShowProcessingModal(true);
            setShowCompletionModal(true);
            try {
              const newRoute = await fetchNewRoute(
                lastOnRoutePoint,
                offRouteLocation,
                adjustedEndCoord
              );
              setShowProcessingModal(false);
              setShowCompletionModal(false);
              if (!newRoute || newRoute.length === 0) {
                Alert.alert(
                  "알림",
                  "해당하는 경로가 없습니다. 새 경로를 작성합니다."
                );
              } else {
                setRerouteData(newRoute);
                setNewRouteStartPoint(lastOnRoutePoint);
                setNewRouteWaypoint(offRouteLocation);
                setNewRouteEndPoint(adjustedEndCoord);

                const lastRoute = newRoute[newRoute.length - 1];
                const {
                  routePoints: newPoints,
                  lastDestinationPoint: newDest,
                  totalRouteDistance: newDist,
                } = preprocessRoute({
                  start: lastRoute.start,
                  roads: lastRoute.roads,
                });

                setRoutePoints(newPoints);
                setPassedRoutePoints([]);
                setIsOffRoute(false);
                setUserDeviatedPoints([]);
                setDeviationLines([]);
                setHasUserJoinedRoute(true);

                createArrows(newPoints);

                handleRouteUpdate(lastRoute.roads, newPoints, newDest, newDist);
              }
            } catch (error) {
              setShowProcessingModal(false);
              setShowCompletionModal(false);
              Alert.alert(
                "알림",
                "경로 재탐색 중 오류 발생. 새 경로를 작성합니다."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // 새 경로 가져오기
  const fetchNewRoute = async (startCoord, waypointCoord, endCoord) => {
    const getClosestPointId = async (lat, lng) => {
      const url = `${API_BASE_URL}/api/points/closest-point?lat=${lat}&lng=${lng}&radius=30`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.text();
      if (!data || data === "null") return null;
      return data.replace(/"/g, "");
    };
    const startId = await getClosestPointId(
      startCoord.latitude,
      startCoord.longitude
    );
    const endId = await getClosestPointId(
      endCoord.latitude,
      endCoord.longitude
    );
    const waypointId = await getClosestPointId(
      waypointCoord.latitude,
      waypointCoord.longitude
    );
    if (!startId || !endId || !waypointId) return null;

    // const body = {
    //   startId: startId,
    //   endId: endId,
    //   waypointIds: [waypointId],
    // };
    const body = {
      startId: waypointId,
      endId: endId,
      //waypointIds: [waypointId],
    };
    const url = `${API_BASE_URL}/api/routes/findRoutes`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    const routesData = await response.json();
    return routesData;
  };

  // 경로 업데이트
  const handleRouteUpdate = (newRoads, newPoints, newDest, newDist) => {
    if (
      newPoints.length > 0 &&
      newDest &&
      newPoints[0].latitude === newDest.latitude &&
      newPoints[0].longitude === newDest.longitude
    ) {
      const adjusted = { ...newDest, longitude: newDest.longitude + 0.00001 };
      setLastDestinationPoint(adjusted);
    } else {
      setLastDestinationPoint(newDest);
    }
    setTotalRouteDistance(newDist);
  };

  // 지나간 화살표 제거
  const handlePassArrows = () => {
    const remainingArrows = segmentArrows.filter((arrow) => {
      const passed = passedRoutePoints.some(
        (p) => distanceBetween(p, arrow.coordinate) < 5
      );
      return !passed;
    });
    let newStartArrow = startArrow;
    if (
      startArrow &&
      passedRoutePoints.some(
        (p) => distanceBetween(p, startArrow.coordinate) < 5
      )
    ) {
      newStartArrow = null;
    }
    setSegmentArrows(remainingArrows);
    setStartArrow(newStartArrow);
  };

  // 방향 계산
  function calculateBearing(start, end) {
    const startLat = (start.latitude * Math.PI) / 180;
    const startLng = (start.longitude * Math.PI) / 180;
    const endLat = (end.latitude * Math.PI) / 180;
    const endLng = (end.longitude * Math.PI) / 180;
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    let brng = Math.atan2(y, x);
    brng = (brng * 180) / Math.PI;
    brng = (brng + 360) % 360;
    return brng;
  }

  // 거리 계산
  function distanceBetween(a, b) {
    const R = 6371e3;
    const φ1 = (a.latitude * Math.PI) / 180;
    const φ2 = (b.latitude * Math.PI) / 180;
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
    const x =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    const dist = R * y;
    return dist;
  }

  function isNearDestination(location, destination) {
    if (!destination) return false;
    const distance = distanceBetween(location, destination);
    const arrivalThreshold = 10; // 10m 이내
    return distance <= arrivalThreshold;
  }

  return (
    <View style={styles.container}>
      {problemRouteSetting && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            {problemRouteSetting === "start"
              ? "문제 경로의 시작 지점을 선택하세요"
              : "문제 경로의 종료 지점을 선택하세요"}
          </Text>
        </View>
      )}

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
              <Text style={{ marginTop: 10 }}>지도 로딩중...</Text>
            </View>
          </View>
        </Modal>
      )}

      {!showCompletionModal && (
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
          scrollEnabled={true}
        >
          {initialPassedPoints.length > 0 && (
            <Polyline
              coordinates={initialPassedPoints}
              strokeColor="#808080"
              strokeWidth={4}
            />
          )}
          {passedRoutePoints.length > 0 && (
            <Polyline
              coordinates={passedRoutePoints}
              strokeColor="#808080"
              strokeWidth={6}
              lineCap="round"
            />
          )}
          {routePoints.length > 0 && (
            <Polyline
              coordinates={routePoints}
              strokeColor="rgba(255,0,0,0.8)"
              strokeWidth={6}
              lineCap="round"
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
          {deviationLines.map((line, index) => (
            <Polyline
              key={`deviationLine-${index}`}
              coordinates={line.coordinates}
              strokeColor={line.color}
              strokeWidth={3}
              zIndex={2}
            />
          ))}

          {userLocation && (
            <Circle
              center={userLocation}
              radius={5}
              fillColor="rgba(0, 122, 255, 0.3)"
              strokeColor="rgba(0, 122, 255, 1)"
            />
          )}

          {temporaryPin && (
            <Marker coordinate={temporaryPin} pinColor="transparent" />
          )}

          {problemStartPoint && (
            <Marker
              coordinate={problemStartPoint}
              pinColor="green"
              title="문제 경로 시작 지점"
            />
          )}
          {problemEndPoint && (
            <Marker
              coordinate={problemEndPoint}
              pinColor="red"
              title="문제 경로 종료 지점"
            />
          )}
          {newRouteStartPoint && (
            <Marker
              coordinate={newRouteStartPoint}
              pinColor="green"
              title="새 경로 출발지"
            />
          )}
          {newRouteWaypoint && (
            <Marker
              coordinate={newRouteWaypoint}
              pinColor="blue"
              title="새 경유지"
            />
          )}
          {newRouteEndPoint && (
            <Marker
              coordinate={newRouteEndPoint}
              pinColor="red"
              title="새 경로 도착지"
            />
          )}

          {startCoord && (
            <Marker coordinate={startCoord}>
              <Image
                source={require("../../assets/images/startPing.png")}
                style={{ width: 30, height: 30 }}
              />
            </Marker>
          )}
          {adjustedEndCoord && (
            <Marker coordinate={adjustedEndCoord}>
              <Image
                source={require("../../assets/images/endPing.png")}
                style={{ width: 30, height: 30 }}
              />
            </Marker>
          )}
          {waypoints.map((wp, i) => (
            <Marker key={`waypoint-${i}`} coordinate={wp}>
              <Image
                source={require("../../assets/images/wayPointPing.png")}
                style={{ width: 30, height: 30 }}
              />
            </Marker>
          ))}

          {segmentArrows.map((arrow) => (
            <Marker
              key={arrow.key}
              coordinate={arrow.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              style={{
                transform: [{ rotate: `${arrow.bearing - 90}deg` }],
              }}
            >
              <Image
                source={require("../../assets/images/arrow_route.png")}
                style={{ width: 30, height: 30 }}
              />
            </Marker>
          ))}
          {startArrow && (
            <Marker
              coordinate={startArrow.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              style={{
                transform: [{ rotate: `${startArrow.bearing - 90}deg` }],
              }}
            >
              <Image
                source={require("../../assets/images/arrow_route.png")}
                style={{ width: 30, height: 30 }}
              />
            </Marker>
          )}
        </MapView>
      )}

      <View style={styles.buttonContainer}>
        {!problemRouteSetting && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handleReportProblemRoute}
            >
              <Text style={styles.buttonText}>문제 경로 문의하기</Text>
            </TouchableOpacity>
          </>
        )}
        {problemRouteSetting && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSetProblemPointConfirm}
          >
            <Text style={styles.confirmButtonText}>선택 완료</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={handleEndNavigation}>
          <Text style={styles.buttonText}>네비게이션 종료하기</Text>
        </TouchableOpacity>
        {arrivalButtonEnabled && (
          <TouchableOpacity
            style={styles.arriveButton}
            onPress={handleArriveButtonPress}
          >
            <Text style={styles.arriveButtonText}>도착</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  titleContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(74, 143, 62, 1)",
  },
  titleText: {
    fontSize: 16,
    color: "rgba(74, 143, 62, 1)",
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "rgba(74, 143, 62, 1)",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    width: 200,
    borderWidth: 1,
    borderColor: "rgba(52, 121, 40, 1)",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  confirmButton: {
    backgroundColor: "rgba(192, 235, 166, 1)",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    width: 200,
    borderWidth: 2,
    borderColor: "rgba(134, 203, 122, 1)",
  },
  confirmButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000000",
  },
  arriveButton: {
    backgroundColor: "rgba(255, 255, 109, 1)",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    width: 200,
    borderWidth: 1,
    borderColor: "rgba(1, 1, 1, 1)",
  },
  arriveButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000000",
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
