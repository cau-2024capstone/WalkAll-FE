let map;
let userMarker;
let existingMarkers = []; // 기존 노드 마커 배열 (파란색)
let newMarkers = []; // 새로 추가된 노드 마커 배열 (빨간색)
let allMarkers = []; // 모든 마커 (existingMarkers + newMarkers)
let existingEdges = []; // 기존 엣지 배열 (파란색)
let newEdges = []; // 새로 추가된 엣지 배열 (빨간색)
let currentMode = null; // 'mapping', 'edge', 'info'
let selectedMarkersForEdge = [];
let idCounter = 1; // 노드 ID 카운터

function initMap() {
  const initialLocation = { lat: 37.504555, lng: 126.956949 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: initialLocation,
    zoom: 18,
  });

  const startIdInput = document.getElementById("start-id-input");
  idCounter = parseInt(startIdInput.value) || 1;

  document.getElementById("load-data-btn").addEventListener("click", loadData);
  document
    .getElementById("copy-nodes-json-btn")
    .addEventListener("click", copyNodesToClipboard);
  document
    .getElementById("copy-edges-json-btn")
    .addEventListener("click", copyEdgesToClipboard);
  document
    .getElementById("copy-nodes-cypher-btn")
    .addEventListener("click", copyNodesToClipboardCypher);
  document
    .getElementById("copy-edges-cypher-btn")
    .addEventListener("click", copyEdgesToClipboardCypher);
  document
    .getElementById("mapping-mode-btn")
    .addEventListener("click", () => setMode("mapping"));
  document
    .getElementById("edge-mode-btn")
    .addEventListener("click", () => setMode("edge"));
  document
    .getElementById("info-mode-btn")
    .addEventListener("click", () => setMode("info"));

  document
    .getElementById("street-checkbox")
    .addEventListener("change", handleRoadTypeCheckbox);
  document
    .getElementById("alley-checkbox")
    .addEventListener("change", handleRoadTypeCheckbox);

  map.addListener("click", (event) => {
    if (currentMode === "mapping") {
      addNewMarker(event.latLng);
    }
  });
}

function setMode(mode) {
  currentMode = mode;
  document.getElementById("mapping-mode-btn").innerText =
    currentMode === "mapping" ? "맵핑 생성 모드 (활성화)" : "맵핑 생성 모드";
  document.getElementById("edge-mode-btn").innerText =
    currentMode === "edge" ? "엣지 생성 모드 (활성화)" : "엣지 생성 모드";
  document.getElementById("info-mode-btn").innerText =
    currentMode === "info" ? "정보 보기 모드 (활성화)" : "정보 보기 모드";

  document.getElementById("node-parameters").style.display =
    currentMode === "mapping" ? "block" : "none";
  document.getElementById("edge-parameters").style.display =
    currentMode === "edge" ? "block" : "none";

  if (currentMode !== "edge") {
    resetEdgeSelection();
  }
}

function loadData() {
  const startIdInput = document.getElementById("start-id-input");

  nodes.forEach((node) => {
    const position = new google.maps.LatLng(node.lat, node.lng);
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: `Node ${node.idf || node.id}`,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });
    marker.nodeData = {
      idf: node.idf || node.id,
      lat: node.lat,
      lng: node.lng,
      pointType: node.pointType,
      pointDetails: node.pointDetails,
    };
    existingMarkers.push(marker);
    allMarkers.push(marker);

    marker.addListener("click", () => {
      if (currentMode === "edge") {
        selectMarkerForEdge(marker);
      } else if (currentMode === "info") {
        displayInfo(marker.nodeData);
      } else {
        if (currentMode === "mapping") {
          alert("기존 마커는 삭제할 수 없습니다.");
        }
      }
    });
  });

  edges.forEach((edge) => {
    const startMarker = findMarkerByPosition(edge.startLat, edge.startLng);
    const endMarker = findMarkerByPosition(edge.endLat, edge.endLng);

    if (startMarker && endMarker) {
      const polyline = new google.maps.Polyline({
        path: [startMarker.getPosition(), endMarker.getPosition()],
        geodesic: true,
        strokeColor: "#0000FF",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map,
      });
      polyline.edgeData = {
        idf: edge.idf,
        startLat: edge.startLat,
        startLng: edge.startLng,
        endLat: edge.endLat,
        endLng: edge.endLng,
        roadDistance: edge.roadDistance,
        roadType: edge.roadType,
      };
      existingEdges.push(polyline);

      polyline.addListener("click", () => {
        if (currentMode === "info") {
          displayInfo(polyline.edgeData);
        } else if (currentMode === "edge") {
          alert("기존 엣지는 삭제할 수 없습니다.");
        }
      });
    }
  });

  let maxId = 0;
  existingMarkers.forEach((marker) => {
    const idf = parseInt(marker.nodeData.idf);
    if (idf > maxId) {
      maxId = idf;
    }
  });

  idCounter = maxId + 1;
  startIdInput.value = idCounter;

  alert("데이터가 성공적으로 로드되었습니다.");
}

