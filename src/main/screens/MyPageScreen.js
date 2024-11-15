import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import rootStyles from "../styles/StyleGuide";
import UserInfo from '../components/myPageScreen/UserInfo';

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
        marginTop: -30,
        paddingTop: 20,
        height: 90,
        width: 382,
        paddingHorizontal: 25,
        backgroundColor: rootStyles.colors.white,
        flexDirection: "row",
        alignItems: "center",
    },
    titleText: {
        ...rootStyles.fontStyles.mainTitle,
        color: '#000',
        marginTop: 10,
    },
    container: {
        height: 760,
        paddingTop: 30,
        width: 382,
        position: "relative",
        flexShrink: 0,
        backgroundColor: rootStyles.colors.white,
        flexDirection: "column",
        alignItems: 'center',

    },
});
