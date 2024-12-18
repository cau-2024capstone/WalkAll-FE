import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { UserContext } from "../store/context/userContext";
import rootStyles from "../styles/StyleGuide";
import { AntDesign } from "@expo/vector-icons";
import MapView, { Polyline, Marker } from "react-native-maps";
import axios from "axios";
import HistoryFilter from "../components/historyScreen/HistoryFilter";

function RouteHistoryScreen() {
  const { userInfo, setUserInfo, API_BASE_URL } = useContext(UserContext);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setFilterVisible] = useState(false);

  const fetchUserInfo = async (email) => {
    try {
      console.log(
        "Fetching user info from URL:",
        `${API_BASE_URL}/api/users/email/${email}`
      );
      const response = await axios.get(
        `${API_BASE_URL}/api/users/email/${email}`
      );
      if (response.status === 200) {
        // Format received data
        const userData = response.data;
        const formattedUserInfo = {
          id: userData.id,
          idf: userData.idf,
          userName: userData.userName,
          userPhoneNumber: userData.userPhoneNumber,
          userEmail: userData.userEmail,
          userPassword: userData.userPassword,
          role: userData.role,
          routes: userData.routes.map((route) => ({
            id: route.id,
            idf: route.idf,
            start: route.start,
            end: route.end,
            date: route.date,
            startCood: route.startCood,
            endCood: route.endCood,
            routeType: route.routeType,
            routeDistance: route.routeDistance,
            routeTime: route.routeTime,
            roadIdfs: route.roadIdfs,
            roadCoords: route.roadCoords,
          })),
          inquiries: userData.inquiries,
        };

        // Update userInfo in context
        setUserInfo(formattedUserInfo);

        // Process route data and update state
        if (formattedUserInfo.routes) {
          const processedRoutes = formattedUserInfo.routes.map((route) => {
            const { region, pointsMap, roads } = processRoute(route);
            return { ...route, region, pointsMap, roads };
          });
          setRoutes(processedRoutes);
        } else {
          setRoutes([]);
        }

        console.log("User info updated successfully:");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const processRoute = (route) => {
    const pointsMap = new Map();
    const roads = [];

    route.roadCoords.forEach((coordStr) => {
      const [startCoordStr, endCoordStr] = coordStr.split("_");
      const [startLng, startLat] = startCoordStr.split(",").map(Number);
      const [endLng, endLat] = endCoordStr.split(",").map(Number);

      const startId = `${startLat},${startLng}`;
      const endId = `${endLat},${endLng}`;

      if (!pointsMap.has(startId)) {
        pointsMap.set(startId, {
          id: startId,
          latitude: startLat,
          longitude: startLng,
        });
      }
      if (!pointsMap.has(endId)) {
        pointsMap.set(endId, {
          id: endId,
          latitude: endLat,
          longitude: endLng,
        });
      }

      roads.push({
        startLat,
        startLng,
        endLat,
        endLng,
      });
    });

    const points = Array.from(pointsMap.values());
    const region = calculateRegion(points);

    return {
      region,
      pointsMap,
      roads,
    };
  };

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

    const latitudeDelta = Math.max((maxLat - minLat) * 1.2, 0.003);
    const longitudeDelta = Math.max((maxLng - minLng) * 1.2, 0.003);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta,
      longitudeDelta,
    };
  };

  useEffect(() => {
    if (userInfo.userEmail) {
      fetchUserInfo(userInfo.userEmail);
    } else {
      setLoading(false);
    }
  }, [userInfo.userEmail]); // Added userInfo.userEmail to dependencies

  const handleRefresh = () => {
    if (userInfo.userEmail) {
      setLoading(true);
      fetchUserInfo(userInfo.userEmail);
    }
  };

  if (loading) {
    return (
      <View style={localStyles.container}>
        <Modal transparent={true} visible={loading}>
          <View style={localStyles.modalBackground}>
            <View style={localStyles.modalContainer}>
              <ActivityIndicator size="large" color="green" />
              <Text style={localStyles.modalText}>
                경로 불러오는 중입니다...
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={localStyles.container}>
        <Text style={localStyles.noRoutesText}>등록된 경로가 없습니다.</Text>
        <TouchableOpacity
          style={localStyles.refreshButton}
          onPress={handleRefresh}
        >
          <TouchableOpacity
            style={localStyles.filterButton}
            onPress={() => setFilterVisible(true)}
          >
            <Text style={localStyles.filterButtonText}>필터</Text>
          </TouchableOpacity>
          <Modal visible={isFilterVisible} transparent animationType="slide">
            <View style={localStyles.modalContainer}>
              {/* <HistoryFilter
                onApply={handleFilterApply}
                onCancel={() => setFilterVisible(false)}
              /> */}
            </View>
          </Modal>

          <AntDesign name="reload1" size={24} color="white" />
          <Text style={localStyles.refreshButtonText}>새로고침</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <HistoryCard route={item} />}
      />
      <TouchableOpacity
        style={localStyles.refreshButton}
        onPress={handleRefresh}
      >
        <AntDesign name="reload1" size={24} color="white" />
        <Text style={localStyles.refreshButtonText}>새로고침</Text>
      </TouchableOpacity>
    </View>
  );
}

