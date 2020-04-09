import {
  RECEIVER_MAP,
  PUSHER_MAP,
  SignalName,
  SIGNAL_CALLBACKS
} from '@/config/bridge'
import { PublishedObject } from './qwebchannel'

interface DispatchPayload {
  type: string
  [otherKey: string]: any
}

interface SignalHandler {
  connect: Function
  disconnect: Function
}

export function dispatch(payload: string) {
  const { type, ...otherPayload }: DispatchPayload = JSON.parse(payload)

  /**
   * @description Respect any non-root url like AliPay redirect uri
   * This 'if' expression is used to prevent any unexpected redirect uri
   * override from any external web site.
   * Because JS will always communicate with Cpp server in 'index.ts' when page
   * loaded, and Cpp will always invoke initCallback, it means 'dispatch'
   * function will always be invoked.
   */
  if (/.+\/#\/$/.test(location.href)) {
    RECEIVER_MAP[type] && RECEIVER_MAP[type](otherPayload)
  }
}

export function createPusher(QObject: PublishedObject) {
  return function pusher({
    action,
    payload = ''
  }: {
    action: keyof typeof PUSHER_MAP
    payload: any
  }) {
    return new Promise((resolve, reject) => {
      if (!Object.keys(QObject).includes(PUSHER_MAP[action]))
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

export function createProp(QObject: PublishedObject) {
  return function prop(keyInScope: string) {
    if (typeof QObject[keyInScope] === 'function') {
      throw new Error(`[PROP]: ${keyInScope} is not a property from Qt.`)
    }
    return QObject[keyInScope]
  }
}

export function registerSignalListener(currentScope: PublishedObject) {
  // We setup all available listeners for signals defined by Qt side
  // To be notice, signal also belongs to particular QObject
  ;(Object.keys(SIGNAL_CALLBACKS) as SignalName[]).forEach(signalName => {
    const signal = currentScope[signalName] as SignalHandler
    // setup particular QObject signal listeners if signal defined
    if (
      signal &&
      typeof signal.connect === 'function' &&
      typeof SIGNAL_CALLBACKS[signalName] === 'function'
    ) {
      return signal.connect(SIGNAL_CALLBACKS[signalName])
    }
  })
}
