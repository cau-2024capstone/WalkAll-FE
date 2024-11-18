import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Path, Ellipse } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import rootStyles from "../styles/StyleGuide";

export default function LoginScreen() {
    const navigation = useNavigation();

    const handleLogin = () => {
        navigation.replace('MainApp'); // 'MainApp'은 Stack Navigator에서 정의한 메인 화면의 이름입니다.
    };

    return (
        <View style={localStyles.loginScreenContainer}>
            <View style={localStyles.인앱화면크기} />
            <View style={localStyles.frame7}>
                <Text style={localStyles.mainTitle}>
                    {`Login`}
                </Text>
                <Text style={localStyles.text}>
                    {`Login now to track all your expenses and income at a place!`}
                </Text>
            </View>
            <View style={localStyles.frame16}>
                <Text style={localStyles.text}>
                    {`Don’t have an account?`}
                </Text>
                <Text style={localStyles.register}>
                    {`Register`}
                </Text>
            </View>
            <TouchableOpacity style={localStyles.frame6} onPress={handleLogin}>
                <Text style={localStyles.loginButtonText}>
                    {`Login`}
                </Text>
            </TouchableOpacity>
            <Text style={localStyles.text}>
                {`Email`}
            </Text>
            <View style={localStyles.frame29}>
                <Svg style={localStyles.vector} width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <Path d="..." fill="#575DFB" />
                </Svg>
                <Text style={localStyles.emailPlaceholder}>
                    {`Ex: abc@example.com`}
                </Text>
            </View>
            <View style={localStyles.frame12}>
                <Text style={localStyles.text}>
                    {`Your Password`}
                </Text>
                <View style={localStyles.frame30}>
                    <Svg style={localStyles.group8} width="17" height="19" viewBox="0 0 17 19" fill="none">
                        <Path d="..." stroke="#575DFB" />
                    </Svg>
                    <Svg style={localStyles.group10} width="54" height="6" viewBox="0 0 54 6" fill="none">
                        <Ellipse cx="2.7" cy="3.3" rx="2.4" ry="2.4" fill="#C4C4C4" />
                        <Ellipse cx="8.7" cy="3.3" rx="2.4" ry="2.4" fill="#C4C4C4" />
                        {/* ... */}
                    </Svg>
                </View>
            </View>
            <Text style={localStyles.forgotPassword}>
                {`Forgot Password?`}
            </Text>
        </View>
    );
}

const localStyles = StyleSheet.create({
    loginScreenContainer: {
        flex: 1,
        backgroundColor: rootStyles.colors.white,
    },
    인앱화면크기: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: rootStyles.colors.white,
    },
    frame7: {
        marginTop: 50,
        paddingHorizontal: 20,
    },
    mainTitle: {
        ...rootStyles.fontStyles.mainTitle,
    },
    text: {
        ...rootStyles.fontStyles.text,
    },
    frame16: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'center',
    },
    register: {
        ...rootStyles.fontStyles.text,
        color: rootStyles.colors.green3,
        textDecorationLine: 'underline',
        marginLeft: 5,
    },
    frame6: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: rootStyles.colors.green3,
        paddingVertical: 15,
        borderRadius: 10,
    },
    loginButtonText: {
        ...rootStyles.fontStyles.text,
        color: rootStyles.colors.white,
    },
    frame29: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderColor: rootStyles.colors.green3,
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    emailPlaceholder: {
        ...rootStyles.fontStyles.text,
        color: rootStyles.colors.gray5,
        marginLeft: 10,
    },
    frame12: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    frame30: {
        marginTop: 10,
        padding: 15,
        borderColor: rootStyles.colors.green3,
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    forgotPassword: {
        ...rootStyles.fontStyles.text,
        marginTop: 10,
        color: rootStyles.colors.green3,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});
