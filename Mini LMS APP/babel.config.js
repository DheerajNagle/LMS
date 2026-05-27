module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Required for Reanimated to function. Must be listed last.
      "react-native-reanimated/plugin",
    ],
  };
};
