const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Paths to React Native internal modules needed by Expo & Metro
const assetRegistry = path.resolve(__dirname, 'node_modules/react-native/Libraries/Image/AssetRegistry.js');
const initializeCore = path.resolve(__dirname, 'node_modules/react-native/Libraries/Core/InitializeCore.js');

// Fix asset registry path for font and media asset bundling in Metro
config.transformer.assetRegistryPath = 'react-native/Libraries/Image/AssetRegistry';

// Fallback extraNodeModules mapping
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native/asset-registry': assetRegistry,
  'react-native/setup-env': initializeCore,
};

// Custom resolver to intercept unresolved React Native internal specifiers:
// 1. 'react-native/setup-env': Introduced in RN 0.87. In RN 0.86 it maps to InitializeCore.
// 2. 'react-native/asset-registry': Maps to Libraries/Image/AssetRegistry.js.
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native/setup-env') {
    return {
      type: 'sourceFile',
      filePath: initializeCore,
    };
  }

  if (moduleName === 'react-native/asset-registry') {
    return {
      type: 'sourceFile',
      filePath: assetRegistry,
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
