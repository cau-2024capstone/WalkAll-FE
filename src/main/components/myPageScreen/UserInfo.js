import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, } from "react-native";
import { Svg, Path } from "react-native-svg";
import rootStyles from "../../styles/StyleGuide";

function UserInfo({ route, navigation }) {
    const { id, name, email, phoneNumber } = route.params || {}; // 전달받은 정보

    return (


        <View style={localStyles.container}>

            {/* 이메일 */}
            <Text style={localStyles.label}>이메일</Text>
            <View style={localStyles.inputContainer}>
                <TextInput
                    style={localStyles.inputText}
                    defaultValue={email || ""}
                    keyboardType="email-address"
                    editable={false} // 읽기 전용
                />
            </View>

            {/* 비밀번호 */}
            <Text style={localStyles.label}>비밀번호</Text>
            <View style={localStyles.inputContainer}>
                <TextInput
                    style={localStyles.inputText}
                    defaultValue="************" // 비밀번호 숨김
                    secureTextEntry
                    editable={ture} // 읽기 전용
                />
            </View>

            {/* 이름 */}
            <Text style={localStyles.label}>이름</Text>
            <View style={localStyles.inputContainer}>
                <TextInput
                    style={localStyles.inputText}
                    defaultValue={name || ""}
                    editable={false} // 읽기 전용
                />
            </View>


            {/* 휴대전화 번호 */}
            <Text style={localStyles.label}>휴대전화 번호</Text>
            <View style={localStyles.inputContainer}>
                <TextInput
                    style={localStyles.inputText}
                    defaultValue={phoneNumber || ""}
                    keyboardType="phone-pad"
                    editable={true} // 읽기 전용
                />
            </View>

            {/* 변경내용 저장 */}
            <TouchableOpacity
                style={localStyles.saveButton}
                onPress={() => Alert.alert("저장", "정보가 저장되었습니다.")}
            >
                <Text style={localStyles.saveButtonText}>변경내용 저장</Text>
            </TouchableOpacity>
        </View>
    );
}

export default UserInfo;

const localStyles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: "5%",
        backgroundColor: rootStyles.colors.white,
        flex: 1,
    },
    label: {
        ...rootStyles.fontStyles.subTitle,
        color: rootStyles.colors.black,
        marginTop: "5%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 50,
        borderWidth: 1,
        borderColor: rootStyles.colors.gray3,
        borderRadius: 6,
        paddingHorizontal: "4%",
        marginTop: "2%",
    },
    inputText: {
        ...rootStyles.fontStyles.text,
        flex: 1,
        color: rootStyles.colors.black,
    },
    saveButton: {
        marginTop: "10%",
        height: 50,
        backgroundColor: rootStyles.colors.green5,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    saveButtonText: {
        ...rootStyles.fontStyles.subTitle,
        color: rootStyles.colors.white,
    },
});
