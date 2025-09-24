module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      "inline-dotenv", // добавляем сюда
      "react-native-reanimated/plugin", // всегда в конце!
    ],
  };
};
