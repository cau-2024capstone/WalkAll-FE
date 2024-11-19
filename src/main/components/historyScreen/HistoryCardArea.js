//capstone-FE/src/main/components/historyScreen/HistoryCardArea.js
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import HistoryCard from "./HistoryCard";
import rootStyles from "../../styles/StyleGuide";

function HistoryCardArea({ data }) {
    return (
        <View style={localStyles.cardAreaContainer}>
            <ScrollView
                contentContainerStyle={localStyles.scrollViewContainer}
                showsVerticalScrollIndicator={false}
            >
                {data.map((card) => (
                    <HistoryCard key={card.id} {...card} />
                ))}
            </ScrollView>
        </View>
    );
}

export default HistoryCardArea;

const localStyles = StyleSheet.create({
    cardAreaContainer: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
        backgroundColor: rootStyles.colors.grey1,
        alignItems: "center",
    },
    scrollViewContainer: {
        flexGrow: 1,
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "5%",
    },
});
