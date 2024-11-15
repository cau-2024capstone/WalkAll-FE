import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import rootStyles from "../styles/StyleGuide";
import HistorySearch from '../components/historyScreen/HistorySearch';
import HistoryCardArea from '../components/historyScreen/HistoryCardArea';
import dummyData from '../components/historyScreen/dummyData';

function HistoryScreen() {
    const initialData = [...dummyData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const [searchResults, setSearchResults] = useState(initialData);

    // 검색어 상태를 초기화하기 위해 참조를 생성
    const searchInputRef = React.useRef();

    const handleSearch = (query) => {
        const filteredData = dummyData
            .filter(item =>
                item.start.includes(query) || item.end.includes(query) || item.date.includes(query)
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setSearchResults(filteredData);
    };

    const handleRefresh = () => {
        setSearchResults(initialData);
        // 검색어를 초기화하기 위해 HistorySearch 컴포넌트의 메서드 호출
        if (searchInputRef.current) {
            searchInputRef.current.clearSearch();
        }
    };

    return (
        <View style={localStyles.container}>
            <HistorySearch onSearch={handleSearch} onRefresh={handleRefresh} ref={searchInputRef} />
            <HistoryCardArea data={searchResults} />
        </View>
    );
}

export default HistoryScreen;

const localStyles = StyleSheet.create({
    container: {
        height: 760,
        paddingTop: 30,
        width: 383,
        position: "relative",
        flexShrink: 0,
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: rootStyles.colors.grey1,
    },
});
