import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import rootStyles from '../styles/StyleGuide';

function LoginScreen() {
    const navigation = useNavigation();

    const handleLogin = () => {
        navigation.replace('MainApp');
    };

    return (
        <View style={localStyles.container}>
            {/* 상단 텍스트 */}
            <View style={localStyles.header}>
                <Text style={[rootStyles.fontStyles.mainTitle, { fontSize: 30 }]}>
                    Login
                </Text>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 14 }]}>
                    돌아오신 걸 환영해요, Walk-ER 님!
                </Text>
            </View>

            {/* 아이디 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>아이디</Text>
                <View style={localStyles.inputField}>
                    <Icon name="person" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        placeholder="아이디를 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                    />
                </View>
            </View>

            {/* 비밀번호 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>비밀번호</Text>
                <View style={localStyles.inputField}>
                    <Icon name="lock" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        placeholder="비밀번호를 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                        secureTextEntry
                    />
                </View>
            </View>

            {/* 비밀번호 찾기 텍스트 */}
            <Text style={[rootStyles.fontStyles.text, localStyles.forgotPassword]}>
                비밀번호 찾기
            </Text>

            {/* 로그인 버튼 */}
            <TouchableOpacity style={localStyles.loginButton} onPress={handleLogin}>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 16, color: rootStyles.colors.white }]}>
                    로그인
                </Text>
            </TouchableOpacity>

            {/* 하단 회원가입 텍스트 */}
            <View style={localStyles.registerContainer}>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 12 }]}>
                    Walk-ALL이 처음이신가요?
                </Text>
                <Text style={[rootStyles.fontStyles.text, localStyles.registerText]}>
                    회원가입하기
                </Text>
            </View>
        </View>
    );
}

export default LoginScreen;

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: rootStyles.colors.white,
        padding: 20,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    inputContainer: {
        marginBottom: 20,
        width: '100%',
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: rootStyles.colors.gray3,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        backgroundColor: rootStyles.colors.white,
    },
    textInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: rootStyles.colors.black,
        fontFamily: rootStyles.fontStyles.text.fontFamily,
    },
    forgotPassword: {
        textAlign: 'center',
        color: rootStyles.colors.green5,
        textDecorationLine: 'underline',
        marginVertical: 10,
    },
    loginButton: {
        backgroundColor: rootStyles.colors.green5,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: rootStyles.colors.green5,
        textDecorationLine: 'underline',
        marginLeft: 5,
    },
});
