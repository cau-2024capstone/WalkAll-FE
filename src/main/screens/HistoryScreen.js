import { React, useState, useFetchSearch } from 'react';
import { View, Text, StyleSheet, Image, TextInput } from 'react-native';
import rootStyles from "../styles/StyleGuide";
import HistorySearch from '../components/historyScreen/HistorySearch';
import HistoryCardArea from '../components/historyScreen/HistoryCardArea';


function HistoryScreen() {

    return (
        <View style={localStyles.container}>
            <HistorySearch />
            <HistoryCardArea />
        </View >
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
        backgroundColor: rootStyles.colors.white,
        flexDirection: "column",
        alignItems: "flex-start",
    },

});

