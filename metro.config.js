const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.experimentalImportSupport = false;
config.transformer.inlineRequires = true;

// Pastikan sourceExts mencakup ts dan tsx
config.resolver.sourceExts.push("ts", "tsx");

module.exports = config;
