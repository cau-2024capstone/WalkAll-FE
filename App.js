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

  /*
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("위치 권한이 거부되었습니다.");
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);
  */

  /*
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={[styles.loadingText, { fontFamily: 'NotoSansKR-Regular' }]}>폰트 로드 중...</Text>
      </View>
    );
  }
  */

  /*
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
  */

  return (
    <NavigationContainer>
      <BottomTabApp />
    </NavigationContainer>
  );
};

/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
});
*/

export default App;
