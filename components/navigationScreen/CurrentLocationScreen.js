// CurrentLocationScreen.js
// 이 스크린은 실제 사용자 위치를 기반으로 지도에 경로를 표시하고 네비게이션 기능을 제공하는 화면이다.
// 주요 기능:
// 1) 네비게이션 시작 전 5초간 로딩 모달 표시 + 위치 추적 시작 (로딩 동안에도 위치 추적 수행)
// 2) 네비게이션 시작 후 지도 중앙은 5초마다 사용자 위치를 기준으로 이동
// 3) 사용자 위치에 Circle 대신 사용자 방향을 보여주는 Marker 사용
// 4) 도착 버튼 활성화: 네비게이션 시작 후 1분이 지났으며, 도착지 근처에 있을 때 활성화
// 5) 경로 전처리한 routePoints를 기반으로 경로 화살표 표시
// 6) 이탈 후 경로 재탐색 로직 반영
// 7) 문제 경로 신고 기능 포함
// 8) 경로 진입, 이탈, 복귀 시나리오 반영 및 각 상황별 UI 갱신

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
import * as Location from "expo-location";

import { preprocessRoute } from "./preprocessingRoute.js";
import { processUserLocation } from "./updateRoute.js";
import { processInquiry } from "./inquiryProcessing.js";
import { UserContext } from "../../store/context/userContext";
import { fixMapRenderErr } from "./fixMapRenderErr.js";

