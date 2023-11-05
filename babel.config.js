module.exports = function (api) {
  api.cache(true);
  return {
    // https://github.com/expo/expo/issues/20456#issuecomment-1707648241
    plugins: ["module:react-native-dotenv", "expo-router/babel"],
    presets: ["babel-preset-expo"],
  };
};
