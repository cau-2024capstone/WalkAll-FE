import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from "../styles/StyleGuide";
import HistoryCard from '../components/HistoryCard';

function HistoryScreen() {
    return (
        <View style={localStyles.container}>
            <Text style={styles.fontStyles.text}>This is the History Page</Text>
        </View>
    );
}

export default HistoryScreen;

const localStyles = StyleSheet.create({
    container: {
        position: "relative",
        flexShrink: 0,
        height: 731,
        width: 360,
        backgroundColor: styles.colors.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        rowGap: 0
    },
});

