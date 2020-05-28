import router from '@/router'

export type QObjectJSKeys = keyof typeof QObjectMap

export type SignalNames = keyof typeof signalCallbacks

// Map QObject name to JS side
export enum QObjectMap {
  jsSideQObjectMappingKey = 'QT_SIDE_QOBJECT_KEY'
}

// We use only one object to store all pusher mapping from different QObject.
// interface PUSHER_MAP {
//   [jsSideName: string]: qtSideName
// }
export enum PusherJSKeys {
  jsSideMappingMethodName = 'QT_SIDE_METHOD_NAME'
}

export const dispatchersMap: { [key: string]: (payload: any) => any } = {
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
