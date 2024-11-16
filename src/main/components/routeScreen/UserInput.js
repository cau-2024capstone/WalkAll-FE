import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";

const UserInput = ({ navigation, route }) => {
  const { startMarker, waypoints, destinationMarker } = route.params;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "거리 (km)", value: "km" },
    { label: "칼로리 (kcal)", value: "kcal" },
    { label: "시간 (분)", value: "time" },
  ]);

  // 입력값 상태 관리
  const [inputValue, setInputValue] = useState("");

  const generateRoutes = () => {
    navigation.navigate("RecommendedRoutes", {
      startMarker,
      waypoints,
      destinationMarker,
    });
  };

  const totalPoints = [startMarker, ...waypoints, destinationMarker];

  const calculateRegion = (points) => {
    const totalLat = points.reduce((sum, point) => sum + point.latitude, 0);
    const totalLng = points.reduce((sum, point) => sum + point.longitude, 0);
    const centerLat = totalLat / points.length;
    const centerLng = totalLng / points.length;

    const latitudes = points.map((point) => point.latitude);
    const longitudes = points.map((point) => point.longitude);

    const maxLat = Math.max(...latitudes);
    const minLat = Math.min(...latitudes);
    const maxLng = Math.max(...longitudes);
    const minLng = Math.min(...longitudes);

    const latitudeDelta = Math.max((maxLat - minLat) * 1.2, 0.005);
    const longitudeDelta = Math.max((maxLng - minLng) * 1.2, 0.005);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta,
      longitudeDelta,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>산책 목표를 설정해주세요</Text>
      </View>
      <MapView
        style={styles.routeMap}
        initialRegion={calculateRegion(totalPoints)}
      >
        {startMarker && <Marker coordinate={startMarker} pinColor="#008000" />}
        {waypoints &&
          waypoints.map((wp, index) => (
            <Marker key={index} coordinate={wp} pinColor="#FFA500" />
          ))}
        {destinationMarker && (
          <Marker coordinate={destinationMarker} pinColor="#FF0000" />
        )}
      </MapView>
      <View style={styles.inputSection}>
        <DropDownPicker
          placeholder="목표를 선택하세요"
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        {/* 선택된 옵션에 따른 입력 필드와 단위 표시 */}
        {value && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`${
                items.find((item) => item.value === value).label
              } 입력`}
            />
            <Text style={styles.unitText}>
              {value === "km" && "km"}
              {value === "kcal" && "kcal"}
              {value === "time" && "분"}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={generateRoutes}>
          <Text style={styles.buttonText}>추천 경로 생성</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  titleText: {
    textAlign: "center",
    fontSize: 24,
    color: "white",
  },
  routeMap: {
    width: "100%",
    height: 300,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 10,
  },

  button: {
    backgroundColor: "#0d6efd",
    padding: 15,
    borderRadius: 8,
    width: "90%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dropdown: {
    marginBottom: 20,
    borderColor: "#ccc",
  },
  dropdownContainer: {
    borderColor: "#ccc",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
  },
  unitText: {
    marginLeft: 8,
    fontSize: 16,
  },
});