const HistoryCard = ({ route }) => {
  const [isRegionReady, setIsRegionReady] = useState(false);

  useEffect(() => {
    if (route.region) {
      setIsRegionReady(true);
    }
  }, [route.region]);

  if (!isRegionReady) {
    return <Text>Loading...</Text>;
  }

  const { date, routeDistance, routeTime, routeType, region, roads } = route;

  // Starting and ending points
  const startPoint = {
    latitude: roads[0].startLat,
    longitude: roads[0].startLng,
  };
  const endRoad = roads[roads.length - 1];
  const endPoint = {
    latitude: endRoad.endLat,
    longitude: endRoad.endLng,
  };

  return (
    <View style={localStyles.cardContainer}>
      <Text style={[rootStyles.fontStyles.subTitle, localStyles.date]}>
        {date}
      </Text>

      <View style={localStyles.mapContainer}>
        <MapView
          style={localStyles.map}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pointerEvents="none"
        >
          {roads.map((road, index) => (
            <Polyline
              key={index}
              coordinates={[
                { latitude: road.startLat, longitude: road.startLng },
                { latitude: road.endLat, longitude: road.endLng },
              ]}
              strokeColor="#024CAA"
              strokeWidth={3}
            />
          ))}
          <Marker coordinate={startPoint} pinColor="green" />
          <Marker coordinate={endPoint} pinColor="red" />
        </MapView>
      </View>

      <View style={localStyles.infoContainer}>
        <Text style={localStyles.infoButton}>{routeType}</Text>
        <Text style={localStyles.infoButton}>{routeDistance} m</Text>
        <Text style={localStyles.infoButton}>{routeTime} mins</Text>
      </View>
    </View>
  );
};

export default RouteHistoryScreen;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rootStyles.colors.grey1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: rootStyles.colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: "green",
  },
  noRoutesText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "black",
  },
  refreshButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: rootStyles.colors.green5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
  },
  refreshButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 16,
  },
  cardContainer: {
    width: "100%",
    paddingVertical: "4%",
    paddingHorizontal: "5%",
    marginBottom: "5%",
    backgroundColor: rootStyles.colors.white,
    borderRadius: 15,
    shadowColor: rootStyles.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  date: {
    marginBottom: "4%",
  },
  mapContainer: {
    width: "100%",
    aspectRatio: 2.5,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: "5%",
    backgroundColor: rootStyles.colors.gray2,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "1%",
    flexWrap: "wrap",
  },
  infoButton: {
    backgroundColor: rootStyles.colors.green1,
    color: rootStyles.colors.green5,
    textAlign: "center",
    paddingVertical: "2%",
    paddingHorizontal: "4%",
    borderRadius: 15,
    fontSize: rootStyles.fontStyles.text.fontSize,
    marginRight: "2%",
    marginBottom: "2%",
  },
});
