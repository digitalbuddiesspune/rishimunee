module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      require.resolve("expo-router/babel"),
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@navigation": "./src/navigation",
            "@services": "./src/services",
            "@hooks": "./src/hooks",
            "@utils": "./src/utils",
            "@theme": "./src/theme",
            "@context": "./src/context"
          }
        }
      ],
      // Use the new Worklets Babel plugin (Reanimated v4)
      require.resolve("react-native-worklets/plugin")
    ]
  };
};
