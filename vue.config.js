const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'cn.umalib.era',
        productName: 'ERA-Electron',
        mac: {
          artifactName: 'ere-mac-v${version}.${ext}',
          target: ['dmg'],
        },
        win: {
          artifactName: 'ere-win64-v${version}.${ext}',
          target: [{ target: '7z', arch: ['x64'] }],
        },
      },
      nodeIntegration: false,
      preload: 'src/preload.js',
    },
  },
  transpileDependencies: true,
});
