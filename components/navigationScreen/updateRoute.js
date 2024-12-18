// updateRoute.js
// 사용자 위치를 기반으로 경로 상의 위치를 파악하고, 경로 이탈, 복귀, 합류 여부 등을 판단하여 상태를 업데이트하는 로직
// processUserLocation: 사용자 위치 변화 시 호출

let isProcessingLocation = false;

function calculateDistance(loc1, loc2) {
  const deltaLat = loc1.latitude - loc2.latitude;
  const deltaLon = loc1.longitude - loc2.longitude;
  return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
}

function findNearestRoutePointIndex(
  location,
  points,
  isOffRoute,
  hasUserJoinedRoute
) {
  // 경로 상 인덱스를 찾을 때 거리 범위 설정
  // hasUserJoinedRoute 여부에 따라 약간 다를 수 있으나 여기서는 단순화
  let defaultDist;
  if (hasUserJoinedRoute) {
    isOffRoute ? (defaultDist = points.length) : (defaultDist = 20);
  } else {
    defaultDist = 50;
  }

  let previousLocationNearPoints = points.slice(0, defaultDist);
  let minDistance = Infinity;
  let nearestIndex = -1;
  previousLocationNearPoints.forEach((point, index) => {
    const distance = calculateDistance(location, point);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });
  return nearestIndex;
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

function isUserOnRoute(location, points, threshold) {
  for (let point of points) {
    const distance = calculateDistance(location, point);
    if (distance <= threshold) {
      return true;
    }
  }
  return false;
}

export function processUserLocation(params) {
  // 이 함수는 사용자 위치가 업데이트될 때마다 호출되어 경로 상의 상태를 업데이트한다.
  // 경로 합류, 이탈, 복귀 상황을 처리하고, passedRoutePoints, routePoints 등을 갱신한다.

  if (isProcessingLocation) {
    return;
  }
  isProcessingLocation = true;

  const {
    location,
    previousLocation,
    routePoints,
    passedRoutePoints,
    isOffRoute,
    userDeviatedPoints,
    setRoutePoints,
    setPassedRoutePoints,
    setIsOffRoute,
    setUserDeviatedPoints,
    lastDestinationPoint,
    deviationLines,
    setDeviationLines,
    hasUserJoinedRoute,
    setHasUserJoinedRoute,
    initialPassedPoints,
    setInitialPassedPoints,
    handleOffRouteScenario,
  } = params;

  // threshold는 경로 근처 판별 거리(대략적)
  const threshold = 0.0002; // 약 20m 정도
  const allPoints = routePoints.concat(passedRoutePoints);

  // 아직 경로에 합류하지 않은 상태에서, 현재 위치가 경로 위인지 확인
  const isOnRouteNow =
    isUserOnRoute(location, routePoints, threshold) ||
    isUserOnRoute(location, passedRoutePoints, threshold);

  // 아직 경로에 합류하지 않았는데, 경로 위에 들어왔으면 합류 상태로 전환
  if (!hasUserJoinedRoute && isOnRouteNow) {
    setHasUserJoinedRoute(true);
  }

  if (isOnRouteNow) {
    // 사용자가 경로 상에 있음
    if (isOffRoute) {
      // 이전에 이탈 상태였다면, 이제 복귀한 것
      setIsOffRoute(false);
      setUserDeviatedPoints((prev) => [...prev, location]);

      const nearestPoint = findNearestPoint(location, allPoints);
      setDeviationLines((prevLines) => [
        ...prevLines,
        {
          coordinates: [
            userDeviatedPoints[userDeviatedPoints.length - 1],
            nearestPoint,
          ],
          color: "purple",
        },
      ]);
      console.log("사용자가 경로로 복귀했습니다.");
    }

    // 경로 상 인덱스를 찾아 지나온 포인트로 기록
    const nearestPointIndex = findNearestRoutePointIndex(
      location,
      routePoints,
      isOffRoute,
      hasUserJoinedRoute
    );

    if (nearestPointIndex !== -1) {
      const passedPoints = routePoints.slice(0, nearestPointIndex + 1);

      if (!hasUserJoinedRoute) {
        // 경로 합류 전이라면 initialPassedPoints에 누적
        setInitialPassedPoints((prev) => [...prev, ...passedPoints]);
      } else {
        // 경로 합류 후라면 지나간 포인트를 passedRoutePoints로 이동
        setPassedRoutePoints((prev) => [...prev, ...passedPoints]);
      }

      const remainingRoutePoints = routePoints.slice(nearestPointIndex + 1);
      setRoutePoints(remainingRoutePoints);
    }
  } else {
    // 사용자가 경로 상에 없음
    if (hasUserJoinedRoute) {
      // 이미 경로에 합류한 상태에서 경로 밖이라면 이탈로 판단
      if (!isOffRoute) {
        // 처음 이탈하는 순간
        setIsOffRoute(true);
        setUserDeviatedPoints((prevPoints) => [...prevPoints, location]);

        const nearestPoint = findNearestPoint(
          previousLocation || location,
          allPoints
        );
        setDeviationLines((prevLines) => [
          ...prevLines,
          {
            coordinates: [nearestPoint, location],
            color: "purple",
          },
        ]);

        console.log("사용자가 경로에서 이탈했습니다.");

        // 이탈 시나리오 처리: 새로운 경로 탐색 여부 확인
        handleOffRouteScenario(nearestPoint, location);
      } else {
        // 계속 이탈 중이면 이탈 경로 누적
        setUserDeviatedPoints((prevPoints) => [...prevPoints, location]);
        setDeviationLines((prevLines) => [
          ...prevLines,
          {
            coordinates: [
              userDeviatedPoints[userDeviatedPoints.length - 1],
              location,
            ],
            color: "purple",
          },
        ]);
      }
    } else {
      // 아직 경로 합류 전이면 그냥 initialPassedPoints에 계속 찍어둔다.
      setInitialPassedPoints((prev) => [...prev, location]);
    }
  }

  isProcessingLocation = false;
}
