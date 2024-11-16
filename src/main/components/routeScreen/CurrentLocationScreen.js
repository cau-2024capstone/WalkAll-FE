// src/main/components/CurrentLocationScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const CurrentLocationScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("위치 권한이 허용되지 않았습니다.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  let text = "위치를 가져오는 중...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `위도: ${location.latitude}, 경도: ${location.longitude}`;
  }

  return (
    <View style={styles.container}>
      <Text>{text}</Text>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="현재 위치"
            onPress={() => {}}
          />
        </MapView>
      )}
    </View>
  );
};

export default CurrentLocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  map: {
    width: "100%",
    height: "80%",
  },
});
