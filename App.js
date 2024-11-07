import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import TMapView from "./src/main/components/TMapView.js";
import BottomTabApp from "./src/main/components/TabBar.js";


SplashScreen.preventAutoHideAsync();

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);


  const [fontsLoaded, error] = useFonts({
    'NotoSansKR-Regular': require("./src/main/assets/fonts/NotoSansKR-Regular.ttf"),
    'NotoSansKR-Medium': require("./src/main/assets/fonts/NotoSansKR-Medium.ttf"),
    'NotoSansKR-Bold': require("./src/main/assets/fonts/NotoSansKR-Bold.ttf"),

  });
  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    (async () => {
      // 위치 권한 요청
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("위치 권한이 거부되었습니다.");
        return;
      }

      // 현재 위치 가져오기
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  if (!fontsLoaded && !error) {
    return null;
  }

  const renderContent = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      return (
        <View style={styles.container}>
          <TMapView latitude={latitude} longitude={longitude} />
        </View>
      );
    } else if (errorMsg) {
      return (
        <View style={styles.container}>
          <Text style={{ fontFamily: 'NotoSansKR-Regular' }}>{errorMsg}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={[styles.loadingText, { fontFamily: 'NotoSansKR-Regular' }]}>지도 불러오는 중...</Text>
        </View>
      );
    }
  };

  // 폰트가 로드되지 않은 경우 로딩 스크린을 표시
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={[styles.loadingText, { fontFamily: 'NotoSansKR-Regular' }]}>폰트 로드 중...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {renderContent()}
      <BottomTabApp />
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    marginBottom: 100,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
  },
});
