// // Learn more https://docs.expo.io/guides/customizing-metro
// const { getDefaultConfig } = require('expo/metro-config');

// module.exports = getDefaultConfig(__dirname);

const path = require('path');
const extraNodeModules = {
    'server': path.resolve(__dirname + '/../server'),
};
const watchFolders = [
    path.resolve(__dirname + '/../server')
];
module.exports = {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: false,
            },
        }),
    },
    resolver: {
        extraNodeModules
    },
    watchFolders,
};