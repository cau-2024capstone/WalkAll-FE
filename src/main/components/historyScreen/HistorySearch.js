import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import rootStyles from "../../styles/StyleGuide";
import { Svg, Path } from 'react-native-svg';

function HistorySearch({ onSearch }) {
    const [searchWord, setSearchWord] = useState('');

    const handleSearch = () => {
        onSearch(searchWord.trim());
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.searchContainer}>
                <TextInput
                    style={localStyles.input}
                    value={searchWord}
                    onChangeText={setSearchWord}
                    onSubmitEditing={handleSearch}
                    placeholder="지역이나 소요시간을 검색해보세요"
                    returnKeyType="search"
                />
                <TouchableOpacity onPress={handleSearch} style={localStyles.iconContainer}>
                    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <Path d="M13.75 14.9167L9.08333 10.25C8.66667 10.5833 8.1875 10.8472 7.64583 11.0417C7.10417 11.2361 6.52778 11.3333 5.91667 11.3333C4.40278 11.3333 3.12167 10.8089 2.07333 9.76C1.025 8.71111 0.500556 7.43 0.5 5.91667C0.5 4.40278 1.02444 3.12167 2.07333 2.07333C3.12222 1.025 4.40333 0.500556 5.91667 0.5C7.43056 0.5 8.71167 1.02444 9.76 2.07333C10.8083 3.12222 11.3328 4.40333 11.3333 5.91667C11.3333 6.52778 11.2361 7.10417 11.0417 7.64583C10.8472 8.1875 10.5833 8.66667 10.25 9.08333L14.9375 13.7708C15.0903 13.9236 15.1667 14.1111 15.1667 14.3333C15.1667 14.5556 15.0833 14.75 14.9167 14.9167C14.7639 15.0694 14.5694 15.1458 14.3333 15.1458C14.0972 15.1458 13.9028 15.0694 13.75 14.9167ZM5.91667 9.66667C6.95833 9.66667 7.84389 9.30194 8.57333 8.5725C9.30278 7.84306 9.66722 6.95778 9.66667 5.91667C9.66667 4.875 9.30194 3.98944 8.5725 3.26C7.84306 2.53056 6.95778 2.16611 5.91667 2.16667C4.875 2.16667 3.98944 2.53139 3.26 3.26083C2.53056 3.99028 2.16611 4.87556 2.16667 5.91667C2.16667 6.95833 2.53139 7.84389 3.26083 8.57333C3.99028 9.30278 4.87556 9.66722 5.91667 9.66667Z" fill="#707070" />
                    </Svg>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default HistorySearch;

const localStyles = StyleSheet.create({
    container: {
        marginTop: -30,
        paddingTop: 20,
        height: 90,
        width: 382,
        paddingHorizontal: 25,
        backgroundColor: rootStyles.colors.white,
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 20,
        paddingHorizontal: 10,
        width: '100%',
        height: 40,
    },
    input: {
        flex: 1,
        height: '100%',
        color: rootStyles.colors.black,
    },
    iconContainer: {
        paddingLeft: 10,
    },
});
