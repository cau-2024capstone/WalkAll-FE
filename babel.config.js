module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // 자동 JSX 런타임을 사용하는 Expo의 Babel 프리셋
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
    ],
  };
};
