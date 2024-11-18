//capstone-FE/src/main/screens/MyPageScreen.js

import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import rootStyles from "../styles/StyleGuide";
import UserInfo from "../components/myPageScreen/UserInfo";

function MyPageScreen() {
    return (
        <View style={localStyles.container}>
            <View style={localStyles.titleContainer}>
                <Text style={localStyles.titleText}>내 정보 변경하기</Text>
            </View>
            <UserInfo />
        </View>
    );
}

export default MyPageScreen;

const localStyles = StyleSheet.create({
    titleContainer: {
        marginTop: 0, // 여백 제거
        paddingTop: "5%", // 상대적인 패딩 적용
        height: "12%", // 고정 높이 대신 화면 비율 기반
        width: "100%", // 전체 화면 너비 사용
        paddingHorizontal: "5%", // 내부 패딩 비율 적용
        backgroundColor: rootStyles.colors.white,
        flexDirection: "row",
        alignItems: "center",
    },
    titleText: {
        ...rootStyles.fontStyles.mainTitle,
        color: "#000",
        marginTop: 0, // 추가 여백 제거
    },
    container: {
        flex: 1, // 전체 화면 사용
        paddingTop: 0, // 불필요한 상단 여백 제거
        width: "100%",
        backgroundColor: rootStyles.colors.white,
        flexDirection: "column",
        alignItems: "center",
    },
});
