import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import axios from "axios";
import rootStyles from "../../styles/StyleGuide";

function UserInfo({ route, navigation }) {
    const [userData, setUserData] = useState({
        email: "",
        password: "",
        name: "",
        phoneNumber: "",
    });
    const [isLoading, setIsLoading] = useState(true);

    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get("http://10.210.132.89:8082/api/users/email/test@gmail.com");
            if (response.status === 200) {
                const { userEmail, userPassword, userName, userPhoneNumber } = response.data;
                setUserData({
                    email: userEmail,
                    password: userPassword || "", // 비밀번호 기본값 설정
                    name: userName,
                    phoneNumber: userPhoneNumber,
                });
                setIsLoading(false); // 로딩 완료
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            Alert.alert("오류", "사용자 정보를 불러오지 못했습니다.");
        }
    };

    // 처음 로드 시 사용자 정보 가져오기
    useEffect(() => {
        fetchUserInfo();
    }, []);

    // 수정사항 저장
    const handleSave = async () => {
        try {
            const response = await axios.put("http://10.210.132.89:8082/api/users/email/mj10050203@gmail.com", {
                userName: userData.name,
                userPhoneNumber: userData.phoneNumber,
                userPassword: userData.password,
            });
            if (response.status === 200) {
                Alert.alert("저장 완료", "사용자 정보가 성공적으로 저장되었습니다.");
            }
        } catch (error) {
            console.error("Error saving user info:", error);
            Alert.alert("오류", "정보를 저장하지 못했습니다.");
        }
    };

    // 비밀번호 암호화 문자열 생성
    const maskedPassword = "********"

    if (isLoading) {
        return (
            <View style={localStyles.loadingContainer}>
                <Text>사용자 정보를 불러오는 중...</Text>
            </View>
        );
    }

    return (
        <View style={localStyles.container}>
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
                    value={maskedPassword} // 암호화된 비밀번호 표시
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
                    onChangeText={(text) => setUserData({ ...userData, phoneNumber: text })}
                />
            </View>

            {/* 변경사항 저장 버튼 */}
            <TouchableOpacity style={localStyles.saveButton} onPress={handleSave}>
                <Text style={localStyles.saveButtonText}>수정사항 저장</Text>
            </TouchableOpacity>
        </View>
    );
}

export default UserInfo;

const localStyles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: "5%",
        backgroundColor: rootStyles.colors.white,
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: rootStyles.colors.white,
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
