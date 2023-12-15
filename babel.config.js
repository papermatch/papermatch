module.exports = function (api) {
  api.cache(true);
  return {
    // https://github.com/expo/expo/issues/20456#issuecomment-1707648241
    plugins: [
      "@babel/plugin-proposal-export-namespace-from",
      "expo-router/babel",
      "module:react-native-dotenv",
      "react-native-reanimated/plugin",
    ],
    presets: ["babel-preset-expo"],
  };
};
