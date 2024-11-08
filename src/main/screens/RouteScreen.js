import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import rootStyles from "../styles/StyleGuide";

function RouteScreen() {
    return (
        <View style={localStyles.container}>

            <Text style={rootStyles.fontStyles.text}>This is the Route Page</Text>
        </View>
    );
}

export default RouteScreen;

const localStyles = StyleSheet.create({
    ccontainer: {
        height: 730,
        top: 36,
        width: 382,
        position: "relative",
        flexShrink: 0,
        backgroundColor: rootStyles.colors?.white || "#ffffff",
        flexDirection: "column",
        alignItems: "flex-start",
    },
});
