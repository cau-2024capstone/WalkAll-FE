import React, { useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { View, PanResponder } from "react-native";
import RouteHeader from "./RouteHeader";

const TMapView = ({ latitude, longitude }) => {
  const webViewRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [routeStage, setRouteStage] = useState("setStartingPoint");

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
    if (!isScrolling) {
      const { lat, lng } = JSON.parse(event.nativeEvent.data);
      const addMarkerMessage = `addMarker(${lat}, ${lng});`;
      webViewRef.current.injectJavaScript(addMarkerMessage);
    }
  };

  return (
    <>
      <RouteHeader routeStage={routeStage} onConfirm={handleNextStage} />
      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={require("./html/TMapView.html")}
          style={{ flex: 1 }}
          onLoad={handleWebViewLoad}
          onMessage={handleMessage}
        />
      </View>
    </>
  );
};

export default TMapView;
