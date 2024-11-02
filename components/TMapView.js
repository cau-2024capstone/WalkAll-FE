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
        routeMakeData = data.routeMakeData;
        console.log("routeMakeData:", routeMakeData);
        fetch(
          "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
          {
            method: "POST",
            headers: {
              accept: "application/json",
              appKey: "P4s73F9IVz7sHlNhyg3RC9PwWamafSQb1Zy0g4cy", // appKey 확인
              "Content-Type": "application/json",
            },
            body: JSON.stringify(routeMakeData),
          }
        )
          .then((response) => response.json())
          .then((response) => {
            console.log("응답 내용:", response);
            const displayRouteMessage = `displayRoute(response.features, index);`;
            webViewRef.current.injectJavaScript(displayRouteMessage);
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
