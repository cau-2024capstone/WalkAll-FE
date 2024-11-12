import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import rootStyles from "../styles/StyleGuide";
import HistoryCard from '../components/HistoryCard';

function HistoryScreen() {
    return (
        <View style={localStyles.container}>
            <View style={localStyles.frame30Container}>
                <Image
                    style={localStyles.rectangle62}
                    source={require("../assets/images/historySearchArea.svg")}
                />
                <View style={localStyles.materialsymbolssearchrounded}>
                    <Image
                        style={localStyles.vector}
                        source={require("../assets/images/searchIcon.svg")}
                    />
                </View>
                <View style={localStyles.inputContainer}>
                    <Text style={localStyles.placeholderText}>
                        {`지역이나 소요시간을 검색해보세요`}
                    </Text>
                </View>
            </View>
        </View>
    );

}

export default HistoryScreen;

const localStyles = StyleSheet.create({
    container: {
        height: 730,
        top: 36,
        width: 382,
        position: "relative",
        flexShrink: 0,
        backgroundColor: rootStyles.colors.white,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    frame30Container: {
        position: "relative",
        flexShrink: 0,
        height: 59,
        width: 382,
        backgroundColor: rootStyles.colors.ivory1,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    rectangle62: {
        position: "absolute",
        flexShrink: 0,
        top: 0,
        left: 0,
        width: 318,
        height: 32,
    },
    materialsymbolssearchrounded: {
        position: "absolute",
        flexShrink: 0,
        top: 8,
        height: 15,
        left: 287,
        width: 15,
        backgroundColor: rootStyles.colors.gray2,
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: 25,
    },
    vector: {
        position: "absolute",
        flexShrink: 0,
        top: 2,
        right: 2,
        bottom: 2,
        left: 2,
    },
    inputContainer: {
        position: "absolute",
        flexShrink: 0,
        top: 0,
        height: 32,
        left: 14,
        width: 268,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    placeholderText: {
        ...rootStyles.fontStyles.text,
        color: rootStyles.colors.gray5,
        position: "absolute",
        top: 3,
        left: 5,
    },
});

