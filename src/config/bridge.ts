import router from '@/router'

export const RECEIVER_MAP: { [key: string]: (payload: any) => any } = {
  sampleActionFromCpp(payload: any) {
    router.replace({
      name: 'about',
      query: Object.assign({}, payload)
    })
  }
}

// Map QObject name to JS side
// {
//    [jsSideName: string]: qtSideName
// }
export const SCOPES = {
  context: 'keyNamedContext',
  yourOwnScope: 'YOUR_OWN_SCOPE'
}

export type ScopeName = keyof typeof SCOPES

// We use only one object to store all pusher mapping from different QObject.
// interface PUSHER_MAP {
//   [jsSideName: string]: qtSideName
// }
export enum PusherMap {
  jsSideMethodName = 'QT_SIDE_METHOD_NAME'
}

export type PusherJSKeys = keyof typeof PusherMap

export enum QObjectMap {
  jsSideKey = 'QT_SIDE_KEY'
}

export type QObjectJSKeys = keyof typeof QObjectMap

// We use only one object to store all signal callbacks from different QObject.
export const signalCallbacks = {
  onSignalMessagesFromQtSide(val: object) {
    // do something you like
  }
}

export type SignalNames = keyof typeof signalCallbacks
