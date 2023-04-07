const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  pluginOptions: {
    electronBuilder: { preload: 'src/preload.js' },
  },
  transpileDependencies: true,
});
