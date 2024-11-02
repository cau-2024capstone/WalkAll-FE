import React, { useRef, useState, useEffect } from "react";
import { WebView } from "react-native-webview";
import { View, PanResponder } from "react-native";
import RouteHeader from "./RouteHeader";

const TMapView = ({ latitude, longitude }) => {
  const webViewRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [routeStage, setRouteStage] = useState("setStartingPoint");
  const [makeRoute, setMakeRoute] = useState(false);

  const handleNextStage = () => {
    if (routeStage === "setStartingPoint") {
      setRouteStage("setStopoverPoint");
    } else if (routeStage === "setStopoverPoint") {
      setRouteStage("setDestinationPoint");
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsScrolling(false),
    onPanResponderMove: () => setIsScrolling(true),
    onPanResponderRelease: () => setTimeout(() => setIsScrolling(false), 100),
  });

  const handleWebViewLoad = () => {
    if (webViewRef.current) {
      const message = `initTmap(${latitude}, ${longitude});`;
      webViewRef.current.injectJavaScript(message);
    }
  };

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      case "log":
        console.log("WebView Log:", data.message);
        break;
      case "location":
        if (!isScrolling) {
          lat = data.coordinates.lat;
          lng = data.coordinates.lng;
          const addMarkerMessage = `addMarker(${lat}, ${lng}, "${routeStage}");`;
          webViewRef.current.injectJavaScript(addMarkerMessage);
        }
        break;
      case "routeMakeData":
        const routeMakeDataTest = {
          startX: 127.08010464906738,
          startY: 37.490008320816926,
          endX: 127.08683252334636,
          endY: 37.49037011805361,
          passList:
            "127.08157718181657,37.48905699854451_127.0825883746152,37.48900166399026_127.08269119262735,37.491289500793926",
          reqCoordType: "WGS84GEO",
          resCoordType: "WGS84GEO",
          searchOption: 4,
          startName: "출발지",
          endName: "도착지",
        };
        const routeMakeData = JSON.parse(data.routeMakeData);
        console.log("경로 생성 데이터:", routeMakeData);

        const urlEncodedData = new URLSearchParams(routeMakeData).toString();

        fetch(
          "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
          {
            method: "POST",
            headers: {
              accept: "application/json",
              appKey: "P4s73F9IVz7sHlNhyg3RC9PwWamafSQb1Zy0g4cy",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: urlEncodedData,
          }
        )
          .then((response) => response.json())
          .then((response) => {
            if (response && response.features) {
              const index = 0; // 필요한 경우 적절한 값으로 변경
              const displayRouteMessage = `displayRoute(${JSON.stringify(
                response.features
              )}, ${index});`;
              webViewRef.current.injectJavaScript(displayRouteMessage);
            } else {
              console.log("정상적인 경로 데이터가 아닙니다:", response);
            }
          })
          .catch((error) => {
            console.log("Error:", error);
          });
        break;
    }
  };

  useEffect(() => {
    if (makeRoute && webViewRef.current) {
      const routeMessage = `startRouteCreation();`;
      webViewRef.current.injectJavaScript(routeMessage);
    }
  }, [makeRoute]);

  return (
    <>
      <RouteHeader
        routeStage={routeStage}
        onConfirm={handleNextStage}
        onMakeRoute={() => setMakeRoute(!makeRoute)}
      />
      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={require("./html/TMapView.html")}
          style={{ flex: 1 }}
          onLoad={handleWebViewLoad}
          onMessage={handleMessage}
          allowUniversalAccessFromFileURLs={true} // Android용
          allowFileAccessFromFileURLs={true} // iOS용
        />
      </View>
    </>
  );
};

export default TMapView;
