const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NativeWind v4 requires wrapping the config and supplying the core CSS entry point
module.exports = withNativeWind(config, { input: "./src/theme/global.css" });
