import React, { useState, forwardRef, useImperativeHandle } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import rootStyles from "../../styles/StyleGuide";
import { Svg, Path } from "react-native-svg";

const HistorySearch = forwardRef(({ onSearch, onRefresh, onFilter }, ref) => {
    const [searchWord, setSearchWord] = useState("");

    const handleSearch = () => {
        onSearch(searchWord.trim());
    };

    useImperativeHandle(ref, () => ({
        clearSearch: () => setSearchWord(""),
    }));

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
                <TouchableOpacity
                    onPress={handleSearch}
                    style={localStyles.iconContainer}
                >
                    {/* 검색 아이콘 */}
                    <Svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <Path
                            d="M13.75 14.9167L9.08333 10.25C8.66667 10.5833 8.1875 10.8472 7.64583 11.0417C7.10417 11.2361 6.52778 11.3333 5.91667 11.3333C4.40278 11.3333 3.12167 10.8089 2.07333 9.76C1.025 8.71111 0.500556 7.43 0.5 5.91667C0.5 4.40278 1.02444 3.12167 2.07333 2.07333C3.12222 1.025 4.40333 0.500556 5.91667 0.5C7.43056 0.5 8.71167 1.02444 9.76 2.07333C10.8083 3.12222 11.3328 4.40333 11.3333 5.91667C11.3333 6.52778 11.2361 7.10417 11.0417 7.64583C10.8472 8.1875 10.5833 8.66667 10.25 9.08333L14.9375 13.7708C15.0903 13.9236 15.1667 14.1111 15.1667 14.3333C15.1667 14.5556 15.0833 14.75 14.9167 14.9167C14.7639 15.0694 14.5694 15.1458 14.3333 15.1458C14.0972 15.1458 13.9028 15.0694 13.75 14.9167ZM5.91667 9.66667C6.95833 9.66667 7.84389 9.30194 8.57333 8.5725C9.30278 7.84306 9.66722 6.95778 9.66667 5.91667C9.66667 4.875 9.30194 3.98944 8.5725 3.26C7.84306 2.53056 6.95778 2.16611 5.91667 2.16667C4.875 2.16667 3.98944 2.53139 3.26 3.26083C2.53056 3.99028 2.16611 4.87556 2.16667 5.91667C2.16667 6.95833 2.53139 7.84389 3.26083 8.57333C3.99028 9.30278 4.87556 9.66722 5.91667 9.66667Z"
                            fill="#707070"
                        />
                    </Svg>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                onPress={onRefresh}
                style={localStyles.iconContainer}
            >
                <Svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <Path
                        d="M16.9331 10.041C16.7442 11.481 16.167 12.8424 15.2632 13.9792C14.3595 15.116 13.1633 15.9854 11.803 16.4941C10.4427 17.0027 8.96964 17.1315 7.54172 16.8666C6.1138 16.6017 4.78492 15.9531 3.69761 14.9904C2.6103 14.0276 1.80557 12.787 1.36973 11.4017C0.933892 10.0164 0.88338 8.5385 1.22362 7.12663C1.56385 5.71476 2.282 4.42214 3.30104 3.3874C4.32007 2.35266 5.60156 1.61483 7.00806 1.25304C10.9071 0.253045 14.9431 2.26004 16.4331 6.00004"
                        stroke="#707070"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <Path
                        d="M17 1V6H12"
                        stroke="#707070"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onFilter}
                style={localStyles.iconContainer}
            >
                <Svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                    <Path
                        d="M0.75 1C0.75 0.801088 0.829018 0.610322 0.96967 0.46967C1.11032 0.329018 1.30109 0.25 1.5 0.25H16.5C16.6989 0.25 16.8897 0.329018 17.0303 0.46967C17.171 0.610322 17.25 0.801088 17.25 1C17.25 1.19891 17.171 1.38968 17.0303 1.53033C16.8897 1.67098 16.6989 1.75 16.5 1.75H1.5C1.30109 1.75 1.11032 1.67098 0.96967 1.53033C0.829018 1.38968 0.75 1.19891 0.75 1ZM3.25 6C3.25 5.80109 3.32902 5.61032 3.46967 5.46967C3.61032 5.32902 3.80109 5.25 4 5.25H14C14.1989 5.25 14.3897 5.32902 14.5303 5.46967C14.671 5.61032 14.75 5.80109 14.75 6C14.75 6.19891 14.671 6.38968 14.5303 6.53033C14.3897 6.67098 14.1989 6.75 14 6.75H4C3.80109 6.75 3.61032 6.67098 3.46967 6.53033C3.32902 6.38968 3.25 6.19891 3.25 6ZM6.25 11C6.25 10.8011 6.32902 10.6103 6.46967 10.4697C6.61032 10.329 6.80109 10.25 7 10.25H11C11.1989 10.25 11.3897 10.329 11.5303 10.4697C11.671 10.6103 11.75 10.8011 11.75 11C11.75 11.1989 11.671 11.3897 11.5303 11.5303C11.3897 11.671 11.1989 11.75 11 11.75H7C6.80109 11.75 6.61032 11.671 6.46967 11.5303C6.32902 11.3897 6.25 11.1989 6.25 11Z"
                        fill="#707070"
                        stroke="#707070"
                        strokeWidth="1"
                    />
                </Svg>
            </TouchableOpacity>
        </View>
    );
});

export default HistorySearch;

const localStyles = StyleSheet.create({
    container: {
        marginTop: -30,
        paddingTop: 20,
        height: 90,
        width: 382,
        paddingHorizontal: 25,
        backgroundColor: rootStyles.colors.white,
        flexDirection: "row",
        alignItems: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F2",
        borderRadius: 20,
        paddingHorizontal: 10,
        width: "85%",
        height: 40,
    },
    input: {
        flex: 1,
        height: "100%",
        color: rootStyles.colors.black,
    },
    iconContainer: {
        paddingLeft: 10,
    },
    refreshIcon: {
        marginLeft: 10,
    },
    filterIcon: {
        marginLeft: 10,
    },
});
