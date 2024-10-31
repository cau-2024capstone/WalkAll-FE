import React, { useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { View, PanResponder } from "react-native";

const TMapView = ({ latitude, longitude }) => {
  const webViewRef = useRef(null); // 웹뷰 참조
  const [isScrolling, setIsScrolling] = useState(false); // 스크롤 상태 확인

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsScrolling(false); // 터치 시작 시 스크롤 초기화
    },
    onPanResponderMove: () => {
      setIsScrolling(true); // 터치 이동 중 스크롤 상태로 설정
    },
    onPanResponderRelease: () => {
      setTimeout(() => setIsScrolling(false), 100); // 터치 종료 후 스크롤 상태 초기화
    },
  });

  // 웹뷰 로드 후 초기 위치를 설정하는 함수
  const handleWebViewLoad = () => {
    if (webViewRef.current) {
      const message = `initTmap(${latitude}, ${longitude});`;
      webViewRef.current.injectJavaScript(message);
    }
  };

  // 터치 종료 후 스크롤 여부 확인하여 마커 생성
  const handleMessage = (event) => {
    if (!isScrolling) {
      const { lat, lng } = JSON.parse(event.nativeEvent.data);
      const addMarkerMessage = `addMarker(${lat}, ${lng});`;
      webViewRef.current.injectJavaScript(addMarkerMessage);
    }
  };

  return (
    <View {...panResponder.panHandlers} style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={require("./html/TMapView.html")}
        style={{ flex: 1 }}
        onLoad={handleWebViewLoad}
        onMessage={handleMessage} // 웹뷰에서 메시지 수신
      />
    </View>
  );
};

export default TMapView;
