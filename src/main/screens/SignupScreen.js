import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import rootStyles from '../styles/StyleGuide';

function SignupScreen() {
    const navigation = useNavigation();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleSignup = () => {
        // id와 password를 LoginScreen으로 전달
        navigation.navigate('LoginScreen', { id, password });
    };

    const handleLogin = () => {
        navigation.navigate('LoginScreen'); // 로그인 화면으로 이동
    };

    return (
        <View style={localStyles.container}>
            {/* 상단 텍스트 */}
            <View style={localStyles.header}>
                <Text style={[rootStyles.fontStyles.mainTitle, { fontSize: 30 }]}>
                    Register
                </Text>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 14 }]}>
                    Walk-ALL에 가입하고 함께 산책해요!
                </Text>
            </View>

            {/* 아이디 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>아이디</Text>
                <View style={localStyles.inputField}>
                    <Icon name="person" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        value={id}
                        onChangeText={setId}
                        placeholder="아이디를 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                    />
                </View>
                <Text style={[rootStyles.fontStyles.text, localStyles.helperText]}>
                    아이디는 중복이 불가능해요
                </Text>
            </View>

            {/* 이름 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>이름</Text>
                <View style={localStyles.inputField}>
                    <Icon name="badge" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="이름을 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                    />
                </View>
                <Text style={[rootStyles.fontStyles.text, localStyles.helperText]}>
                    사용자님의 이름을 알려주세요
                </Text>
            </View>

            {/* 비밀번호 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>비밀번호</Text>
                <View style={localStyles.inputField}>
                    <Icon name="lock" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="비밀번호를 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                        secureTextEntry
                    />
                </View>
                <Text style={[rootStyles.fontStyles.text, localStyles.helperText]}>
                    숫자, 문자를 포함해 8자리 이상 입력해주세요
                </Text>
            </View>

            {/* 이메일 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>이메일</Text>
                <View style={localStyles.inputField}>
                    <Icon name="email" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="이메일을 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                    />
                </View>
                <Text style={[rootStyles.fontStyles.text, localStyles.helperText]}>
                    비밀번호 찾기에 사용됩니다
                </Text>
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity style={localStyles.signupButton} onPress={handleSignup}>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 16, color: rootStyles.colors.white }]}>
                    회원가입
                </Text>
            </TouchableOpacity>

            {/* 하단 로그인 텍스트 */}
            <View style={localStyles.loginContainer}>
                <Text style={[rootStyles.fontStyles.text, { fontSize: 12 }]}>
                    이미 Walk-ER이신가요?
                </Text>
                <TouchableOpacity onPress={handleLogin}>
                    <Text style={[rootStyles.fontStyles.text, localStyles.loginText]}>
                        로그인하기
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default SignupScreen;

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
    helperText: {
        marginTop: 5,
        fontSize: 12,
        color: rootStyles.colors.gray5,
    },
    signupButton: {
        backgroundColor: rootStyles.colors.green5,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: rootStyles.colors.green5,
        textDecorationLine: 'underline',
        marginLeft: 5,
    },
});
