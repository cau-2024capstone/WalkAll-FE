import React, { useEffect, useRef } from "react";
import { WebView } from "react-native-webview";

const TMapView = ({ latitude, longitude }) => {
  const webViewRef = useRef(null); //웹뷰 참조

  const handleWebViewLoad = () => {
    if (webViewRef.current) {
      // HTML 파일 로드 후에 위치 값 전달
      const message = `initTmap(${latitude}, ${longitude});`;
      webViewRef.current.injectJavaScript(message);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={["*"]}
      source={require("./html/TMapView.html")}
      style={{ flex: 1 }}
      onLoad={handleWebViewLoad}
    />
  );
};

export default TMapView;