export default function CurrentLocationScreen({
  selectedRoute,
  userIdf,
  navigation,
}) {
  // -------------------------- 상태 변수 --------------------------
  const [userLocation, setUserLocation] = useState(null); // 사용자 현재 위치
  const [previousUserLocation, setPreviousUserLocation] = useState(null); // 이전 사용자 위치

  const [navigationStartTime, setNavigationStartTime] = useState(null); // 네비게이션 시작 시간
  const [routePoints, setRoutePoints] = useState([]); // 전체 경로 포인트들
  const [passedRoutePoints, setPassedRoutePoints] = useState([]); // 지나온 경로 포인트들
  const [isOffRoute, setIsOffRoute] = useState(false); // 경로 이탈 여부
  const [arrivalButtonEnabled, setArrivalButtonEnabled] = useState(false); // 도착 버튼 활성화 여부
  const [temporaryPin, setTemporaryPin] = useState(null); // 맵 렌더링 버그 수정용 임시 핀
  const [lastDestinationPoint, setLastDestinationPoint] = useState(null); // 마지막 도착 지점
  const [showCompletionModal, setShowCompletionModal] = useState(false); // 로딩 모달 표시 여부
  const [problemStartPoint, setProblemStartPoint] = useState(null); // 문제 경로 시작 지점
  const [problemEndPoint, setProblemEndPoint] = useState(null); // 문제 경로 종료 지점
  const [problemRouteSetting, setProblemRouteSetting] = useState(null); // 문제 경로 설정 상태 ("start" -> "end")
  const [userDeviatedPoints, setUserDeviatedPoints] = useState([]); // 사용자가 이탈한 포인트들의 기록
  const [problemRoutes, setProblemRoutes] = useState([]); // 문제 경로들 (신고 처리 결과)
  const [deviationLines, setDeviationLines] = useState([]); // 이탈 경로 라인들
  const [rerouteData, setRerouteData] = useState(null); // 재탐색된 경로 데이터
  const [newRouteStartPoint, setNewRouteStartPoint] = useState(null); // 새 경로 시작 지점
  const [newRouteWaypoint, setNewRouteWaypoint] = useState(null); // 새 경로 경유지
  const [newRouteEndPoint, setNewRouteEndPoint] = useState(null); // 새 경로 종료 지점
  const [showProcessingModal, setShowProcessingModal] = useState(false); // 처리 중 모달 표시 여부
  const [hasUserJoinedRoute, setHasUserJoinedRoute] = useState(false); // 사용자가 경로에 합류했는지 여부
  const [initialPassedPoints, setInitialPassedPoints] = useState([]); // 초기 지나온 포인트들 (경로 합류 전)
  const [totalRouteDistance, setTotalRouteDistance] = useState(0); // 전체 경로 거리

  const [segmentArrows, setSegmentArrows] = useState([]); // 구간별 화살표
  const [startArrow, setStartArrow] = useState(null); // 시작 화살표

  const [userHeading, setUserHeading] = useState(null); // 사용자 헤딩(방향)

  const mapRef = useRef(null);
  const { API_BASE_URL, userInfo } = useContext(UserContext);
  const waypoints = selectedRoute.waypoints || []; // 경유지들
  let userEmail = userInfo.userEmail;

  // -------------------------- 위치 추적 및 초기 로딩 로직 --------------------------
  useEffect(() => {
    // 컴포넌트 마운트 시 바로 위치 권한 요청 및 위치 추적 시작
    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 권한 거부", "위치 정보를 사용할 수 없습니다.");
        return;
      }

      // 위치 추적 시작: 앱 시작 시점부터 계속 위치 업데이트 받음
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 3,
          timeInterval: 3000,
        },
        async (loc) => {
          const { latitude, longitude } = loc.coords;
          setPreviousUserLocation((prev) =>
            prev ? prev : { latitude, longitude }
          );
          setUserLocation({ latitude, longitude });
        }
      );

      // 헤딩 추적 시작: 사용자 방향 업데이트
      Location.watchHeadingAsync((headingData) => {
        if (headingData.trueHeading >= 0) {
          setUserHeading(headingData.trueHeading);
        }
      });
    };

    startTracking();
    // 로딩 모달 5초 표시 후 네비게이션 시작 시간 설정
    setShowCompletionModal(true);
    const timer = setTimeout(() => {
      setShowCompletionModal(false);
      setNavigationStartTime(Date.now()); // 네비게이션 시작 시간 (5초후)
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // -------------------------- 5초마다 사용자 중심으로 지도 이동 --------------------------
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userLocation && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.0015,
            longitudeDelta: 0.0015,
          },
          1000
        );
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [userLocation]);

  // -------------------------- 경로 전처리 --------------------------
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

    // 화살표 생성
    createArrows(points);
  }, [selectedRoute]);

  // start와 end가 동일한 경우 end 포인트 살짝 조정
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

  // -------------------------- 화살표 생성 함수 --------------------------
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

  //맵 터치
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
    }
  };

  // --------------------------문제 경로 신고 관련 처리 --------------------------
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
      userEmail,
      API_BASE_URL,
    });
  };

  // -------------------------- 네비게이션 종료 처리 --------------------------
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
    }, 1000);
  };

  // -------------------------- 사용자 위치 업데이트 처리 --------------------------
  const updateUserLocation = async (newLocation) => {
    if (userLocation) {
      setPreviousUserLocation(userLocation);
    }
    setUserLocation(newLocation);

    // 도착 버튼 활성화 로직
    const oneMinutePassed = navigationStartTime
      ? Date.now() - navigationStartTime >= 60000
      : false; // 1분 경과 여부
    const nearDestination = isNearDestination(newLocation, adjustedEndCoord); // 도착지 근처 여부

    if (oneMinutePassed && nearDestination) {
      setArrivalButtonEnabled(true);
    } else {
      setArrivalButtonEnabled(false);
    }
    //await
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

    // 경로 갱신 후 지나간 화살표 제거
    handlePassArrows();
  };

  // 현재 위치 변경 감지(useEffect): userLocation가 업데이트 될 때마다 updateUserLocation 실행
  useEffect(() => {
    if (userLocation && navigationStartTime) {
      // 네비게이션 시작 시간 이후 위치 업데이트 시에만 처리
      updateUserLocation(userLocation);
    }
  }, [userLocation, navigationStartTime]);

  // -------------------------- 도착 버튼 처리 --------------------------
  const handleArriveButtonPress = () => {
    setShowCompletionModal(true);
    processUserDeviations();
    setTimeout(() => {
      setShowCompletionModal(false);
      Alert.alert("축하합니다", "경로를 완주하셨습니다!");
      navigation.navigate("PingSelection");
    }, 1000);
  };

  // 사용자 이탈 경로 처리
  const processUserDeviations = async () => {
    if (userDeviatedPoints.length === 0) return;
    setShowCompletionModal(true);
    console.log("사용자 이탈 경로 처리:", userDeviatedPoints);
    setShowCompletionModal(false);
  };

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

                const {
                  routePoints: newPoints,
                  lastDestinationPoint: newDest,
                  totalRouteDistance: newDist,
                } = preprocessRoute({
                  start: newRoute[0].start,
                  roads: newRoute[0].roads,
                });

                setRoutePoints(newPoints);
                setPassedRoutePoints([]);
                setIsOffRoute(false);
                setUserDeviatedPoints([]);
                setDeviationLines([]);
                setHasUserJoinedRoute(true);

                // 새 경로 전처리 후 화살표 재생성
                createArrows(newPoints);

                handleRouteUpdate(
                  newRoute[0].roads,
                  newPoints,
                  newDest,
                  newDist
                );
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

  // 경로 업데이트 시 호출
  const handleRouteUpdate = (newRoads, newPoints, newDest, newDist) => {
    // start와 end가 같으면 end 조정
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

  // 방향(베어링) 계산 함수
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

  // 두 위치 간 거리 (m단위 정도 해석)
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

  // 도착지 근처 여부
  function isNearDestination(location, destination) {
    if (!destination) return false;
    const distance = distanceBetween(location, destination);
    const arrivalThreshold = 20; // 20m 이내
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
          scrollEnabled={true}
          onPress={onMapPress}
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
              strokeColor="rgba(255,0,0,0.45)"
              strokeWidth={10}
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

          {/* 사용자 위치를 표시할 때 방향 표시: heading 활용 */}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={4}
              fillColor="rgba(0, 122, 255, 0.6)"
              strokeColor="rgba(0, 122, 255, 1)"
              strokeWidth={3}
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
          {/* {newRouteStartPoint && (
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
          )} */}
          {/* 
          {startCoord && (
            <Marker coordinate={startCoord}>
              <Image
                source={require("../../assets/images/startPing.png")}
                style={{ width: 60, height: 60 }}
              />
            </Marker>
          )} */}
          {adjustedEndCoord && (
            <Marker coordinate={adjustedEndCoord}>
              <Image
                source={require("../../assets/images/endPing.png")}
                style={{ width: 60, height: 60 }}
              />
            </Marker>
          )}
          {waypoints.map((wp, i) => (
            <Marker key={`waypoint-${i}`} coordinate={wp}>
              <Image
                source={require("../../assets/images/endPing.png")}
                style={{ width: 60, height: 60 }}
              />
            </Marker>
          ))}

          {/* {segmentArrows.map((arrow) => (
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
                style={{ width: 20, height: 10 }}
              />
            </Marker>
          ))} */}
          {startArrow && (
            <Marker
              coordinate={startArrow.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              style={{
                transform: [{ rotate: `${startArrow.bearing - 90}deg` }],
              }}
            >
              <Image
                source={require("../../assets/images/arrow_start.png")}
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
