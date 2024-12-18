// screens/MyPageScreen.js

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import rootStyles from "../styles/StyleGuide";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../store/context/userContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

function MyPageScreen({ navigation }) {
  const { userInfo, setUserInfo, token, setToken, API_BASE_URL } =
    useContext(UserContext);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    // Context에서 사용자 데이터 가져오기
    if (userInfo) {
      setUserData({
        email: userInfo.userEmail,
        password: "13231321", // 비밀번호는 빈 문자열로 설정
        name: userInfo.userName,
        phoneNumber: userInfo.userPhoneNumber,
      });
    }
  }, [userInfo]);

  // 로그아웃 버튼 핸들러
  const handleLogout = async () => {
    // AsyncStorage에서 토큰 제거
    await AsyncStorage.removeItem("jwt");
    // Context 초기화
    setToken("");
    setUserInfo({});
    // LoginScreen으로 이동
    navigation.replace("LoginScreen");
  };

  // 수정사항 저장
  const handleSave = async () => {
    setLoading(true); // 로딩 시작
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/email/${userData.email}`,
        {
          userName: userData.name,
          userPhoneNumber: userData.phoneNumber,
          userPassword: userData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if ([200, 201, 202, 203, 204].includes(response.status)) {
        Alert.alert("저장 완료", "사용자 정보가 성공적으로 저장되었습니다.");
        // 변경된 사용자 정보 Context에 업데이트
        setUserInfo({
          ...userInfo,
          userName: userData.name,
          userPhoneNumber: userData.phoneNumber,
        });
      }
    } catch (error) {
      console.error("Error saving user info:", error);
      Alert.alert("오류", "정보를 저장하지 못했습니다.");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <View style={localStyles.container}>
      {/* 로딩 모달 */}
      <Modal transparent={true} visible={loading}>
        <View style={localStyles.modalBackground}>
          <View style={localStyles.modalContainer}>
            <ActivityIndicator size="large" color="green" />
            <Text style={localStyles.modalText}>
              정보를 저장하는 중입니다...
            </Text>
          </View>
        </View>
      </Modal>

      <View style={localStyles.titleContainer}>
        <Text style={localStyles.titleText}>내 정보 변경하기</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 이메일 */}
      <Text style={localStyles.label}>이메일(수정불가)</Text>
      <View style={localStyles.emailInputContainer}>
        <TextInput
          style={localStyles.inputText}
          value={userData.email}
          keyboardType="email-address"
          editable={false} // 읽기 전용
        />
      </View>

      {/* 비밀번호 */}
      <Text style={localStyles.label}>비밀번호</Text>
      <View style={localStyles.inputContainer}>
        <TextInput
          style={localStyles.inputText}
          value={userData.password}
          secureTextEntry
          onChangeText={(text) => setUserData({ ...userData, password: text })}
        />
      </View>

      {/* 이름 */}
      <Text style={localStyles.label}>이름</Text>
      <View style={localStyles.inputContainer}>
        <TextInput
          style={localStyles.inputText}
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
        />
      </View>

      {/* 휴대전화 번호 */}
      <Text style={localStyles.label}>휴대전화 번호</Text>
      <View style={localStyles.inputContainer}>
        <TextInput
          style={localStyles.inputText}
          value={userData.phoneNumber}
          keyboardType="phone-pad"
          onChangeText={(text) =>
            setUserData({ ...userData, phoneNumber: text })
          }
        />
      </View>

      {/* 변경사항 저장 버튼 */}
      <TouchableOpacity style={localStyles.saveButton} onPress={handleSave}>
        <Text style={localStyles.saveButtonText}>수정사항 저장</Text>
      </TouchableOpacity>
    </View>
  );
}

export default MyPageScreen;

const localStyles = StyleSheet.create({
  titleContainer: {
    marginTop: 0,
    paddingTop: "5%",
    height: "12%",
    width: "100%",
    paddingHorizontal: "5%",
    backgroundColor: rootStyles.colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 요소를 양 끝으로 배치
  },
  titleText: {
    ...rootStyles.fontStyles.mainTitle,
    color: "#000",
    marginTop: 0,
  },
  container: {
    flex: 1,
    paddingTop: 0,
    width: "100%",
    backgroundColor: rootStyles.colors.white,
    paddingHorizontal: "5%",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: "green",
  },
  label: {
    ...rootStyles.fontStyles.subTitle,
    color: rootStyles.colors.black,
    marginTop: "5%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: rootStyles.colors.gray3,
    borderRadius: 6,
    paddingHorizontal: "4%",
    marginTop: "2%",
  },
  emailInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: rootStyles.colors.gray3,
    backgroundColor: rootStyles.colors.gray2,
    borderRadius: 6,
    paddingHorizontal: "4%",
    marginTop: "2%",
  },
  inputText: {
    ...rootStyles.fontStyles.text,
    flex: 1,
    color: rootStyles.colors.black,
  },
  saveButton: {
    marginTop: "10%",
    height: 50,
    backgroundColor: rootStyles.colors.green5,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  saveButtonText: {
    ...rootStyles.fontStyles.subTitle,
    color: rootStyles.colors.white,
  },
});
