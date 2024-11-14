import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import rootStyles from '../../styles/StyleGuide';

function UserInfo() {
    return (
        <View style={localStyles.container}>

            {/* 이름 */}
            <Text style={localStyles.label}>이름</Text>
            <View style={localStyles.inputContainer}>
                <TextInput style={localStyles.inputText} defaultValue="김워커" />
            </View>

            {/* 아이디 (읽기 전용) */}
            <Text style={localStyles.label}>아이디</Text>
            <View style={localStyles.inputContainer}>
                <Text style={localStyles.inputText}>WalkAll001</Text>
            </View>

            {/* 비밀번호 */}
            <Text style={localStyles.label}>비밀번호</Text>
            <View style={localStyles.inputContainer}>
                <TextInput style={localStyles.inputText} defaultValue="************" secureTextEntry />
            </View>

            {/* 이메일 */}
            <Text style={localStyles.label}>이메일</Text>
            <View style={localStyles.inputContainer}>
                <TextInput style={localStyles.inputText} defaultValue="WalkAll001@gmail.com" keyboardType="email-address" />
            </View>

            {/* 생일 */}
            <Text style={localStyles.label}>생일</Text>
            <View style={localStyles.inputContainer}>
                <TextInput style={localStyles.inputText} defaultValue="2024/11/14" />
                <Svg style={localStyles.icon} width="18" height="10" viewBox="0 0 18 10" fill="none">
                    <Path d="M17.3334 1.66667L9.00002 10L0.666687 1.66667L2.14585 0.1875L9.00002 7.04167L15.8542 0.1875L17.3334 1.66667Z" fill="black" />
                </Svg>
            </View>

            {/* 변경내용 저장 */}
            <TouchableOpacity style={localStyles.saveButton}>
                <Text style={localStyles.saveButtonText}>변경내용 저장</Text>
            </TouchableOpacity>
        </View>
    );
}

export default UserInfo;

const localStyles = StyleSheet.create({
    container: {
        width: 360,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        flex: 1,

    },
    label: {
        ...rootStyles.fontStyles.subTitle,
        color: '#000',
        marginTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderWidth: 1,
        borderColor: "rgba(84, 76, 76, 0.14)",
        borderRadius: 6,
        paddingHorizontal: 15,
        marginTop: 5,
    },
    inputText: {
        ...rootStyles.fontStyles.text,
        flex: 1,
        color: "rgba(84, 76, 76, 1)",
    },
    icon: {
        marginLeft: 10,
    },
    saveButton: {
        marginTop: 30,
        height: 45,
        backgroundColor: rootStyles.colors.green5,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        ...rootStyles.fontStyles.subTitle,
        color: "rgba(255, 255, 255, 1)",
    },
});
