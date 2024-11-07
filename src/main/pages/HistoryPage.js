import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HistoryCard from './src/main/assets/components/HistoryCard';

function HistoryPage() {
    console.log("history");
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.text}>This is the History Page</Text>
            <HistoryCard title="Route 1" date="2023-01-01" distance="5.2" />
            { }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    text: {
        fontSize: 20,
        marginBottom: 20,
    },
});

export default HistoryPage;
