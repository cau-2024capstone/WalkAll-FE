import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import HistoryCard from './HistoryCard';
import rootStyles from '../../styles/StyleGuide';

function HistoryCardArea({ data }) {
    return (
        <View style={localStyles.cardAreaContainer}>
            <ScrollView
                contentContainerStyle={localStyles.scrollViewContainer}
                showsVerticalScrollIndicator={false}
            >
                {data.map(card => (
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
        height: 700,
        width: 382,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: rootStyles.colors.grey1,
    },
    scrollViewContainer: {
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 20,
    },
});
