module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      [
        "module:react-native-dotenv",
        {
          safe: true,
        },
      ],
    ],
    presets: ["babel-preset-expo"],
  };
};
