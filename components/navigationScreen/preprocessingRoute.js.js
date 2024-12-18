//components/navigationScreen/preprocessingRoute.js

function processRoads(roads, startId) {
  let currentPointId = startId;
  const processedRoads = [];

  roads.forEach((road) => {
    const [fromId, toId] = road.idf.split("_");
    if (fromId === currentPointId) {
      processedRoads.push(road);
      currentPointId = toId;
    } else if (toId === currentPointId) {
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
        "현재 포인트와 연결되지 않은 도로입니다.",
        road,
        currentPointId
      );
    }
  });
  return processedRoads;
}

function interpolatePoints(start, end, numPoints = 10) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const latitude =
      start.latitude + ((end.latitude - start.latitude) * i) / numPoints;
    const longitude =
      start.longitude + ((end.longitude - start.longitude) * i) / numPoints;
    points.push({ latitude, longitude });
  }
  return points;
}

function generateRoutePoints(roads) {
  let routePoints = [];
  for (let i = 0; i < roads.length; i++) {
    const road = roads[i];
    const start = { latitude: road.startLat, longitude: road.startLng };
    const end = { latitude: road.endLat, longitude: road.endLng };
    const segmentPoints = interpolatePoints(start, end);
    routePoints = routePoints.concat(segmentPoints);
  }
  return routePoints;
}

export function preprocessRoute(selectedRoute) {
  const { start, roads } = selectedRoute;
  const processedRoads = processRoads(roads, start);
  const routePoints = generateRoutePoints(processedRoads);
  const lastDestinationPoint = routePoints[routePoints.length - 1];

  return {
    routePoints,
    lastDestinationPoint,
  };
}
