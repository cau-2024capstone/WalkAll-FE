import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import rootStyles from '../styles/StyleGuide';

function SignupScreen() {
    const navigation = useNavigation();
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleSignup = async () => {
        try {
            const response = await axios.post('http://localhost:8082/auth/register', {
                userName: name,
                userPhoneNumber: phoneNumber,
                userEmail: email,
                userPassword: password,
            });

            if (response.status === 200) {
                Alert.alert('회원가입 성공', 'Walk-ALL에 가입하신 것을 환영합니다!');
                navigation.navigate('LoginScreen', { email, password });
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setEmailError(error.response.data.message || '이미 가입된 이메일이에요.');
            } else {
                Alert.alert('회원가입 실패', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    const checkEmailDuplication = async () => {
        try {
            const response = await axios.post('http://your-api-url.com/auth/check-email', {
                userEmail: email,
            });

            if (response.status === 200) {
                setEmailError(''); // 이메일 중복 없음
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setEmailError('이미 가입된 이메일이에요.');
            } else {
                setEmailError('이메일 중복 확인 중 오류가 발생했습니다.');
            }
        }
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


            {/* 이메일 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>이메일</Text>
                <View style={localStyles.inputField}>
                    <Icon name="email" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setEmailError(''); // 입력 시 에러 초기화
                        }}
                        onBlur={checkEmailDuplication}
                        placeholder="이메일을 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                {emailError ? (
                    <Text style={[rootStyles.fontStyles.text, { color: 'red', marginTop: 5 }]}>
                        {emailError}
                    </Text>
                ) : null}
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
            </View>

            {/* 휴대전화 번호 입력 필드 */}
            <View style={localStyles.inputContainer}>
                <Text style={[rootStyles.fontStyles.subTitle, { fontSize: 16 }]}>휴대전화 번호</Text>
                <View style={localStyles.inputField}>
                    <Icon name="phone" size={20} color={rootStyles.colors.gray4} />
                    <TextInput
                        style={localStyles.textInput}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="휴대전화 번호를 입력하세요"
                        placeholderTextColor={rootStyles.colors.gray5}
                        keyboardType="phone-pad"
                    />
                </View>
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
        marginTop: 6,
        backgroundColor: rootStyles.colors.white,
    },
    textInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: rootStyles.colors.black,
        fontFamily: rootStyles.fontStyles.text.fontFamily,
    },
    signupButton: {
        backgroundColor: rootStyles.colors.green5,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
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
