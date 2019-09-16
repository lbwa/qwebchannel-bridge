/* eslint-disable no-console */
import Vue from 'vue'
import QWebChannel from './qwebchannel'
import { assert, isQtClient, log } from '@/_utils'
import { dispatch, createPusher, createProp } from './helper'
import { SCOPES } from '@/config/bridge'

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
      $$pushers: PushersMap
      $$props: QtPropsMap
    }
  }
}

// https://stackoverflow.com/questions/47181789/limit-object-properties-to-keyof-interface
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types
// Same as Record<SCOPES, ReturnType<typeof createPusher>>
type PushersMap = {
  [scope in SCOPES]: ReturnType<typeof createPusher>
}

type QtPropsMap = Record<SCOPES, any>

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
            log('QWebChannel simulator activated !')
          },
          onmessage() {}
        }
      }
    }

    new QWebChannel(window.qt.webChannelTransport, function(channel) {
      // NOTICE: all communication is under scope(QObject) mapping from Qt side
      // You can also create your own single or multiple scope(QObject) which is similar with following logic.
      const scopes = Object.keys(SCOPES) as SCOPES[]
      const propsMap = {} as QtPropsMap
      const pushersMap = scopes.reduce(
        (map, scope) => {
          map[scope] = createPusher(channel.objects[SCOPES[scope]])
          propsMap[scope] = createProp(channel.objects[SCOPES[scope]])
          return map
        },
        {} as PushersMap
      )

      /**
       * @usage
       * Call Cpp method in Vue instance:
       * this.$$pusher.yourOwnScope({
       *    action: 'METHOD_NAME_FROM_CPP',
       *    payload: 'CALLING_PAYLOAD'
       * })
       *
       * get Cpp properties in Vue instance:
       * this.$$prop.yourOwnScope.propFromCpp
       */
      Vue.prototype.$$pushers = pushersMap
      Vue.prototype.$$props = propsMap

      pushersMap
        .context({
          action: 'initialized',
          payload: ''
        })
        .then(res => {
          dispatch(res as string)
          log('[PUSHER]: Bridge load!')
        })
    })
  }
}
