import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import rootStyles from '../../styles/StyleGuide';

function HistoryCard({ date, start, end, duration, distance, totalDistance }) {
    return (
        <View style={localStyles.frame39Container}>
            <Text style={localStyles.date}>{date}</Text>
            <View style={localStyles.frame49}>
                <Text style={localStyles.출발지}>{start}</Text>
                <Text style={localStyles.도착지}>{end}</Text>
                <Text style={localStyles.실소요시간}>{duration}</Text>
                <Text style={localStyles.현위치로부터거리}>{`${distance} km`}</Text>
                <Text style={localStyles.총거리}>{totalDistance}</Text>
            </View>
        </View>
    );
}

export default HistoryCard;

const localStyles = StyleSheet.create({
    frame39Container: {
        position: "relative",
        flexShrink: 0,
        height: 266,
        width: 382,
        backgroundColor: "rgba(254, 254, 254, 1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        rowGap: 0
    },
    date: {
        ...rootStyles.fontStyles.text,
        position: "absolute",
        flexShrink: 0,
        top: 13,
        left: 13,
        textAlign: "left",
        color: "rgba(112, 112, 112, 1)",
    },
    frame49: {
        marginTop: 36,
        display: "flex",
        alignItems: "center",
        rowGap: 5
    },
    출발지: {
        ...rootStyles.fontStyles.instruction,
        backgroundColor: "rgba(223, 247, 202, 1)",
        textAlign: "center",
        color: "rgba(74, 143, 62, 1)",
        padding: 5,
        borderRadius: 15
    },
    도착지: {
        ...rootStyles.fontStyles.instruction,
        backgroundColor: "rgba(223, 247, 202, 1)",
        textAlign: "center",
        color: "rgba(74, 143, 62, 1)",
        padding: 5,
        borderRadius: 15
    },
    실소요시간: {
        ...rootStyles.fontStyles.instruction,
        backgroundColor: "rgba(223, 247, 202, 1)",
        textAlign: "center",
        color: "rgba(74, 143, 62, 1)",
        padding: 5,
        borderRadius: 15
    },
    현위치로부터거리: {
        ...rootStyles.fontStyles.instruction,
        backgroundColor: "rgba(223, 247, 202, 1)",
        textAlign: "center",
        color: "rgba(74, 143, 62, 1)",
        padding: 5,
        borderRadius: 15
    },
    총거리: {
        ...rootStyles.fontStyles.instruction,
        backgroundColor: "rgba(223, 247, 202, 1)",
        textAlign: "center",
        color: "rgba(74, 143, 62, 1)",
        padding: 5,
        borderRadius: 15
    }
});