function findMarkerByPosition(lat, lng) {
  return allMarkers.find(
    (marker) =>
      Math.abs(marker.getPosition().lat() - lat) < 0.000001 &&
      Math.abs(marker.getPosition().lng() - lng) < 0.000001
  );
}

function handleRoadTypeCheckbox(event) {
  const streetCheckbox = document.getElementById("street-checkbox");
  const alleyCheckbox = document.getElementById("alley-checkbox");

  if (event.target.id === "street-checkbox" && streetCheckbox.checked) {
    alleyCheckbox.checked = false;
  } else if (event.target.id === "alley-checkbox" && alleyCheckbox.checked) {
    streetCheckbox.checked = false;
  }
}

function addNewMarker(position) {
  const pointTypeRadios = document.getElementsByName("point-type");
  let pointType = null;
  for (const radio of pointTypeRadios) {
    if (radio.checked) {
      pointType = radio.value !== "null" ? radio.value : null;
      break;
    }
  }

  const pointDetails =
    document.getElementById("point-details-input").value || null;

  const marker = new google.maps.Marker({
    position: position,
    map: map,
    title: "New Marker",
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    },
  });
  marker.nodeData = {
    idf: idCounter++,
    lat: position.lat().toFixed(13),
    lng: position.lng().toFixed(13),
    pointType: pointType,
    pointDetails: pointDetails,
  };
  newMarkers.push(marker);
  allMarkers.push(marker);

  marker.addListener("click", () => {
    if (currentMode === "edge") {
      selectMarkerForEdge(marker);
    } else if (currentMode === "mapping") {
      marker.setMap(null);
      newMarkers = newMarkers.filter((m) => m !== marker);
      allMarkers = allMarkers.filter((m) => m !== marker);
    } else if (currentMode === "info") {
      displayInfo(marker.nodeData);
    }
  });
}

