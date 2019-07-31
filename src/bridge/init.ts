/* eslint-disable no-console */
import Vue from 'vue'
import QWebChannel from './qwebchannel'
import { assert, isQtClient } from '@/_utils'
import dispatch from './index'

declare global {
  interface Window {
    qt: {
      webChannelTransport: {
        send: (payload: any) => void
        onmessage: (payload: any) => void
      }
    }
  }
}

/**
 * @description Declaration Merging
 * @doc https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
declare module 'vue/types/vue' {
  interface Vue {
    prototype: {
      $_bridge: {
        [key: string]: any
      }
    }
  }
}

const __DEV__ = process.env.NODE_ENV === 'development'

export default {
  install(Vue: Vue) {
    if (!__DEV__) {
      assert(
        window && window.qt && window.qt.webChannelTransport,
        "'qt' or 'qt.webChannelTransport' should be initialized(injected) by QtWebEngine"
      )
    }

    if (__DEV__ && !isQtClient) {
      window.qt = {
        webChannelTransport: {
          send() {
            console.info(`
              QWebChannel simulator activated !
            `)
          },
          onmessage() {}
        }
      }
    }
    new QWebChannel(window.qt.webChannelTransport, function(channel) {
      const published = channel.objects.context
      Vue.prototype.$_bridge = published

      published.emitEmbeddedPageLoad('', function(payload: string) {
        dispatch(payload)
        console.info(`
          Bridge load !
        `)
      })
    })
  }
}
