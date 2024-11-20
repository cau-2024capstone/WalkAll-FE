import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import rootStyles from "../../styles/StyleGuide";
import { Image } from "expo-image";

function HistoryCard({ date, start, end, duration, distance, totalDistance }) {
    const infoItems = [start, end, duration, `${distance} km`, totalDistance];

    return (
        <View style={localStyles.cardContainer}>
            <Text style={[rootStyles.fontStyles.subTitle, localStyles.date]}>{date}</Text>

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
                {infoItems.map((item, index) => (
                    <Text
                        key={index}
                        style={[
                            localStyles.infoButton,
                            index === infoItems.length - 1 && { marginRight: 0 },
                        ]}
                    >
                        {item}
                    </Text>
                ))}
            </View>

            {/* 다시 걷기 버튼 */}
            <TouchableOpacity style={localStyles.walkButton}>
                <Text style={[rootStyles.fontStyles.text, localStyles.walkButtonText]}>
                    이 루트로 다시 걷기
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export default HistoryCard;

const localStyles = StyleSheet.create({
    cardContainer: {
        width: "100%",
        paddingVertical: "4%",
        paddingHorizontal: "5%",
        marginBottom: "5%",
        backgroundColor: rootStyles.colors.white,
        borderRadius: 15,
        shadowColor: rootStyles.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    date: {
        marginBottom: "4%",
    },
    mapContainer: {
        width: "100%",
        aspectRatio: 2.5,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: "5%",
        backgroundColor: rootStyles.colors.gray2,
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: "1%",
        flexWrap: "wrap",
    },
    infoButton: {
        backgroundColor: rootStyles.colors.green1,
        color: rootStyles.colors.green5,
        textAlign: "center",
        paddingVertical: "2%",
        paddingHorizontal: "4%",
        borderRadius: 15,
        fontSize: rootStyles.fontStyles.text.fontSize,
        marginRight: "2%",
        marginBottom: "2%",
    },
    walkButton: {
        width: "90%",
        paddingVertical: "3%",
        marginHorizontal: "5%",
        borderWidth: 1,
        borderColor: rootStyles.colors.green5,
        borderRadius: 10,
        alignItems: "center",
        marginTop: "2%",
    },
    walkButtonText: {
        color: rootStyles.colors.green5,
        fontSize: rootStyles.fontStyles.subTitle.fontSize,
        fontFamily: 'NotoSansKR-Bold',
        lineHeight: 20,
    },

});
