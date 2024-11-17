import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import rootStyles from "../../styles/StyleGuide";
import { Image } from "expo-image";

function HistoryCard({ date, start, end, duration, distance, totalDistance }) {
    return (
        <View style={localStyles.cardContainer}>
            <Text style={localStyles.date}>{date}</Text>

            {/* 지도 이미지 (임시 이미지 사용) */}
            <View style={localStyles.mapContainer}>
                <Image
                    source={{ uri: "https://via.placeholder.com/327x150" }} // 임시 지도 이미지 링크
                    style={localStyles.mapImage}
                    contentFit="cover" // 이미지의 콘텐츠 맞춤 방식 설정
                />
            </View>

            {/* 정보 버튼들 */}
            <View style={localStyles.infoContainer}>
                <Text style={localStyles.infoButton}>{start}</Text>
                <Text style={localStyles.infoButton}>{end}</Text>
                <Text style={localStyles.infoButton}>{duration}</Text>
                <Text style={localStyles.infoButton}>{`${distance} km`}</Text>
                <Text style={localStyles.infoButton}>{totalDistance}</Text>
            </View>

            {/* 다시 걷기 버튼 */}
            <TouchableOpacity style={localStyles.walkButton}>
                <Text style={localStyles.walkButtonText}>
                    이 루트로 다시 걷기
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export default HistoryCard;

const localStyles = StyleSheet.create({
    cardContainer: {
        width: 382,
        paddingTop: 6,
        paddingBottom: 12,
        paddingRight: 30,
        paddingLeft: 30,
        marginBottom: 10,
        backgroundColor: "#FEFEFE",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        alignItems: "center",
    },
    date: {
        ...rootStyles.fontStyles.text,
        color: "rgba(112, 112, 112, 1)",
        marginBottom: 10,
        alignSelf: "flex-start",
    },
    mapContainer: {
        width: "100%",
        height: 150,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 15,
    },
    mapImage: {
        width: "100%",
        height: "100%",
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 15,
    },
    infoButton: {
        backgroundColor: "rgba(223, 247, 202, 1)",
        color: "rgba(74, 143, 62, 1)",
        textAlign: "center",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        fontSize: 12,
    },
    walkButton: {
        width: "100%",
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "rgba(74, 143, 62, 1)",
        borderRadius: 10,
        alignItems: "center",
    },
    walkButtonText: {
        color: "rgba(74, 143, 62, 1)",
        fontSize: 16,
        fontWeight: "bold",
    },
});
