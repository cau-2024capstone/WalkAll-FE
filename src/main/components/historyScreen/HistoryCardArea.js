import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import HistoryCard from './HistoryCard';
import dummyData from './dummyData'; // 더미 데이터 가져오기

function HistoryCardArea() {
    // 가까운 거리순으로 카드 데이터를 정렬
    const sortedCards = [...dummyData].sort((a, b) => a.distance - b.distance);

    return (
        <View style={localStyles.cardAreaContainer}>
            <ScrollView
                contentContainerStyle={localStyles.scrollViewContainer}
                showsVerticalScrollIndicator={false}
            >
                {sortedCards.map((card) => (
                    <HistoryCard key={card.id} {...card} />
                ))}
            </ScrollView>
        </View>
    );
}

export default HistoryCardArea;

const localStyles = StyleSheet.create({
    cardAreaContainer: {
        position: "relative",
        flexShrink: 0,
        height: 596,
        width: 382,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    scrollViewContainer: {
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 20,
    },
});
