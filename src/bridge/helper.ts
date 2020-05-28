import {
  dispatchersMap,
  signalCallbacks,
  SignalNames,
  PusherJSKeys,
  PusherMap
} from '@/config/bridge'
import { PublishedObject } from './qwebchannel'

interface DispatchPayload {
  type: string
  [otherKey: string]: any
}

interface SignalListener {
  connect: Function
  disconnect: Function
}

type BridgeDispatch = () => unknown

export type Pusher = ReturnType<typeof createPusher>

let isRouterLoaded = false
const dispatcherQueue: BridgeDispatch[] = []

export function switchRouterLoaded() {
  if (isRouterLoaded) return

  isRouterLoaded = true
  if (dispatcherQueue.length) {
    dispatcherQueue.forEach(dispatch => dispatch())
    dispatcherQueue.length = 0
  }
}

export function queueDispatch(dispatch: BridgeDispatch): void {
  if (isRouterLoaded) {
    dispatch()
    return
  }
  dispatcherQueue.push(dispatch)
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
    const dispatch = dispatchersMap[type]
    if (dispatch) {
      queueDispatch(() => dispatch(otherPayload))
    } else {
      // eslint-disable-next-line no-console
      console.error(`[Receiver]: Unregister dispatch type -> ${type}`)
    }
  }
}

export function createPusher(QObject: PublishedObject) {
  return function pusher({
    action,
    payload = ''
  }: {
    action: PusherJSKeys
    payload: any
  }) {
    return new Promise((resolve, reject) => {
      if (!Object.keys(QObject).includes(PusherMap[action]))
        return reject(new Error('[PUSHER]: Unknown action name !'))
      if (typeof QObject[PusherMap[action]] !== 'function') {
        return reject(
          new Error(
            typeof QObject[PusherMap[action]].connect === 'function'
              ? `[PUSHER]: ${action} is a Qt signal, not a method`
              : `[PUSHER]: Missing function named ${action} in QObject !`
          )
        )
      }

      QObject[PusherMap[action]](payload, resolve)
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
  ;(Object.keys(signalCallbacks) as SignalNames[]).forEach(signalName => {
    const signal = currentScope[signalName] as SignalListener
    // setup particular QObject signal listeners if signal defined
    if (
      signal &&
      typeof signal.connect === 'function' &&
      typeof signalCallbacks[signalName] === 'function'
    ) {
      return signal.connect(signalCallbacks[signalName])
    }
  })
}
