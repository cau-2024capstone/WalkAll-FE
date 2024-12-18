// components/navigationScreen/inquiryProcessing.js
import { Alert } from "react-native";

function calculateDistance(loc1, loc2) {
  const deltaLat = loc1.latitude - loc2.latitude;
  const deltaLon = loc1.longitude - loc2.longitude;
  return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
}

function findNearestPoint(location, points) {
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
}

export async function processInquiry(params) {
  const {
    problemStartPoint,
    problemEndPoint,
    routePoints,
    passedRoutePoints,
    setShowCompletionModal,
    setProblemRoutes,
    addAndRemoveTemporaryPin,
    setProblemStartPoint,
    setProblemEndPoint,
    navigation,
    userEmail,
    API_BASE_URL,
  } = params;

  if (!problemStartPoint || !problemEndPoint) {
    Alert.alert("오류", "문제 경로의 시작과 종료 지점을 모두 선택해주세요.");
    return;
  }

  setShowCompletionModal(true);

  try {
    // closest-point API 호출
    console.log(
      `${API_BASE_URL}/api/points/closest-point?lat=${problemStartPoint.latitude}&lng=${problemStartPoint.longitude}&radius=20`
    );
    const startPointResponse = await fetch(
      `${API_BASE_URL}/api/points/closest-point?lat=${problemStartPoint.latitude}&lng=${problemStartPoint.longitude}&radius=20`
    );
    const endPointResponse = await fetch(
      `${API_BASE_URL}/api/points/closest-point?lat=${problemEndPoint.latitude}&lng=${problemEndPoint.longitude}&radius=20`
    );

    const startPointData = await startPointResponse.text();
    const endPointData = await endPointResponse.text();

    if (
      !startPointData ||
      startPointData === "null" ||
      !endPointData ||
      endPointData === "null"
    ) {
      Alert.alert("문의 실패", "유효하지 않은 문의 위치입니다.");
    } else {
      // JSON 파싱
      // console.log(s)
      // const startJSON = JSON.parse(startPointData);
      // const endJSON = JSON.parse(endPointData);

      // // idf 값 추출
      // const startNodeIdf = startJSON.idf;
      // const endNodeIdf = endJSON.idf;

      // submit-inquiry API 호출
      const submitInquiryResponse = await fetch(
        `${API_BASE_URL}/api/users/submit-inquiry/${userEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startNodeIdf: startPointData,
            endNodeIdf: endPointData,
            actionType: "REMOVE",
          }),
        }
      );

      if (!submitInquiryResponse.ok) {
        Alert.alert("문의 실패", "문의 등록 요청에 실패했습니다.");
      } else {
        // 문의 성공 시 경로 설정 및 화면 이동
        const allRoutePoints = routePoints.concat(passedRoutePoints);
        const nearestStartPoint = findNearestPoint(
          problemStartPoint,
          allRoutePoints
        );
        const nearestEndPoint = findNearestPoint(
          problemEndPoint,
          allRoutePoints
        );

        setProblemRoutes((prevRoutes) => [
          ...prevRoutes,
          {
            coordinates: [nearestStartPoint, nearestEndPoint],
            color: "black",
          },
        ]);

        setProblemStartPoint(null);
        setProblemEndPoint(null);
        addAndRemoveTemporaryPin();

        Alert.alert("문의 완료", "문의가 성공적으로 접수되었습니다.");

        // 문의 후 바로 PingSelection으로 이동
        navigation.navigate("PingSelection");
      }
    }
  } catch (error) {
    console.log("가장 가까운 포인트를 가져오는 중 오류 발생:", error);
    Alert.alert("문의 실패", "API 호출에 실패했습니다.");
  } finally {
    setShowCompletionModal(false);
  }
}
