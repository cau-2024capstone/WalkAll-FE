import { StyleSheet } from 'react-native';

// 색상 스타일 가이드
const colors = {
    black: 'rgba(1, 1, 1, 1)',
    gray1: 'rgba(224, 224, 224, 1)',
    gray2: 'rgba(217, 217, 217, 1)',
    gray3: 'rgba(177, 177, 177, 1)',
    gray4: 'rgba(143, 143, 143, 1)',
    gray5: 'rgba(112, 112, 112, 1)',
    gray6: 'rgba(64, 64, 64, 1)',
    green1: 'rgba(223, 247, 202, 1)',
    green2: 'rgba(192, 235, 166, 1)',
    green3: 'rgba(134, 203, 122, 1)',
    green4: 'rgba(117, 186, 105, 1)',
    green5: 'rgba(74, 143, 62, 1)',
    green6: 'rgba(52, 121, 40, 1)',
    ivory1: 'rgba(255, 251, 230, 1)',
    ivory2: 'rgba(232, 228, 207, 1)',
    ivory3: 'rgba(199, 195, 174, 1)',
    kitCamera: 'rgba(46, 46, 46, 1)',
    white: 'rgba(254, 254, 254, 1)',
    yellow1: 'rgba(255, 255, 162, 1)',
    yellow2: 'rgba(255, 255, 109, 1)',
    yellow3: 'rgba(255, 239, 76, 1)',
    aospOnSurface: 'rgba(23, 29, 27, 1)',
    aospSurface: 'rgba(244, 251, 248, 1)',
};

const fontStyles = {
    instruction: {
        fontFamily: 'NotoSansKR-Regular',
        fontSize: 10,
        //fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 'normal',
    },
    mainTitle: {
        fontFamily: 'NotoSansKR-Bold',
        fontSize: 24,
        //fontWeight: '700',
        letterSpacing: 0,
        //lineHeight: 'normal',
    },
    subTitle: {
        fontFamily: 'NotoSansKR-Medium',
        fontSize: 16,
        //fontWeight: '500',
        letterSpacing: 0,
        //lineHeight: 'normal',
    },
    text: {
        fontFamily: 'NotoSansKR-Regular',
        fontSize: 12,
        //fontWeight: '400',
        letterSpacing: 0,
        //lineHeight: 'normal',
    },
};

const rootStyles = StyleSheet.create({
    colors,
    fontStyles,
});

export default rootStyles;