module.exports = {
  chainWebpack(config) {
    /**
     * @description Alternative console.*
     * @github https://github.com/tencent/vconsole
     */
    config.plugin('vconsole').use(require('vconsole-webpack-plugin'), [
      {
        enable: process.env.NODE_ENV === 'development'
      }
    ])
  }
}
