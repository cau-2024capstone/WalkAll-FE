import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    Text,
    Modal,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import rootStyles from "../styles/StyleGuide";
import UserInfo from "../components/myPageScreen/UserInfo";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 임포트

function MyPageScreen({ navigation }) {
    const [loading, setLoading] = useState(false); // 로딩 상태 추가

    useEffect(() => {
        // 예시: UserInfo 데이터를 로딩하는 동안 로딩 상태를 설정
        setLoading(true);
        const fetchData = async () => {
            try {
                // 데이터 로딩 로직 (예: API 호출)
                await new Promise((resolve) => setTimeout(resolve, 2000)); // 임시 딜레이
            } finally {
                setLoading(false); // 로딩 종료
            }
        };
        fetchData();
    }, []);

    // 로그아웃 버튼 핸들러
    const handleLogout = () => {
        navigation.replace("LoginScreen"); // LoginPage로 이동
    };

    return (
        <View style={localStyles.container}>
            {/* 로딩 모달 */}
            <Modal transparent={true} visible={loading}>
                <View style={localStyles.modalBackground}>
                    <View style={localStyles.modalContainer}>
                        <ActivityIndicator size="large" color="green" />
                        <Text style={localStyles.modalText}>
                            정보를 불러오는 중입니다...
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
            <UserInfo />
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
        flexDirection: "column",
        alignItems: "center",
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
