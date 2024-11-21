import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { GOOGLE_MAPS_API_KEY } from "@env"; // 환경 변수에서 API 키 가져오기
import rootStyles from "../styles/StyleGuide";
import HistorySearch from "../components/historyScreen/HistorySearch";
import HistoryCardArea from "../components/historyScreen/HistoryCardArea";

function HistoryScreen() {
  const [historyData, setHistoryData] = useState([]); // 서버에서 가져온 데이터
  const [searchResults, setSearchResults] = useState([]); // 검색 결과
  const searchInputRef = React.useRef(); // 검색어 상태 초기화 참조

  // 위도, 경도를 주소로 변환하는 함수
  const reverseGeocode = async (lat, lng) => {
    try {
      console.log(`Requesting reverse geocode for lat: ${lat}, lng: ${lng}`); // 디버깅 로그

      // 유효 범위 체크
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error("Latitude or longitude out of range");
        return "위치 불명";
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=ko`
      );

      if (!response.ok) {
        throw new Error(
          `Geocoding API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const dong = addressComponents.find(
          (comp) =>
            comp.types.includes("sublocality_level_2") || // 동(소단위)
            comp.types.includes("sublocality_level_1") // 구(대단위)
        );
        return dong ? dong.long_name : "위치 불명";
      } else {
        console.error("Invalid response from Geocoding API:", data);
        return "위치 불명";
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return "위치 불명";
    }
  };

  // API로부터 데이터 가져오기
  const fetchHistoryData = async () => {
    try {
      const response = await fetch(
        "https://accurately-healthy-duckling.ngrok-free.app/api/users/email/mj10050203@gmail.com"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history data");
      }

      const data = await response.json();
      console.log("History data response:", data); // 디버깅 로그
      const routes = data.routes || [];
      const formattedData = await Promise.all(
        routes.map(async (route) => {
          // 위도와 경도의 순서 교정
          const [startLng, startLat] = route.startCood.split(",").map(Number);
          const [endLng, endLat] = route.endCood.split(",").map(Number);

          // 주소로 변환
          const startDong = await reverseGeocode(startLat, startLng);
          const endDong = await reverseGeocode(endLat, endLng);

          return {
            id: route.id,
            date: route.date,
            start: startDong,
            end: endDong,
            duration: `${route.routeTime} mins`,
            distance: `${route.routeDistance} m`,
          };
        })
      );

      setHistoryData(formattedData);
      setSearchResults(formattedData); // 초기 검색 결과는 전체 데이터
    } catch (error) {
      console.error("Error fetching history data:", error);
      Alert.alert("오류", "기록 데이터를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchHistoryData();
    };
    fetchData();
  }, []);

  // 검색 핸들러
  const handleSearch = (query) => {
    const filteredData = historyData.filter(
      (item) =>
        item.start.includes(query) ||
        item.end.includes(query) ||
        item.date.includes(query)
    );
    setSearchResults(filteredData);
  };

  // 새로 고침 핸들러
  const handleRefresh = () => {
    setSearchResults(historyData); // 초기 데이터로 복원
    if (searchInputRef.current) {
      searchInputRef.current.clearSearch(); // 검색어 초기화
    }
  };

  return (
    <View style={localStyles.container}>
      <HistorySearch
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        ref={searchInputRef}
      />
      <HistoryCardArea data={searchResults} />
    </View>
  );
}

export default HistoryScreen;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: rootStyles.colors.grey1,
  },
});
