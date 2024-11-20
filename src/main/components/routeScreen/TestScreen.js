// TestScreen.js

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
  const [deviatedEdges, setDeviatedEdges] = useState([]); // 사용자 이탈 경로
  const [isOffRoute, setIsOffRoute] = useState(false); // 이전 사용자 위치가 경로를 이탈했는 지 여부
  const [lastOnRoutePoint, setLastOnRoutePoint] = useState(null); // 마지막으로 경로 위에 있던 포인트
  const [lastOffRoutePoint, setLastOffRoutePoint] = useState(null); // 마지막 이탈 포인트
  const [passedRoutePoints, setPassedRoutePoints] = useState([]); //지나온 경로 포인트
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
  const [problemRoutes, setProblemRoutes] = useState([]); // 문제 경로들
  const mapRef = useRef(null); // 지도 참조

  useEffect(() => {
    /* 
    도로의 올바른 방향 처리하는 함수
    도로의 순서는 정해져 있지만 1->2, 2->1로 연결된 이동 순서는 다를 수 있음 이를 바로잡아주는 함수임

    처리 후에 processedRoads에 저장하여 반환
    저장되는건
    [
      {
        idf: "2_3",
        startLat: 37.501,
        startLng: 126.953,
        endLat: 37.502,
        endLng: 126.954,
      }, ...
    ]
    */
    const processRoads = (roads, startId) => {
      let currentPointId = startId;
      const processedRoads = []; // 도로를 처리한 후 저장할 배열

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
    setLastOnRoutePoint(points[0]); //사용자 경로 이탈 전 마지막 세분화된 포인트
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

  /*
  이 함수는 도로들을 받아서 각 도로의 시작점과 끝점 사이를 세분화하여 반환합니다.
  세분화 하는 이유는 우리의 도로 길이가 길 경우 위치 처리가 너무 복잡했음(어디에 매핑시켜야 하는 지 애매)
  따라서 도로의 시작점과 끝점 사이를 10개의 점으로 도로를 세분화하는 함수임
  */
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

  // 두 지점 사이를 세분화하여 반환 (10개의 점) 자세한 설명은 위 generateRoutePoints 함수 참고
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
        `http://${localIP}:8082/api/points/closest-point?lat=${problemStartPoint.latitude}&lng=${problemStartPoint.longitude}&radius=20`
      );
      const endPointResponse = await fetch(
        `http://${localIP}:8082/api/points/closest-point?lat=${problemEndPoint.latitude}&lng=${problemEndPoint.longitude}&radius=20`
      );

      const startPointData = await startPointResponse.text(); //응답이 JSON이 아니라 text로 받아옴
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
        setProblemRoutes((prevRoutes) => {
          const updatedRoutes = [
            ...prevRoutes,
            {
              coordinates: [nearestStartPoint, nearestEndPoint],
              color: "black",
            },
          ];
          return updatedRoutes;
        });

        Alert.alert("문의 완료", "문의가 성공적으로 접수되었습니다.");
      }
    } catch (error) {
      console.log("Error fetching closest points:", error);
      Alert.alert("문의 실패", "API 호출 실패");
    } finally {
      setShowCompletionModal(false);
      setProblemRouteSetting(null);
      setShowReportButtons(false);
      // 문제 경로 설정 후 마커 제거
      setProblemStartPoint(null);
      setProblemEndPoint(null);
    }
  };

  //사용자 위치 설정 취소
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
  const confirmEndNavigation = async () => {
    setShowEndNavigationConfirm(false);
    setShowCompletionModal(true);

    // 사용자 이탈 경로 처리
    await processUserDeviations();

    setShowCompletionModal(false);
    navigation.navigate("ResultScreen", {
      passedRoutePoints,
      deviatedEdges,
      problemRoutes,
    });
  };

  // 네비게이션 종료 확인 모달에서 취소 버튼 클릭 시 호출
  const cancelEndNavigation = () => {
    setShowEndNavigationConfirm(false);
  };

  const onMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    //문제 경로 시작 지점 설정
    if (problemRouteSetting === "start") {
      setProblemStartPoint({ latitude, longitude });
      addAndRemoveTemporaryPin();
      setProblemRouteSetting(null);
      Alert.alert("알림", "문제 경로 시작 지점이 설정되었습니다.");

      //문제 경로 도착 지점 설정
    } else if (problemRouteSetting === "end") {
      setProblemEndPoint({ latitude, longitude });
      addAndRemoveTemporaryPin();
      setProblemRouteSetting(null);
      Alert.alert("알림", "문제 경로 도착 지점이 설정되었습니다.");

      //사용자 위치 설정
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

  /*
  목표 경로 이탈 여부를 확인하고 사용자의 위치를 확인하는 함수
  isOnRoute: 사용자가 경로 위에 있는지 여부
  isOffRoute: 이전 사용자 위치가 경로를 이탈했는 지 여부 (이전 사용자 위치가 경로를 이탈했으면 true)
  
  */
  const checkUserLocation = (location) => {
    const threshold = 0.0002;

    // 사용자가 경로 안에 있는 지 확인 (지나간 경로(회색 경로)도 포함시킴)
    const isOnRoute =
      isUserOnRoute(location, routePoints, threshold) ||
      isUserOnRoute(location, passedRoutePoints, threshold);

    //확인했더니 경로 안에 있네?
    if (isOnRoute) {
      // 돌아오기 전 사용자가 위치가 경로 위에 있음
      if (isOffRoute) {
        //이전 사용자 위치가 경로를 이탈했었음
        // 따라서 이건 경로를 방금 나갔었는데 다시 들어온 경우 처리임
        const nearestPoint = findNearestPoint(
          location,
          routePoints.concat(passedRoutePoints) //지나간 경로도 포함
        ); //가장 가까운 세분화된 포인트 찾기
        const newEdge = [lastOffRoutePoint, nearestPoint]; // 복귀 바로 전 지점과 가장 가까운 지점을 연결
        // 이탈 경로 저장
        setDeviatedEdges((prevEdges) => [
          ...prevEdges,
          { coordinates: newEdge, color: "purple" },
        ]);

        //돌아왔으니까 이탈 여부 false로 변경
        setIsOffRoute(false);
        //이탈 포인트 저장
        setUserDeviatedPoints((prevPoints) => [...prevPoints, location]);
        //마지막으로 경로 위에 있던 포인트 저장
        setLastOnRoutePoint(nearestPoint);

        console.log("사용자가 경로로 복귀했습니다.");
      }

      const nearestPointIndex = findNearestRoutePointIndex(
        location,
        routePoints
      );

      // 가장 가까운 경로 포인트를 찾았으면
      if (nearestPointIndex !== -1) {
        //지나간 경로에 추가
        const passedPoints = routePoints.slice(0, nearestPointIndex + 1);
        setPassedRoutePoints((prevPoints) => [...prevPoints, ...passedPoints]);

        const remainingRoutePoints = routePoints.slice(nearestPointIndex + 1);
        setRoutePoints(remainingRoutePoints);
      }

      // 도착 버튼 활성화 여부 확인
      if (routePoints.length === 0 || isNearDestination(location)) {
        setArrivalButtonEnabled(true);
      }

      //isOnRoute가 false인 경우 (사용자가 경로를 이탈한 경우)
    } else {
      // 처음으로 경로를 이탈함
      //이탈 끝 ~ 과 마찬가지의 로직 (위에 확인)
      if (!isOffRoute) {
        const nearestPoint = findNearestPoint(
          lastOnRoutePoint,
          routePoints.concat(passedRoutePoints)
        );
        const newEdge = [nearestPoint, location];
        setDeviatedEdges((prevEdges) => [
          ...prevEdges,
          { coordinates: newEdge, color: "purple" },
        ]);
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
        //이탈했는데 이전껏도 이탈임 (벗어난 점 + 벗언난 점 연결)
        // 계속해서 경로를 이탈 중
        setDeviatedEdges((prevEdges) => {
          const updatedEdges = [...prevEdges];
          const lastEdge = updatedEdges[updatedEdges.length - 1];
          const updatedCoordinates = [...lastEdge.coordinates, location];
          updatedEdges[updatedEdges.length - 1] = {
            ...lastEdge,
            coordinates: updatedCoordinates,
          };
          return updatedEdges;
        });
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

  //거리 계산
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
  const handleArriveButtonPress = async () => {
    setShowCompletionModal(true);

    // 사용자 이탈 경로 처리 (아직 약간 부족해보임)
    await processUserDeviations();

    setShowCompletionModal(false);
    navigation.navigate("ResultScreen", {
      passedRoutePoints,
      deviatedEdges,
      problemRoutes,
    });
  };

  /*
  경로 이탈 처리 함수
  
  
  */
  const processUserDeviations = async () => {
    if (userDeviatedPoints.length === 0) return;

    // 로딩 모달 표시 오래걸림
    setShowCompletionModal(true);

    // 여기서 사용자 이탈 경로를 처리하는 로직이 있습니다.
    // ...

    setShowCompletionModal(false);
  };

  return (
    <View style={styles.container}>
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
        scrollEnabled={!isSetUserLocationActive && !problemRouteSetting}
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
        {deviatedEdges.map((edge, index) => (
          <Polyline
            key={`deviatedEdge-${index}`}
            coordinates={edge.coordinates}
            strokeColor={edge.color}
            strokeWidth={3}
          />
        ))}
        {problemRoutes.map((route, index) => (
          <Polyline
            key={`problemRoute-${index}`}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={3}
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
            title="문제 경로 시작 지점"
          />
        )}
        {problemEndPoint && (
          <Marker
            coordinate={problemEndPoint}
            pinColor="red"
            title="문제 경로 도착 지점"
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
