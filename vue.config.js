const __DEV__ = process.env.NODE_ENV === 'development'

module.exports = {
  chainWebpack(config) {
    config.plugin('define').tap(([options]) => {
      options.__DEV__ = JSON.stringify(__DEV__)
      return [options]
    })

    config.when(__DEV__, config => {
      /**
       * @description Alternative console.*
       * @github https://github.com/tencent/vconsole
       */
      config.plugin('vconsole').use(require('vconsole-webpack-plugin'), [
        {
          enable: __DEV__
        }
      ])
    })
  }
}
