import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import rootStyles from "../styles/StyleGuide";
import HistorySearch from '../components/historyScreen/HistorySearch';
import HistoryCardArea from '../components/historyScreen/HistoryCardArea';
import dummyData from '../components/historyScreen/dummyData';

function HistoryScreen() {
    const [searchResults, setSearchResults] = useState(
        [...dummyData].sort((a, b) => new Date(b.date) - new Date(a.date))
    );

    const handleSearch = (query) => {
        const filteredData = dummyData
            .filter(item =>
                item.start.includes(query) || item.end.includes(query) || item.date.includes(query)
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setSearchResults(filteredData);
    };

    return (
        <View style={localStyles.container}>
            <HistorySearch onSearch={handleSearch} />
            <HistoryCardArea data={searchResults} />
        </View>
    );
}

export default HistoryScreen;

const localStyles = StyleSheet.create({
    container: {
        height: 760,
        paddingTop: 30,
        width: 382,
        position: "relative",
        flexShrink: 0,
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: rootStyles.colors.grey1,
    },
});
