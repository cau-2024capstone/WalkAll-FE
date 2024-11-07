import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from "./src/main/styles/StyleGuide"; // StyleGuide 임포트

function HistoryCard({ title, date, distance }) {
    return (
        <View style={localStyles.frame31Container}>
            <View style={localStyles.frame32}>
                <Text style={localStyles.routeText}>{title}</Text>
            </View>
            <View style={localStyles.routeImage} />
            <Text style={localStyles.date}>{date}</Text>
            <View style={localStyles.frame45}>
                {["출발지", "도착지", "총거리", `거리: ${distance} km`, "실소요시간"].map((label, index) => (
                    <View key={index} style={localStyles.labelContainer}>
                        <Text style={localStyles.labelText}>{label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const localStyles = StyleSheet.create({
    frame31Container: {
        position: "relative",
        flexShrink: 0,
        height: 251,
        width: 360,
        backgroundColor: styles.colors.white, // StyleGuide 색상 사용
        flexDirection: "column",
        alignItems: "flex-start",
    },
    frame32: {
        position: "absolute",
        flexShrink: 0,
        top: 185,
        height: 46,
        left: 19,
        width: 322,
        borderStyle: "solid",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: styles.colors.green5, // StyleGuide 색상 사용
        borderRadius: 4,
    },
    routeText: {
        ...styles.fontStyles.subTitle,
        color: styles.colors.green6,
        textAlign: "center",
    },
    routeImage: {
        position: "absolute",
        flexShrink: 0,
        top: 34,
        height: 114,
        left: 19,
        width: 320,
        backgroundColor: styles.colors.gray2, // StyleGuide 색상 사용
        flexDirection: "column",
        alignItems: "flex-start",
    },
    date: {
        ...styles.fontStyles.text,
        color: styles.colors.gray5,
    },
    frame45: {
        position: "absolute",
        flexShrink: 0,
        top: 155,
        left: 19,
        width: 243,
        alignItems: "center",
        flexDirection: "row",
    },
    labelContainer: {
        backgroundColor: styles.colors.green1,
    },
    labelText: {
        ...styles.fontStyles.instruction,
        color: styles.colors.green5,
    },
});

export default HistoryCard;
