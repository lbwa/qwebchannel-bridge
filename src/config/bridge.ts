import router from '@/router'

export const RECEIVER_MAP: { [key: string]: (payload: any) => any } = {
  sampleActionFromCpp(payload: any) {
    router.replace({
      name: 'about',
      query: Object.assign({}, payload)
    })
  }
}

export const PUSHER_MAP = {
  initialized: 'emitEmbeddedPageLoad'
}

// Mapping QObject name
// key: js side name
// value: Qt side name
export const SCOPES = {
  context: 'keyNamedContext',
  yourOwnScope: 'YOUR_OWN_SCOPE'
}

export type SCOPES = keyof typeof SCOPES
