import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import useFetchSearch from './UseFetchSearchHook'; // 모의 데이터를 반환하는 커스텀 훅
import rootStyles from "../../styles/StyleGuide";
import { Svg, Path } from 'react-native-svg';

function HistorySearch() {
    const [searchWord, setSearchWord] = useState({ keyword: '' });
    const { data, isLoading, isError } = useFetchSearch(searchWord.keyword);

    const onChangeSearch = (keyvalue, e) => {
        setSearchWord({
            ...searchWord,
            [keyvalue]: e,
        });
    };

    const onPressSearch = () => {
        if (searchWord.keyword.trim().length > 0) {
            // 모의 데이터가 포함된 useFetchSearch 훅을 통해 데이터를 가져옴
        }
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.frame30Container}>
                <View style={localStyles.group6}>
                    <Svg style={localStyles.rectangle62} width="327" height="40" viewBox="0 0 327 40" fill="none" >
                        <Path d="M0 21C0 9.95431 11.1634 0 20 0H308C316.837 0 327 8.95431 327 20C327 31.0457 316.837 40 308 40H20C11.1634 40 0 32.0457 0 21Z" fill="#F2F2F2" />
                    </Svg>
                    <TouchableOpacity onPress={onPressSearch}>
                        <View style={localStyles.materialsymbolssearchrounded}>
                            <Svg style={localStyles.vector} width="16" height="16" viewBox="0 0 16 16" fill="none" >
                                <Path d="M13.75 14.9167L9.08333 10.25C8.66667 10.5833 8.1875 10.8472 7.64583 11.0417C7.10417 11.2361 6.52778 11.3333 5.91667 11.3333C4.40278 11.3333 3.12167 10.8089 2.07333 9.76C1.025 8.71111 0.500556 7.43 0.5 5.91667C0.5 4.40278 1.02444 3.12167 2.07333 2.07333C3.12222 1.025 4.40333 0.500556 5.91667 0.5C7.43056 0.5 8.71167 1.02444 9.76 2.07333C10.8083 3.12222 11.3328 4.40333 11.3333 5.91667C11.3333 6.52778 11.2361 7.10417 11.0417 7.64583C10.8472 8.1875 10.5833 8.66667 10.25 9.08333L14.9375 13.7708C15.0903 13.9236 15.1667 14.1111 15.1667 14.3333C15.1667 14.5556 15.0833 14.75 14.9167 14.9167C14.7639 15.0694 14.5694 15.1458 14.3333 15.1458C14.0972 15.1458 13.9028 15.0694 13.75 14.9167ZM5.91667 9.66667C6.95833 9.66667 7.84389 9.30194 8.57333 8.5725C9.30278 7.84306 9.66722 6.95778 9.66667 5.91667C9.66667 4.875 9.30194 3.98944 8.5725 3.26C7.84306 2.53056 6.95778 2.16611 5.91667 2.16667C4.875 2.16667 3.98944 2.53139 3.26 3.26083C2.53056 3.99028 2.16611 4.87556 2.16667 5.91667C2.16667 6.95833 2.53139 7.84389 3.26083 8.57333C3.99028 9.30278 4.87556 9.66722 5.91667 9.66667Z" fill="#707070" />
                            </Svg>
                        </View>
                    </TouchableOpacity>

                    <TextInput
                        style={localStyles.입력창}
                        value={searchWord.keyword}
                        onChangeText={(e) => onChangeSearch("keyword", e)}
                        onSubmitEditing={onPressSearch}
                        placeholder="지역이나 소요시간을 검색해보세요"
                        returnKeyType="search"
                    />
                </View>
            </View>
            {isLoading ? <Text>Loading...</Text> : isError ? <Text>Error loading data</Text> :
                data && data.results.map((item) => (
                    <View key={item.id}>
                        <Text>{item.name}</Text>
                        <Text>{item.description}</Text>
                    </View>
                ))}
        </View>
    );
}

export default HistorySearch;


const localStyles = StyleSheet.create({
    container: {
        height: 760,
        width: 382,
        position: "relative",
        flexShrink: 0,
        backgroundColor: rootStyles.colors.white,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    frame30Container: {
        position: "relative",
        flexShrink: 0,
        height: 59,
        width: 382,
        backgroundColor: rootStyles.colors.white,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        rowGap: 0
    },
    group6: {
        position: "absolute",
        flexShrink: 0,
        top: 9,
        height: 40,
        left: 25,
        width: 327
    },
    search_Bar: {
        position: "absolute",
        flexShrink: 0,
        height: 40,
        width: 327
    },
    rectangle62: {
        position: "absolute",
        flexShrink: 0,
        width: 327,
        height: 40,
        overflow: "visible"
    },
    materialsymbolssearchrounded: {
        position: "absolute",
        flexShrink: 0,
        top: 9,
        height: 20,
        left: 293,
        width: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        rowGap: 0,
        borderRadius: 25
    },
    vector: {
        position: "absolute",
        flexShrink: 0,
        top: 2,
        right: 3,
        bottom: 3,
        left: 3,
        overflow: "visible"
    },
    입력창: {
        position: "absolute",
        flexShrink: 0,
        top: 4,
        height: 32,
        left: 30,
        width: 268,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    지역이나소요시간을검색해보세요: {
        ...rootStyles.fontStyles.text,
        position: "absolute",
        flexShrink: 0,
        top: -1.5,
        width: 277,
        height: 25,
        textAlign: "left",
        color: rootStyles.colors.grey5,
    }
});

