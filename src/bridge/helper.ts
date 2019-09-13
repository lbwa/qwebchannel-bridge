import { RECEIVER_MAP, PUSHER_MAP } from '@/config/bridge'
import { PublishedObject } from './qwebchannel'

interface DispatchPayload {
  type: string
  [otherKey: string]: any
}

export function dispatch(payload: string) {
  const { type, ...otherPayload }: DispatchPayload = JSON.parse(payload)

  /**
   * @description Respect any non-root url like AliPay redirect uri
   * This 'if' expression is used to prevent any unexpected redirect uri
   * override from any external web site.
   * Because JS will always communicate with Cpp server in 'init.ts' when page
   * loaded, and Cpp will always will invoke initCallback, means 'dispatch'
   * function will always be invoked.
   */
  if (/.+\/#\/$/.test(location.href)) {
    RECEIVER_MAP[type] && RECEIVER_MAP[type](otherPayload)
  }
}

export function createPusher(QObject: PublishedObject) {
  return function pusher({ action = '', payload = '' } = {}) {
    return new Promise((resolve, reject) => {
      if (!Object.keys(QObject).includes(action))
        return reject(new Error('[PUSHER]: Unknown action name !'))
      if (typeof QObject[PUSHER_MAP[action]] !== 'function') {
        return reject(
          new Error(
            typeof QObject[PUSHER_MAP[action]].connect === 'function'
              ? `[PUSHER]: ${action} is a Qt signal, not a method`
              : `[PUSHER]: Missing function named ${action} in QObject !`
          )
        )
      }

      QObject[PUSHER_MAP[action]](payload, resolve)
    })
  }
}
