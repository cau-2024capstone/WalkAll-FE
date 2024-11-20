import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import rootStyles from '../styles/StyleGuide';

function SignupScreen() {
    const navigation = useNavigation();
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

            if (response.status === 201) {
                Alert.alert('회원가입 성공', 'Walk-ALL에 가입하신 것을 환영합니다!');
                navigation.navigate('UserInfo', {
                    name,
                    email,
                    phoneNumber,
                });
            }
        } catch (error) {
            if (error.response && error.response.data) {
                // 이메일 중복 에러 처리
                const errorMessage = error.response.data.message || '회원가입 실패';
                if (errorMessage.includes('Email already exists')) {
                    setEmailError('이미 가입된 이메일이에요.');
                } else {
                    Alert.alert('회원가입 실패', errorMessage);
                }
            } else {
                Alert.alert('회원가입 실패', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    const handleLogin = () => {
        navigation.navigate('LoginScreen');
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.mainTitle}>Register</Text>
                <Text style={localStyles.subText}>Walk-ALL에 가입하고 함께 산책해요!</Text>
            </View>

            {/* 입력 필드 */}
            {[
                { label: '이메일', value: email, onChange: setEmail, placeholder: '이메일을 입력하세요', keyboardType: 'email-address', icon: 'email', error: emailError },
                { label: '비밀번호', value: password, onChange: setPassword, placeholder: '비밀번호를 입력하세요', keyboardType: 'default', icon: 'lock', secureTextEntry: true },
                { label: '이름', value: name, onChange: setName, placeholder: '이름을 입력하세요', keyboardType: 'default', icon: 'badge' },
                { label: '휴대전화 번호', value: phoneNumber, onChange: setPhoneNumber, placeholder: '휴대전화 번호를 입력하세요', keyboardType: 'phone-pad', icon: 'phone' },
            ].map((field, index) => (
                <View key={index} style={localStyles.inputContainer}>
                    <Text style={localStyles.label}>{field.label}</Text>
                    <View style={localStyles.inputField}>
                        <Icon name={field.icon} size={20} color={rootStyles.colors.gray4} />
                        <TextInput
                            style={localStyles.textInput}
                            value={field.value}
                            onChangeText={(text) => {
                                field.onChange(text);
                                if (field.label === '이메일') setEmailError(''); // 이메일 입력 시 에러 초기화
                            }}
                            placeholder={field.placeholder}
                            placeholderTextColor={rootStyles.colors.gray5}
                            keyboardType={field.keyboardType}
                            secureTextEntry={field.secureTextEntry || false}
                            autoCapitalize="none"
                        />
                    </View>
                    {field.error && (
                        <Text style={localStyles.errorText}>{field.error}</Text>
                    )}
                </View>
            ))}

            <TouchableOpacity style={localStyles.signupButton} onPress={handleSignup}>
                <Text style={localStyles.buttonText}>회원가입</Text>
            </TouchableOpacity>

            <View style={localStyles.loginContainer}>
                <Text style={localStyles.subText}>이미 Walk-ER이신가요?</Text>
                <TouchableOpacity onPress={handleLogin}>
                    <Text style={localStyles.loginText}>로그인하기</Text>
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
    mainTitle: {
        ...rootStyles.fontStyles.mainTitle,
        fontSize: 30,
    },
    subText: {
        ...rootStyles.fontStyles.text,
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        ...rootStyles.fontStyles.subTitle,
        fontSize: 16,
        marginBottom: 5,
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
    errorText: {
        color: 'red',
        marginTop: 5,
        ...rootStyles.fontStyles.text,
    },
    signupButton: {
        backgroundColor: rootStyles.colors.green5,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonText: {
        color: rootStyles.colors.white,
        fontSize: 16,
        ...rootStyles.fontStyles.text,
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
        ...rootStyles.fontStyles.text,
    },
});
