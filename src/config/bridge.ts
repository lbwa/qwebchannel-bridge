import router from '@/router'

export type QObjectJSKeys = keyof typeof QObjectMap

export type PusherJSKeys = keyof typeof PusherMap

export type SignalNames = keyof typeof signalCallbacks

// Map QObject name to JS side
export enum QObjectMap {
  jsSideKey = 'QT_SIDE_KEY'
}

// We use only one object to store all pusher mapping from different QObject.
// interface PUSHER_MAP {
//   [jsSideName: string]: qtSideName
// }
export enum PusherMap {
  jsSideMethodName = 'QT_SIDE_METHOD_NAME'
}

export const RECEIVER_MAP: { [key: string]: (payload: any) => any } = {
  sampleActionFromCpp(payload: any) {
    router.replace({
      name: 'about',
      query: Object.assign({}, payload)
    })
  }
}

// We use only one object to store all signal callbacks from different QObject.
export const signalCallbacks = {
  onSignalMessagesFromQtSide(val: object) {
    // do something you like
  }
}
