import React, { useState, useEffect } from "react";
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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rootStyles from "../styles/StyleGuide";
import { MaterialIcons } from "@expo/vector-icons";
import AdminScreen from "./AdminScreen";

function LoginScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [isAdmin, setIsAdmin] = useState(false); // admin 상태 추가

    useEffect(() => {
        if (route.params?.email) setEmail(route.params.email);
        if (route.params?.password) setPassword(route.params.password);
    }, [route.params]);

    const handleLogin = async () => {
        setLoading(true); // 로딩 시작
        try {
            // 테스트 로그인 처리
            if (email === "a" && password === "a") {
                const jwt = "test_jwt_token"; // 임시 JWT 토큰
                await AsyncStorage.setItem("jwt", jwt);
                Alert.alert("로그인 성공", "테스트 로그인 성공");
                navigation.navigate("BottomTabApp");
            } else {
                const response = await axios.post(
                    "https://accurately-healthy-duckling.ngrok-free.app/auth/login",
                    {
                        userEmail: email,
                        userPassword: password,
                    }
                );

                if (response.status === 201) {
                    const { jwt, message, role } = response.data;

                    // JWT 토큰 저장
                    await AsyncStorage.setItem("jwt", jwt);

                    // 성공 메시지 표시 및 화면 이동
                    Alert.alert("로그인 성공", message);

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
                <Text
                    style={[rootStyles.fontStyles.mainTitle, { fontSize: 30 }]}
                >
                    Login
                </Text>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 14 }]}>
                    돌아오신 걸 환영해요, Walk-ER 님!
                </Text>
            </View>

            {/* 이메일 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text
                    style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}
                >
                    이메일
                </Text>
                <View style={localStyles.inputField}>
                    <MaterialIcons
                        name="email"
                        size={20}
                        color={rootStyles.colors.gray4}
                    />
                    <TextInput
                        style={localStyles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="이메일을 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {/* 비밀번호 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text
                    style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}
                >
                    비밀번호
                </Text>
                <View style={localStyles.inputField}>
                    <MaterialIcons
                        name="lock"
                        size={20}
                        color={rootStyles.colors.gray4}
                    />
                    <TextInput
                        style={localStyles.textInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="비밀번호를 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                        secureTextEntry
                    />
                </View>
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
                style={localStyles.loginButton}
                onPress={handleLogin}
            >
                <Text
                    style={[
                        rootStyles.fontStyles.text,
                        { fontSize: 16, color: rootStyles.colors.white },
                    ]}
                >
                    로그인
                </Text>
            </TouchableOpacity>
            {/* 회원가입 텍스트 */}
            <View style={localStyles.registerContainer}>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 12 }]}>
                    Walk-ALL이 처음이신가요?
                </Text>
                <TouchableOpacity onPress={handleSignupNavigation}>
                    <Text
                        style={[
                            rootStyles.fontStyles.text,
                            localStyles.registerText,
                        ]}
                    >
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
        backgroundColor: rootStyles.colors.white,
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
        borderColor: rootStyles.colors.gray3,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginTop: 6,
        backgroundColor: rootStyles.colors.white,
    },
    textInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: rootStyles.colors.black,
        fontFamily: rootStyles.fontStyles.text.fontFamily,
    },
    loginButton: {
        backgroundColor: rootStyles.colors.green5,
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
        color: rootStyles.colors.green5,
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