function selectMarkerForEdge(marker) {
  if (!selectedMarkersForEdge.includes(marker)) {
    selectedMarkersForEdge.push(marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }

  if (selectedMarkersForEdge.length === 2) {
    const markerA = selectedMarkersForEdge[0];
    const markerB = selectedMarkersForEdge[1];

    const street = document.getElementById("street-checkbox").checked;
    const alley = document.getElementById("alley-checkbox").checked;
    const steep = document.getElementById("steep-checkbox").checked;

    if (!street && !alley && !steep) {
      alert("Road Type에서 최소 하나를 선택해야 합니다.");
      resetEdgeSelection();
      return;
    }

    const totalRoadDistance =
      google.maps.geometry.spherical.computeDistanceBetween(
        markerA.getPosition(),
        markerB.getPosition()
      );

    const roadType = [];
    if (street) roadType.push("Street");
    if (alley) roadType.push("Alley");
    if (steep) roadType.push("Steep");

    const startId = markerA.nodeData.idf;
    const endId = markerB.nodeData.idf;
    const idf = `${startId}_${endId}`;

    const edgeData = {
      idf: idf,
      startLat: markerA.getPosition().lat().toFixed(13),
      startLng: markerA.getPosition().lng().toFixed(13),
      endLat: markerB.getPosition().lat().toFixed(13),
      endLng: markerB.getPosition().lng().toFixed(13),
      roadDistance: totalRoadDistance,
      roadType: roadType,
    };

    const edge = new google.maps.Polyline({
      path: [markerA.getPosition(), markerB.getPosition()],
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: map,
    });
    edge.edgeData = edgeData;

    edge.addListener("click", () => {
      if (currentMode === "edge") {
        edge.setMap(null);
        newEdges = newEdges.filter((e) => e !== edge);
      } else if (currentMode === "info") {
        displayInfo(edge.edgeData);
      }
    });

    newEdges.push(edge);

    resetEdgeSelection();
  }
}

function resetEdgeSelection() {
  selectedMarkersForEdge.forEach((marker) => {
    marker.setAnimation(null);
  });
  selectedMarkersForEdge = [];
}

function displayInfo(data) {
  const infoDisplay = document.getElementById("info-display");
  infoDisplay.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

// 노드와 엣지는 기존 + 신규 모두 포함해서 복사하도록 수정
function copyNodesToClipboard() {
  const allNodes = [...existingMarkers, ...newMarkers].map((marker) => ({
    idf: marker.nodeData.idf,
    lat: marker.nodeData.lat,
    lng: marker.nodeData.lng,
    pointType: marker.nodeData.pointType,
    pointDetails: marker.nodeData.pointDetails,
  }));

  const jsData = `const nodes = ${JSON.stringify(allNodes, null, 2)};`;
  copyTextToClipboard(jsData);
  alert("전체 노드 데이터가 클립보드에 복사되었습니다.");
}

function copyEdgesToClipboard() {
  const allEdges = [...existingEdges, ...newEdges].map((edge) => ({
    idf: edge.edgeData.idf,
    startLat: edge.edgeData.startLat,
    startLng: edge.edgeData.startLng,
    endLat: edge.edgeData.endLat,
    endLng: edge.edgeData.endLng,
    roadDistance: edge.edgeData.roadDistance,
    roadType: edge.edgeData.roadType,
  }));

  const jsData = `const edges = ${JSON.stringify(allEdges, null, 2)};`;
  copyTextToClipboard(jsData);
  alert("전체 엣지 데이터가 클립보드에 복사되었습니다.");
}

function copyNodesToClipboardCypher() {
  const allMarkersCombined = [...existingMarkers, ...newMarkers];

  // Cypher 복사 시에도 전체 노드를 포함하도록
  // 이미 idf가 있으므로 별도 재할당 없음
  let createStatements = "CREATE\n";
  createStatements +=
    allMarkersCombined
      .map((marker) => {
        const id = marker.nodeData.idf;
        const lat = marker.nodeData.lat;
        const lng = marker.nodeData.lng;
        const pointType = marker.nodeData.pointType
          ? `"${marker.nodeData.pointType}"`
          : "null";
        const pointDetails = marker.nodeData.pointDetails
          ? `"${marker.nodeData.pointDetails}"`
          : "null";
        return `(p${id}:Point {idf: "${id}", lng: ${lng}, lat: ${lat}, pointType: ${pointType}, pointDetails: ${pointDetails}, location: point({latitude: ${lat}, longitude: ${lng}})})`;
      })
      .join(",\n") + ";";

  copyTextToClipboard(createStatements);
  alert("전체 노드의 Cypher CREATE 문이 클립보드에 복사되었습니다.");
}

function copyEdgesToClipboardCypher() {
  const allMarkersCombined = [...existingMarkers, ...newMarkers];
  const allEdgesCombined = [...existingEdges, ...newEdges];

  const nodeIdMap = {};
  allMarkersCombined.forEach((marker) => {
    const lat = parseFloat(marker.nodeData.lat);
    const lng = parseFloat(marker.nodeData.lng);
    nodeIdMap[`${lat},${lng}`] = marker.nodeData.idf;
  });

  const edgesData = allEdgesCombined
    .map((edge) => {
      const startLat = parseFloat(edge.edgeData.startLat);
      const startLng = parseFloat(edge.edgeData.startLng);
      const endLat = parseFloat(edge.edgeData.endLat);
      const endLng = parseFloat(edge.edgeData.endLng);

      const startId = nodeIdMap[`${startLat},${startLng}`];
      const endId = nodeIdMap[`${endLat},${endLng}`];

      if (startId == null || endId == null) {
        return null;
      }

      const idf = edge.edgeData.idf;
      const roadDistance = edge.edgeData.roadDistance;
      const roadType = edge.edgeData.roadType;
      return {
        idf,
        startId,
        endId,
        roadDistance,
        roadType,
        startLat,
        startLng,
        endLat,
        endLng,
      };
    })
    .filter((edge) => edge != null);

  const edgeNodes = new Set();
  edgesData.forEach((edge) => {
    edgeNodes.add(edge.startId);
    edgeNodes.add(edge.endId);
  });

  const matchStatements =
    "MATCH " +
    [...edgeNodes].map((id) => `(p${id}:Point {idf: "${id}"})`).join(", ");

  const createStatements =
    "CREATE\n" +
    edgesData
      .map((edge) => {
        return `(p${edge.startId})-[:ROAD {idf: "${edge.idf}", roadDistance: ${
          edge.roadDistance
        }, roadType: [${edge.roadType
          .map((rt) => `"${rt}"`)
          .join(", ")}], startLat: ${edge.startLat}, startLng: ${
          edge.startLng
        }, endLat: ${edge.endLat}, endLng: ${edge.endLng}}]->(p${edge.endId})`;
      })
      .join(",\n") +
    ";";

  const cypherStatements = matchStatements + "\n\n" + createStatements;

  copyTextToClipboard(cypherStatements);
  alert("전체 엣지의 Cypher MATCH 및 CREATE 문이 클립보드에 복사되었습니다.");
}

function copyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("텍스트를 클립보드에 복사하는 중 오류 발생:", err);
  }

  document.body.removeChild(textArea);
}

window.initMap = initMap;
