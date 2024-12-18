// screens/LoginScreen.js

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import StyleGuide from "../styles/StyleGuide.js";
import { MaterialIcons } from "@expo/vector-icons";
import AdminScreen from "./AdminScreen";
import axios from "axios";
import { UserContext } from "../store/context/userContext.js";

function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [isAdmin, setIsAdmin] = useState(false); // admin 상태 추가
  const { setToken, setUserInfo, API_BASE_URL } = useContext(UserContext); // Context에서 값 가져오기

  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
    if (route.params?.password) setPassword(route.params.password);
  }, [route.params]);

  const handleLogin = async () => {
    console.log(API_BASE_URL);
    setLoading(true); // 로딩 시작
    try {
      // 테스트 로그인 처리
      if (email === "a" && password === "a") {
        const jwt = "test_jwt_token"; // 임시 JWT 토큰
        await AsyncStorage.setItem("jwt", jwt);
        setToken(jwt);
        setUserInfo({ email });
        Alert.alert("로그인 성공", "테스트 로그인 성공");
        navigation.navigate("BottomTabApp");
      } else {
        console.log(`${API_BASE_URL}/auth/login`);
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          userEmail: email,
          userPassword: password,
        });

        if (response.status === 201) {
          const { jwt, message } = response.data;

          // JWT 토큰 저장
          await AsyncStorage.setItem("jwt", jwt);
          setToken(jwt);
          setUserInfo({ email });
          console.log("토큰 저장 및 Context 업데이트 성공");

          // 사용자 정보 가져오기
          await fetchUserInfo(email);

          // 성공 메시지 표시 및 화면 이동
          // Alert.alert("로그인 성공", message);

          if (email === "admin@admin.com") {
            // Admin 화면 렌더링
            setIsAdmin(true);
          } else {
            navigation.navigate("BottomTabApp");
          }
        }
      }
    } catch (error) {
      // 에러 처리
      console.log(error);
      if (error.response && error.response.data) {
        Alert.alert(
          "로그인 실패",
          error.response.data.message ||
            "이메일 또는 비밀번호가 잘못되었습니다."
        );
      } else {
        Alert.alert(
          "로그인 실패",
          "네트워크 오류가 발생했습니다. 다시 시도해주세요."
        );
      }
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 사용자 정보 가져오기 함수
  const fetchUserInfo = async (email) => {
    try {
      console.log(
        "사용자 정보 불러오기 url : ",
        `${API_BASE_URL}/api/users/email/${email}`
      );
      const response = await axios.get(
        `${API_BASE_URL}/api/users/email/${email}`
      );
      if (response.status === 200) {
        // 서버로부터 받은 데이터를 정리
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

        // userInfo 상태 업데이트
        setUserInfo(formattedUserInfo);

        // 업데이트된 userInfo 콘솔에 JSON 형식으로 출력
        console.log("사용자 정보 업데이트 성공:");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleSignupNavigation = () => {
    navigation.navigate("SignupScreen");
  };

  if (isAdmin) {
    // AdminScreen 컴포넌트 렌더링
    return <AdminScreen />;
  }

  return (
    <View style={localStyles.container}>
      {/* 로딩 모달 */}
      <Modal transparent={true} visible={loading}>
        <View style={localStyles.modalBackground}>
          <View style={localStyles.modalContainer}>
            <ActivityIndicator size="large" color="green" />
            <Text style={localStyles.modalText}>로그인 중...</Text>
          </View>
        </View>
      </Modal>

      <View style={localStyles.header}>
        <Text style={[StyleGuide.fontStyles.mainTitle, { fontSize: 30 }]}>
          Login
        </Text>
        <Text style={[StyleGuide.fontStyles.text, { fontSize: 14 }]}>
          돌아오신 걸 환영해요, Walk-ER 님!!
        </Text>
      </View>

      {/* 이메일 입력 필드 */}
      <View style={localStyles.inputContainer}>
        <Text style={[StyleGuide.fontStyles.subTitle, { fontSize: 16 }]}>
          이메일
        </Text>
        <View style={localStyles.inputField}>
          <MaterialIcons
            name="email"
            size={20}
            color={StyleGuide.colors.gray4}
          />
          <TextInput
            style={localStyles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="이메일을 입력하세요"
            placeholderTextColor={StyleGuide.colors.gray5}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* 비밀번호 입력 필드 */}
      <View style={localStyles.inputContainer}>
        <Text style={[StyleGuide.fontStyles.subTitle, { fontSize: 16 }]}>
          비밀번호
        </Text>
        <View style={localStyles.inputField}>
          <MaterialIcons
            name="lock"
            size={20}
            color={StyleGuide.colors.gray4}
          />
          <TextInput
            style={localStyles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor={StyleGuide.colors.gray5}
            secureTextEntry
          />
        </View>
      </View>

      {/* 로그인 버튼 */}
      <TouchableOpacity style={localStyles.loginButton} onPress={handleLogin}>
        <Text
          style={[
            StyleGuide.fontStyles.text,
            { fontSize: 16, color: StyleGuide.colors.white },
          ]}
        >
          로그인
        </Text>
      </TouchableOpacity>
      {/* 회원가입 텍스트 */}
      <View style={localStyles.registerContainer}>
        <Text style={[StyleGuide.fontStyles.text, { fontSize: 12 }]}>
          Walk-ALL이 처음이신가요?
        </Text>
        <TouchableOpacity onPress={handleSignupNavigation}>
          <Text style={[StyleGuide.fontStyles.text, localStyles.registerText]}>
            회원가입하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LoginScreen;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: StyleGuide.colors.white,
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: StyleGuide.colors.gray3,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: StyleGuide.colors.white,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: StyleGuide.colors.black,
    fontFamily: StyleGuide.fontStyles.text.fontFamily,
  },
  loginButton: {
    backgroundColor: StyleGuide.colors.green5,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  registerText: {
    color: StyleGuide.colors.green5,
    textDecorationLine: "underline",
    marginLeft: 5,
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
});
