// screens/InquireHistoryScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { UserContext } from "../store/context/userContext";
import rootStyles from "../styles/StyleGuide";
import InquiryCard from "../components/historyScreen/InquiryCard";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";

function InquireHistoryScreen() {
  const { userInfo, setUserInfo, API_BASE_URL } = useContext(UserContext);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // 수신한 데이터 포맷팅
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

        // 컨텍스트의 userInfo 업데이트
        setUserInfo(formattedUserInfo);

        // 스크린의 inquiries 상태 업데이트
        setInquiries(formattedUserInfo.inquiries);

        console.log("User info updated successfully:");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo.userEmail) {
      fetchUserInfo(userInfo.userEmail);
    } else {
      setLoading(false);
    }
  }, []);

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
                문의 내역 불러오는 중입니다...
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (inquiries.length === 0) {
    return (
      <View style={localStyles.container}>
        <Text style={localStyles.noInquiriesText}>
          등록된 문의 내역이 없습니다.
        </Text>
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

  return (
    <View style={localStyles.container}>
      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <InquiryCard inquiry={item} />}
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

export default InquireHistoryScreen;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: rootStyles.colors.grey1,
  },
  noInquiriesText: {
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
  },
  refreshButtonText: {
    color: "white",
    marginLeft: 5,
    fontSize: 16,
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
});
